const { Client, Account, Users } = require("node-appwrite");
require("dotenv").config();

// Configuration from environment variables
const APPWRITE_ENDPOINT =
  process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

// Validate required environment variables
if (!APPWRITE_PROJECT_ID) {
  console.error("❌ Missing APPWRITE_PROJECT_ID environment variable");
  process.exit(1);
}

if (!APPWRITE_API_KEY) {
  console.error("❌ Missing APPWRITE_API_KEY environment variable");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const users = new Users(client);
const account = new Account(client);

async function debugAppwrite() {
  try {
    console.log("🔍 Testing Appwrite Connection...");
    console.log("Endpoint:", APPWRITE_ENDPOINT);
    console.log("Project ID:", APPWRITE_PROJECT_ID.substring(0, 8) + "...");

    // List all users in the auth system
    console.log("\n📋 Listing users in Appwrite Auth system...");
    const usersList = await users.list();
    console.log(`Found ${usersList.total} users in auth system:`);

    usersList.users.forEach((user) => {
      console.log(`  - ${user.email} (ID: ${user.$id})`);
    });

    // Check specifically for apple@gmail.com
    console.log("\n🍎 Checking for apple@gmail.com...");
    const targetUser = usersList.users.find(
      (u) => u.email === "apple@gmail.com"
    );

    if (targetUser) {
      console.log("✅ apple@gmail.com found in auth system!");
      console.log("User details:", {
        id: targetUser.$id,
        email: targetUser.email,
        name: targetUser.name,
        registration: targetUser.registration,
        status: targetUser.status,
        emailVerification: targetUser.emailVerification,
      });
    } else {
      console.log("❌ apple@gmail.com NOT found in auth system");
      console.log(
        "Available emails:",
        usersList.users.map((u) => u.email)
      );
    }
  } catch (error) {
    console.error("❌ Error connecting to Appwrite:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
  }
}

debugAppwrite();
