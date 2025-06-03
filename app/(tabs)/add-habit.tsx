import { DATABASE_ID, databases, COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ID } from "react-native-appwrite";
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
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        user_id: user.$id,
        title,
        description,
        frequency,
        streak_count: 0,
        last_completed: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }

      setError("There was an error creating the habit");
    }
  };

  return (
    <View className="flex-1 p-4 bg-gray-100 justify-center">
      <TextInput
        label="Title"
        mode="outlined"
        onChangeText={setTitle}
        className="mb-4"
      />
      <TextInput
        label="Description"
        mode="outlined"
        onChangeText={setDescription}
        className="mb-4"
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
        disabled={!title || !description}
      >
        Add Habit
      </Button>
      {error && <Text className="text-red-500">{theme.colors.error}</Text>}
    </View>
  );
}
