"use client";

import { useState } from "react";
import { Plus, Search, Filter, Download, CreditCard, TrendingUp, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePurchasePayments, PurchasePaymentFilters } from "@/hooks/usePurchasePayments";
import { formatCurrency } from "@/lib/utils";
import { PurchasePaymentList } from "@/components/purchase-payments/PurchasePaymentList";
import { PurchasePaymentFilters as PaymentFilters } from "@/components/purchase-payments/PurchasePaymentFilters";
import { PurchasePaymentForm } from "@/components/purchase-payments/PurchasePaymentForm";
import { PurchasePaymentDetails } from "@/components/purchase-payments/PurchasePaymentDetails";
import { PurchasePaymentDashboard } from "@/components/purchase-payments/PurchasePaymentDashboard";
import { SupplierOutstandingList } from "@/components/purchase-payments/SupplierOutstandingList";

export default function PurchasePaymentsPage() {
    const [filters, setFilters] = useState<PurchasePaymentFilters>({
        per_page: 20,
        sort_field: "created_at",
        sort_direction: "desc",
    });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const [viewingPaymentId, setViewingPaymentId] = useState<number | null>(null);

    const { usePaymentStats } = usePurchasePayments();
    const { data: payments, isLoading: paymentsLoading } = usePurchasePayments().useGetPurchasePayments(filters);
    const { data: stats, isLoading: statsLoading } = usePaymentStats();

    const handleFilterChange = (newFilters: Partial<PurchasePaymentFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleSearch = (search: string) => {
        setFilters(prev => ({ ...prev, search }));
    };

    const handleCreateSuccess = () => {
        setShowCreateForm(false);
        // Refresh the payment list
    };

    const handleEditSuccess = () => {
        setEditingPayment(null);
        // Refresh the payment list
    };

    const handleViewPayment = (paymentId: number) => {
        setViewingPaymentId(paymentId);
    };

    const handleEditPayment = (payment: any) => {
        setEditingPayment(payment);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Payments</h1>
                    <p className="text-muted-foreground">
                        Manage supplier payments and accounts payable
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Payment
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            {!statsLoading && stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(stats.total_payments || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.payments_this_month || 0} this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_amount || 0)}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(stats.amount_this_month || 0)} this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(stats.pending_approval || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(stats.pending_approval_amount || 0)} value
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Outstanding POs</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(stats.outstanding_pos || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(stats.outstanding_amount || 0)} total
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            <Tabs defaultValue="payments" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="payments">Payment List</TabsTrigger>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="outstanding">Outstanding POs</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="payments" className="space-y-4">
                    {/* Search and Quick Filters */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search payments..."
                                className="pl-10"
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <Select
                            value={filters.status || "all"}
                            onValueChange={(value) => handleFilterChange({ status: value === "all" ? undefined : value })}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.supplier_id?.toString() || "all"}
                            onValueChange={(value) => handleFilterChange({ supplier_id: value === "all" ? undefined : Number(value) })}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Suppliers</SelectItem>
                                {/* Supplier options will be loaded from API */}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <Card>
                            <CardContent className="pt-6">
                                <PaymentFilters
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment List */}
                    <PurchasePaymentList
                        filters={filters}
                        onViewPayment={handleViewPayment}
                        onEditPayment={handleEditPayment}
                    />
                </TabsContent>

                <TabsContent value="dashboard" className="space-y-4">
                    <PurchasePaymentDashboard />
                </TabsContent>

                <TabsContent value="outstanding" className="space-y-4">
                    <SupplierOutstandingList />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Analytics</CardTitle>
                            <CardDescription>
                                Comprehensive analysis of payment trends and supplier performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Reports</CardTitle>
                            <CardDescription>
                                Generate and export payment reports for accounting and analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Reports section coming soon...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Payment Dialog */}
            {showCreateForm && (
                <PurchasePaymentForm
                    open={showCreateForm}
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {/* Edit Payment Dialog */}
            {editingPayment && (
                <PurchasePaymentForm
                    open={!!editingPayment}
                    onClose={() => setEditingPayment(null)}
                    onSuccess={handleEditSuccess}
                    payment={editingPayment}
                />
            )}

            {/* View Payment Details Dialog */}
            {viewingPaymentId && (
                <PurchasePaymentDetails
                    paymentId={viewingPaymentId}
                    isOpen={!!viewingPaymentId}
                    onClose={() => setViewingPaymentId(null)}
                />
            )}
        </div>
    );
} 