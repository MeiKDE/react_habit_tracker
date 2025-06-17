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
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

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

  // Google OAuth login (Expo/React Native)
  static async signInWithGoogle(
    successRedirectUrl?: string,
    failureRedirectUrl?: string
  ) {
    try {
      // Create a redirect URI for Expo/React Native
      const redirectUri = Linking.createURL("/");
      log("Platform:", Platform.OS);
      log("Redirect URI:", redirectUri);

      if (Platform.OS === "web") {
        // Use createOAuth2Session for web
        const response = await account.createOAuth2Session(
          "google" as any,
          redirectUri,
          redirectUri
        );
        if (!response) throw new Error("Failed to create OAuth2 session");
        // For web, session is automatically created
        const currentSession = await account.getSession("current");
        if (!currentSession) {
          throw new Error("No session found after OAuth authentication");
        }
        return currentSession;
      } else {
        // Use createOAuth2Token for android and ios
        const response = await account.createOAuth2Token(
          "google" as any,
          redirectUri
        );
        if (!response) throw new Error("Create OAuth2 token failed");

        const browserResult = await WebBrowser.openAuthSessionAsync(
          response.toString(),
          redirectUri
        );

        if (browserResult.type !== "success") {
          throw new Error("OAuth authentication was cancelled or failed");
        }

        log("Browser Result: ", browserResult);

        const url = new URL(browserResult.url);
        const secret = url.searchParams.get("secret")?.toString();
        const userId = url.searchParams.get("userId")?.toString();
        if (!secret || !userId) throw new Error("Create OAuth2 token failed");

        // Create session manually using userId and secret
        await account.createSession(userId, secret);

        // Return the newly created session
        const currentSession = await account.getSession("current");
        if (!currentSession) {
          throw new Error(
            "Failed to create session after OAuth authentication"
          );
        }
        return currentSession;
      }
    } catch (error: any) {
      logError("Google OAuth login failed:", error);
      return null;
    }
  }
}
