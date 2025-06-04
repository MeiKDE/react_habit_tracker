import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import {
  HabitsAPI,
  Habit,
  HabitCompletion,
  CreateHabitData,
} from "./habits-api";

interface HabitsContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  loading: boolean;
  error: string | null;

  // Habit management
  createHabit: (data: CreateHabitData) => Promise<void>;
  updateHabit: (
    habitId: string,
    data: Partial<CreateHabitData>
  ) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;

  // Completion management
  completeHabit: (
    habitId: string,
    completedAt?: string,
    notes?: string
  ) => Promise<void>;
  getTodayCompletions: () => Promise<HabitCompletion[]>;

  // Data refresh
  refreshHabits: () => Promise<void>;
  refreshCompletions: () => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const { user, isUsingRemoteAuth } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync HabitsAPI with auth context remote setting
  useEffect(() => {
    HabitsAPI.setUseRemoteAPI(isUsingRemoteAuth);
  }, [isUsingRemoteAuth]);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      refreshHabits();
      refreshCompletions();
    } else {
      setHabits([]);
      setCompletions([]);
    }
  }, [user]);

  const refreshHabits = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const fetchedHabits = await HabitsAPI.getUserHabits();
      setHabits(fetchedHabits);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch habits";
      setError(errorMessage);
      console.error("Error fetching habits:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshCompletions = async () => {
    if (!user) return;

    try {
      const fetchedCompletions = await HabitsAPI.getAllCompletions();
      setCompletions(fetchedCompletions);
    } catch (err) {
      console.error("Error fetching completions:", err);
    }
  };

  const createHabit = async (data: CreateHabitData) => {
    try {
      setError(null);
      await HabitsAPI.createHabit(data);
      await refreshHabits();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create habit";
      setError(errorMessage);
      throw err;
    }
  };

  const updateHabit = async (
    habitId: string,
    data: Partial<CreateHabitData>
  ) => {
    try {
      setError(null);
      await HabitsAPI.updateHabit(habitId, data);
      await refreshHabits();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update habit";
      setError(errorMessage);
      throw err;
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      setError(null);
      await HabitsAPI.deleteHabit(habitId);
      await refreshHabits();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete habit";
      setError(errorMessage);
      throw err;
    }
  };

  const completeHabit = async (
    habitId: string,
    completedAt?: string,
    notes?: string
  ) => {
    try {
      setError(null);
      await HabitsAPI.createCompletion({
        habitId,
        completedAt: completedAt || new Date().toISOString(),
        notes,
      });
      await refreshHabits();
      await refreshCompletions();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to complete habit";
      setError(errorMessage);
      throw err;
    }
  };

  const getTodayCompletions = async (): Promise<HabitCompletion[]> => {
    try {
      return await HabitsAPI.getTodayCompletions();
    } catch (err) {
      console.error("Error fetching today completions:", err);
      return [];
    }
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        completions,
        loading,
        error,
        createHabit,
        updateHabit,
        deleteHabit,
        completeHabit,
        getTodayCompletions,
        refreshHabits,
        refreshCompletions,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
}
