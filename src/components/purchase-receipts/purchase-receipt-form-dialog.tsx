"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Minus, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useCreatePurchaseReceipt, useReceivableItems } from "@/hooks/use-purchase-receipts";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import type { CreatePurchaseReceiptData } from "@/types/purchasing";

const receiptItemSchema = z.object({
    purchase_order_item_id: z.number(),
    quantity_received: z.number().min(0, "Quantity received must be positive"),
    quantity_accepted: z.number().min(0, "Quantity accepted must be positive"),
    quantity_rejected: z.number().min(0, "Quantity rejected must be positive"),
    unit_cost: z.number().min(0, "Unit cost must be positive"),
    quality_status: z.enum(["pending", "passed", "failed", "partial"]),
    quality_notes: z.string().optional(),
});

const receiptSchema = z.object({
    purchase_order_id: z.number().min(1, "Please select a purchase order"),
    received_date: z.date({
        required_error: "Received date is required",
    }),
    notes: z.string().optional(),
    items: z.array(receiptItemSchema).min(1, "At least one item is required"),
});

type ReceiptFormData = z.infer<typeof receiptSchema>;

interface PurchaseReceiptFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    purchaseOrderId?: number;
}

export function PurchaseReceiptFormDialog({
    open,
    onOpenChange,
    onSuccess,
    purchaseOrderId,
}: PurchaseReceiptFormDialogProps) {
    const [selectedPOId, setSelectedPOId] = useState<number | null>(purchaseOrderId || null);

    const createReceipt = useCreatePurchaseReceipt();
    const {
        data: purchaseOrdersData,
        isLoading: isLoadingPOs
    } = usePurchaseOrders({
        status: "approved,sent_to_supplier,partially_received",
        per_page: 100
    });

    const {
        data: receivableItemsData,
        isLoading: isLoadingItems
    } = useReceivableItems(selectedPOId || 0);

    const form = useForm<ReceiptFormData>({
        resolver: zodResolver(receiptSchema),
        defaultValues: {
            purchase_order_id: purchaseOrderId || 0,
            received_date: new Date(),
            notes: "",
            items: [],
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "items",
    });

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (open) {
            form.reset({
                purchase_order_id: purchaseOrderId || 0,
                received_date: new Date(),
                notes: "",
                items: [],
            });
            setSelectedPOId(purchaseOrderId || null);
        }
    }, [open, purchaseOrderId, form]);

    // Load receivable items when PO is selected
    useEffect(() => {
        if (selectedPOId && receivableItemsData?.data) {
            const items = receivableItemsData.data.receivable_items
                .filter(item => item.can_receive && item.quantity_remaining > 0)
                .map(item => ({
                    purchase_order_item_id: item.purchase_order_item.id,
                    quantity_received: item.quantity_remaining,
                    quantity_accepted: item.quantity_remaining,
                    quantity_rejected: 0,
                    unit_cost: item.purchase_order_item.unit_price,
                    quality_status: "pending" as const,
                    quality_notes: "",
                }));

            form.setValue("items", items);
        }
    }, [selectedPOId, receivableItemsData, form]);

    const handlePOChange = (poId: string) => {
        const id = parseInt(poId);
        setSelectedPOId(id);
        form.setValue("purchase_order_id", id);
    };

    const handleQuantityReceivedChange = (index: number, value: number) => {
        const currentItem = fields[index];
        const maxAccepted = value;

        update(index, {
            ...currentItem,
            quantity_received: value,
            quantity_accepted: Math.min(currentItem.quantity_accepted, maxAccepted),
            quantity_rejected: Math.max(0, value - Math.min(currentItem.quantity_accepted, maxAccepted)),
        });
    };

    const handleQuantityAcceptedChange = (index: number, value: number) => {
        const currentItem = fields[index];
        const maxAccepted = currentItem.quantity_received;
        const accepted = Math.min(value, maxAccepted);

        update(index, {
            ...currentItem,
            quantity_accepted: accepted,
            quantity_rejected: currentItem.quantity_received - accepted,
            quality_status: accepted === currentItem.quantity_received ? "passed" :
                accepted === 0 ? "failed" : "partial",
        });
    };

    const onSubmit = async (data: ReceiptFormData) => {
        try {
            await createReceipt.mutateAsync({
                ...data,
                received_date: format(data.received_date, "yyyy-MM-dd"),
            } as CreatePurchaseReceiptData);

            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create purchase receipt:", error);
        }
    };

    const selectedPO = purchaseOrdersData?.data?.find(po => po.id === selectedPOId);
    const receivableItems = receivableItemsData?.data?.receivable_items || [];

    const calculateTotalValue = () => {
        return fields.reduce((total, item) => {
            return total + (item.quantity_accepted * item.unit_cost);
        }, 0);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Receive Goods</DialogTitle>
                    <DialogDescription>
                        Create a new purchase receipt to record goods received from a purchase order.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Purchase Order Selection */}
                            <FormField
                                control={form.control}
                                name="purchase_order_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purchase Order</FormLabel>
                                        <Select
                                            value={field.value?.toString() || ""}
                                            onValueChange={handlePOChange}
                                            disabled={!!purchaseOrderId}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select purchase order" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isLoadingPOs ? (
                                                    <SelectItem value="" disabled>Loading...</SelectItem>
                                                ) : (
                                                    purchaseOrdersData?.data?.map((po) => (
                                                        <SelectItem key={po.id} value={po.id.toString()}>
                                                            <div className="flex items-center justify-between w-full">
                                                                <span>{po.po_number}</span>
                                                                <span className="text-sm text-muted-foreground ml-2">
                                                                    {po.supplier.name}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Received Date */}
                            <FormField
                                control={form.control}
                                name="received_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Received Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                                max={format(new Date(), "yyyy-MM-dd")}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Purchase Order Details */}
                        {selectedPO && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Purchase Order Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">PO Number:</span>
                                            <div className="font-medium">{selectedPO.po_number}</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Supplier:</span>
                                            <div className="font-medium">{selectedPO.supplier.name}</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Order Date:</span>
                                            <div>{format(new Date(selectedPO.order_date), "MMM dd, yyyy")}</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Amount:</span>
                                            <div className="font-medium">{formatCurrency(selectedPO.total_amount)}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Items to Receive */}
                        {fields.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Items to Receive
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {fields.map((field, index) => {
                                            const receivableItem = receivableItems.find(
                                                item => item.purchase_order_item.id === field.purchase_order_item_id
                                            );

                                            if (!receivableItem) return null;

                                            const { purchase_order_item } = receivableItem;
                                            const maxReceivable = receivableItem.quantity_remaining;

                                            return (
                                                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="font-medium">{purchase_order_item.product.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                SKU: {purchase_order_item.product.sku} |
                                                                Unit: {purchase_order_item.unit.symbol} |
                                                                Remaining: {maxReceivable}
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {formatCurrency(purchase_order_item.unit_price)} per {purchase_order_item.unit.symbol}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div>
                                                            <Label htmlFor={`quantity_received_${index}`}>Quantity Received</Label>
                                                            <Input
                                                                id={`quantity_received_${index}`}
                                                                type="number"
                                                                min="0"
                                                                max={maxReceivable}
                                                                value={field.quantity_received}
                                                                onChange={(e) => handleQuantityReceivedChange(index, Number(e.target.value))}
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label htmlFor={`quantity_accepted_${index}`}>Quantity Accepted</Label>
                                                            <Input
                                                                id={`quantity_accepted_${index}`}
                                                                type="number"
                                                                min="0"
                                                                max={field.quantity_received}
                                                                value={field.quantity_accepted}
                                                                onChange={(e) => handleQuantityAcceptedChange(index, Number(e.target.value))}
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label>Quantity Rejected</Label>
                                                            <Input
                                                                type="number"
                                                                value={field.quantity_rejected}
                                                                disabled
                                                                className="bg-muted"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label htmlFor={`unit_cost_${index}`}>Unit Cost</Label>
                                                            <Input
                                                                id={`unit_cost_${index}`}
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={field.unit_cost}
                                                                onChange={(e) => update(index, { ...field, unit_cost: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor={`quality_status_${index}`}>Quality Status</Label>
                                                            <Select
                                                                value={field.quality_status}
                                                                onValueChange={(value) => update(index, {
                                                                    ...field,
                                                                    quality_status: value as "pending" | "passed" | "failed" | "partial"
                                                                })}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="pending">Pending</SelectItem>
                                                                    <SelectItem value="passed">Passed</SelectItem>
                                                                    <SelectItem value="failed">Failed</SelectItem>
                                                                    <SelectItem value="partial">Partial</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div>
                                                            <Label>Total Value</Label>
                                                            <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center font-medium">
                                                                {formatCurrency(field.quantity_accepted * field.unit_cost)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor={`quality_notes_${index}`}>Quality Notes (Optional)</Label>
                                                        <Textarea
                                                            id={`quality_notes_${index}`}
                                                            placeholder="Add any quality control notes..."
                                                            value={field.quality_notes || ""}
                                                            onChange={(e) => update(index, { ...field, quality_notes: e.target.value })}
                                                            rows={2}
                                                        />
                                                    </div>

                                                    {field.quantity_rejected > 0 && (
                                                        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                            <span className="text-sm text-yellow-800">
                                                                {field.quantity_rejected} units will be marked as rejected
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Summary */}
                                    <div className="border-t pt-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Total Accepted Value:</span>
                                            <span className="text-lg font-bold">{formatCurrency(calculateTotalValue())}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any additional notes about this receipt..."
                                            {...field}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createReceipt.isPending || fields.length === 0}
                            >
                                {createReceipt.isPending ? "Creating..." : "Create Receipt"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}