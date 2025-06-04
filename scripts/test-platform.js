#!/usr/bin/env node

const { execSync } = require("child_process");

console.log(
  "\n🔍 React Native Platform Detection & API Configuration Helper\n"
);

try {
  // Check if we're in an Expo environment
  console.log("📱 Platform Detection:");

  // Check for running simulators/emulators
  try {
    const xcodeSimulators = execSync("xcrun simctl list devices booted", {
      encoding: "utf8",
    });
    if (
      xcodeSimulators.includes("iPhone") ||
      xcodeSimulators.includes("iPad")
    ) {
      console.log("✅ iOS Simulator detected (running)");
      console.log("   → Recommended API URL: http://localhost:3000/api");
    } else {
      console.log("❓ No iOS Simulator detected");
    }
  } catch (error) {
    console.log("❓ Cannot detect iOS Simulator (xcrun not available)");
  }

  try {
    const androidEmulators = execSync("adb devices", { encoding: "utf8" });
    if (
      androidEmulators.includes("emulator-") &&
      androidEmulators.includes("device")
    ) {
      console.log("✅ Android Emulator detected (running)");
      console.log("   → Recommended API URL: http://10.0.2.2:3000/api");
    } else {
      console.log("❓ No Android Emulator detected");
    }
  } catch (error) {
    console.log("❓ Cannot detect Android Emulator (adb not available)");
  }

  console.log("\n🌐 Network Configuration:");

  // Get current IP address
  const os = require("os");
  const interfaces = os.networkInterfaces();
  const networkIPs = [];

  Object.keys(interfaces).forEach((name) => {
    interfaces[name].forEach((iface) => {
      if (iface.family === "IPv4" && !iface.internal) {
        networkIPs.push({
          name: name,
          address: iface.address,
          recommended:
            name.toLowerCase().includes("wi-fi") ||
            name.toLowerCase().includes("wlan") ||
            name.toLowerCase().includes("en0"),
        });
      }
    });
  });

  if (networkIPs.length > 0) {
    networkIPs.forEach((ip) => {
      const marker = ip.recommended ? "✅" : "  ";
      console.log(`${marker} ${ip.name}: ${ip.address}`);
      if (ip.recommended) {
        console.log(`   → For Physical Device: http://${ip.address}:3000/api`);
      }
    });
  }

  console.log("\n📋 Quick Configuration Guide:");
  console.log("1. Open react-native-habit-tracker/config/api.ts");
  console.log("2. Uncomment the appropriate return statement:");
  console.log('   • iOS Simulator: return "http://localhost:3000/api";');
  console.log('   • Android Emulator: return "http://10.0.2.2:3000/api";');
  if (networkIPs.length > 0) {
    const recommendedIP =
      networkIPs.find((ip) => ip.recommended) || networkIPs[0];
    console.log(
      `   • Physical Device: return "http://${recommendedIP.address}:3000/api";`
    );
  }
  console.log("3. Make sure to comment out the other options");
  console.log("4. Restart your React Native app");

  console.log("\n🧪 Test Your Connection:");
  console.log("Run this after updating config/api.ts:");
  console.log("• Import and use the ConnectionTest component in your app");
  console.log("• Or check the React Native console for API debug logs");
} catch (error) {
  console.error("Error during platform detection:", error.message);
}

console.log("\n💡 If you're still having issues:");
console.log(
  "• Make sure your Next.js server is running: cd ../nextjs-habit-tracker && npm run dev"
);
console.log("• Check the React Native Metro console for network errors");
console.log("• Try the ConnectionTest component for detailed debugging");
console.log("• Ensure your firewall allows connections on port 3000\n");
