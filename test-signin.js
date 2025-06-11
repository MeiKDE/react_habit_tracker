const { Client, Account } = require("appwrite");
require("dotenv").config();

// Configuration from environment variables
const APPWRITE_ENDPOINT =
  process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;

// Validate required environment variables
if (!APPWRITE_PROJECT_ID) {
  console.error("❌ Missing APPWRITE_PROJECT_ID environment variable");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);

async function testSignIn(email, password) {
  try {
    console.log(`🔐 Testing signin for ${email} with password: ${password}`);

    // Try to create a session (this is what React Native does)
    const session = await account.createEmailPasswordSession(email, password);

    console.log("✅ SUCCESS! Session created:", session.$id);

    // Get user info
    const user = await account.get();
    console.log("User info:", {
      id: user.$id,
      email: user.email,
      name: user.name,
    });

    // Clean up - delete the session
    await account.deleteSession(session.$id);
    console.log("🧹 Session cleaned up");

    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  // Get test email from environment or use default
  const email = process.env.TEST_EMAIL || "test@example.com";

  // Common passwords to test
  const passwords = [
    "password",
    "password123",
    "123456",
    "test123",
    "Password123",
    "12345678",
  ];

  console.log(`🧪 Testing signin for ${email} with common passwords...\n`);

  for (const password of passwords) {
    const success = await testSignIn(email, password);
    if (success) {
      console.log(`\n🎉 FOUND WORKING PASSWORD: "${password}"`);
      break;
    }
    // Small delay between attempts
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

runTests().catch(console.error);
