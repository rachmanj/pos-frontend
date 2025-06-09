// ============================================================================
// SALES ORDER MANAGEMENT SYSTEM - TYPESCRIPT INTERFACES
// ============================================================================
// Complete type definitions for Sales Orders, Delivery Orders, Sales Invoices,
// and Delivery Routes with comprehensive relationships and filtering
// ============================================================================

// Base timestamp interface
export interface TimestampFields {
  created_at: string;
  updated_at: string;
}

// User reference interface
export interface UserReference {
  id: number;
  name: string;
  email?: string;
}

// Sales Order Status
export type SalesOrderStatus =
  | "draft"
  | "confirmed"
  | "approved"
  | "in_progress"
  | "completed"
  | "cancelled";

// Sales Order Item interface
export interface SalesOrderItem extends TimestampFields {
  id: number;
  sales_order_id: number;
  product_id: number;
  quantity_ordered: number;
  unit_price: number;
  discount_amount: number;
  tax_rate: number;
  line_total: number;
  quantity_delivered: number;
  quantity_remaining: number;
  delivery_status: "pending" | "partial" | "completed";
  notes?: string;

  // Relationships
  product?: {
    id: number;
    name: string;
    sku: string;
    unit?: {
      id: number;
      name: string;
      abbreviation: string;
    };
  };
}

// Sales Order interface
export interface SalesOrder extends TimestampFields {
  id: number;
  sales_order_number: string;
  customer_id: number;
  warehouse_id: number;
  order_date: string;
  requested_delivery_date: string;
  confirmed_delivery_date?: string;
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  order_status: SalesOrderStatus;
  payment_terms_days: number;
  credit_approved_by?: number;
  credit_approval_date?: string;
  sales_rep_id?: number;
  notes?: string;
  special_instructions?: string;
  created_by: number;
  approved_by?: number;
  cancelled_by?: number;
  cancellation_reason?: string;

  // Relationships
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    company_name?: string;
    credit_limit?: number;
    current_ar_balance?: number;
  };
  warehouse?: {
    id: number;
    name: string;
    code: string;
    address?: string;
  };
  sales_rep?: UserReference;
  creator?: UserReference;
  approver?: UserReference;
  canceller?: UserReference;
  items?: SalesOrderItem[];

  // Computed fields
  items_count?: number;
  delivered_amount?: number;
  remaining_amount?: number;
  delivery_progress?: number;
}

// Delivery Status
export type DeliveryStatus = "pending" | "in_transit" | "delivered" | "failed";

// Delivery Order Item interface
export interface DeliveryOrderItem extends TimestampFields {
  id: number;
  delivery_order_id: number;
  sales_order_item_id: number;
  product_id: number;
  quantity_to_deliver: number;
  quantity_delivered: number;
  unit_price: number;
  line_total: number;
  delivery_notes?: string;

  // Relationships
  product?: {
    id: number;
    name: string;
    sku: string;
  };
}

// Delivery Order interface
export interface DeliveryOrder extends TimestampFields {
  id: number;
  delivery_order_number: string;
  sales_order_id: number;
  warehouse_id: number;
  delivery_date: string;
  delivery_address: string;
  delivery_contact: string;
  delivery_status: DeliveryStatus;
  driver_id?: number;
  vehicle_id?: number;
  delivery_notes?: string;
  shipped_at?: string;
  delivered_at?: string;
  delivery_confirmed_by?: string;

  // Relationships
  sales_order?: SalesOrder;
  warehouse?: {
    id: number;
    name: string;
    code: string;
  };
  driver?: {
    id: number;
    name: string;
    phone?: string;
  };
  items?: DeliveryOrderItem[];

  // Computed fields
  items_count?: number;
  total_quantity?: number;
  total_amount?: number;
}

// Invoice Status
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

// Payment Status
export type PaymentStatus = "unpaid" | "partial" | "paid";

// Sales Invoice Item interface
export interface SalesInvoiceItem extends TimestampFields {
  id: number;
  sales_invoice_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_rate: number;
  line_total: number;
  description?: string;

  // Relationships
  product?: {
    id: number;
    name: string;
    sku: string;
  };
}

// Sales Invoice interface
export interface SalesInvoice extends TimestampFields {
  id: number;
  invoice_number: string;
  sales_order_id?: number;
  delivery_order_id?: number;
  customer_id: number;
  invoice_date: string;
  due_date: string;
  payment_terms_days: number;
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  invoice_status: InvoiceStatus;
  payment_status: PaymentStatus;
  sent_at?: string;
  sent_method?: "email" | "print" | "postal";
  sent_to?: string;
  notes?: string;

  // Relationships
  customer?: {
    id: number;
    name: string;
    email?: string;
    company_name?: string;
  };
  sales_order?: SalesOrder;
  delivery_order?: DeliveryOrder;
  items?: SalesInvoiceItem[];

  // Computed fields
  items_count?: number;
  paid_amount?: number;
  outstanding_amount?: number;
  days_overdue?: number;
}

// Route Status
export type RouteStatus = "planned" | "in_progress" | "completed";

// Stop Status
export type StopStatus = "pending" | "arrived" | "completed" | "failed";

// Delivery Route Stop interface
export interface DeliveryRouteStop extends TimestampFields {
  id: number;
  delivery_route_id: number;
  delivery_order_id: number;
  stop_sequence: number;
  estimated_arrival?: string;
  actual_arrival?: string;
  stop_duration?: number;
  stop_status: StopStatus;

  // Relationships
  delivery_order?: DeliveryOrder;
}

