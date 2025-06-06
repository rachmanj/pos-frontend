import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ExtendedSession } from "@/types/auth";
import type {
  PurchaseOrder,
  PurchaseOrdersResponse,
  PurchaseOrderResponse,
  PurchaseOrderAnalyticsResponse,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
  PurchaseOrderFilters,
} from "@/types/purchasing";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

export function usePurchaseOrders(filters: PurchaseOrderFilters = {}) {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["purchase-orders", filters],
    queryFn: async (): Promise<PurchaseOrdersResponse> => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(
        `${API_BASE}/purchase-orders?${params.toString()}`,
        {
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch purchase orders");
      }

      return response.json();
    },
  });
}

export function usePurchaseOrder(id: number) {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["purchase-order", id],
    queryFn: async (): Promise<PurchaseOrderResponse> => {
      const response = await fetch(`${API_BASE}/purchase-orders/${id}`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch purchase order");
      }

      return response.json();
    },
    enabled: !!id,
  });
}

export function usePurchaseOrderAnalytics() {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["purchase-orders", "analytics"],
    queryFn: async (): Promise<PurchaseOrderAnalyticsResponse> => {
      const response = await fetch(
        `${API_BASE}/purchase-orders/analytics`,
        {
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch purchase order analytics");
      }

      return response.json();
    },
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async (
      data: CreatePurchaseOrderData
    ): Promise<PurchaseOrderResponse> => {
      const response = await fetch(`${API_BASE}/purchase-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create purchase order");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePurchaseOrderData;
    }): Promise<PurchaseOrderResponse> => {
      const response = await fetch(`${API_BASE}/purchase-orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update purchase order");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE}/purchase-orders/${id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete purchase order");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async (id: number): Promise<PurchaseOrderResponse> => {
      const response = await fetch(
        `${API_BASE}/purchase-orders/${id}/approve`,
        {
          method: "POST",
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve purchase order");
      }

      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
      toast.success("Purchase order approved successfully");
    },
  });
}

export function useSubmitPurchaseOrderForApproval() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async (id: number): Promise<PurchaseOrderResponse> => {
      const response = await fetch(
        `${API_BASE}/purchase-orders/${id}/submit-for-approval`,
        {
          method: "POST",
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Failed to submit purchase order for approval"
        );
      }

      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
      toast.success("Purchase order submitted for approval");
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async (id: number): Promise<PurchaseOrderResponse> => {
      const response = await fetch(
        `${API_BASE}/purchase-orders/${id}/cancel`,
        {
          method: "POST",
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel purchase order");
      }

      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
      toast.success("Purchase order cancelled");
    },
  });
}

export function useDuplicatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async (id: number): Promise<PurchaseOrderResponse> => {
      const response = await fetch(
        `${API_BASE}/purchase-orders/${id}/duplicate`,
        {
          method: "POST",
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to duplicate purchase order");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order duplicated successfully");
    },
  });
}
