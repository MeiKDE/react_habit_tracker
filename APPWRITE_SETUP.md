# Appwrite Setup Guide for React Native Habit Tracker

This guide will help you set up Appwrite for your React Native Habit Tracker app.

## Prerequisites

1. An Appwrite account (sign up at https://cloud.appwrite.io)
2. Node.js installed on your machine
3. React Native development environment set up

## Step 1: Create Appwrite Project

1. Go to https://cloud.appwrite.io/console
2. Create a new project
3. Note down your Project ID

## Step 2: Create Database

1. In your Appwrite console, go to "Databases"
2. Create a new database
3. Note down your Database ID

## Step 3: Generate API Key

1. Go to "Settings" > "API Keys"
2. Create a new API key with the following scopes:
   - `users.read`
   - `users.write`
   - `databases.read`
   - `databases.write`
3. Note down your API key

## Step 4: Configure Environment Variables

Update the `app.json` file with your Appwrite credentials:

```json
{
  "expo": {
    "extra": {
      "APPWRITE_ENDPOINT": "https://cloud.appwrite.io/v1",
      "APPWRITE_PROJECT_ID": "your-project-id-here",
      "APPWRITE_DATABASE_ID": "your-database-id-here",
      "APPWRITE_USERS_COLLECTION_ID": "users",
      "APPWRITE_HABITS_COLLECTION_ID": "habits",
      "APPWRITE_HABIT_COMPLETIONS_COLLECTION_ID": "habit_completions"
    }
  }
}
```

## Step 5: Update Collection Setup Script

Edit `create-appwrite-collections.js` and update the configuration:

```javascript
const APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = "your-project-id-here"; // Your actual project ID
const APPWRITE_API_KEY = "your-appwrite-api-key-here"; // Your API key
const DATABASE_ID = "your-database-id-here"; // Your database ID
```

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Create Collections

Run the setup script to create the required collections:

```bash
npm run setup
```

This will create:

- Users collection
- Habits collection
- Habit Completions collection

## Step 8: Configure Platform Settings

### iOS Configuration

The app.json already includes the necessary iOS configuration for Appwrite:

```json
"ios": {
  "infoPlist": {
    "NSAppTransportSecurity": {
      "NSAllowsArbitraryLoads": false,
      "NSExceptionDomains": {
        "cloud.appwrite.io": {
          "NSExceptionRequiresForwardSecrecy": false,
          "NSExceptionMinimumTLSVersion": "1.2",
          "NSIncludesSubdomains": true
        }
      }
    }
  }
}
```

### Android Configuration

The app.json includes the necessary Android permissions:

```json
"android": {
  "permissions": ["android.permission.INTERNET"],
  "usesCleartextTraffic": false
}
```

## Step 9: Test the Setup

1. Start your development server:

   ```bash
   npm start
   ```

2. Run on your preferred platform:

   ```bash
   npm run ios
   # or
   npm run android
   ```

3. Try creating an account and logging in

## Key Changes Made

### 1. Updated Dependencies

- Added `appwrite` SDK
- Added `zod` for validation

### 2. New Files Created

- `lib/appwrite.ts` - Main Appwrite configuration
- `lib/auth-appwrite.ts` - Authentication service using Appwrite
- `lib/habits-appwrite.ts` - Habits service using Appwrite
- `create-appwrite-collections.js` - Script to set up database collections

### 3. Updated Files

- `lib/auth-context.tsx` - Now uses Appwrite authentication
- `lib/habits-context.tsx` - Now uses Appwrite for data management
- `types/database.type.ts` - Updated to match Appwrite structure with `$id` fields
- `app.json` - Added Appwrite configuration and network security settings
- `package.json` - Added new dependencies and setup script

### 4. Data Structure Changes

- User IDs now use Appwrite's `$id` format
- Dates are stored as ISO strings instead of Date objects
- All entities use Appwrite's document structure

## Troubleshooting

### Common Issues

1. **"Unable to resolve path to module 'appwrite'"**

   - Run `npm install` to install dependencies

2. **Collection creation fails**

   - Verify your API key has the correct permissions
   - Check that your project ID and database ID are correct

3. **Authentication fails**

   - Ensure your project ID is correct in app.json
   - Check that the Appwrite endpoint is accessible

4. **Network errors on iOS**
   - Verify the NSAppTransportSecurity configuration in app.json

### Getting Help

- Check the Appwrite documentation: https://appwrite.io/docs
- Join the Appwrite Discord: https://discord.gg/appwrite
- Review the console logs for detailed error messages

## Next Steps

After setup is complete, you can:

1. Customize the habit colors and categories
2. Add more fields to the habit model
3. Implement additional features like reminders
4. Add data export/import functionality
5. Implement offline support with local caching
