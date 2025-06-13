"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2, Search, Package } from "lucide-react";
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
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { useSuppliers } from "@/hooks/use-suppliers";
import { usePurchaseOrder, useUpdatePurchaseOrder } from "@/hooks/use-purchase-orders";
import { useProducts } from "@/hooks/useInventory";
import { formatCurrency } from "@/lib/utils";
import { getEffectiveTaxRate, calculateLineItemTotals, COMMON_TAX_RATES, formatTaxRate } from "@/lib/tax-config";
import type { PurchaseOrder, CreatePurchaseOrderData } from "@/types/purchasing";

const purchaseOrderSchema = z.object({
    supplier_id: z.number().min(1, "Supplier is required"),
    order_date: z.string().min(1, "Order date is required"),
    expected_delivery_date: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
        product_id: z.number().min(1, "Product is required"),
        unit_id: z.number().min(1, "Unit is required"),
        quantity_ordered: z.number().min(0.01, "Quantity must be greater than 0"),
        unit_price: z.number().min(0, "Unit price must be non-negative"),
    })).min(1, "At least one item is required"),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

export default function EditPurchaseOrderPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);
    const [productSearch, setProductSearch] = useState("");
    const [formReady, setFormReady] = useState(false);

    const { data: purchaseOrderData, isLoading, error } = usePurchaseOrder(id);
    const updatePurchaseOrder = useUpdatePurchaseOrder();

    const form = useForm<PurchaseOrderFormData>({
        resolver: zodResolver(purchaseOrderSchema),
        defaultValues: {
            supplier_id: 1, // Temporary default, will be overwritten
            order_date: "",
            expected_delivery_date: "",
            notes: "",
            items: [],
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

    // Load purchase order data for editing
    useEffect(() => {
        if (purchaseOrderData?.data) {
            const po = purchaseOrderData.data;

            // Check if the purchase order can be edited
            if (po.status !== "draft") {
                toast.error("Only draft purchase orders can be edited");
                router.push(`/purchase-orders/${id}`);
                return;
            }

            console.log('Purchase Order Data:', po); // Debug log

            // Populate form with existing data
            const formData = {
                supplier_id: po.supplier_id || po.supplier?.id,
                order_date: po.order_date,
                expected_delivery_date: po.expected_delivery_date || "",
                notes: po.notes || "",
                items: po.items.map(item => ({
                    product_id: item.product_id || item.product?.id,
                    unit_id: item.unit_id || item.unit?.id,
                    quantity_ordered: Number(item.quantity_ordered),
                    unit_price: Number(item.unit_price),
                })),
            };

            console.log('Form Data to Reset:', formData); // Debug log
            form.reset(formData);
            setFormReady(true);
        }
    }, [purchaseOrderData, id, router, form]);

    const watchedItems = form.watch("items");

    const calculateTotals = () => {
        const subtotal = watchedItems.reduce((sum, item) => {
            return sum + (item.quantity_ordered * item.unit_price);
        }, 0);

        // Calculate tax using product-specific tax rates or system default (11%)
        const taxAmount = watchedItems.reduce((sum, item) => {
            const product = getProductById(item.product_id);
            const effectiveTaxRate = getEffectiveTaxRate(product);
            const itemSubtotal = item.quantity_ordered * item.unit_price;
            return sum + (itemSubtotal * effectiveTaxRate / 100);
        }, 0);

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

            await updatePurchaseOrder.mutateAsync({
                id: id,
                data: submitData,
            });

            toast.success("Purchase order updated successfully");
            router.push(`/purchase-orders/${id}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update purchase order");
        }
    };

    const addItem = () => {
        append({ product_id: 0, unit_id: 0, quantity_ordered: 1, unit_price: 0 });
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

            // Auto-select unit if product has one
            if (product.unit) {
                form.setValue(`items.${index}.unit_id`, product.unit.id);
            }

            // Set default price to cost price if available
            if (product.cost_price && product.cost_price > 0) {
                form.setValue(`items.${index}.unit_price`, product.cost_price);
            }
        }
    };

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
                    <p className="mt-2 text-gray-600">The purchase order you're trying to edit doesn't exist.</p>
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

    if (!formReady) {
        return (
            <div className="container mx-auto py-6">
                <PageHeader
                    title="Loading Edit Form"
                    description="Preparing purchase order data..."
                    action={
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/purchase-orders/${id}`)}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Details
                        </Button>
                    }
                />
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    const po = purchaseOrderData.data;

    return (
        <div className="container mx-auto py-6 space-y-6">
            <PageHeader
                title={`Edit Purchase Order ${po.po_number}`}
                description="Modify purchase order details and items"
                action={
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/purchase-orders/${id}`)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Details
                    </Button>
                }
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase Order Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Supplier */}
                                <FormField
                                    control={form.control}
                                    name="supplier_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Supplier *</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                value={field.value ? field.value.toString() : ""}
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

                                {/* Order Date */}
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

                                {/* Expected Delivery Date */}
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
                            </div>

                            {/* Notes */}
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Additional notes or instructions"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Order Items</CardTitle>
                            <Button type="button" onClick={addItem} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="border rounded-lg p-4 space-y-4">
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Product */}
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.product_id`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product *</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            const productId = parseInt(value);
                                                            field.onChange(productId);
                                                            handleProductSelect(index, productId);
                                                        }}
                                                        value={field.value ? field.value.toString() : ""}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select product" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {isLoadingProducts ? (
                                                                <div className="flex items-center justify-center p-4">
                                                                    <LoadingSpinner size="sm" />
                                                                </div>
                                                            ) : (
                                                                productsData?.data?.map((product) => (
                                                                    <SelectItem key={product.id} value={product.id.toString()}>
                                                                        <div className="flex items-center gap-2">
                                                                            {product.image && (
                                                                                <img
                                                                                    src={product.image}
                                                                                    alt={product.name}
                                                                                    className="h-6 w-6 rounded object-cover"
                                                                                />
                                                                            )}
                                                                            <div>
                                                                                <div className="font-medium">{product.name}</div>
                                                                                <div className="text-xs text-gray-500">{product.sku}</div>
                                                                            </div>
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

                                        {/* Unit */}
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.unit_id`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit *</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                                        value={field.value ? field.value.toString() : ""}
                                                        disabled={!form.watch(`items.${index}.product_id`)}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select unit" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {getUnitsByProduct(form.watch(`items.${index}.product_id`)).map((unit) => (
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

                                        {/* Quantity */}
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity_ordered`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quantity *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Unit Price */}
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.unit_price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit Price *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Item Total */}
                                    <div className="text-right">
                                        <span className="text-sm text-gray-600">Item Total: </span>
                                        <span className="font-medium">
                                            {formatCurrency(
                                                (form.watch(`items.${index}.quantity_ordered`) || 0) *
                                                (form.watch(`items.${index}.unit_price`) || 0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Totals */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (10%):</span>
                                    <span>{formatCurrency(taxAmount)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-lg border-t pt-2">
                                    <span>Total:</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(`/purchase-orders/${id}`)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updatePurchaseOrder.isPending}
                        >
                            {updatePurchaseOrder.isPending ? "Updating..." : "Update Purchase Order"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}