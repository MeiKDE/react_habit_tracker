import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config/api";
import {
  ApiClient,
  SignUpData,
  SignInData,
  User as RemoteUser,
} from "./api-client";

type User = {
  id: string;
  email: string;
  username: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  isLoadingUser: boolean;
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert remote user to local user
function convertRemoteToLocalUser(remoteUser: RemoteUser): User {
  return {
    id: remoteUser.id,
    email: remoteUser.email,
    username: remoteUser.username,
    name: remoteUser.name,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log("[AUTH] Initializing remote authentication only");

      // Clear any local storage data to ensure we only use remote auth
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USERS_LOCAL,
        "@habits", // Local habits storage key
        "@completions", // Local completions storage key
      ]);

      // Get current user from stored session
      await getCurrentUser();
    } catch (error) {
      console.error("Error initializing auth:", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const currentUserJson = await AsyncStorage.getItem(
        STORAGE_KEYS.CURRENT_USER
      );

      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Get user error:", error);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const signUpData: SignUpData = {
        email,
        password,
        username,
        name: username,
      };

      console.log("[AUTH] Attempting remote signup...");
      const response = await ApiClient.signUp(signUpData);

      if (response.success && response.data) {
        const localUser = convertRemoteToLocalUser(response.data);
        await AsyncStorage.setItem(
          STORAGE_KEYS.CURRENT_USER,
          JSON.stringify(localUser)
        );
        setUser(localUser);
        console.log("[AUTH] Remote signup successful");
        return null;
      }

      const error = response.error || "Failed to sign up";
      console.error("[AUTH] Remote signup failed:", error);
      return error;
    } catch (error) {
      console.error("[AUTH] Remote signup error:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          return "Unable to connect to server. Please check your internet connection and try again.";
        }
        return `Signup failed: ${error.message}`;
      }

      return "An error occurred during signup. Please try again.";
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const signInData: SignInData = {
        email,
        password,
      };

      console.log("[AUTH] Attempting remote signin...");
      const response = await ApiClient.signIn(signInData);

      if (response.success && response.data) {
        const localUser = convertRemoteToLocalUser(response.data.user);
        await AsyncStorage.setItem(
          STORAGE_KEYS.CURRENT_USER,
          JSON.stringify(localUser)
        );
        setUser(localUser);
        console.log("[AUTH] Remote signin successful");
        return null;
      }

      const error = response.error || "Failed to sign in";
      console.error("[AUTH] Remote signin failed:", error);
      return error;
    } catch (error) {
      console.error("[AUTH] Remote signin error:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          return "Unable to connect to server. Please check your internet connection and try again.";
        }
        return `Sign in failed: ${error.message}`;
      }

      return "An error occurred during sign in. Please try again.";
    }
  };

  const signOut = async () => {
    try {
      // Clear remote session
      await ApiClient.signOut();

      // Clear local storage
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      setUser(null);
      console.log("[AUTH] User signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if remote signOut fails, clear local session
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingUser,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
