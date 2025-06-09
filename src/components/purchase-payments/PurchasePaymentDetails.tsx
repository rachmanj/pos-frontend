"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Eye,
    Edit,
    Trash2,
    Check,
    X,
    FileText,
    DollarSign,
    Calendar,
    User,
    Building,
    CreditCard,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePurchasePayments } from "@/hooks/usePurchasePayments";
import { formatCurrency } from "@/lib/utils";

interface PurchasePaymentDetailsProps {
    paymentId: number;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (payment: any) => void;
}

export function PurchasePaymentDetails({
    paymentId,
    isOpen,
    onClose,
    onEdit
}: PurchasePaymentDetailsProps) {
    const [activeTab, setActiveTab] = useState("details");

    const {
        useGetPurchasePayment,
        useGetPaymentAllocations,
        useApprovePurchasePayment,
        useRejectPurchasePayment,
        useDeletePurchasePayment
    } = usePurchasePayments();

    const { data: payment, isLoading } = useGetPurchasePayment(paymentId);
    const { data: allocations } = useGetPaymentAllocations(paymentId);
    const approveMutation = useApprovePurchasePayment();
    const rejectMutation = useRejectPurchasePayment();
    const deleteMutation = useDeletePurchasePayment();

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading payment details...</span>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!payment) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Payment not found or you don't have permission to view it.
                        </AlertDescription>
                    </Alert>
                </DialogContent>
            </Dialog>
        );
    }

    const handleApprove = async () => {
        try {
            await approveMutation.mutateAsync(paymentId);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleReject = async () => {
        try {
            await rejectMutation.mutateAsync(paymentId);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
            try {
                await deleteMutation.mutateAsync(paymentId);
                onClose();
            } catch (error) {
                // Error handled in hook
            }
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
            case 'paid':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'cancelled':
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="flex items-center gap-2">
                                Payment #{payment.payment_number}
                                <Badge className={getStatusColor(payment.status)}>
                                    {getStatusIcon(payment.status)}
                                    <span className="ml-1 capitalize">{payment.status}</span>
                                </Badge>
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Created on {format(new Date(payment.created_at), 'PPP')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {payment.status === 'pending' && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleApprove}
                                        disabled={approveMutation.isPending}
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleReject}
                                        disabled={rejectMutation.isPending}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Reject
                                    </Button>
                                </>
                            )}
                            {(payment.status === 'draft' || payment.status === 'pending') && onEdit && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onEdit(payment)}
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            )}
                            {payment.status === 'draft' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                    <TabsList>
                        <TabsTrigger value="details">Payment Details</TabsTrigger>
                        <TabsTrigger value="allocations">Allocations</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Payment Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Payment Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Amount</label>
                                            <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
                                            <p className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(payment.payment_date), 'PPP')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                                            <p className="flex items-center gap-1">
                                                <CreditCard className="h-4 w-4" />
                                                {payment.payment_method?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Reference</label>
                                            <p>{payment.reference_number || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {payment.notes && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                            <p className="text-sm bg-gray-50 p-3 rounded-md">{payment.notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Supplier Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Supplier Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                                        <p className="font-medium">{payment.supplier?.name}</p>
                                    </div>

                                    {payment.supplier?.email && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                                            <p>{payment.supplier.email}</p>
                                        </div>
                                    )}

                                    {payment.supplier?.phone && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                            <p>{payment.supplier.phone}</p>
                                        </div>
                                    )}

                                    {payment.supplier?.address && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Address</label>
                                            <p className="text-sm">{payment.supplier.address}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Approval Information */}
                        {(payment.approved_by || payment.rejected_by) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Approval Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {payment.approved_by && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Approved By</label>
                                                <p>{payment.approved_by.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(payment.approved_at), 'PPp')}
                                                </p>
                                            </div>
                                        )}

                                        {payment.rejected_by && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Rejected By</label>
                                                <p>{payment.rejected_by.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(payment.rejected_at), 'PPp')}
                                                </p>
                                            </div>
                                        )}

                                        {payment.approval_notes && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Approval Notes</label>
                                                <p className="text-sm bg-gray-50 p-3 rounded-md">{payment.approval_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="allocations" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Allocations</CardTitle>
                                <CardDescription>
                                    How this payment is allocated to purchase orders
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {allocations && allocations.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Purchase Order</TableHead>
                                                <TableHead>PO Amount</TableHead>
                                                <TableHead>Allocated Amount</TableHead>
                                                <TableHead>Remaining</TableHead>
                                                <TableHead>Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allocations.map((allocation: any) => (
                                                <TableRow key={allocation.id}>
                                                    <TableCell className="font-medium">
                                                        {allocation.purchase_order?.po_number || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCurrency(allocation.purchase_order?.total_amount || 0)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCurrency(allocation.allocated_amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCurrency((allocation.purchase_order?.total_amount || 0) - allocation.allocated_amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(new Date(allocation.created_at), 'PPP')}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No allocations found for this payment.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment History</CardTitle>
                                <CardDescription>
                                    Timeline of changes and activities for this payment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Created */}
                                    <div className="flex items-start gap-3 pb-4 border-b">
                                        <div className="rounded-full bg-blue-100 p-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">Payment Created</p>
                                            <p className="text-sm text-muted-foreground">
                                                Created by {payment.created_by?.name || 'System'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(payment.created_at), 'PPp')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Approved */}
                                    {payment.approved_at && (
                                        <div className="flex items-start gap-3 pb-4 border-b">
                                            <div className="rounded-full bg-green-100 p-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">Payment Approved</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Approved by {payment.approved_by?.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(payment.approved_at), 'PPp')}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Rejected */}
                                    {payment.rejected_at && (
                                        <div className="flex items-start gap-3 pb-4 border-b">
                                            <div className="rounded-full bg-red-100 p-2">
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">Payment Rejected</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Rejected by {payment.rejected_by?.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(payment.rejected_at), 'PPp')}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Last Updated */}
                                    {payment.updated_at !== payment.created_at && (
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-full bg-gray-100 p-2">
                                                <Clock className="h-4 w-4 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">Last Updated</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(payment.updated_at), 'PPp')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
} 