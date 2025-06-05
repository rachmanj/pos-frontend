"use client";

import { useInventoryDashboard, useStockAlerts } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Package,
    Tag,
    TrendingDown,
    TrendingUp,
    DollarSign,
    AlertTriangle,
    Eye,
    Edit,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function InventoryDashboard() {
    const { data: dashboardData, isLoading, error } = useInventoryDashboard();
    const { data: stockAlerts } = useStockAlerts();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                    <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load inventory dashboard. Please try again.
                </AlertDescription>
            </Alert>
        );
    }

    const dashboard = dashboardData?.data;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Total Products
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboard?.total_products || 0}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Tag className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Categories
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboard?.total_categories || 0}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingDown className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Low Stock Items
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboard?.low_stock_products || 0}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DollarSign className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Inventory Value
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(dashboard?.total_inventory_value || 0)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stock Alerts */}
            {stockAlerts?.data && stockAlerts.data.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-yellow-600">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            Stock Alerts ({stockAlerts.data.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stockAlerts.data.slice(0, 5).map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <Package className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Current: {product.stock?.current_stock || 0} | Min: {product.min_stock_level}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                            Low Stock
                                        </Badge>
                                        <Link href={`/inventory/products/${product.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {stockAlerts.data.length > 5 && (
                                <div className="text-center pt-2">
                                    <Link href="/inventory/products?low_stock=true">
                                        <Button variant="outline" size="sm">
                                            View All {stockAlerts.data.length} Alerts
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Stock Movements */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Recent Stock Movements
                            <Link href="/inventory/stock-movements">
                                <Button variant="outline" size="sm">
                                    View All
                                </Button>
                            </Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dashboard?.recent_movements && dashboard.recent_movements.length > 0 ? (
                            <div className="space-y-3">
                                {dashboard.recent_movements.slice(0, 5).map((movement) => (
                                    <div
                                        key={movement.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                {movement.movement_type === "in" ? (
                                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {movement.product.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {movement.movement_type === "in" ? "+" : "-"}{movement.quantity} {movement.product.unit.symbol}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant={movement.movement_type === "in" ? "default" : "secondary"}
                                            >
                                                {movement.movement_type}
                                            </Badge>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {new Date(movement.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                No recent stock movements
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/inventory/products/new">
                                <Button className="w-full justify-start" variant="outline">
                                    <Package className="mr-2 h-4 w-4" />
                                    Add Product
                                </Button>
                            </Link>
                            <Link href="/inventory/categories/new">
                                <Button className="w-full justify-start" variant="outline">
                                    <Tag className="mr-2 h-4 w-4" />
                                    Add Category
                                </Button>
                            </Link>
                            <Link href="/inventory/stock-in">
                                <Button className="w-full justify-start" variant="outline">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Stock In
                                </Button>
                            </Link>
                            <Link href="/inventory/adjustments">
                                <Button className="w-full justify-start" variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Adjust Stock
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 