"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Receipt, BarChart3, Users, Clock, TrendingUp, AlertTriangle } from "lucide-react"
import { useCustomerPaymentReceive } from "@/hooks/useCustomerPaymentReceive"
import { PaymentReceiveList } from "@/components/sales-payment-receive/PaymentReceiveList"
import { PaymentReceiveForm } from "@/components/sales-payment-receive/PaymentReceiveForm"
import { ARDashboard } from "@/components/sales-payment-receive/ARDashboard"
import { CustomerOutstandingList } from "@/components/sales-payment-receive/CustomerOutstandingList"
import { ARAgingReport } from "@/components/sales-payment-receive/ARAgingReport"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"

export default function SalesPaymentReceivePage() {
    const [activeTab, setActiveTab] = useState("payments")
    const [showCreateForm, setShowCreateForm] = useState(false)
    const { useARDashboard } = useCustomerPaymentReceive()

    // Get dashboard data for overview cards
    const { data: dashboardData, isLoading: isDashboardLoading } = useARDashboard()

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales Payment Receive</h1>
                    <p className="text-muted-foreground">
                        Manage customer payments, allocations, and accounts receivable
                    </p>
                </div>
                <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Payment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Payment Receive</DialogTitle>
                        </DialogHeader>
                        <PaymentReceiveForm
                            onSuccess={() => setShowCreateForm(false)}
                            onCancel={() => setShowCreateForm(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isDashboardLoading ? "..." : dashboardData?.summary.total_payments || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(dashboardData?.summary.total_amount || 0)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unallocated Amount</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(dashboardData?.summary.unallocated_amount || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Needs allocation
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isDashboardLoading ? "..." : dashboardData?.summary.pending_verification || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting verification
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                        <TrendingUp className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(dashboardData?.aging_summary.total_outstanding || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData?.aging_summary.overdue_percentage?.toFixed(1) || 0}% overdue
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="payments" className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Payments
                        {(dashboardData?.summary.pending_verification || 0) > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {dashboardData?.summary.pending_verification}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="dashboard" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="outstanding" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Outstanding
                        {(dashboardData?.aging_summary.high_risk_customers || 0) > 0 && (
                            <Badge variant="destructive" className="ml-1">
                                {dashboardData?.aging_summary.high_risk_customers}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="aging" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Aging Report
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="payments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Receives</CardTitle>
                            <CardDescription>
                                Manage customer payment receives, verification, and allocation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PaymentReceiveList />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dashboard" className="space-y-4">
                    <ARDashboard />
                </TabsContent>

                <TabsContent value="outstanding" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Outstanding Balances</CardTitle>
                            <CardDescription>
                                View and manage customer outstanding balances and credit status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CustomerOutstandingList />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="aging" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Accounts Receivable Aging Report</CardTitle>
                            <CardDescription>
                                Analyze customer payment patterns and overdue accounts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ARAgingReport />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Method Analysis</CardTitle>
                                <CardDescription>
                                    Payment method usage and trends
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {dashboardData?.payment_methods.map((method) => (
                                        <div key={method.payment_method_id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{method.paymentMethod.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {method.count} transactions
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{formatCurrency(method.total)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {((method.total / (dashboardData?.summary.total_amount || 1)) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Aging Distribution</CardTitle>
                                <CardDescription>
                                    Outstanding balance by aging buckets
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Current (0-30 days)</span>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(dashboardData?.aging_summary.current || 0)}</p>
                                            <p className="text-sm text-muted-foreground text-green-600">
                                                {((dashboardData?.aging_summary.current || 0) / (dashboardData?.aging_summary.total_outstanding || 1) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">31-60 days</span>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(dashboardData?.aging_summary.days_30 || 0)}</p>
                                            <p className="text-sm text-muted-foreground text-yellow-600">
                                                {((dashboardData?.aging_summary.days_30 || 0) / (dashboardData?.aging_summary.total_outstanding || 1) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">61-90 days</span>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(dashboardData?.aging_summary.days_60 || 0)}</p>
                                            <p className="text-sm text-muted-foreground text-orange-600">
                                                {((dashboardData?.aging_summary.days_60 || 0) / (dashboardData?.aging_summary.total_outstanding || 1) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">91-120 days</span>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(dashboardData?.aging_summary.days_90 || 0)}</p>
                                            <p className="text-sm text-muted-foreground text-red-600">
                                                {((dashboardData?.aging_summary.days_90 || 0) / (dashboardData?.aging_summary.total_outstanding || 1) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">120+ days</span>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(dashboardData?.aging_summary.days_120_plus || 0)}</p>
                                            <p className="text-sm text-muted-foreground text-red-700">
                                                {((dashboardData?.aging_summary.days_120_plus || 0) / (dashboardData?.aging_summary.total_outstanding || 1) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
} 