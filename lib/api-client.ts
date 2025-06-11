import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getApiUrl,
  API_ENDPOINTS,
  STORAGE_KEYS,
  ApiResponse,
  API_CONFIG,
  logApiConfig,
} from "../config/api";
import { account } from "./appwrite";

// API Response types matching Next.js backend
export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  streakCount: number;
  lastCompleted?: Date;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  completions?: HabitCompletion[];
}

export interface HabitCompletion {
  id: string;
  completedAt: Date;
  notes?: string;
  createdAt: Date;
  habitId: string;
  habit?: Habit;
}

export interface CreateHabitData {
  title: string;
  description?: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
}

export interface UpdateHabitData {
  title?: string;
  description?: string;
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY";
  isActive?: boolean;
}

export interface CreateCompletionData {
  completedAt?: string;
  notes?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Create a timeout signal that works in React Native
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return controller.signal;
}

export class ApiClient {
  private static async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  private static async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  private static async removeAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${getApiUrl()}${endpoint}`;
      const token = await this.getAuthToken();

      // Enhanced logging for debugging
      console.log(`[API CLIENT] ====== API REQUEST DEBUG ======`);
      console.log(`[API CLIENT] Making request to: ${url}`);
      console.log(`[API CLIENT] Method: ${options.method || "GET"}`);
      console.log(`[API CLIENT] Has token: ${!!token}`);
      console.log(`[API CLIENT] Base URL: ${getApiUrl()}`);
      console.log(`[API CLIENT] Endpoint: ${endpoint}`);
      logApiConfig();
      console.log(`[API CLIENT] ============================`);

      const headers: Record<string, string> = {
        ...API_CONFIG.headers,
        ...(options.headers as Record<string, string>),
      };

      // Add JWT token to Authorization header for protected routes
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
        // Use compatible timeout implementation
        signal: createTimeoutSignal(API_CONFIG.timeout),
      });

      console.log(`[API CLIENT] Response status: ${response.status}`);

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        console.log(`[API CLIENT] Response data:`, data);
      } else {
        const text = await response.text();
        console.log(`[API CLIENT] Response text:`, text);
        // Try to create a standard error response
        data = {
          success: false,
          error: text || `HTTP error! status: ${response.status}`,
          message: text || `Server returned status ${response.status}`,
        };
      }

      if (!response.ok) {
        // Handle 401 errors by clearing the token
        if (response.status === 401) {
          await this.removeAuthToken();
          await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }

        // Return structured error response
        return {
          success: false,
          error:
            data.error ||
            data.message ||
            `HTTP error! status: ${response.status}`,
          message:
            data.message || `Request failed with status ${response.status}`,
          details: data,
        };
      }

      // For successful responses, wrap in our standard format if needed
      if (data && typeof data === "object" && "success" in data) {
        return data;
      } else {
        return {
          success: true,
          data: data,
          message: "Request successful",
        };
      }
    } catch (error) {
      console.error(`[API CLIENT] API request failed for ${endpoint}:`, error);

      // Provide more specific error messages
      if (error instanceof Error) {
        let errorMessage = error.message;
        let userFriendlyMessage = error.message;

        if (error.name === "AbortError") {
          errorMessage = "Request timeout";
          userFriendlyMessage =
            "Request timed out after 10 seconds. Please check your internet connection.";
        } else if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("Network request failed")
        ) {
          errorMessage = "Network connection failed";
          userFriendlyMessage =
            "Unable to connect to the server. Please check your internet connection and try again.";
        }

        return {
          success: false,
          error: errorMessage,
          message: userFriendlyMessage,
        };
      }

      return {
        success: false,
        error: "Unknown error occurred",
        message: "An unexpected error occurred. Please try again.",
      };
    }
  }

  // Authentication methods
  static async signUp(data: SignUpData): Promise<ApiResponse<SignInResponse>> {
    const response = await this.makeRequest<SignInResponse>(
      API_ENDPOINTS.AUTH.SIGN_UP,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    // Store the token and user data if signup is successful
    if (response.success && response.data) {
      await this.setAuthToken(response.data.accessToken);
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(response.data.user)
      );
    }

    return response;
  }

  static async signIn(data: SignInData): Promise<ApiResponse<SignInResponse>> {
    try {
      console.log(`[API CLIENT] Starting sign in process for: ${data.email}`);

      let session;
      let currentUser;

      try {
        // First, check if there's already an active Appwrite session
        console.log(`[API CLIENT] Checking for existing Appwrite session...`);
        currentUser = await account.get();
        console.log(
          `[API CLIENT] Found existing session for user: ${currentUser.email}`
        );

        // If the existing user matches the login email, use the existing session
        if (currentUser.email === data.email) {
          console.log(`[API CLIENT] Using existing session for same user`);
          // We don't have the session object, but we can get session list
          const sessions = await account.listSessions();
          session =
            sessions.sessions.find((s) => s.current) || sessions.sessions[0];
        } else {
          console.log(
            `[API CLIENT] Different user, clearing existing session...`
          );
          // Different user, clear the existing session
          await account.deleteSession("current");
          throw new Error("NEED_NEW_SESSION"); // This will trigger the catch block
        }
      } catch (error: any) {
        // No existing session or need to create new session
        console.log(`[API CLIENT] Creating new Appwrite session...`);
        session = await account.createEmailPasswordSession(
          data.email,
          data.password
        );
        console.log(`[API CLIENT] Appwrite session created: ${session.$id}`);

        // Get current user info from Appwrite
        currentUser = await account.get();
        console.log(
          `[API CLIENT] Current user from Appwrite: ${currentUser.$id}`
        );
      }

      // Now exchange the Appwrite session for a JWT token from our API
      console.log(`[API CLIENT] Exchanging session for JWT token...`);
      const response = await this.makeRequest<SignInResponse>(
        API_ENDPOINTS.AUTH.SIGN_IN,
        {
          method: "POST",
          body: JSON.stringify({
            email: currentUser.email,
            appwriteUserId: currentUser.$id,
            sessionId: session?.$id || "existing-session",
          }),
        }
      );

      // If JWT creation fails, clean up the Appwrite session (only if we created it)
      if (!response.success) {
        if (session && session.$id !== "existing-session") {
          try {
            await account.deleteSession(session.$id);
            console.log(
              `[API CLIENT] Cleaned up Appwrite session after JWT failure`
            );
          } catch (cleanupError) {
            console.error(
              `[API CLIENT] Failed to cleanup Appwrite session:`,
              cleanupError
            );
          }
        }
        return response;
      }

      // Store the token and user data if login is successful
      if (response.success && response.data) {
        await this.setAuthToken(response.data.accessToken);
        await AsyncStorage.setItem(
          STORAGE_KEYS.CURRENT_USER,
          JSON.stringify(response.data.user)
        );
        console.log(
          `[API CLIENT] Sign in successful for user: ${response.data.user.id}`
        );
      }

      return response;
    } catch (error: any) {
      console.error(`[API CLIENT] Sign in error:`, error);

      // Provide user-friendly error messages
      let userMessage =
        "Invalid credentials. Please check the email and password.";
      if (
        error.message?.includes("network") ||
        error.message?.includes("fetch")
      ) {
        userMessage = "Network error. Please check your internet connection.";
      }

      return {
        success: false,
        error: error.message || "Authentication failed",
        message: userMessage,
      };
    }
  }

  static async signOut(): Promise<void> {
    try {
      // First, clean up the Appwrite session
      try {
        await account.deleteSession("current");
        console.log(`[API CLIENT] Appwrite session deleted`);
      } catch (appwriteError) {
        console.error(
          `[API CLIENT] Failed to delete Appwrite session:`,
          appwriteError
        );
        // Continue with local cleanup even if Appwrite cleanup fails
      }

      // Clean up local storage
      await this.removeAuthToken();
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      console.log(`[API CLIENT] Local auth data cleared`);
    } catch (error) {
      console.error(`[API CLIENT] Sign out error:`, error);
      // Still clear local data even if there are errors
      await this.removeAuthToken();
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Habit methods - now using JWT authentication
  static async getHabits(): Promise<ApiResponse<Habit[]>> {
    return this.makeRequest<Habit[]>(API_ENDPOINTS.HABITS.LIST, {
      method: "GET",
    });
  }

  static async createHabit(data: CreateHabitData): Promise<ApiResponse<Habit>> {
    return this.makeRequest<Habit>(API_ENDPOINTS.HABITS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateHabit(
    habitId: string,
    data: UpdateHabitData
  ): Promise<ApiResponse<Habit>> {
    return this.makeRequest<Habit>(API_ENDPOINTS.HABITS.UPDATE(habitId), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async deleteHabit(habitId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(API_ENDPOINTS.HABITS.DELETE(habitId), {
      method: "DELETE",
    });
  }

  static async createCompletion(
    habitId: string,
    data: CreateCompletionData = {}
  ): Promise<ApiResponse<HabitCompletion>> {
    return this.makeRequest<HabitCompletion>(
      API_ENDPOINTS.HABITS.COMPLETE(habitId),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  static async getCompletionsForHabit(
    habitId: string
  ): Promise<ApiResponse<HabitCompletion[]>> {
    return this.makeRequest<HabitCompletion[]>(
      API_ENDPOINTS.HABITS.COMPLETIONS(habitId),
      {
        method: "GET",
      }
    );
  }

  // Helper method to check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      // First check if we have a JWT token
      const token = await this.getAuthToken();
      if (token) {
        console.log(`[API CLIENT] JWT token found`);
        return true;
      }

      // If no JWT, check if we have an Appwrite session we can sync
      console.log(`[API CLIENT] No JWT found, checking Appwrite session...`);

      // First check if we have a valid session to avoid 401 guest errors
      try {
        const session = await account.getSession("current");
        if (!session || !session.$id) {
          console.log(`[API CLIENT] No valid session found`);
          return false;
        }
        console.log(`[API CLIENT] Valid session found, getting user info`);
      } catch (sessionError) {
        console.log(
          `[API CLIENT] No current session - user is not authenticated`
        );
        return false;
      }

      const currentUser = await account.get();
      console.log(
        `[API CLIENT] Found Appwrite session for: ${currentUser.email}`
      );

      // Sync the Appwrite session to create a JWT
      const sessions = await account.listSessions();
      const currentSession =
        sessions.sessions.find((s) => s.current) || sessions.sessions[0];

      const syncResponse = await this.makeRequest<SignInResponse>(
        API_ENDPOINTS.AUTH.SIGN_IN,
        {
          method: "POST",
          body: JSON.stringify({
            email: currentUser.email,
            appwriteUserId: currentUser.$id,
            sessionId: currentSession?.$id || "existing-session",
          }),
        }
      );

      if (syncResponse.success && syncResponse.data) {
        await this.setAuthToken(syncResponse.data.accessToken);
        await AsyncStorage.setItem(
          STORAGE_KEYS.CURRENT_USER,
          JSON.stringify(syncResponse.data.user)
        );
        console.log(`[API CLIENT] Successfully synced Appwrite session to JWT`);
        return true;
      }

      console.log(`[API CLIENT] No valid authentication found`);
      return false;
    } catch (error) {
      console.log(`[API CLIENT] Authentication check failed:`, error);
      return false;
    }
  }

  // Helper method to get current user from storage
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }
}
