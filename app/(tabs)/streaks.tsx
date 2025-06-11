import { useAuth } from "@/lib/auth-context";
import { useHabits } from "@/lib/habits-context";
import { Habit, StreakData } from "@/lib/appwrite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Text } from "react-native-paper";

export default function StreaksScreen() {
  const { user } = useAuth();
  const { habits, isLoading, getHabitStreak } = useHabits();

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

  if (isLoading) {
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
          <View>
            {/* Top Performers Section */}
            {rankedHabits.length > 0 && (
              <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
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

                <View>
                  {rankedHabits.slice(0, 3).map((item, index) => (
                    <View
                      key={item.$id}
                      className="flex-row items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 mb-3"
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
                        <Text className="text-slate-800 font-semibold text-base">
                          {item.title}
                        </Text>
                        <Text className="text-slate-500 text-sm">
                          Best streak: {item.streakData.bestStreak} days
                        </Text>
                      </View>

                      {/* Current Streak */}
                      <View className="items-center">
                        <MaterialCommunityIcons
                          name="fire"
                          size={20}
                          color="#f59e0b"
                        />
                        <Text className="text-amber-600 font-bold text-sm">
                          {item.streakData.streak}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* All Habits Section */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <MaterialCommunityIcons
                  name="chart-timeline-variant"
                  size={20}
                  color="#6366f1"
                />
                <Text className="ml-2 text-lg font-bold text-slate-800">
                  All Habits
                </Text>
              </View>

              <View>
                {habitStreaks.map((item) => (
                  <Card
                    key={item.$id}
                    className="bg-slate-50 border border-slate-200 mb-4"
                    elevation={0}
                  >
                    <View className="p-4">
                      {/* Habit Header */}
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                          <View
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: item.color }}
                          />
                          <View className="flex-1">
                            <Text className="text-slate-800 font-semibold text-base">
                              {item.title}
                            </Text>
                            <Text className="text-slate-500 text-sm">
                              {item.frequency.charAt(0) +
                                item.frequency.slice(1).toLowerCase()}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Stats Grid */}
                      <View className="flex-row justify-between">
                        {/* Current Streak */}
                        <View className="items-center bg-white rounded-xl p-3 flex-1 mr-2">
                          <MaterialCommunityIcons
                            name="fire"
                            size={20}
                            color="#f59e0b"
                          />
                          <Text className="text-amber-600 font-bold text-lg mt-1">
                            {item.streakData.streak}
                          </Text>
                          <Text className="text-slate-500 text-xs">
                            Current
                          </Text>
                        </View>

                        {/* Best Streak */}
                        <View className="items-center bg-white rounded-xl p-3 flex-1 mx-1">
                          <MaterialCommunityIcons
                            name="trophy"
                            size={20}
                            color="#10b981"
                          />
                          <Text className="text-emerald-600 font-bold text-lg mt-1">
                            {item.streakData.bestStreak}
                          </Text>
                          <Text className="text-slate-500 text-xs">Best</Text>
                        </View>

                        {/* Total Completions */}
                        <View className="items-center bg-white rounded-xl p-3 flex-1 ml-2">
                          <MaterialCommunityIcons
                            name="check-all"
                            size={20}
                            color="#6366f1"
                          />
                          <Text className="text-indigo-600 font-bold text-lg mt-1">
                            {item.streakData.total}
                          </Text>
                          <Text className="text-slate-500 text-xs">Total</Text>
                        </View>
                      </View>

                      {/* Progress Description */}
                      <View className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <Text className="text-slate-600 text-sm text-center">
                          {item.streakData.streak === 0
                            ? "Start your streak today!"
                            : item.streakData.streak === 1
                            ? "Great start! Keep going!"
                            : item.streakData.streak < 7
                            ? "Building momentum! 🚀"
                            : item.streakData.streak < 21
                            ? "You're on fire! 🔥"
                            : "Habit master! 🏆"}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </View>

            {/* Motivation Section */}
            <View className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={20}
                  color="#6366f1"
                />
                <Text className="ml-2 text-indigo-700 font-semibold">
                  Streak Tips
                </Text>
              </View>
              <Text className="text-indigo-600 text-sm leading-relaxed">
                • Consistency beats perfection - focus on showing up daily
                {"\n"}• Track your progress to stay motivated
                {"\n"}• Celebrate small wins along the way
                {"\n"}• Don&apos;t break the chain!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
