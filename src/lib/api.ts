import axios from "axios";
import { getSession } from "next-auth/react";
import { ExtendedSession } from "@/types/auth";

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
    /\/api$/,
    ""
  ),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  async (config) => {
    const session = (await getSession()) as ExtendedSession | null;
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default api;
