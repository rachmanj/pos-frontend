// Base Inventory Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  image?: string;
  status: "active" | "inactive";
  children?: Category[];
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  base_unit_id?: number;
  conversion_factor: number;
  base_unit?: Unit;
  derived_units?: Unit[];
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category_id?: number;
  unit_id: number;
  cost_price: number;
  selling_price: number;
  min_stock_level: number;
  max_stock_level?: number;
  tax_rate: number;
  image?: string;
  status: "active" | "inactive";
  category?: Category;
  unit: Unit;
  stock: ProductStock;
  created_at: string;
  updated_at: string;
}

export interface ProductStock {
  id: number;
  product_id: number;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  movement_type:
    | "in"
    | "out"
    | "adjustment"
    | "transfer"
    | "sale"
    | "purchase"
    | "return";
  quantity: number;
  unit_cost?: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  user_id: number;
  product: Product;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

// Form Data Types
export interface CreateCategoryData {
  name: string;
  description?: string;
  parent_id?: number;
  image?: string;
  status: "active" | "inactive";
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export interface CreateUnitData {
  name: string;
  symbol: string;
  base_unit_id?: number;
  conversion_factor: number;
}

export interface UpdateUnitData extends Partial<CreateUnitData> {}

export interface CreateProductData {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category_id?: number;
  unit_id: number;
  cost_price: number;
  selling_price: number;
  min_stock_level: number;
  max_stock_level?: number;
  tax_rate: number;
  image?: string;
  status: "active" | "inactive";
  initial_stock?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface CreateStockMovementData {
  product_id: number;
  movement_type: "in" | "out" | "adjustment";
  quantity: number;
  unit_cost?: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
}

export interface StockAdjustmentData {
  product_id: number;
  new_quantity: number;
  reason: string;
}

export interface BulkStockAdjustmentData {
  adjustments: {
    product_id: number;
    new_quantity: number;
  }[];
  reason: string;
}

// API Response Types
export interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface CategoriesResponse {
  data: Category[];
  pagination: PaginationData;
  message?: string;
}

export interface CategoryTreeResponse {
  data: Category[];
  message?: string;
}

export interface CategoryResponse {
  data: Category;
  message?: string;
}

export interface UnitsResponse {
  data: Unit[];
  pagination: PaginationData;
  message?: string;
}

export interface UnitResponse {
  data: Unit;
  message?: string;
}

export interface BaseUnitsResponse {
  data: Unit[];
  message?: string;
}

export interface ProductsResponse {
  data: Product[];
  meta?: PaginationData;
  pagination?: PaginationData;
  message?: string;
}

export interface ProductResponse {
  data: Product;
  message?: string;
}

export interface StockMovementsResponse {
  data: StockMovement[];
  pagination: PaginationData;
  message?: string;
}

export interface StockMovementResponse {
  data: StockMovement;
  message?: string;
}

export interface LowStockResponse {
  data: Product[];
  message?: string;
}

export interface InventoryDashboardResponse {
  data: {
    total_products: number;
    total_categories: number;
    low_stock_products: number;
    out_of_stock_products: number;
    total_inventory_value: number;
    recent_movements: StockMovement[];
    top_selling_products: Array<{
      product: Product;
      total_sold: number;
      revenue: number;
    }>;
    low_stock_alerts: Product[];
  };
  message?: string;
}

export interface StockLevelsResponse {
  data: Array<{
    product: Product;
    current_stock: number;
    min_stock_level: number;
    max_stock_level?: number;
    stock_status: "ok" | "low" | "out" | "overstocked";
  }>;
  pagination: PaginationData;
  message?: string;
}

export interface InventoryValuationResponse {
  data: {
    total_cost_value: number;
    total_selling_value: number;
    total_profit_margin: number;
    categories: Array<{
      category: Category;
      cost_value: number;
      selling_value: number;
      product_count: number;
    }>;
  };
  message?: string;
}

// Conversion Types
export interface UnitConversion {
  from_unit_id: number;
  to_unit_id: number;
  quantity: number;
}

export interface UnitConversionResponse {
  data: {
    original_quantity: number;
    converted_quantity: number;
    from_unit: Unit;
    to_unit: Unit;
    conversion_factor: number;
  };
  message?: string;
}

// Filter and Search Types
export interface ProductFilters {
  category_id?: number;
  status?: "active" | "inactive";
  low_stock?: boolean;
  out_of_stock?: boolean;
  search?: string;
  sort_by?: "name" | "sku" | "price" | "stock" | "created_at";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface CategoryFilters {
  parent_id?: number;
  status?: "active" | "inactive";
  search?: string;
  per_page?: number;
  page?: number;
}

export interface StockMovementFilters {
  product_id?: number;
  movement_type?: string;
  date_from?: string;
  date_to?: string;
  user_id?: number;
  per_page?: number;
  page?: number;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  validation_errors?: ValidationError[];
}
