# Backend Setup Guide

This guide will help you connect your React Native Habit Tracker to the Next.js backend.

## Prerequisites

1. Make sure your Next.js habit tracker backend is running
2. Ensure both projects are in the same workspace/directory

## Configuration Steps

### 1. Start the Next.js Backend

Navigate to your Next.js project and start the development server:

```bash
cd nextjs-habit-tracker
npm run dev
```

The backend should be running on `http://localhost:3000`

### 2. Configure API Endpoint

The React Native app is already configured to connect to `http://localhost:3000/api` in development mode.

#### For iOS Simulator

- Uses `localhost:3000` (default configuration)
- No additional setup needed

#### For Android Emulator

- Android emulator needs to use `10.0.2.2` instead of `localhost`
- Update `config/api.ts` if testing on Android emulator:

```typescript
return "http://10.0.2.2:3000/api";
```

#### For Physical Device

- Use your computer's IP address instead of localhost
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Update `config/api.ts`:

```typescript
return "http://YOUR_IP_ADDRESS:3000/api";
```

### 3. Database Setup

Make sure your Next.js backend has the database properly set up:

```bash
cd nextjs-habit-tracker
npm run db:push  # or npm run db:migrate
```

### 4. Test the Connection

1. Start the Next.js backend: `npm run dev`
2. Start the React Native app: `npm start`
3. Try signing up with a new account
4. The app should connect to the backend and create the user in the shared database

## Authentication Flow

The app supports both remote (backend) and local authentication:

- **Remote Auth (Default)**: Uses the Next.js backend with JWT tokens
- **Local Auth (Fallback)**: Stores user data locally if backend is unavailable

You can toggle between modes in the app settings.

## API Endpoints

The following endpoints are available:

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in user
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/[id]` - Update habit
- `DELETE /api/habits/[id]` - Delete habit
- `POST /api/habits/[id]/complete` - Mark habit as complete
- `GET /api/habits/[id]/completions` - Get habit completions

## Troubleshooting

### Connection Issues

1. **"Network request failed"**

   - Check if Next.js backend is running
   - Verify the API URL in `config/api.ts`
   - For physical devices, use your computer's IP address

2. **"Unauthorized" errors**

   - Clear app data and try signing in again
   - Check if JWT tokens are being stored properly

3. **CORS issues**
   - The Next.js backend should handle CORS automatically
   - If issues persist, check Next.js configuration

### Database Issues

1. **"User not found" after signup**

   - Check database connection in Next.js app
   - Verify Prisma schema is up to date
   - Run database migrations

2. **Habits not syncing**
   - Ensure user is properly authenticated
   - Check network connectivity
   - Verify API endpoints are working

## Development Tips

1. Use the iOS Simulator for easiest development (localhost works directly)
2. Check React Native debugger network tab for API requests
3. Monitor Next.js console for backend errors
4. Use Prisma Studio to inspect database: `npm run db:studio`

## Production Deployment

When deploying to production:

1. Update the production API URL in `config/api.ts`
2. Deploy your Next.js backend to a hosting service
3. Update the `getApiUrl()` function to return your production URL
4. Build and deploy your React Native app

## Shared Features

Both the Next.js web app and React Native app now share:

- User authentication and accounts
- Habit data and progress
- Real-time synchronization
- Consistent data structure
