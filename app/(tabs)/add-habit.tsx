import { useAuth } from "@/lib/auth-context";
import { useHabits } from "@/lib/habits-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
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
    <View className="flex-1 p-4 bg-gray-100 justify-center">
      <TextInput
        label="Title"
        mode="outlined"
        value={title}
        onChangeText={setTitle}
        className="mb-4"
        disabled={loading}
      />
      <TextInput
        label="Description"
        mode="outlined"
        value={description}
        onChangeText={setDescription}
        className="mb-4"
        disabled={loading}
      />
      <View className="mb-6">
        <SegmentedButtons
          value={frequency}
          onValueChange={(value) => setFrequency(value as Frequency)}
          buttons={FREQUENCIES.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))}
        />
      </View>
      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={!title || !description || loading}
        loading={loading}
      >
        Add Habit
      </Button>
      {error && (
        <Text
          style={{ color: theme.colors.error }}
          className="mt-4 text-center"
        >
          {error}
        </Text>
      )}
    </View>
  );
}
