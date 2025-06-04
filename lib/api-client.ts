import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getApiUrl,
  API_ENDPOINTS,
  STORAGE_KEYS,
  ApiResponse,
  API_CONFIG,
} from "../config/api";

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

      const headers: Record<string, string> = {
        ...API_CONFIG.headers,
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
        // Use compatible timeout implementation
        signal: createTimeoutSignal(API_CONFIG.timeout),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth methods
  static async signUp(data: SignUpData): Promise<ApiResponse<User>> {
    const response = await this.makeRequest<User>(API_ENDPOINTS.AUTH.SIGN_UP, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  }

  static async signIn(
    data: SignInData
  ): Promise<ApiResponse<{ user: User; accessToken: string }>> {
    const response = await this.makeRequest<{
      user: User;
      accessToken: string;
    }>(API_ENDPOINTS.AUTH.SIGN_IN, {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Store the token for future requests
    if (response.success && response.data?.accessToken) {
      await this.setAuthToken(response.data.accessToken);
    }

    return response;
  }

  static async signOut(): Promise<void> {
    await this.removeAuthToken();
  }

  // Habit methods
  static async getHabits(): Promise<ApiResponse<Habit[]>> {
    const response = await this.makeRequest<Habit[]>(API_ENDPOINTS.HABITS.LIST);

    // Convert date strings to Date objects
    if (response.success && response.data) {
      response.data = response.data.map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
        updatedAt: new Date(habit.updatedAt),
        lastCompleted: habit.lastCompleted
          ? new Date(habit.lastCompleted)
          : undefined,
        completions:
          habit.completions?.map((completion: any) => ({
            ...completion,
            completedAt: new Date(completion.completedAt),
            createdAt: new Date(completion.createdAt),
          })) || [],
      }));
    }

    return response;
  }

  static async createHabit(data: CreateHabitData): Promise<ApiResponse<Habit>> {
    const response = await this.makeRequest<Habit>(
      API_ENDPOINTS.HABITS.CREATE,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    // Convert date strings to Date objects
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        lastCompleted: response.data.lastCompleted
          ? new Date(response.data.lastCompleted)
          : undefined,
        completions:
          response.data.completions?.map((completion: any) => ({
            ...completion,
            completedAt: new Date(completion.completedAt),
            createdAt: new Date(completion.createdAt),
          })) || [],
      };
    }

    return response;
  }

  static async updateHabit(
    habitId: string,
    data: UpdateHabitData
  ): Promise<ApiResponse<Habit>> {
    const response = await this.makeRequest<Habit>(
      API_ENDPOINTS.HABITS.UPDATE(habitId),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );

    // Convert date strings to Date objects
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        lastCompleted: response.data.lastCompleted
          ? new Date(response.data.lastCompleted)
          : undefined,
      };
    }

    return response;
  }

  static async deleteHabit(habitId: string): Promise<ApiResponse<void>> {
    return await this.makeRequest<void>(API_ENDPOINTS.HABITS.DELETE(habitId), {
      method: "DELETE",
    });
  }

  // Completion methods
  static async createCompletion(
    habitId: string,
    data: CreateCompletionData = {}
  ): Promise<ApiResponse<HabitCompletion>> {
    const response = await this.makeRequest<HabitCompletion>(
      API_ENDPOINTS.HABITS.COMPLETE(habitId),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    // Convert date strings to Date objects
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        completedAt: new Date(response.data.completedAt),
        createdAt: new Date(response.data.createdAt),
      };
    }

    return response;
  }

  static async getCompletionsForHabit(
    habitId: string
  ): Promise<ApiResponse<HabitCompletion[]>> {
    const response = await this.makeRequest<HabitCompletion[]>(
      API_ENDPOINTS.HABITS.COMPLETIONS(habitId)
    );

    // Convert date strings to Date objects
    if (response.success && response.data) {
      response.data = response.data.map((completion: any) => ({
        ...completion,
        completedAt: new Date(completion.completedAt),
        createdAt: new Date(completion.createdAt),
      }));
    }

    return response;
  }

  // Utility method to check if we have a valid auth token
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }
}
