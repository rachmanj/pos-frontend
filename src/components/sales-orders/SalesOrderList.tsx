// ============================================================================
// SALES ORDER LIST COMPONENT
// ============================================================================
// Comprehensive sales order management interface with advanced filtering,
// pagination, status management, and action menus
// ============================================================================

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    CheckCircle,
    XCircle,
    Truck,
    FileText,
    Calendar,
    AlertCircle,
    RefreshCw,
    Download
} from 'lucide-react';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { SalesOrder, SalesOrderFilters, SalesOrderStatus } from '@/types/sales-orders';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
    status: SalesOrderStatus;
    className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
    const statusConfig: Record<SalesOrderStatus, { label: string; variant: "secondary" | "default" | "destructive"; className: string }> = {
        draft: { label: "Draft", variant: "secondary", className: "bg-gray-100 text-gray-800" },
        confirmed: { label: "Confirmed", variant: "default", className: "bg-blue-100 text-blue-800" },
        approved: { label: "Approved", variant: "default", className: "bg-green-100 text-green-800" },
        in_progress: { label: "In Progress", variant: "default", className: "bg-yellow-100 text-yellow-800" },
        completed: { label: "Completed", variant: "default", className: "bg-emerald-100 text-emerald-800" },
        cancelled: { label: "Cancelled", variant: "destructive", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className={`${config.className} ${className}`}>
            {config.label}
        </Badge>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SalesOrderList: React.FC = () => {
    const router = useRouter();
    const [filters, setFilters] = useState<SalesOrderFilters>({
        page: 1,
        per_page: 10,
        sort_by: "created_at",
        sort_order: "desc"
    });

    // API hooks
    const {
        useGetSalesOrders,
        useConfirmSalesOrder,
        useApproveSalesOrder,
        useCancelSalesOrder,
        useDeleteSalesOrder
    } = useSalesOrders();

    const salesOrdersQuery = useGetSalesOrders(filters);
    const confirmOrderMutation = useConfirmSalesOrder();
    const approveOrderMutation = useApproveSalesOrder();
    const cancelOrderMutation = useCancelSalesOrder();
    const deleteOrderMutation = useDeleteSalesOrder();

    // Event handlers
    const handleView = (order: SalesOrder) => {
        router.push(`/sales-orders/${order.id}`);
    };

    const handleEdit = (order: SalesOrder) => {
        router.push(`/sales-orders/${order.id}/edit`);
    };

    const handleConfirm = async (order: SalesOrder) => {
        try {
            await confirmOrderMutation.mutateAsync(order.id);
        } catch (error) {
            // Error handling is done in the mutation
        }
    };

    const handleApprove = async (order: SalesOrder) => {
        try {
            await approveOrderMutation.mutateAsync(order.id);
        } catch (error) {
            // Error handling is done in the mutation
        }
    };

    const handleCancel = async (order: SalesOrder, reason: string) => {
        try {
            await cancelOrderMutation.mutateAsync({ id: order.id, reason });
        } catch (error) {
            // Error handling is done in the mutation
        }
    };

    const handleDelete = async (order: SalesOrder) => {
        try {
            await deleteOrderMutation.mutateAsync(order.id);
        } catch (error) {
            // Error handling is done in the mutation
        }
    };

    const canConfirm = (order: SalesOrder) => order.order_status === "draft";
    const canApprove = (order: SalesOrder) => order.order_status === "confirmed";
    const canCancel = (order: SalesOrder) => ["draft", "confirmed", "approved"].includes(order.order_status);
    const canEdit = (order: SalesOrder) => order.order_status === "draft";
    const canDelete = (order: SalesOrder) => order.order_status === "draft";
    const canCreateDelivery = (order: SalesOrder) => ["approved", "in_progress"].includes(order.order_status);
    const canCreateInvoice = (order: SalesOrder) => order.order_status === "completed";

    const isLoading = salesOrdersQuery.isLoading;
    const salesOrders = salesOrdersQuery.data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Sales Orders</h2>
                    <p className="text-muted-foreground">
                        Manage B2B sales orders from creation to completion
                    </p>
                </div>
                <Button onClick={() => router.push('/sales-orders/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Sales Order
                </Button>
            </div>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Sales Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order Number</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Order Date</TableHead>
                                    <TableHead>Delivery Date</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sales Rep</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                            Loading sales orders...
                                        </TableCell>
                                    </TableRow>
                                ) : salesOrders?.data?.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No sales orders found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    salesOrders?.data?.data.map((order: SalesOrder) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                {order.sales_order_number}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{order.customer?.name}</div>
                                                    {order.customer?.company_name && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {order.customer.company_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(order.order_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(order.requested_delivery_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(order.total_amount)}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={order.order_status} />
                                            </TableCell>
                                            <TableCell>
                                                {order.sales_rep?.name || "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleView(order)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {canEdit(order) && (
                                                            <DropdownMenuItem onClick={() => handleEdit(order)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit Order
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canConfirm(order) && (
                                                            <DropdownMenuItem onClick={() => handleConfirm(order)}>
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Confirm Order
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canApprove(order) && (
                                                            <DropdownMenuItem onClick={() => handleApprove(order)}>
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Approve Order
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canCreateDelivery(order) && (
                                                            <DropdownMenuItem onClick={() => router.push(`/delivery-orders/create?sales_order_id=${order.id}`)}>
                                                                <Truck className="h-4 w-4 mr-2" />
                                                                Create Delivery
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canCreateInvoice(order) && (
                                                            <DropdownMenuItem onClick={() => router.push(`/sales-invoices/create?sales_order_id=${order.id}`)}>
                                                                <FileText className="h-4 w-4 mr-2" />
                                                                Create Invoice
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        {canCancel(order) && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleCancel(order, "Cancelled by user")}
                                                                className="text-red-600"
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Cancel Order
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canDelete(order) && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(order)}
                                                                className="text-red-600"
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Delete Order
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesOrderList;
