import { getServerSession } from "next-auth/next";
import {
  CreateUserData,
  UpdateUserData,
  UsersResponse,
  UserResponse,
  Role,
  RolesResponse,
  PermissionsResponse,
  CreateRoleData,
  UpdateRoleData,
  ExtendedSession,
} from "@/types/auth";

// Get API URL from environment
const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
      /\/api$/,
      ""
    );
  } else {
    return "http://localhost:8000";
  }
};

const API_URL = getApiUrl();
console.log("🌐 API URL configured:", API_URL);

// Error handling utility
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  console.log("�� Starting fetchWithAuth for endpoint:", endpoint);

  try {
    const session = (await getServerSession()) as ExtendedSession | null;
    console.log("📋 Session retrieved:", session ? "Yes" : "No");

    if (!session || !session.accessToken) {
      console.log("❌ No session or access token");
      throw new ApiError(401, "No access token available");
    }

    console.log("🔐 Making API request:", {
      endpoint,
      method: options.method || "GET",
      hasToken: !!session.accessToken,
      tokenPrefix: session.accessToken.substring(0, 10) + "...",
      fullUrl: `${API_URL}${endpoint}`,
    });

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
        ...options.headers,
      },
    });

    console.log("📡 Response received:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ API Success:", {
      endpoint,
      dataKeys: Object.keys(data),
    });

    return response;
  } catch (error) {
    console.error("🚨 fetchWithAuth error:", error);
    throw error;
  }
}

// Alternative fetch function that accepts session as parameter to avoid CORS issues
async function fetchWithSession(
  endpoint: string,
  session: ExtendedSession | null,
  options: RequestInit = {}
): Promise<any> {
  console.log("🔍 Starting fetchWithSession for endpoint:", endpoint);
  console.log("🌐 Using API URL:", API_URL);
  console.log("🔑 Session object:", session ? "Present" : "Missing");
  console.log("🎫 Access token:", session?.accessToken ? "Present" : "Missing");

  if (!session?.accessToken) {
    console.error("❌ No session or access token available");
    throw new ApiError(401, "No access token available");
  }

  const fullUrl = `${API_URL}${endpoint}`;
  console.log("📡 Full request URL:", fullUrl);
  console.log("🔐 Making API request with session:", {
    endpoint,
    method: options.method || "GET",
    hasToken: !!session.accessToken,
    tokenPrefix: session.accessToken.substring(0, 10) + "...",
    fullUrl: fullUrl,
  });

  // Prepare headers properly (without server-side CORS headers)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${session.accessToken}`,
    ...((options.headers as Record<string, string>) || {}),
  };

  const requestOptions: RequestInit = {
    ...options,
    headers,
    mode: "cors", // Explicitly set CORS mode
    credentials: "omit", // Try without credentials first
  };

  try {
    console.log("🚀 About to make fetch request to:", fullUrl);
    console.log("🔧 Request options:", {
      method: requestOptions.method || "GET",
      mode: requestOptions.mode,
      credentials: requestOptions.credentials,
      headers: Object.keys(headers),
    });

    const response = await fetch(fullUrl, requestOptions);

    console.log("📡 Response received:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: fullUrl,
      });
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ API Success:", {
      endpoint,
      dataKeys: Object.keys(data),
      url: fullUrl,
    });

    return data;
  } catch (error: any) {
    console.error("🚨 fetchWithSession error:", error);
    console.error("🚨 Error details:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      url: fullUrl,
    });
    throw error;
  }
}

