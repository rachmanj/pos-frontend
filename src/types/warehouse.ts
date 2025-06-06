// Warehouse Management Types

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: "main" | "branch" | "storage" | "distribution";
  status: "active" | "inactive" | "maintenance";
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  manager_phone?: string;
  latitude?: number;
  longitude?: number;
  total_area?: number;
  storage_area?: number;
  max_capacity?: number;
  current_utilization?: number;
  opening_time?: string;
  closing_time?: string;
  operating_days?: string[];
  is_default: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
  zones?: WarehouseZone[];
  stocks?: WarehouseStock[];

  // Computed properties from API
  total_zones?: number;
  total_stock_value?: number;
  total_products?: number;
  low_stock_count?: number;
  active_zones_count?: number;
  utilization_percentage?: number;
  available_capacity?: number;
  is_operational?: boolean;

  // Compatibility properties for frontend
  is_active?: boolean; // derived from status === 'active'
  capacity_cubic_meters?: number; // alias for max_capacity
  used_capacity?: number; // alias for current_utilization
}

export interface WarehouseZone {
  id: number;
  warehouse_id: number;
  code: string;
  name: string;
  description?: string;
  zone_type:
    | "general"
    | "cold"
    | "frozen"
    | "hazmat"
    | "bulk"
    | "picking"
    | "staging"
    | "receiving";
  status: "active" | "inactive" | "maintenance";
  capacity_cubic_meters?: number;
  temperature_min?: number;
  temperature_max?: number;
  humidity_min?: number;
  humidity_max?: number;
  sort_order?: number;
  created_at: string;
  updated_at: string;
  warehouse?: Warehouse;
  stocks?: WarehouseStock[];

  // Computed properties from API
  used_capacity?: number;
  available_capacity?: number;
  utilization_percentage?: number;
  is_active?: boolean; // computed from status === 'active'
}

export interface WarehouseStock {
  id: number;
  warehouse_id: number;
  zone_id?: number;
  product_id: number;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  unit_id: number;
  cost_per_unit: number;
  total_value: number;
  lot_number?: string;
  batch_number?: string;
  expiry_date?: string;
  bin_location?: string;
  last_counted_at?: string;
  created_at: string;
  updated_at: string;
  warehouse?: Warehouse;
  zone?: WarehouseZone;
  product?: {
    id: number;
    name: string;
    sku: string;
    barcode?: string;
    image?: string;
  };
  unit?: {
    id: number;
    name: string;
    abbreviation: string;
  };
}

export interface StockTransfer {
  id: number;
  transfer_number: string;
  from_warehouse_id: number;
  to_warehouse_id: number;
  status:
    | "draft"
    | "pending_approval"
    | "approved"
    | "in_transit"
    | "received"
    | "cancelled";
  requested_by: number;
  approved_by?: number;
  shipped_by?: number;
  received_by?: number;
  requested_date: string;
  approved_date?: string;
  shipped_date?: string;
  received_date?: string;
  expected_delivery_date?: string;
  notes?: string;
  shipping_cost?: number;
  total_items: number;
  total_quantity: number;
  total_value: number;
  created_at: string;
  updated_at: string;
  from_warehouse?: Warehouse;
  to_warehouse?: Warehouse;
  requested_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  approved_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  items?: StockTransferItem[];
}

export interface StockTransferItem {
  id: number;
  stock_transfer_id: number;
  product_id: number;
  from_zone_id?: number;
  to_zone_id?: number;
  requested_quantity: number;
  approved_quantity?: number;
  shipped_quantity?: number;
  received_quantity?: number;
  unit_id: number;
  unit_cost: number;
  total_cost: number;
  lot_number?: string;
  batch_number?: string;
  expiry_date?: string;
  notes?: string;
  damage_quantity?: number;
  damage_reason?: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    sku: string;
    barcode?: string;
    image?: string;
  };
  unit?: {
    id: number;
    name: string;
    abbreviation: string;
  };
  from_zone?: WarehouseZone;
  to_zone?: WarehouseZone;
}

