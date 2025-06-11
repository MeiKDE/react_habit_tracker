const { Client, Databases, Permission, Role } = require("node-appwrite");
require("dotenv").config();

// Configuration from environment variables
const APPWRITE_ENDPOINT =
  process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

// Validate required environment variables
if (!APPWRITE_PROJECT_ID) {
  console.error("❌ Missing APPWRITE_PROJECT_ID environment variable");
  process.exit(1);
}

if (!APPWRITE_API_KEY) {
  console.error("❌ Missing APPWRITE_API_KEY environment variable");
  process.exit(1);
}

if (!DATABASE_ID) {
  console.error("❌ Missing APPWRITE_DATABASE_ID environment variable");
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function checkCollectionExists(collectionId) {
  try {
    await databases.getCollection(DATABASE_ID, collectionId);
    return true;
  } catch (error) {
    return false;
  }
}

async function createCollectionSafely(collectionId, name, permissions) {
  const exists = await checkCollectionExists(collectionId);
  if (exists) {
    console.log(`⚠️  Collection "${name}" already exists, skipping creation`);
    return null;
  }

  try {
    const collection = await databases.createCollection(
      DATABASE_ID,
      collectionId,
      name,
      permissions
    );
    console.log(`✅ ${name} collection created`);
    return collection;
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️  Collection "${name}" already exists, skipping creation`);
      return null;
    }
    throw error;
  }
}

async function createAttributeSafely(
  collectionId,
  attributeId,
  createFunction
) {
  try {
    await createFunction();
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️  Attribute "${attributeId}" already exists, skipping`);
    } else {
      console.error(
        `❌ Error creating attribute "${attributeId}":`,
        error.message
      );
    }
  }
}

