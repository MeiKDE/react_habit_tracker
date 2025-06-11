import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthService } from "./auth-appwrite";
import { User } from "./appwrite";

const STORAGE_KEYS = {
  USER: "@habit_tracker_user",
  SESSION: "@habit_tracker_session",
};

type AuthContextType = {
  user: User | null;
  isLoadingUser: boolean;
  signUp: (
    email: string,
    password: string,
    username: string,
    name?: string
  ) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  clearSessions: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log("[AUTH] Initializing Appwrite authentication");

      // Try to get current user from Appwrite
      const currentUser = await AuthService.getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        // Store user data locally for offline access
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(currentUser)
        );
        console.log("[AUTH] User restored from Appwrite session");
      } else {
        // Clear any stored user data if no valid session
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        console.log("[AUTH] No valid Appwrite session found");
      }
    } catch (error: any) {
      // Don't log guest user errors as actual errors - this is expected
      if (
        error.message?.includes("missing scope") ||
        error.message?.includes("guests") ||
        error.message?.includes("User (role: guests)")
      ) {
        console.log("[AUTH] User is not authenticated");
      } else {
        console.error("[AUTH] Error initializing auth:", error);
      }

      // Try to load from local storage as fallback
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Verify the stored user is still valid by attempting to get current user
          const validUser = await AuthService.getCurrentUser();
          if (validUser) {
            setUser(validUser);
          } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER);
          }
        }
      } catch (storageError) {
        console.error("[AUTH] Error loading from storage:", storageError);
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
    name?: string
  ) => {
    try {
      console.log("[AUTH] Attempting signup with Appwrite...");

      const result = await AuthService.signUp(email, password, username, name);

      if (result.user) {
        setUser(result.user);
        // Store user data locally
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(result.user)
        );
        console.log("[AUTH] Signup successful");
        return null;
      }

      console.error("[AUTH] Signup failed: No user returned");
      return "Failed to create account";
    } catch (error: any) {
      console.error("[AUTH] Signup error:", error);

      // Provide more specific error messages
      if (error.message.includes("user_already_exists")) {
        return "An account with this email already exists";
      } else if (error.message.includes("user_invalid_credentials")) {
        return "Invalid email or password format";
      } else if (error.message.includes("password")) {
        return "Password must be at least 8 characters long";
      } else if (error.message.includes("email")) {
        return "Please enter a valid email address";
      } else if (
        error.message.includes("Creation of a session is prohibited")
      ) {
        // Clear sessions and try again
        await AuthService.clearAllSessions();
        return "Session conflict detected. Please try again.";
      }

      return (
        error.message || "An error occurred during signup. Please try again."
      );
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[AUTH] Attempting signin with Appwrite...");

      const result = await AuthService.signIn(email, password);

      if (result.user) {
        setUser(result.user);
        // Store user data locally
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(result.user)
        );
        console.log("[AUTH] Signin successful");
        return null;
      }

      console.error("[AUTH] Signin failed: No user returned");
      return "Failed to sign in";
    } catch (error: any) {
      console.error("[AUTH] Signin error:", error);

      // Handle session conflicts
      if (error.message.includes("Creation of a session is prohibited")) {
        // Clear sessions and try again
        await AuthService.clearAllSessions();
        return "Session conflict detected. Please try again.";
      }

      // Provide more specific error messages
      if (error.message.includes("user_invalid_credentials")) {
        return "Invalid email or password";
      } else if (error.message.includes("user_not_found")) {
        return "No account found with this email";
      } else if (error.message.includes("user_blocked")) {
        return "Account has been blocked. Please contact support.";
      } else if (error.message.includes("Failed to fetch")) {
        return "Unable to connect to server. Please check your internet connection.";
      }

      return (
        error.message || "An error occurred during sign in. Please try again."
      );
    }
  };

  const signOut = async () => {
    try {
      console.log("[AUTH] Attempting signout with Appwrite...");

      await AuthService.signOut();
      setUser(null);

      // Clear stored user data
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.SESSION]);

      console.log("[AUTH] Signout successful");
    } catch (error) {
      console.error("[AUTH] Signout error:", error);
      // Even if signout fails on server, clear local data
      setUser(null);
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.SESSION]);
    }
  };

  const clearSessions = async () => {
    try {
      console.log("[AUTH] Clearing all sessions...");
      await AuthService.clearAllSessions();
      setUser(null);
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.SESSION]);
      console.log("[AUTH] All sessions cleared");
    } catch (error) {
      console.error("[AUTH] Clear sessions error:", error);
      // Even if clearing fails on server, clear local data
      setUser(null);
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.SESSION]);
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    try {
      console.log("[AUTH] Refreshing authentication...");

      const currentUser = await AuthService.getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(currentUser)
        );
        console.log("[AUTH] Auth refresh successful");
        return true;
      } else {
        setUser(null);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        console.log("[AUTH] Auth refresh failed - no valid session");
        return false;
      }
    } catch (error) {
      console.error("[AUTH] Auth refresh error:", error);
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoadingUser,
    signUp,
    signIn,
    signOut,
    refreshAuth,
    clearSessions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
