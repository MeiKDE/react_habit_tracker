import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys for secure storage
export const SECURE_KEYS = {
  ACCESS_TOKEN: "secure_access_token",
  REFRESH_TOKEN: "secure_refresh_token",
  USER_CREDENTIALS: "secure_user_credentials",
} as const;

// Keys for regular storage
export const STORAGE_KEYS = {
  CURRENT_USER: "current_user",
  APP_SETTINGS: "app_settings",
} as const;

/**
 * Secure storage for sensitive data (tokens, credentials)
 */
export class SecureStorage {
  /**
   * Store sensitive data securely with fallback
   */
  static async setSecureItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn("SecureStore failed, falling back to AsyncStorage:", error);
      // Fallback to AsyncStorage if SecureStore fails
      try {
        await AsyncStorage.setItem(`secure_fallback_${key}`, value);
      } catch (fallbackError) {
        console.error(
          "Both SecureStore and AsyncStorage failed:",
          fallbackError
        );
        throw new Error("Failed to store sensitive data");
      }
    }
  }

  /**
   * Retrieve sensitive data securely with fallback
   */
  static async getSecureItem(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value !== null) {
        return value;
      }
    } catch (error) {
      console.warn(
        "SecureStore retrieval failed, trying AsyncStorage fallback:",
        error
      );
    }

    // Try fallback storage
    try {
      return await AsyncStorage.getItem(`secure_fallback_${key}`);
    } catch (error) {
      console.error("Failed to retrieve from both stores:", error);
      return null;
    }
  }

  /**
   * Remove sensitive data with fallback cleanup
   */
  static async removeSecureItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn("SecureStore deletion failed:", error);
      // Don't throw error for deletion failures
    }

    // Also clean up fallback storage
    try {
      await AsyncStorage.removeItem(`secure_fallback_${key}`);
    } catch (error) {
      console.warn("AsyncStorage fallback deletion failed:", error);
      // Don't throw error for deletion failures
    }
  }

  /**
   * Store token pair securely
   */
  static async storeTokenPair(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    try {
      await Promise.all([
        this.setSecureItem(SECURE_KEYS.ACCESS_TOKEN, accessToken),
        this.setSecureItem(SECURE_KEYS.REFRESH_TOKEN, refreshToken),
      ]);
    } catch (error) {
      console.error("Failed to store token pair:", error);
      throw new Error("Failed to store authentication tokens");
    }
  }

  /**
   * Retrieve token pair
   */
  static async getTokenPair(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.getSecureItem(SECURE_KEYS.ACCESS_TOKEN),
        this.getSecureItem(SECURE_KEYS.REFRESH_TOKEN),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Failed to retrieve token pair:", error);
      return { accessToken: null, refreshToken: null };
    }
  }

  /**
   * Clear all authentication tokens
   */
  static async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        this.removeSecureItem(SECURE_KEYS.ACCESS_TOKEN),
        this.removeSecureItem(SECURE_KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error("Failed to clear tokens:", error);
      // Don't throw error for cleanup operations
    }
  }

  /**
   * Store user data in regular storage (non-sensitive)
   */
  static async storeUserData(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(user)
      );
    } catch (error) {
      console.error("Failed to store user data:", error);
      throw new Error("Failed to store user information");
    }
  }

  /**
   * Retrieve user data
   */
  static async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Failed to retrieve user data:", error);
      return null;
    }
  }

  /**
   * Clear user data
   */
  static async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (error) {
      console.error("Failed to clear user data:", error);
      // Don't throw error for cleanup operations
    }
  }

  /**
   * Clear all stored data (sign out)
   */
  static async clearAllData(): Promise<void> {
    await Promise.all([this.clearTokens(), this.clearUserData()]);
  }
}

/**
 * Token refresh utilities
 */
export class TokenManager {
  private static refreshPromise: Promise<boolean> | null = null;

  /**
   * Check if access token is expired (basic check without validation)
   */
  static isTokenExpired(token: string | null): boolean {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      // Check if token expires within 5 minutes
      return payload.exp <= currentTime + 300;
    } catch (error) {
      console.error("Failed to parse token:", error);
      return true;
    }
  }

  /**
   * Refresh access token if needed
   */
  static async refreshTokenIfNeeded(): Promise<boolean> {
    // Prevent multiple refresh attempts
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    const { accessToken, refreshToken } = await SecureStorage.getTokenPair();

    if (!refreshToken) {
      return false;
    }

    if (!this.isTokenExpired(accessToken)) {
      return true; // Token is still valid
    }

    // Start refresh process
    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private static async performTokenRefresh(
    refreshToken: string
  ): Promise<boolean> {
    try {
      // This would call your refresh API endpoint
      // For now, we'll return false to force re-authentication
      console.log("Token refresh needed - redirecting to login");
      await SecureStorage.clearAllData();
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      await SecureStorage.clearAllData();
      return false;
    }
  }
}
