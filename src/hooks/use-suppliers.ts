import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ExtendedSession } from "@/types/auth";
import type {
  Supplier,
  SuppliersResponse,
  SupplierResponse,
  ActiveSuppliersResponse,
  SupplierPerformanceResponse,
  CreateSupplierData,
  UpdateSupplierData,
  SupplierFilters,
} from "@/types/purchasing";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/api$/, "");

// Helper hook to ensure token is stored on client side
export const useAuthToken = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window !== "undefined" && session) {
      const extendedSession = session as unknown as ExtendedSession;

      // Check if the session has an accessToken
      if (extendedSession.accessToken) {
        const currentToken = localStorage.getItem("access_token");

        // Only update if token has changed
        if (currentToken !== extendedSession.accessToken) {
          localStorage.setItem("access_token", extendedSession.accessToken);
        }
      }
    }
  }, [session]);

  const getAuthHeaders = async () => {
    const token = localStorage.getItem("access_token");
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
  };

  return { getAuthHeaders };
};

export function useSuppliers(filters: SupplierFilters = {}) {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["suppliers", filters],
    queryFn: async (): Promise<SuppliersResponse> => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(
        `${API_BASE}/api/suppliers?${params.toString()}`,
        {
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }

      return response.json();
    },
  });
}

export function useSupplier(id: number) {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["supplier", id],
    queryFn: async (): Promise<SupplierResponse> => {
      const response = await fetch(`${API_BASE}/api/suppliers/${id}`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch supplier");
      }

      return response.json();
    },
    enabled: !!id,
  });
}

export function useActiveSuppliers() {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["suppliers", "active"],
    queryFn: async (): Promise<ActiveSuppliersResponse> => {
      const response = await fetch(`${API_BASE}/api/suppliers/active`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch active suppliers");
      }

      return response.json();
    },
  });
}

export function useSupplierPerformance(id: number) {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["supplier", id, "performance"],
    queryFn: async (): Promise<SupplierPerformanceResponse> => {
      const response = await fetch(
        `${API_BASE}/api/suppliers/${id}/performance`,
        {
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch supplier performance");
      }

      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async (data: CreateSupplierData): Promise<SupplierResponse> => {
      const response = await fetch(`${API_BASE}/api/suppliers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create supplier");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateSupplierData;
    }): Promise<SupplierResponse> => {
      const response = await fetch(`${API_BASE}/api/suppliers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update supplier");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["supplier", id] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE}/api/suppliers/${id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete supplier");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
