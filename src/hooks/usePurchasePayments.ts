import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

// Auth token hook for API calls
export const useAuthToken = () => {
  const getAuthHeaders = () => {
    if (typeof window === "undefined") return {};

    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return { getAuthHeaders };
};

// Types for Purchase Payment system
export interface PurchasePayment {
  id: number;
  payment_number: string;
  supplier_id: number;
  payment_method_id: number;
  total_amount: number;
  allocated_amount: number;
  unallocated_amount: number;
  payment_date: string;
  reference_number?: string;
  bank_reference?: string;
  status: "draft" | "pending" | "approved" | "paid" | "cancelled";
  workflow_status: "pending_approval" | "approved" | "rejected" | "completed";
  processed_by: number;
  approved_by?: number;
  rejected_by?: number;
  approved_at?: string;
  rejected_at?: string;
  requires_approval: boolean;
  notes?: string;
  approval_notes?: string;
  rejection_reason?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  supplier?: {
    id: number;
    name: string;
    supplier_code: string;
    phone?: string;
    email?: string;
  };
  paymentMethod?: {
    id: number;
    name: string;
    type: string;
  };
  processedBy?: {
    id: number;
    name: string;
  };
  approvedBy?: {
    id: number;
    name: string;
  };
  allocations?: PaymentAllocation[];
}

export interface PaymentAllocation {
  id: number;
  purchase_payment_id: number;
  purchase_order_id: number;
  supplier_id: number;
  allocated_amount: number;
  allocation_date: string;
  allocation_type: "manual" | "automatic";
  status: "pending" | "applied" | "reversed" | "cancelled";
  allocated_by: number;
  approved_by?: number;
  applied_at?: string;
  approved_at?: string;
  reversed_at?: string;
  reversal_reason?: string;
  notes?: string;
  purchaseOrder?: {
    id: number;
    po_number: string;
    total_amount: number;
    outstanding_amount: number;
    due_date?: string;
  };
  allocatedBy?: {
    id: number;
    name: string;
  };
}

export interface SupplierOutstanding {
  supplier: {
    id: number;
    name: string;
    supplier_code: string;
    phone?: string;
    email?: string;
    total_outstanding: number;
  };
  outstanding_orders: Array<{
    id: number;
    po_number: string;
    total_amount: number;
    outstanding_amount: number;
    due_date?: string;
    payment_status: string;
    items?: Array<{
      id: number;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  }>;
  aging_analysis: {
    current: number;
    days_30: number;
    days_60: number;
    days_90: number;
    days_120_plus: number;
    total: number;
    aging_percentages: {
      current: number;
      days_30: number;
      days_60: number;
      days_90: number;
      days_120_plus: number;
    };
  };
  summary: {
    total_outstanding: number;
    overdue_amount: number;
    orders_count: number;
    oldest_due_date?: string;
  };
}

export interface PaymentStats {
  total_payments: number;
  payments_this_month: number;
  total_amount: number;
  amount_this_month: number;
  pending_approval: number;
  pending_approval_amount: number;
  outstanding_pos: number;
  outstanding_amount: number;
  payment_methods: Array<{
    payment_method_id: number;
    count: number;
    total: number;
    paymentMethod: {
      id: number;
      name: string;
      type: string;
    };
  }>;
}

export interface PaymentDashboard {
  summary: {
    total_payments: number;
    total_amount: number;
    allocated_amount: number;
    unallocated_amount: number;
    pending_approval: number;
    approved_today: number;
  };
  recent_payments: PurchasePayment[];
  aging_summary: {
    total_outstanding: number;
    current: number;
    days_30: number;
    days_60: number;
    days_90: number;
    days_120_plus: number;
    overdue_percentage: number;
    high_risk_suppliers: number;
  };
  payment_trends: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

// Filters and form types
export interface PurchasePaymentFilters {
  supplier_id?: number;
  payment_method_id?: number;
  status?: string;
  workflow_status?: string;
  date_from?: string;
  date_to?: string;
  amount_from?: number;
  amount_to?: number;
  search?: string;
  sort_field?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface CreatePurchasePaymentData {
  supplier_id: number;
  payment_method_id: number;
  total_amount: number;
  payment_date: string;
  reference_number?: string;
  bank_reference?: string;
  notes?: string;
  auto_allocate?: boolean;
  allocations?: Array<{
    purchase_order_id: number;
    allocated_amount: number;
    notes?: string;
  }>;
}

export interface UpdatePurchasePaymentData {
  payment_method_id?: number;
  total_amount?: number;
  payment_date?: string;
  reference_number?: string;
  bank_reference?: string;
  notes?: string;
  status?: string;
  workflow_status?: string;
}

export interface AllocatePaymentData {
  allocations: Array<{
    purchase_order_id: number;
    allocated_amount: number;
    notes?: string;
  }>;
}

export const usePurchasePayments = () => {
  const { getAuthHeaders } = useAuthToken();
  const queryClient = useQueryClient();

  // Get all purchase payments with filters
  const useGetPurchasePayments = (filters: PurchasePaymentFilters = {}) => {
    return useQuery({
      queryKey: ["purchase-payments", filters],
      queryFn: async () => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        const { data } = await api.get(
          `/purchase-payments?${params.toString()}`,
          {
            headers: getAuthHeaders(),
          }
        );
        return data.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get single purchase payment
  const useGetPurchasePayment = (id: number) => {
    return useQuery({
      queryKey: ["purchase-payment", id],
      queryFn: async () => {
        const { data } = await api.get(`/purchase-payments/${id}`, {
          headers: getAuthHeaders(),
        });
        return data.data as PurchasePayment;
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Create purchase payment
  const useCreatePurchasePayment = () => {
    return useMutation({
      mutationFn: async (paymentData: CreatePurchasePaymentData) => {
        const { data } = await api.post("/purchase-payments", paymentData, {
          headers: getAuthHeaders(),
        });
        return data.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["purchase-payments"] });
        queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
        queryClient.invalidateQueries({ queryKey: ["payment-dashboard"] });
        toast.success("Purchase payment created successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to create purchase payment"
        );
      },
    });
  };

  // Update purchase payment
  const useUpdatePurchasePayment = () => {
    return useMutation({
      mutationFn: async ({
        id,
        data,
      }: {
        id: number;
        data: UpdatePurchasePaymentData;
      }) => {
        const response = await api.put(`/purchase-payments/${id}`, data, {
          headers: getAuthHeaders(),
        });
        return response.data.data;
      },
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ["purchase-payments"] });
        queryClient.invalidateQueries({ queryKey: ["purchase-payment", id] });
        queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
        toast.success("Purchase payment updated successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to update purchase payment"
        );
      },
    });
  };

  // Delete purchase payment
  const useDeletePurchasePayment = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const { data } = await api.delete(`/purchase-payments/${id}`, {
          headers: getAuthHeaders(),
        });
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["purchase-payments"] });
        queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
        toast.success("Purchase payment cancelled successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to cancel purchase payment"
        );
      },
    });
  };

  // Approve purchase payment
  const useApprovePurchasePayment = () => {
    return useMutation({
      mutationFn: async ({ id, notes }: { id: number; notes?: string }) => {
        const { data } = await api.post(
          `/purchase-payments/${id}/approve`,
          { approval_notes: notes },
          { headers: getAuthHeaders() }
        );
        return data.data;
      },
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ["purchase-payments"] });
        queryClient.invalidateQueries({ queryKey: ["purchase-payment", id] });
        queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
        toast.success("Purchase payment approved successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to approve purchase payment"
        );
      },
    });
  };

  // Get payment statistics
  const usePaymentStats = (
    filters: { date_from?: string; date_to?: string } = {}
  ) => {
    return useQuery({
      queryKey: ["payment-stats", filters],
      queryFn: async () => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.append(key, value);
          }
        });

        const { data } = await api.get(
          `/purchase-payments/stats?${params.toString()}`,
          {
            headers: getAuthHeaders(),
          }
        );
        return data.data as PaymentStats;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Get supplier outstanding orders
  const useSupplierOutstanding = (supplierId: number) => {
    return useQuery({
      queryKey: ["supplier-outstanding", supplierId],
      queryFn: async () => {
        const { data } = await api.get(
          `/purchase-payments/suppliers/${supplierId}/outstanding-orders`,
          {
            headers: getAuthHeaders(),
          }
        );
        return data.data as SupplierOutstanding;
      },
      enabled: !!supplierId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get payment methods
  const usePaymentMethods = () => {
    return useQuery({
      queryKey: ["payment-methods"],
      queryFn: async () => {
        const { data } = await api.get("/purchase-payments/payment-methods", {
          headers: getAuthHeaders(),
        });
        return data.data;
      },
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  };

  // Get suppliers for payment
  const useSuppliersForPayment = () => {
    return useQuery({
      queryKey: ["suppliers-for-payment"],
      queryFn: async () => {
        const { data } = await api.get("/purchase-payments/suppliers", {
          headers: getAuthHeaders(),
        });
        return data.data;
      },
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };

  // Allocate payment to purchase orders
  const useAllocatePayment = () => {
    return useMutation({
      mutationFn: async ({
        id,
        allocations,
      }: {
        id: number;
        allocations: AllocatePaymentData;
      }) => {
        const { data } = await api.post(
          `/purchase-payments/${id}/allocate`,
          allocations,
          {
            headers: getAuthHeaders(),
          }
        );
        return data.data;
      },
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ["purchase-payments"] });
        queryClient.invalidateQueries({ queryKey: ["purchase-payment", id] });
        queryClient.invalidateQueries({ queryKey: ["supplier-outstanding"] });
        toast.success("Payment allocated successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to allocate payment"
        );
      },
    });
  };

  // Auto-allocate payment
  const useAutoAllocatePayment = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const { data } = await api.post(
          `/purchase-payments/${id}/auto-allocate`,
          {},
          {
            headers: getAuthHeaders(),
          }
        );
        return data.data;
      },
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ["purchase-payments"] });
        queryClient.invalidateQueries({ queryKey: ["purchase-payment", id] });
        queryClient.invalidateQueries({ queryKey: ["supplier-outstanding"] });
        toast.success("Payment auto-allocated successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to auto-allocate payment"
        );
      },
    });
  };

  // Get payment dashboard
  const usePaymentDashboard = (
    filters: { date_from?: string; date_to?: string } = {}
  ) => {
    return useQuery({
      queryKey: ["payment-dashboard", filters],
      queryFn: async () => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.append(key, value);
          }
        });

        const { data } = await api.get(
          `/purchase-payments/dashboard?${params.toString()}`,
          {
            headers: getAuthHeaders(),
          }
        );
        return data.data as PaymentDashboard;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    useGetPurchasePayments,
    useGetPurchasePayment,
    useCreatePurchasePayment,
    useUpdatePurchasePayment,
    useDeletePurchasePayment,
    useApprovePurchasePayment,
    usePaymentStats,
    useSupplierOutstanding,
    usePaymentMethods,
    useSuppliersForPayment,
    useAllocatePayment,
    useAutoAllocatePayment,
    usePaymentDashboard,
  };
};
