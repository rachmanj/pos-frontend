import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ExtendedSession } from "@/types/auth";

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

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
  };

  return { getAuthHeaders };
};

// Types for AR system
export interface CustomerPaymentReceive {
  id: number;
  payment_number: string;
  customer_id: number;
  payment_method_id: number;
  total_amount: number;
  allocated_amount: number;
  unallocated_amount: number;
  payment_date: string;
  reference_number?: string;
  bank_reference?: string;
  status: "pending" | "verified" | "allocated" | "completed" | "cancelled";
  workflow_status:
    | "pending_verification"
    | "verified"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "completed";
  processed_by: number;
  verified_by?: number;
  approved_by?: number;
  rejected_by?: number;
  verified_at?: string;
  approved_at?: string;
  rejected_at?: string;
  requires_approval: boolean;
  notes?: string;
  verification_notes?: string;
  approval_notes?: string;
  rejection_reason?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    customer_code: string;
    phone?: string;
    email?: string;
    current_ar_balance: number;
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
  verifiedBy?: {
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
  customer_payment_receive_id: number;
  sale_id: number;
  customer_id: number;
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
  sale?: {
    id: number;
    sale_number: string;
    total_amount: number;
    outstanding_amount: number;
    due_date?: string;
  };
  allocatedBy?: {
    id: number;
    name: string;
  };
}

export interface CustomerOutstanding {
  customer: {
    id: number;
    name: string;
    customer_code: string;
    phone?: string;
    email?: string;
    current_ar_balance: number;
    creditLimit?: {
      credit_limit: number;
      available_credit: number;
      credit_status: string;
      payment_terms_days: number;
    };
  };
  outstanding_sales: Array<{
    id: number;
    sale_number: string;
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
    risk_score: number;
  };
  credit_limit?: {
    credit_limit: number;
    available_credit: number;
    credit_status: string;
    payment_terms_days: number;
    current_balance: number;
    overdue_amount: number;
  };
  summary: {
    total_outstanding: number;
    overdue_amount: number;
    sales_count: number;
    oldest_due_date?: string;
  };
}

export interface ARDashboard {
  summary: {
    total_payments: number;
    total_amount: number;
    allocated_amount: number;
    unallocated_amount: number;
    pending_verification: number;
    pending_approval: number;
  };
  recent_payments: CustomerPaymentReceive[];
  aging_summary: {
    total_outstanding: number;
    current: number;
    days_30: number;
    days_60: number;
    days_90: number;
    days_120_plus: number;
    overdue_percentage: number;
    high_risk_customers: number;
  };
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

export interface ARAgingReport {
  report_date: string;
  total_customers: number;
  total_aging: {
    current: number;
    days_30: number;
    days_60: number;
    days_90: number;
    days_120_plus: number;
    total: number;
  };
  customer_aging: Array<{
    customer: {
      id: number;
      name: string;
      customer_code: string;
      phone?: string;
      email?: string;
      customer_type: string;
    };
    current: number;
    days_30: number;
    days_60: number;
    days_90: number;
    days_120_plus: number;
    total: number;
    sales_count: number;
    oldest_due_date: string;
    sales: Array<{
      sale_number: string;
      outstanding_amount: number;
      due_date: string;
      days_overdue: number;
      bucket: string;
    }>;
  }>;
  aging_percentages: {
    current: number;
    days_30: number;
    days_60: number;
    days_90: number;
    days_120_plus: number;
  };
  risk_analysis: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

// Filters and form types
export interface PaymentReceiveFilters {
  customer_id?: number;
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

export interface CreatePaymentReceiveData {
  customer_id: number;
  payment_method_id: number;
  total_amount: number;
  payment_date: string;
  reference_number?: string;
  bank_reference?: string;
  notes?: string;
  auto_allocate?: boolean;
  allocations?: Array<{
    sale_id: number;
    allocated_amount: number;
    notes?: string;
  }>;
}

export interface UpdatePaymentReceiveData {
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
    sale_id: number;
    allocated_amount: number;
    notes?: string;
  }>;
}

export const useCustomerPaymentReceive = () => {
  const { getAuthHeaders } = useAuthToken();
  const queryClient = useQueryClient();

  // Get all payment receives with filters
  const usePaymentReceives = (filters: PaymentReceiveFilters = {}) => {
    return useQuery({
      queryKey: ["payment-receives", filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        const response = await fetch(
          `${API_BASE}/customer-payment-receives?${params}`,
          {
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch payment receives");
        }

        const data = await response.json();
        return data.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get single payment receive
  const usePaymentReceive = (id: number) => {
    return useQuery({
      queryKey: ["payment-receive", id],
      queryFn: async () => {
        const response = await fetch(
          `${API_BASE}/customer-payment-receives/${id}`,
          {
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch payment receive");
        }

        const data = await response.json();
        return data.data;
      },
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get AR dashboard data
  const useARDashboard = (
    filters: { date_from?: string; date_to?: string } = {}
  ) => {
    return useQuery({
      queryKey: ["ar-dashboard", filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.append(key, value);
          }
        });

        const response = await fetch(
          `${API_BASE}/customer-payment-receives/dashboard?${params}`,
          {
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch AR dashboard");
        }

        const data = await response.json();
        return data.data as ARDashboard;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get customer outstanding balance
  const useCustomerOutstanding = (customerId: number) => {
    return useQuery({
      queryKey: ["customer-outstanding", customerId],
      queryFn: async () => {
        const response = await fetch(
          `${API_BASE}/customers/${customerId}/outstanding`,
          {
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch customer outstanding");
        }

        const data = await response.json();
        return data.data as CustomerOutstanding;
      },
      enabled: !!customerId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get AR aging report
  const useARAgingReport = (
    filters: {
      customer_id?: number;
      customer_type?: string;
      date_from?: string;
      date_to?: string;
    } = {}
  ) => {
    return useQuery({
      queryKey: ["ar-aging-report", filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.append(key, value.toString());
          }
        });

        const response = await fetch(`${API_BASE}/ar-aging-report?${params}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch AR aging report");
        }

        const data = await response.json();
        return data.data as ARAgingReport;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Create payment receive
  const createPaymentReceive = useMutation({
    mutationFn: async (data: CreatePaymentReceiveData) => {
      const response = await fetch(`${API_BASE}/customer-payment-receives`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create payment receive");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-receives"] });
      queryClient.invalidateQueries({ queryKey: ["ar-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["customer-outstanding"] });
      toast.success("Payment receive created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update payment receive
  const updatePaymentReceive = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePaymentReceiveData;
    }) => {
      const response = await fetch(
        `${API_BASE}/customer-payment-receives/${id}`,
        {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update payment receive");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["payment-receives"] });
      queryClient.invalidateQueries({ queryKey: ["payment-receive", id] });
      queryClient.invalidateQueries({ queryKey: ["ar-dashboard"] });
      toast.success("Payment receive updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete payment receive
  const deletePaymentReceive = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(
        `${API_BASE}/customer-payment-receives/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete payment receive");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-receives"] });
      queryClient.invalidateQueries({ queryKey: ["ar-dashboard"] });
      toast.success("Payment receive deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Verify payment receive
  const verifyPaymentReceive = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes?: string }) => {
      const response = await fetch(
        `${API_BASE}/customer-payment-receives/${id}/verify`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to verify payment receive");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["payment-receives"] });
      queryClient.invalidateQueries({ queryKey: ["payment-receive", id] });
      queryClient.invalidateQueries({ queryKey: ["ar-dashboard"] });
      toast.success("Payment receive verified successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Approve payment receive
  const approvePaymentReceive = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes?: string }) => {
      const response = await fetch(
        `${API_BASE}/customer-payment-receives/${id}/approve`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve payment receive");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["payment-receives"] });
      queryClient.invalidateQueries({ queryKey: ["payment-receive", id] });
      queryClient.invalidateQueries({ queryKey: ["ar-dashboard"] });
      toast.success("Payment receive approved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Reject payment receive
  const rejectPaymentReceive = useMutation({
    mutationFn: async ({
      id,
      rejection_reason,
    }: {
      id: number;
      rejection_reason: string;
    }) => {
      const response = await fetch(
        `${API_BASE}/customer-payment-receives/${id}/reject`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rejection_reason }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject payment receive");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["payment-receives"] });
      queryClient.invalidateQueries({ queryKey: ["payment-receive", id] });
      queryClient.invalidateQueries({ queryKey: ["ar-dashboard"] });
      toast.success("Payment receive rejected successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Allocate payment
  const allocatePayment = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: AllocatePaymentData;
    }) => {
      const response = await fetch(
        `${API_BASE}/customer-payment-receives/${id}/allocate`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to allocate payment");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["payment-receives"] });
      queryClient.invalidateQueries({ queryKey: ["payment-receive", id] });
      queryClient.invalidateQueries({ queryKey: ["customer-outstanding"] });
      queryClient.invalidateQueries({ queryKey: ["ar-dashboard"] });
      toast.success("Payment allocated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Auto-allocate payment
  const autoAllocatePayment = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(
        `${API_BASE}/customer-payment-receives/${id}/auto-allocate`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to auto-allocate payment");
      }

      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["payment-receives"] });
      queryClient.invalidateQueries({ queryKey: ["payment-receive", id] });
      queryClient.invalidateQueries({ queryKey: ["customer-outstanding"] });
      queryClient.invalidateQueries({ queryKey: ["ar-dashboard"] });
      toast.success("Payment auto-allocated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    // Queries
    usePaymentReceives,
    usePaymentReceive,
    useARDashboard,
    useCustomerOutstanding,
    useARAgingReport,

    // Mutations
    createPaymentReceive,
    updatePaymentReceive,
    deletePaymentReceive,
    verifyPaymentReceive,
    approvePaymentReceive,
    rejectPaymentReceive,
    allocatePayment,
    autoAllocatePayment,
  };
};
