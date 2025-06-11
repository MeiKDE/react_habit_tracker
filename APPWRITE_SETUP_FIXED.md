# React Native Appwrite Setup - Fixed Configuration

## Overview

This document outlines the fixes applied to make Appwrite work in React Native following the same patterns as the working NextJS implementation.

## Key Issues Fixed

### 1. Environment Variables

**Problem**: React Native was using `NEXT_PUBLIC_` prefixes instead of `EXPO_PUBLIC_`
**Solution**: Updated `.env` file with correct prefixes:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
EXPO_PUBLIC_APPWRITE_PROJECT_ID="683db415003b8b011313"
EXPO_PUBLIC_APPWRITE_DATABASE_ID="683e6cb10010f47ea863"
EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID="users"
EXPO_PUBLIC_APPWRITE_HABITS_COLLECTION_ID="habits"
EXPO_PUBLIC_APPWRITE_HABIT_COMPLETIONS_COLLECTION_ID="habit_completions"
EXPO_PUBLIC_FRONTEND_URL="http://localhost:3000"
EXPO_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV="development"
```

### 2. Centralized Environment Configuration

**Problem**: Multiple conflicting environment configurations
**Solution**: Created `config/env.ts` with centralized configuration:

- Handles both `Constants.expoConfig.extra` and `process.env`
- Provides validation and debugging functions
- Matches NextJS environment structure

### 3. API URL Configuration

**Problem**: React Native was connecting to port 3002 instead of 3000
**Solution**: Updated `config/api.ts`:

- Changed default API URL from `http://192.168.1.106:3002/api` to `http://localhost:3000/api`
- Added environment-based URL configuration
- Added network debugging helpers
- Improved error handling and logging

### 4. App Configuration

**Problem**: Conflicting environment variables in `app.json`
**Solution**:

- Removed hardcoded environment variables from `app.json`
- Added network security exceptions for both `cloud.appwrite.io` and `fra.cloud.appwrite.io`
- Enabled cleartext traffic for Android development
- Added localhost exception for iOS development

### 5. Appwrite Client Configuration

**Problem**: Complex configuration with multiple fallbacks
**Solution**: Updated `lib/appwrite.ts`:

- Uses centralized `ENV_CONFIG` from `config/env.ts`
- Matches NextJS structure exactly
- Added configuration validation on import
- Improved error handling and logging

## Files Modified

1. **`config/env.ts`** - New centralized environment configuration
2. **`config/api.ts`** - Fixed API URL and added debugging
3. **`lib/appwrite.ts`** - Simplified configuration using centralized env
4. **`app.json`** - Removed conflicts, added network permissions
5. **`.env`** - Updated with correct `EXPO_PUBLIC_` prefixes

## Configuration Options

### Development Setup

Choose the appropriate API URL based on your setup:

```typescript
// Option 1: iOS Simulator (recommended)
return "http://localhost:3000/api";

// Option 2: Android Emulator
return "http://10.0.2.2:3000/api";

// Option 3: Physical Device (update with your computer's IP)
return "http://192.168.1.106:3000/api";
```

## Testing the Configuration

1. **Start NextJS Server**:

   ```bash
   cd ../nextjs-habit-tracker
   npm run dev
   ```

2. **Start React Native App**:

   ```bash
   cd react-native-habit-tracker
   npm start
   ```

3. **Test Authentication**:
   - Try signing in with existing credentials
   - Check console logs for detailed debugging information
   - All Appwrite operations should now work consistently

## Key Improvements

### Authentication Flow

1. **Direct Appwrite Authentication**: Primary authentication using Appwrite SDK
2. **JWT Token Support**: Secondary authentication for API endpoints
3. **Consistent Error Handling**: Improved error messages and logging

### Network Configuration

1. **Proper CORS Support**: Added localhost exceptions for development
2. **SSL/TLS Configuration**: Proper certificates for Appwrite cloud
3. **Debug Helpers**: Network connectivity testing functions

### Environment Management

1. **Validation**: Environment variables are validated on app start
2. **Debugging**: Detailed logging of configuration values
3. **Fallbacks**: Proper fallback values for all configurations

## Troubleshooting

### Common Issues

1. **Connection Failed**:

   - Verify NextJS server is running on port 3000
   - Check firewall settings
   - For Android emulator, use `10.0.2.2:3000`
   - For physical device, use computer's IP address

2. **Authentication Errors**:

   - Check Appwrite console for project settings
   - Verify collection IDs match between projects
   - Check environment variables are properly loaded

3. **Network Errors**:
   - Enable cleartext traffic in Android settings
   - Add localhost exception for iOS
   - Verify API endpoints are accessible

### Debug Commands

```bash
# Check environment variables
npx expo config --type public

# View detailed logs
npx expo start --clear
```

## Next Steps

1. Test the authentication flow in your React Native app
2. Verify habit creation and management works
3. Test on both iOS and Android platforms
4. Update IP addresses for physical device testing if needed

The React Native app should now work consistently with Appwrite, following the same patterns as the NextJS implementation.
