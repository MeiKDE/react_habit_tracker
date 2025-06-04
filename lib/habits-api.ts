import {
  HabitsStorage,
  CreateHabitData,
  Habit,
  HabitCompletion,
  CreateCompletionData,
} from "./habits-storage";

// Re-export types for backward compatibility
export type { CreateHabitData, Habit, HabitCompletion, CreateCompletionData };

export class HabitsAPI {
  static async createHabit(data: CreateHabitData): Promise<Habit> {
    return await HabitsStorage.createHabit(data);
  }

  static async getUserHabits(): Promise<Habit[]> {
    return await HabitsStorage.getUserHabits();
  }

  static async updateHabit(
    habitId: string,
    data: Partial<CreateHabitData>
  ): Promise<Habit> {
    return await HabitsStorage.updateHabit(habitId, data);
  }

  static async deleteHabit(habitId: string): Promise<void> {
    return await HabitsStorage.deleteHabit(habitId);
  }

  static async createCompletion(
    data: CreateCompletionData
  ): Promise<HabitCompletion> {
    return await HabitsStorage.createCompletion(data);
  }

  static async getTodayCompletions(date?: string): Promise<HabitCompletion[]> {
    return await HabitsStorage.getTodayCompletions(date);
  }

  static async getAllCompletions(): Promise<HabitCompletion[]> {
    return await HabitsStorage.getAllCompletions();
  }

  static async getCompletionsForHabit(
    habitId: string
  ): Promise<HabitCompletion[]> {
    return await HabitsStorage.getCompletionsForHabit(habitId);
  }
}
