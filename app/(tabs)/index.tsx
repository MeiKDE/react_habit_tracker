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
        {isLoading ? (
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
                Create your first habit to start building better routines
              </Text>
            </View>
          </View>
        ) : (
          <View>
            {/* Habits List */}
            {habits?.map((habit) => {
              const streakData = getHabitStreak(habit);
              const isCompleted = isHabitCompleted(habit.$id);

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
                      // Close the swipeable after completing
                      swipeableRefs.current[habit.$id]?.close();
                    } else if (direction === "left") {
                      handleDeleteHabit(habit.$id);
                    }
                  }}
                >
                  <Surface
                    className={`p-5 rounded-2xl mb-3 mt-1 border ${
                      isCompleted
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white border-gray-100"
                    }`}
                    elevation={isCompleted ? 0 : 1}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-2">
                          <View
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: habit.color }}
                          />
                          <Text
                            variant="titleMedium"
                            className={`font-semibold flex-1 ${
                              isCompleted
                                ? "text-emerald-700"
                                : "text-slate-800"
                            }`}
                          >
                            {habit.title}
                          </Text>
                          {isCompleted && (
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={20}
                              color="#059669"
                            />
                          )}
                        </View>

                        <View className="flex-row items-center justify-between">
                          <Text
                            className={`text-sm ${
                              isCompleted
                                ? "text-emerald-600"
                                : "text-slate-500"
                            }`}
                          >
                            {getFrequencyLabel(habit.frequency)} •{" "}
                            {streakData.streak} day streak
                          </Text>
                          <Text
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {streakData.total} total
                          </Text>
                        </View>

                        {habit.description && (
                          <Text
                            className={`text-sm mt-2 ${
                              isCompleted
                                ? "text-emerald-600"
                                : "text-slate-500"
                            }`}
                          >
                            {habit.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Surface>
                </Swipeable>
              );
            })}

            {/* Usage Instructions */}
            <View className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <Text className="text-indigo-700 font-medium mb-2">
                Quick Actions
              </Text>
              <Text className="text-indigo-600 text-sm leading-relaxed">
                Swipe right on a habit to mark it as complete, or swipe left to
                delete it.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
