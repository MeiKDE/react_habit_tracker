import React, { createContext, useContext, useEffect, useState } from "react";
import { HabitsService } from "./habits-appwrite";
import {
  Habit,
  CreateHabitData,
  HabitCompletion,
  StreakData,
} from "./appwrite";
import { useAuth } from "./auth-context";

interface HabitsContextType {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  createHabit: (data: CreateHabitData) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  completeHabit: (habitId: string, notes?: string) => Promise<void>;
  deleteCompletion: (completionId: string) => Promise<void>;
  refreshHabits: () => Promise<void>;
  getHabitStreak: (habit: Habit) => StreakData;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadHabits();
    } else {
      setHabits([]);
    }
  }, [user]);

  const loadHabits = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("[HABITS] Loading habits for user:", user.$id);
      const userHabits = await HabitsService.getUserHabits(user.$id);

      setHabits(userHabits);
      console.log("[HABITS] Loaded", userHabits.length, "habits");
    } catch (error: any) {
      console.error("[HABITS] Error loading habits:", error);
      setError(error.message || "Failed to load habits");
    } finally {
      setIsLoading(false);
    }
  };

  const createHabit = async (data: CreateHabitData) => {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);
      console.log("[HABITS] Creating habit:", data.title);

      const newHabit = await HabitsService.createHabit(user.$id, data);

      // Add the new habit to the local state
      setHabits((prev) => [newHabit, ...prev]);
      console.log("[HABITS] Habit created successfully");
    } catch (error: any) {
      console.error("[HABITS] Error creating habit:", error);
      setError(error.message || "Failed to create habit");
      throw error;
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);
      console.log("[HABITS] Updating habit:", habitId);

      const updatedHabit = await HabitsService.updateHabit(
        habitId,
        user.$id,
        updates
      );

      // Update the habit in local state
      setHabits((prev) =>
        prev.map((habit) =>
          habit.$id === habitId ? { ...habit, ...updatedHabit } : habit
        )
      );
      console.log("[HABITS] Habit updated successfully");
    } catch (error: any) {
      console.error("[HABITS] Error updating habit:", error);
      setError(error.message || "Failed to update habit");
      throw error;
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);
      console.log("[HABITS] Deleting habit:", habitId);

      await HabitsService.deleteHabit(habitId, user.$id);

      // Remove the habit from local state
      setHabits((prev) => prev.filter((habit) => habit.$id !== habitId));
      console.log("[HABITS] Habit deleted successfully");
    } catch (error: any) {
      console.error("[HABITS] Error deleting habit:", error);
      setError(error.message || "Failed to delete habit");
      throw error;
    }
  };

  const completeHabit = async (habitId: string, notes?: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);
      console.log("[HABITS] Completing habit:", habitId);

      const completion = await HabitsService.completeHabit(habitId, user.$id, {
        habitId,
        notes,
        completedAt: new Date().toISOString(),
      });

      // Update the habit in local state with the new completion
      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.$id === habitId) {
            const updatedCompletions = habit.completions
              ? [completion, ...habit.completions]
              : [completion];
            return {
              ...habit,
              completions: updatedCompletions,
              lastCompleted: completion.completedAt,
            };
          }
          return habit;
        })
      );
      console.log("[HABITS] Habit completed successfully");
    } catch (error: any) {
      console.error("[HABITS] Error completing habit:", error);
      setError(error.message || "Failed to complete habit");
      throw error;
    }
  };

  const deleteCompletion = async (completionId: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);
      console.log("[HABITS] Deleting completion:", completionId);

      await HabitsService.deleteCompletion(completionId, user.$id);

      // Remove the completion from local state
      setHabits((prev) =>
        prev.map((habit) => ({
          ...habit,
          completions:
            habit.completions?.filter((c) => c.$id !== completionId) || [],
        }))
      );
      console.log("[HABITS] Completion deleted successfully");
    } catch (error: any) {
      console.error("[HABITS] Error deleting completion:", error);
      setError(error.message || "Failed to delete completion");
      throw error;
    }
  };

  const refreshHabits = async () => {
    await loadHabits();
  };

  const getHabitStreak = (habit: Habit): StreakData => {
    if (!habit.completions) {
      return { streak: 0, bestStreak: 0, total: 0 };
    }

    return HabitsService.calculateStreak(habit.completions, habit.frequency);
  };

  const value: HabitsContextType = {
    habits,
    isLoading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    deleteCompletion,
    refreshHabits,
    getHabitStreak,
  };

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
}
