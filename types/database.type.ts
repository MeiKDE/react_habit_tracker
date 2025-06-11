export interface User {
  $id: string;
  email: string;
  username: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  $id: string;
  title: string;
  description?: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  streakCount: number;
  lastCompleted?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  completions?: HabitCompletion[];
}

export interface HabitCompletion {
  $id: string;
  completedAt: string;
  notes?: string;
  createdAt: string;
  habitId: string;
  habit?: Habit;
}

export interface CreateHabitData {
  title: string;
  description?: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
}

export interface CreateCompletionData {
  habitId: string;
  completedAt?: string;
  notes?: string;
}

export interface StreakData {
  streak: number;
  bestStreak: number;
  total: number;
}

export interface HabitWithStreak extends Habit {
  streakData: StreakData;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface LegacyUser {
  id: string;
  email: string;
  username: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegacyHabit {
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
  completions?: LegacyHabitCompletion[];
}

export interface LegacyHabitCompletion {
  id: string;
  completedAt: Date;
  notes?: string;
  habitId: string;
  habit?: LegacyHabit;
}
