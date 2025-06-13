import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

// Enhanced Customer interface with CRM fields
export interface CustomerCrm {
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
  customer_notes?: string;
  preferences?: Record<string, any>;

  // Tax Configuration
  tax_exempt?: boolean;
  tax_rate_override?: number;
  exemption_reason?: string;
  exemption_details?: string;

  // Enhanced CRM fields
  business_type?: "individual" | "company" | "government" | "ngo";
  industry?: string;
  company_size?: "micro" | "small" | "medium" | "large" | "enterprise";
  annual_revenue?: number;
  website?: string;
  social_media?: Record<string, any>;

  // Lead management
  lead_source?:
    | "website"
    | "referral"
    | "advertisement"
    | "cold_call"
    | "social_media"
    | "trade_show"
    | "other";
  lead_stage?: "lead" | "prospect" | "qualified" | "customer" | "vip";
  lead_score?: number;
  conversion_date?: string;

  // Relationship management
  assigned_to?: number;
  account_manager?: string;
  relationship_status?: "new" | "active" | "at_risk" | "churned" | "won_back";
  last_contact_date?: string;
  next_follow_up_date?: string;
  communication_preferences?: Record<string, any>;

  // Financial information
  payment_terms?: "cash" | "net_15" | "net_30" | "net_45" | "net_60" | "custom";
  payment_method_preference?: string;
  currency_preference?: string;

  // Loyalty and engagement
  loyalty_tier?: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  loyalty_points_balance?: number;
  total_spent: number;
  total_orders: number;
  average_order_value?: number;
  last_purchase_date?: string;
  purchase_frequency?: number;

  // Risk management
  is_blacklisted?: boolean;
  blacklist_reason?: string;
  blacklisted_at?: string;
  blacklisted_by?: number;
  risk_level?: "low" | "medium" | "high";

  // Referral system
  referred_by?: number;
  referral_count: number;
  referral_commission_earned?: number;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relationships
  contacts?: CustomerContact[];
  addresses?: CustomerAddress[];
  notes?: CustomerNote[];
  loyalty_points?: CustomerLoyaltyPoint[];
}

