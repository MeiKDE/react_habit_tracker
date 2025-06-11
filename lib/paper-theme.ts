import { MD3LightTheme } from "react-native-paper";
import { Platform } from "react-native";

// Custom theme that disables native animations on web
export const customTheme = {
  ...MD3LightTheme,
  // Add custom theme overrides if needed
  colors: {
    ...MD3LightTheme.colors,
    // You can customize colors here if needed
  },
};

// Configuration to disable native driver on web
export const paperConfig = {
  // Disable native animations on web platform
  settings: {
    // This will be passed to components that support it
    rippleEffectEnabled: Platform.OS !== "web",
  },
};
