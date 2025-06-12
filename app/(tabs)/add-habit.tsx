import { useAuth } from "@/lib/auth-context";
import { useHabits } from "@/lib/habits-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, LogOut } from "lucide-react-native";

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUENCIES)[number];

export default function AddHabitScreen() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { user, signOut } = useAuth();
  const { createHabit } = useHabits();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a habit title");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createHabit({
        title,
        description,
        frequency: frequency.toUpperCase() as "DAILY" | "WEEKLY" | "MONTHLY",
      });

      // Clear form inputs
      setTitle("");
      setDescription("");
      setFrequency("daily");

      Alert.alert("Success", "Habit created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
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

  const frequencyOptions: { value: Frequency; label: string }[] =
    FREQUENCIES.map((freq) => ({
      value: freq,
      label: freq.charAt(0).toUpperCase() + freq.slice(1),
    }));

  return (
    <LinearGradient colors={["#F8FAFC", "#E2E8F0"]} className="flex-1">
      <SafeAreaView className="flex-1 p-6">
        <View className="flex-row items-center mb-6 gap-4">
          <Plus size={32} color="#8B5CF6" />
          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-800 mb-1">
              Create New Habit
            </Text>
            <Text className="text-base text-slate-500">
              Build a better version of yourself
            </Text>
          </View>
          <TouchableOpacity
            className="p-2 bg-white rounded-lg border border-slate-200"
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="mb-6">
            <Text className="text-base font-semibold text-slate-800 mb-2">
              Habit Title <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 min-h-[48px]"
              placeholder="e.g., Drink 8 glasses of water"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-slate-800 mb-2">
              Description <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 min-h-[100px]"
              style={{ textAlignVertical: "top" }}
              placeholder="Describe your habit and why it's important to you"
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              editable={!loading}
            />
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-slate-800 mb-2">
              Frequency
            </Text>
            <View className="flex-row gap-3">
              {frequencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`flex-1 bg-white rounded-xl border py-4 items-center ${
                    frequency === option.value
                      ? "bg-violet-50 border-violet-500"
                      : "border-slate-200"
                  }`}
                  onPress={() => setFrequency(option.value)}
                  disabled={loading}
                >
                  <Text
                    className={`text-base font-medium ${
                      frequency === option.value
                        ? "text-violet-600 font-semibold"
                        : "text-slate-500"
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            className={`rounded-2xl overflow-hidden mb-6 ${
              loading ? "opacity-60" : "shadow-lg"
            }`}
            style={
              Platform.OS !== "web"
                ? {
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: loading ? 0.1 : 0.3,
                    shadowRadius: 12,
                    elevation: loading ? 2 : 5,
                  }
                : {}
            }
            onPress={handleSubmit}
            disabled={!title.trim() || !description.trim() || loading}
          >
            <LinearGradient
              colors={loading ? ["#94A3B8", "#94A3B8"] : ["#8B5CF6", "#A855F7"]}
              className="py-4 px-8 items-center"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-lg font-semibold text-white">
                  Create Habit
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {error ? (
            <View className="bg-red-50 p-4 rounded-xl mb-6 border border-red-200">
              <Text className="text-sm font-medium text-red-700 text-center">
                {error}
              </Text>
            </View>
          ) : null}

          <View className="flex-row bg-yellow-50 p-4 rounded-xl items-start gap-3 mb-6 border border-yellow-200">
            <Text className="text-xl">💡</Text>
            <View className="flex-1">
              <Text className="text-sm font-medium text-yellow-800 leading-5">
                Tip: Start with small, achievable habits that you can easily
                maintain every day.
              </Text>
            </View>
          </View>

          <View
            className="bg-white p-5 rounded-2xl mb-4 shadow-sm"
            style={
              Platform.OS !== "web"
                ? {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }
                : {}
            }
          >
            <Text className="text-lg font-semibold text-slate-800 mb-4">
              Popular Habit Ideas
            </Text>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <Text className="text-xl">💧</Text>
                <Text className="text-sm text-slate-500 flex-1">
                  Drink 8 glasses of water daily
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-xl">📚</Text>
                <Text className="text-sm text-slate-500 flex-1">
                  Read for 20 minutes before bed
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-xl">🏃‍♂️</Text>
                <Text className="text-sm text-slate-500 flex-1">
                  Take a 30-minute walk
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-xl">🧘‍♀️</Text>
                <Text className="text-sm text-slate-500 flex-1">
                  Meditate for 10 minutes
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-xl">📱</Text>
                <Text className="text-sm text-slate-500 flex-1">
                  No phone 1 hour before sleep
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
