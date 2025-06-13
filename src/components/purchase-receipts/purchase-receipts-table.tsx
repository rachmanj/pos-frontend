"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Package,
    AlertTriangle,
    MoreHorizontal,
    FileText,
    Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApprovePurchaseReceipt, useRejectPurchaseReceipt } from "@/hooks/use-purchase-receipts";
import { formatCurrency } from "@/lib/utils";
import type { PurchaseReceipt, PaginationData } from "@/types/purchasing";

interface PurchaseReceiptsTableProps {
    receipts: PurchaseReceipt[];
    pagination?: PaginationData;
    onPageChange?: (page: number) => void;
    onRefresh?: () => void;
}

export function PurchaseReceiptsTable({
    receipts,
    pagination,
    onPageChange,
    onRefresh,
}: PurchaseReceiptsTableProps) {
    const [selectedReceipt, setSelectedReceipt] = useState<PurchaseReceipt | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const approveReceipt = useApprovePurchaseReceipt();
    const rejectReceipt = useRejectPurchaseReceipt();

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { label: "Draft", variant: "secondary" as const, icon: FileText },
            received: { label: "Received", variant: "default" as const, icon: Package },
            quality_check: { label: "Quality Check", variant: "outline" as const, icon: Clock },
            approved: { label: "Approved", variant: "default" as const, icon: CheckCircle },
            rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getQualityStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
            passed: { label: "Passed", variant: "default" as const, icon: CheckCircle },
            failed: { label: "Failed", variant: "destructive" as const, icon: XCircle },
            partial: { label: "Partial", variant: "outline" as const, icon: AlertTriangle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const handleApprove = async (receipt: PurchaseReceipt) => {
        try {
            await approveReceipt.mutateAsync(receipt.id);
            onRefresh?.();
        } catch (error) {
            console.error("Failed to approve receipt:", error);
        }
    };

    const handleReject = async (receipt: PurchaseReceipt) => {
        try {
            await rejectReceipt.mutateAsync(receipt.id);
            onRefresh?.();
        } catch (error) {
            console.error("Failed to reject receipt:", error);
        }
    };

    const handleViewDetails = (receipt: PurchaseReceipt) => {
        setSelectedReceipt(receipt);
        setIsDetailsOpen(true);
    };

    const calculateTotalReceived = (receipt: PurchaseReceipt) => {
        return receipt.items.reduce((total, item) => total + item.total_cost, 0);
    };

    const calculateAcceptanceRate = (receipt: PurchaseReceipt) => {
        const totalReceived = receipt.items.reduce((total, item) => total + item.quantity_received, 0);
        const totalAccepted = receipt.items.reduce((total, item) => total + item.quantity_accepted, 0);
        return totalReceived > 0 ? (totalAccepted / totalReceived) * 100 : 0;
    };

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Receipt #</TableHead>
                            <TableHead>Purchase Order</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Received Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Quality Status</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Received By</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {receipts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No purchase receipts found
                                </TableCell>
                            </TableRow>
                        ) : (
                            receipts.map((receipt) => (
                                <TableRow
                                    key={receipt.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleViewDetails(receipt)}
                                >
                                    <TableCell className="font-medium">
                                        {receipt.receipt_number}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {receipt.purchase_order.po_number}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{receipt.purchase_order.supplier.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {receipt.purchase_order.supplier.code}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(receipt.received_date), "MMM dd, yyyy")}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                                    <TableCell>{getQualityStatusBadge(receipt.quality_check_status)}</TableCell>
                                    <TableCell className="font-medium">
                                        {formatCurrency(calculateTotalReceived(receipt))}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-xs font-medium">
                                                    {receipt.receiver.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="text-sm">{receipt.receiver.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleViewDetails(receipt)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {receipt.status === "quality_check" && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleApprove(receipt)}
                                                            disabled={approveReceipt.isPending}
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleReject(receipt)}
                                                            disabled={rejectReceipt.isPending}
                                                            className="text-destructive"
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                    </>
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

            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {pagination.from} to {pagination.to} of {pagination.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange?.(pagination.current_page - 1)}
                            disabled={pagination.current_page <= 1}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                                .filter((page) => {
                                    const current = pagination.current_page;
                                    return page === 1 || page === pagination.last_page ||
                                        (page >= current - 1 && page <= current + 1);
                                })
                                .map((page, index, array) => (
                                    <div key={page} className="flex items-center">
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="px-2 text-muted-foreground">...</span>
                                        )}
                                        <Button
                                            variant={page === pagination.current_page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onPageChange?.(page)}
                                        >
                                            {page}
                                        </Button>
                                    </div>
                                ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange?.(pagination.current_page + 1)}
                            disabled={pagination.current_page >= pagination.last_page}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Receipt Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Purchase Receipt Details</DialogTitle>
                        <DialogDescription>
                            Receipt #{selectedReceipt?.receipt_number} for PO #{selectedReceipt?.purchase_order.po_number}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReceipt && (
                        <div className="space-y-6">
                            {/* Header Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Receipt Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Receipt Number:</span>
                                            <span className="text-sm font-medium">{selectedReceipt.receipt_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Received Date:</span>
                                            <span className="text-sm">{format(new Date(selectedReceipt.received_date), "MMM dd, yyyy")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Status:</span>
                                            {getStatusBadge(selectedReceipt.status)}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Quality Status:</span>
                                            {getQualityStatusBadge(selectedReceipt.quality_check_status)}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Acceptance Rate:</span>
                                            <span className="text-sm font-medium">{calculateAcceptanceRate(selectedReceipt).toFixed(1)}%</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Purchase Order</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">PO Number:</span>
                                            <span className="text-sm font-medium">{selectedReceipt.purchase_order.po_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Supplier:</span>
                                            <span className="text-sm">{selectedReceipt.purchase_order.supplier.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Order Date:</span>
                                            <span className="text-sm">{format(new Date(selectedReceipt.purchase_order.order_date), "MMM dd, yyyy")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Received By:</span>
                                            <span className="text-sm">{selectedReceipt.receiver.name}</span>
                                        </div>
                                        {selectedReceipt.approver && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Approved By:</span>
                                                <span className="text-sm">{selectedReceipt.approver.name}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Items Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Received Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Unit</TableHead>
                                                <TableHead className="text-right">Ordered</TableHead>
                                                <TableHead className="text-right">Received</TableHead>
                                                <TableHead className="text-right">Accepted</TableHead>
                                                <TableHead className="text-right">Rejected</TableHead>
                                                <TableHead>Quality</TableHead>
                                                <TableHead className="text-right">Unit Cost</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedReceipt.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{item.product.name}</div>
                                                            <div className="text-sm text-muted-foreground">{item.product.sku}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{item.unit.symbol}</TableCell>
                                                    <TableCell className="text-right">{item.quantity_ordered}</TableCell>
                                                    <TableCell className="text-right">{item.quantity_received}</TableCell>
                                                    <TableCell className="text-right">{item.quantity_accepted}</TableCell>
                                                    <TableCell className="text-right">{item.quantity_rejected}</TableCell>
                                                    <TableCell>{getQualityStatusBadge(item.quality_status)}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                                                    <TableCell className="text-right font-medium">{formatCurrency(item.total_cost)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {selectedReceipt.notes && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">{selectedReceipt.notes}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Total Items:</span>
                                            <span className="text-sm font-medium">{selectedReceipt.items.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Total Received Value:</span>
                                            <span className="text-sm font-medium">{formatCurrency(calculateTotalReceived(selectedReceipt))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Stock Updated:</span>
                                            <Badge variant={selectedReceipt.stock_updated ? "default" : "secondary"}>
                                                {selectedReceipt.stock_updated ? "Yes" : "No"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}