# Connection Troubleshooting Guide

## "Failed to fetch" Error Solutions

If you're seeing errors like:

```
[API CLIENT] API request failed for /auth/signin: TypeError: Failed to fetch
[AUTH] Remote signin error: TypeError: Failed to fetch
```

This means your React Native app cannot connect to the Next.js backend. Here's how to fix it:

## Step 1: Verify Backend is Running

First, make sure your Next.js backend is running:

```bash
cd ../nextjs-habit-tracker
npm run dev
```

You should see output like:

```
✓ Ready on http://localhost:3000
```

## Step 2: Choose the Correct API URL

The API URL depends on what device/platform you're using:

### For iOS Simulator

```typescript
// config/api.ts
return "http://localhost:3000/api";
```

### For Android Emulator

```typescript
// config/api.ts
return "http://10.0.2.2:3000/api";
```

### For Physical Device (iPhone/Android)

```typescript
// config/api.ts
return "http://YOUR_COMPUTER_IP:3000/api";
```

## Step 3: Find Your Computer's IP Address

Run this command to find your IP:

```bash
npm run get-ip
```

This will show you all available IP addresses and give you the exact configuration to use.

## Step 4: Update Configuration

Edit `config/api.ts` and update the `getApiUrl()` function:

```typescript
export const getApiUrl = (): string => {
  if (__DEV__) {
    // Choose ONE of these options:

    // iOS Simulator
    return "http://localhost:3000/api";

    // Android Emulator
    // return "http://10.0.2.2:3000/api";

    // Physical Device (replace with your IP)
    // return "http://192.168.1.XXX:3000/api";
  } else {
    return "https://your-production-domain.com/api";
  }
};
```

## Step 5: Test the Connection

1. Open your React Native app
2. Go to the Auth screen
3. Toggle "Show Connection Test" to ON
4. Tap "Test Connection"
5. You should see ✅ success message

## Common Issues and Solutions

### Issue: "Network request failed"

**Solution:** Your device can't reach the backend server.

- Make sure backend is running (`npm run dev`)
- Check your IP address is correct
- Ensure your device and computer are on the same network

### Issue: "Request timeout"

**Solution:** The request is taking too long.

- Check your internet connection
- Make sure the backend is responding
- Try a different API URL configuration

### Issue: "Cannot connect to server"

**Solution:** The URL is incorrect or server is down.

- Verify the backend URL is correct
- Test the backend in a web browser: `http://localhost:3000`
- Make sure ports aren't blocked by firewall

### Issue: Backend returns HTML instead of JSON

**Solution:** You might be hitting the wrong endpoint.

- Make sure your backend has API routes at `/api/auth/signin`
- Check the backend console for errors
- Verify the backend is properly configured

## Quick Configuration Examples

### macOS/iOS Development

```typescript
return "http://localhost:3000/api";
```

### Windows/Android Development

```typescript
return "http://10.0.2.2:3000/api"; // For emulator
// or
return "http://192.168.1.XXX:3000/api"; // For physical device
```

### Linux Development

```typescript
return "http://localhost:3000/api"; // For simulator
// or
return "http://YOUR_IP:3000/api"; // For physical device
```

## Testing Your Setup

After making changes:

1. Restart your React Native app
2. Clear app cache if needed
3. Test with the Connection Test component
4. Try signing in with test credentials

## Still Having Issues?

1. Check the React Native console for error messages
2. Check the Next.js backend console for errors
3. Use the browser to test the API directly:
   - Visit `http://localhost:3000/api/habits` (should return 401 or JSON)
4. Make sure no firewall is blocking the connection

## Advanced Debugging

Enable detailed logging by checking the console output:

- React Native: Use React Native debugger or console.log output
- Backend: Check the Next.js terminal for API requests
- Network: Use network inspection tools to see actual HTTP requests
