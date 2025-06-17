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
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      // The redirect will take over; you may want to handle post-login in a useEffect elsewhere
    } catch (err: any) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
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
              Sign in to Habit Tracker
            </Text>
            <Text className="text-base text-slate-500 text-center">
              Use your Google account to continue
            </Text>
          </View>

          {error ? (
            <View className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
              <Text className="text-red-700 text-center font-medium">
                {error}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            className="rounded-xl overflow-hidden mt-2 shadow-lg shadow-purple-600/30"
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={["#8B5CF6", "#A855F7"]}
              className="py-4 px-8 items-center flex-row justify-center"
            >
              <Text className="text-base font-semibold text-white mr-2">
                {loading ? "Signing in..." : "Sign in with Google"}
              </Text>
              {/* Optionally add a Google icon here */}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
