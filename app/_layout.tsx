import React, { useEffect } from "react";
import "@/lib/suppress-warnings"; // Import warning suppression first
import "@/lib/web-config"; // Import web config early to patch animations
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { HabitsProvider } from "@/lib/habits-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "../global.css";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";

    if (!user && !inAuthGroup && !isLoadingUser) {
      router.replace("/auth");
    } else if (user && inAuthGroup && !isLoadingUser) {
      router.replace("/");
    }
  }, [user, segments, isLoadingUser, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <StatusBar style="dark" backgroundColor="#f5f5f5" />
      <AuthProvider>
        <HabitsProvider>
          <PaperProvider theme={MD3LightTheme}>
            <SafeAreaProvider>
              <RouteGuard>
                <Stack>
                  <Stack.Screen
                    name="auth"
                    options={{
                      title: "NextStartAI",
                      headerShown: true,
                    }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </RouteGuard>
            </SafeAreaProvider>
          </PaperProvider>
        </HabitsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
