#!/usr/bin/env node

/**
 * Security Audit Script for Habit Tracker
 * Checks for common security vulnerabilities and App Store compliance
 */

const fs = require("fs");
const path = require("path");

// Get the directory of the current script
const scriptDir = path.dirname(path.resolve(process.argv[1]));

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type}: ${message}`);
  }

  addIssue(message) {
    this.issues.push(message);
    this.log("❌ ISSUE", message);
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log("⚠️  WARNING", message);
  }

  addPassed(message) {
    this.passed.push(message);
    this.log("✅ PASSED", message);
  }

  checkAppJson() {
    this.log("INFO", "Checking app.json configuration...");

    try {
      const appJsonPath = path.join(scriptDir, "..", "app.json");
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
      const expo = appJson.expo;

      // Check app name
      if (expo.name === "react-native-course") {
        this.addIssue(
          'App name still set to "react-native-course" - should be "Habit Tracker"'
        );
      } else {
        this.addPassed("App name properly set");
      }

      // Check bundle identifier
      if (expo.ios?.bundleIdentifier?.includes("yourcompany")) {
        this.addWarning('Bundle identifier contains placeholder "yourcompany"');
      } else if (expo.ios?.bundleIdentifier) {
        this.addPassed("Bundle identifier configured");
      }

      // Check NSAllowsArbitraryLoads
      const ats = expo.ios?.infoPlist?.NSAppTransportSecurity;
      if (ats?.NSAllowsArbitraryLoads === true) {
        this.addIssue(
          "NSAllowsArbitraryLoads is enabled - CRITICAL security issue"
        );
      } else {
        this.addPassed("NSAllowsArbitraryLoads properly disabled");
      }

      // Check Android cleartext traffic
      if (expo.android?.usesCleartextTraffic === true) {
        this.addIssue("usesCleartextTraffic is enabled - security issue");
      } else {
        this.addPassed("usesCleartextTraffic properly disabled");
      }

      // Check privacy manifest reference
      if (ats?.NSPrivacyAccessedAPITypeUserDefaults) {
        this.addPassed("Privacy manifest configuration found");
      } else {
        this.addWarning("Privacy manifest configuration missing");
      }
    } catch (error) {
      this.addIssue(`Failed to read app.json: ${error.message}`);
    }
  }

  checkApiConfiguration() {
    this.log("INFO", "Checking API configuration...");

    try {
      const configPath = path.join(scriptDir, "..", "config", "api.ts");
      const configContent = fs.readFileSync(configPath, "utf8");

      // Check for localhost in production
      if (
        configContent.includes("localhost") &&
        !configContent.includes("__DEV__")
      ) {
        this.addIssue("Localhost URLs found outside development checks");
      } else {
        this.addPassed("API URLs properly configured for environments");
      }

      // Check for production URL placeholder
      if (configContent.includes("your-production-domain.com")) {
        this.addWarning("Production API URL contains placeholder");
      }
    } catch (error) {
      this.addIssue(`Failed to read API configuration: ${error.message}`);
    }
  }

  checkSecureStorage() {
    this.log("INFO", "Checking secure storage implementation...");

    try {
      const secureStoragePath = path.join(
        scriptDir,
        "..",
        "lib",
        "secure-storage.ts"
      );
      const secureStorageContent = fs.readFileSync(secureStoragePath, "utf8");

      // Check for SecureStore usage
      if (secureStorageContent.includes("expo-secure-store")) {
        this.addPassed("Expo SecureStore properly imported");
      } else {
        this.addIssue(
          "Expo SecureStore not found - tokens may be stored insecurely"
        );
      }

      // Check for token pair storage
      if (secureStorageContent.includes("storeTokenPair")) {
        this.addPassed("Token pair storage implemented");
      } else {
        this.addWarning("Token pair storage method not found");
      }

      // Check for token expiration handling
      if (secureStorageContent.includes("isTokenExpired")) {
        this.addPassed("Token expiration checking implemented");
      } else {
        this.addIssue("Token expiration checking not implemented");
      }
    } catch (error) {
      this.addIssue(`Failed to read secure storage: ${error.message}`);
    }
  }

  checkAuthContext() {
    this.log("INFO", "Checking authentication context...");

    try {
      const authContextPath = path.join(
        scriptDir,
        "..",
        "lib",
        "auth-context.tsx"
      );
      const authContextContent = fs.readFileSync(authContextPath, "utf8");

      // Check for secure storage usage
      if (authContextContent.includes("SecureStorage")) {
        this.addPassed("Authentication uses secure storage");
      } else {
        this.addIssue("Authentication not using secure storage");
      }

      // Check for refresh token handling
      if (authContextContent.includes("refreshAuth")) {
        this.addPassed("Token refresh functionality implemented");
      } else {
        this.addWarning("Token refresh functionality not found");
      }
    } catch (error) {
      this.addIssue(`Failed to read auth context: ${error.message}`);
    }
  }

  checkPrivacyDocuments() {
    this.log("INFO", "Checking privacy and legal documents...");

    const privacyPolicyPath = path.join(scriptDir, "..", "PRIVACY_POLICY.md");
    const termsPath = path.join(scriptDir, "..", "TERMS_OF_SERVICE.md");

    if (fs.existsSync(privacyPolicyPath)) {
      this.addPassed("Privacy policy document exists");
    } else {
      this.addIssue("Privacy policy document missing");
    }

    if (fs.existsSync(termsPath)) {
      this.addPassed("Terms of service document exists");
    } else {
      this.addIssue("Terms of service document missing");
    }
  }

  checkPackageJson() {
    this.log("INFO", "Checking package.json for security...");

    try {
      const packageJsonPath = path.join(scriptDir, "..", "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

      // Check for expo-secure-store
      if (packageJson.dependencies?.["expo-secure-store"]) {
        this.addPassed("expo-secure-store dependency found");
      } else {
        this.addIssue("expo-secure-store dependency missing");
      }

      // Check app name in package.json
      if (
        packageJson.name === "react-habit-tracker" ||
        packageJson.name === "habit-tracker"
      ) {
        this.addPassed("Package name properly set");
      } else {
        this.addWarning("Package name may need updating");
      }
    } catch (error) {
      this.addIssue(`Failed to read package.json: ${error.message}`);
    }
  }

  checkBackendSecurity() {
    this.log("INFO", "Checking backend security configuration...");

    try {
      const middlewarePath = path.join(
        scriptDir,
        "..",
        "..",
        "nextjs-habit-tracker",
        "src",
        "middleware.ts"
      );

      if (fs.existsSync(middlewarePath)) {
        const middlewareContent = fs.readFileSync(middlewarePath, "utf8");

        // Check for wildcard CORS
        if (
          middlewareContent.includes('"*"') &&
          !middlewareContent.includes("isAllowedOrigin")
        ) {
          this.addIssue("CORS allows all origins (*) - security risk");
        } else {
          this.addPassed("CORS properly configured with origin restrictions");
        }

        // Check for security headers
        if (middlewareContent.includes("X-Content-Type-Options")) {
          this.addPassed("Security headers implemented");
        } else {
          this.addWarning("Security headers not found");
        }
      } else {
        this.addWarning(
          "Backend middleware not found - cannot verify CORS security"
        );
      }
    } catch (error) {
      this.addWarning(`Could not check backend security: ${error.message}`);
    }
  }

  generateReport() {
    this.log("INFO", "Generating security audit report...");

    console.log("\n" + "=".repeat(60));
    console.log("🔒 SECURITY AUDIT REPORT");
    console.log("=".repeat(60));

    console.log(`\n✅ PASSED CHECKS (${this.passed.length}):`);
    this.passed.forEach((item) => console.log(`  • ${item}`));

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach((item) => console.log(`  • ${item}`));
    }

    if (this.issues.length > 0) {
      console.log(`\n❌ CRITICAL ISSUES (${this.issues.length}):`);
      this.issues.forEach((item) => console.log(`  • ${item}`));
    }

    console.log("\n" + "=".repeat(60));

    if (this.issues.length === 0) {
      console.log(
        "🎉 SECURITY AUDIT PASSED! Your app is ready for App Store submission."
      );
    } else {
      console.log(
        "🚨 SECURITY AUDIT FAILED! Please fix critical issues before submission."
      );
      process.exit(1);
    }

    if (this.warnings.length > 0) {
      console.log("⚠️  Please review warnings for optimal security.");
    }

    console.log("=".repeat(60));
  }

  run() {
    console.log("🔒 Starting Security Audit for Habit Tracker...\n");

    this.checkAppJson();
    this.checkApiConfiguration();
    this.checkSecureStorage();
    this.checkAuthContext();
    this.checkPrivacyDocuments();
    this.checkPackageJson();
    this.checkBackendSecurity();

    this.generateReport();
  }
}

// Run the audit
const auditor = new SecurityAuditor();
auditor.run();
