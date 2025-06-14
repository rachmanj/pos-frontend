// ============================================================================
// SALES ORDER DASHBOARD COMPONENT
// ============================================================================
// Analytics and metrics dashboard for sales order management with key
// performance indicators, trends, and insights
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { formatCurrency } from '@/lib/utils';

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    change,
    changeLabel,
    icon,
    trend = 'neutral',
    loading = false
}) => {
    const getTrendColor = () => {
        switch (trend) {
            case 'up': return 'text-green-600';
            case 'down': return 'text-red-600';
            default: return 'text-muted-foreground';
        }
    };

    const getTrendIcon = () => {
        switch (trend) {
            case 'up': return <TrendingUp className="h-4 w-4" />;
            case 'down': return <TrendingDown className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {loading ? (
                        <RefreshCw className="h-6 w-6 animate-spin" />
                    ) : (
                        value
                    )}
                </div>
                {change !== undefined && changeLabel && (
                    <p className={`text-xs ${getTrendColor()} flex items-center gap-1 mt-1`}>
                        {getTrendIcon()}
                        {change > 0 ? '+' : ''}{change}% {changeLabel}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

// ============================================================================
// STATUS DISTRIBUTION COMPONENT
// ============================================================================

interface StatusDistributionProps {
    data: Record<string, number>;
    loading?: boolean;
}

const StatusDistribution: React.FC<StatusDistributionProps> = ({ data, loading = false }) => {
    const statusConfig = {
        draft: { label: "Draft", color: "bg-gray-500" },
        confirmed: { label: "Confirmed", color: "bg-blue-500" },
        approved: { label: "Approved", color: "bg-green-500" },
        in_progress: { label: "In Progress", color: "bg-yellow-500" },
        completed: { label: "Completed", color: "bg-emerald-500" },
        cancelled: { label: "Cancelled", color: "bg-red-500" },
    };

    const total = Object.values(data).reduce((sum, count) => sum + count, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Orders by Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {Object.entries(data).map(([status, count]) => {
                            const config = statusConfig[status as keyof typeof statusConfig];
                            const percentage = total > 0 ? (count / total) * 100 : 0;

                            return (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${config?.color || 'bg-gray-400'}`} />
                                        <span className="text-sm font-medium">{config?.label || status}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">{count}</span>
                                        <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// ============================================================================
// RECENT ORDERS COMPONENT
// ============================================================================

interface RecentOrdersProps {
    orders: any[];
    loading?: boolean;
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders, loading = false }) => {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { label: "Draft", variant: "secondary" as const },
            confirmed: { label: "Confirmed", variant: "default" as const },
            approved: { label: "Approved", variant: "default" as const },
            in_progress: { label: "In Progress", variant: "default" as const },
            completed: { label: "Completed", variant: "default" as const },
            cancelled: { label: "Cancelled", variant: "destructive" as const },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const };

        return (
            <Badge variant={config.variant}>
                {config.label}
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Orders
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No recent orders</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{order.sales_order_number}</span>
                                        {getStatusBadge(order.order_status)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {order.customer?.name} • {new Date(order.order_date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {order.items_count || 0} items
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SalesOrderDashboard: React.FC = () => {
    const [period, setPeriod] = useState("30");

    const { salesOrderStats, salesOrders, isLoading } = useSalesOrders();

    // Mock data for demonstration - replace with actual API data
    const mockStats = {
        total_orders: 156,
        total_amount: 2450000,
        pending_orders: 23,
        pending_amount: 345000,
        completed_orders: 98,
        completed_amount: 1890000,
        cancelled_orders: 12,
        cancelled_amount: 180000,
        average_order_value: 15705,
        orders_by_status: {
            draft: 8,
            confirmed: 15,
            approved: 12,
            in_progress: 18,
            completed: 98,
            cancelled: 5
        }
    };

    const stats = salesOrderStats.data || mockStats;
    const recentOrders = salesOrders.data?.data || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Sales Order Dashboard</h2>
                    <p className="text-muted-foreground">
                        Overview of sales order performance and key metrics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Orders"
                    value={stats.total_orders}
                    change={12.5}
                    changeLabel="from last month"
                    icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
                    trend="up"
                    loading={isLoading}
                />
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(stats.total_amount)}
                    change={8.2}
                    changeLabel="from last month"
                    icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                    trend="up"
                    loading={isLoading}
                />
                <MetricCard
                    title="Average Order Value"
                    value={formatCurrency(stats.average_order_value)}
                    change={-2.1}
                    changeLabel="from last month"
                    icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
                    trend="down"
                    loading={isLoading}
                />
                <MetricCard
                    title="Pending Orders"
                    value={stats.pending_orders}
                    change={5.3}
                    changeLabel="from last week"
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                    trend="up"
                    loading={isLoading}
                />
            </div>

            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatusDistribution
                    data={stats.orders_by_status}
                    loading={isLoading}
                />
                <RecentOrders
                    orders={recentOrders}
                    loading={isLoading}
                />
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Completed Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed_orders}</div>
                        <p className="text-sm text-muted-foreground">
                            {formatCurrency(stats.completed_amount)} total value
                        </p>
                        <div className="mt-2">
                            <div className="text-xs text-muted-foreground">Completion Rate</div>
                            <div className="text-lg font-semibold text-green-600">
                                {((stats.completed_orders / stats.total_orders) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            Pending Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending_orders}</div>
                        <p className="text-sm text-muted-foreground">
                            {formatCurrency(stats.pending_amount)} pending value
                        </p>
                        <div className="mt-2">
                            <div className="text-xs text-muted-foreground">Pending Rate</div>
                            <div className="text-lg font-semibold text-yellow-600">
                                {((stats.pending_orders / stats.total_orders) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            Cancelled Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.cancelled_orders}</div>
                        <p className="text-sm text-muted-foreground">
                            {formatCurrency(stats.cancelled_amount)} cancelled value
                        </p>
                        <div className="mt-2">
                            <div className="text-xs text-muted-foreground">Cancellation Rate</div>
                            <div className="text-lg font-semibold text-red-600">
                                {((stats.cancelled_orders / stats.total_orders) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SalesOrderDashboard;
