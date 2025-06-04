import {
  ApiClient,
  Habit,
  HabitCompletion,
  CreateHabitData,
  CreateCompletionData,
} from "./api-client";
import {
  HabitsStorage,
  CreateHabitData as LocalCreateHabitData,
  CreateCompletionData as LocalCreateCompletionData,
  Habit as LocalHabit,
  HabitCompletion as LocalHabitCompletion,
} from "./habits-storage";

// Re-export types for external use
export type { CreateHabitData, CreateCompletionData, Habit, HabitCompletion };

// Helper functions to convert between local and remote types
function convertLocalToRemoteHabit(localHabit: LocalHabit): Habit {
  return {
    ...localHabit,
    userId: "local-user", // Default userId for local habits
    completions:
      localHabit.completions?.map(convertLocalToRemoteCompletion) || [],
  };
}

function convertLocalToRemoteCompletion(
  localCompletion: LocalHabitCompletion
): HabitCompletion {
  return {
    ...localCompletion,
    createdAt: localCompletion.completedAt, // Use completedAt as createdAt for local completions
    habit: localCompletion.habit
      ? convertLocalToRemoteHabit(localCompletion.habit)
      : undefined,
  };
}

export class HabitsAPI {
  // Only use remote API - no local fallback
  private static useRemoteAPI = true;

  static async createHabit(data: CreateHabitData): Promise<Habit> {
    try {
      console.log("[HABITS API] Creating habit via remote API:", data);
      const response = await ApiClient.createHabit(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to create habit");
    } catch (error) {
      console.error("[HABITS API] Remote API failed:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          throw new Error(
            "Unable to connect to server. Please check your internet connection and try again."
          );
        }
        throw new Error(`Create habit failed: ${error.message}`);
      }

      throw new Error(
        "An error occurred while creating the habit. Please try again."
      );
    }
  }

  static async getUserHabits(): Promise<Habit[]> {
    try {
      console.log("[HABITS API] Fetching habits via remote API");
      const response = await ApiClient.getHabits();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch habits");
    } catch (error) {
      console.error("[HABITS API] Remote API failed:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          throw new Error(
            "Unable to connect to server. Please check your internet connection and try again."
          );
        }
        throw new Error(`Fetch habits failed: ${error.message}`);
      }

      throw new Error(
        "An error occurred while fetching habits. Please try again."
      );
    }
  }

  static async updateHabit(
    habitId: string,
    data: Partial<CreateHabitData>
  ): Promise<Habit> {
    try {
      console.log("[HABITS API] Updating habit via remote API:", habitId, data);
      const response = await ApiClient.updateHabit(habitId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to update habit");
    } catch (error) {
      console.error("[HABITS API] Remote API failed:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          throw new Error(
            "Unable to connect to server. Please check your internet connection and try again."
          );
        }
        throw new Error(`Update habit failed: ${error.message}`);
      }

      throw new Error(
        "An error occurred while updating the habit. Please try again."
      );
    }
  }

  static async deleteHabit(habitId: string): Promise<void> {
    try {
      console.log("[HABITS API] Deleting habit via remote API:", habitId);
      const response = await ApiClient.deleteHabit(habitId);
      if (response.success) {
        return;
      }
      throw new Error(response.error || "Failed to delete habit");
    } catch (error) {
      console.error("[HABITS API] Remote API failed:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          throw new Error(
            "Unable to connect to server. Please check your internet connection and try again."
          );
        }
        throw new Error(`Delete habit failed: ${error.message}`);
      }

      throw new Error(
        "An error occurred while deleting the habit. Please try again."
      );
    }
  }

  static async createCompletion(
    data: CreateCompletionData & { habitId: string }
  ): Promise<HabitCompletion> {
    try {
      console.log("[HABITS API] Creating completion via remote API:", data);
      // For remote API, habitId is passed separately
      const { habitId, ...completionData } = data;
      const response = await ApiClient.createCompletion(
        habitId,
        completionData
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to create completion");
    } catch (error) {
      console.error("[HABITS API] Remote API failed:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          throw new Error(
            "Unable to connect to server. Please check your internet connection and try again."
          );
        }
        throw new Error(`Create completion failed: ${error.message}`);
      }

      throw new Error(
        "An error occurred while completing the habit. Please try again."
      );
    }
  }

  static async getTodayCompletions(date?: string): Promise<HabitCompletion[]> {
    try {
      console.log("[HABITS API] Fetching today's completions via remote API");
      // For remote API, we'll get all habits with their completions and filter locally
      const response = await ApiClient.getHabits();
      if (response.success && response.data) {
        const today = date ? new Date(date) : new Date();
        const todayStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        const todayCompletions: HabitCompletion[] = [];
        response.data.forEach((habit) => {
          if (habit.completions) {
            habit.completions.forEach((completion) => {
              const completionDate = new Date(completion.completedAt);
              if (completionDate >= todayStart && completionDate < todayEnd) {
                todayCompletions.push(completion);
              }
            });
          }
        });
        return todayCompletions;
      }
      throw new Error(response.error || "Failed to fetch completions");
    } catch (error) {
      console.error("[HABITS API] Remote API failed:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          throw new Error(
            "Unable to connect to server. Please check your internet connection and try again."
          );
        }
        throw new Error(`Fetch completions failed: ${error.message}`);
      }

      throw new Error(
        "An error occurred while fetching today's completions. Please try again."
      );
    }
  }

  static async getAllCompletions(): Promise<HabitCompletion[]> {
    try {
      console.log("[HABITS API] Fetching all completions via remote API");
      // For remote API, get all habits with completions
      const response = await ApiClient.getHabits();
      if (response.success && response.data) {
        const allCompletions: HabitCompletion[] = [];
        response.data.forEach((habit) => {
          if (habit.completions) {
            allCompletions.push(...habit.completions);
          }
        });
        return allCompletions;
      }
      throw new Error(response.error || "Failed to fetch completions");
    } catch (error) {
      console.error("[HABITS API] Remote API failed:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          throw new Error(
            "Unable to connect to server. Please check your internet connection and try again."
          );
        }
        throw new Error(`Fetch completions failed: ${error.message}`);
      }

      throw new Error(
        "An error occurred while fetching completions. Please try again."
      );
    }
  }

  static async getCompletionsForHabit(
    habitId: string
  ): Promise<HabitCompletion[]> {
    try {
      console.log(
        "[HABITS API] Fetching completions for habit via remote API:",
        habitId
      );
      const response = await ApiClient.getCompletionsForHabit(habitId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch habit completions");
    } catch (error) {
      console.error("[HABITS API] Remote API failed:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          throw new Error(
            "Unable to connect to server. Please check your internet connection and try again."
          );
        }
        throw new Error(`Fetch habit completions failed: ${error.message}`);
      }

      throw new Error(
        "An error occurred while fetching habit completions. Please try again."
      );
    }
  }

  // Utility methods - keeping for compatibility but always return true
  static setUseRemoteAPI(useRemote: boolean): void {
    // Always use remote API, ignore the parameter
    this.useRemoteAPI = true;
    console.log("[HABITS API] Remote API usage is always enabled");
  }

  static isUsingRemoteAPI(): boolean {
    return true; // Always return true since we only use remote API
  }
}