// API Response Types
export interface WarehouseListResponse {
  data: Warehouse[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface WarehouseStockListResponse {
  data: WarehouseStock[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface StockTransferListResponse {
  data: StockTransfer[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Form Types
export interface WarehouseFormData {
  code: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  manager_phone?: string;
  manager_email?: string;
  latitude?: number;
  longitude?: number;
  capacity_cubic_meters?: number;
  operating_hours?: string;
  is_active: boolean;
  is_default: boolean;
}

export interface WarehouseZoneFormData {
  warehouse_id: number;
  code?: string;
  name: string;
  description?: string;
  zone_type:
    | "general"
    | "cold"
    | "frozen"
    | "hazmat"
    | "bulk"
    | "picking"
    | "staging"
    | "receiving";
  status: "active" | "inactive" | "maintenance";
  capacity_cubic_meters?: number;
  temperature_min?: number;
  temperature_max?: number;
  humidity_min?: number;
  humidity_max?: number;
  sort_order?: number;
}

export interface StockTransferFormData {
  from_warehouse_id: number;
  to_warehouse_id: number;
  expected_delivery_date?: string;
  notes?: string;
  items: {
    product_id: number;
    requested_quantity: number;
    notes?: string;
  }[];
}

// Filter Types
export interface WarehouseFilters {
  search?: string;
  city?: string;
  state?: string;
  is_active?: boolean;
  is_default?: boolean;
  manager?: string;
}

export interface WarehouseStockFilters {
  search?: string;
  warehouse_id?: number;
  zone_id?: number;
  product_id?: number;
  low_stock?: boolean;
  expired?: boolean;
  expiring_soon?: boolean;
  lot_number?: string;
  batch_number?: string;
}

export interface StockTransferFilters {
  search?: string;
  status?: string;
  from_warehouse_id?: number;
  to_warehouse_id?: number;
  requested_by?: number;
  date_from?: string;
  date_to?: string;
}

// Analytics Types
export interface WarehouseAnalytics {
  total_warehouses: number;
  active_warehouses: number;
  total_capacity: number;
  used_capacity: number;
  utilization_percentage: number;
  total_zones: number;
  total_products: number;
  total_stock_value: number;
  pending_transfers: number;
  low_stock_items: number;
  expired_items: number;
  expiring_soon_items: number;
}

export interface WarehousePerformance {
  warehouse_id: number;
  warehouse_name: string;
  total_capacity: number;
  used_capacity: number;
  utilization_percentage: number;
  total_zones: number;
  total_products: number;
  stock_value: number;
  inbound_transfers: number;
  outbound_transfers: number;
  stock_movements: number;
  efficiency_score: number;
}

// Constants
export const ZONE_TYPES = [
  { value: "general", label: "General Storage" },
  { value: "cold", label: "Cold Storage" },
  { value: "frozen", label: "Frozen Storage" },
  { value: "hazmat", label: "Hazardous Materials" },
  { value: "bulk", label: "Bulk Storage" },
  { value: "picking", label: "Picking Area" },
  { value: "staging", label: "Staging Area" },
  { value: "receiving", label: "Receiving Area" },
] as const;

export const TRANSFER_STATUSES = [
  { value: "draft", label: "Draft", color: "gray" },
  { value: "pending_approval", label: "Pending Approval", color: "yellow" },
  { value: "approved", label: "Approved", color: "blue" },
  { value: "in_transit", label: "In Transit", color: "purple" },
  { value: "received", label: "Received", color: "green" },
  { value: "cancelled", label: "Cancelled", color: "red" },
] as const;

export type ZoneType = (typeof ZONE_TYPES)[number]["value"];
export type TransferStatus = (typeof TRANSFER_STATUSES)[number]["value"];
