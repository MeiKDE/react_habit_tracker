import {
  databases,
  ID,
  Query,
  DATABASE_ID,
  COLLECTIONS,
  Habit,
  HabitCompletion,
  CreateHabitData,
  CreateCompletionData,
  log,
  logError,
} from "./appwrite";

// Generate random colors for habits
const HABIT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#D2B4DE",
];

export const getRandomColor = (): string => {
  return HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)];
};

export class HabitsService {
  // Create a new habit
  static async createHabit(userId: string, data: CreateHabitData) {
    try {
      log("Creating new habit:", data.title);

      const habitData = {
        title: data.title,
        description: data.description || "",
        frequency: data.frequency,
        streakCount: 0,
        color: getRandomColor(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId,
      };

      const habit = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.HABITS,
        ID.unique(),
        habitData
      );

      log("Habit created successfully:", habit.$id);
      return habit as unknown as Habit;
    } catch (error: any) {
      logError("Failed to create habit:", error);
      throw new Error(error.message || "Failed to create habit");
    }
  }

  // Get all habits for a user
  static async getUserHabits(userId: string) {
    try {
      log("Fetching habits for user:", userId);

      const habits = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.HABITS,
        [
          Query.equal("userId", userId),
          Query.equal("isActive", true),
          Query.orderDesc("createdAt"),
        ]
      );

      log("Fetched habits count:", habits.documents.length);

      // Get completions for each habit
      const habitsWithCompletions = await Promise.all(
        habits.documents.map(async (habit) => {
          const completions = await this.getHabitCompletions(habit.$id);
          return {
            ...habit,
            completions,
          };
        })
      );

      return habitsWithCompletions as unknown as (Habit & {
        completions: HabitCompletion[];
      })[];
    } catch (error: any) {
      logError("Failed to fetch habits:", error);
      throw new Error(error.message || "Failed to fetch habits");
    }
  }

  // Get a single habit by ID
  static async getHabit(habitId: string, userId: string) {
    try {
      log("Fetching habit:", habitId);

      const habit = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.HABITS,
        habitId
      );

      // Verify ownership
      if ((habit as any).userId !== userId) {
        throw new Error("Unauthorized");
      }

      const completions = await this.getHabitCompletions(habitId);

      return {
        ...habit,
        completions,
      } as unknown as Habit & { completions: HabitCompletion[] };
    } catch (error: any) {
      logError("Failed to fetch habit:", error);
      throw new Error(error.message || "Failed to fetch habit");
    }
  }

  // Update a habit
  static async updateHabit(
    habitId: string,
    userId: string,
    updates: Partial<Omit<Habit, "$id" | "userId" | "createdAt">>
  ) {
    try {
      log("Updating habit:", habitId);

      // First verify ownership
      const existingHabit = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.HABITS,
        habitId
      );

      if ((existingHabit as any).userId !== userId) {
        throw new Error("Unauthorized");
      }

      const updatedHabit = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.HABITS,
        habitId,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      );

      log("Habit updated successfully");
      return updatedHabit as unknown as Habit;
    } catch (error: any) {
      logError("Failed to update habit:", error);
      throw new Error(error.message || "Failed to update habit");
    }
  }

  // Delete a habit (soft delete)
  static async deleteHabit(habitId: string, userId: string) {
    try {
      log("Deleting habit:", habitId);
      return await this.updateHabit(habitId, userId, { isActive: false });
    } catch (error: any) {
      logError("Failed to delete habit:", error);
      throw new Error(error.message || "Failed to delete habit");
    }
  }

  // Get habit completions
  static async getHabitCompletions(habitId: string) {
    try {
      log("Fetching completions for habit:", habitId);

      const completions = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.HABIT_COMPLETIONS,
        [Query.equal("habitId", habitId), Query.orderDesc("completedAt")]
      );

      log("Fetched completions count:", completions.documents.length);
      return completions.documents as unknown as HabitCompletion[];
    } catch (error: any) {
      logError("Failed to fetch completions:", error);
      throw new Error(error.message || "Failed to fetch completions");
    }
  }

  // Mark habit as completed
  static async completeHabit(
    habitId: string,
    userId: string,
    data?: CreateCompletionData
  ) {
    try {
      log("Completing habit:", habitId);

      // First verify habit ownership
      const habit = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.HABITS,
        habitId
      );

      if ((habit as any).userId !== userId) {
        throw new Error("Unauthorized");
      }

      // Create completion record
      const completion = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.HABIT_COMPLETIONS,
        ID.unique(),
        {
          habitId,
          completedAt: data?.completedAt || new Date().toISOString(),
          notes: data?.notes || "",
          createdAt: new Date().toISOString(),
        }
      );

      // Update habit's last completed date
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.HABITS, habitId, {
        lastCompleted: data?.completedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      log("Habit completed successfully");
      return completion as unknown as HabitCompletion;
    } catch (error: any) {
      logError("Failed to complete habit:", error);
      throw new Error(error.message || "Failed to complete habit");
    }
  }

  // Delete a completion
  static async deleteCompletion(completionId: string, userId: string) {
    try {
      log("Deleting completion:", completionId);

      // First get the completion to verify ownership through habit
      const completion = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.HABIT_COMPLETIONS,
        completionId
      );

      // Check habit ownership
      const habit = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.HABITS,
        (completion as any).habitId
      );

      if ((habit as any).userId !== userId) {
        throw new Error("Unauthorized");
      }

      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.HABIT_COMPLETIONS,
        completionId
      );

      log("Completion deleted successfully");
      return true;
    } catch (error: any) {
      logError("Failed to delete completion:", error);
      throw new Error(error.message || "Failed to delete completion");
    }
  }

  // Calculate streak for a habit
  static calculateStreak(
    completions: HabitCompletion[],
    frequency: "DAILY" | "WEEKLY" | "MONTHLY"
  ) {
    if (!completions || completions.length === 0) {
      return {
        streak: 0,
        bestStreak: 0,
        total: 0,
      };
    }

    const sortedCompletions = completions
      .map((c) => new Date(c.completedAt))
      .sort((a, b) => b.getTime() - a.getTime()); // Sort by newest first

    const total = completions.length;
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak
    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i]);
      completionDate.setHours(0, 0, 0, 0);

      let expectedDate = new Date(today);
      if (frequency === "DAILY") {
        expectedDate.setDate(today.getDate() - i);
      } else if (frequency === "WEEKLY") {
        expectedDate.setDate(today.getDate() - i * 7);
      } else if (frequency === "MONTHLY") {
        expectedDate.setMonth(today.getMonth() - i);
      }

      if (completionDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best streak
    tempStreak = 1;
    for (let i = 1; i < sortedCompletions.length; i++) {
      const currentDate = new Date(sortedCompletions[i]);
      const previousDate = new Date(sortedCompletions[i - 1]);

      let expectedDiff = 1;
      if (frequency === "WEEKLY") expectedDiff = 7;
      else if (frequency === "MONTHLY") expectedDiff = 30; // Approximate

      const daysDiff = Math.abs(
        (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= expectedDiff + 1) {
        // Allow some flexibility
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    bestStreak = Math.max(bestStreak, tempStreak, currentStreak);

    return {
      streak: currentStreak,
      bestStreak,
      total,
    };
  }
}
