import { makeAuthenticatedRequest } from "./auth-utils";

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
  userId: string;
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

export class HabitsAPI {
  private static baseUrl = "/api/habits";
  private static completionsUrl = "/api/completions";

  static async createHabit(data: CreateHabitData): Promise<Habit> {
    const response = await makeAuthenticatedRequest(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create habit");
    }

    const result = await response.json();
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
      lastCompleted: result.lastCompleted
        ? new Date(result.lastCompleted)
        : undefined,
    };
  }

  static async getUserHabits(): Promise<Habit[]> {
    const response = await makeAuthenticatedRequest(this.baseUrl, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch habits");
    }

    const results = await response.json();
    return results.map((habit: any) => ({
      ...habit,
      createdAt: new Date(habit.createdAt),
      updatedAt: new Date(habit.updatedAt),
      lastCompleted: habit.lastCompleted
        ? new Date(habit.lastCompleted)
        : undefined,
      completions: habit.completions?.map((completion: any) => ({
        ...completion,
        completedAt: new Date(completion.completedAt),
      })),
    }));
  }

  static async updateHabit(
    habitId: string,
    data: Partial<CreateHabitData>
  ): Promise<Habit> {
    const response = await makeAuthenticatedRequest(
      `${this.baseUrl}/${habitId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update habit");
    }

    const result = await response.json();
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
      lastCompleted: result.lastCompleted
        ? new Date(result.lastCompleted)
        : undefined,
    };
  }

  static async deleteHabit(habitId: string): Promise<void> {
    const response = await makeAuthenticatedRequest(
      `${this.baseUrl}/${habitId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete habit");
    }
  }

  static async createCompletion(
    data: CreateCompletionData
  ): Promise<HabitCompletion> {
    const response = await makeAuthenticatedRequest(this.completionsUrl, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create completion");
    }

    const result = await response.json();
    return {
      ...result,
      completedAt: new Date(result.completedAt),
    };
  }

  static async getTodayCompletions(date?: string): Promise<HabitCompletion[]> {
    const url = date
      ? `${this.completionsUrl}?date=${date}`
      : this.completionsUrl;

    const response = await makeAuthenticatedRequest(url, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch completions");
    }

    const results = await response.json();
    return results.map((completion: any) => ({
      ...completion,
      completedAt: new Date(completion.completedAt),
      habit: completion.habit
        ? {
            ...completion.habit,
            createdAt: new Date(completion.habit.createdAt),
            updatedAt: new Date(completion.habit.updatedAt),
            lastCompleted: completion.habit.lastCompleted
              ? new Date(completion.habit.lastCompleted)
              : undefined,
          }
        : undefined,
    }));
  }

  static async getAllCompletions(): Promise<HabitCompletion[]> {
    const response = await makeAuthenticatedRequest(
      `${this.completionsUrl}?all=true`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch all completions");
    }

    const results = await response.json();
    return results.map((completion: any) => ({
      ...completion,
      completedAt: new Date(completion.completedAt),
      habit: completion.habit
        ? {
            ...completion.habit,
            createdAt: new Date(completion.habit.createdAt),
            updatedAt: new Date(completion.habit.updatedAt),
            lastCompleted: completion.habit.lastCompleted
              ? new Date(completion.habit.lastCompleted)
              : undefined,
          }
        : undefined,
    }));
  }
}
