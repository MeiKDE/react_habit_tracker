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
  isUsingRemoteAuth: boolean;
  setUseRemoteAuth: (useRemote: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to generate simple IDs
const generateUserId = (): string => {
  return (
    "user_" + Date.now().toString(36) + Math.random().toString(36).substr(2)
  );
};

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
  const [isUsingRemoteAuth, setIsUsingRemoteAuth] = useState<boolean>(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if we should use remote auth
      const useRemoteAuthSetting = await AsyncStorage.getItem(
        STORAGE_KEYS.USE_REMOTE_AUTH
      );
      const shouldUseRemote = useRemoteAuthSetting !== "false"; // Default to true
      setIsUsingRemoteAuth(shouldUseRemote);

      // Get current user
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

  const setUseRemoteAuth = async (useRemote: boolean) => {
    try {
      setIsUsingRemoteAuth(useRemote);
      await AsyncStorage.setItem(
        STORAGE_KEYS.USE_REMOTE_AUTH,
        useRemote.toString()
      );

      // If switching to remote auth, clear local session
      if (useRemote && user) {
        await signOut();
      }
    } catch (error) {
      console.error("Error setting remote auth preference:", error);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    if (isUsingRemoteAuth) {
      try {
        const signUpData: SignUpData = {
          email,
          password,
          username,
          name: username,
        };

        const response = await ApiClient.signUp(signUpData);

        if (response.success && response.data) {
          const localUser = convertRemoteToLocalUser(response.data);
          await AsyncStorage.setItem(
            STORAGE_KEYS.CURRENT_USER,
            JSON.stringify(localUser)
          );
          setUser(localUser);
          return null;
        }

        return response.error || "Failed to sign up";
      } catch (error) {
        console.warn(
          "Remote signup failed, falling back to local auth:",
          error
        );
        // Fall back to local auth
        return await signUpLocal(email, password, username);
      }
    }

    return await signUpLocal(email, password, username);
  };

  const signUpLocal = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      // Get existing users
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS_LOCAL);
      const users = usersJson ? JSON.parse(usersJson) : [];

      // Check if user already exists
      const existingUser = users.find(
        (u: any) => u.email === email || u.username === username
      );
      if (existingUser) {
        return "User with this email or username already exists";
      }

      // Create new user
      const newUser: User = {
        id: generateUserId(),
        email,
        username,
        name: username,
      };

      // Store user credentials (in a real app, you'd hash the password)
      const userWithPassword = { ...newUser, password };
      users.push(userWithPassword);
      await AsyncStorage.setItem(
        STORAGE_KEYS.USERS_LOCAL,
        JSON.stringify(users)
      );

      // Set as current user
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(newUser)
      );
      setUser(newUser);

      return null;
    } catch (error) {
      console.error("Local signup error:", error);
      return "An error occurred during signup";
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isUsingRemoteAuth) {
      try {
        const signInData: SignInData = {
          email,
          password,
        };

        const response = await ApiClient.signIn(signInData);

        if (response.success && response.data) {
          const localUser = convertRemoteToLocalUser(response.data.user);
          await AsyncStorage.setItem(
            STORAGE_KEYS.CURRENT_USER,
            JSON.stringify(localUser)
          );
          setUser(localUser);
          return null;
        }

        return response.error || "Failed to sign in";
      } catch (error) {
        console.warn(
          "Remote signin failed, falling back to local auth:",
          error
        );
        // Fall back to local auth
        return await signInLocal(email, password);
      }
    }

    return await signInLocal(email, password);
  };

  const signInLocal = async (email: string, password: string) => {
    try {
      // Get existing users
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS_LOCAL);
      const users = usersJson ? JSON.parse(usersJson) : [];

      // Find user by email or username
      const user = users.find(
        (u: any) =>
          (u.email === email || u.username === email) && u.password === password
      );

      if (!user) {
        return "Invalid email/username or password";
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user;
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(userWithoutPassword)
      );
      setUser(userWithoutPassword);

      return null;
    } catch (error) {
      console.error("Local signin error:", error);
      return "An error occurred during signin";
    }
  };

  const signOut = async () => {
    try {
      // Clear remote session
      await ApiClient.signOut();

      // Clear local storage
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
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
        isUsingRemoteAuth,
        setUseRemoteAuth,
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
