const { Client, Account, Users } = require("node-appwrite");

// Configuration from React Native app.json
const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("683db415003b8b011313")
  .setKey(
    "standard_d50d7dd231417804d0876ea33bee8a8c503d38d172f30ed10592e942ded53926a86650a4c96e824fb15af29eebb622a40c009d6efb106e736efe8b290413b5b659637f542433c706b654f3feb2aadd5e3d235e16b2946de67f52745610e8b09f64d37b969522a124b9cb3cb5ef2c5614c2bf4cf332412f4dabfd61dd9d19c7d2"
  );

const users = new Users(client);
const account = new Account(client);

async function debugAppwrite() {
  try {
    console.log("🔍 Testing Appwrite Connection...");
    console.log("Endpoint:", "https://fra.cloud.appwrite.io/v1");
    console.log("Project ID:", "683db415003b8b011313");

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
