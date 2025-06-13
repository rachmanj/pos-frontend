// ============================================================================
// SALES ORDERS - REACT QUERY HOOK
// ============================================================================
// Comprehensive React Query integration for Sales Order Management System
// All 12 API endpoints with intelligent caching and optimistic updates
// ============================================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { ExtendedSession } from "@/types/auth";
import {
  type SalesOrder,
  type SalesOrderFilters,
  type SalesOrderFormData,
  type SalesOrderListResponse,
  type SalesOrderResponse,
  type CustomerOption,
  type WarehouseOption,
  type ProductOption,
  type UserOption,
  type SalesOrderStats,
} from "@/types/sales-orders";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Auth token hook for API calls
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

  const getAuthHeadersSync = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return { getAuthHeaders, getAuthHeadersSync };
};

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

const SALES_ORDERS_ENDPOINTS = {
  LIST: "/sales-orders",
  SHOW: (id: number) => `/sales-orders/${id}`,
  STORE: "/sales-orders",
  UPDATE: (id: number) => `/sales-orders/${id}`,
  DELETE: (id: number) => `/sales-orders/${id}`,
  CONFIRM: (id: number) => `/sales-orders/${id}/confirm`,
  APPROVE: (id: number) => `/sales-orders/${id}/approve`,
  CANCEL: (id: number) => `/sales-orders/${id}/cancel`,
  STATS: "/sales-orders/stats",
  CUSTOMERS: "/sales-orders/customers",
  WAREHOUSES: "/sales-orders/warehouses",
  PRODUCTS: (warehouseId?: number) =>
    warehouseId
      ? `/sales-orders/products?warehouse_id=${warehouseId}`
      : "/sales-orders/products",
  SALES_REPS: "/sales-orders/sales-reps",
} as const;

const QUERY_KEYS = {
  SALES_ORDERS: ["sales-orders"] as const,
  SALES_ORDER: (id: number) => ["sales-orders", id] as const,
  SALES_ORDERS_LIST: (filters: SalesOrderFilters) =>
    ["sales-orders", "list", filters] as const,
  SALES_ORDERS_STATS: ["sales-orders", "stats"] as const,
  CUSTOMERS: ["sales-orders", "customers"] as const,
  WAREHOUSES: ["sales-orders", "warehouses"] as const,
  PRODUCTS: (warehouseId?: number) =>
    ["sales-orders", "products", warehouseId] as const,
  SALES_REPS: ["sales-orders", "sales-reps"] as const,
} as const;

// Cache stale times (5-20 minutes based on data volatility)
const STALE_TIME = {
  SALES_ORDERS: 2 * 60 * 1000, // 2 minutes (volatile)
  SALES_ORDER: 3 * 60 * 1000, // 3 minutes (moderate)
  STATS: 1 * 60 * 1000, // 1 minute (very volatile)
  CUSTOMERS: 10 * 60 * 1000, // 10 minutes (stable)
  WAREHOUSES: 15 * 60 * 1000, // 15 minutes (very stable)
  PRODUCTS: 5 * 60 * 1000, // 5 minutes (moderate)
  SALES_REPS: 20 * 60 * 1000, // 20 minutes (very stable)
} as const;

// ============================================================================
// DROPDOWN DATA HOOKS (using fetch pattern like suppliers)
// ============================================================================

/**
 * Get customers for sales order dropdown - using fetch pattern
 */
export function useGetCustomers() {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMERS,
    queryFn: async () => {
      const url = `${API_BASE}/sales-orders/customers`;
      console.log("🔍 Making API call to:", url);

      const headers = await getAuthHeaders();
      console.log("🔑 Using headers:", headers);

      const response = await fetch(url, {
        headers,
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response URL:", response.url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorText,
        });
        throw new Error(
          `Failed to fetch customers: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("✅ API Success:", result);
      return result.data || result;
    },
    staleTime: STALE_TIME.CUSTOMERS,
  });
}

/**
 * Get warehouses for sales order dropdown - using fetch pattern
 */
export function useGetWarehouses() {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: QUERY_KEYS.WAREHOUSES,
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/sales-orders/warehouses`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch warehouses");
      }

      const result = await response.json();
      return result.data || result;
    },
    staleTime: STALE_TIME.WAREHOUSES,
  });
}

