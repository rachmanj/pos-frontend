import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ExtendedSession } from "@/types/auth";
import {
  inventoryApiService,
  categoryApi,
  unitApi,
  productApi,
  stockMovementApi,
  inventoryApi,
} from "@/lib/api/inventory";
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
  ProductFilters,
  CategoryFilters,
  StockMovementFilters,
  UnitConversion,
} from "@/types/inventory";

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
          console.log("🔐 Token stored in localStorage");
        }
      }
    }
  }, [session]);

  return session;
};

// Query Keys
export const INVENTORY_QUERY_KEYS = {
  categories: {
    all: (filters?: CategoryFilters) => ["categories", filters],
    tree: () => ["categories", "tree"],
    detail: (id: number) => ["categories", "detail", id],
    children: (id: number) => ["categories", "children", id],
  },
  units: {
    all: (page?: number, perPage?: number) => ["units", { page, perPage }],
    base: () => ["units", "base"],
    detail: (id: number) => ["units", "detail", id],
  },
  products: {
    all: (filters?: ProductFilters) => ["products", filters],
    lowStock: () => ["products", "low-stock"],
    search: (query: string) => ["products", "search", query],
    barcode: (barcode: string) => ["products", "barcode", barcode],
    detail: (id: number) => ["products", "detail", id],
    stockHistory: (id: number) => ["products", "stock-history", id],
  },
  stockMovements: {
    all: (filters?: StockMovementFilters) => ["stock-movements", filters],
    statistics: () => ["stock-movements", "statistics"],
    detail: (id: number) => ["stock-movements", "detail", id],
    byProduct: (productId: number) => [
      "stock-movements",
      "by-product",
      productId,
    ],
  },
  inventory: {
    dashboard: () => ["inventory", "dashboard"],
    stockLevels: (filters?: ProductFilters) => [
      "inventory",
      "stock-levels",
      filters,
    ],
    stockAlerts: () => ["inventory", "stock-alerts"],
    valuation: () => ["inventory", "valuation"],
  },
};

// Category Hooks
export const useCategories = (filters?: CategoryFilters) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.categories.all(filters),
    queryFn: () => categoryApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategoryTree = () => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.categories.tree(),
    queryFn: () => categoryApi.getTree(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCategory = (id: number) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.categories.detail(id),
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoryApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(data.message || "Category created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryData }) =>
      categoryApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.categories.detail(variables.id),
      });
      toast.success(data.message || "Category updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update category");
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(data.message || "Category deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });
};

// Unit Hooks
export const useUnits = (page?: number, perPage?: number) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.units.all(page, perPage),
    queryFn: () => unitApi.getAll(page, perPage),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useBaseUnits = () => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.units.base(),
    queryFn: () => unitApi.getBaseUnits(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useUnit = (id: number) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.units.detail(id),
    queryFn: () => unitApi.getById(id),
    enabled: !!id,
  });
};

export const useUnitConversion = () => {
  return useMutation({
    mutationFn: (conversion: UnitConversion) => unitApi.convert(conversion),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to convert units");
    },
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUnitData) => unitApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success(data.message || "Unit created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create unit");
    },
  });
};

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUnitData }) =>
      unitApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.units.detail(variables.id),
      });
      toast.success(data.message || "Unit updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update unit");
    },
  });
};

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => unitApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success(data.message || "Unit deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete unit");
    },
  });
};

// Product Hooks
export const useProducts = (filters?: ProductFilters) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.products.all(filters),
    queryFn: () => productApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useLowStockProducts = () => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.products.lowStock(),
    queryFn: () => productApi.getLowStock(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useSearchProducts = (query: string) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.products.search(query),
    queryFn: () => productApi.search(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useProductByBarcode = (barcode: string) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.products.barcode(barcode),
    queryFn: () => productApi.getByBarcode(barcode),
    enabled: !!barcode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (id: number) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.products.detail(id),
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
};

export const useProductStockHistory = (id: number) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.products.stockHistory(id),
    queryFn: () => productApi.getStockHistory(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => productApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(data.message || "Product created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductData }) =>
      productApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.products.detail(variables.id),
      });
      toast.success(data.message || "Product updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(data.message || "Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });
};

export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Array<{ id: number; [key: string]: any }>) =>
      productApi.bulkUpdate(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(data.message || "Products updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update products");
    },
  });
};

// Stock Movement Hooks
export const useStockMovements = (filters?: StockMovementFilters) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.stockMovements.all(filters),
    queryFn: () => stockMovementApi.getAll(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useStockMovementStatistics = () => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.stockMovements.statistics(),
    queryFn: () => stockMovementApi.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStockMovement = (id: number) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.stockMovements.detail(id),
    queryFn: () => stockMovementApi.getById(id),
    enabled: !!id,
  });
};

export const useStockMovementsByProduct = (productId: number) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.stockMovements.byProduct(productId),
    queryFn: () => stockMovementApi.getByProduct(productId),
    enabled: !!productId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockMovementData) =>
      stockMovementApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(data.message || "Stock movement recorded successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to record stock movement"
      );
    },
  });
};

export const useStockAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockAdjustmentData) =>
      stockMovementApi.adjustment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(data.message || "Stock adjustment completed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to adjust stock");
    },
  });
};

export const useBulkStockAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkStockAdjustmentData) =>
      stockMovementApi.bulkAdjustment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(
        data.message || "Bulk stock adjustment completed successfully"
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to perform bulk stock adjustment"
      );
    },
  });
};

// Inventory Dashboard and Reports Hooks
export const useInventoryDashboard = () => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.inventory.dashboard(),
    queryFn: () => inventoryApi.getDashboard(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useStockLevels = (filters?: ProductFilters) => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.inventory.stockLevels(filters),
    queryFn: () => inventoryApi.getStockLevels(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useStockAlerts = () => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.inventory.stockAlerts(),
    queryFn: () => inventoryApi.getStockAlerts(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useInventoryValuation = () => {
  useAuthToken(); // Ensure token is stored

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.inventory.valuation(),
    queryFn: () => inventoryApi.getValuation(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
