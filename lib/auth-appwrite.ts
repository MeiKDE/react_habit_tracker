import {
  account,
  databases,
  ID,
  Query,
  DATABASE_ID,
  COLLECTIONS,
  User,
  log,
  logError,
} from "./appwrite";

// Authentication service using Appwrite for React Native
export class AuthService {
  // Sign up a new user
  static async signUp(
    email: string,
    password: string,
    username: string,
    name?: string
  ) {
    try {
      log("Attempting to sign up user:", email);

      // Create user account (this automatically creates a session)
      const user = await account.create(
        ID.unique(),
        email,
        password,
        name || username
      );

      log("User account created:", user.$id);

      // Create user document in database
      const userDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        user.$id,
        {
          email,
          username,
          name: name || username,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );

      log("User document created in database");

      // Get the current session (created automatically by account.create)
      const session = await account.getSession("current");

      return {
        user: userDoc as unknown as User,
        session,
      };
    } catch (error: any) {
      logError("Sign up failed:", error);
      throw new Error(error.message || "Failed to sign up");
    }
  }

  // Sign in user
  static async signIn(email: string, password: string): Promise<User> {
    try {
      log("Attempting to sign in user", { email });

      // First, check if there's an existing session and clear it to avoid conflicts
      try {
        const existingUser = await account.get();
        log("Found existing session, clearing it first", {
          existingEmail: existingUser.email,
        });
        await account.deleteSession("current");
        log("Previous session cleared successfully");
      } catch (error: any) {
        // No existing session or other error - continue with login
        if (error.code === 401) {
          log("No existing session found (normal for fresh login)");
        } else {
          log("Warning: Error checking existing session", error);
        }
      }

      // Create session (login)
      const session = await account.createEmailPasswordSession(email, password);
      log("Session created successfully", { sessionId: session.$id });

      // Get user data
      const user = await account.get();
      log("User data retrieved", { userId: user.$id, email: user.email });

      // Update user in users collection if needed
      await this.updateUserInDatabase(user);

      return {
        $id: user.$id,
        email: user.email,
        username: user.name || email.split("@")[0],
        name: user.name,
        createdAt: user.$createdAt,
        updatedAt: user.$updatedAt,
      };
    } catch (error: any) {
      logError("Sign in failed", error);

      // Handle session conflicts with retry logic
      if (error.message?.includes("Session conflict") || error.code === 409) {
        log(
          "Session conflict detected, attempting to clear all sessions and retry..."
        );

        try {
          // Clear all sessions and retry
          await account.deleteSessions();
          log("All sessions cleared, retrying sign in...");

          // Retry the login
          const session = await account.createEmailPasswordSession(
            email,
            password
          );
          log("Retry sign in successful", { sessionId: session.$id });

          const user = await account.get();
          await this.updateUserInDatabase(user);

          return {
            $id: user.$id,
            email: user.email,
            username: user.name || email.split("@")[0],
            name: user.name,
            createdAt: user.$createdAt,
            updatedAt: user.$updatedAt,
          };
        } catch (retryError: any) {
          logError("Retry sign in also failed", retryError);
          throw new Error(
            "Login failed due to session conflicts. Please try again."
          );
        }
      }

      throw error;
    }
  }

  // Sign out user
  static async signOut() {
    try {
      log("Attempting to sign out user");
      await account.deleteSession("current");
      log("User signed out successfully");
    } catch (error: any) {
      logError("Sign out failed:", error);
      throw new Error(error.message || "Failed to sign out");
    }
  }

  // Clear all sessions (useful for debugging session issues)
  static async clearAllSessions() {
    try {
      log("Clearing all sessions");
      await account.deleteSessions();
      log("All sessions cleared successfully");
    } catch (error: any) {
      // Ignore errors if no sessions exist
      log("No sessions to clear or error clearing sessions:", error.message);
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      log("Getting current user");
      const user = await account.get();

      if (!user || !user.$id) {
        log("No valid user found");
        return null;
      }

      // Get user document from database
      const userDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        user.$id
      );

      log("Current user retrieved:", user.$id);
      return userDoc as unknown as User;
    } catch (error: any) {
      // Don't log guest user errors - this is expected when not authenticated
      if (
        error.message?.includes("missing scope") ||
        error.message?.includes("guests") ||
        error.message?.includes("User (role: guests)")
      ) {
        log("User is not authenticated");
        return null;
      }

      log("getCurrentUser failed:", error.message);
      return null;
    }
  }

  // Check if username is available
  static async isUsernameAvailable(username: string) {
    try {
      log("Checking username availability:", username);
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal("username", username)]
      );

      const isAvailable = result.documents.length === 0;
      log("Username availability result:", isAvailable);
      return isAvailable;
    } catch (error) {
      logError("Username check failed:", error);
      return false;
    }
  }

  // Check if email is available
  static async isEmailAvailable(email: string) {
    try {
      log("Checking email availability:", email);
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal("email", email)]
      );

      const isAvailable = result.documents.length === 0;
      log("Email availability result:", isAvailable);
      return isAvailable;
    } catch (error) {
      logError("Email check failed:", error);
      return false;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>) {
    try {
      log("Updating user profile:", userId);

      const updatedUser = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      );

      log("User profile updated successfully");
      return updatedUser as unknown as User;
    } catch (error: any) {
      logError("Profile update failed:", error);
      throw new Error(error.message || "Failed to update profile");
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      log("Getting current session");
      const session = await account.getSession("current");
      log("Current session retrieved");
      return session;
    } catch (error) {
      log("No current session found");
      return null;
    }
  }

  // Delete user account
  static async deleteAccount() {
    try {
      log("Attempting to delete user account");
      // Note: Appwrite doesn't have a direct method for users to delete their own accounts
      // This would typically require an admin API call or custom function
      // For now, we'll just sign out the user
      await this.signOut();
      log("User signed out (account deletion would require admin privileges)");
    } catch (error: any) {
      logError("Account deletion failed:", error);
      throw new Error(error.message || "Failed to delete account");
    }
  }

  // Update user in database
  static async updateUserInDatabase(appwriteUser: any) {
    const userData = {
      email: appwriteUser.email,
      username: appwriteUser.name || appwriteUser.email.split("@")[0],
      name: appwriteUser.name || "",
      createdAt: appwriteUser.$createdAt,
      updatedAt: new Date().toISOString(),
    };

    try {
      log("Updating user in database:", appwriteUser.$id);

      const updatedUser = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        appwriteUser.$id,
        userData
      );

      log("User updated in database successfully");
      return updatedUser as unknown as User;
    } catch (error: any) {
      if (error.code === 404) {
        // User doesn't exist in database, create them
        log("User not found in database, creating new user record");
        try {
          const newUser = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            appwriteUser.$id,
            userData
          );
          log("User created in database successfully");
          return newUser as unknown as User;
        } catch (createError: any) {
          logError("Failed to create user in database:", createError);
          throw new Error(
            createError.message || "Failed to create user in database"
          );
        }
      } else {
        logError("Database update failed:", error);
        throw new Error(error.message || "Failed to update user in database");
      }
    }
  }
}
