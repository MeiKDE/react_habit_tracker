import AsyncStorage from "@react-native-async-storage/async-storage";

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("@auth_token");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = await getAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
};
