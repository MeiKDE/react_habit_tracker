import { useAuth } from "@/lib/auth-context";
import { ConnectionTest } from "@/components/ConnectionTest";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, ScrollView } from "react-native";
import { Button, Text, TextInput, useTheme, Switch } from "react-native-paper";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showConnectionTest, setShowConnectionTest] = useState<boolean>(false);

  const theme = useTheme();
  const router = useRouter();

  const { signIn, signUp, clearSessions } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (isSignUp && !username) {
      setError("Username is required for signup.");
      return;
    }

    if (password.length < 6) {
      setError("Passwords must be at least 6 characters long.");
      return;
    }

    setError("");

    if (isSignUp) {
      const error = await signUp(email, password, username);
      if (error) {
        setError(error);
        return;
      }
      router.replace("/");
    } else {
      const error = await signIn(email, password);
      if (error) {
        setError(error);
        return;
      }
      router.replace("/");
    }
  };

  const handleClearSessions = async () => {
    try {
      await clearSessions();
      setError("");
      alert("All sessions cleared successfully");
    } catch (error) {
      setError("Failed to clear sessions");
    }
  };

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
    setError("");
    setEmail("");
    setUsername("");
    setPassword("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gradient-to-br from-indigo-50 via-white to-purple-50"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-12 justify-center">
          {/* Header Section */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-indigo-100 rounded-2xl justify-center items-center mb-6">
              <MaterialCommunityIcons
                name="chart-timeline-variant"
                size={32}
                color="#6366f1"
              />
            </View>
            <Text
              variant="headlineLarge"
              className="font-bold text-slate-800 mb-2"
            >
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>
            <Text className="text-slate-500 text-center px-4 leading-relaxed">
              {isSignUp
                ? "Start your journey to building better habits"
                : "Sign in to continue tracking your habits"}
            </Text>
          </View>

          {/* Main Form Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            {/* Connection Test Toggle */}
            <View className="flex-row items-center justify-between mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <View className="flex-1">
                <Text className="font-semibold text-slate-700 mb-1">
                  Connection Test
                </Text>
                <Text className="text-xs text-slate-500">
                  Check server connectivity
                </Text>
              </View>
              <Switch
                value={showConnectionTest}
                onValueChange={setShowConnectionTest}
              />
            </View>

            {/* Connection Test Component */}
            {showConnectionTest ? (
              <View className="mb-6">
                <ConnectionTest />
              </View>
            ) : null}

            {/* Form Fields */}
            <View className="space-y-4">
              {/* Email Input */}
              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </Text>
                <TextInput
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  mode="outlined"
                  value={email}
                  onChangeText={setEmail}
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#6366f1"
                  className="bg-slate-50"
                  contentStyle={{ color: "#1e293b" }}
                  left={<TextInput.Icon icon="email" />}
                />
              </View>

              {/* Username Input (only for signup) */}
              {isSignUp ? (
                <View>
                  <Text className="text-sm font-semibold text-slate-700 mb-2">
                    Username
                  </Text>
                  <TextInput
                    placeholder="Choose a username"
                    autoCapitalize="none"
                    mode="outlined"
                    value={username}
                    onChangeText={setUsername}
                    outlineColor="#e2e8f0"
                    activeOutlineColor="#6366f1"
                    className="bg-slate-50"
                    contentStyle={{ color: "#1e293b" }}
                    left={<TextInput.Icon icon="account" />}
                  />
                </View>
              ) : null}

              {/* Password Input */}
              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-2">
                  Password
                </Text>
                <TextInput
                  placeholder="Enter your password"
                  autoCapitalize="none"
                  mode="outlined"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#6366f1"
                  className="bg-slate-50"
                  contentStyle={{ color: "#1e293b" }}
                  left={<TextInput.Icon icon="lock" />}
                />
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <Text className="text-red-700 text-center font-medium">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleAuth}
              className="mt-6 bg-indigo-600 py-2"
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{
                fontSize: 16,
                fontWeight: "600",
                color: "white",
              }}
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>

            {/* Switch Mode Button */}
            <Button
              mode="text"
              onPress={handleSwitchMode}
              className="mt-4"
              textColor="#6366f1"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Button>

            {/* Debug: Clear Sessions Button */}
            <Button
              mode="outlined"
              onPress={handleClearSessions}
              className="mt-4 border-amber-500"
              textColor="#f59e0b"
              icon="debug-step-over"
            >
              Clear All Sessions (Debug)
            </Button>
          </View>

          {/* Info Card */}
          <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-blue-100 rounded-full justify-center items-center mr-3 mt-0.5">
                <MaterialCommunityIcons
                  name="information"
                  size={16}
                  color="#3b82f6"
                />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-blue-800 mb-1">
                  Remote Storage
                </Text>
                <Text className="text-blue-700 text-sm leading-relaxed">
                  Your habit data is securely stored on our remote servers and
                  synced across all your devices.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
