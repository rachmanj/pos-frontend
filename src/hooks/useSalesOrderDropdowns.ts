import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { ExtendedSession } from "@/types/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Helper hook to ensure token is stored on client side (copied from working suppliers hook)
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

// Sales Order Customers
export function useSalesOrderCustomers() {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["sales-orders", "customers"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/sales-orders/customers`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const result = await response.json();
      return result.data || result;
    },
  });
}

// Sales Order Warehouses
export function useSalesOrderWarehouses() {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["sales-orders", "warehouses"],
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
  });
}

// Sales Order Products
export function useSalesOrderProducts(warehouseId?: number) {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["sales-orders", "products", warehouseId],
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
    enabled: true, // Always enabled, warehouseId is optional
  });
}

// Sales Order Sales Reps
export function useSalesOrderSalesReps() {
  const { getAuthHeaders } = useAuthToken();

  return useQuery({
    queryKey: ["sales-orders", "sales-reps"],
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
  });
}
