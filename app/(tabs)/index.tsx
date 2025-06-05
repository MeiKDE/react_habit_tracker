import { useAuth } from "@/lib/auth-context";
import { useHabits } from "@/lib/habits-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState, useCallback } from "react";
import { ScrollView, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

export default function Index() {
  const { signOut, user } = useAuth();
  const {
    habits,
    loading,
    error,
    deleteHabit,
    completeHabit,
    getTodayCompletions,
    refreshHabits,
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

  const fetchTodayCompletions = useCallback(async () => {
    if (!user) return;

    try {
      const completions = await getTodayCompletions();
      setCompletedHabits(completions.map((c) => c.habitId));
    } catch (error) {
      console.error("Error fetching completions:", error);
    }
  }, [user, getTodayCompletions]);

  useEffect(() => {
    if (user) {
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
      // Refresh completions after completing a habit
      await fetchTodayCompletions();
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const isHabitCompleted = (habitId: string) =>
    //checks if the array completedHabits already contains the given id
    completedHabits?.includes(habitId);

  //Swipe from right
  const renderRightActions = (habitId: string) => (
    <View className="justify-center items-end flex-1 bg-emerald-500 rounded-2xl mb-3 mt-1 pr-6">
      {isHabitCompleted(habitId) ? (
        <View className="items-center">
          <MaterialCommunityIcons name="check-circle" size={28} color="#fff" />
          <Text className="text-white text-xs font-medium mt-1">
            Completed!
          </Text>
        </View>
      ) : (
        <View className="items-center">
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={28}
            color="#fff"
          />
          <Text className="text-white text-xs font-medium mt-1">Complete</Text>
        </View>
      )}
    </View>
  );

  //Swipe from left
  const renderLeftActions = () => (
    <View className="justify-center items-start flex-1 bg-red-500 rounded-2xl mb-3 mt-1 pl-6">
      <View className="items-center">
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={28}
          color="#fff"
        />
        <Text className="text-white text-xs font-medium mt-1">Delete</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <View className="px-6 pt-4 pb-6 bg-white shadow-sm border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <View>
            <Text
              variant="headlineMedium"
              className="font-bold text-slate-800 mb-1"
            >
              Today&apos;s Habits
            </Text>
            <Text className="text-slate-500 text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <Button
            mode="outlined"
            onPress={signOut}
            icon="logout"
            className="border-slate-200"
            textColor="#64748b"
          >
            Sign Out
          </Button>
        </View>
      </View>

      {/* Error State */}
      {error && (
        <View className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="items-center">
              <View className="w-12 h-12 bg-indigo-100 rounded-full justify-center items-center mb-4">
                <MaterialCommunityIcons
                  name="loading"
                  size={24}
                  color="#6366f1"
                />
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
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  size={32}
                  color="#6366f1"
                />
              </View>
              <Text className="text-xl font-semibold text-slate-800 mb-2">
                No habits yet
              </Text>
              <Text className="text-slate-500 text-center px-8">
                Start building better habits by adding your first one!
              </Text>
            </View>
          </View>
        ) : (
          <View className="space-y-4">
            {habits?.map((habit, key) => (
              <Swipeable
                ref={(ref) => {
                  swipeableRefs.current[habit.id] = ref;
                }}
                key={key}
                overshootLeft={false}
                overshootRight={false}
                renderLeftActions={renderLeftActions}
                renderRightActions={() => renderRightActions(habit.id)}
                onSwipeableOpen={(direction) => {
                  if (direction === "left") {
                    handleDeleteHabit(habit.id);
                  } else if (direction === "right") {
                    handleCompleteHabit(habit.id);
                  }
                  swipeableRefs.current[habit.id]?.close();
                }}
              >
                <Surface
                  className={`rounded-2xl bg-white border border-gray-100 ${
                    isHabitCompleted(habit.id) ? "opacity-70" : ""
                  }`}
                  elevation={2}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                  }}
                >
                  <View className="p-6">
                    {/* Habit Title and Description */}
                    <View className="mb-4">
                      <Text className="text-xl font-bold mb-2 text-slate-800 leading-tight">
                        {habit.title}
                      </Text>
                      <Text className="text-base text-slate-600 leading-relaxed">
                        {habit.description}
                      </Text>
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row justify-between items-center">
                      {/* Streak Badge */}
                      <View className="flex-row items-center bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                        <MaterialCommunityIcons
                          name="fire"
                          size={16}
                          color="#ea580c"
                        />
                        <Text className="ml-2 text-orange-600 font-semibold text-sm">
                          {habit.streakCount} day
                          {habit.streakCount !== 1 ? "s" : ""}
                        </Text>
                      </View>

                      {/* Status Badge */}
                      {isHabitCompleted(habit.id) ? (
                        <View className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex-row items-center">
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={16}
                            color="#059669"
                          />
                          <Text className="ml-2 text-emerald-600 font-semibold text-sm">
                            Completed!
                          </Text>
                        </View>
                      ) : (
                        <View className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
                          <Text className="text-indigo-600 font-semibold text-sm">
                            {getFrequencyLabel(habit.frequency)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Surface>
              </Swipeable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
