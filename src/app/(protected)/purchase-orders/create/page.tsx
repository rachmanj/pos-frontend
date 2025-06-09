"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useCreatePurchaseOrder } from "@/hooks/use-purchase-orders";
import { useProducts, useSearchProducts } from "@/hooks/useInventory";
import { formatCurrency } from "@/lib/utils";
import type { CreatePurchaseOrderData } from "@/types/purchasing";

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

export default function CreatePurchaseOrderPage() {
    const router = useRouter();
    const [productSearch, setProductSearch] = useState("");
    const [manuallyRefresh, setManuallyRefresh] = useState(0);
    const [itemVatSettings, setItemVatSettings] = useState<{ [key: number]: boolean }>({});

    const form = useForm<PurchaseOrderFormData>({
        resolver: zodResolver(purchaseOrderSchema),
        defaultValues: {
            supplier_id: 0,
            order_date: new Date().toISOString().split('T')[0],
            expected_delivery_date: "",
            notes: "",
            items: [{ product_id: 0, unit_id: 0, quantity_ordered: 1, unit_price: 0 }],
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

    const productsFilters = {
        per_page: 100,
        page: 1,
        status: "active" as const, // Only load active products
        ...(productSearch ? { search: productSearch } : {}), // Only add search if not empty
        _refresh: manuallyRefresh, // Force refresh
    };

    const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useProducts(productsFilters);

    // Debug logging
    console.log("Products filters:", productsFilters);
    console.log("Products data:", productsData);
    console.log("Products loading:", isLoadingProducts);
    console.log("Products error:", productsError);
    console.log("Products data length:", productsData?.data?.length || 0);

    const createPurchaseOrder = useCreatePurchaseOrder();

    const watchedItems = form.watch("items");

    const calculateTotals = () => {
        const subtotal = watchedItems.reduce((sum, item) => {
            return sum + (item.quantity_ordered * item.unit_price);
        }, 0);

        // Calculate tax only for items with VAT enabled
        const taxAmount = watchedItems.reduce((sum, item, index) => {
            const includeVat = itemVatSettings[index] ?? true; // Default to true if not set
            if (includeVat) {
                return sum + (item.quantity_ordered * item.unit_price * 0.1); // 10% tax on VAT-enabled items
            }
            return sum;
        }, 0);

        const total = subtotal + taxAmount;

        return { subtotal, taxAmount, total };
    };

    const { subtotal, taxAmount, total } = calculateTotals();

    const onSubmit = async (data: PurchaseOrderFormData) => {
        try {
            // Debug: Log the form data to see the types
            console.log("Form data before submission:", JSON.stringify(data, null, 2));
            console.log("Items data types:", data.items.map(item => ({
                product_id: `${item.product_id} (${typeof item.product_id})`,
                unit_id: `${item.unit_id} (${typeof item.unit_id})`,
                quantity_ordered: `${item.quantity_ordered} (${typeof item.quantity_ordered})`,
                unit_price: `${item.unit_price} (${typeof item.unit_price})`
            })));

            const submitData: CreatePurchaseOrderData = {
                supplier_id: data.supplier_id,
                order_date: data.order_date,
                expected_delivery_date: data.expected_delivery_date || undefined,
                notes: data.notes || undefined,
                items: data.items.map(item => ({
                    product_id: Number(item.product_id),
                    unit_id: Number(item.unit_id),
                    quantity_ordered: Number(item.quantity_ordered),
                    unit_price: Number(item.unit_price),
                })),
            };

            console.log("Submit data after conversion:", JSON.stringify(submitData, null, 2));

            await createPurchaseOrder.mutateAsync(submitData);
            toast({
                title: "Success",
                description: "Purchase order created successfully",
            });
            router.push("/purchase-orders");
        } catch (error: any) {
            console.error("Submission error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create purchase order",
                variant: "destructive",
            });
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
            // Auto-select the product's unit
            if (product.unit?.id) {
                form.setValue(`items.${index}.unit_id`, product.unit.id);
            }
            // Set default price to cost price
            if (product.cost_price && product.cost_price > 0) {
                const costPrice = typeof product.cost_price === 'string' ? parseFloat(product.cost_price) : product.cost_price;
                form.setValue(`items.${index}.unit_price`, costPrice);
            }
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Purchase Orders
                </Button>
            </div>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
                <p className="text-muted-foreground">
                    Create a new purchase order for procurement
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Header Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Information</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                    </Card>

                    {/* Items Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Purchase Items</CardTitle>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Products: {productsData?.data?.length || 0}
                                        {isLoadingProducts && " (Loading...)"}
                                        {productsError && " (Error)"}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setManuallyRefresh(prev => prev + 1)}
                                        disabled={isLoadingProducts}
                                    >
                                        Refresh
                                    </Button>
                                    <Button type="button" onClick={addItem} size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => {
                                const selectedProduct = getProductById(form.watch(`items.${index}.product_id`));
                                const availableUnits = getUnitsByProduct(form.watch(`items.${index}.product_id`));
                                const baseItemTotal = form.watch(`items.${index}.quantity_ordered`) * form.watch(`items.${index}.unit_price`);
                                const includeVat = itemVatSettings[index] ?? true;
                                const itemTotal = includeVat ? baseItemTotal + (baseItemTotal * 0.1) : baseItemTotal;

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

                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                                                                    ) : productsError ? (
                                                                        <div className="flex items-center justify-center py-4 text-red-500 text-sm">
                                                                            Error loading products
                                                                        </div>
                                                                    ) : !productsData?.data || productsData.data.length === 0 ? (
                                                                        <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
                                                                            No products found
                                                                        </div>
                                                                    ) : (
                                                                        productsData.data.map((product) => (
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
                                                    <div className="mt-2 p-2 bg-gray-800 border border-gray-700 rounded text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-gray-300" />
                                                            <span className="font-medium text-gray-100">
                                                                Current Stock: {selectedProduct.stock?.current_stock || 0}
                                                            </span>
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
                                                    name={`items.${index}.quantity_ordered`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Quantity *</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0.01"
                                                                    value={field.value?.toString() || ""}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const numValue = value === "" ? 0 : parseFloat(value);
                                                                        field.onChange(isNaN(numValue) ? 0 : numValue);
                                                                    }}
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
                                                                    value={field.value?.toString() || ""}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const numValue = value === "" ? 0 : parseFloat(value);
                                                                        field.onChange(isNaN(numValue) ? 0 : numValue);
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="mt-1 text-sm font-medium text-gray-700">
                                                    Total: {formatCurrency(itemTotal)}
                                                    {includeVat && (
                                                        <span className="text-xs text-gray-500 ml-1">(incl. VAT)</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* VAT Checkbox */}
                                            <div className="flex flex-col justify-end">
                                                <div className="flex items-center space-x-2 h-10">
                                                    <Checkbox
                                                        id={`vat-${index}`}
                                                        checked={itemVatSettings[index] ?? true}
                                                        onCheckedChange={(checked) => {
                                                            setItemVatSettings(prev => ({
                                                                ...prev,
                                                                [index]: !!checked
                                                            }));
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`vat-${index}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Include VAT
                                                    </label>
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

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/purchase-orders")}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createPurchaseOrder.isPending}
                        >
                            {createPurchaseOrder.isPending ? (
                                <>
                                    <LoadingSpinner />
                                    Creating...
                                </>
                            ) : (
                                "Create Purchase Order"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
} 