import { useAuth } from "@/lib/auth-context";
import { useHabits } from "@/lib/habits-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import {
  Button,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUENCIES)[number];

export default function AddHabitScreen() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const { createHabit } = useHabits();
  const router = useRouter();
  const theme = useTheme();

  // Debug: Log the current state values
  const isButtonDisabled = !title.trim() || !description.trim() || loading;
  console.log("🔍 [DEBUG] Button state:", {
    title: `"${title}"`,
    titleTrimmed: `"${title.trim()}"`,
    titleValid: !!title.trim(),
    description: `"${description}"`,
    descriptionTrimmed: `"${description.trim()}"`,
    descriptionValid: !!description.trim(),
    loading,
    user: !!user,
    userEmail: user?.email || "Not authenticated",
    isButtonDisabled,
  });

  const handleSubmit = async () => {
    if (!user) {
      console.error("🚨 [DEBUG] No user found, cannot create habit");
      return;
    }

    console.log("🚀 [DEBUG] Starting habit creation...");
    setLoading(true);
    setError("");

    try {
      await createHabit({
        title,
        description,
        frequency: frequency.toUpperCase() as "DAILY" | "WEEKLY" | "MONTHLY",
      });

      console.log("✅ [DEBUG] Habit created successfully");
      router.back();
    } catch (error) {
      console.error("❌ [DEBUG] Error creating habit:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("There was an error creating the habit");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gradient-to-br from-slate-50 to-gray-100"
    >
      {/* Header */}
      <View className="px-6 pt-4 pb-6 bg-white shadow-sm border-b border-gray-100">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-indigo-100 rounded-full justify-center items-center mr-4">
            <MaterialCommunityIcons name="plus" size={20} color="#6366f1" />
          </View>
          <View>
            <Text variant="headlineMedium" className="font-bold text-slate-800">
              Create New Habit
            </Text>
            <Text className="text-slate-500 text-sm">
              Build a better version of yourself
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-8 justify-center">
          {/* Debug Info - Remove this after debugging */}
          {__DEV__ && (
            <View className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <Text className="text-yellow-800 text-xs font-mono">
                🐛 DEBUG INFO{"\n"}
                Title: &quot;{title}&quot; (valid: {title.trim() ? "✅" : "❌"})
                {"\n"}
                Description: &quot;{description}&quot; (valid:{" "}
                {description.trim() ? "✅" : "❌"}){"\n"}
                Loading: {loading ? "⏳" : "✅"}
                {"\n"}
                User: {user ? `✅ ${user.email}` : "❌ Not authenticated"}
                {"\n"}
                Button: {isButtonDisabled ? "🔒 DISABLED" : "🔓 ENABLED"}
              </Text>
            </View>
          )}

          {/* Form Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Title Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-700 mb-3">
                Habit Title *
              </Text>
              <TextInput
                placeholder="e.g., Drink 8 glasses of water"
                mode="outlined"
                value={title}
                onChangeText={(text) => {
                  console.log("🔍 [DEBUG] Title changed to:", `"${text}"`);
                  setTitle(text);
                }}
                disabled={loading}
                outlineColor="#e2e8f0"
                activeOutlineColor="#6366f1"
                className="bg-slate-50"
                contentStyle={{ color: "#1e293b" }}
              />
            </View>

            {/* Description Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-700 mb-3">
                Description *
              </Text>
              <TextInput
                placeholder="Describe your habit and why it's important to you"
                mode="outlined"
                value={description}
                onChangeText={(text) => {
                  console.log(
                    "🔍 [DEBUG] Description changed to:",
                    `"${text}"`
                  );
                  setDescription(text);
                }}
                disabled={loading}
                multiline
                numberOfLines={3}
                outlineColor="#e2e8f0"
                activeOutlineColor="#6366f1"
                className="bg-slate-50"
                contentStyle={{ color: "#1e293b" }}
              />
            </View>

            {/* Frequency Selection */}
            <View className="mb-8">
              <Text className="text-sm font-semibold text-slate-700 mb-4">
                Frequency
              </Text>
              <SegmentedButtons
                value={frequency}
                onValueChange={(value) => setFrequency(value as Frequency)}
                buttons={FREQUENCIES.map((freq) => ({
                  value: freq,
                  label: freq.charAt(0).toUpperCase() + freq.slice(1),
                  style: {
                    borderColor: frequency === freq ? "#6366f1" : "#e2e8f0",
                    backgroundColor: frequency === freq ? "#eef2ff" : "white",
                  },
                  labelStyle: {
                    color: frequency === freq ? "#6366f1" : "#64748b",
                    fontWeight: frequency === freq ? "600" : "400",
                  },
                }))}
                style={{
                  backgroundColor: "transparent",
                }}
              />
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={!title.trim() || !description.trim() || loading}
              loading={loading}
              className="bg-indigo-600 py-2"
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{
                fontSize: 16,
                fontWeight: "600",
                color: "white",
              }}
            >
              {loading ? "Creating Habit..." : "Create Habit"}
            </Button>

            {/* Error Message - Fixed conditional rendering */}
            {error ? (
              <View className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <Text className="text-red-700 text-center font-medium">
                  {error}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Helper Text */}
          <View className="mt-6 px-4">
            <Text className="text-slate-500 text-sm text-center leading-relaxed">
              💡 Tip: Start with small, achievable habits that you can easily
              maintain every day.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
