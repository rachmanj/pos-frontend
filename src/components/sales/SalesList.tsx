"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Search, Filter, Eye, FileText, Ban } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Sale, SaleFilters } from "@/hooks/useSales";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useCustomers } from "@/hooks/useCustomers";
import { format } from "date-fns";

interface SalesListProps {
    salesData: {
        data: Sale[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    } | undefined;
    isLoading: boolean;
    error: any;
    filters: SaleFilters;
    onFiltersChange: (filters: Partial<SaleFilters>) => void;
}

export function SalesList({ salesData, isLoading, error, filters, onFiltersChange }: SalesListProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data: warehouses } = useWarehouses();
    const { data: customers } = useCustomers();

    const getStatusBadge = (status: string) => {
        const variants = {
            draft: "secondary",
            completed: "default",
            voided: "destructive",
        } as const;

        return (
            <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getPaymentStatusBadge = (paymentStatus: string) => {
        const variants = {
            pending: "secondary",
            partial: "outline",
            paid: "default",
        } as const;

        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            partial: "bg-blue-100 text-blue-800",
            paid: "bg-green-100 text-green-800",
        } as const;

        return (
            <Badge
                variant={variants[paymentStatus as keyof typeof variants] || "secondary"}
                className={colors[paymentStatus as keyof typeof colors]}
            >
                {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
            </Badge>
        );
    };

    const handleSearch = (value: string) => {
        onFiltersChange({ search: value });
    };

    const handleFilterChange = (key: keyof SaleFilters, value: any) => {
        onFiltersChange({ [key]: value === "all" ? undefined : value });
    };

    const clearFilters = () => {
        onFiltersChange({
            warehouse_id: undefined,
            customer_id: undefined,
            status: undefined,
            payment_status: undefined,
            date_from: undefined,
            date_to: undefined,
            search: undefined,
        });
    };

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-red-600">
                        Error loading sales: {error.message}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search by sale number or customer..."
                            value={filters.search || ""}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Advanced Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Warehouse</Label>
                                <Select
                                    value={filters.warehouse_id?.toString() || "all"}
                                    onValueChange={(value) => handleFilterChange("warehouse_id", value === "all" ? undefined : parseInt(value))}
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
                                <Label>Customer</Label>
                                <Select
                                    value={filters.customer_id?.toString() || "all"}
                                    onValueChange={(value) => handleFilterChange("customer_id", value === "all" ? undefined : parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Customers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Customers</SelectItem>
                                        {customers?.data?.map((customer: any) => (
                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={filters.status || "all"}
                                    onValueChange={(value) => handleFilterChange("status", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="voided">Voided</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Payment Status</Label>
                                <Select
                                    value={filters.payment_status || "all"}
                                    onValueChange={(value) => handleFilterChange("payment_status", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Payment Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Payment Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="partial">Partial</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Date From</Label>
                                <Input
                                    type="date"
                                    value={filters.date_from || ""}
                                    onChange={(e) => handleFilterChange("date_from", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Date To</Label>
                                <Input
                                    type="date"
                                    value={filters.date_to || ""}
                                    onChange={(e) => handleFilterChange("date_to", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Sales Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-muted-foreground">Loading sales...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sale Number</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                        <TableHead>Payment Status</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salesData?.data?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                No sales found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        salesData?.data?.map((sale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell className="font-medium">
                                                    {sale.sale_number}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(sale.sale_date), "MMM dd, yyyy")}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.customer?.name || "Walk-in Customer"}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.warehouse?.name}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.sale_items?.length || 0} items
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatCurrency(sale.total_amount)}
                                                </TableCell>
                                                <TableCell>
                                                    {getPaymentStatusBadge(sale.payment_status)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(sale.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            title="Print Receipt"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                        {sale.status === "completed" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                                title="Void Sale"
                                                            >
                                                                <Ban className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {salesData && salesData.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {((salesData.current_page - 1) * salesData.per_page) + 1} to{" "}
                        {Math.min(salesData.current_page * salesData.per_page, salesData.total)} of{" "}
                        {salesData.total} sales
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={salesData.current_page === 1}
                            onClick={() => onFiltersChange({ per_page: salesData.per_page })}
                        >
                            Previous
                        </Button>
                        <span className="text-sm">
                            Page {salesData.current_page} of {salesData.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={salesData.current_page === salesData.last_page}
                            onClick={() => onFiltersChange({ per_page: salesData.per_page })}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
} 