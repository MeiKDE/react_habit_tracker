const { Client, Account } = require("appwrite");

// Using the client-side SDK to test signin (same as React Native)
const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("683db415003b8b011313");

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
  const email = "apple@gmail.com";

  // Common passwords to test
  const passwords = [
    "password",
    "password123",
    "123456",
    "apple",
    "apple123",
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
