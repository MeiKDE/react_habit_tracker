#!/bin/bash

# Start with Backend - Helper script to run both Next.js backend and React Native app

echo "🚀 Starting Habit Tracker with Backend"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the react-native-habit-tracker directory"
    exit 1
fi

# Check if Next.js backend exists
if [ ! -d "../nextjs-habit-tracker" ]; then
    echo "❌ Error: Next.js backend not found at ../nextjs-habit-tracker"
    echo "Please ensure both projects are in the same parent directory"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo "🔍 Found Next.js backend at: $(cd ../nextjs-habit-tracker && pwd)"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    if [ ! -z "$NEXTJS_PID" ]; then
        kill $NEXTJS_PID 2>/dev/null
        echo "✅ Stopped Next.js backend"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo ""
echo "🌐 Getting network configuration..."
node ./scripts/get-ip.js

echo ""
echo "🔧 Starting Next.js backend..."
cd ../nextjs-habit-tracker

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Next.js dependencies..."
    npm install
fi

# Start Next.js in background
npm run dev &
NEXTJS_PID=$!

echo "✅ Next.js backend started (PID: $NEXTJS_PID)"
echo "🌍 Backend should be available at: http://localhost:3000"

# Wait a moment for Next.js to start
sleep 3

echo ""
echo "📱 Starting React Native app..."
cd ../react-native-habit-tracker

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing React Native dependencies..."
    npm install
fi

echo ""
echo "🎯 Ready to connect!"
echo "==================="
echo "• Next.js backend: http://localhost:3000"
echo "• React Native app starting..."
echo "• Use the connection test in the app to verify connectivity"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Start React Native (this will block)
npm start

# If we get here, React Native has stopped
cleanup 