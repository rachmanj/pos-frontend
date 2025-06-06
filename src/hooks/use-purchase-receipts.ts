import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { ExtendedSession } from "@/types/auth";
import type {
  PurchaseReceiptFilters,
  PurchaseReceiptsResponse,
  PurchaseReceiptResponse,
  CreatePurchaseReceiptData,
  UpdatePurchaseReceiptData,
  ReceivableItemsResponse,
  PurchaseReceiptAnalyticsResponse,
} from "@/types/purchasing";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Helper hook to ensure token is stored on client side
export const useAuthToken = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window !== "undefined" && session) {
      const extendedSession = session as unknown as ExtendedSession;

      if (extendedSession.accessToken) {
        const currentToken = localStorage.getItem("access_token");

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

export function usePurchaseReceipts(filters: PurchaseReceiptFilters = {}) {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["purchase-receipts", filters],
    queryFn: async (): Promise<PurchaseReceiptsResponse> => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(
        `${API_BASE}/purchase-receipts?${params.toString()}`,
        {
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch purchase receipts");
      }

      return response.json();
    },
  });
}

export function usePurchaseReceipt(id: number) {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["purchase-receipt", id],
    queryFn: async (): Promise<PurchaseReceiptResponse> => {
      const response = await fetch(`${API_BASE}/purchase-receipts/${id}`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch purchase receipt");
      }

      return response.json();
    },
    enabled: !!id,
  });
}

export function useReceivableItems(purchaseOrderId: number) {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["receivable-items", purchaseOrderId],
    queryFn: async (): Promise<ReceivableItemsResponse> => {
      const response = await fetch(
        `${API_BASE}/purchase-orders/${purchaseOrderId}/receivable-items`,
        {
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch receivable items");
      }

      return response.json();
    },
    enabled: !!purchaseOrderId,
  });
}

export function usePurchaseReceiptAnalytics() {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["purchase-receipt-analytics"],
    queryFn: async (): Promise<PurchaseReceiptAnalyticsResponse> => {
      const response = await fetch(`${API_BASE}/purchase-receipts/analytics`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch purchase receipt analytics");
      }

      return response.json();
    },
  });
}

export function useCreatePurchaseReceipt() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async (
      data: CreatePurchaseReceiptData
    ): Promise<PurchaseReceiptResponse> => {
      const response = await fetch(`${API_BASE}/purchase-receipts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create purchase receipt");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useUpdatePurchaseReceipt() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePurchaseReceiptData;
    }): Promise<PurchaseReceiptResponse> => {
      const response = await fetch(`${API_BASE}/purchase-receipts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update purchase receipt");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-receipt", id] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useDeletePurchaseReceipt() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE}/purchase-receipts/${id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete purchase receipt");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useApprovePurchaseReceipt() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async (id: number): Promise<PurchaseReceiptResponse> => {
      const response = await fetch(
        `${API_BASE}/purchase-receipts/${id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(await getAuthHeaders()),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve purchase receipt");
      }

      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-receipt", id] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useRejectPurchaseReceipt() {
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAuthToken();

  return useMutation({
    mutationFn: async (id: number): Promise<PurchaseReceiptResponse> => {
      const response = await fetch(
        `${API_BASE}/purchase-receipts/${id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(await getAuthHeaders()),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject purchase receipt");
      }

      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-receipt", id] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}
