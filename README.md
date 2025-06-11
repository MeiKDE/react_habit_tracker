# React Native Habit Tracker

A cross-platform habit tracking app built with React Native and Expo, designed to work with a shared Next.js backend.

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

- `POST /api/auth/signup` - Create user account
- `POST /api/auth/signin` - Sign in user
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/[id]` - Update habit
- `DELETE /api/habits/[id]` - Delete habit
- `POST /api/habits/[id]/complete` - Mark habit complete
- `GET /api/habits/[id]/completions` - Get completions

## Troubleshooting

### Connection Issues

1. **"Network request failed"**

   - Ensure Next.js backend is running (`npm run dev`)
   - Check API URL in `config/api.ts`
   - Use connection test in the app

2. **Android Emulator Issues**

   - Use `10.0.2.2` instead of `localhost`
   - Enable network access in emulator settings

3. **Physical Device Issues**
   - Use your computer's IP address
   - Ensure both devices are on the same network
   - Check firewall settings

### Authentication Issues

1. **"Unauthorized" errors**

   - Clear app data and sign in again
   - Check if backend is properly configured
   - Verify JWT token storage

2. **User not found after signup**
   - Check Appwrite connection in Next.js app
   - Verify Appwrite collections are properly set up

## Shared Features with Next.js App

Both the React Native and Next.js apps share:

- User accounts and authentication
- Habit data and progress tracking
- Real-time synchronization
- Consistent data structure
- Same backend API

## Production Deployment

1. Update production API URL in `config/api.ts`
2. Build the app: `expo build`
3. Deploy to app stores or web hosting
4. Ensure backend is deployed and accessible

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both local and remote backends
5. Submit a pull request

## License

MIT License - see LICENSE file for details
