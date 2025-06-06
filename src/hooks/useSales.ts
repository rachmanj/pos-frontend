import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export interface PaymentMethod {
  id: number;
  name: string;
  type:
    | "cash"
    | "credit_card"
    | "debit_card"
    | "digital_wallet"
    | "bank_transfer"
    | "other";
  description?: string;
  requires_reference: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id?: number;
  product_id: number;
  product?: {
    id: number;
    name: string;
    sku: string;
    price: number;
    available_stock?: number;
  };
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount: number;
}

export interface SalePayment {
  id?: number;
  payment_method_id: number;
  payment_method?: PaymentMethod;
  amount: number;
  reference_number?: string;
  payment_date?: string;
}

export interface Sale {
  id: number;
  sale_number: string;
  warehouse_id: number;
  customer_id?: number;
  cash_session_id?: number;
  user_id: number;
  sale_date: string;
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: "pending" | "paid" | "partial";
  status: "draft" | "completed" | "voided";
  notes?: string;
  voided_at?: string;
  voided_by?: number;
  warehouse?: {
    id: number;
    name: string;
    code: string;
  };
  customer?: {
    id: number;
    name: string;
    customer_code: string;
  };
  user?: {
    id: number;
    name: string;
  };
  cash_session?: {
    id: number;
    register_name: string;
  };
  sale_items: SaleItem[];
  sale_payments: SalePayment[];
  created_at: string;
  updated_at: string;
}

export interface SaleFilters {
  warehouse_id?: number;
  customer_id?: number;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_field?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
}

export interface CreateSaleData {
  warehouse_id: number;
  customer_id?: number;
  cash_session_id?: number;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
    tax_rate?: number;
  }>;
  payments: Array<{
    payment_method_id: number;
    amount: number;
    reference_number?: string;
  }>;
  discount_amount?: number;
  tax_amount?: number;
  notes?: string;
}

export interface DailySummary {
  date: string;
  total_sales_count: number;
  total_sales_amount: number;
  total_tax_amount: number;
  total_discount_amount: number;
  payment_breakdown: Array<{
    payment_method: string;
    total_amount: number;
  }>;
}

export interface ProductSearchResult {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  selling_price: number;
  cost_price: number;
  available_stock: number;
  warehouse_id?: number;
  category?: {
    id: number;
    name: string;
  };
  unit?: {
    id: number;
    name: string;
    abbreviation: string;
  };
}

// Get sales with filters
export const useSales = (filters: SaleFilters = {}) => {
  return useQuery({
    queryKey: ["sales", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const { data } = await api.get(`/sales?${params.toString()}`);
      return data.data;
    },
  });
};

// Get single sale
export const useSale = (saleId: number | undefined) => {
  return useQuery({
    queryKey: ["sale", saleId],
    queryFn: async () => {
      if (!saleId) return null;
      const { data } = await api.get(`/sales/${saleId}`);
      return data.data as Sale;
    },
    enabled: !!saleId,
  });
};

// Get daily sales summary
export const useDailySummary = (
  filters: { date?: string; warehouse_id?: number } = {}
) => {
  return useQuery({
    queryKey: ["daily-summary", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value.toString());
        }
      });

      const { data } = await api.get(
        `/sales/daily-summary?${params.toString()}`
      );
      return data.data as DailySummary;
    },
  });
};

// Search products for POS with debouncing
export const useProductSearch = (search: string, warehouseId?: number) => {
  return useQuery({
    queryKey: ["product-search", search, warehouseId],
    queryFn: async () => {
      if (!search.trim()) return [];

      const params = new URLSearchParams({
        search: search.trim(),
      });

      if (warehouseId) {
        params.append("warehouse_id", warehouseId.toString());
      }

      const { data } = await api.get(
        `/sales/search-products?${params.toString()}`
      );
      return data.data as ProductSearchResult[];
    },
    enabled: search.length >= 2,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once on failure
  });
};

// Create sale (POS transaction)
export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleData: CreateSaleData) => {
      const { data } = await api.post("/sales", saleData);
      return data.data as Sale;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["daily-summary"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-stocks"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Sale ${data.sale_number} completed successfully`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to process sale";
      toast.error(message);
    },
  });
};

// Void sale
export const useVoidSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleId: number) => {
      const { data } = await api.post(`/sales/${saleId}/void`);
      return data.data as Sale;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sale", data.id] });
      queryClient.invalidateQueries({ queryKey: ["daily-summary"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-stocks"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Sale ${data.sale_number} voided successfully`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to void sale";
      toast.error(message);
    },
  });
};

// Get payment methods (active only for POS)
export const useActivePaymentMethods = () => {
  return useQuery({
    queryKey: ["payment-methods", "active"],
    queryFn: async () => {
      const { data } = await api.get("/payment-methods/active");
      return data.data as PaymentMethod[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
