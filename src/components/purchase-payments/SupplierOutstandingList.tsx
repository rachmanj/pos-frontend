"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Search,
    Filter,
    Download,
    Eye,
    CreditCard,
    Calendar,
    Building,
    FileText,
    AlertTriangle,
    Clock,
    DollarSign
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePurchasePayments } from "@/hooks/usePurchasePayments";
import { formatCurrency } from "@/lib/utils";

// Define filters interface for supplier outstanding
interface SupplierOutstandingFilters {
    search?: string;
    aging_bucket?: string;
    sort_field?: string;
    sort_direction?: "asc" | "desc";
    per_page?: number;
    page?: number;
}

interface SupplierOutstandingListProps {
    onCreatePayment?: (supplierId: number, purchaseOrderIds?: number[]) => void;
}

export function SupplierOutstandingList({ onCreatePayment }: SupplierOutstandingListProps) {
    const [filters, setFilters] = useState<SupplierOutstandingFilters>({
        per_page: 20,
        sort_field: "due_date",
        sort_direction: "asc",
    });
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [showSupplierDetails, setShowSupplierDetails] = useState(false);

    // For now, we'll use mock data since the backend endpoint might not be implemented yet
    const outstandingData = {
        summary: {
            total_outstanding: 0,
            total_orders: 0,
            overdue_amount: 0,
            overdue_orders: 0,
            due_this_week: 0,
            due_this_week_orders: 0,
            total_suppliers: 0,
        },
        data: []
    };
    const isLoading = false;

    const handleFilterChange = (newFilters: Partial<SupplierOutstandingFilters>) => {
        setFilters((prev: SupplierOutstandingFilters) => ({ ...prev, ...newFilters }));
    };

    const handleSearch = (search: string) => {
        setFilters((prev: SupplierOutstandingFilters) => ({ ...prev, search }));
    };

    const handleViewSupplier = (supplier: any) => {
        setSelectedSupplier(supplier);
        setShowSupplierDetails(true);
    };

    const getAgingColor = (daysOverdue: number) => {
        if (daysOverdue <= 0) return 'bg-green-100 text-green-800';
        if (daysOverdue <= 30) return 'bg-yellow-100 text-yellow-800';
        if (daysOverdue <= 60) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    const getAgingLabel = (daysOverdue: number) => {
        if (daysOverdue <= 0) return 'Current';
        if (daysOverdue <= 30) return '1-30 Days';
        if (daysOverdue <= 60) return '31-60 Days';
        return '60+ Days';
    };

    const calculateDaysOverdue = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = today.getTime() - due.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading outstanding orders...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            {outstandingData?.summary && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(outstandingData.summary.total_outstanding)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {outstandingData.summary.total_orders} orders
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(outstandingData.summary.overdue_amount)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {outstandingData.summary.overdue_orders} orders
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {formatCurrency(outstandingData.summary.due_this_week)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {outstandingData.summary.due_this_week_orders} orders
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {outstandingData.summary.total_suppliers}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                with outstanding orders
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search suppliers or PO numbers..."
                                className="pl-10"
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <Select
                            value={filters.aging_bucket || "all"}
                            onValueChange={(value) => handleFilterChange({ aging_bucket: value === "all" ? undefined : value })}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Aging" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Ages</SelectItem>
                                <SelectItem value="current">Current</SelectItem>
                                <SelectItem value="1-30">1-30 Days</SelectItem>
                                <SelectItem value="31-60">31-60 Days</SelectItem>
                                <SelectItem value="60+">60+ Days</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.sort_field || ""}
                            onValueChange={(value) => handleFilterChange({ sort_field: value || "due_date" })}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="due_date">Due Date</SelectItem>
                                <SelectItem value="amount">Amount</SelectItem>
                                <SelectItem value="supplier_name">Supplier</SelectItem>
                                <SelectItem value="po_number">PO Number</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Outstanding Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Outstanding Purchase Orders</CardTitle>
                    <CardDescription>
                        Purchase orders awaiting payment, grouped by supplier
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {outstandingData?.data && outstandingData.data.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>PO Number</TableHead>
                                    <TableHead>PO Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Outstanding</TableHead>
                                    <TableHead>Aging</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {outstandingData.data.map((item: any) => {
                                    const daysOverdue = calculateDaysOverdue(item.due_date);
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{item.supplier?.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.supplier?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.po_number}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {format(new Date(item.po_date), 'MMM dd, yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {format(new Date(item.due_date), 'MMM dd, yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(item.total_amount)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(item.outstanding_amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getAgingColor(daysOverdue)}>
                                                    {getAgingLabel(daysOverdue)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleViewSupplier(item.supplier)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {onCreatePayment && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => onCreatePayment(item.supplier_id, [item.id])}
                                                        >
                                                            <CreditCard className="h-4 w-4 mr-1" />
                                                            Pay
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No outstanding purchase orders found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Supplier Details Dialog */}
            <Dialog open={showSupplierDetails} onOpenChange={setShowSupplierDetails}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Supplier Details: {selectedSupplier?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedSupplier && (
                        <div className="space-y-6">
                            {/* Supplier Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Contact Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                                            <p>{selectedSupplier.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                            <p>{selectedSupplier.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Address</label>
                                            <p className="text-sm">{selectedSupplier.address || 'N/A'}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Terms</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Payment Terms</label>
                                            <p>{selectedSupplier.payment_terms || 'Net 30'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Credit Limit</label>
                                            <p>{selectedSupplier.credit_limit ? formatCurrency(selectedSupplier.credit_limit) : 'Unlimited'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                                            <Badge variant={selectedSupplier.status === 'active' ? 'default' : 'secondary'}>
                                                {selectedSupplier.status || 'Active'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Outstanding Summary for this Supplier */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Outstanding Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">
                                                {selectedSupplier.total_outstanding_orders || 0}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Outstanding Orders</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold">
                                                {formatCurrency(selectedSupplier.total_outstanding_amount || 0)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Total Outstanding</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-red-600">
                                                {formatCurrency(selectedSupplier.overdue_amount || 0)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Overdue Amount</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatCurrency(selectedSupplier.paid_this_month || 0)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Paid This Month</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowSupplierDetails(false)}>
                                    Close
                                </Button>
                                {onCreatePayment && (
                                    <Button onClick={() => {
                                        onCreatePayment(selectedSupplier.id);
                                        setShowSupplierDetails(false);
                                    }}>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Create Payment
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 