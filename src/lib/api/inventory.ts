import axios from "axios";
import { getSession } from "next-auth/react";
import { ExtendedSession } from "@/types/auth";
import {
  Category,
  Unit,
  Product,
  StockMovement,
  CreateCategoryData,
  UpdateCategoryData,
  CreateUnitData,
  UpdateUnitData,
  CreateProductData,
  UpdateProductData,
  CreateStockMovementData,
  StockAdjustmentData,
  BulkStockAdjustmentData,
  CategoriesResponse,
  CategoryTreeResponse,
  CategoryResponse,
  UnitsResponse,
  UnitResponse,
  BaseUnitsResponse,
  ProductsResponse,
  ProductResponse,
  StockMovementsResponse,
  StockMovementResponse,
  LowStockResponse,
  InventoryDashboardResponse,
  StockLevelsResponse,
  InventoryValuationResponse,
  UnitConversionResponse,
  ProductFilters,
  CategoryFilters,
  StockMovementFilters,
  UnitConversion,
} from "@/types/inventory";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/api$/, "");

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  // Only access localStorage on client side
  if (typeof window !== "undefined") {
    try {
      // First try to get token from localStorage
      let token = localStorage.getItem("access_token");

      // If no token in localStorage, try to get from NextAuth session
      if (!token) {
        const session = (await getSession()) as ExtendedSession | null;
        if (session?.accessToken) {
          token = session.accessToken;
          // Store it in localStorage for future requests
          localStorage.setItem("access_token", token);
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Failed to get auth token:", error);
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Clear invalid token
        localStorage.removeItem("access_token");

        // Try to refresh from session
        try {
          const session = (await getSession()) as ExtendedSession | null;
          if (session?.accessToken) {
            localStorage.setItem("access_token", session.accessToken);
            // Retry the original request
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
            return api.request(originalRequest);
          }
        } catch (refreshError) {
          console.warn("Failed to refresh token:", refreshError);
        }

        // If all else fails, redirect to login
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// Category API functions
export const categoryApi = {
  // Get all categories with pagination and filters
  getAll: (filters?: CategoryFilters): Promise<CategoriesResponse> =>
    api.get("/categories", { params: filters }).then((res) => res.data),

  // Get category tree (hierarchical structure)
  getTree: (): Promise<CategoryTreeResponse> =>
    api.get("/categories/tree").then((res) => res.data),

  // Get single category by ID
  getById: (id: number): Promise<CategoryResponse> =>
    api.get(`/categories/${id}`).then((res) => res.data),

  // Get children of a category
  getChildren: (id: number): Promise<CategoriesResponse> =>
    api.get(`/categories/${id}/children`).then((res) => res.data),

  // Create new category
  create: (data: CreateCategoryData): Promise<CategoryResponse> =>
    api.post("/categories", data).then((res) => res.data),

  // Update category
  update: (id: number, data: UpdateCategoryData): Promise<CategoryResponse> =>
    api.put(`/categories/${id}`, data).then((res) => res.data),

  // Delete category
  delete: (id: number): Promise<{ message: string }> =>
    api.delete(`/categories/${id}`).then((res) => res.data),
};

// Unit API functions
export const unitApi = {
  // Get all units with pagination
  getAll: (page?: number, perPage?: number): Promise<UnitsResponse> =>
    api
      .get("/units", { params: { page, per_page: perPage } })
      .then((res) => res.data),

  // Get base units only
  getBaseUnits: (): Promise<BaseUnitsResponse> =>
    api.get("/units/base").then((res) => res.data),

  // Get single unit by ID
  getById: (id: number): Promise<UnitResponse> =>
    api.get(`/units/${id}`).then((res) => res.data),

  // Convert between units
  convert: (conversion: UnitConversion): Promise<UnitConversionResponse> =>
    api.post("/units/convert", conversion).then((res) => res.data),

  // Create new unit
  create: (data: CreateUnitData): Promise<UnitResponse> =>
    api.post("/units", data).then((res) => res.data),

  // Update unit
  update: (id: number, data: UpdateUnitData): Promise<UnitResponse> =>
    api.put(`/units/${id}`, data).then((res) => res.data),

  // Delete unit
  delete: (id: number): Promise<{ message: string }> =>
    api.delete(`/units/${id}`).then((res) => res.data),
};

// Product API functions
export const productApi = {
  // Get all products with filters and pagination
  getAll: (filters?: ProductFilters): Promise<ProductsResponse> =>
    api.get("/products", { params: filters }).then((res) => res.data),

  // Get products with low stock
  getLowStock: (): Promise<LowStockResponse> =>
    api.get("/products/low-stock").then((res) => res.data),

  // Search products by query
  search: (query: string): Promise<ProductsResponse> =>
    api
      .get(`/products/search/${encodeURIComponent(query)}`)
      .then((res) => res.data),

  // Find product by barcode
  getByBarcode: (barcode: string): Promise<ProductResponse> =>
    api
      .get(`/products/barcode/${encodeURIComponent(barcode)}`)
      .then((res) => res.data),

  // Get single product by ID
  getById: (id: number): Promise<ProductResponse> =>
    api.get(`/products/${id}`).then((res) => res.data),

  // Get product stock history
  getStockHistory: (id: number): Promise<StockMovementsResponse> =>
    api.get(`/products/${id}/stock-history`).then((res) => res.data),

  // Create new product
  create: (data: CreateProductData): Promise<ProductResponse> =>
    api.post("/products", data).then((res) => res.data),

  // Update product
  update: (id: number, data: UpdateProductData): Promise<ProductResponse> =>
    api.put(`/products/${id}`, data).then((res) => res.data),

  // Delete product
  delete: (id: number): Promise<{ message: string }> =>
    api.delete(`/products/${id}`).then((res) => res.data),

  // Bulk update products
  bulkUpdate: (
    data: Array<{ id: number; [key: string]: any }>
  ): Promise<{ message: string }> =>
    api
      .post("/products/bulk-update", { products: data })
      .then((res) => res.data),
};

// Stock Movement API functions
export const stockMovementApi = {
  // Get all stock movements with filters
  getAll: (filters?: StockMovementFilters): Promise<StockMovementsResponse> =>
    api.get("/stock-movements", { params: filters }).then((res) => res.data),

  // Get stock movement statistics
  getStatistics: (): Promise<{ data: any; message?: string }> =>
    api.get("/stock-movements/statistics").then((res) => res.data),

  // Get single stock movement by ID
  getById: (id: number): Promise<StockMovementResponse> =>
    api.get(`/stock-movements/${id}`).then((res) => res.data),

  // Get stock movements for a specific product
  getByProduct: (productId: number): Promise<StockMovementsResponse> =>
    api.get(`/stock-movements/product/${productId}`).then((res) => res.data),

  // Create new stock movement
  create: (data: CreateStockMovementData): Promise<StockMovementResponse> =>
    api.post("/stock-movements", data).then((res) => res.data),

  // Create stock adjustment
  adjustment: (data: StockAdjustmentData): Promise<StockMovementResponse> =>
    api.post("/stock-movements/adjustment", data).then((res) => res.data),

  // Bulk stock adjustment
  bulkAdjustment: (
    data: BulkStockAdjustmentData
  ): Promise<{ message: string }> =>
    api.post("/stock-movements/bulk-adjustment", data).then((res) => res.data),
};

// Inventory Dashboard and Reports API functions
export const inventoryApi = {
  // Get inventory dashboard data
  getDashboard: (): Promise<InventoryDashboardResponse> =>
    api.get("/inventory/dashboard").then((res) => res.data),

  // Get stock levels for all products
  getStockLevels: (filters?: ProductFilters): Promise<StockLevelsResponse> =>
    api
      .get("/inventory/stock-levels", { params: filters })
      .then((res) => res.data),

  // Get stock alerts (low stock products)
  getStockAlerts: (): Promise<LowStockResponse> =>
    api.get("/inventory/stock-alerts").then((res) => res.data),

  // Get inventory valuation
  getValuation: (): Promise<InventoryValuationResponse> =>
    api.get("/inventory/valuation").then((res) => res.data),
};

// Export all APIs
export const inventoryApiService = {
  categories: categoryApi,
  units: unitApi,
  products: productApi,
  stockMovements: stockMovementApi,
  inventory: inventoryApi,
};

export default inventoryApiService;
