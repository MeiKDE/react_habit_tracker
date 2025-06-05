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

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      await createHabit({
        title,
        description,
        frequency: frequency.toUpperCase() as "DAILY" | "WEEKLY" | "MONTHLY",
      });

      console.log("Habit created successfully");
      router.back();
    } catch (error) {
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
                onChangeText={setTitle}
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
                onChangeText={setDescription}
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

            {/* Error Message */}
            {error && (
              <View className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <Text className="text-red-700 text-center font-medium">
                  {error}
                </Text>
              </View>
            )}
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
