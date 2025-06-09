"use client";

import { useState } from "react";
import { CalendarIcon, TrendingUp, DollarSign, Clock, Users, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePurchasePayments } from "@/hooks/usePurchasePayments";
import { formatCurrency, cn } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

export function PurchasePaymentDashboard() {
    const [dateRange, setDateRange] = useState({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const [period, setPeriod] = useState("month");

    const { usePaymentDashboard, usePaymentStats } = usePurchasePayments();

    const { data: dashboard, isLoading: dashboardLoading } = usePaymentDashboard({
        date_from: format(dateRange.from, "yyyy-MM-dd"),
        date_to: format(dateRange.to, "yyyy-MM-dd"),
    });

    const { data: stats, isLoading: statsLoading } = usePaymentStats({
        date_from: format(dateRange.from, "yyyy-MM-dd"),
        date_to: format(dateRange.to, "yyyy-MM-dd"),
    });

    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod);
        const now = new Date();

        switch (newPeriod) {
            case "today":
                setDateRange({ from: now, to: now });
                break;
            case "week":
                setDateRange({ from: subDays(now, 7), to: now });
                break;
            case "month":
                setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
                break;
            case "quarter":
                const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
                setDateRange({ from: quarterStart, to: quarterEnd });
                break;
            case "year":
                setDateRange({
                    from: new Date(now.getFullYear(), 0, 1),
                    to: new Date(now.getFullYear(), 11, 31)
                });
                break;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "draft":
                return <Badge variant="outline">Draft</Badge>;
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "approved":
                return <Badge variant="default" className="bg-green-600">Approved</Badge>;
            case "paid":
                return <Badge variant="default" className="bg-blue-600">Paid</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (dashboardLoading || statsLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Period Selection */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Payment Dashboard</h2>
                    <p className="text-muted-foreground">
                        Overview of purchase payments and supplier obligations
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Key Metrics */}
            {dashboard && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboard.summary.total_payments.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(dashboard.summary.total_amount)} total value
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Allocated Amount</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(dashboard.summary.allocated_amount)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {((dashboard.summary.allocated_amount / dashboard.summary.total_amount) * 100).toFixed(1)}% of total
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {dashboard.summary.pending_approval.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting approval
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {dashboard.summary.approved_today.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Processed today
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Payments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Payments</CardTitle>
                        <CardDescription>Latest purchase payments processed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dashboard?.recent_payments?.slice(0, 5).map((payment: any) => (
                                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{payment.payment_number}</span>
                                            {getStatusBadge(payment.status)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {payment.supplier?.name} • {formatDate(payment.payment_date)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatCurrency(payment.total_amount)}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {payment.paymentMethod?.name}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!dashboard?.recent_payments || dashboard.recent_payments.length === 0) && (
                                <div className="text-center text-muted-foreground py-4">
                                    No recent payments found
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Aging Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Outstanding Aging
                        </CardTitle>
                        <CardDescription>Supplier payment obligations by age</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dashboard?.aging_summary && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {formatCurrency(dashboard.aging_summary.total_outstanding)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Total Outstanding</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {dashboard.aging_summary.overdue_percentage.toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-muted-foreground">Overdue</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Current (0-30 days)</span>
                                        <span className="font-medium text-green-600">
                                            {formatCurrency(dashboard.aging_summary.current)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">31-60 days</span>
                                        <span className="font-medium text-yellow-600">
                                            {formatCurrency(dashboard.aging_summary.days_30)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">61-90 days</span>
                                        <span className="font-medium text-orange-600">
                                            {formatCurrency(dashboard.aging_summary.days_60)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">90+ days</span>
                                        <span className="font-medium text-red-600">
                                            {formatCurrency(dashboard.aging_summary.days_90)}
                                        </span>
                                    </div>
                                </div>

                                {dashboard.aging_summary.high_risk_suppliers > 0 && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-red-800">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span className="font-medium">
                                                {dashboard.aging_summary.high_risk_suppliers} high-risk suppliers
                                            </span>
                                        </div>
                                        <div className="text-sm text-red-600 mt-1">
                                            Require immediate attention
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Payment Methods Breakdown */}
            {stats?.payment_methods && stats.payment_methods.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Breakdown by payment method for selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.payment_methods.map((method: any) => (
                                <div key={method.payment_method_id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{method.paymentMethod.name}</span>
                                        <Badge variant="outline">{method.count} payments</Badge>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(method.total)}
                                    </div>
                                    <div className="text-sm text-muted-foreground capitalize">
                                        {method.paymentMethod.type.replace('_', ' ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Trends */}
            {dashboard?.payment_trends && dashboard.payment_trends.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Trends</CardTitle>
                        <CardDescription>Daily payment activity for selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {dashboard.payment_trends.slice(-7).map((trend: any) => (
                                <div key={trend.date} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium">
                                            {formatDate(trend.date)}
                                        </span>
                                        <Badge variant="outline">{trend.count} payments</Badge>
                                    </div>
                                    <span className="font-medium">{formatCurrency(trend.amount)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 