export interface CustomerContact {
  id: number;
  customer_id: number;
  name: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  role:
    | "primary"
    | "decision_maker"
    | "technical"
    | "financial"
    | "invoice_recipient"
    | "other";
  is_primary: boolean;
  communication_preferences?: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: number;
  customer_id: number;
  type: "billing" | "shipping" | "office" | "warehouse" | "other";
  label?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  delivery_instructions?: string;
  access_notes?: string;
  business_hours?: Record<string, any>;
  contact_person?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerNote {
  id: number;
  customer_id: number;
  type:
    | "general"
    | "call"
    | "meeting"
    | "email"
    | "complaint"
    | "opportunity"
    | "follow_up";
  title: string;
  content: string;
  is_private: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  follow_up_date?: string;
  follow_up_assigned_to?: number;
  tags?: string[];
  attachments?: string[];
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerLoyaltyPoint {
  id: number;
  customer_id: number;
  transaction_type: "earned" | "redeemed" | "expired" | "adjusted";
  points: number;
  balance_after: number;
  description: string;
  reference_type?: string;
  reference_id?: number;
  expires_at?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerCrmFilters {
  search?: string;
  type?: string;
  status?: string;
  lead_stage?: string;
  loyalty_tier?: string;
  assigned_to?: number;
  is_blacklisted?: boolean;
  has_follow_up?: boolean;
  sort_field?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface CustomerCrmFormData {
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

  // Tax Configuration
  tax_exempt?: boolean;
  tax_rate_override?: number;
  exemption_reason?: string;
  exemption_details?: string;

  // Enhanced CRM fields
  business_type?: "individual" | "company" | "government" | "ngo";
  industry?: string;
  company_size?: "micro" | "small" | "medium" | "large" | "enterprise";
  annual_revenue?: number;
  website?: string;
  lead_source?:
    | "website"
    | "referral"
    | "advertisement"
    | "cold_call"
    | "social_media"
    | "trade_show"
    | "other";
  lead_stage?: "lead" | "prospect" | "qualified" | "customer" | "vip";
  assigned_to?: number;
  payment_terms?: "cash" | "net_15" | "net_30" | "net_45" | "net_60" | "custom";
  loyalty_tier?: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  referred_by?: number;
}

export interface CustomerCrmAnalytics {
  total_customers: number;
  new_customers_this_month: number;
  active_customers: number;
  vip_customers: number;
  total_revenue: number;
  average_order_value: number;
  customer_lifetime_value: number;
  churn_rate: number;

  // Lead analytics
  total_leads: number;
  conversion_rate: number;
  leads_by_stage: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;

  // Loyalty analytics
  loyalty_distribution: Array<{
    tier: string;
    count: number;
    percentage: number;
  }>;

  // Top customers
  top_customers: Array<{
    customer: CustomerCrm;
    total_spent: number;
    total_orders: number;
  }>;

  // Growth trends
  growth_trends: Array<{
    month: string;
    new_customers: number;
    total_revenue: number;
  }>;
}

export interface DropdownData {
  users: Array<{ id: number; name: string }>;
  industries: string[];
  lead_sources: string[];
  payment_terms: string[];
  loyalty_tiers: string[];
}

// Get customers with CRM filters
export const useCustomersCrm = (filters: CustomerCrmFilters = {}) => {
  return useQuery({
    queryKey: ["customers-crm", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const { data } = await api.get(`/customers-crm?${params.toString()}`);
      return data.data;
    },
  });
};

// Get single customer with CRM data
export const useCustomerCrm = (customerId: number | undefined) => {
  return useQuery({
    queryKey: ["customer-crm", customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const { data } = await api.get(`/customers-crm/${customerId}`);
      return data.data as CustomerCrm;
    },
    enabled: !!customerId,
  });
};

// Get customer CRM analytics
export const useCustomerCrmAnalytics = (
  filters: { date_from?: string; date_to?: string } = {}
) => {
  return useQuery({
    queryKey: ["customer-crm-analytics", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const { data } = await api.get(
        `/customers-crm/analytics?${params.toString()}`
      );
      return data.data as CustomerCrmAnalytics;
    },
  });
};

// Get dropdown data for forms
export const useCustomerCrmDropdownData = () => {
  return useQuery({
    queryKey: ["customer-crm-dropdown-data"],
    queryFn: async () => {
      const { data } = await api.get("/customers-crm/dropdown-data");
      return data.data as DropdownData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get customer contacts
export const useCustomerContacts = (customerId: number | undefined) => {
  return useQuery({
    queryKey: ["customer-contacts", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data } = await api.get(`/customers-crm/${customerId}/contacts`);
      return data.data as CustomerContact[];
    },
    enabled: !!customerId,
  });
};

// Get customer addresses
export const useCustomerAddresses = (customerId: number | undefined) => {
  return useQuery({
    queryKey: ["customer-addresses", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data } = await api.get(`/customers-crm/${customerId}/addresses`);
      return data.data as CustomerAddress[];
    },
    enabled: !!customerId,
  });
};

// Get customer notes
export const useCustomerNotes = (customerId: number | undefined) => {
  return useQuery({
    queryKey: ["customer-notes", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data } = await api.get(`/customers-crm/${customerId}/notes`);
      return data.data as CustomerNote[];
    },
    enabled: !!customerId,
  });
};

// Get customer loyalty points
export const useCustomerLoyaltyPoints = (customerId: number | undefined) => {
  return useQuery({
    queryKey: ["customer-loyalty-points", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data } = await api.get(
        `/customers-crm/${customerId}/loyalty-points`
      );
      return data.data as CustomerLoyaltyPoint[];
    },
    enabled: !!customerId,
  });
};

// Create customer
export const useCreateCustomerCrm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData: CustomerCrmFormData) => {
      const { data } = await api.post("/customers-crm", customerData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers-crm"] });
      queryClient.invalidateQueries({ queryKey: ["customer-crm-analytics"] });
      toast.success("Customer created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create customer");
    },
  });
};

// Update customer
export const useUpdateCustomerCrm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...customerData
    }: CustomerCrmFormData & { id: number }) => {
      const { data } = await api.put(`/customers-crm/${id}`, customerData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers-crm"] });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["customer-crm-analytics"] });
      toast.success("Customer updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update customer");
    },
  });
};