async function createIndexSafely(collectionId, indexId, createFunction) {
  try {
    await createFunction();
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️  Index "${indexId}" already exists, skipping`);
    } else {
      console.error(`❌ Error creating index "${indexId}":`, error.message);
    }
  }
}

async function createCollections() {
  try {
    console.log("Starting Appwrite collections setup...\n");

    const permissions = [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ];

    // 1. Create Users Collection
    console.log("Creating Users collection...");
    await createCollectionSafely("users", "Users", permissions);

    // Add attributes to Users collection
    console.log("Creating Users collection attributes...");
    await createAttributeSafely("users", "email", () =>
      databases.createStringAttribute(DATABASE_ID, "users", "email", 255, true)
    );
    await createAttributeSafely("users", "username", () =>
      databases.createStringAttribute(
        DATABASE_ID,
        "users",
        "username",
        255,
        true
      )
    );
    await createAttributeSafely("users", "name", () =>
      databases.createStringAttribute(DATABASE_ID, "users", "name", 255, false)
    );
    await createAttributeSafely("users", "createdAt", () =>
      databases.createDatetimeAttribute(DATABASE_ID, "users", "createdAt", true)
    );
    await createAttributeSafely("users", "updatedAt", () =>
      databases.createDatetimeAttribute(DATABASE_ID, "users", "updatedAt", true)
    );
    console.log("✅ Users collection attributes processed");

    // Create indexes for unique fields
    console.log("Creating Users collection indexes...");
    await createIndexSafely("users", "email_unique", () =>
      databases.createIndex(DATABASE_ID, "users", "email_unique", "unique", [
        "email",
      ])
    );
    await createIndexSafely("users", "username_unique", () =>
      databases.createIndex(DATABASE_ID, "users", "username_unique", "unique", [
        "username",
      ])
    );
    console.log("✅ Users collection indexes processed");

    // 2. Create Habits Collection
    console.log("\nCreating Habits collection...");
    await createCollectionSafely("habits", "Habits", permissions);

    // Add attributes to Habits collection
    console.log("Creating Habits collection attributes...");
    await createAttributeSafely("habits", "title", () =>
      databases.createStringAttribute(DATABASE_ID, "habits", "title", 255, true)
    );
    await createAttributeSafely("habits", "description", () =>
      databases.createStringAttribute(
        DATABASE_ID,
        "habits",
        "description",
        1000,
        false
      )
    );
    await createAttributeSafely("habits", "frequency", () =>
      databases.createEnumAttribute(
        DATABASE_ID,
        "habits",
        "frequency",
        ["DAILY", "WEEKLY", "MONTHLY"],
        true
      )
    );
    await createAttributeSafely("habits", "streakCount", () =>
      databases.createIntegerAttribute(
        DATABASE_ID,
        "habits",
        "streakCount",
        true,
        0,
        undefined
      )
    );
    await createAttributeSafely("habits", "lastCompleted", () =>
      databases.createDatetimeAttribute(
        DATABASE_ID,
        "habits",
        "lastCompleted",
        false
      )
    );
    await createAttributeSafely("habits", "color", () =>
      databases.createStringAttribute(DATABASE_ID, "habits", "color", 7, true)
    );
    await createAttributeSafely("habits", "isActive", () =>
      databases.createBooleanAttribute(DATABASE_ID, "habits", "isActive", true)
    );
    await createAttributeSafely("habits", "createdAt", () =>
      databases.createDatetimeAttribute(
        DATABASE_ID,
        "habits",
        "createdAt",
        true
      )
    );
    await createAttributeSafely("habits", "updatedAt", () =>
      databases.createDatetimeAttribute(
        DATABASE_ID,
        "habits",
        "updatedAt",
        true
      )
    );
    await createAttributeSafely("habits", "userId", () =>
      databases.createStringAttribute(
        DATABASE_ID,
        "habits",
        "userId",
        255,
        true
      )
    );
    console.log("✅ Habits collection attributes processed");

    // Create indexes for Habits collection
    console.log("Creating Habits collection indexes...");
    await createIndexSafely("habits", "userId_index", () =>
      databases.createIndex(DATABASE_ID, "habits", "userId_index", "key", [
        "userId",
      ])
    );
    await createIndexSafely("habits", "isActive_index", () =>
      databases.createIndex(DATABASE_ID, "habits", "isActive_index", "key", [
        "isActive",
      ])
    );
    await createIndexSafely("habits", "createdAt_index", () =>
      databases.createIndex(DATABASE_ID, "habits", "createdAt_index", "key", [
        "createdAt",
      ])
    );
    console.log("✅ Habits collection indexes processed");

    // 3. Create Habit Completions Collection
    console.log("\nCreating Habit Completions collection...");
    await createCollectionSafely(
      "habit_completions",
      "Habit Completions",
      permissions
    );

    // Add attributes to Habit Completions collection
    console.log("Creating Habit Completions collection attributes...");
    await createAttributeSafely("habit_completions", "habitId", () =>
      databases.createStringAttribute(
        DATABASE_ID,
        "habit_completions",
        "habitId",
        255,
        true
      )
    );
    await createAttributeSafely("habit_completions", "completedAt", () =>
      databases.createDatetimeAttribute(
        DATABASE_ID,
        "habit_completions",
        "completedAt",
        true
      )
    );
    await createAttributeSafely("habit_completions", "notes", () =>
      databases.createStringAttribute(
        DATABASE_ID,
        "habit_completions",
        "notes",
        1000,
        false
      )
    );
    await createAttributeSafely("habit_completions", "createdAt", () =>
      databases.createDatetimeAttribute(
        DATABASE_ID,
        "habit_completions",
        "createdAt",
        true
      )
    );
    console.log("✅ Habit Completions collection attributes processed");

    // Create indexes for Habit Completions collection
    console.log("Creating Habit Completions collection indexes...");
    await createIndexSafely("habit_completions", "habitId_index", () =>
      databases.createIndex(
        DATABASE_ID,
        "habit_completions",
        "habitId_index",
        "key",
        ["habitId"]
      )
    );
    await createIndexSafely("habit_completions", "completedAt_index", () =>
      databases.createIndex(
        DATABASE_ID,
        "habit_completions",
        "completedAt_index",
        "key",
        ["completedAt"]
      )
    );
    console.log("✅ Habit Completions collection indexes processed");

    console.log("\n🎉 All collections and attributes created successfully!");
    console.log("\nNext steps:");
    console.log("1. Update your environment variables with the correct values");
    console.log(
      "2. Make sure your Appwrite project has the correct permissions"
    );
    console.log("3. Test your app with the new Appwrite backend");
  } catch (error) {
    console.error("❌ Error creating collections:", error);
    process.exit(1);
  }
}

// Run the setup
createCollections();
