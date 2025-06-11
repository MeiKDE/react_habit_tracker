# 📱 React Native Habit Tracker

<div align="center">

A beautiful, cross-platform habit tracking app built with React Native and Expo, featuring real-time sync with a shared Next.js backend.

[![React Native](https://img.shields.io/badge/React%20Native-0.79.3-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.11-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://typescriptlang.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-16.0.2-red.svg)](https://appwrite.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## ✨ Features

- 📱 **Cross-platform** - iOS, Android, and Web support
- 🔐 **Secure Authentication** - User accounts with JWT tokens
- 📊 **Habit Tracking** - Track daily, weekly, and monthly habits
- 🔥 **Streak Tracking** - Monitor your habit streaks and progress
- 🎯 **Goal Setting** - Set custom frequencies and targets
- 🔄 **Real-time Sync** - Seamless sync with Next.js backend
- 💾 **Offline Support** - Local storage fallback when offline
- 🌐 **Shared Data** - Sync with web app for multi-device access
- 🎨 **Beautiful UI** - Clean, modern interface with animations
- 📈 **Progress Analytics** - Visual progress tracking and insights

## 🔐 Security Setup Required

⚠️ **CRITICAL: Before running the app, you MUST set up environment variables!**

All sensitive information has been removed from the codebase for security. Follow these steps:

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

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (Mac) or Android Studio
- [Next.js habit tracker backend](../nextjs-habit-tracker) running

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd react-native-habit-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables** (see Security Setup above)

4. **Set up Appwrite collections**

   ```bash
   npm run setup
   ```

5. **Start the development server**

   ```bash
   npm start
   ```

6. **Run on your preferred platform**
   ```bash
   npm run ios     # iOS Simulator
   npm run android # Android Emulator
   npm run web     # Web browser
   ```

## 🔧 Backend Integration

This app works seamlessly with the Next.js habit tracker backend, sharing the same database and user accounts.

### Start with Backend

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
- **Android Emulator**: Uses `10.0.2.2:3000`
- **Physical Device**: Uses your computer's IP address

Get your IP address:

```bash
npm run get-ip
```

## 📱 Usage

### Authentication

1. **Sign Up**: Create a new account with email and password
2. **Sign In**: Access your existing account
3. **Secure**: All data is encrypted and stored securely

### Habit Management

1. **Create Habits**: Add new habits with custom frequencies
2. **Track Progress**: Mark habits as complete daily
3. **View Streaks**: Monitor your consistency and streaks
4. **Edit/Delete**: Modify or remove habits as needed

### Connection Testing

The app includes a built-in connection test:

1. Open the app
2. On the auth screen, toggle "Show Connection Test"
3. Tap "Test Connection" to verify backend connectivity

## 🏗️ Project Structure

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
│   ├── auth-appwrite.ts   # Appwrite auth service
│   ├── habits-appwrite.ts # Appwrite habits service
│   └── appwrite.ts        # Appwrite configuration
├── config/                # Configuration
│   ├── env.ts             # Environment variables
│   └── api.ts             # API endpoints and settings
├── components/            # Reusable components
│   └── ConnectionTest.tsx # Backend connection test
├── scripts/               # Utility scripts
│   ├── get-ip.js          # Get local IP address
│   └── start-with-backend.sh # Start with backend
└── types/                 # TypeScript type definitions
```

## 🔌 API Integration

The app integrates with the following Appwrite services:

### Authentication

- **Sign Up**: Create user accounts
- **Sign In**: Authenticate users
- **Sign Out**: Secure logout
- **Session Management**: JWT token handling

### Database Operations

- **Create Habits**: Add new habits to database
- **Read Habits**: Fetch user's habits
- **Update Habits**: Modify existing habits
- **Delete Habits**: Remove habits
- **Track Completions**: Record habit completions
- **Streak Calculation**: Calculate and update streaks

## 📜 Available Scripts

| Script                       | Description                   |
| ---------------------------- | ----------------------------- |
| `npm start`                  | Start Expo development server |
| `npm run ios`                | Run on iOS Simulator          |
| `npm run android`            | Run on Android Emulator       |
| `npm run web`                | Run in web browser            |
| `npm run setup`              | Set up Appwrite collections   |
| `npm run get-ip`             | Get local IP address          |
| `npm run start-with-backend` | Start with Next.js backend    |
| `npm run lint`               | Run ESLint                    |

## 🛠️ Configuration

### Environment Variables

Configure the app behavior through environment variables:

```typescript
// config/env.ts
export const ENV_CONFIG = {
  APPWRITE_ENDPOINT: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  // ... other configurations
};
```

### Network Settings

Update network configuration for different environments:

```typescript
// config/api.ts
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

## 🐛 Troubleshooting

### Connection Issues

**"Network request failed"**

- Ensure Next.js backend is running (`npm run dev`)
- Check API URL in `config/api.ts`
- Use connection test in the app
- Verify firewall settings

**Android Emulator Issues**

- Use `10.0.2.2` instead of `localhost`
- Enable network access in emulator settings
- Check Android network permissions

**Physical Device Issues**

- Use your computer's IP address
- Ensure both devices are on the same network
- Check mobile data restrictions

### Authentication Issues

**"Unauthorized" errors**

- Clear app data and sign in again
- Check if backend is properly configured
- Verify JWT token storage
- Check Appwrite session status

**User not found after signup**

- Check Appwrite connection in backend
- Verify Appwrite collections are set up
- Check database permissions

### Environment Variable Issues

**"Missing required environment variable"**

- Ensure `.env` file exists in project root
- Check all required variables are set
- Verify variable names match exactly
- Restart development server after changes

## 🚢 Production Deployment

### Expo Build

1. **Configure app.json**

   ```json
   {
     "expo": {
       "name": "Habit Tracker",
       "slug": "habit-tracker",
       "version": "1.0.0",
       "orientation": "portrait",
       "platforms": ["ios", "android", "web"]
     }
   }
   ```

2. **Build the app**

   ```bash
   npx expo build:ios     # iOS
   npx expo build:android # Android
   npx expo build:web     # Web
   ```

3. **Deploy**
   - **iOS**: Submit to App Store
   - **Android**: Upload to Google Play
   - **Web**: Deploy to hosting service

### Environment Setup

1. Update production API URLs
2. Set production environment variables
3. Configure production Appwrite instance
4. Test all features thoroughly

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new features
5. **Ensure code quality**
   ```bash
   npm run lint
   ```
6. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
7. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Add proper JSDoc comments
- Ensure responsive design
- Test on multiple platforms

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - For the amazing React Native framework
- [Appwrite](https://appwrite.io/) - For the backend services
- [React Native Paper](https://reactnativepaper.com/) - For UI components
- [NativeWind](https://www.nativewind.dev/) - For styling
- [React Navigation](https://reactnavigation.org/) - For navigation

## 📞 Support

- 📧 **Email**: [your-email@example.com](mailto:your-email@example.com)
- 💬 **Issues**: [GitHub Issues](https://github.com/your-username/habit-tracker/issues)
- 📖 **Documentation**: [Wiki](https://github.com/your-username/habit-tracker/wiki)

---

<div align="center">

**Made with ❤️ for habit tracking enthusiasts**

[⭐ Star this repo](https://github.com/your-username/habit-tracker) if you found it helpful!

</div>
