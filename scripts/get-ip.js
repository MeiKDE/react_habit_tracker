#!/usr/bin/env node

const os = require("os");

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  return "localhost";
}

const ip = getLocalIPAddress();

console.log("\n🌐 Network Configuration for React Native Development\n");
console.log("📱 For iOS Simulator:     http://localhost:3000/api");
console.log("🤖 For Android Emulator:  http://10.0.2.2:3000/api");
console.log(`📲 For Physical Device:   http://${ip}:3000/api`);
console.log(
  "\n💡 Update config/api.ts with the appropriate URL for your setup\n"
);
