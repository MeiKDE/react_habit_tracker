import {
  client,
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  COLLECTION_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/database.type";
import { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { Query } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Text } from "react-native-paper";

export default function StreaksScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);
  const { user } = useAuth();

  const fetchHabits = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      setHabits(response.documents as Habit[]);
    } catch (error) {
      console.error(error);
    }
  }, [user?.$id]);

  const fetchCompletions = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      const completions = response.documents as HabitCompletion[];
      setCompletedHabits(completions);
    } catch (error) {
      console.error(error);
    }
  }, [user?.$id]);

  useEffect(() => {
    if (user) {
      const habitsChannel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;
      const habitsSubscription = client.subscribe(
        habitsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete"
            )
          ) {
            fetchHabits();
          }
        }
      );

      const completionsChannel = `databases.${DATABASE_ID}.collections.${COMPLETIONS_COLLECTION_ID}.documents`;
      const completionsSubscription = client.subscribe(
        completionsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchCompletions();
          }
        }
      );

      fetchHabits();
      fetchCompletions();

      return () => {
        habitsSubscription();
        completionsSubscription();
      };
    }
  }, [user, fetchHabits, fetchCompletions]);

  interface StreakData {
    streak: number;
    bestStreak: number;
    total: number;
  }

  const getStreakData = (habitId: string): StreakData => {
    const habitCompletions = completedHabits
      ?.filter((c) => c.habit_id === habitId)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime()
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
      const date = new Date(c.completed_at);
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
    const { streak, bestStreak, total } = getStreakData(habit.$id);
    return { habit, bestStreak, streak, total };
  });

  const rankedHabits = habitStreaks.sort((a, b) => b.bestStreak - a.bestStreak);

  return (
    <View className="flex-1 bg-[#f5f5f5] p-4">
      <Text className="font-bold mb-4" variant="headlineSmall">
        Habit Streaks
      </Text>

      {rankedHabits.length > 0 && (
        <View className="mb-6 bg-white rounded-[16px] p-4 shadow-md">
          <Text className="font-bold text-[18px] mb-3 text-[#7c4dff] tracking-[0.5px]">
            🏅 Top Streaks
          </Text>
          {rankedHabits.slice(0, 3).map((item, key) => (
            <View
              key={key}
              className="flex flex-row items-center mb-2 border-b border-[#f0f0f0] pb-2"
            >
              <View
                className={`w-[28px] h-[28px] rounded-[14px] items-center justify-center mr-[10px] ${
                  key === 0
                    ? "bg-[#ffd700]"
                    : key === 1
                    ? "bg-[#c0c0c0]"
                    : key === 2
                    ? "bg-[#cd7f32]"
                    : "bg-[#e0e0e0]"
                }`}
              >
                <Text className="font-bold text-white text-[15px]">
                  {key + 1}
                </Text>
              </View>
              <Text className="flex-1 text-[15px] text-[#333] font-semibold">
                {item.habit.title}
              </Text>
              <Text className="text-[14px] text-[#7c4dff] font-bold">
                {item.bestStreak}
              </Text>
            </View>
          ))}
        </View>
      )}

      {habits.length === 0 ? (
        <View>
          <Text> No Habits yet. Add your first Habit!</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-[#f5f5f5] p-4"
        >
          {rankedHabits.map(({ habit, streak, bestStreak, total }, key) => (
            <Card
              key={key}
              className={[
                "mb-[18px] rounded-[18px] bg-white shadow-md border border-[#f0f0f0]",
                key === 0 && "border-2 border-[#7c4dff]",
              ]
                .filter(Boolean)
                .join(" ")}
              // style={[styles.card, key === 0 && styles.firstCard]}
            >
              <Card.Content>
                <Text
                  variant="titleMedium"
                  className="font-bold text-[18px] mb-[2px]"
                >
                  {" "}
                  {habit.title}
                </Text>
                <Text className="text-[#6c6c80] mb-2">
                  {" "}
                  {habit.description}
                </Text>
                <View className="flex flex-row justify-between mt-2 mb-3">
                  <View className="bg-[#fff3e0] rounded-[10px] px-3 py-[6px] items-center min-w-[60px]">
                    <Text className="font-bold text-[15px] text-[#22223b]">
                      {" "}
                      🔥 {streak}
                    </Text>
                    <Text className="text-[11px] text-[#888] mt-[2px] font-medium">
                      {" "}
                      Current
                    </Text>
                  </View>
                  <View className="bg-[#fffde7] rounded-[10px] px-3 py-[6px] items-center min-w-[60px]">
                    <Text className="font-bold text-[15px] text-[#22223b]">
                      {" "}
                      🏆 {bestStreak}
                    </Text>
                    <Text className="text-[11px] text-[#888] mt-[2px] font-medium">
                      {" "}
                      Best
                    </Text>
                  </View>
                  <View className="bg-[#e8f5e9] rounded-[10px] px-3 py-[6px] items-center min-w-[60px]">
                    <Text className="font-bold text-[15px] text-[#22223b]">
                      {" "}
                      ✅ {total}
                    </Text>
                    <Text className="text-[11px] text-[#888] mt-[2px] font-medium">
                      {" "}
                      Total
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
