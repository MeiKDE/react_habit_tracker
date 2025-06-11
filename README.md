# React Native Habit Tracker

A cross-platform habit tracking app built with React Native and Expo, designed to work with a shared Next.js backend.

## 🔐 CRITICAL: Security Setup Required

⚠️ **Before running the app, you MUST set up environment variables!**

All sensitive information has been removed from the codebase for security. You need to create a `.env` file:

### 1. Create `.env` file in the project root:

```bash
# Appwrite Configuration (for setup scripts)
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_actual_project_id_here
APPWRITE_DATABASE_ID=your_actual_database_id_here
APPWRITE_API_KEY=your_actual_api_key_here

# For Expo React Native App
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_actual_project_id_here
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_actual_database_id_here
EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
EXPO_PUBLIC_APPWRITE_HABITS_COLLECTION_ID=habits
EXPO_PUBLIC_APPWRITE_HABIT_COMPLETIONS_COLLECTION_ID=habit_completions

# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8081
EXPO_PUBLIC_FRONTEND_URL=http://localhost:3000

# Testing (optional)
TEST_EMAIL=your_test_email@example.com

# Environment
NODE_ENV=development
```

### 2. Get your values from Appwrite Console:

- **Project ID**: Appwrite Console → Settings → General
- **Database ID**: Appwrite Console → Databases → Your Database
- **API Key**: Appwrite Console → Settings → API Keys (create new server key)

### 3. Files secured:

- ✅ `config/env.ts` - Now requires environment variables
- ✅ `create-appwrite-collections.js` - Uses env vars
- ✅ `debug-appwrite.js` - Uses env vars
- ✅ `test-signin.js` - Uses env vars

⚠️ **NEVER commit the `.env` file to version control!** (It's already in `.gitignore`)

---

## Features

- 📱 Cross-platform (iOS, Android, Web)
- 🔐 User authentication with JWT tokens
- 📊 Habit tracking with streaks
- 🎯 Daily, weekly, and monthly habit frequencies
- 🔄 Real-time sync with backend
- 💾 Local storage fallback
- 🌐 Shared data with Next.js web app

## Backend Integration

This React Native app is designed to work with the `nextjs-habit-tracker` backend, sharing the same database and user accounts.

### Quick Start with Backend

1. **Start both services together:**

   ```bash
   npm run start-with-backend
   ```

2. **Or start manually:**

   ```bash
   # Terminal 1: Start Next.js backend
   cd ../nextjs-habit-tracker
   npm run dev

   # Terminal 2: Start React Native app
   cd react-native-habit-tracker
   npm start
   ```

### Network Configuration

The app automatically detects your development environment:

- **iOS Simulator**: Uses `localhost:3000`
- **Android Emulator**: Use `10.0.2.2:3000` (update `config/api.ts`)
- **Physical Device**: Use your computer's IP address

Get your IP address:

```bash
npm run get-ip
```

### Connection Testing

The app includes a built-in connection test:

1. Open the app
2. On the auth screen, toggle "Show Connection Test"
3. Tap "Test Connection" to verify backend connectivity

## Development Setup

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) or Android Studio
- Next.js habit tracker backend running

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository>
   cd react-native-habit-tracker
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm start
   ```

3. **Run on device/simulator:**
   ```bash
   npm run ios     # iOS Simulator
   npm run android # Android Emulator
   npm run web     # Web browser
   ```

## Configuration

### API Endpoints

Update `config/api.ts` to configure the backend URL:

```typescript
export const getApiUrl = (): string => {
  if (__DEV__) {
    return "http://localhost:3000/api"; // iOS Simulator
    // return 'http://10.0.2.2:3000/api';      // Android Emulator
    // return 'http://YOUR_IP:3000/api';       // Physical Device
  } else {
    return "https://your-domain.com/api"; // Production
  }
};
```

### Authentication Modes

The app supports two authentication modes:

1. **Remote Auth (Default)**: Uses the Next.js backend
2. **Local Auth**: Stores data locally on the device

Toggle between modes in the app settings or auth screen.

## Project Structure

```
react-native-habit-tracker/
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Main habits screen
│   │   ├── add-habit.tsx  # Add new habit
│   │   └── streaks.tsx    # Streaks view
│   ├── auth.tsx           # Authentication screen
│   └── _layout.tsx        # Root layout
├── lib/                   # Core logic
│   ├── auth-context.tsx   # Authentication context
│   ├── habits-context.tsx # Habits management context
│   ├── api-client.ts      # API client for backend
│   └── habits-api.ts      # Habits API with fallback
├── config/                # Configuration
│   └── api.ts             # API endpoints and settings
├── components/            # Reusable components
│   └── ConnectionTest.tsx # Backend connection test
└── scripts/               # Utility scripts
    ├── get-ip.js          # Get local IP address
    └── start-with-backend.sh # Start with backend
```

## API Integration

The app integrates with the following Next.js API endpoints:

- `
