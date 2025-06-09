"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    Eye,
    Edit,
    Trash2,
    Download,
    Send,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Package,
    Clock,
    AlertCircle
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
    useDeletePurchaseOrder,
    useApprovePurchaseOrder,
    useCancelPurchaseOrder
} from "@/hooks/use-purchase-orders";
import { formatCurrency } from "@/lib/utils";
import type { PurchaseOrder, PaginationData } from "@/types/purchasing";

interface PurchaseOrdersTableProps {
    purchaseOrders: PurchaseOrder[];
    pagination?: PaginationData;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
    onEdit?: (purchaseOrder: PurchaseOrder) => void;
    onViewDetails?: (purchaseOrder: PurchaseOrder) => void;
}

export function PurchaseOrdersTable({
    purchaseOrders,
    pagination,
    onPageChange,
    onRefresh,
    onEdit,
    onViewDetails,
}: PurchaseOrdersTableProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const deletePurchaseOrderMutation = useDeletePurchaseOrder();
    const approvePurchaseOrderMutation = useApprovePurchaseOrder();
    const cancelPurchaseOrderMutation = useCancelPurchaseOrder();

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { variant: "outline" as const, color: "gray", icon: Edit },
            pending_approval: { variant: "outline" as const, color: "yellow", icon: Clock },
            approved: { variant: "default" as const, color: "green", icon: CheckCircle },
            sent_to_supplier: { variant: "default" as const, color: "blue", icon: Send },
            partially_received: { variant: "outline" as const, color: "orange", icon: Package },
            fully_received: { variant: "default" as const, color: "green", icon: CheckCircle },
            cancelled: { variant: "destructive" as const, color: "red", icon: XCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
        );
    };

    const handleDelete = async (id: number) => {
        try {
            setDeletingId(id);
            await deletePurchaseOrderMutation.mutateAsync(id);
            toast.success("Purchase order deleted successfully");
            onRefresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete purchase order");
        } finally {
            setDeletingId(null);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await approvePurchaseOrderMutation.mutateAsync(id);
            toast.success("Purchase order approved successfully");
            onRefresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to approve purchase order");
        }
    };

    const handleCancel = async (id: number) => {
        try {
            await cancelPurchaseOrderMutation.mutateAsync(id);
            toast.success("Purchase order cancelled successfully");
            onRefresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel purchase order");
        }
    };

    const getReceivingStatus = (po: PurchaseOrder) => {
        const totalItems = po.items?.length || 0;
        const fullyReceivedItems = po.items?.filter(item => item.quantity_received === item.quantity_ordered).length || 0;
        const partiallyReceivedItems = po.items?.filter(item => item.quantity_received > 0 && item.quantity_received < item.quantity_ordered).length || 0;

        if (fullyReceivedItems === totalItems) {
            return { status: "Fully Received", color: "green" };
        } else if (partiallyReceivedItems > 0 || fullyReceivedItems > 0) {
            return { status: "Partially Received", color: "orange" };
        } else {
            return { status: "Pending", color: "gray" };
        }
    };

    const canApprove = (po: PurchaseOrder) => po.status === "pending_approval";
    const canCancel = (po: PurchaseOrder) => ["draft", "pending_approval", "approved"].includes(po.status);
    const canEdit = (po: PurchaseOrder) => po.status === "draft";
    const canDelete = (po: PurchaseOrder) => po.status === "draft";

    const handleViewDetails = (po: PurchaseOrder) => {
        if (onViewDetails) {
            onViewDetails(po);
        } else {
            // Default navigation to purchase order details page
            router.push(`/purchase-orders/${po.id}`);
        }
    };

    const handleEdit = (po: PurchaseOrder) => {
        if (onEdit) {
            onEdit(po);
        } else {
            // Default navigation to edit page
            router.push(`/purchase-orders/${po.id}/edit`);
        }
    };

    const handleDownloadPDF = async (po: PurchaseOrder) => {
        try {
            // TODO: Implement PDF download functionality
            toast.success("PDF download will be implemented soon");
        } catch (error: any) {
            toast.error("Failed to download PDF");
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>PO Number</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Order Date</TableHead>
                            <TableHead>Expected Delivery</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Receiving Status</TableHead>
                            <TableHead className="text-right">Total Amount</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchaseOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                    No purchase orders found
                                </TableCell>
                            </TableRow>
                        ) : (
                            purchaseOrders.map((po) => {
                                const receivingStatus = getReceivingStatus(po);
                                return (
                                    <TableRow key={po.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{po.po_number}</span>
                                                <span className="text-xs text-gray-500">
                                                    ID: {po.id}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{po.supplier?.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    {po.supplier?.code}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(po.order_date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            {po.expected_delivery_date ? (
                                                <div className="flex flex-col">
                                                    <span>{format(new Date(po.expected_delivery_date), "MMM d, yyyy")}</span>
                                                    {new Date(po.expected_delivery_date) < new Date() && po.status !== "fully_received" && (
                                                        <span className="text-xs text-red-500 flex items-center gap-1">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Not set</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(po.status)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`
                          ${receivingStatus.color === "green" ? "border-green-200 text-green-700 bg-green-50" : ""}
                          ${receivingStatus.color === "orange" ? "border-orange-200 text-orange-700 bg-orange-50" : ""}
                          ${receivingStatus.color === "gray" ? "border-gray-200 text-gray-700 bg-gray-50" : ""}
                        `}
                                            >
                                                {receivingStatus.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(po.total_amount)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{po.creator?.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    {format(new Date(po.created_at), "MMM d, yyyy")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleViewDetails(po)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>

                                                    {canEdit(po) && (
                                                        <DropdownMenuItem onClick={() => handleEdit(po)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuItem onClick={() => handleDownloadPDF(po)}>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download PDF
                                                    </DropdownMenuItem>

                                                    {canApprove(po) && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleApprove(po.id)}
                                                                className="text-green-600"
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Approve
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}

                                                    {canCancel(po) && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleCancel(po.id)}
                                                            className="text-orange-600"
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Cancel
                                                        </DropdownMenuItem>
                                                    )}

                                                    {canDelete(po) && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem
                                                                        onSelect={(e) => e.preventDefault()}
                                                                        className="text-red-600"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete purchase order {po.po_number}?
                                                                            This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDelete(po.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                            disabled={deletingId === po.id}
                                                                        >
                                                                            {deletingId === po.id ? "Deleting..." : "Delete"}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {pagination.from} to {pagination.to} of {pagination.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                        >
                            Previous
                        </Button>

                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <Button
                                        key={page}
                                        variant={pagination.current_page === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onPageChange(page)}
                                    >
                                        {page}
                                    </Button>
                                );
                            })}

                            {pagination.last_page > 5 && (
                                <>
                                    <span className="px-2">...</span>
                                    <Button
                                        variant={pagination.current_page === pagination.last_page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onPageChange(pagination.last_page)}
                                    >
                                        {pagination.last_page}
                                    </Button>
                                </>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
} 