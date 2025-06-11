import { Platform } from "react-native";

// Disable native animations on web to fix useNativeDriver errors
if (Platform.OS === "web") {
  // Patch Animated to disable native driver by default
  const { Animated } = require("react-native");

  // Store original timing function
  const originalTiming = Animated.timing;

  // Override timing to disable useNativeDriver on web
  Animated.timing = (value: any, config: any) => {
    return originalTiming(value, {
      ...config,
      useNativeDriver: false, // Always disable on web
    });
  };

  // Store original spring function
  const originalSpring = Animated.spring;

  // Override spring to disable useNativeDriver on web
  Animated.spring = (value: any, config: any) => {
    return originalSpring(value, {
      ...config,
      useNativeDriver: false, // Always disable on web
    });
  };

  // Store original decay function
  const originalDecay = Animated.decay;

  // Override decay to disable useNativeDriver on web
  Animated.decay = (value: any, config: any) => {
    return originalDecay(value, {
      ...config,
      useNativeDriver: false, // Always disable on web
    });
  };
}

export {};
