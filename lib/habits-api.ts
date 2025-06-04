import {
  ApiClient,
  CreateHabitData,
  Habit,
  HabitCompletion,
  CreateCompletionData,
  UpdateHabitData,
} from "./api-client";
import {
  HabitsStorage,
  CreateHabitData as LocalCreateHabitData,
  Habit as LocalHabit,
  HabitCompletion as LocalHabitCompletion,
  CreateCompletionData as LocalCreateCompletionData,
} from "./habits-storage";

// Re-export types for backward compatibility
export type { CreateHabitData, Habit, HabitCompletion, CreateCompletionData };

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
  // Configuration flag to switch between local and remote storage
  private static useRemoteAPI = true;

  static async createHabit(data: CreateHabitData): Promise<Habit> {
    if (this.useRemoteAPI) {
      try {
        const response = await ApiClient.createHabit(data);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || "Failed to create habit");
      } catch (error) {
        console.warn(
          "Remote API failed, falling back to local storage:",
          error
        );
        // Fallback to local storage
        const localHabit = await HabitsStorage.createHabit(
          data as LocalCreateHabitData
        );
        return convertLocalToRemoteHabit(localHabit);
      }
    }
    const localHabit = await HabitsStorage.createHabit(
      data as LocalCreateHabitData
    );
    return convertLocalToRemoteHabit(localHabit);
  }

  static async getUserHabits(): Promise<Habit[]> {
    if (this.useRemoteAPI) {
      try {
        const response = await ApiClient.getHabits();
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || "Failed to fetch habits");
      } catch (error) {
        console.warn(
          "Remote API failed, falling back to local storage:",
          error
        );
        // Fallback to local storage
        const localHabits = await HabitsStorage.getUserHabits();
        return localHabits.map(convertLocalToRemoteHabit);
      }
    }
    const localHabits = await HabitsStorage.getUserHabits();
    return localHabits.map(convertLocalToRemoteHabit);
  }

  static async updateHabit(
    habitId: string,
    data: Partial<CreateHabitData>
  ): Promise<Habit> {
    if (this.useRemoteAPI) {
      try {
        const response = await ApiClient.updateHabit(
          habitId,
          data as UpdateHabitData
        );
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || "Failed to update habit");
      } catch (error) {
        console.warn(
          "Remote API failed, falling back to local storage:",
          error
        );
        // Fallback to local storage
        const localHabit = await HabitsStorage.updateHabit(
          habitId,
          data as Partial<LocalCreateHabitData>
        );
        return convertLocalToRemoteHabit(localHabit);
      }
    }
    const localHabit = await HabitsStorage.updateHabit(
      habitId,
      data as Partial<LocalCreateHabitData>
    );
    return convertLocalToRemoteHabit(localHabit);
  }

  static async deleteHabit(habitId: string): Promise<void> {
    if (this.useRemoteAPI) {
      try {
        const response = await ApiClient.deleteHabit(habitId);
        if (response.success) {
          return;
        }
        throw new Error(response.error || "Failed to delete habit");
      } catch (error) {
        console.warn(
          "Remote API failed, falling back to local storage:",
          error
        );
        // Fallback to local storage
        return await HabitsStorage.deleteHabit(habitId);
      }
    }
    return await HabitsStorage.deleteHabit(habitId);
  }

  static async createCompletion(
    data: CreateCompletionData & { habitId: string }
  ): Promise<HabitCompletion> {
    if (this.useRemoteAPI) {
      try {
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
        console.warn(
          "Remote API failed, falling back to local storage:",
          error
        );
        // Fallback to local storage
        const localCompletion = await HabitsStorage.createCompletion(
          data as LocalCreateCompletionData
        );
        return convertLocalToRemoteCompletion(localCompletion);
      }
    }
    const localCompletion = await HabitsStorage.createCompletion(
      data as LocalCreateCompletionData
    );
    return convertLocalToRemoteCompletion(localCompletion);
  }

  static async getTodayCompletions(date?: string): Promise<HabitCompletion[]> {
    if (this.useRemoteAPI) {
      try {
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
        console.warn(
          "Remote API failed, falling back to local storage:",
          error
        );
        // Fallback to local storage
        const localCompletions = await HabitsStorage.getTodayCompletions(date);
        return localCompletions.map(convertLocalToRemoteCompletion);
      }
    }
    const localCompletions = await HabitsStorage.getTodayCompletions(date);
    return localCompletions.map(convertLocalToRemoteCompletion);
  }

  static async getAllCompletions(): Promise<HabitCompletion[]> {
    if (this.useRemoteAPI) {
      try {
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
        console.warn(
          "Remote API failed, falling back to local storage:",
          error
        );
        // Fallback to local storage
        const localCompletions = await HabitsStorage.getAllCompletions();
        return localCompletions.map(convertLocalToRemoteCompletion);
      }
    }
    const localCompletions = await HabitsStorage.getAllCompletions();
    return localCompletions.map(convertLocalToRemoteCompletion);
  }

  static async getCompletionsForHabit(
    habitId: string
  ): Promise<HabitCompletion[]> {
    if (this.useRemoteAPI) {
      try {
        const response = await ApiClient.getCompletionsForHabit(habitId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || "Failed to fetch habit completions");
      } catch (error) {
        console.warn(
          "Remote API failed, falling back to local storage:",
          error
        );
        // Fallback to local storage
        const localCompletions = await HabitsStorage.getCompletionsForHabit(
          habitId
        );
        return localCompletions.map(convertLocalToRemoteCompletion);
      }
    }
    const localCompletions = await HabitsStorage.getCompletionsForHabit(
      habitId
    );
    return localCompletions.map(convertLocalToRemoteCompletion);
  }

  // Utility methods
  static setUseRemoteAPI(useRemote: boolean): void {
    this.useRemoteAPI = useRemote;
  }

  static isUsingRemoteAPI(): boolean {
    return this.useRemoteAPI;
  }
}
