"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ArrowLeft,
    Edit,
    Download,
    CheckCircle,
    XCircle,
    Package,
    Calendar,
    User,
    Building2,
    FileText,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "sonner";
import { usePurchaseOrder, useApprovePurchaseOrder, useCancelPurchaseOrder } from "@/hooks/use-purchase-orders";
import { formatCurrency } from "@/lib/utils";
import type { PurchaseOrder } from "@/types/purchasing";

export default function PurchaseOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);

    const { data: purchaseOrderData, isLoading, error } = usePurchaseOrder(id);
    const approvePurchaseOrderMutation = useApprovePurchaseOrder();
    const cancelPurchaseOrderMutation = useCancelPurchaseOrder();

    if (isLoading) {
        return (
            <div className="container mx-auto py-6">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !purchaseOrderData?.data) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Purchase Order Not Found</h2>
                    <p className="mt-2 text-gray-600">The purchase order you're looking for doesn't exist.</p>
                    <Button
                        onClick={() => router.push("/purchase-orders")}
                        className="mt-4"
                    >
                        Back to Purchase Orders
                    </Button>
                </div>
            </div>
        );
    }

    const po = purchaseOrderData.data;

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { variant: "outline" as const, color: "gray", icon: Edit },
            pending_approval: { variant: "outline" as const, color: "yellow", icon: AlertCircle },
            approved: { variant: "default" as const, color: "green", icon: CheckCircle },
            sent_to_supplier: { variant: "default" as const, color: "blue", icon: Package },
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

    const handleApprove = async () => {
        try {
            await approvePurchaseOrderMutation.mutateAsync(po.id);
            toast.success("Purchase order approved successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to approve purchase order");
        }
    };

    const handleCancel = async () => {
        try {
            await cancelPurchaseOrderMutation.mutateAsync(po.id);
            toast.success("Purchase order cancelled successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel purchase order");
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase-orders/${po.id}/download-pdf`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/pdf',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to download PDF');
            }

            // Create blob from response
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `PO-${po.po_number}.pdf`;

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("PDF downloaded successfully");
        } catch (error: any) {
            toast.error("Failed to download PDF");
        }
    };

    const canApprove = po.status === "pending_approval";
    const canCancel = ["draft", "pending_approval", "approved"].includes(po.status);
    const canEdit = po.status === "draft";

    return (
        <div className="container mx-auto py-6 space-y-6">
            <PageHeader
                title={`Purchase Order ${po.po_number}`}
                description={`Order details and status information`}
                action={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/purchase-orders")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>

                        {canEdit && (
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/purchase-orders/${po.id}/edit`)}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={handleDownloadPDF}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>

                        {canApprove && (
                            <Button
                                onClick={handleApprove}
                                disabled={approvePurchaseOrderMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                        )}

                        {canCancel && (
                            <Button
                                variant="destructive"
                                onClick={handleCancel}
                                disabled={cancelPurchaseOrderMutation.isPending}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                        )}
                    </div>
                }
            />

            {/* Purchase Order Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Order Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <span className="text-sm text-muted-foreground">PO Number</span>
                            <div className="font-medium">{po.po_number}</div>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Status</span>
                            <div className="mt-1">{getStatusBadge(po.status)}</div>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Total Amount</span>
                            <div className="font-medium text-lg">{formatCurrency(po.total_amount)}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Supplier Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <span className="text-sm text-muted-foreground">Supplier</span>
                            <div className="font-medium">{po.supplier.name}</div>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Code</span>
                            <div>{po.supplier.code}</div>
                        </div>
                        {po.supplier.contact_person && (
                            <div>
                                <span className="text-sm text-muted-foreground">Contact Person</span>
                                <div>{po.supplier.contact_person}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Dates & Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <span className="text-sm text-muted-foreground">Order Date</span>
                            <div>{format(new Date(po.order_date), "MMM dd, yyyy")}</div>
                        </div>
                        {po.expected_delivery_date && (
                            <div>
                                <span className="text-sm text-muted-foreground">Expected Delivery</span>
                                <div className="flex items-center gap-2">
                                    {format(new Date(po.expected_delivery_date), "MMM dd, yyyy")}
                                    {new Date(po.expected_delivery_date) < new Date() && po.status !== "fully_received" && (
                                        <Badge variant="destructive" className="text-xs">
                                            Overdue
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                        <div>
                            <span className="text-sm text-muted-foreground">Created</span>
                            <div>{format(new Date(po.created_at), "MMM dd, yyyy")}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Received</TableHead>
                                <TableHead className="text-right">Remaining</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {po.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {item.product.image && (
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="h-10 w-10 rounded object-cover"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{item.product.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {item.product.sku}
                                    </TableCell>
                                    <TableCell>{item.unit.symbol}</TableCell>
                                    <TableCell className="text-right">{item.quantity_ordered}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(item.total_price)}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={item.quantity_received > 0 ? "text-green-600 font-medium" : ""}>
                                            {item.quantity_received}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={item.quantity_remaining > 0 ? "text-orange-600 font-medium" : "text-green-600"}>
                                            {item.quantity_remaining}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Separator className="my-4" />

                    <div className="flex justify-end">
                        <div className="space-y-2 text-right">
                            <div className="flex justify-between gap-8">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>{formatCurrency(po.subtotal)}</span>
                            </div>
                            <div className="flex justify-between gap-8">
                                <span className="text-muted-foreground">Tax:</span>
                                <span>{formatCurrency(po.tax_amount)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between gap-8 text-lg font-medium">
                                <span>Total:</span>
                                <span>{formatCurrency(po.total_amount)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Created By
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm text-muted-foreground">Name</span>
                                <div className="font-medium">{po.creator.name}</div>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Date</span>
                                <div>{format(new Date(po.created_at), "MMM dd, yyyy 'at' HH:mm")}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {po.approver && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Approved By
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-sm text-muted-foreground">Name</span>
                                    <div className="font-medium">{po.approver.name}</div>
                                </div>
                                {po.approved_date && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">Date</span>
                                        <div>{format(new Date(po.approved_date), "MMM dd, yyyy 'at' HH:mm")}</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Notes */}
            {po.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{po.notes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 