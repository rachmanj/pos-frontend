import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export interface Customer {
  id: number;
  customer_code: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  type: "regular" | "vip" | "wholesale" | "member";
  status: "active" | "inactive" | "suspended";
  credit_limit?: number;
  tax_number?: string;
  company_name?: string;
  notes?: string;
  preferences?: Record<string, any>;
  total_spent: number;
  total_orders: number;
  loyalty_points: number;
  referral_count: number;
  last_purchase_date?: string;
  referred_by?: number;
  referrer?: Customer;
  referrals?: Customer[];
  sales?: Sale[];
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  sale_number: string;
  total_amount: number;
  sale_date: string;
  status: string;
}

export interface CustomerFilters {
  search?: string;
  type?: string;
  status?: string;
  recent_days?: number;
  inactive?: boolean;
  vip?: boolean;
  sort_field?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  type: "regular" | "vip" | "wholesale" | "member";
  status?: "active" | "inactive" | "suspended";
  credit_limit?: number;
  tax_number?: string;
  company_name?: string;
  notes?: string;
  preferences?: Record<string, any>;
  referred_by?: number;
}

export interface CustomerAnalytics {
  total_customers: number;
  new_customers_this_month: number;
  vip_customers: number;
  total_revenue: number;
  average_order_value: number;
  top_customers: Array<{
    customer: Customer;
    total_spent: number;
    total_orders: number;
  }>;
  customer_types: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  growth_trends: Array<{
    month: string;
    new_customers: number;
    total_revenue: number;
  }>;
}

// Get customers with filters
export const useCustomers = (filters: CustomerFilters = {}) => {
  return useQuery({
    queryKey: ["customers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const { data } = await api.get(`/customers?${params.toString()}`);
      return data.data;
    },
  });
};

// Get single customer
export const useCustomer = (customerId: number | undefined) => {
  return useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const { data } = await api.get(`/customers/${customerId}`);
      return data.data as Customer;
    },
    enabled: !!customerId,
  });
};

// Search customers
export const useCustomerSearch = (search: string) => {
  return useQuery({
    queryKey: ["customer-search", search],
    queryFn: async () => {
      if (!search.trim()) return [];
      const { data } = await api.get(
        `/customers/search?q=${encodeURIComponent(search)}`
      );
      return data.data as Customer[];
    },
    enabled: search.length >= 2,
    staleTime: 30000, // 30 seconds
  });
};

// Get customer analytics
export const useCustomerAnalytics = (
  filters: { date_from?: string; date_to?: string } = {}
) => {
  return useQuery({
    queryKey: ["customer-analytics", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const { data } = await api.get(
        `/customers/analytics?${params.toString()}`
      );
      return data.data as CustomerAnalytics;
    },
  });
};

// Get customer purchase history
export const useCustomerPurchaseHistory = (
  customerId: number,
  filters: { per_page?: number } = {}
) => {
  return useQuery({
    queryKey: ["customer-purchase-history", customerId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value.toString());
        }
      });

      const { data } = await api.get(
        `/customers/${customerId}/purchase-history?${params.toString()}`
      );
      return data.data;
    },
    enabled: !!customerId,
  });
};

// Create customer
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData: CustomerFormData) => {
      const { data } = await api.post("/customers", customerData);
      return data.data as Customer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-analytics"] });
      toast.success("Customer created successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to create customer";
      toast.error(message);
    },
  });
};

// Update customer
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: CustomerFormData;
    }) => {
      const response = await api.put(`/customers/${id}`, data);
      return response.data.data as Customer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", data.id] });
      queryClient.invalidateQueries({ queryKey: ["customer-analytics"] });
      toast.success("Customer updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update customer";
      toast.error(message);
    },
  });
};

// Delete customer
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: number) => {
      const { data } = await api.delete(`/customers/${customerId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-analytics"] });
      toast.success("Customer deleted successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to delete customer";
      toast.error(message);
    },
  });
};

// Update loyalty points
export const useUpdateLoyaltyPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      points,
      reason,
    }: {
      customerId: number;
      points: number;
      reason: string;
    }) => {
      const { data } = await api.patch(
        `/customers/${customerId}/loyalty-points`,
        {
          points,
          reason,
        }
      );
      return data.data as Customer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customer", data.id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Loyalty points updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update loyalty points";
      toast.error(message);
    },
  });
};
