"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, Check, X, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { usePurchasePayments, PurchasePaymentFilters, PurchasePayment } from "@/hooks/usePurchasePayments";
import { formatCurrency } from "@/lib/utils";

interface PurchasePaymentListProps {
    filters: PurchasePaymentFilters;
    onViewPayment: (paymentId: number) => void;
    onEditPayment: (payment: PurchasePayment) => void;
}

export function PurchasePaymentList({ filters, onViewPayment, onEditPayment }: PurchasePaymentListProps) {
    const [selectedPayments, setSelectedPayments] = useState<number[]>([]);

    const {
        useGetPurchasePayments,
        useDeletePurchasePayment,
        useApprovePurchasePayment
    } = usePurchasePayments();

    const { data: payments, isLoading, error } = useGetPurchasePayments(filters);
    const deletePayment = useDeletePurchasePayment();
    const approvePayment = useApprovePurchasePayment();

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to cancel this payment?")) {
            await deletePayment.mutateAsync(id);
        }
    };

    const handleApprove = async (id: number) => {
        await approvePayment.mutateAsync({ id });
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

    const getWorkflowStatusBadge = (workflowStatus: string) => {
        switch (workflowStatus) {
            case "pending_approval":
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
            case "approved":
                return <Badge variant="default" className="bg-green-600">Approved</Badge>;
            case "rejected":
                return <Badge variant="destructive">Rejected</Badge>;
            case "completed":
                return <Badge variant="default" className="bg-blue-600">Completed</Badge>;
            default:
                return <Badge variant="outline">{workflowStatus}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-8">
                    <EmptyState
                        title="Error loading payments"
                        description="There was an error loading the purchase payments. Please try again."
                    />
                </CardContent>
            </Card>
        );
    }

    if (!payments?.data || payments.data.length === 0) {
        return (
            <Card>
                <CardContent className="py-8">
                    <EmptyState
                        title="No payments found"
                        description="No purchase payments match your current filters."
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Purchase Payments ({payments.total})</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Total: {formatCurrency(payments.data.reduce((sum: number, payment: PurchasePayment) => sum + payment.total_amount, 0))}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payment #</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Payment Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Allocated</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Workflow</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.data.map((payment: PurchasePayment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{payment.payment_number}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {payment.reference_number && `Ref: ${payment.reference_number}`}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{payment.supplier?.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {payment.supplier?.supplier_code}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {formatDate(payment.payment_date)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{formatCurrency(payment.total_amount)}</div>
                                            {payment.unallocated_amount > 0 && (
                                                <div className="text-sm text-orange-600">
                                                    Unallocated: {formatCurrency(payment.unallocated_amount)}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="font-medium text-green-600">
                                                {formatCurrency(payment.allocated_amount)}
                                            </div>
                                            <div className="text-muted-foreground">
                                                {payment.allocations?.length || 0} allocation(s)
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(payment.status)}
                                    </TableCell>
                                    <TableCell>
                                        {getWorkflowStatusBadge(payment.workflow_status)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{payment.paymentMethod?.name}</div>
                                            <div className="text-muted-foreground capitalize">
                                                {payment.paymentMethod?.type?.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onViewPayment(payment.id)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {payment.status === "draft" && (
                                                    <DropdownMenuItem onClick={() => onEditPayment(payment)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Payment
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                {payment.workflow_status === "pending_approval" && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleApprove(payment.id)}
                                                        className="text-green-600"
                                                    >
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Approve Payment
                                                    </DropdownMenuItem>
                                                )}
                                                {(payment.status === "draft" || payment.status === "pending") && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(payment.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Cancel Payment
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {payments.total > payments.per_page && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {payments.from} to {payments.to} of {payments.total} payments
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!payments.prev_page_url}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!payments.next_page_url}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 