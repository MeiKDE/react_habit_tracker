# Build a Habit Tracker App with React Native & Appwrite

<div align="center">
  <br />
  <a href="https://youtu.be/YOUR_VIDEO_ID" target="_blank">
    <img src="https://github.com/user-attachments/assets/297ea017-d084-48a1-a064-513d1b6b3d0c" alt="Habit Tracker App Banner">
  </a>
  <br />
  <div>
    <img src="https://img.shields.io/badge/-React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
    <img src="https://img.shields.io/badge/-Expo-000000?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/-Appwrite-2E73D5?style=for-the-badge&logo=appwrite&logoColor=white" alt="Appwrite" />
    <img src="https://img.shields.io/badge/-React_Hooks-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Hooks" />
    <img src="https://img.shields.io/badge/-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  </div>
  <h3 align="center">Build a Habit Tracker App with React Native, Appwrite, and TailwindCSS</h3>
  <div align="center">
    Follow the full video tutorial on 
    <a href="https://youtu.be/YOUR_VIDEO_ID" target="_blank"><b>YouTube</b></a>
  </div>
  <br />
</div>

## 📋 Table of Contents

1. [Introduction](#-introduction)
2. [Tech Stack](#-tech-stack)
3. [Features](#-features)
4. [Quick Start](#-quick-start)
5. [Screenshots](#-screenshots)
6. [Deployment](#-deployment)

---

## 🚀 Introduction

In this tutorial, you'll learn how to build a modern **Habit Tracker** app using **React Native**, **Appwrite**, **Expo**, and **TailwindCSS**. This app allows users to track their daily habits, view streaks, and manage habit completions with a sleek UI.

🎥 Watch the full tutorial: [YouTube](https://youtu.be/YOUR_VIDEO_ID)

---

## ⚙️ Tech Stack

- **React Native** – For building native apps
- **Expo** – For simplifying the React Native development
- **Appwrite** – For backend and real-time database
- **TailwindCSS** – For styling the app with utility-first CSS
- **React Hooks** – For managing component state and side-effects
- **TypeScript (optional)** – Type safety and tooling
- **GitHub & Vercel** – Deployment (for web versions if applicable)

---

## ⚡️ Features

- 🏅 **Habit Streaks**
  Track and visualize your habit streaks with real-time updates.
- ✅ **Add/Complete Habits**
  Add new habits, mark them as completed, and delete them from your list.

- 🔄 **Real-Time Data**
  Sync your habits and completions in real-time with Appwrite.

- 🌑 **Dark Mode Support**
  Use TailwindCSS to implement a beautiful and responsive dark mode.

- 📱 **Responsive Design**
  Use Expo's built-in features to create a mobile-first, responsive design.

- 🚀 **User Authentication**
  Users can sign up, sign in, and manage their authentication state with Appwrite.

---

## 👌 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Appwrite Account](https://appwrite.io/)

### Clone and Run

```bash
git clone https://github.com/yourusername/habit-tracker-react-native.git
cd habit-tracker-react-native
npm install
npm start
```

Your app will be available at: [http://localhost:19002](http://localhost:19002) (for Expo development)

---

## 🖼️ Screenshots

<img src="https://github.com/user-attachments/assets/0d93c0cb-45b1-4c7c-9b77-666ca5f08e3d" width="300" />

<img src="https://github.com/user-attachments/assets/96644c84-3381-45e6-9623-0a1d4d6f3bf0" width="300" />

---

## ☁️ Deployment

### Deploy on Expo

1. Push your code to GitHub
2. Go to [Expo](https://expo.dev/)
3. Import your repository
4. Click **Publish**

Your live app will be hosted on a custom subdomain (e.g. `https://your-name.expo.dev`)

---

## 🔗 Useful Links

- [React Native Documentation](https://reactnative.dev/)
- [Appwrite Documentation](https://appwrite.io/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [GitHub](https://github.com/)

## 🚀 Migration to Prisma + PostgreSQL

This app has been migrated from Appwrite to use Prisma with PostgreSQL for better performance and local development.

### Key Changes Made:

1. **Database Migration**: Replaced Appwrite with PostgreSQL + Prisma ORM
2. **API Routes**: Created REST API endpoints using Expo Router API routes
3. **Type Safety**: Updated TypeScript interfaces to match Prisma schema
4. **Real-time Updates**: Replaced Appwrite real-time with manual refresh (can be enhanced with WebSockets if needed)

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL installed and running
- Expo CLI

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

```bash
# Install and start PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
psql postgres
CREATE DATABASE habit_tracker_db;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE habit_tracker_db TO your_username;
\q
```

### 3. Environment Configuration

```bash
# Copy environment template
cp lib/env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/habit_tracker_db?schema=public"
```

### 4. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Seed with sample data
npm run db:seed
```

### 5. Start the App

```bash
npm start
```

## 📱 Features

- ✅ Create and manage daily, weekly, or monthly habits
- ✅ Track habit completion with streak counters
- ✅ Swipe gestures for quick actions (complete/delete)
- ✅ User authentication
- ✅ Responsive design with React Native Paper

## 🏗️ Architecture

### Database Schema

- **Users**: User accounts and authentication
- **Habits**: Habit definitions with frequency and tracking
- **HabitCompletions**: Individual completion records

### API Endpoints

- `POST /api/habits` - Create new habit
- `GET /api/habits?userId=...` - Get user's habits
- `PUT /api/habits/[id]` - Update habit
- `DELETE /api/habits/[id]` - Delete habit
- `POST /api/completions` - Mark habit as completed
- `GET /api/completions?userId=...` - Get today's completions

### Tech Stack

- **Frontend**: React Native + Expo
- **UI Library**: React Native Paper
- **Database**: PostgreSQL
- **ORM**: Prisma
- **API**: Expo Router API Routes
- **Styling**: NativeWind (Tailwind CSS)

## 🔧 Available Scripts

- `npm start` - Start Expo development server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:reset` - Reset database and run all migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio GUI

## 📝 Migration Notes

### What Was Changed:

1. **Removed Appwrite Dependencies**:

   - `react-native-appwrite` package usage
   - Appwrite client configuration
   - Real-time subscriptions

2. **Added Prisma Integration**:

   - Prisma schema with proper relationships
   - Database client configuration
   - API routes for CRUD operations

3. **Updated Components**:
   - Replaced Appwrite API calls with fetch to local API routes
   - Updated data models to match Prisma schema
   - Improved error handling and loading states

### Benefits of Migration:

- **Better Performance**: Direct database queries vs. API calls
- **Type Safety**: Prisma generates TypeScript types
- **Local Development**: No external service dependencies
- **Flexibility**: Full control over database schema and queries
- **Cost Effective**: No external service costs

## 🚧 Future Enhancements

- [ ] Add real-time updates with WebSockets
- [ ] Implement habit analytics and charts
- [ ] Add habit categories and tags
- [ ] Export/import habit data
- [ ] Push notifications for habit reminders
