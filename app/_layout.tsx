import React from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { HabitsProvider } from "@/lib/habits-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// Suppress deprecation warnings from dependencies
import { LogBox } from "react-native";
LogBox.ignoreLogs([
  "props.pointerEvents is deprecated. Use style.pointerEvents",
  '"shadow*" style props are deprecated. Use "boxShadow"',
  // Add any other warnings that might appear
  "VirtualizedLists should never be nested",
]);

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
      <AuthProvider>
        <HabitsProvider>
          <PaperProvider>
            <SafeAreaProvider>
              <RouteGuard>
                <Stack>
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
