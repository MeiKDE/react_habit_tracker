import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
          paddingBottom: 8,
          paddingTop: 8,
          height: 72,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "fire" : "fire"}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-habit"
        options={{
          title: "Add Habit",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              className={`rounded-full p-2 ${focused ? "bg-indigo-100" : ""}`}
            >
              <MaterialCommunityIcons
                name={focused ? "plus" : "plus"}
                size={focused ? 28 : 24}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