// User Management API
export const userApi = {
  // Get paginated users with filters
  getUsers: async (
    params: {
      page?: number;
      per_page?: number;
      search?: string;
      role?: string;
      status?: string;
    } = {}
  ): Promise<UsersResponse> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return fetchWithAuth(`/users?${searchParams.toString()}`);
  },

  // Get single user
  getUser: async (id: number): Promise<UserResponse> => {
    return fetchWithAuth(`/users/${id}`);
  },

  // Create new user
  createUser: async (data: CreateUserData): Promise<UserResponse> => {
    return fetchWithAuth("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update user
  updateUser: async (
    id: number,
    data: UpdateUserData
  ): Promise<UserResponse> => {
    return fetchWithAuth(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete user
  deleteUser: async (id: number): Promise<{ message: string }> => {
    return fetchWithAuth(`/users/${id}`, {
      method: "DELETE",
    });
  },

  // Assign role to user
  assignRole: async (id: number, role: string): Promise<UserResponse> => {
    return fetchWithAuth(`/users/${id}/assign-role`, {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  },

  // Remove role from user
  removeRole: async (id: number, role: string): Promise<UserResponse> => {
    return fetchWithAuth(`/users/${id}/remove-role`, {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  },

  // Bulk assign role to users
  bulkAssignRole: async (
    userIds: number[],
    role: string
  ): Promise<{ message: string; updated_count: number }> => {
    return fetchWithAuth("/users/bulk-assign-role", {
      method: "POST",
      body: JSON.stringify({ user_ids: userIds, role }),
    });
  },
};

// User Management API with session parameter (to avoid CORS issues)
export const userApiWithSession = {
  // Create new user
  createUser: async (
    data: CreateUserData,
    session: ExtendedSession | null
  ): Promise<UserResponse> => {
    return fetchWithSession("/users", session, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update user
  updateUser: async (
    id: number,
    data: UpdateUserData,
    session: ExtendedSession | null
  ): Promise<UserResponse> => {
    return fetchWithSession(`/users/${id}`, session, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete user
  deleteUser: async (
    id: number,
    session: ExtendedSession | null
  ): Promise<{ message: string }> => {
    return fetchWithSession(`/users/${id}`, session, {
      method: "DELETE",
    });
  },

  // Assign role to user
  assignRole: async (
    id: number,
    role: string,
    session: ExtendedSession | null
  ): Promise<UserResponse> => {
    return fetchWithSession(`/users/${id}/assign-role`, session, {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  },

  // Remove role from user
  removeRole: async (
    id: number,
    role: string,
    session: ExtendedSession | null
  ): Promise<UserResponse> => {
    return fetchWithSession(`/users/${id}/remove-role`, session, {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  },
};

// Role Management API
export const roleApi = {
  // Get all roles
  getRoles: async (): Promise<RolesResponse> => {
    return fetchWithAuth("/roles");
  },

  // Get single role
  getRole: async (id: number): Promise<{ role: Role }> => {
    return fetchWithAuth(`/roles/${id}`);
  },

  // Create new role
  createRole: async (
    data: CreateRoleData
  ): Promise<{ message: string; role: Role }> => {
    return fetchWithAuth("/roles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update role
  updateRole: async (
    id: number,
    data: UpdateRoleData
  ): Promise<{ message: string; role: Role }> => {
    return fetchWithAuth(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete role
  deleteRole: async (id: number): Promise<{ message: string }> => {
    return fetchWithAuth(`/roles/${id}`, {
      method: "DELETE",
    });
  },

  // Get all permissions grouped
  getPermissions: async (): Promise<PermissionsResponse> => {
    return fetchWithAuth("/permissions");
  },
};

// Role Management API with session parameter
export const roleApiWithSession = {
  // Get all roles
  getRoles: async (session: ExtendedSession | null): Promise<RolesResponse> => {
    return fetchWithSession("/roles", session);
  },
};

// Simple test function to verify API connectivity
export const testApiConnection = async () => {
  console.log("🧪 Testing API connection...");
  console.log("🌐 Testing URL:", API_URL);

  try {
    // First try a simple GET request without any special headers
    console.log("🧪 Testing simple GET request...");
    const simpleResponse = await fetch(`${API_URL}/test`, {
      method: "GET",
    });

    console.log(
      "🧪 Simple test response:",
      simpleResponse.status,
      simpleResponse.statusText
    );

    // Now try with proper headers
    console.log("🧪 Testing with JSON headers...");
    const jsonResponse = await fetch(`${API_URL}/test`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      mode: "cors",
    });

    console.log(
      "🧪 JSON test response:",
      jsonResponse.status,
      jsonResponse.statusText
    );

    if (jsonResponse.ok) {
      const data = await jsonResponse.json();
      console.log("✅ API connection test successful:", data);
      return true;
    } else {
      console.log(
        "⚠️ API connection test failed with status:",
        jsonResponse.status
      );
      return false;
    }
  } catch (error: any) {
    console.error("❌ API connection test failed:", error?.message);
    console.error("❌ Full error:", error);
    return false;
  }
};

// Alternative approach using localStorage for token storage
export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") {
    console.log("🚫 getStoredToken: window is undefined (server-side)");
    return null;
  }

  const token = localStorage.getItem("accessToken");
  console.log("🔍 getStoredToken:", token ? "Token found" : "No token found");
  if (token) {
    console.log("🎫 Token preview:", token.substring(0, 20) + "...");
  }
  return token;
};

export const setStoredToken = (token: string): void => {
  if (typeof window === "undefined") {
    console.log("🚫 setStoredToken: window is undefined (server-side)");
    return;
  }

  console.log(
    "💾 setStoredToken: Storing token:",
    token.substring(0, 20) + "..."
  );
  localStorage.setItem("accessToken", token);
  console.log("✅ setStoredToken: Token stored successfully");
};

export const clearStoredToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
};

// Direct API function using stored token with session fallback
async function fetchWithStoredToken(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  console.log("🔍 Starting fetchWithStoredToken for endpoint:", endpoint);
  console.log("🌐 Using API URL:", API_URL);

  const token = await getTokenForApi();
  console.log("🎫 Retrieved token:", token ? "Present" : "Missing");

  if (!token) {
    console.error("❌ No access token available from localStorage or session");
    throw new ApiError(401, "No access token available");
  }

  const fullUrl = `${API_URL}${endpoint}`;
  console.log("📡 Full request URL:", fullUrl);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...((options.headers as Record<string, string>) || {}),
  };

  const requestOptions: RequestInit = {
    ...options,
    headers,
    mode: "cors",
    credentials: "omit",
  };

  try {
    console.log("🚀 About to make fetch request to:", fullUrl);
    const response = await fetch(fullUrl, requestOptions);

    console.log("📡 Response received:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: fullUrl,
      });
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ API Success:", {
      endpoint,
      dataKeys: Object.keys(data),
      url: fullUrl,
    });

    return data;
  } catch (error: any) {
    console.error("🚨 fetchWithStoredToken error:", error);
    throw error;
  }
}

export { ApiError };

// Direct API functions using stored token (bypassing session issues)
export const directUserApi = {
  getUsers: async (
    page: number = 1,
    search?: string,
    role?: string,
    status?: string
  ) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    if (search) params.append("search", search);
    if (role) params.append("role", role);
    if (status) params.append("status", status);

    return fetchWithStoredToken(`/users?${params.toString()}`);
  },

  createUser: async (userData: CreateUserData) => {
    return fetchWithStoredToken("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (userId: number, userData: UpdateUserData) => {
    return fetchWithStoredToken(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (userId: number) => {
    return fetchWithStoredToken(`/users/${userId}`, {
      method: "DELETE",
    });
  },

  assignRole: async (userId: number, role: string) => {
    return fetchWithStoredToken(`/users/${userId}/assign-role`, {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  },

  removeRole: async (userId: number, role: string) => {
    return fetchWithStoredToken(`/users/${userId}/remove-role`, {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  },
};

export const directRoleApi = {
  getRoles: async () => {
    return fetchWithStoredToken("/roles");
  },
};

// Helper function to get token from localStorage or session
export const getTokenForApi = async (): Promise<string | null> => {
  console.log("🔍 getTokenForApi: Starting token retrieval...");

  // First try localStorage
  const storedToken = getStoredToken();
  if (storedToken) {
    console.log("✅ getTokenForApi: Using stored token");
    return storedToken;
  }

  // Fallback to session if no stored token
  console.log("🔄 getTokenForApi: No stored token, trying session...");
  try {
    const session = await getServerSession();
    if (session && (session as any).accessToken) {
      const sessionToken = (session as any).accessToken;
      console.log("✅ getTokenForApi: Using session token");

      // Store it for future use
      setStoredToken(sessionToken);
      return sessionToken;
    }
  } catch (error) {
    console.error("❌ getTokenForApi: Error getting session:", error);
  }

  console.log("❌ getTokenForApi: No token available");
  return null;
};
