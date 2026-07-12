import axios, { AxiosInstance } from "axios";
import { useAuth } from "@clerk/expo";
import { useEffect, useMemo } from "react";

export const BASE_URL = "http://192.168.1.8:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function useAuthenticated(): AxiosInstance {
  const { getToken } = useAuth();

  // useMemo ensures we don't recreate the interceptor configuration on every single component re-render
  const authenticatedApi = useMemo(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    instance.interceptors.request.use(
      async (config) => {
        try {
          // Pulls the fresh, active session JWT straight from Clerk's internal state manager
          const token = await getToken();

          console.log(
            "✈️ OUTGOING TOKEN TO BACKEND:",
            token ? `${token.substring(0, 15)}...` : "NULL/EMPTY",
          );

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error(
            "❌ Failed to append Clerk token to Axios request:",
            error,
          );
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    return instance;
  }, []);

  return authenticatedApi;
}

export default api;