// Delete customer
export const useDeleteCustomerCrm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: number) => {
      await api.delete(`/customers-crm/${customerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers-crm"] });
      queryClient.invalidateQueries({ queryKey: ["customer-crm-analytics"] });
      toast.success("Customer deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete customer");
    },
  });
};

// Blacklist customer
export const useBlacklistCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      reason,
    }: {
      customerId: number;
      reason: string;
    }) => {
      const { data } = await api.post(
        `/customers-crm/${customerId}/blacklist`,
        { reason }
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers-crm"] });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.customerId],
      });
      toast.success("Customer blacklisted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to blacklist customer"
      );
    },
  });
};

// Unblacklist customer
export const useUnblacklistCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: number) => {
      const { data } = await api.post(
        `/customers-crm/${customerId}/unblacklist`
      );
      return data.data;
    },
    onSuccess: (_, customerId) => {
      queryClient.invalidateQueries({ queryKey: ["customers-crm"] });
      queryClient.invalidateQueries({ queryKey: ["customer-crm", customerId] });
      toast.success("Customer unblacklisted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to unblacklist customer"
      );
    },
  });
};

// Create customer contact
export const useCreateCustomerContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      contactData,
    }: {
      customerId: number;
      contactData: Omit<
        CustomerContact,
        "id" | "customer_id" | "created_at" | "updated_at"
      >;
    }) => {
      const { data } = await api.post(
        `/customers-crm/${customerId}/contacts`,
        contactData
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-contacts", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.customerId],
      });
      toast.success("Contact created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create contact");
    },
  });
};

// Update customer contact
export const useUpdateCustomerContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      contactId,
      contactData,
    }: {
      customerId: number;
      contactId: number;
      contactData: Partial<CustomerContact>;
    }) => {
      const { data } = await api.put(
        `/customers-crm/${customerId}/contacts/${contactId}`,
        contactData
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-contacts", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.customerId],
      });
      toast.success("Contact updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update contact");
    },
  });
};

// Delete customer contact
export const useDeleteCustomerContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      contactId,
    }: {
      customerId: number;
      contactId: number;
    }) => {
      await api.delete(`/customers-crm/${customerId}/contacts/${contactId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-contacts", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.customerId],
      });
      toast.success("Contact deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete contact");
    },
  });
};

// Create customer address
export const useCreateCustomerAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      addressData,
    }: {
      customerId: number;
      addressData: Omit<
        CustomerAddress,
        "id" | "customer_id" | "created_at" | "updated_at"
      >;
    }) => {
      const { data } = await api.post(
        `/customers-crm/${customerId}/addresses`,
        addressData
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-addresses", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.customerId],
      });
      toast.success("Address created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create address");
    },
  });
};

// Update customer address
export const useUpdateCustomerAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      addressId,
      addressData,
    }: {
      customerId: number;
      addressId: number;
      addressData: Partial<CustomerAddress>;
    }) => {
      const { data } = await api.put(
        `/customers-crm/${customerId}/addresses/${addressId}`,
        addressData
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-addresses", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.customerId],
      });
      toast.success("Address updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update address");
    },
  });
};

// Delete customer address
export const useDeleteCustomerAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      addressId,
    }: {
      customerId: number;
      addressId: number;
    }) => {
      await api.delete(`/customers-crm/${customerId}/addresses/${addressId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-addresses", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.customerId],
      });
      toast.success("Address deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete address");
    },
  });
};

// Create customer note
export const useCreateCustomerNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      noteData,
    }: {
      customerId: number;
      noteData: Omit<
        CustomerNote,
        "id" | "customer_id" | "created_by" | "created_at" | "updated_at"
      >;
    }) => {
      const { data } = await api.post(
        `/customers-crm/${customerId}/notes`,
        noteData
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-notes", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.customerId],
      });
      toast.success("Note created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create note");
    },
  });
};

// Update customer note
export const useUpdateCustomerNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      noteId,
      noteData,
    }: {
      customerId: number;
      noteId: number;
      noteData: Partial<CustomerNote>;
    }) => {
      const { data } = await api.put(
        `/customers-crm/${customerId}/notes/${noteId}`,
        noteData
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-notes", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.customerId],
      });
      toast.success("Note updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update note");
    },
  });
};

// Delete customer note
export const useDeleteCustomerNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      noteId,
    }: {
      customerId: number;
      noteId: number;
    }) => {
      await api.delete(`/customers-crm/${customerId}/notes/${noteId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-notes", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.customerId],
      });
      toast.success("Note deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete note");
    },
  });
};

// Adjust loyalty points
export const useAdjustLoyaltyPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      points,
      description,
    }: {
      customerId: number;
      points: number;
      description: string;
    }) => {
      const { data } = await api.post(
        `/customers-crm/${customerId}/loyalty-points/adjust`,
        { points, description }
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-loyalty-points", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.customerId],
      });
      toast.success("Loyalty points adjusted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to adjust loyalty points"
      );
    },
  });
};

// Redeem loyalty points
export const useRedeemLoyaltyPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      points,
      description,
    }: {
      customerId: number;
      points: number;
      description: string;
    }) => {
      const { data } = await api.post(
        `/customers-crm/${customerId}/loyalty-points/redeem`,
        { points, description }
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-loyalty-points", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-crm", variables.customerId],
      });
      toast.success("Loyalty points redeemed successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to redeem loyalty points"
      );
    },
  });
};
