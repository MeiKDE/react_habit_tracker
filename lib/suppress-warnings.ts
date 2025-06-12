// Suppress React Native web deprecation warnings
// This must be imported before any other React Native components
import { LogBox } from "react-native";

// Configure LogBox to ignore common React Native web warnings
LogBox.ignoreLogs([
  // Pointer events deprecation warning - multiple patterns
  "props.pointerEvents is deprecated. Use style.pointerEvents",
  "pointerEvents is deprecated",
  /props\.pointerEvents is deprecated/i,
  /pointerEvents.*deprecated/i,

  // Shadow props deprecation warnings - multiple patterns
  '"shadow*" style props are deprecated. Use "boxShadow"',
  '"shadow*" style props are deprecated',
  'shadow* style props are deprecated. Use "boxShadow"',
  "shadow* style props are deprecated",
  /"shadow.*style props are deprecated/i,
  /shadow.*deprecated.*boxShadow/i,
  /shadow.*deprecated/i,
  /boxShadow/i,
  "shadowColor",
  "shadowOffset",
  "shadowOpacity",
  "shadowRadius",
  "elevation",

  // Animation warnings
  "useNativeDriver is not supported",
  /useNativeDriver.*not supported/i,
  /Animated.*useNativeDriver/i,

  // Other common warnings
  "VirtualizedLists should never be nested",
  /VirtualizedLists.*nested/i,
]);

// Comprehensive console warning suppression for known React Native Web issues
if (__DEV__) {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args) => {
    const message = typeof args[0] === "string" ? args[0] : "";

    // Shadow-related deprecation warnings
    if (
      (message.includes("shadow") && message.includes("deprecated")) ||
      message.includes("boxShadow") ||
      message.includes("shadowColor") ||
      message.includes("shadowOffset") ||
      message.includes("shadowOpacity") ||
      message.includes("shadowRadius") ||
      message.includes('"shadow*" style props')
    ) {
      return; // Suppress these warnings
    }

    // Pointer events deprecation warnings
    if (
      message.includes("pointerEvents is deprecated") ||
      message.includes("props.pointerEvents is deprecated")
    ) {
      return; // Suppress these warnings
    }

    // Pass through all other warnings
    originalWarn(...args);
  };

  // Also suppress some error-level shadow warnings
  console.error = (...args) => {
    const message = typeof args[0] === "string" ? args[0] : "";

    // Only suppress error-level shadow warnings, not actual errors
    if (
      (message.includes("shadow") && message.includes("deprecated")) ||
      message.includes('"shadow*" style props')
    ) {
      return; // Suppress these error-level warnings
    }

    // Pass through all other errors
    originalError(...args);
  };
}

export {};
