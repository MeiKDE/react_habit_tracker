import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { getApiUrl, logApiConfig } from "../config/api";

interface TestResult {
  endpoint: string;
  status: "pending" | "success" | "error";
  message: string;
  details?: any;
}

export const ConnectionTest = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: TestResult) => {
    setResults((prev) => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    clearResults();

    // Log current configuration
    console.log("[CONNECTION TEST] Starting connection test...");
    logApiConfig();

    const baseUrl = getApiUrl();

    // Test 1: Basic connectivity
    addResult({
      endpoint: "Basic Connection",
      status: "pending",
      message: `Testing connection to ${baseUrl}...`,
    });

    try {
      const response = await fetch(`${baseUrl}/auth/signin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      addResult({
        endpoint: "Basic Connection",
        status: "success",
        message: `Connected! Status: ${response.status}`,
        details: { status: response.status, statusText: response.statusText },
      });
    } catch (error) {
      addResult({
        endpoint: "Basic Connection",
        status: "error",
        message: `Connection failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        details: error,
      });
    }

    // Test 2: POST request to signin
    addResult({
      endpoint: "POST /auth/signin",
      status: "pending",
      message: "Testing POST request...",
    });

    try {
      const response = await fetch(`${baseUrl}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      });

      const data = await response.text();
      console.log("Connection test response:", {
        status: response.status,
        statusText: response.statusText,
        data,
      });

      addResult({
        endpoint: "POST /auth/signin",
        status: response.ok ? "success" : "error",
        message: response.ok
          ? "✅ Connected to server!"
          : `❌ Failed to connect to server (Status: ${response.status})`,
        details: {
          status: response.status,
          statusText: response.statusText,
          data: data.slice(0, 200) + "...",
        },
      });
    } catch (error) {
      console.error("Connection test failed:", error);
      addResult({
        endpoint: "POST /auth/signin",
        status: "error",
        message: "❌ Failed to connect to server",
        details: error instanceof Error ? error.message : String(error),
      });
    }

    setIsLoading(false);
  };

  const testAuth = async () => {
    const baseUrl = getApiUrl();
    try {
      addResult({
        endpoint: "Auth Test",
        status: "pending",
        message: "🔄 Testing authentication...",
        details: "",
      });

      const response = await fetch(`${baseUrl}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "test123",
        }),
      });

      const responseText = await response.text();
      console.log("Auth test response:", {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
      });

      addResult({
        endpoint: "Auth Test",
        status: response.status < 500 ? "success" : "error",
        message: `Auth endpoint responds (${response.status})`,
        details: responseText,
      });
    } catch (error) {
      console.error("Auth test failed:", error);
      addResult({
        endpoint: "Auth Test",
        status: "error",
        message: "❌ Auth test failed",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      case "pending":
        return "#FF9800";
      default:
        return "#757575";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Test</Text>
      <Text style={styles.subtitle}>Current API URL: {getApiUrl()}</Text>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={testConnection}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Testing..." : "Test Connection"}
        </Text>
      </TouchableOpacity>

      {results.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
          <Text style={styles.clearButtonText}>Clear Results</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <Text style={styles.endpoint}>{result.endpoint}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(result.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {result.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.message}>{result.message}</Text>
            {result.details && (
              <Text style={styles.details}>
                Details: {JSON.stringify(result.details, null, 2)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
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
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: "#757575",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  clearButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
  },
  results: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  endpoint: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
    color: "#333",
  },
  details: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
});
