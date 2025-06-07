'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange, DateRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Users,
    ShoppingCart,
    Download,
    Calendar,
    Filter,
    RefreshCw,
    Eye,
    FileText,
    PieChart,
    Activity
} from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { formatCurrency } from '@/lib/utils';
import { addDays, subDays } from 'date-fns';

// Dashboard Overview Component
const DashboardOverview = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const overview = data?.overview || {};

    const metrics = [
        {
            title: 'Total Sales',
            value: formatCurrency(overview.total_sales || 0),
            icon: DollarSign,
            trend: '+12.5%',
            trendUp: true,
            description: 'vs last period'
        },
        {
            title: 'Transactions',
            value: (overview.total_transactions || 0).toLocaleString(),
            icon: ShoppingCart,
            trend: '+8.2%',
            trendUp: true,
            description: 'total transactions'
        },
        {
            title: 'Customers',
            value: (overview.total_customers || 0).toLocaleString(),
            icon: Users,
            trend: '+15.3%',
            trendUp: true,
            description: 'unique customers'
        },
        {
            title: 'Avg Transaction',
            value: formatCurrency(overview.average_transaction || 0),
            icon: TrendingUp,
            trend: '+4.1%',
            trendUp: true,
            description: 'per transaction'
        },
        {
            title: 'Inventory Value',
            value: formatCurrency(overview.inventory_value || 0),
            icon: Package,
            trend: '-2.1%',
            trendUp: false,
            description: 'total inventory'
        },
        {
            title: 'Purchase Orders',
            value: formatCurrency(overview.total_purchases || 0),
            icon: FileText,
            trend: '+6.8%',
            trendUp: true,
            description: 'total purchases'
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                        <metric.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span className={`flex items-center ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {metric.trend}
                            </span>
                            <span>{metric.description}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

// Sales Trends Chart Component
const SalesTrendsChart = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sales Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
                </CardContent>
            </Card>
        );
    }

    const trends = data?.sales_trends || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Sales Trends
                </CardTitle>
                <CardDescription>Daily sales performance over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {trends.slice(0, 7).map((trend: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium">{trend.date}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold">{formatCurrency(trend.total_sales)}</div>
                                <div className="text-xs text-muted-foreground">{trend.transactions} transactions</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// Top Products Component
const TopProducts = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const products = data?.top_products || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Top Products
                </CardTitle>
                <CardDescription>Best performing products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {products.slice(0, 5).map((product: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                                    {index + 1}
                                </Badge>
                                <div>
                                    <div className="text-sm font-medium">{product.name}</div>
                                    <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold">{formatCurrency(product.total_revenue)}</div>
                                <div className="text-xs text-muted-foreground">{product.total_quantity} sold</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// Top Customers Component
const TopCustomers = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Top Customers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const customers = data?.top_customers || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Top Customers
                </CardTitle>
                <CardDescription>Highest spending customers</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {customers.slice(0, 5).map((customer: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                                    {index + 1}
                                </Badge>
                                <div>
                                    <div className="text-sm font-medium">{customer.name}</div>
                                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold">{formatCurrency(customer.total_spent)}</div>
                                <div className="text-xs text-muted-foreground">{customer.transaction_count} orders</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// Warehouse Performance Component
const WarehousePerformance = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Warehouse Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const warehouses = data?.warehouse_performance || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Warehouse Performance
                </CardTitle>
                <CardDescription>Sales performance by warehouse location</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {warehouses.slice(0, 5).map((warehouse: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                                    {index + 1}
                                </Badge>
                                <div>
                                    <div className="text-sm font-medium">{warehouse.name}</div>
                                    <div className="text-xs text-muted-foreground">{warehouse.location}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold">{formatCurrency(warehouse.total_sales)}</div>
                                <div className="text-xs text-muted-foreground">{warehouse.transaction_count} transactions</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// Payment Methods Breakdown Component
const PaymentMethodsBreakdown = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const paymentMethods = data?.payment_methods || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Payment Methods
                </CardTitle>
                <CardDescription>Payment method usage breakdown</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {paymentMethods.map((method: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <div>
                                    <div className="text-sm font-medium">{method.name}</div>
                                    <div className="text-xs text-muted-foreground">{method.type}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold">{formatCurrency(method.total_amount)}</div>
                                <div className="text-xs text-muted-foreground">{method.transaction_count} transactions</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default function ReportsPage() {
    const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
    const [warehouseId, setWarehouseId] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    const { data: dashboardData, isLoading, refetch } = useReports.useDashboard({
        period,
        warehouse_id: warehouseId === 'all' ? undefined : warehouseId,
        start_date: dateRange?.from?.toISOString().split('T')[0],
        end_date: dateRange?.to?.toISOString().split('T')[0],
    });

    const handleRefresh = () => {
        refetch();
    };

    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Export functionality to be implemented');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground">
                        Comprehensive business intelligence and performance insights
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <DatePickerWithRange
                                date={dateRange}
                                onDateChange={setDateRange}
                                className="w-[300px]"
                            />
                        </div>

                        <Select value={period} onValueChange={(value) => setPeriod(value as 'today' | 'week' | 'month' | 'quarter' | 'year')}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="quarter">This Quarter</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={warehouseId} onValueChange={setWarehouseId}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="All Warehouses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Warehouses</SelectItem>
                                {/* TODO: Load warehouses dynamically */}
                                <SelectItem value="1">Main Warehouse</SelectItem>
                                <SelectItem value="2">Secondary Warehouse</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="purchasing">Purchasing</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Overview Metrics */}
                    <DashboardOverview data={dashboardData} isLoading={isLoading} />

                    {/* Charts and Analytics */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <SalesTrendsChart data={dashboardData} isLoading={isLoading} />
                        <WarehousePerformance data={dashboardData} isLoading={isLoading} />
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <TopProducts data={dashboardData} isLoading={isLoading} />
                        <TopCustomers data={dashboardData} isLoading={isLoading} />
                        <PaymentMethodsBreakdown data={dashboardData} isLoading={isLoading} />
                    </div>
                </TabsContent>

                <TabsContent value="sales" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Analytics</CardTitle>
                            <CardDescription>Detailed sales performance and trends</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                                <p>Sales analytics dashboard coming soon...</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Analytics</CardTitle>
                            <CardDescription>Stock levels, turnover, and inventory insights</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-4" />
                                <p>Inventory analytics dashboard coming soon...</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="purchasing" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchasing Analytics</CardTitle>
                            <CardDescription>Supplier performance and purchasing insights</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4" />
                                <p>Purchasing analytics dashboard coming soon...</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Reports</CardTitle>
                            <CardDescription>Profit & loss, cash flow, and financial insights</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <DollarSign className="h-12 w-12 mx-auto mb-4" />
                                <p>Financial reports dashboard coming soon...</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}