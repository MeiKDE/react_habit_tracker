#!/usr/bin/env node

const os = require("os");

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const results = [];

  Object.keys(interfaces).forEach((name) => {
    interfaces[name].forEach((iface) => {
      // Skip over non-IPv4 and internal (i.e., 127.0.0.1) addresses
      if (iface.family === "IPv4" && !iface.internal) {
        results.push({
          name: name,
          address: iface.address,
          suggested:
            name.toLowerCase().includes("wi-fi") ||
            name.toLowerCase().includes("wlan") ||
            name.toLowerCase().includes("en0"),
        });
      }
    });
  });

  console.log("\n🌐 Available IP Addresses for React Native Development:\n");

  if (results.length === 0) {
    console.log(
      "❌ No external IP addresses found. Make sure you're connected to a network."
    );
    return;
  }

  results.forEach((result, index) => {
    const marker = result.suggested ? "✅ (Recommended)" : "  ";
    console.log(`${marker} ${result.name}: ${result.address}`);
  });

  const recommended = results.find((r) => r.suggested);
  const suggestedIp = recommended ? recommended.address : results[0].address;

  console.log("\n📝 Configuration Instructions:");
  console.log("\n1. Update config/api.ts with your IP address:");
  console.log(`   return "http://${suggestedIp}:3000/api";`);

  console.log("\n2. Make sure your Next.js backend is running:");
  console.log("   cd ../nextjs-habit-tracker");
  console.log("   npm run dev");

  console.log("\n3. Test the connection using the Connection Test in your app");

  console.log("\n🔧 Platform-specific configurations:");
  console.log("• iOS Simulator: http://localhost:3000/api");
  console.log("• Android Emulator: http://10.0.2.2:3000/api");
  console.log(`• Physical Device: http://${suggestedIp}:3000/api`);

  console.log(
    "\n💡 Tip: You can also run this script anytime with: npm run get-ip\n"
  );
}

getLocalIpAddress();
