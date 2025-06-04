# Prisma & PostgreSQL Setup Guide

This guide will help you set up Prisma with PostgreSQL for your habit tracker app.

## Prerequisites

1. **PostgreSQL Installation**

   - Install PostgreSQL on your system
   - For macOS: `brew install postgresql`
   - For Windows: Download from [postgresql.org](https://www.postgresql.org/download/)
   - For Ubuntu: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL Service**
   - macOS: `brew services start postgresql`
   - Ubuntu: `sudo service postgresql start`
   - Windows: PostgreSQL should start automatically

## Setup Steps

### 1. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE habit_tracker_db;

# Create user (optional, or use existing user)
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE habit_tracker_db TO your_username;

# Exit psql
\q
```

### 2. Environment Configuration

```bash
# Copy the environment example
cp lib/env.example .env
```

Then edit `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/habit_tracker_db?schema=public"
```

### 3. Install Required Dependencies

```bash
# Install tsx for running TypeScript files
npm install --save-dev tsx
```

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Run Database Migration

```bash
# Create and run first migration
npm run db:migrate

# Or push schema directly (for development)
npm run db:push
```

### 6. Seed Database (Optional)

```bash
npm run db:seed
```

### 7. View Database (Optional)

```bash
npm run db:studio
```

## Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:reset` - Reset database and run all migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio GUI

## Database Schema

### Users Table

- `id` - Unique identifier
- `email` - User email (unique)
- `username` - Username (unique)
- `password` - Hashed password
- `name` - Optional display name
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Habits Table

- `id` - Unique identifier
- `title` - Habit title
- `description` - Optional description
- `color` - Color for UI (default: #3B82F6)
- `isActive` - Whether habit is active
- `userId` - Reference to user
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Habit Completions Table

- `id` - Unique identifier
- `completedAt` - Completion timestamp
- `notes` - Optional completion notes
- `habitId` - Reference to habit

## Usage in Code

```typescript
import { prisma } from "@/lib/prisma";

// Create a new habit
const habit = await prisma.habit.create({
  data: {
    title: "Drink Water",
    description: "Drink 8 glasses of water",
    userId: "user_id_here",
  },
});

// Get user's habits
const habits = await prisma.habit.findMany({
  where: { userId: "user_id_here" },
  include: { completions: true },
});
```

## Troubleshooting

### Connection Issues

- Ensure PostgreSQL is running
- Check your DATABASE_URL in .env
- Verify database and user exist

### Migration Issues

- Run `npm run db:reset` to start fresh
- Check for syntax errors in schema.prisma

### Permission Issues

- Ensure your database user has proper permissions
- Check PostgreSQL logs for detailed errors

## Next Steps

1. Set up your PostgreSQL database
2. Configure your .env file
3. Run the setup commands
4. Start building your habit tracker API endpoints!
