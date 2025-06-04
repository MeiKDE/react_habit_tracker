import { useAuth } from "@/lib/auth-context";
import { ConnectionTest } from "@/components/ConnectionTest";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, ScrollView } from "react-native";
import { Button, Text, TextInput, useTheme, Switch } from "react-native-paper";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");
  const [showConnectionTest, setShowConnectionTest] = useState<boolean>(false);

  const theme = useTheme();
  const router = useRouter();

  const { signIn, signUp, isUsingRemoteAuth, setUseRemoteAuth } = useAuth();

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

    setError(null);

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

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
    setError(null);
    setEmail("");
    setUsername("");
    setPassword("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-100"
    >
      <ScrollView className="flex-1">
        <View className="flex-1 p-4 justify-center">
          <Text variant="headlineMedium" className="text-center mb-6">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>

          {/* Remote Auth Toggle */}
          <View className="flex-row items-center justify-between mb-4 p-3 bg-white rounded-lg">
            <Text variant="bodyMedium">Use Remote Backend</Text>
            <Switch
              value={isUsingRemoteAuth}
              onValueChange={setUseRemoteAuth}
            />
          </View>

          {/* Connection Test Toggle */}
          <View className="flex-row items-center justify-between mb-4 p-3 bg-white rounded-lg">
            <Text variant="bodyMedium">Show Connection Test</Text>
            <Switch
              value={showConnectionTest}
              onValueChange={setShowConnectionTest}
            />
          </View>

          {/* Connection Test Component */}
          {showConnectionTest && <ConnectionTest />}

          <TextInput
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="example@gmail.com"
            mode="outlined"
            className="mb-4"
            value={email}
            onChangeText={setEmail}
          />

          {isSignUp && (
            <TextInput
              label="Username"
              autoCapitalize="none"
              placeholder="username"
              mode="outlined"
              className="mb-4"
              value={username}
              onChangeText={setUsername}
            />
          )}

          <TextInput
            label="Password"
            autoCapitalize="none"
            mode="outlined"
            secureTextEntry
            className="mb-4"
            value={password}
            onChangeText={setPassword}
          />

          {error && (
            <Text
              className="text-red-500 mb-4"
              style={{ color: theme.colors.error }}
            >
              {error}
            </Text>
          )}

          <Button mode="contained" className="mt-2" onPress={handleAuth}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>

          <Button mode="text" onPress={handleSwitchMode} className="mt-4">
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Button>

          {!isUsingRemoteAuth && (
            <View className="mt-4 p-3 bg-blue-100 rounded-lg">
              <Text className="text-blue-700 text-sm">
                ℹ️ Local mode: Data will be stored on this device only
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
