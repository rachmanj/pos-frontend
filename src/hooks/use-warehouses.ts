import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { ExtendedSession } from "@/types/auth";
import {
  Warehouse,
  WarehouseZone,
  WarehouseStock,
  StockTransfer,
  WarehouseListResponse,
  WarehouseStockListResponse,
  StockTransferListResponse,
  WarehouseFormData,
  WarehouseZoneFormData,
  StockTransferFormData,
  WarehouseFilters,
  WarehouseStockFilters,
  StockTransferFilters,
  WarehouseAnalytics,
} from "@/types/warehouse";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
          console.log("🔐 Token stored in localStorage");
        }
      }
    }
  }, [session]);

  return {
    token:
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null,
    session,
  };
};

// Warehouse Hooks
export function useWarehouses(filters?: WarehouseFilters) {
  const { token } = useAuthToken();

  return useQuery({
    queryKey: ["warehouses", filters],
    queryFn: async (): Promise<WarehouseListResponse> => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.city) params.append("city", filters.city);
      if (filters?.state) params.append("state", filters.state);
      if (filters?.is_active !== undefined)
        params.append("is_active", filters.is_active.toString());
      if (filters?.is_default !== undefined)
        params.append("is_default", filters.is_default.toString());
      if (filters?.manager) params.append("manager", filters.manager);

      const response = await fetch(`${API_BASE_URL}/warehouses?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch warehouses");
      }

      return response.json();
    },
    enabled: !!token,
  });
}

export function useWarehouse(id: number) {
  const { token } = useAuthToken();

  return useQuery({
    queryKey: ["warehouse", id],
    queryFn: async (): Promise<Warehouse> => {
      const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch warehouse");
      }

      const result = await response.json();
      return result.data || result;
    },
    enabled: !!token && !!id,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  const { token } = useAuthToken();

  return useMutation({
    mutationFn: async (data: WarehouseFormData): Promise<Warehouse> => {
      const response = await fetch(`${API_BASE_URL}/warehouses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create warehouse");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-analytics"] });
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  const { token } = useAuthToken();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: WarehouseFormData;
    }): Promise<Warehouse> => {
      const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update warehouse");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse", id] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-analytics"] });
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  const { token } = useAuthToken();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete warehouse");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-analytics"] });
    },
  });
}

// Warehouse Zone Hooks
export function useWarehouseZones(warehouseId: number) {
  const { token } = useAuthToken();

  return useQuery({
    queryKey: ["warehouse-zones", warehouseId],
    queryFn: async (): Promise<WarehouseZone[]> => {
      const response = await fetch(
        `${API_BASE_URL}/warehouses/${warehouseId}/zones`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch warehouse zones");
      }

      const result = await response.json();
      return result.data || [];
    },
    enabled: !!token && !!warehouseId,
  });
}

export function useCreateWarehouseZone() {
  const queryClient = useQueryClient();
  const { token } = useAuthToken();

  return useMutation({
    mutationFn: async (data: WarehouseZoneFormData): Promise<WarehouseZone> => {
      const response = await fetch(`${API_BASE_URL}/warehouse-zones`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create warehouse zone");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["warehouse-zones", data.warehouse_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["warehouse", data.warehouse_id],
      });
    },
  });
}

// Warehouse Stock Hooks
export function useWarehouseStocks(filters?: WarehouseStockFilters) {
  const { token } = useAuthToken();

  return useQuery({
    queryKey: ["warehouse-stocks", filters],
    queryFn: async (): Promise<WarehouseStockListResponse> => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.warehouse_id)
        params.append("warehouse_id", filters.warehouse_id.toString());
      if (filters?.zone_id)
        params.append("zone_id", filters.zone_id.toString());
      if (filters?.product_id)
        params.append("product_id", filters.product_id.toString());
      if (filters?.low_stock)
        params.append("low_stock", filters.low_stock.toString());
      if (filters?.expired)
        params.append("expired", filters.expired.toString());
      if (filters?.expiring_soon)
        params.append("expiring_soon", filters.expiring_soon.toString());
      if (filters?.lot_number) params.append("lot_number", filters.lot_number);
      if (filters?.batch_number)
        params.append("batch_number", filters.batch_number);

      const response = await fetch(
        `${API_BASE_URL}/warehouse-stocks?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch warehouse stocks");
      }

      return response.json();
    },
    enabled: !!token,
  });
}

// Stock Transfer Hooks
export function useStockTransfers(filters?: StockTransferFilters) {
  const { token } = useAuthToken();

  return useQuery({
    queryKey: ["stock-transfers", filters],
    queryFn: async (): Promise<StockTransferListResponse> => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.from_warehouse_id)
        params.append(
          "from_warehouse_id",
          filters.from_warehouse_id.toString()
        );
      if (filters?.to_warehouse_id)
        params.append("to_warehouse_id", filters.to_warehouse_id.toString());
      if (filters?.requested_by)
        params.append("requested_by", filters.requested_by.toString());
      if (filters?.date_from) params.append("date_from", filters.date_from);
      if (filters?.date_to) params.append("date_to", filters.date_to);

      const response = await fetch(
        `${API_BASE_URL}/stock-transfers?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stock transfers");
      }

      return response.json();
    },
    enabled: !!token,
  });
}

export function useStockTransfer(id: number) {
  const { token } = useAuthToken();

  return useQuery({
    queryKey: ["stock-transfer", id],
    queryFn: async (): Promise<{ success: boolean; data: StockTransfer }> => {
      const response = await fetch(`${API_BASE_URL}/stock-transfers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stock transfer");
      }

      return response.json();
    },
    enabled: !!token && !!id,
  });
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient();
  const { token } = useAuthToken();

  return useMutation({
    mutationFn: async (
      data: StockTransferFormData
    ): Promise<{ success: boolean; data: StockTransfer }> => {
      const response = await fetch(`${API_BASE_URL}/stock-transfers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create stock transfer");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-stocks"] });
    },
  });
}

export function useUpdateStockTransferStatus() {
  const queryClient = useQueryClient();
  const { token } = useAuthToken();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: number;
      status: string;
      notes?: string;
    }): Promise<StockTransfer> => {
      const response = await fetch(
        `${API_BASE_URL}/stock-transfers/${id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, notes }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update transfer status");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["stock-transfer", id] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-stocks"] });
    },
  });
}

// Analytics Hooks
export function useWarehouseAnalytics() {
  const { token } = useAuthToken();

  return useQuery({
    queryKey: ["warehouse-analytics"],
    queryFn: async (): Promise<WarehouseAnalytics> => {
      const response = await fetch(`${API_BASE_URL}/warehouses/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch warehouse analytics");
      }

      return response.json();
    },
    enabled: !!token,
  });
}
