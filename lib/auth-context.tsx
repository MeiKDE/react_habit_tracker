import { createContext, useContext, useEffect, useState } from "react";
import { SecureStorage, TokenManager } from "./secure-storage";
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
  refreshAuth: () => Promise<boolean>;
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
      console.log("[AUTH] Initializing secure authentication");

      // Clear legacy AsyncStorage data
      await SecureStorage.clearUserData();

      // Check for existing secure tokens
      await getCurrentUser();
    } catch (error) {
      console.error("Error initializing auth:", error);
      await SecureStorage.clearAllData();
    } finally {
      setIsLoadingUser(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      // Try to refresh token if needed
      const isValid = await TokenManager.refreshTokenIfNeeded();

      if (!isValid) {
        console.log("[AUTH] No valid authentication found");
        return;
      }

      // Get user data from storage
      const currentUser = await SecureStorage.getUserData();

      if (currentUser) {
        setUser(currentUser);
        console.log("[AUTH] User restored from secure storage");
      } else {
        console.log("[AUTH] No user data found");
        await SecureStorage.clearAllData();
      }
    } catch (error) {
      console.error("Get user error:", error);
      await SecureStorage.clearAllData();
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

      console.log("[AUTH] Attempting secure signup...");
      const response = await ApiClient.signUp(signUpData);

      if (response.success && response.data) {
        const localUser = convertRemoteToLocalUser(response.data);

        // Store user data and tokens securely
        await Promise.all([
          SecureStorage.storeUserData(localUser),
          // Note: ApiClient would need to be updated to return token pairs
          // For now, we'll just store user data
        ]);

        setUser(localUser);
        console.log("[AUTH] Secure signup successful");
        return null;
      }

      const error = response.error || "Failed to sign up";
      console.error("[AUTH] Signup failed:", error);
      return error;
    } catch (error) {
      console.error("[AUTH] Signup error:", error);
      await SecureStorage.clearAllData();

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

      console.log("[AUTH] Attempting secure signin...");
      const response = await ApiClient.signIn(signInData);

      if (response.success && response.data) {
        const localUser = convertRemoteToLocalUser(
          response.data.user || response.data
        );

        // Store user data and tokens securely
        const promises = [SecureStorage.storeUserData(localUser)];

        // Store tokens if available (new token pair format)
        if (response.data.accessToken && response.data.refreshToken) {
          promises.push(
            SecureStorage.storeTokenPair(
              response.data.accessToken,
              response.data.refreshToken
            )
          );
          console.log("[AUTH] Stored secure token pair");
        } else if (response.data.accessToken) {
          // Legacy single token support
          promises.push(
            SecureStorage.storeTokenPair(
              response.data.accessToken,
              response.data.accessToken // Use same token for both (legacy)
            )
          );
          console.log("[AUTH] Stored legacy token");
        }

        await Promise.all(promises);
        setUser(localUser);
        console.log("[AUTH] Secure signin successful");
        return null;
      }

      const error = response.error || "Failed to sign in";
      console.error("[AUTH] Signin failed:", error);
      return error;
    } catch (error) {
      console.error("[AUTH] Signin error:", error);
      await SecureStorage.clearAllData();

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
      // Attempt to sign out remotely (best effort)
      try {
        await ApiClient.signOut();
      } catch (error) {
        console.warn("Remote signout failed:", error);
        // Continue with local cleanup
      }

      // Clear all local data
      await SecureStorage.clearAllData();
      setUser(null);
      console.log("[AUTH] User signed out successfully (secure)");
    } catch (error) {
      console.error("Sign out error:", error);
      // Force clear local session even if remote signout fails
      await SecureStorage.clearAllData();
      setUser(null);
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    try {
      const isValid = await TokenManager.refreshTokenIfNeeded();

      if (!isValid) {
        // Clear user state if tokens are invalid
        setUser(null);
        await SecureStorage.clearAllData();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Auth refresh error:", error);
      setUser(null);
      await SecureStorage.clearAllData();
      return false;
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
        refreshAuth,
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
