"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Search, Package } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useCreatePurchaseOrder, useUpdatePurchaseOrder } from "@/hooks/use-purchase-orders";
import { useProducts } from "@/hooks/useInventory";
import { formatCurrency } from "@/lib/utils";
import type { PurchaseOrder, CreatePurchaseOrderData } from "@/types/purchasing";

const purchaseOrderSchema = z.object({
    supplier_id: z.number().min(1, "Supplier is required"),
    order_date: z.string().min(1, "Order date is required"),
    expected_delivery_date: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
        product_id: z.number().min(1, "Product is required"),
        unit_id: z.number().min(1, "Unit is required"),
        quantity: z.number().min(0.01, "Quantity must be greater than 0"),
        unit_price: z.number().min(0, "Unit price must be non-negative"),
    })).min(1, "At least one item is required"),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    purchaseOrder?: PurchaseOrder;
    mode?: "create" | "edit";
}

export function PurchaseOrderFormDialog({
    open,
    onOpenChange,
    onSuccess,
    purchaseOrder,
    mode = "create",
}: PurchaseOrderFormDialogProps) {
    const [productSearch, setProductSearch] = useState("");
    const [showProductSearch, setShowProductSearch] = useState(false);

    const form = useForm<PurchaseOrderFormData>({
        resolver: zodResolver(purchaseOrderSchema),
        defaultValues: {
            supplier_id: 0,
            order_date: new Date().toISOString().split('T')[0],
            expected_delivery_date: "",
            notes: "",
            items: [{ product_id: 0, unit_id: 0, quantity: 1, unit_price: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const { data: suppliersData } = useSuppliers({
        status: "active",
        per_page: 100,
        page: 1,
    });

    const { data: productsData, isLoading: isLoadingProducts } = useProducts({
        per_page: 100,
        page: 1,
        search: productSearch,
    });

    const createPurchaseOrder = useCreatePurchaseOrder();
    const updatePurchaseOrder = useUpdatePurchaseOrder();

    // Load purchase order data for editing
    useEffect(() => {
        if (mode === "edit" && purchaseOrder) {
            form.reset({
                supplier_id: purchaseOrder.supplier_id,
                order_date: purchaseOrder.order_date,
                expected_delivery_date: purchaseOrder.expected_delivery_date || "",
                notes: purchaseOrder.notes || "",
                items: purchaseOrder.items.map(item => ({
                    product_id: item.product_id,
                    unit_id: item.unit_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                })),
            });
        }
    }, [mode, purchaseOrder, form]);

    const watchedItems = form.watch("items");

    const calculateTotals = () => {
        const subtotal = watchedItems.reduce((sum, item) => {
            return sum + (item.quantity * item.unit_price);
        }, 0);
        const taxAmount = subtotal * 0.1; // Assuming 10% tax
        const total = subtotal + taxAmount;

        return { subtotal, taxAmount, total };
    };

    const { subtotal, taxAmount, total } = calculateTotals();

    const onSubmit = async (data: PurchaseOrderFormData) => {
        try {
            const submitData: CreatePurchaseOrderData = {
                supplier_id: data.supplier_id,
                order_date: data.order_date,
                expected_delivery_date: data.expected_delivery_date || undefined,
                notes: data.notes || undefined,
                items: data.items,
            };

            if (mode === "edit" && purchaseOrder) {
                await updatePurchaseOrder.mutateAsync({
                    id: purchaseOrder.id,
                    data: submitData,
                });
                toast({
                    title: "Success",
                    description: "Purchase order updated successfully",
                });
            } else {
                await createPurchaseOrder.mutateAsync(submitData);
                toast({
                    title: "Success",
                    description: "Purchase order created successfully",
                });
            }

            onSuccess();
            form.reset();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || `Failed to ${mode} purchase order`,
                variant: "destructive",
            });
        }
    };

    const addItem = () => {
        append({ product_id: 0, unit_id: 0, quantity: 1, unit_price: 0 });
    };

    const removeItem = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const getProductById = (productId: number) => {
        return productsData?.data?.find(p => p.id === productId);
    };

    const getUnitsByProduct = (productId: number) => {
        const product = getProductById(productId);
        return product?.unit ? [product.unit] : [];
    };

    const handleProductSelect = (index: number, productId: number) => {
        const product = getProductById(productId);
        if (product) {
            form.setValue(`items.${index}.product_id`, productId);
            // Auto-select the product's unit
            form.setValue(`items.${index}.unit_id`, product.unit.id);
            // Set default price to cost price
            form.setValue(`items.${index}.unit_price`, product.cost_price);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "edit" ? "Edit Purchase Order" : "Create Purchase Order"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Header Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="supplier_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier *</FormLabel>
                                        <Select
                                            value={field.value?.toString() || ""}
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select supplier" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {suppliersData?.data?.map((supplier) => (
                                                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                        {supplier.name} ({supplier.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="order_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order Date *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="expected_delivery_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expected Delivery Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Add any notes for this purchase order..."
                                                {...field}
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Items Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Purchase Items</CardTitle>
                                    <Button type="button" onClick={addItem} size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {fields.map((field, index) => {
                                    const selectedProduct = getProductById(form.watch(`items.${index}.product_id`));
                                    const availableUnits = getUnitsByProduct(form.watch(`items.${index}.product_id`));
                                    const itemTotal = form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.unit_price`);

                                    return (
                                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">Item {index + 1}</h4>
                                                {fields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                {/* Product Selection */}
                                                <div className="md:col-span-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.product_id`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Product *</FormLabel>
                                                                <Select
                                                                    value={field.value?.toString() || ""}
                                                                    onValueChange={(value) => handleProductSelect(index, parseInt(value))}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select product" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {isLoadingProducts ? (
                                                                            <div className="flex items-center justify-center py-4">
                                                                                <LoadingSpinner />
                                                                            </div>
                                                                        ) : (
                                                                            productsData?.data?.map((product) => (
                                                                                <SelectItem key={product.id} value={product.id.toString()}>
                                                                                    <div className="flex flex-col">
                                                                                        <span>{product.name}</span>
                                                                                        <span className="text-xs text-gray-500">
                                                                                            SKU: {product.sku}
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
                                                    {selectedProduct && (
                                                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-4 w-4" />
                                                                <span>Current Stock: {selectedProduct.stock?.current_stock || 0}</span>
                                                            </div>
                                                            {selectedProduct.image && (
                                                                <img
                                                                    src={selectedProduct.image}
                                                                    alt={selectedProduct.name}
                                                                    className="w-12 h-12 object-cover rounded mt-2"
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Unit Selection */}
                                                <div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.unit_id`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Unit *</FormLabel>
                                                                <Select
                                                                    value={field.value?.toString() || ""}
                                                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                                                    disabled={!availableUnits.length}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select unit" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {availableUnits.map((unit) => (
                                                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                                                {unit.name} ({unit.symbol})
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                {/* Quantity */}
                                                <div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.quantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Quantity *</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0.01"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                {/* Unit Price */}
                                                <div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.unit_price`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Unit Price (IDR)</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <div className="mt-1 text-sm font-medium text-gray-700">
                                                        Total: {formatCurrency(itemTotal)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Totals Summary */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (10%):</span>
                                        <span className="font-medium">{formatCurrency(taxAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total:</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

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
                                disabled={createPurchaseOrder.isPending || updatePurchaseOrder.isPending}
                            >
                                {createPurchaseOrder.isPending || updatePurchaseOrder.isPending ? (
                                    <>
                                        <LoadingSpinner />
                                        {mode === "edit" ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    mode === "edit" ? "Update Purchase Order" : "Create Purchase Order"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 