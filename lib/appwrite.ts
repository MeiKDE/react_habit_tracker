import { Client, Account, Databases, ID, Query } from "appwrite";
import Constants from "expo-constants";

// Environment variables configuration
const APPWRITE_ENDPOINT =
  Constants.expoConfig?.extra?.APPWRITE_ENDPOINT ||
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
  "https://fra.cloud.appwrite.io/v1";

const APPWRITE_PROJECT_ID =
  Constants.expoConfig?.extra?.APPWRITE_PROJECT_ID ||
  process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ||
  "";

const APPWRITE_DATABASE_ID =
  Constants.expoConfig?.extra?.APPWRITE_DATABASE_ID ||
  process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ||
  "";

// Collections IDs
export const COLLECTIONS = {
  USERS:
    Constants.expoConfig?.extra?.APPWRITE_USERS_COLLECTION_ID ||
    process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID ||
    "users",
  HABITS:
    Constants.expoConfig?.extra?.APPWRITE_HABITS_COLLECTION_ID ||
    process.env.EXPO_PUBLIC_APPWRITE_HABITS_COLLECTION_ID ||
    "habits",
  HABIT_COMPLETIONS:
    Constants.expoConfig?.extra?.APPWRITE_HABIT_COMPLETIONS_COLLECTION_ID ||
    process.env.EXPO_PUBLIC_APPWRITE_HABIT_COMPLETIONS_COLLECTION_ID ||
    "habit_completions",
};

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);

// Helper constants
export const DATABASE_ID = APPWRITE_DATABASE_ID;
export { ID, Query };

// Configuration helper
export const CONFIG = {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  COLLECTIONS,
};

// Helper function for logging (only in development)
export const log = (message: string, ...args: any[]): void => {
  if (__DEV__) {
    console.log(`[Appwrite] ${message}`, ...args);
  }
};

// Helper function for error logging
export const logError = (message: string, error: any): void => {
  console.error(`[Appwrite Error] ${message}`, error);
};

// Types for Appwrite collections (matching Next.js structure)
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

// Additional types matching Next.js
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

// Auth types
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

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}
