import { HabitsAPI } from "@/lib/habits-api";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Text } from "react-native-paper";

export default function StreaksScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHabits = useCallback(async () => {
    if (!user) return;

    try {
      const response = await HabitsAPI.getUserHabits();
      setHabits(response);
    } catch (error) {
      console.error("Error fetching habits:", error);
    }
  }, [user]);

  const fetchCompletions = useCallback(async () => {
    if (!user) return;

    try {
      const response = await HabitsAPI.getAllCompletions();
      setCompletedHabits(response);
    } catch (error) {
      console.error("Error fetching completions:", error);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([fetchHabits(), fetchCompletions()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchHabits, fetchCompletions, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  interface StreakData {
    streak: number;
    bestStreak: number;
    total: number;
  }

  const getStreakData = (habitId: string): StreakData => {
    const habitCompletions = completedHabits
      ?.filter((c) => c.habitId === habitId)
      .sort(
        (a, b) =>
          new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
      );

    if (habitCompletions?.length === 0) {
      return { streak: 0, bestStreak: 0, total: 0 };
    }

    // build streak data
    let streak = 0;
    let bestStreak = 0;
    let total = habitCompletions.length;

    let lastDate: Date | null = null;
    let currentStreak = 0;

    habitCompletions?.forEach((c) => {
      const date = new Date(c.completedAt);
      if (lastDate) {
        const diff =
          (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diff <= 1.5) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      if (currentStreak > bestStreak) bestStreak = currentStreak;
      streak = currentStreak;
      lastDate = date;
    });

    return { streak, bestStreak, total };
  };

  const habitStreaks = habits.map((habit) => {
    const { streak, bestStreak, total } = getStreakData(habit.id);
    return { habit, bestStreak, streak, total };
  });

  const rankedHabits = habitStreaks.sort((a, b) => b.bestStreak - a.bestStreak);

  if (loading) {
    return (
      <View className="flex-1 bg-gradient-to-br from-slate-50 to-gray-100 justify-center items-center">
        <View className="items-center">
          <View className="w-12 h-12 bg-indigo-100 rounded-full justify-center items-center mb-4">
            <MaterialCommunityIcons name="loading" size={24} color="#6366f1" />
          </View>
          <Text className="text-slate-600 font-medium">Loading streaks...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <View className="px-6 pt-4 pb-6 bg-white shadow-sm border-b border-gray-100">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-amber-100 rounded-full justify-center items-center mr-4">
            <MaterialCommunityIcons name="fire" size={20} color="#f59e0b" />
          </View>
          <View>
            <Text variant="headlineMedium" className="font-bold text-slate-800">
              Habit Streaks
            </Text>
            <Text className="text-slate-500 text-sm">
              Track your consistency and progress
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }}
      >
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
          <View className="space-y-6">
            {/* Top Performers Section */}
            {rankedHabits.length > 0 && (
              <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <View className="flex-row items-center mb-4">
                  <MaterialCommunityIcons
                    name="trophy"
                    size={20}
                    color="#f59e0b"
                  />
                  <Text className="ml-2 text-lg font-bold text-slate-800">
                    Top Performers
                  </Text>
                </View>

                <View className="space-y-3">
                  {rankedHabits.slice(0, 3).map((item, index) => (
                    <View
                      key={index}
                      className="flex-row items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100"
                    >
                      {/* Medal */}
                      <View
                        className={`w-8 h-8 rounded-full items-center justify-center mr-4 ${
                          index === 0
                            ? "bg-yellow-400"
                            : index === 1
                            ? "bg-gray-300"
                            : "bg-orange-300"
                        }`}
                      >
                        <Text className="font-bold text-white text-sm">
                          {index + 1}
                        </Text>
                      </View>

                      {/* Habit Info */}
                      <View className="flex-1">
                        <Text className="font-semibold text-slate-800 mb-1">
                          {item.habit.title}
                        </Text>
                        <Text className="text-xs text-slate-600">
                          Best streak: {item.bestStreak} days
                        </Text>
                      </View>

                      {/* Streak Badge */}
                      <View className="bg-white rounded-lg px-3 py-1 border border-amber-200">
                        <Text className="font-bold text-amber-600">
                          🔥 {item.bestStreak}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* All Habits Section */}
            <View className="space-y-4">
              <Text className="text-lg font-bold text-slate-800 px-2">
                All Your Habits
              </Text>

              {rankedHabits.map(
                ({ habit, streak, bestStreak, total }, index) => (
                  <Card
                    key={index}
                    className="rounded-2xl bg-white border border-gray-100"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <Card.Content className="p-6">
                      {/* Habit Header */}
                      <View className="mb-4">
                        <Text className="text-lg font-bold text-slate-800 mb-1">
                          {habit.title}
                        </Text>
                        <Text className="text-slate-600 leading-relaxed">
                          {habit.description}
                        </Text>
                      </View>

                      {/* Stats Grid */}
                      <View className="flex-row justify-between space-x-3">
                        {/* Current Streak */}
                        <View className="flex-1 bg-orange-50 border border-orange-100 rounded-xl p-4 items-center">
                          <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons
                              name="fire"
                              size={16}
                              color="#ea580c"
                            />
                            <Text className="ml-1 text-xs font-medium text-orange-600 uppercase tracking-wide">
                              Current
                            </Text>
                          </View>
                          <Text className="text-2xl font-bold text-slate-800">
                            {streak}
                          </Text>
                          <Text className="text-xs text-slate-500 mt-1">
                            day{streak !== 1 ? "s" : ""}
                          </Text>
                        </View>

                        {/* Best Streak */}
                        <View className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-4 items-center">
                          <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons
                              name="trophy"
                              size={16}
                              color="#f59e0b"
                            />
                            <Text className="ml-1 text-xs font-medium text-amber-600 uppercase tracking-wide">
                              Best
                            </Text>
                          </View>
                          <Text className="text-2xl font-bold text-slate-800">
                            {bestStreak}
                          </Text>
                          <Text className="text-xs text-slate-500 mt-1">
                            day{bestStreak !== 1 ? "s" : ""}
                          </Text>
                        </View>

                        {/* Total Completions */}
                        <View className="flex-1 bg-emerald-50 border border-emerald-100 rounded-xl p-4 items-center">
                          <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={16}
                              color="#059669"
                            />
                            <Text className="ml-1 text-xs font-medium text-emerald-600 uppercase tracking-wide">
                              Total
                            </Text>
                          </View>
                          <Text className="text-2xl font-bold text-slate-800">
                            {total}
                          </Text>
                          <Text className="text-xs text-slate-500 mt-1">
                            time{total !== 1 ? "s" : ""}
                          </Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                )
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
