# Migration from Appwrite to Prisma/PostgreSQL

This document outlines the migration from Appwrite authentication to a custom JWT-based authentication system using Prisma and PostgreSQL.

## What Changed

### Authentication System

- **Before**: Appwrite authentication service
- **After**: Custom JWT-based authentication with Prisma/PostgreSQL

### Key Changes Made

1. **Removed Appwrite Dependencies**

   - Removed `react-native-appwrite` usage
   - Deleted `lib/appwrite.ts` configuration file

2. **Added New Dependencies**

   - `bcryptjs` - For password hashing
   - `jsonwebtoken` - For JWT token generation/verification
   - `@react-native-async-storage/async-storage` - For token storage

3. **Updated Authentication Context** (`lib/auth-context.tsx`)

   - Now uses JWT tokens stored in AsyncStorage
   - API calls to custom endpoints instead of Appwrite
   - Added username requirement for signup

4. **Created Authentication API Endpoints**

   - `app/api/auth/signup+api.ts` - User registration
   - `app/api/auth/signin+api.ts` - User login
   - `app/api/auth/signout+api.ts` - User logout
   - `app/api/auth/me+api.ts` - Get current user

5. **Updated Existing API Endpoints**

   - `app/api/habits+api.ts` - Now uses JWT authentication
   - `app/api/habits/[id]+api.ts` - Added user ownership verification
   - `app/api/completions+api.ts` - Now uses JWT authentication

6. **Created Authentication Utilities**

   - `lib/auth-middleware.ts` - JWT verification middleware
   - `lib/auth-utils.ts` - Helper functions for authenticated requests

7. **Updated Client-Side API** (`lib/habits-api.ts`)

   - Removed manual userId passing
   - Now uses authenticated requests with JWT tokens

8. **Updated Auth Screen** (`app/auth.tsx`)
   - Added username field for signup
   - Updated to handle new signup function signature

## Database Schema

The existing Prisma schema already includes the necessary User model:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  habits    Habit[]
}
```

## Environment Variables

Create a `.env` file based on `lib/env.example`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/habit_tracker_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
EXPO_PUBLIC_API_URL="http://localhost:8081"
```

## Security Improvements

1. **Password Security**: Passwords are now hashed using bcryptjs with salt rounds of 12
2. **JWT Tokens**: Secure token-based authentication with 30-day expiration
3. **User Isolation**: All API endpoints now verify user ownership of resources
4. **Input Validation**: Proper validation of required fields and data types

## API Changes

### Authentication Endpoints

- `POST /api/auth/signup` - Register new user (requires email, username, password)
- `POST /api/auth/signin` - Login user (requires email/username, password)
- `POST /api/auth/signout` - Logout user
- `GET /api/auth/me` - Get current authenticated user

### Habits API Changes

- **Before**: Required `userId` parameter in requests
- **After**: User ID extracted from JWT token automatically

### Completions API Changes

- **Before**: Required `userId` parameter in requests
- **After**: User ID extracted from JWT token automatically

## Migration Steps for Existing Users

If you have existing data from Appwrite, you'll need to:

1. Export user data from Appwrite
2. Hash existing passwords using bcryptjs
3. Import users into PostgreSQL with the new schema
4. Update any existing habit/completion records to use the new user IDs

## Testing the Migration

1. Set up PostgreSQL database
2. Run Prisma migrations: `npm run db:migrate`
3. Start the development server: `npm start`
4. Test user registration and login
5. Verify that habits and completions work with authentication

## Benefits of the Migration

1. **Full Control**: Complete control over authentication logic
2. **Better Performance**: Direct database queries instead of external API calls
3. **Offline Capability**: Better offline support with local token storage
4. **Cost Effective**: No external service fees
5. **Customizable**: Easy to extend with additional features
6. **Security**: Industry-standard JWT authentication with proper password hashing
