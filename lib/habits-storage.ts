import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CreateHabitData {
  title: string;
  description?: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
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
  completions?: HabitCompletion[];
}

export interface HabitCompletion {
  id: string;
  completedAt: Date;
  notes?: string;
  habitId: string;
  habit?: Habit;
}

export interface CreateCompletionData {
  habitId: string;
  completedAt?: string;
  notes?: string;
}

const HABITS_STORAGE_KEY = "@habits";
const COMPLETIONS_STORAGE_KEY = "@completions";

// Helper function to generate random colors
const getRandomColor = (): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8E8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Helper function to generate UUIDs
const generateId = (): string => {
  return "xxxx-xxxx-4xxx-yxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class HabitsStorage {
  static async createHabit(data: CreateHabitData): Promise<Habit> {
    try {
      const habits = await this.getUserHabits();
      const newHabit: Habit = {
        id: generateId(),
        title: data.title,
        description: data.description,
        frequency: data.frequency,
        streakCount: 0,
        color: getRandomColor(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        completions: [],
      };

      habits.push(newHabit);
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
      return newHabit;
    } catch (error) {
      throw new Error("Failed to create habit");
    }
  }

  static async getUserHabits(): Promise<Habit[]> {
    try {
      const habitsJson = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
      if (!habitsJson) {
        return [];
      }

      const habits = JSON.parse(habitsJson);
      return habits.map((habit: any) => ({
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
          })) || [],
      }));
    } catch (error) {
      throw new Error("Failed to fetch habits");
    }
  }

  static async updateHabit(
    habitId: string,
    data: Partial<CreateHabitData>
  ): Promise<Habit> {
    try {
      const habits = await this.getUserHabits();
      const habitIndex = habits.findIndex((h) => h.id === habitId);

      if (habitIndex === -1) {
        throw new Error("Habit not found");
      }

      habits[habitIndex] = {
        ...habits[habitIndex],
        ...data,
        updatedAt: new Date(),
      };

      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
      return habits[habitIndex];
    } catch (error) {
      throw new Error("Failed to update habit");
    }
  }

  static async deleteHabit(habitId: string): Promise<void> {
    try {
      const habits = await this.getUserHabits();
      const filteredHabits = habits.filter((h) => h.id !== habitId);

      // Also remove completions for this habit
      const completions = await this.getAllCompletions();
      const filteredCompletions = completions.filter(
        (c) => c.habitId !== habitId
      );

      await AsyncStorage.setItem(
        HABITS_STORAGE_KEY,
        JSON.stringify(filteredHabits)
      );
      await AsyncStorage.setItem(
        COMPLETIONS_STORAGE_KEY,
        JSON.stringify(filteredCompletions)
      );
    } catch (error) {
      throw new Error("Failed to delete habit");
    }
  }

  static async createCompletion(
    data: CreateCompletionData
  ): Promise<HabitCompletion> {
    try {
      const completions = await this.getAllCompletions();
      const habits = await this.getUserHabits();

      const newCompletion: HabitCompletion = {
        id: generateId(),
        habitId: data.habitId,
        completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
        notes: data.notes,
      };

      completions.push(newCompletion);
      await AsyncStorage.setItem(
        COMPLETIONS_STORAGE_KEY,
        JSON.stringify(completions)
      );

      // Update habit streak and last completed
      const habitIndex = habits.findIndex((h) => h.id === data.habitId);
      if (habitIndex !== -1) {
        habits[habitIndex].streakCount += 1;
        habits[habitIndex].lastCompleted = newCompletion.completedAt;
        habits[habitIndex].updatedAt = new Date();
        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
      }

      return newCompletion;
    } catch (error) {
      throw new Error("Failed to create completion");
    }
  }

  static async getTodayCompletions(date?: string): Promise<HabitCompletion[]> {
    try {
      const completions = await this.getAllCompletions();
      const targetDate = date ? new Date(date) : new Date();
      const todayStart = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      );
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      return completions.filter((completion) => {
        const completedAt = new Date(completion.completedAt);
        return completedAt >= todayStart && completedAt < todayEnd;
      });
    } catch (error) {
      throw new Error("Failed to fetch today's completions");
    }
  }

  static async getAllCompletions(): Promise<HabitCompletion[]> {
    try {
      const completionsJson = await AsyncStorage.getItem(
        COMPLETIONS_STORAGE_KEY
      );
      if (!completionsJson) {
        return [];
      }

      const completions = JSON.parse(completionsJson);
      return completions.map((completion: any) => ({
        ...completion,
        completedAt: new Date(completion.completedAt),
      }));
    } catch (error) {
      throw new Error("Failed to fetch all completions");
    }
  }

  static async getCompletionsForHabit(
    habitId: string
  ): Promise<HabitCompletion[]> {
    try {
      const completions = await this.getAllCompletions();
      return completions.filter((completion) => completion.habitId === habitId);
    } catch (error) {
      throw new Error("Failed to fetch habit completions");
    }
  }

  // Helper method to clear all data (useful for testing)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HABITS_STORAGE_KEY);
      await AsyncStorage.removeItem(COMPLETIONS_STORAGE_KEY);
    } catch (error) {
      throw new Error("Failed to clear data");
    }
  }
}
