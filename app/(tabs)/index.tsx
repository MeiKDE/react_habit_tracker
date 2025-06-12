import { useAuth } from "@/lib/auth-context";
import { useHabits } from "@/lib/habits-context";
import { LogOut, CheckCircle, Circle, Trash2 } from "lucide-react-native";
import { useEffect, useRef, useState, useCallback } from "react";
import { ScrollView, View, Platform, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { signOut, user } = useAuth();
  const {
    habits,
    isLoading,
    error,
    deleteHabit,
    completeHabit,
    refreshHabits,
    getHabitStreak,
  } = useHabits();

  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  // Helper function to format frequency labels
  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "DAILY":
        return "Daily";
      case "WEEKLY":
        return "Weekly";
      case "MONTHLY":
        return "Monthly";
      default:
        return (
          frequency.charAt(0).toUpperCase() + frequency.slice(1).toLowerCase()
        );
    }
  };

  // Helper function to check if habit was completed today
  const isHabitCompletedToday = (habit: any) => {
    if (!habit.completions || habit.completions.length === 0) return false;

    const today = new Date().toISOString().split("T")[0];
    return habit.completions.some((completion: any) => {
      const completionDate = new Date(completion.completedAt)
        .toISOString()
        .split("T")[0];
      return completionDate === today;
    });
  };

  const fetchTodayCompletions = useCallback(() => {
    if (!user || !habits) return;

    // Extract completed habit IDs from today's completions
    const todayCompletions = habits
      .filter((habit) => isHabitCompletedToday(habit))
      .map((habit) => habit.$id);

    setCompletedHabits(todayCompletions);
  }, [user, habits]);

  useEffect(() => {
    if (user && habits) {
      fetchTodayCompletions();
    }
  }, [user, habits, fetchTodayCompletions]);

  const handleDeleteHabit = async (id: string) => {
    try {
      await deleteHabit(id);
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const handleCompleteHabit = async (id: string) => {
    if (!user || completedHabits?.includes(id)) return;

    try {
      await completeHabit(id);
      // The habit will be updated in the context automatically
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const isHabitCompleted = (habitId: string) =>
    //checks if the array completedHabits already contains the given id
    completedHabits?.includes(habitId);

  //Swipe from right (native only)
  const renderRightActions = (habitId: string) => (
    <View className="justify-center items-end flex-1 bg-emerald-500 rounded-2xl mb-4 pr-6">
      {isHabitCompleted(habitId) ? (
        <View className="items-center">
          <CheckCircle size={28} color="#fff" />
          <Text className="text-white text-xs font-medium mt-1">
            Completed!
          </Text>
        </View>
      ) : (
        <View className="items-center">
          <Circle size={28} color="#fff" />
          <Text className="text-white text-xs font-medium mt-1">Complete</Text>
        </View>
      )}
    </View>
  );

  //Swipe from left (native only)
  const renderLeftActions = () => (
    <View className="justify-center items-start flex-1 bg-red-500 rounded-2xl mb-4 pl-6">
      <View className="items-center">
        <Trash2 size={28} color="#fff" />
        <Text className="text-white text-xs font-medium mt-1">Delete</Text>
      </View>
    </View>
  );

  // Calculate progress
  const completedCount = completedHabits?.length || 0;
  const totalCount = habits?.length || 0;

  // Habit Card Component - optimized for both web and native
  const HabitCard = ({ habit }: { habit: any }) => {
    const streakData = getHabitStreak(habit);
    const isCompleted = isHabitCompleted(habit.$id);

    const cardContent = (
      <TouchableOpacity
        className={`rounded-2xl mb-4 shadow-sm ${
          isCompleted ? "bg-green-50 border border-green-200" : "bg-white"
        }`}
        onPress={() => handleCompleteHabit(habit.$id)}
      >
        <View className="flex-row items-center p-5">
          <View className="mr-4">
            {isCompleted ? (
              <CheckCircle size={24} color="#10B981" />
            ) : (
              <Circle size={24} color="#94A3B8" />
            )}
          </View>
          <View className="flex-1">
            <Text
              className={`text-lg font-semibold mb-1 ${
                isCompleted ? "text-emerald-700" : "text-slate-800"
              }`}
            >
              {habit.title}
            </Text>
            {habit.description && (
              <Text
                className={`text-sm mb-2 leading-5 ${
                  isCompleted ? "text-emerald-600" : "text-slate-500"
                }`}
              >
                {habit.description}
              </Text>
            )}
            <View className="flex-row items-center gap-3">
              <Text className="text-xs font-medium text-violet-500 bg-indigo-50 px-2 py-1 rounded">
                {getFrequencyLabel(habit.frequency)}
              </Text>
              <Text className="text-xs font-medium text-red-600">
                🔥 {streakData.streak} day streak
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            {isCompleted && (
              <View className="bg-green-100 px-2 py-1 rounded">
                <Text className="text-xs font-semibold text-emerald-700">
                  {streakData.total} total
                </Text>
              </View>
            )}
            {Platform.OS === "web" && (
              <TouchableOpacity
                onPress={() => handleDeleteHabit(habit.$id)}
                className="p-2 bg-red-50 rounded-lg ml-2"
              >
                <Trash2 size={16} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );

    // On native platforms, wrap with Swipeable for gesture support
    if (Platform.OS !== "web") {
      return (
        <Swipeable
          key={habit.$id}
          ref={(ref) => {
            swipeableRefs.current[habit.$id] = ref;
          }}
          renderRightActions={() => renderRightActions(habit.$id)}
          renderLeftActions={renderLeftActions}
          onSwipeableOpen={(direction) => {
            if (direction === "right") {
              handleCompleteHabit(habit.$id);
              swipeableRefs.current[habit.$id]?.close();
            } else if (direction === "left") {
              handleDeleteHabit(habit.$id);
            }
          }}
          useNativeAnimations={true}
        >
          {cardContent}
        </Swipeable>
      );
    }

    // On web, return the card without Swipeable wrapper
    return cardContent;
  };

  return (
    <LinearGradient colors={["#F8FAFC", "#E2E8F0"]} className="flex-1">
      <SafeAreaView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-3xl font-bold text-slate-800 mb-1">
              Today&apos;s Habits
            </Text>
            <Text className="text-base text-slate-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={signOut}
            className="flex-row items-center gap-2 bg-white py-2 px-3 rounded-lg border border-slate-200"
          >
            <LogOut size={20} color="#64748B" />
            <Text className="text-sm font-medium text-slate-500">Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <View className="bg-white p-5 rounded-2xl mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-slate-800">
              Daily Progress
            </Text>
            <Text className="text-lg font-bold text-violet-500">
              {completedCount}/{totalCount}
            </Text>
          </View>
          <View className="h-2 bg-slate-100 rounded-full mb-3 overflow-hidden">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{
                width:
                  totalCount > 0
                    ? `${(completedCount / totalCount) * 100}%`
                    : "0%",
              }}
            />
          </View>
          <Text className="text-sm font-medium text-slate-500 text-center">
            {completedCount === totalCount && totalCount > 0
              ? "🎉 All habits completed today!"
              : `${totalCount - completedCount} habits remaining`}
          </Text>
        </View>

        {/* Error State */}
        {error && (
          <View className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
            <Text className="text-red-700 font-medium mb-2">{error}</Text>
            <Button
              mode="text"
              onPress={refreshHabits}
              textColor="#dc2626"
              className="self-start -ml-2"
            >
              Try Again
            </Button>
          </View>
        )}

        {/* Content */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <View className="items-center">
                <View className="w-12 h-12 bg-indigo-100 rounded-full justify-center items-center mb-4">
                  <Circle size={24} color="#6366f1" />
                </View>
                <Text className="text-slate-600 font-medium">
                  Loading your habits...
                </Text>
              </View>
            </View>
          ) : habits?.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <View className="items-center">
                <View className="w-16 h-16 bg-indigo-100 rounded-full justify-center items-center mb-6">
                  <Circle size={32} color="#6366f1" />
                </View>
                <Text className="text-xl font-semibold text-slate-800 mb-2">
                  No habits yet
                </Text>
                <Text className="text-slate-500 text-center px-8">
                  Create your first habit to start building better routines
                </Text>
              </View>
            </View>
          ) : (
            <View>
              {/* Habits List */}
              {habits?.map((habit) => (
                <HabitCard key={habit.$id} habit={habit} />
              ))}

              {/* Usage Instructions */}
              <View className="bg-indigo-50 p-4 rounded-xl mt-4 border border-indigo-200">
                <Text className="text-sm font-semibold text-slate-800 mb-1">
                  Quick Actions
                </Text>
                <Text className="text-xs text-slate-500 leading-relaxed">
                  {Platform.OS === "web"
                    ? "Tap on a habit to mark it as complete, or use the delete button to remove it."
                    : "Tap on a habit to mark it as complete, or swipe left to delete it."}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
