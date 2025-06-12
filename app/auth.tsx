import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, User, Lock, ArrowLeft } from "lucide-react-native";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

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

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
    setError("");
    setEmail("");
    setUsername("");
    setPassword("");
  };

  return (
    <LinearGradient colors={["#F8FAFC", "#E2E8F0"]} className="flex-1">
      <SafeAreaView className="flex-1 p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            className="self-start p-2 mb-4"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>

          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-slate-100 rounded-[20px] justify-center items-center mb-6 shadow-sm">
              <Text className="text-[28px]">✨</Text>
            </View>
            <Text className="text-[28px] font-bold text-slate-800 mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>
            <Text className="text-base text-slate-500 text-center">
              {isSignUp
                ? "Start your journey to building better habits"
                : "Sign in to continue tracking your habits"}
            </Text>
          </View>

          <View className="gap-6 mb-8">
            {/* Email Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-gray-700">
                Email Address
              </Text>
              <View className="flex-row items-center bg-white rounded-xl border border-slate-200 px-4 py-1">
                <Mail size={20} color="#64748B" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-slate-800 py-3"
                  placeholder={isSignUp ? "Enter your email" : "me@gmail.com"}
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Username Input (only for signup) */}
            {isSignUp && (
              <View className="gap-2">
                <Text className="text-sm font-medium text-gray-700">
                  Username
                </Text>
                <View className="flex-row items-center bg-white rounded-xl border border-slate-200 px-4 py-1">
                  <User size={20} color="#64748B" className="mr-3" />
                  <TextInput
                    className="flex-1 text-base text-slate-800 py-3"
                    placeholder="Choose a username"
                    placeholderTextColor="#94A3B8"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            {/* Password Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-gray-700">
                Password
              </Text>
              <View className="flex-row items-center bg-white rounded-xl border border-slate-200 px-4 py-1">
                <Lock size={20} color="#64748B" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-slate-800 py-3"
                  placeholder={isSignUp ? "Enter your password" : "••••••••"}
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <Text className="text-red-700 text-center font-medium">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              className="rounded-xl overflow-hidden mt-2 shadow-lg shadow-purple-600/30"
              onPress={handleAuth}
            >
              <LinearGradient
                colors={["#8B5CF6", "#A855F7"]}
                className="py-4 px-8 items-center"
              >
                <Text className="text-base font-semibold text-white">
                  {isSignUp ? "Create Account" : "Sign In"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Switch Mode Button */}
            <TouchableOpacity
              className="py-3 items-center"
              onPress={handleSwitchMode}
            >
              <Text className="text-base font-medium text-purple-600">
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