// Delivery Route interface
export interface DeliveryRoute extends TimestampFields {
  id: number;
  route_name: string;
  route_date: string;
  driver_id?: number;
  vehicle_id?: string;
  start_time?: string;
  end_time?: string;
  total_distance?: number;
  estimated_duration?: number;
  route_status: RouteStatus;

  // Relationships
  driver?: {
    id: number;
    name: string;
    phone?: string;
  };
  stops?: DeliveryRouteStop[];

  // Computed fields
  stops_count?: number;
  completed_stops?: number;
  remaining_stops?: number;
}

// ============================================================================
// FILTER INTERFACES
// ============================================================================

// Filter interfaces
export interface SalesOrderFilters {
  search?: string;
  customer_id?: number;
  warehouse_id?: number;
  sales_rep_id?: number;
  order_status?: SalesOrderStatus | "all";
  payment_terms_days?: number | "all";
  order_date_from?: string;
  order_date_to?: string;
  delivery_date_from?: string;
  delivery_date_to?: string;
  amount_min?: number;
  amount_max?: number;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface DeliveryOrderFilters {
  search?: string;
  sales_order_id?: number;
  warehouse_id?: number;
  driver_id?: number;
  delivery_status?: DeliveryStatus | "all";
  delivery_date_from?: string;
  delivery_date_to?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface SalesInvoiceFilters {
  search?: string;
  customer_id?: number;
  sales_order_id?: number;
  invoice_status?: InvoiceStatus | "all";
  payment_status?: PaymentStatus | "all";
  invoice_date_from?: string;
  invoice_date_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  amount_min?: number;
  amount_max?: number;
  overdue_only?: boolean;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// ============================================================================
// FORM DATA INTERFACES
// ============================================================================

// Form data interfaces
export interface SalesOrderFormData {
  customer_id: number;
  warehouse_id: number;
  order_date: string;
  requested_delivery_date: string;
  payment_terms_days: number;
  sales_rep_id?: number;
  notes?: string;
  special_instructions?: string;
  items: {
    product_id: number;
    quantity_ordered: number;
    unit_price: number;
    discount_amount?: number;
    tax_rate?: number;
    notes?: string;
  }[];
}

export interface DeliveryOrderFormData {
  sales_order_id: number;
  warehouse_id: number;
  delivery_date: string;
  delivery_address: string;
  delivery_contact: string;
  driver_id?: number;
  vehicle_id?: string;
  delivery_notes?: string;
  items: {
    sales_order_item_id: number;
    product_id: number;
    quantity_to_deliver: number;
    delivery_notes?: string;
  }[];
}

export interface SalesInvoiceFormData {
  sales_order_id?: number;
  delivery_order_id?: number;
  customer_id: number;
  invoice_date: string;
  due_date: string;
  payment_terms_days: number;
  sent_method?: "email" | "print" | "postal";
  sent_to?: string;
  notes?: string;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
    tax_rate?: number;
    description?: string;
  }[];
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

// API Response interfaces
export interface SalesOrderResponse {
  success: boolean;
  data: SalesOrder;
  message?: string;
}

export interface SalesOrderListResponse {
  success: boolean;
  data: {
    data: SalesOrder[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  message?: string;
}

export interface DeliveryOrderResponse {
  success: boolean;
  data: DeliveryOrder;
  message?: string;
}

export interface DeliveryOrderListResponse {
  success: boolean;
  data: {
    data: DeliveryOrder[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  message?: string;
}

export interface SalesInvoiceResponse {
  success: boolean;
  data: SalesInvoice;
  message?: string;
}

export interface SalesInvoiceListResponse {
  success: boolean;
  data: {
    data: SalesInvoice[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  message?: string;
}

// ============================================================================
// DROPDOWN OPTION INTERFACES
// ============================================================================

// Option interfaces for dropdowns
export interface CustomerOption {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  credit_limit?: number;
  current_ar_balance?: number;
}

export interface WarehouseOption {
  id: number;
  name: string;
  code: string;
  address?: string;
}

export interface ProductOption {
  id: number;
  name: string;
  sku: string;
  price: number;
  available_stock?: number;
  unit?: {
    id: number;
    name: string;
    abbreviation: string;
  };
}

export interface UserOption {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface DriverOption {
  id: number;
  name: string;
  phone?: string;
  license_number?: string;
}

export interface VehicleOption {
  id: string;
  name: string;
  license_plate: string;
  capacity?: number;
}

// ============================================================================
// STATISTICS INTERFACES
// ============================================================================

// Statistics interfaces
export interface SalesOrderStats {
  total_orders: number;
  draft_orders: number;
  confirmed_orders: number;
  approved_orders: number;
  in_progress_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_value: number;
  average_order_value: number;
  pending_delivery_value: number;
}

export interface DeliveryOrderStats {
  total_deliveries: number;
  pending_deliveries: number;
  in_transit_deliveries: number;
  completed_deliveries: number;
  failed_deliveries: number;
  on_time_delivery_rate: number;
  average_delivery_time: number;
}

export interface SalesInvoiceStats {
  total_invoices: number;
  draft_invoices: number;
  sent_invoices: number;
  paid_invoices: number;
  overdue_invoices: number;
  total_invoice_value: number;
  total_paid_amount: number;
  total_outstanding_amount: number;
  average_payment_days: number;
}

// ============================================================================
// STATUS COLOR MAPPINGS
// ============================================================================

// Status color mappings
export const SALES_ORDER_STATUS_COLORS: Record<SalesOrderStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_transit: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  unpaid: "bg-red-100 text-red-800",
  partial: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
};
