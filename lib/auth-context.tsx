import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  email: string;
  username: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const token = await AsyncStorage.getItem("@auth_token");

      if (!token) {
        setUser(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, remove it
        await AsyncStorage.removeItem("@auth_token");
        setUser(null);
      }
    } catch (error) {
      console.error("Get user error:", error);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and set user
        await AsyncStorage.setItem("@auth_token", data.token);
        setUser(data.user);
        return null;
      } else {
        return data.error || "An error occurred during signup";
      }
    } catch (error) {
      console.error("Signup error:", error);
      return "Network error occurred during signup";
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and set user
        await AsyncStorage.setItem("@auth_token", data.token);
        setUser(data.user);
        return null;
      } else {
        return data.error || "An error occurred during sign in";
      }
    } catch (error) {
      console.error("Signin error:", error);
      return "Network error occurred during sign in";
    }
  };

  const signOut = async () => {
    try {
      const token = await AsyncStorage.getItem("@auth_token");

      if (token) {
        // Call signout endpoint
        await fetch(`${API_BASE_URL}/api/auth/signout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      // Remove token and clear user
      await AsyncStorage.removeItem("@auth_token");
      setUser(null);
    } catch (error) {
      console.error("Signout error:", error);
      // Even if the API call fails, we should still clear local data
      await AsyncStorage.removeItem("@auth_token");
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
