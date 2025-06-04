import React, { useState } from "react";
import { View } from "react-native";
import { Button, Text, Card } from "react-native-paper";
import { ApiClient } from "@/lib/api-client";
import { getApiUrl } from "@/config/api";

export function ConnectionTest() {
  const [status, setStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");

  const testConnection = async () => {
    setStatus("testing");
    setMessage("Testing connection...");

    try {
      // Test basic connectivity by trying to fetch habits (will fail with 401 if not authenticated, but that's expected)
      const response = await fetch(`${getApiUrl()}/habits`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        // 401 is expected when not authenticated - this means the backend is reachable
        setStatus("success");
        setMessage(
          `✅ Backend is reachable at ${getApiUrl()}\n(401 Unauthorized is expected when not signed in)`
        );
      } else if (response.ok) {
        setStatus("success");
        setMessage(`✅ Backend is reachable and responding at ${getApiUrl()}`);
      } else {
        setStatus("error");
        setMessage(`❌ Backend responded with status ${response.status}`);
      }
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        if (error.message.includes("Network request failed")) {
          setMessage(
            `❌ Cannot reach backend at ${getApiUrl()}\n\nTroubleshooting:\n• Make sure Next.js backend is running (npm run dev)\n• Check if you're using the correct IP address\n• For Android emulator, try 10.0.2.2:3000\n• For physical device, use your computer's IP address`
          );
        } else {
          setMessage(`❌ Connection error: ${error.message}`);
        }
      } else {
        setMessage(`❌ Unknown connection error`);
      }
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      case "testing":
        return "#FF9800";
      default:
        return "#2196F3";
    }
  };

  return (
    <Card className="m-4 p-4">
      <Text variant="titleMedium" className="mb-4">
        Backend Connection Test
      </Text>

      <Text className="mb-2 text-gray-600">Current API URL: {getApiUrl()}</Text>

      <Button
        mode="contained"
        onPress={testConnection}
        loading={status === "testing"}
        disabled={status === "testing"}
        className="mb-4"
      >
        Test Connection
      </Button>

      {message && (
        <View
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${getStatusColor()}20` }}
        >
          <Text style={{ color: getStatusColor() }} className="text-sm">
            {message}
          </Text>
        </View>
      )}
    </Card>
  );
}
