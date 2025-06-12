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
  const [isLoading, setLoading] = useState(false);
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
      setLoading(true);
      const userHabits = await HabitsService.getUserHabits(user.$id);
      setHabits(userHabits);
    } catch (error) {
      // Silent fail - error handling can be added here if needed
      setError("Failed to load habits");
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async (data: CreateHabitData) => {
    if (!user) return;

    try {
      setLoading(true);
      const newHabit = await HabitsService.createHabit(user.$id, data);
      setHabits((prev) => [...prev, newHabit]);
    } catch (error) {
      setError("Failed to create habit");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    if (!user) return;

    try {
      setLoading(true);
      const updatedHabit = await HabitsService.updateHabit(
        habitId,
        user.$id,
        updates
      );
      setHabits((prev) =>
        prev.map((habit) =>
          habit.$id === habitId
            ? {
                ...habit,
                ...updatedHabit,
                completions: habit.completions,
              }
            : habit
        )
      );
    } catch (error) {
      setError("Failed to update habit");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      await HabitsService.deleteHabit(habitId, user.$id);
      setHabits((prev) => prev.filter((habit) => habit.$id !== habitId));
    } catch (error) {
      setError("Failed to delete habit");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeHabit = async (habitId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const habit = habits.find((h) => h.$id === habitId);
      if (!habit) {
        throw new Error("Habit not found");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingCompletion = habit.completions?.find((completion) => {
        const completionDate = new Date(completion.completedAt);
        completionDate.setHours(0, 0, 0, 0);
        return completionDate.getTime() === today.getTime();
      });

      if (existingCompletion) {
        throw new Error("Habit already completed today");
      }

      const newCompletion = await HabitsService.completeHabit(
        habitId,
        user.$id
      );

      setHabits((prev) =>
        prev.map((h) =>
          h.$id === habitId
            ? {
                ...h,
                completions: [...(h.completions || []), newCompletion],
              }
            : h
        )
      );
    } catch (error) {
      setError("Failed to complete habit");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompletion = async (completionId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      await HabitsService.deleteCompletion(completionId, user.$id);

      setHabits((prev) =>
        prev.map((habit) => ({
          ...habit,
          completions: habit.completions?.filter(
            (completion) => completion.$id !== completionId
          ),
        }))
      );
    } catch (error) {
      setError("Failed to delete completion");
      throw error;
    } finally {
      setLoading(false);
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
