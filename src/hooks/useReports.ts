import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "@/lib/api";

// Types for reporting data
export interface DashboardFilters {
  period?: "today" | "week" | "month" | "quarter" | "year";
  warehouse_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface SalesAnalyticsFilters extends DashboardFilters {
  group_by?: "day" | "week" | "month" | "quarter";
}

export interface InventoryAnalyticsFilters {
  warehouse_id?: string;
  category_id?: string;
}

export interface PurchasingAnalyticsFilters {
  period?: "today" | "week" | "month" | "quarter" | "year";
  supplier_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface FinancialReportsFilters extends DashboardFilters {}

// Dashboard Overview Types
export interface OverviewMetrics {
  total_sales: number;
  total_transactions: number;
  total_customers: number;
  total_purchases: number;
  inventory_value: number;
  average_transaction: number;
}

export interface SalesTrend {
  date: string;
  transactions: number;
  total_sales: number;
  avg_transaction: number;
}

export interface TopProduct {
  id: number;
  name: string;
  sku: string;
  total_quantity: number;
  total_revenue: number;
  transaction_count: number;
}

export interface TopCustomer {
  id: number;
  name: string;
  email: string;
  transaction_count: number;
  total_spent: number;
  avg_transaction: number;
}

export interface WarehousePerformance {
  id: number;
  name: string;
  location: string;
  transaction_count: number;
  total_sales: number;
  avg_transaction: number;
}

export interface PaymentMethodBreakdown {
  name: string;
  type: string;
  transaction_count: number;
  total_amount: number;
}

export interface DashboardData {
  overview: OverviewMetrics;
  sales_trends: SalesTrend[];
  top_products: TopProduct[];
  top_customers: TopCustomer[];
  warehouse_performance: WarehousePerformance[];
  inventory_alerts: any[];
  payment_methods: PaymentMethodBreakdown[];
}

// Sales Analytics Types
export interface SalesSummary {
  total_sales: number;
  total_transactions: number;
  total_items_sold: number;
  average_transaction_value: number;
  total_tax_collected: number;
  total_discounts_given: number;
}

export interface SalesByPeriod {
  period: string;
  transactions: number;
  total_sales: number;
}

export interface SalesByCategory {
  category_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface SalesByWarehouse {
  warehouse_name: string;
  location: string;
  transaction_count: number;
  total_sales: number;
  avg_transaction: number;
}

export interface HourlySales {
  hour: number;
  transactions: number;
  total_sales: number;
}

export interface CashierPerformance {
  cashier_name: string;
  transaction_count: number;
  total_sales: number;
  avg_transaction: number;
}

export interface SalesAnalyticsData {
  sales_summary: SalesSummary;
  sales_by_period: SalesByPeriod[];
  sales_by_category: SalesByCategory[];
  sales_by_warehouse: SalesByWarehouse[];
  hourly_sales: HourlySales[];
  cashier_performance: CashierPerformance[];
}

// Inventory Analytics Types
export interface InventorySummary {
  total_products: number;
  total_stock_value: number;
  total_cost_value: number;
  total_quantity: number;
}

export interface StockLevel {
  id: number;
  name: string;
  sku: string;
  minimum_stock: number;
  category_name: string;
  current_stock: number;
}

export interface InventoryTurnover {
  id: number;
  name: string;
  sku: string;
  total_sold: number;
  avg_stock: number;
  turnover_ratio: number;
}

export interface StockMovementAnalytics {
  movement_type: string;
  movement_count: number;
  total_quantity: number;
  avg_quantity: number;
}

export interface LowStockAlert {
  id: number;
  name: string;
  sku: string;
  minimum_stock: number;
  category_name: string;
  current_stock: number;
  shortage: number;
}

export interface DeadStock {
  id: number;
  name: string;
  sku: string;
  category_name: string;
  current_stock: number;
  last_sale_date: string | null;
}

export interface InventoryAnalyticsData {
  inventory_summary: InventorySummary;
  stock_levels: StockLevel[];
  inventory_turnover: InventoryTurnover[];
  stock_movements: StockMovementAnalytics[];
  low_stock_alerts: LowStockAlert[];
  dead_stock: DeadStock[];
}

// Purchasing Analytics Types
export interface PurchaseSummary {
  total_orders: number;
  total_amount: number;
  average_order_value: number;
  pending_orders: number;
  completed_orders: number;
}

export interface SupplierPerformance {
  id: number;
  name: string;
  email: string;
  order_count: number;
  total_amount: number;
  avg_order_value: number;
}

export interface PurchaseTrend {
  date: string;
  order_count: number;
  total_amount: number;
}

export interface CostAnalysis {
  category_name: string;
  total_quantity: number;
  total_cost: number;
  avg_unit_price: number;
}

export interface PurchasingAnalyticsData {
  purchase_summary: PurchaseSummary;
  supplier_performance: SupplierPerformance[];
  purchase_trends: PurchaseTrend[];
  cost_analysis: CostAnalysis[];
}

// Financial Reports Types
export interface ProfitLossStatement {
  revenue: number;
  cost_of_goods_sold: number;
  gross_profit: number;
  gross_profit_margin: number;
  tax_collected: number;
  discounts_given: number;
  purchase_costs: number;
  net_profit: number;
}

export interface CashFlowAnalysis {
  cash_inflows: number;
  cash_outflows: number;
  net_cash_flow: number;
}

export interface TaxSummary {
  total_tax_collected: number;
  taxable_sales: number;
  tax_rate: number;
  transaction_count: number;
}

export interface PaymentReconciliation {
  name: string;
  type: string;
  transaction_count: number;
  total_amount: number;
}

export interface FinancialReportsData {
  profit_loss: ProfitLossStatement;
  cash_flow: CashFlowAnalysis;
  tax_summary: TaxSummary;
  payment_reconciliation: PaymentReconciliation[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  period?: {
    start_date: string;
    end_date: string;
    period: string;
  };
}

// Hook implementations
export const useReports = {
  // Dashboard Analytics Hook
  useDashboard: (
    filters: DashboardFilters = {},
    options?: UseQueryOptions<ApiResponse<DashboardData>>
  ) => {
    return useQuery({
      queryKey: ["reports", "dashboard", filters],
      queryFn: async () => {
        const params = new URLSearchParams();

        if (filters.period) params.append("period", filters.period);
        if (filters.warehouse_id)
          params.append("warehouse_id", filters.warehouse_id);
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);

        const response = await api.get(
          `/reports/dashboard?${params.toString()}`
        );
        return response.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      ...options,
    });
  },

  // Sales Analytics Hook
  useSalesAnalytics: (
    filters: SalesAnalyticsFilters = {},
    options?: UseQueryOptions<ApiResponse<SalesAnalyticsData>>
  ) => {
    return useQuery({
      queryKey: ["reports", "sales-analytics", filters],
      queryFn: async () => {
        const params = new URLSearchParams();

        if (filters.period) params.append("period", filters.period);
        if (filters.warehouse_id)
          params.append("warehouse_id", filters.warehouse_id);
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);
        if (filters.group_by) params.append("group_by", filters.group_by);

        const response = await api.get(
          `/reports/sales-analytics?${params.toString()}`
        );
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      ...options,
    });
  },

  // Inventory Analytics Hook
  useInventoryAnalytics: (
    filters: InventoryAnalyticsFilters = {},
    options?: UseQueryOptions<ApiResponse<InventoryAnalyticsData>>
  ) => {
    return useQuery({
      queryKey: ["reports", "inventory-analytics", filters],
      queryFn: async () => {
        const params = new URLSearchParams();

        if (filters.warehouse_id)
          params.append("warehouse_id", filters.warehouse_id);
        if (filters.category_id)
          params.append("category_id", filters.category_id);

        const response = await api.get(
          `/reports/inventory-analytics?${params.toString()}`
        );
        return response.data;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes (inventory changes less frequently)
      gcTime: 15 * 60 * 1000, // 15 minutes
      ...options,
    });
  },

  // Purchasing Analytics Hook
  usePurchasingAnalytics: (
    filters: PurchasingAnalyticsFilters = {},
    options?: UseQueryOptions<ApiResponse<PurchasingAnalyticsData>>
  ) => {
    return useQuery({
      queryKey: ["reports", "purchasing-analytics", filters],
      queryFn: async () => {
        const params = new URLSearchParams();

        if (filters.period) params.append("period", filters.period);
        if (filters.supplier_id)
          params.append("supplier_id", filters.supplier_id);
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);

        const response = await api.get(
          `/reports/purchasing-analytics?${params.toString()}`
        );
        return response.data;
      },
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      ...options,
    });
  },

  // Financial Reports Hook
  useFinancialReports: (
    filters: FinancialReportsFilters = {},
    options?: UseQueryOptions<ApiResponse<FinancialReportsData>>
  ) => {
    return useQuery({
      queryKey: ["reports", "financial-reports", filters],
      queryFn: async () => {
        const params = new URLSearchParams();

        if (filters.period) params.append("period", filters.period);
        if (filters.warehouse_id)
          params.append("warehouse_id", filters.warehouse_id);
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);

        const response = await api.get(
          `/reports/financial-reports?${params.toString()}`
        );
        return response.data;
      },
      staleTime: 15 * 60 * 1000, // 15 minutes (financial data is sensitive)
      gcTime: 20 * 60 * 1000, // 20 minutes
      ...options,
    });
  },
};

// Export individual hooks for convenience
export const useDashboard = useReports.useDashboard;
export const useSalesAnalytics = useReports.useSalesAnalytics;
export const useInventoryAnalytics = useReports.useInventoryAnalytics;
export const usePurchasingAnalytics = useReports.usePurchasingAnalytics;
export const useFinancialReports = useReports.useFinancialReports;
