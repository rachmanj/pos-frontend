"use client"

import { useState } from "react"
import { useCustomerPaymentReceive } from "@/hooks/useCustomerPaymentReceive"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Calendar,
    RefreshCw
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export function ARDashboard() {
    const [dateFilters, setDateFilters] = useState({
        date_from: '',
        date_to: ''
    })

    const { useARDashboard } = useCustomerPaymentReceive()
    const { data: dashboardData, isLoading, refetch } = useARDashboard(dateFilters)

    const handleDateFilterChange = (key: string, value: string) => {
        setDateFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const getStatusBadge = (status: string, workflowStatus: string) => {
        if (status === 'cancelled') {
            return <Badge variant="destructive">Cancelled</Badge>
        }

        switch (workflowStatus) {
            case 'pending_verification':
                return <Badge variant="secondary">Pending Verification</Badge>
            case 'verified':
                return <Badge variant="outline">Verified</Badge>
            case 'pending_approval':
                return <Badge variant="secondary">Pending Approval</Badge>
            case 'approved':
                return <Badge variant="default">Approved</Badge>
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>
            case 'completed':
                return <Badge variant="default" className="bg-green-600">Completed</Badge>
            default:
                return <Badge variant="outline">{workflowStatus}</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        )
    }

    return (
        <div className="space-y-6">
            {/* Date Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Dashboard Filters
                    </CardTitle>
                    <CardDescription>
                        Filter dashboard data by date range
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="text-sm font-medium">From Date</label>
                            <Input
                                type="date"
                                value={dateFilters.date_from}
                                onChange={(e) => handleDateFilterChange('date_from', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">To Date</label>
                            <Input
                                type="date"
                                value={dateFilters.date_to}
                                onChange={(e) => handleDateFilterChange('date_to', e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => refetch()}
                            className="flex items-center gap-2 mt-6"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dashboardData?.summary.total_payments || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(dashboardData?.summary.total_amount || 0)} total value
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Allocated Amount</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(dashboardData?.summary.allocated_amount || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData?.summary.total_amount > 0
                                ? ((dashboardData.summary.allocated_amount / dashboardData.summary.total_amount) * 100).toFixed(1)
                                : 0
                            }% of total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unallocated Amount</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {formatCurrency(dashboardData?.summary.unallocated_amount || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Needs allocation
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {(dashboardData?.summary.pending_verification || 0) + (dashboardData?.summary.pending_approval || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData?.summary.pending_verification || 0} verification, {dashboardData?.summary.pending_approval || 0} approval
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Aging Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Accounts Receivable Aging Summary
                    </CardTitle>
                    <CardDescription>
                        Outstanding balance distribution by aging buckets
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold">
                                {formatCurrency(dashboardData?.aging_summary.total_outstanding || 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">Total Outstanding</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(dashboardData?.aging_summary.current || 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">Current (0-30)</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">
                                {formatCurrency(dashboardData?.aging_summary.days_30 || 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">31-60 days</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">
                                {formatCurrency(dashboardData?.aging_summary.days_60 || 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">61-90 days</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(dashboardData?.aging_summary.days_90 || 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">91-120 days</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-700">
                                {formatCurrency(dashboardData?.aging_summary.days_120_plus || 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">120+ days</p>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Overdue Percentage</p>
                                <p className="text-sm text-muted-foreground">
                                    Percentage of total outstanding that is overdue
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-red-600">
                                    {dashboardData?.aging_summary.overdue_percentage?.toFixed(1) || 0}%
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {dashboardData?.aging_summary.high_risk_customers || 0} high-risk customers
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Recent Payment Receives
                    </CardTitle>
                    <CardDescription>
                        Latest payment receives requiring attention
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payment #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Allocation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dashboardData?.recent_payments?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        No recent payments found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                dashboardData?.recent_payments?.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">
                                            {payment.payment_number}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{payment.customer?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {payment.customer?.customer_code}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(payment.payment_date)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{formatCurrency(payment.total_amount)}</p>
                                                {payment.unallocated_amount > 0 && (
                                                    <p className="text-sm text-orange-600">
                                                        {formatCurrency(payment.unallocated_amount)} unallocated
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(payment.status, payment.workflow_status)}
                                        </TableCell>
                                        <TableCell>
                                            {payment.total_amount > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full"
                                                            style={{
                                                                width: `${(payment.allocated_amount / payment.total_amount) * 100}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm">
                                                        {((payment.allocated_amount / payment.total_amount) * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">N/A</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Payment Method Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Payment Method Analysis
                    </CardTitle>
                    <CardDescription>
                        Payment method usage and distribution
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {dashboardData?.payment_methods?.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No payment method data available
                            </p>
                        ) : (
                            dashboardData?.payment_methods?.map((method) => (
                                <div key={method.payment_method_id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{method.paymentMethod.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {method.count} transactions
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(method.total)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {((method.total / (dashboardData?.summary.total_amount || 1)) * 100).toFixed(1)}% of total
                                        </p>
                                    </div>
                                    <div className="w-32 bg-gray-200 rounded-full h-2 ml-4">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{
                                                width: `${(method.total / (dashboardData?.summary.total_amount || 1)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 