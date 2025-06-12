import { View, Text, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trophy, Flame, TrendingUp, CheckCircle } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { useHabits } from "@/lib/habits-context";
import { Habit, StreakData } from "@/lib/appwrite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const streakTips = [
  "Consistency beats perfection - focus on showing up daily",
  "Track your progress to stay motivated",
  "Celebrate small wins along the way",
  "Don't break the chain!",
];

export default function StreaksScreen() {
  const { user, signOut } = useAuth();
  const { habits, isLoading, getHabitStreak } = useHabits();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  interface HabitWithStreakData extends Habit {
    streakData: StreakData;
  }

  const habitStreaks: HabitWithStreakData[] = habits.map((habit) => ({
    ...habit,
    streakData: getHabitStreak(habit),
  }));

  const rankedHabits = habitStreaks.sort(
    (a, b) => b.streakData.bestStreak - a.streakData.bestStreak
  );

  // Get top 3 performers from actual data
  const topPerformers = rankedHabits.slice(0, 3).map((habit, index) => ({
    id: habit.$id,
    name: habit.title,
    streak: habit.streakData.bestStreak,
    currentStreak: habit.streakData.streak,
    badge: index === 0 ? "🏆" : index === 1 ? "🥈" : "🥉",
  }));

  if (isLoading) {
    return (
      <LinearGradient colors={["#F8FAFC", "#E2E8F0"]} className="flex-1">
        <SafeAreaView className="flex-1 justify-center items-center">
          <View className="items-center">
            <View className="w-12 h-12 bg-indigo-100 rounded-full justify-center items-center mb-4">
              <MaterialCommunityIcons
                name="loading"
                size={24}
                color="#6366f1"
              />
            </View>
            <Text className="text-slate-600 font-medium">
              Loading streaks...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#F8FAFC", "#E2E8F0"]} className="flex-1">
      <SafeAreaView className="flex-1 p-6">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-4 flex-1">
            <Flame size={32} color="#F59E0B" />
            <View className="flex-1">
              <Text className="text-3xl font-bold text-slate-800 mb-1">
                Habit Streaks
              </Text>
              <Text className="text-base text-slate-500">
                Track your consistency and progress
              </Text>
            </View>
          </View>

          {/* Sign Out Button */}
          <View className="w-10 h-10 items-center justify-center">
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color="rgb(100, 116, 139)"
              onPress={handleSignOut}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {habits.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <View className="items-center">
                <View className="w-16 h-16 bg-amber-100 rounded-full justify-center items-center mb-6">
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={32}
                    color="#f59e0b"
                  />
                </View>
                <Text className="text-xl font-semibold text-slate-800 mb-2">
                  No streaks yet
                </Text>
                <Text className="text-slate-500 text-center px-8">
                  Complete some habits to start building your streaks!
                </Text>
              </View>
            </View>
          ) : (
            <View>
              {/* Top Performers Section */}
              {topPerformers.length > 0 && (
                <View className="mb-8">
                  <View className="flex-row items-center gap-3 mb-4">
                    <Trophy size={24} color="#F59E0B" />
                    <Text className="text-xl font-semibold text-slate-800">
                      Top Performers
                    </Text>
                  </View>

                  <View className="gap-3">
                    {topPerformers.map((performer, index) => (
                      <View
                        key={performer.id}
                        className="bg-white flex-row items-center p-4 rounded-2xl shadow-sm border border-gray-100"
                      >
                        <View className="items-center mr-4">
                          <Text className="text-2xl mb-1">
                            {performer.badge}
                          </Text>
                          <Text className="text-sm font-bold text-slate-500">
                            {index + 1}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-slate-800 mb-1">
                            {performer.name}
                          </Text>
                          <Text className="text-sm text-slate-500">
                            Best streak: {performer.streak} days
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1 bg-amber-100 px-2 py-1 rounded-lg">
                          <Flame size={16} color="#F59E0B" />
                          <Text className="text-sm font-bold text-amber-600">
                            {performer.currentStreak}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* All Habits Section */}
              <View className="mb-8">
                <View className="flex-row items-center gap-3 mb-4">
                  <TrendingUp size={24} color="#8B5CF6" />
                  <Text className="text-xl font-semibold text-slate-800">
                    All Habits
                  </Text>
                </View>

                <View className="gap-4">
                  {habitStreaks.map((habit) => (
                    <View
                      key={habit.$id}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                    >
                      <View className="flex-row items-center mb-4">
                        <View
                          className="w-10 h-10 rounded-xl justify-center items-center mr-3"
                          style={{ backgroundColor: habit.color + "20" }}
                        >
                          <View
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: habit.color }}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-slate-800 mb-0.5">
                            {habit.title}
                          </Text>
                          <Text className="text-sm text-slate-500">
                            {habit.frequency.charAt(0) +
                              habit.frequency.slice(1).toLowerCase()}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-around">
                        <View className="items-center gap-1">
                          <Flame size={16} color="#F59E0B" />
                          <Text className="text-lg font-bold text-slate-800">
                            {habit.streakData.streak}
                          </Text>
                          <Text className="text-xs font-medium text-slate-500">
                            Current
                          </Text>
                        </View>
                        <View className="items-center gap-1">
                          <Trophy size={16} color="#10B981" />
                          <Text className="text-lg font-bold text-slate-800">
                            {habit.streakData.bestStreak}
                          </Text>
                          <Text className="text-xs font-medium text-slate-500">
                            Best
                          </Text>
                        </View>
                        <View className="items-center gap-1">
                          <CheckCircle size={16} color="#8B5CF6" />
                          <Text className="text-lg font-bold text-slate-800">
                            {habit.streakData.total}
                          </Text>
                          <Text className="text-xs font-medium text-slate-500">
                            Total
                          </Text>
                        </View>
                      </View>

                      {/* Progress Description */}
                      <View className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <Text className="text-slate-600 text-sm text-center">
                          {habit.streakData.streak === 0
                            ? "Start your streak today!"
                            : habit.streakData.streak === 1
                            ? "Great start! Keep going!"
                            : habit.streakData.streak < 7
                            ? "Building momentum! 🚀"
                            : habit.streakData.streak < 21
                            ? "You're on fire! 🔥"
                            : "Habit master! 🏆"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Motivation Section */}
              <View className="bg-indigo-50 p-5 rounded-2xl mb-4 border border-indigo-200">
                <View className="flex-row items-center gap-3 mb-4">
                  <MaterialCommunityIcons
                    name="lightbulb-on"
                    size={20}
                    color="#6366f1"
                  />
                  <Text className="text-lg font-semibold text-slate-800">
                    Streak Tips
                  </Text>
                </View>
                <View className="gap-2">
                  {streakTips.map((tip, index) => (
                    <Text
                      key={index}
                      className="text-sm text-slate-600 leading-5"
                    >
                      • {tip}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
