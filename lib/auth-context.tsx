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
  signInWithGoogle: (
    successRedirectUrl?: string,
    failureRedirectUrl?: string
  ) => Promise<void>;
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
      // console.log("[AUTH] Initializing Appwrite authentication");

      // Check if there's a valid session first to avoid 401 guest errors
      const hasSession = await AuthService.hasValidSession();

      if (!hasSession) {
        console.log("[AUTH] No valid session found");
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        return;
      }

      // Try to get current user from Appwrite
      const currentUser = await AuthService.getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        // Store user data locally for offline access
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(currentUser)
        );
        // console.log("[AUTH] User restored from Appwrite session");
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

  const signInWithGoogle = async (
    successRedirectUrl?: string,
    failureRedirectUrl?: string
  ) => {
    try {
      await AuthService.signInWithGoogle(
        successRedirectUrl,
        failureRedirectUrl
      );
      // The redirect will take over; you may want to handle post-login in a useEffect elsewhere
    } catch (error: any) {
      console.error("[AUTH] Google OAuth error:", error);
      throw error;
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
    signInWithGoogle,
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
