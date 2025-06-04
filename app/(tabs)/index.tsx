import { useAuth } from "@/lib/auth-context";
import { HabitsAPI, Habit, HabitCompletion } from "@/lib/habits-api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

export default function Index() {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchTodayCompletions();
    }
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const fetchedHabits = await HabitsAPI.getUserHabits();
      setHabits(fetchedHabits);
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayCompletions = async () => {
    if (!user) return;

    try {
      const completions = await HabitsAPI.getTodayCompletions();
      setCompletedHabits(completions.map((c) => c.habitId));
    } catch (error) {
      console.error("Error fetching completions:", error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await HabitsAPI.deleteHabit(id);
      // Refresh habits list
      fetchHabits();
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const handleCompleteHabit = async (id: string) => {
    if (!user || completedHabits?.includes(id)) return;

    try {
      await HabitsAPI.createCompletion({
        habitId: id,
        completedAt: new Date().toISOString(),
      });

      // Refresh both habits and completions
      fetchHabits();
      fetchTodayCompletions();
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const isHabitCompleted = (habitId: string) =>
    completedHabits?.includes(habitId);

  //Swipe from right
  const renderRightActions = (habitId: string) => (
    <View className="justify-center items-end flex-1 bg-green-500 rounded-[18px] mb-4.5 mt-0.5 pr-4">
      {isHabitCompleted(habitId) ? (
        <Text className="text-white">Completed!</Text>
      ) : (
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color={"#fff"}
        />
      )}
    </View>
  );

  //Swipe from left
  const renderLeftActions = () => (
    <View className="justify-center items-start flex-1 bg-red-600 rounded-[18px] mb-4.5 mt-0.5 pl-4">
      <MaterialCommunityIcons
        name="trash-can-outline"
        size={32}
        color={"#fff"}
      />
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <View className="flex-row justify-between items-center mb-6">
        <Text variant="headlineSmall" className="font-bold">
          Today&apos;s Habits
        </Text>
        <Button mode="text" onPress={signOut} icon={"logout"}>
          Sign Out
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">Loading habits...</Text>
          </View>
        ) : habits?.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">
              No Habits yet. Add your first Habit!
            </Text>
          </View>
        ) : (
          habits?.map((habit, key) => (
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
                className={`mb-4.5 rounded-[18px] bg-purple-50 ${
                  isHabitCompleted(habit.id) ? "opacity-60" : ""
                }`}
                elevation={3}
                style={{
                  boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
                }}
              >
                <View className="p-5">
                  <Text className="text-xl font-bold mb-1 text-[#22223b]">
                    {habit.title}
                  </Text>
                  <Text className="text-base mb-4 text-gray-600">
                    {habit.description}
                  </Text>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center bg-orange-50 rounded-xl px-2.5 py-1">
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color={"#ff9800"}
                      />
                      <Text className="ml-1.5 text-orange-500 font-bold text-sm">
                        {habit.streakCount} day streak
                      </Text>
                    </View>
                    <View className="bg-purple-50 rounded-xl px-3 py-1">
                      <Text className="text-purple-500 font-bold text-sm">
                        {habit.frequency.charAt(0).toUpperCase() +
                          habit.frequency.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
