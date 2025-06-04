# API Setup Guide - React Native Habit Tracker

This guide explains how to connect your React Native Habit Tracker app to the Next.js backend.

## Overview

The React Native app now includes a complete API client that can connect to your Next.js habit tracker backend. The app supports both remote API calls and local storage fallback for offline functionality.

## Files Added/Modified

### New Files

- `lib/api-client.ts` - Main API client for HTTP requests to Next.js backend
- `lib/config.ts` - Configuration settings for API endpoints and app settings
- `API_SETUP.md` - This setup guide

### Modified Files

- `lib/habits-api.ts` - Updated to use remote API with local fallback
- `lib/auth-context.tsx` - Updated to support remote authentication

## Configuration

### 1. Update API Base URL

Edit `lib/config.ts` and update the production URL:

```typescript
export const CONFIG = {
  API: {
    BASE_URL: __DEV__
      ? "http://localhost:3000/api" // Development
      : "https://your-production-url.com/api", // Replace with your actual domain
  },
  // ... rest of config
};
```

### 2. Development Setup

For local development, make sure your Next.js backend is running on `http://localhost:3000`. If you're using a different port, update the development URL in the config.

### 3. Network Configuration for Simulators/Emulators

#### iOS Simulator

- Use `http://localhost:3000/api` (works out of the box)

#### Android Emulator

- Use `http://10.0.2.2:3000/api` instead of localhost
- Update the development URL in `lib/config.ts`:

```typescript
BASE_URL: __DEV__
  ? "http://10.0.2.2:3000/api" // Android emulator
  : "https://your-production-url.com/api",
```

#### Physical Device

- Use your computer's IP address: `http://192.168.1.XXX:3000/api`
- Find your IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

## API Features

### Authentication

- Remote signup/signin with JWT token storage
- Local authentication fallback
- Automatic token management
- Session persistence

### Habits Management

- Create, read, update, delete habits
- Habit completion tracking
- Streak counting
- Color assignment

### Data Synchronization

- Automatic fallback to local storage if API is unavailable
- Seamless switching between remote and local modes
- Type-safe API responses

## Usage

### Basic API Usage

```typescript
import { HabitsAPI } from "./lib/habits-api";

// Create a new habit
const habit = await HabitsAPI.createHabit({
  title: "Morning Exercise",
  description: "30 minutes of cardio",
  frequency: "DAILY",
});

// Get all habits
const habits = await HabitsAPI.getUserHabits();

// Mark habit as complete
await HabitsAPI.createCompletion({
  habitId: habit.id,
  notes: "Great workout today!",
});
```

### Authentication Usage

```typescript
import { useAuth } from "./lib/auth-context";

function LoginScreen() {
  const { signIn, signUp, user, isUsingRemoteAuth, setUseRemoteAuth } =
    useAuth();

  // Sign in user
  const error = await signIn(email, password);

  // Toggle between remote and local auth
  setUseRemoteAuth(false); // Use local auth only
}
```

### Configuration Management

```typescript
import { HabitsAPI } from "./lib/habits-api";

// Switch to local-only mode
HabitsAPI.setUseRemoteAPI(false);

// Check current mode
const isUsingRemote = HabitsAPI.isUsingRemoteAPI();
```

## API Endpoints

The app expects these endpoints on your Next.js backend:

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### Habits

- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Completions

- `POST /api/habits/:id/completions` - Mark habit complete
- `GET /api/habits/:id/completions` - Get habit completions

## Data Types

### Habit

```typescript
interface Habit {
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
```

### HabitCompletion

```typescript
interface HabitCompletion {
  id: string;
  completedAt: Date;
  notes?: string;
  createdAt: Date;
  habitId: string;
  habit?: Habit;
}
```

## Error Handling

The API client includes comprehensive error handling:

1. **Network Errors**: Automatic fallback to local storage
2. **Authentication Errors**: Clear error messages
3. **Validation Errors**: Detailed error information
4. **Server Errors**: Graceful degradation

## Security

- JWT tokens are stored securely in AsyncStorage
- Automatic token attachment to authenticated requests
- Token cleanup on logout
- Secure fallback to local authentication

## Troubleshooting

### Common Issues

1. **Connection Refused**

   - Check if Next.js backend is running
   - Verify the API base URL
   - Check network connectivity

2. **CORS Errors**

   - Configure CORS in your Next.js backend
   - Add your React Native app's origin to allowed origins

3. **Authentication Failures**

   - Check if auth endpoints match expected format
   - Verify JWT token handling in backend

4. **Type Errors**
   - Ensure backend response format matches expected types
   - Check date serialization/deserialization

### Debug Mode

Enable debug logging by setting `CONFIG.DEBUG.ENABLE_LOGGING = true` in development.

## Production Deployment

1. Update the production API URL in `lib/config.ts`
2. Ensure your backend is deployed and accessible
3. Configure proper CORS settings
4. Set up SSL/HTTPS for secure communication
5. Test authentication flow end-to-end

## Next Steps

1. Test the API integration with your Next.js backend
2. Customize the UI to show connection status
3. Add offline sync capabilities
4. Implement push notifications
5. Add data export/import features

For more information, refer to the individual file documentation and the Next.js backend API documentation.
