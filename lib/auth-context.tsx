import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const CURRENT_USER_KEY = "@current_user";
const USERS_STORAGE_KEY = "@users";

// Helper function to generate simple IDs
const generateUserId = (): string => {
  return (
    "user_" + Date.now().toString(36) + Math.random().toString(36).substr(2)
  );
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const currentUserJson = await AsyncStorage.getItem(CURRENT_USER_KEY);

      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Get user error:", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Get existing users
      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
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
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Set as current user
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      setUser(newUser);

      return null;
    } catch (error) {
      console.error("Signup error:", error);
      return "An error occurred during signup";
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Get existing users
      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      // Find user by email or username and check password
      const foundUser = users.find(
        (u: any) =>
          (u.email === email || u.username === email) && u.password === password
      );

      if (!foundUser) {
        return "Invalid email/username or password";
      }

      // Remove password from user object before setting
      const { password: _, ...userWithoutPassword } = foundUser;

      // Set as current user
      await AsyncStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(userWithoutPassword)
      );
      setUser(userWithoutPassword);

      return null;
    } catch (error) {
      console.error("Signin error:", error);
      return "An error occurred during sign in";
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
    } catch (error) {
      console.error("Signout error:", error);
      // Even if there's an error, we should still clear the user state
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoadingUser, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be inside of the AuthProvider");
  }

  return context;
}
