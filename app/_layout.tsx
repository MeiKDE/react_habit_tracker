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
import { LinearGradient } from "expo-linear-gradient";
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

const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#8B5CF6",
    primaryContainer: "#F1F5F9",
    secondary: "#A855F7",
    surface: "#F8FAFC",
    background: "#F8FAFC",
    onSurface: "#1E293B",
    onBackground: "#1E293B",
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <LinearGradient colors={["#F8FAFC", "#E2E8F0"]} className="flex-1">
        <StatusBar style="dark" backgroundColor="#F8FAFC" />
        <AuthProvider>
          <HabitsProvider>
            <PaperProvider theme={customTheme}>
              <SafeAreaProvider>
                <RouteGuard>
                  <Stack
                    screenOptions={{
                      headerStyle: {
                        backgroundColor: "#F8FAFC",
                      },
                      headerTintColor: "#1E293B",
                      headerTitleStyle: {
                        fontFamily: "Inter-SemiBold",
                        fontSize: 18,
                      },
                      headerShadowVisible: false,
                    }}
                  >
                    <Stack.Screen
                      name="auth"
                      options={{
                        title: "NextStartAI",
                        headerShown: true,
                        headerStyle: {
                          backgroundColor: "transparent",
                        },
                        headerTitleStyle: {
                          fontFamily: "Inter-Bold",
                          fontSize: 20,
                          color: "#1E293B",
                        },
                      }}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={{
                        headerShown: false,
                      }}
                    />
                  </Stack>
                </RouteGuard>
              </SafeAreaProvider>
            </PaperProvider>
          </HabitsProvider>
        </AuthProvider>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}
