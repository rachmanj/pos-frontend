"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useDailySummary } from "@/hooks/useSales";
import { useWarehouses } from "@/hooks/use-warehouses";
import { format, subDays } from "date-fns";

export function SalesAnalytics() {
    const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const { data: warehouses } = useWarehouses();
    const { data: dailySummary, isLoading } = useDailySummary({
        date: selectedDate,
        warehouse_id: selectedWarehouse,
    });

    const handleWarehouseChange = (value: string) => {
        setSelectedWarehouse(value === "all" ? undefined : parseInt(value));
    };

    const handleDateChange = (value: string) => {
        setSelectedDate(value);
    };

    const setQuickDate = (days: number) => {
        const date = days === 0 ? new Date() : subDays(new Date(), days);
        setSelectedDate(format(date, "yyyy-MM-dd"));
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Analytics Filters</CardTitle>
                    <CardDescription>
                        Select warehouse and date to view sales analytics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Warehouse</Label>
                            <Select
                                value={selectedWarehouse?.toString() || "all"}
                                onValueChange={handleWarehouseChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Warehouses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Warehouses</SelectItem>
                                    {warehouses?.data?.map((warehouse: any) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                            {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Quick Select</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuickDate(0)}
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuickDate(1)}
                                >
                                    Yesterday
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuickDate(7)}
                                >
                                    7 Days Ago
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(dailySummary?.total_sales_amount || 0)}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-green-600">+12.5%</span>
                            <span className="text-muted-foreground ml-1">from yesterday</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                                <p className="text-2xl font-bold">
                                    {dailySummary?.total_sales_count || 0}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <ShoppingCart className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-green-600">+8.2%</span>
                            <span className="text-muted-foreground ml-1">from yesterday</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Average Sale</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(
                                        dailySummary?.total_sales_count && dailySummary.total_sales_count > 0
                                            ? (dailySummary?.total_sales_amount || 0) / dailySummary.total_sales_count
                                            : 0
                                    )}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                            <span className="text-red-600">-2.1%</span>
                            <span className="text-muted-foreground ml-1">from yesterday</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tax Collected</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(dailySummary?.total_tax_amount || 0)}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Package className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-green-600">+5.4%</span>
                            <span className="text-muted-foreground ml-1">from yesterday</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Methods Breakdown */}
            {dailySummary?.payment_breakdown && dailySummary.payment_breakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods Breakdown</CardTitle>
                        <CardDescription>
                            Distribution of payments by method for {format(new Date(selectedDate), "MMMM dd, yyyy")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dailySummary.payment_breakdown.map((payment, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{payment.payment_method}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {((payment.total_amount / (dailySummary.total_sales_amount || 1)) * 100).toFixed(1)}% of total sales
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{formatCurrency(payment.total_amount)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Sales Summary</CardTitle>
                    <CardDescription>
                        Detailed breakdown for {format(new Date(selectedDate), "MMMM dd, yyyy")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Gross Sales</p>
                            <p className="text-xl font-bold">
                                {formatCurrency(dailySummary?.total_sales_amount || 0)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Discounts</p>
                            <p className="text-xl font-bold text-red-600">
                                -{formatCurrency(dailySummary?.total_discount_amount || 0)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Net Sales</p>
                            <p className="text-xl font-bold text-green-600">
                                {formatCurrency(
                                    (dailySummary?.total_sales_amount || 0) - (dailySummary?.total_discount_amount || 0)
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* No Data State */}
            {!dailySummary && !isLoading && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Sales Data</h3>
                        <p className="text-muted-foreground">
                            No sales found for the selected date and warehouse.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 