import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { account, ID } from "@/lib/appwrite";

export const AuthTest = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLogs, setAuthLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAuthLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
    console.log(`[AUTH TEST] ${message}`);
  };

  const testSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    addLog(`Attempting to create account for ${email}...`);

    try {
      // First, check if there's an existing session and delete it
      try {
        await account.get();
        addLog("Found existing session, logging out first...");
        await account.deleteSession("current");
        addLog("✅ Previous session cleared");
      } catch (error: any) {
        // No existing session, which is expected for signup
        if (error.code === 401) {
          addLog("No existing session found (good for signup)");
        }
      }

      // Create account
      const user = await account.create(ID.unique(), email, password, username);
      addLog(`✅ Account created successfully! User ID: ${user.$id}`);

      // Create session (login)
      const session = await account.createEmailPasswordSession(email, password);
      addLog(`✅ Session created successfully! Session ID: ${session.$id}`);

      // Get current user
      const currentUser = await account.get();
      setCurrentUser(currentUser);
      addLog(`✅ User data retrieved: ${currentUser.email}`);

      Alert.alert("Success", "Account created and logged in successfully!");
    } catch (error: any) {
      addLog(`❌ Sign up failed: ${error.message}`);
      console.error("Sign up error:", error);

      if (error.code === 409) {
        Alert.alert("Error", "User already exists. Try logging in instead.");
      } else if (error.message.includes("Session conflict")) {
        Alert.alert(
          "Error",
          "Session conflict detected. Please try signing in instead."
        );
      } else {
        Alert.alert("Error", error.message || "Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setIsLoading(true);
    addLog(`Attempting to login ${email}...`);

    try {
      // First, check if there's an existing session and delete it to avoid conflicts
      try {
        const existingUser = await account.get();
        addLog(
          `Found existing session for ${existingUser.email}, clearing it first...`
        );
        await account.deleteSession("current");
        addLog("✅ Previous session cleared");
      } catch (error: any) {
        // No existing session, which is fine
        if (error.code === 401) {
          addLog("No existing session found (normal for fresh login)");
        }
      }

      // Create session (login)
      const session = await account.createEmailPasswordSession(email, password);
      addLog(`✅ Login successful! Session ID: ${session.$id}`);

      // Get current user
      const currentUser = await account.get();
      setCurrentUser(currentUser);
      addLog(`✅ User data retrieved: ${currentUser.email}`);

      Alert.alert("Success", "Logged in successfully!");
    } catch (error: any) {
      addLog(`❌ Login failed: ${error.message}`);
      console.error("Login error:", error);

      if (error.message.includes("Session conflict")) {
        addLog("Retrying login after clearing all sessions...");
        try {
          // Try to delete all sessions and retry
          await account.deleteSessions();
          addLog("All sessions cleared, retrying login...");

          // Retry login
          const session = await account.createEmailPasswordSession(
            email,
            password
          );
          addLog(`✅ Retry login successful! Session ID: ${session.$id}`);

          const currentUser = await account.get();
          setCurrentUser(currentUser);
          addLog(`✅ User data retrieved: ${currentUser.email}`);

          Alert.alert(
            "Success",
            "Logged in successfully after clearing conflicts!"
          );
        } catch (retryError: any) {
          addLog(`❌ Retry login also failed: ${retryError.message}`);
          Alert.alert(
            "Error",
            "Login failed even after clearing sessions. Please try again."
          );
        }
      } else {
        Alert.alert("Error", error.message || "Failed to login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testSignOut = async () => {
    setIsLoading(true);
    addLog("Attempting to logout...");

    try {
      await account.deleteSession("current");
      setCurrentUser(null);
      addLog("✅ Logout successful!");
      Alert.alert("Success", "Logged out successfully!");
    } catch (error: any) {
      addLog(`❌ Logout failed: ${error.message}`);
      console.error("Logout error:", error);
      Alert.alert("Error", error.message || "Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    setIsLoading(true);
    addLog("Checking current user session...");

    try {
      const user = await account.get();
      setCurrentUser(user);
      addLog(`✅ User is logged in: ${user.email}`);
    } catch (error: any) {
      setCurrentUser(null);
      if (error.code === 401) {
        addLog("ℹ️ No user is currently logged in");
      } else {
        addLog(`❌ Error checking user: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setAuthLogs([]);
  };

  const clearAllSessions = async () => {
    setIsLoading(true);
    addLog("Attempting to clear all sessions...");

    try {
      await account.deleteSessions();
      setCurrentUser(null);
      addLog("✅ All sessions cleared successfully!");
      Alert.alert(
        "Success",
        "All sessions have been cleared. You can now login fresh."
      );
    } catch (error: any) {
      addLog(`❌ Failed to clear sessions: ${error.message}`);
      console.error("Clear sessions error:", error);

      if (error.code === 401) {
        addLog("ℹ️ No sessions to clear (already logged out)");
        setCurrentUser(null);
        Alert.alert(
          "Info",
          "No active sessions found. You're already logged out."
        );
      } else {
        Alert.alert("Error", error.message || "Failed to clear sessions");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Appwrite Authentication Test</Text>

      {currentUser && (
        <View style={styles.userInfo}>
          <Text style={styles.userTitle}>Current User:</Text>
          <Text style={styles.userText}>Email: {currentUser.email}</Text>
          <Text style={styles.userText}>Name: {currentUser.name}</Text>
          <Text style={styles.userText}>ID: {currentUser.$id}</Text>
        </View>
      )}

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Username (for signup)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={testSignUp}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={testSignIn}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={checkCurrentUser}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Check Current User
          </Text>
        </TouchableOpacity>

        {currentUser && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.dangerButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={testSignOut}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.warningButton,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={clearAllSessions}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            Clear All Sessions (Troubleshoot)
          </Text>
        </TouchableOpacity>
      </View>

      {authLogs.length > 0 && (
        <View style={styles.logsSection}>
          <View style={styles.logsHeader}>
            <Text style={styles.logsTitle}>Authentication Logs</Text>
            <TouchableOpacity onPress={clearLogs}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.logsContainer} nestedScrollEnabled>
            {authLogs.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  userInfo: {
    backgroundColor: "#e8f5e8",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  userTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 5,
  },
  userText: {
    fontSize: 14,
    color: "#2e7d32",
    marginBottom: 2,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
  },
  secondaryButtonText: {
    color: "white",
  },
  dangerButton: {
    backgroundColor: "#dc3545",
  },
  warningButton: {
    backgroundColor: "#ffc107",
  },
  logsSection: {
    marginTop: 20,
  },
  logsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  clearButton: {
    color: "#007AFF",
    fontSize: 16,
  },
  logsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logText: {
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 5,
    color: "#333",
  },
});
