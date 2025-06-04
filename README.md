# Build a Habit Tracker App with React Native

<div align="center">
  <br />
    <a href="https://youtu.be/your-video-link" target="_blank">
      <img src="https://github.com/your-username/your-repo/assets/your-asset-id/your-image.png" alt="Project Banner">
    </a>
  <br />

  <div>
    <img src="https://img.shields.io/badge/-React_Native-black?style=for-the-badge&logoColor=white&logo=react&color=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/-Expo-black?style=for-the-badge&logoColor=white&logo=expo&color=000020" alt="Expo" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="TypeScript" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="TailwindCSS" />
  </div>

  <h3 align="center">Build a Habit Tracker App with React Native and TailwindCSS</h3>

   <div align="center">
     A modern habit tracking app built with React Native, Expo, and TailwindCSS for local habit management.
    </div>
</div>

## <a name="introduction">🤖 Introduction</a>

In this tutorial, you'll learn how to build a modern **Habit Tracker** app using **React Native**, **Expo**, and **TailwindCSS**. This app allows users to track their daily habits, view streaks, and manage habit completions with a sleek UI and local storage.

## <a name="tech-stack">⚙️ Tech Stack</a>

- **React Native** – Cross-platform mobile development
- **Expo** – Development platform and tools
- **TypeScript** – Type safety and better development experience
- **TailwindCSS** – Utility-first CSS framework
- **AsyncStorage** – Local data persistence
- **React Navigation** – Navigation between screens

## <a name="features">🔋 Features</a>

👉 **Habit Management**: Create, edit, and delete habits with ease

👉 **Daily Tracking**: Mark habits as complete for each day

👉 **Streak Tracking**: View your current streak for each habit

👉 **Local Storage**: All data is stored locally on your device

👉 **User Authentication**: Simple local authentication system

👉 **Modern UI**: Clean and intuitive interface built with TailwindCSS

👉 **Cross-Platform**: Works on both iOS and Android

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

**Cloning the Repository**

```bash
git clone https://github.com/your-username/habit-tracker.git
cd habit-tracker/react-native-habit-tracker
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Running the Project**

```bash
npm start
```

This will start the Expo development server. You can then:

- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go app on your phone

## <a name="snippets">🕸️ Code Snippets</a>

<details>
<summary><code>lib/habits-storage.ts</code></summary>

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Habit {
  id: string;
  title: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  createdAt: Date;
}

export class HabitsStorage {
  private static HABITS_KEY = "@habits";
  private static COMPLETIONS_KEY = "@habit_completions";

  static async createHabit(data: CreateHabitData): Promise<Habit> {
    const habits = await this.getUserHabits();
    const newHabit: Habit = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    habits.push(newHabit);
    await AsyncStorage.setItem(this.HABITS_KEY, JSON.stringify(habits));
    return newHabit;
  }

  static async getUserHabits(): Promise<Habit[]> {
    try {
      const habitsJson = await AsyncStorage.getItem(this.HABITS_KEY);
      return habitsJson ? JSON.parse(habitsJson) : [];
    } catch (error) {
      console.error("Error getting habits:", error);
      return [];
    }
  }
}
```

</details>

<details>
<summary><code>lib/auth-context.tsx</code></summary>

```typescript
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  email: string;
  username: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  isLoadingUser: boolean;
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  // Implementation details...
}
```

</details>

## <a name="links">🔗 Links</a>

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)

---

## 🚀 Local Storage Implementation

This app uses AsyncStorage for local data persistence, providing a simple and effective way to store user data without requiring a backend server.

### Key Features:

1. **Local Data Storage**: All habits and completions are stored locally on the device
2. **Offline Functionality**: Works completely offline
3. **Simple Authentication**: Local user management system
4. **Data Persistence**: Data persists between app sessions

### Data Structure:

- **Habits**: Stored with unique IDs, titles, descriptions, and metadata
- **Completions**: Track daily habit completions with date stamps
- **User Data**: Simple local user authentication and profile management

### Benefits:

1. **No Backend Required**: Eliminates the need for server infrastructure
2. **Privacy**: All data stays on the user's device
3. **Performance**: Fast data access and updates
4. **Simplicity**: Easy to implement and maintain
5. **Offline First**: Works without internet connection

### Technical Implementation:

- **Storage Layer**: AsyncStorage for React Native
- **Data Models**: TypeScript interfaces for type safety
- **Error Handling**: Comprehensive error handling for storage operations
- **Data Migration**: Support for future data structure changes

This approach makes the app lightweight, private, and easy to deploy while providing all the core functionality needed for habit tracking.