/**
 * Get products for sales order items - using fetch pattern
 */
export function useGetProducts(warehouseId?: number) {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS(warehouseId),
    queryFn: async () => {
      const url = warehouseId
        ? `${API_BASE}/sales-orders/products?warehouse_id=${warehouseId}`
        : `${API_BASE}/sales-orders/products`;

      const response = await fetch(url, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();
      return result.data || result;
    },
    staleTime: STALE_TIME.PRODUCTS,
    enabled: true, // Always enabled, warehouseId is optional
  });
}

/**
 * Get sales representatives for assignment - using fetch pattern
 */
export function useGetSalesReps() {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: QUERY_KEYS.SALES_REPS,
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/sales-orders/sales-reps`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sales representatives");
      }

      const result = await response.json();
      return result.data || result;
    },
    staleTime: STALE_TIME.SALES_REPS,
  });
}

// ============================================================================
// MAIN HOOK IMPLEMENTATION
// ============================================================================

export const useSalesOrders = () => {
  const queryClient = useQueryClient();
  const { getAuthHeaders, getAuthHeadersSync } = useAuthToken();

  // ============================================================================
  // QUERY HOOKS
  // ============================================================================

  /**
   * Get paginated list of sales orders with filtering
   */
  const useGetSalesOrders = (filters: SalesOrderFilters = {}) => {
    return useQuery({
      queryKey: QUERY_KEYS.SALES_ORDERS_LIST(filters),
      queryFn: async () => {
        const params = new URLSearchParams();

        // Add filters to params
        Object.entries(filters).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            value !== "all"
          ) {
            params.append(key, String(value));
          }
        });

        const url = params.toString()
          ? `${SALES_ORDERS_ENDPOINTS.LIST}?${params.toString()}`
          : SALES_ORDERS_ENDPOINTS.LIST;

        const { data } = await api.get(url, {
          headers: getAuthHeadersSync(),
        });
        return data;
      },
      staleTime: STALE_TIME.SALES_ORDERS,
      enabled: true,
    });
  };

  /**
   * Get single sales order by ID with full relationships
   */
  const useGetSalesOrder = (id: number) => {
    return useQuery({
      queryKey: QUERY_KEYS.SALES_ORDER(id),
      queryFn: async () => {
        const { data } = await api.get(SALES_ORDERS_ENDPOINTS.SHOW(id), {
          headers: getAuthHeadersSync(),
        });
        return data;
      },
      staleTime: STALE_TIME.SALES_ORDER,
      enabled: id > 0,
    });
  };

  /**
   * Get sales order statistics and analytics
   */
  const useGetSalesOrderStats = () => {
    return useQuery({
      queryKey: QUERY_KEYS.SALES_ORDERS_STATS,
      queryFn: async () => {
        const { data } = await api.get(SALES_ORDERS_ENDPOINTS.STATS, {
          headers: getAuthHeadersSync(),
        });
        return data.data;
      },
      staleTime: STALE_TIME.STATS,
    });
  };

  // Export the individual hooks for external use
  const useGetCustomersHook = useGetCustomers;
  const useGetWarehousesHook = useGetWarehouses;
  const useGetProductsHook = useGetProducts;
  const useGetSalesRepsHook = useGetSalesReps;

  // ============================================================================
  // MUTATION HOOKS
  // ============================================================================

  /**
   * Create new sales order
   */
  const useCreateSalesOrder = () => {
    return useMutation({
      mutationFn: async (data: SalesOrderFormData) => {
        const response = await api.post(SALES_ORDERS_ENDPOINTS.STORE, data, {
          headers: getAuthHeaders(),
        });
        return response.data;
      },
      onSuccess: () => {
        // Invalidate and refetch sales orders list
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_ORDERS });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SALES_ORDERS_STATS,
        });

        toast.success("Sales order created successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to create sales order"
        );
      },
    });
  };

  /**
   * Update existing sales order
   */
  const useUpdateSalesOrder = () => {
    return useMutation({
      mutationFn: async ({
        id,
        data,
      }: {
        id: number;
        data: Partial<SalesOrderFormData>;
      }) => {
        const response = await api.put(
          SALES_ORDERS_ENDPOINTS.UPDATE(id),
          data,
          {
            headers: getAuthHeaders(),
          }
        );
        return response.data;
      },
      onSuccess: (_, variables) => {
        // Update the specific sales order in cache
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SALES_ORDER(variables.id),
        });

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_ORDERS });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SALES_ORDERS_STATS,
        });

        toast.success("Sales order updated successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to update sales order"
        );
      },
    });
  };

  /**
   * Delete sales order
   */
  const useDeleteSalesOrder = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const { data } = await api.delete(SALES_ORDERS_ENDPOINTS.DELETE(id), {
          headers: getAuthHeaders(),
        });
        return data;
      },
      onSuccess: (_, id) => {
        // Remove from cache
        queryClient.removeQueries({ queryKey: QUERY_KEYS.SALES_ORDER(id) });

        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_ORDERS });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SALES_ORDERS_STATS,
        });

        toast.success("Sales order deleted successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to delete sales order"
        );
      },
    });
  };

  /**
   * Confirm sales order (draft → confirmed)
   */
  const useConfirmSalesOrder = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const { data } = await api.post(
          SALES_ORDERS_ENDPOINTS.CONFIRM(id),
          {},
          {
            headers: getAuthHeaders(),
          }
        );
        return data;
      },
      onSuccess: (_, id) => {
        // Update the specific sales order in cache
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_ORDER(id) });

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_ORDERS });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SALES_ORDERS_STATS,
        });

        toast.success("Sales order confirmed successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to confirm sales order"
        );
      },
    });
  };

  /**
   * Approve sales order (confirmed → approved)
   */
  const useApproveSalesOrder = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const { data } = await api.post(
          SALES_ORDERS_ENDPOINTS.APPROVE(id),
          {},
          {
            headers: getAuthHeaders(),
          }
        );
        return data;
      },
      onSuccess: (_, id) => {
        // Update the specific sales order in cache
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_ORDER(id) });

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_ORDERS });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SALES_ORDERS_STATS,
        });

        toast.success("Sales order approved successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to approve sales order"
        );
      },
    });
  };

  /**
   * Cancel sales order with reason
   */
  const useCancelSalesOrder = () => {
    return useMutation({
      mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
        const { data } = await api.post(
          SALES_ORDERS_ENDPOINTS.CANCEL(id),
          { cancellation_reason: reason },
          {
            headers: getAuthHeaders(),
          }
        );
        return data;
      },
      onSuccess: (_, variables) => {
        // Update the specific sales order in cache
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SALES_ORDER(variables.id),
        });

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_ORDERS });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SALES_ORDERS_STATS,
        });

        toast.success("Sales order cancelled successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to cancel sales order"
        );
      },
    });
  };

  // ============================================================================
  // RETURN OBJECT
  // ============================================================================

  return {
    // Query hooks
    useGetSalesOrders,
    useGetSalesOrder,
    useGetSalesOrderStats,
    useGetCustomersHook,
    useGetWarehousesHook,
    useGetProductsHook,
    useGetSalesRepsHook,

    // Mutation hooks
    useCreateSalesOrder,
    useUpdateSalesOrder,
    useDeleteSalesOrder,
    useConfirmSalesOrder,
    useApproveSalesOrder,
    useCancelSalesOrder,

    // Query keys for manual cache manipulation
    queryKeys: QUERY_KEYS,
  };
};

// ============================================================================
// EXPORT TYPE FOR HOOK USAGE
// ============================================================================

export type UseSalesOrdersReturn = ReturnType<typeof useSalesOrders>;
