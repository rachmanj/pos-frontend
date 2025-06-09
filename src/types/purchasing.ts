// Supplier Types
export interface Supplier {
  id: number;
  name: string;
  code: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_number?: string;
  payment_terms?: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  purchase_orders_count?: number;
  total_purchase_amount?: number;
  average_delivery_time?: number;
  performance_rating?: number;
}

// Purchase Order Types
export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  order_date: string;
  expected_delivery_date?: string;
  status:
    | "draft"
    | "pending_approval"
    | "approved"
    | "sent_to_supplier"
    | "partially_received"
    | "fully_received"
    | "cancelled";
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_by: number;
  approved_by?: number;
  approved_date?: string;
  supplier: Supplier;
  creator: {
    id: number;
    name: string;
  };
  approver?: {
    id: number;
    name: string;
  };
  items: PurchaseOrderItem[];
  receipts?: PurchaseReceipt[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  unit_id: number;
  quantity_ordered: number;
  unit_price: number;
  total_price: number;
  quantity_received: number;
  quantity_remaining: number;
  received_percentage: number;
  product: {
    id: number;
    name: string;
    sku: string;
    image?: string;
  };
  unit: {
    id: number;
    name: string;
    symbol: string;
  };
  created_at: string;
  updated_at: string;
}

// Purchase Receipt Types
export interface PurchaseReceipt {
  id: number;
  receipt_number: string;
  purchase_order_id: number;
  received_date: string;
  status: "draft" | "received" | "quality_check" | "approved" | "rejected";
  notes?: string;
  quality_check_status: "pending" | "passed" | "failed" | "partial";
  stock_updated: boolean;
  received_by: number;
  approved_by?: number;
  approved_date?: string;
  purchase_order: PurchaseOrder;
  receiver: {
    id: number;
    name: string;
  };
  approver?: {
    id: number;
    name: string;
  };
  items: PurchaseReceiptItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseReceiptItem {
  id: number;
  purchase_receipt_id: number;
  purchase_order_item_id: number;
  product_id: number;
  unit_id: number;
  quantity_ordered: number;
  quantity_received: number;
  quantity_accepted: number;
  quantity_rejected: number;
  unit_cost: number;
  total_cost: number;
  quality_status: "pending" | "passed" | "failed" | "partial";
  quality_notes?: string;
  acceptance_rate: number;
  product: {
    id: number;
    name: string;
    sku: string;
    image?: string;
  };
  unit: {
    id: number;
    name: string;
    symbol: string;
  };
  purchase_order_item: PurchaseOrderItem;
  created_at: string;
  updated_at: string;
}

// Form Data Types
export interface CreateSupplierData {
  name: string;
  code: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_number?: string;
  payment_terms?: number;
  status: "active" | "inactive";
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {}

export interface CreatePurchaseOrderData {
  supplier_id: number;
  order_date: string;
  expected_delivery_date?: string;
  notes?: string;
  items: {
    product_id: number;
    unit_id: number;
    quantity_ordered: number;
    unit_price: number;
  }[];
}

export interface UpdatePurchaseOrderData {
  supplier_id?: number;
  order_date?: string;
  expected_delivery_date?: string;
  notes?: string;
  items: {
    id?: number;
    product_id: number;
    unit_id: number;
    quantity_ordered: number;
    unit_price: number;
  }[];
}

export interface CreatePurchaseReceiptData {
  purchase_order_id: number;
  received_date: string;
  notes?: string;
  items: {
    purchase_order_item_id: number;
    quantity_received: number;
    quantity_accepted: number;
    quantity_rejected: number;
    unit_cost: number;
    quality_status: "pending" | "passed" | "failed" | "partial";
    quality_notes?: string;
  }[];
}

export interface UpdatePurchaseReceiptData
  extends Partial<CreatePurchaseReceiptData> {}

// API Response Types
export interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface SuppliersResponse {
  data: Supplier[];
  pagination: PaginationData;
  message?: string;
}

export interface SupplierResponse {
  data: Supplier;
  message?: string;
}

export interface ActiveSuppliersResponse {
  data: Supplier[];
  message?: string;
}

export interface SupplierPerformanceResponse {
  data: {
    supplier: Supplier;
    total_orders: number;
    total_amount: number;
    average_delivery_time: number;
    on_time_delivery_rate: number;
    quality_rating: number;
    recent_orders: PurchaseOrder[];
    monthly_stats: Array<{
      month: string;
      orders_count: number;
      total_amount: number;
      delivery_performance: number;
    }>;
  };
  message?: string;
}

export interface PurchaseOrdersResponse {
  data: PurchaseOrder[];
  pagination: PaginationData;
  message?: string;
}

export interface PurchaseOrderResponse {
  data: PurchaseOrder;
  message?: string;
}

export interface PurchaseOrderAnalyticsResponse {
  data: {
    total_orders: number;
    total_amount: number;
    pending_approval: number;
    pending_delivery: number;
    monthly_stats: Array<{
      month: string;
      orders_count: number;
      total_amount: number;
    }>;
    top_suppliers: Array<{
      supplier: Supplier;
      orders_count: number;
      total_amount: number;
    }>;
    status_breakdown: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
  };
  message?: string;
}

export interface PurchaseReceiptsResponse {
  data: PurchaseReceipt[];
  pagination: PaginationData;
  message?: string;
}

export interface PurchaseReceiptResponse {
  data: PurchaseReceipt;
  message?: string;
}

export interface ReceivableItemsResponse {
  data: {
    purchase_order: PurchaseOrder;
    receivable_items: Array<{
      purchase_order_item: PurchaseOrderItem;
      quantity_remaining: number;
      can_receive: boolean;
    }>;
  };
  message?: string;
}

export interface PurchaseReceiptAnalyticsResponse {
  data: {
    total_receipts: number;
    pending_quality_check: number;
    approved_receipts: number;
    rejected_receipts: number;
    quality_stats: {
      passed_rate: number;
      failed_rate: number;
      partial_rate: number;
    };
    monthly_receiving: Array<{
      month: string;
      receipts_count: number;
      items_received: number;
    }>;
  };
  message?: string;
}

// Filter Types
export interface SupplierFilters {
  status?: "active" | "inactive";
  search?: string;
  city?: string;
  country?: string;
  sort_by?: "name" | "code" | "created_at" | "purchase_orders_count";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface PurchaseOrderFilters {
  supplier_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  created_by?: number;
  approved_by?: number;
  sort_by?: "po_number" | "order_date" | "total_amount" | "created_at";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface PurchaseReceiptFilters {
  purchase_order_id?: number;
  status?: string;
  quality_check_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  received_by?: number;
  approved_by?: number;
  stock_updated?: boolean;
  sort_by?: "receipt_number" | "received_date" | "created_at";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

// Utility Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  validation_errors?: ValidationError[];
}

// Status Badge Types
export type PurchaseOrderStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "sent_to_supplier"
  | "partially_received"
  | "fully_received"
  | "cancelled";
export type PurchaseReceiptStatus =
  | "draft"
  | "received"
  | "quality_check"
  | "approved"
  | "rejected";
export type QualityStatus = "pending" | "passed" | "failed" | "partial";
export type SupplierStatus = "active" | "inactive";
