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

  // Helper method to check if user has a valid session without triggering guest errors
  static async hasValidSession(): Promise<boolean> {
    try {
      const session = await account.getSession("current");
      return !!(session && session.$id);
    } catch {
      return false;
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      log("Getting current user");

      // First, check if we have a valid session to avoid 401 guest errors
      try {
        const session = await account.getSession("current");
        if (!session || !session.$id) {
          log("No valid session found");
          return null;
        }
        log("Valid session found, proceeding to get user");
      } catch (sessionError: any) {
        // No session exists - this is normal for unauthenticated users
        log(`No current session - user is not authenticated ${sessionError}`);
        return null;
      }

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
      log(`No current session found, ${error}`);
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

  // Google OAuth login (Expo/React Native)
  static async signInWithGoogle(
    successRedirectUrl?: string,
    failureRedirectUrl?: string
  ) {
    // Default redirect URLs for Expo/React Native
    // You may need to set these in your Appwrite console for OAuth
    const defaultSuccess =
      successRedirectUrl || "exp://127.0.0.1:19000/--/oauth-success";
    const defaultFailure =
      failureRedirectUrl || "exp://127.0.0.1:19000/--/oauth-failure";

    try {
      // This will open the browser for Google OAuth
      await account.createOAuth2Session(
        "google" as any,
        defaultSuccess,
        defaultFailure
      );
      // On success, Appwrite will redirect to the success URL
      // You should handle the redirect in your app (see Expo AuthSession docs)
    } catch (error: any) {
      logError("Google OAuth login failed:", error);
      throw new Error(error.message || "Google OAuth login failed");
    }
  }
}
