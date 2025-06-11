// Suppress React Native web deprecation warnings
// This must be imported before any other React Native components
import { LogBox } from "react-native";

// Configure LogBox to ignore common React Native web warnings
LogBox.ignoreLogs([
  // Pointer events deprecation warning - multiple patterns
  "props.pointerEvents is deprecated. Use style.pointerEvents",
  /props\.pointerEvents is deprecated/i,
  /pointerEvents.*deprecated/i,

  // Shadow props deprecation warnings - multiple patterns
  '"shadow*" style props are deprecated. Use "boxShadow"',
  /"shadow.*style props are deprecated/i,
  /shadow.*deprecated.*boxShadow/i,
  /boxShadow/i,

  // Animation warnings
  "useNativeDriver is not supported",
  /useNativeDriver.*not supported/i,
  /Animated.*useNativeDriver/i,

  // Other common warnings
  "VirtualizedLists should never be nested",
  /VirtualizedLists.*nested/i,
]);

export {};
