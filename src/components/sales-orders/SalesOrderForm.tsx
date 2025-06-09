"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Save, ArrowLeft, Package, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { SalesOrder, SalesOrderFormData } from '@/types/sales-orders';
import { formatCurrency } from '@/lib/utils';

const salesOrderItemSchema = z.object({
    product_id: z.number().min(1, "Product is required"),
    quantity_ordered: z.number().min(0.01, "Quantity must be greater than 0"),
    unit_price: z.number().min(0, "Unit price must be non-negative"),
    discount_amount: z.number().min(0, "Discount must be non-negative").optional(),
    tax_rate: z.number().min(0).max(100, "Tax rate must be between 0 and 100").optional(),
    notes: z.string().optional(),
});

const salesOrderFormSchema = z.object({
    customer_id: z.number().min(1, "Customer is required"),
    warehouse_id: z.number().min(1, "Warehouse is required"),
    order_date: z.string().min(1, "Order date is required"),
    requested_delivery_date: z.string().min(1, "Delivery date is required"),
    payment_terms_days: z.number().min(0, "Payment terms must be non-negative"),
    sales_rep_id: z.number().optional(),
    notes: z.string().optional(),
    special_instructions: z.string().optional(),
    items: z.array(salesOrderItemSchema).min(1, "At least one item is required"),
});

type SalesOrderFormValues = z.infer<typeof salesOrderFormSchema>;

interface SalesOrderFormProps {
    order?: SalesOrder;
    onSubmit?: (data: SalesOrderFormData) => void;
    onCancel?: () => void;
}

export const SalesOrderForm: React.FC<SalesOrderFormProps> = ({
    order,
    onSubmit,
    onCancel
}) => {
    const router = useRouter();
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(order?.warehouse_id || 0);

    const {
        useGetCustomers,
        useGetWarehouses,
        useGetProducts,
        useGetSalesReps,
        useCreateSalesOrder,
        useUpdateSalesOrder,
    } = useSalesOrders();

    // Fetch data for dropdowns
    const { data: customers = [] } = useGetCustomers();
    const { data: warehouses = [] } = useGetWarehouses();
    const { data: products = [] } = useGetProducts(selectedWarehouseId > 0 ? selectedWarehouseId : undefined);
    const { data: salesReps = [] } = useGetSalesReps();

    // Mutations
    const createSalesOrder = useCreateSalesOrder();
    const updateSalesOrder = useUpdateSalesOrder();

    const form = useForm<SalesOrderFormValues>({
        resolver: zodResolver(salesOrderFormSchema),
        defaultValues: {
            customer_id: order?.customer_id || 0,
            warehouse_id: order?.warehouse_id || 0,
            order_date: order?.order_date || new Date().toISOString().split('T')[0],
            requested_delivery_date: order?.requested_delivery_date || "",
            payment_terms_days: order?.payment_terms_days || 30,
            sales_rep_id: order?.sales_rep_id || 0,
            notes: order?.notes || "",
            special_instructions: order?.special_instructions || "",
            items: order?.items?.map((item: any) => ({
                product_id: item.product_id,
                quantity_ordered: item.quantity_ordered,
                unit_price: item.unit_price,
                discount_amount: item.discount_amount || 0,
                tax_rate: item.tax_rate || 11,
                notes: item.notes || "",
            })) || [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const handleSubmit = (data: SalesOrderFormValues) => {
        const formData: SalesOrderFormData = {
            ...data,
            sales_rep_id: data.sales_rep_id && data.sales_rep_id > 0 ? data.sales_rep_id : undefined,
        };

        if (order) {
            updateSalesOrder.mutate(
                { id: order.id, data: formData },
                {
                    onSuccess: () => {
                        toast.success("Sales order updated successfully");
                        if (onSubmit) {
                            onSubmit(formData);
                        } else {
                            router.push(`/sales-orders/${order.id}`);
                        }
                    },
                    onError: (error: any) => {
                        toast.error(error.response?.data?.message || "Failed to update order");
                    }
                }
            );
        } else {
            createSalesOrder.mutate(formData, {
                onSuccess: (response) => {
                    toast.success("Sales order created successfully");
                    if (onSubmit) {
                        onSubmit(formData);
                    } else {
                        router.push(`/sales-orders/${response.data.id}`);
                    }
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || "Failed to create order");
                }
            });
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    const addItem = () => {
        append({
            product_id: 0,
            quantity_ordered: 1,
            unit_price: 0,
            discount_amount: 0,
            tax_rate: 11,
            notes: "",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {order ? "Edit Sales Order" : "Create Sales Order"}
                        </h1>
                        <p className="text-muted-foreground">
                            {order ? `Edit order ${order.sales_order_number}` : "Create a new B2B sales order"}
                        </p>
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="customer_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer</FormLabel>
                                            <Select
                                                value={field.value.toString()}
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select customer" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {customers.map((customer: any) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.name}
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
                                    name="warehouse_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Warehouse</FormLabel>
                                            <Select
                                                value={field.value.toString()}
                                                onValueChange={(value) => {
                                                    field.onChange(parseInt(value));
                                                    setSelectedWarehouseId(parseInt(value));
                                                }}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select warehouse" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {warehouses.map((warehouse: any) => (
                                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                            {warehouse.name}
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
                                            <FormLabel>Order Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="requested_delivery_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Requested Delivery Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="payment_terms_days"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Terms (Days)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="sales_rep_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sales Representative</FormLabel>
                                            <Select
                                                value={field.value?.toString() || "0"}
                                                onValueChange={(value) => field.onChange(parseInt(value) || 0)}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select sales rep (optional)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">No sales rep assigned</SelectItem>
                                                    {salesReps.map((salesRep: any) => (
                                                        <SelectItem key={salesRep.id} value={salesRep.id.toString()}>
                                                            {salesRep.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Order notes..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="special_instructions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Special Instructions</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Special delivery or handling instructions..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Order Items
                                </CardTitle>
                                <Button type="button" onClick={addItem} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {fields.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No items added. Click "Add Item" to start.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <Card key={field.id} className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.product_id`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Product</FormLabel>
                                                            <Select
                                                                value={field.value.toString()}
                                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select product" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {products.map((product: any) => (
                                                                        <SelectItem key={product.id} value={product.id.toString()}>
                                                                            {product.name}
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
                                                    name={`items.${index}.quantity_ordered`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Quantity</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.unit_price`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Unit Price</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="flex items-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => remove(index)}
                                                        className="w-full"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createSalesOrder.isPending || updateSalesOrder.isPending}>
                            <Save className="h-4 w-4 mr-2" />
                            {createSalesOrder.isPending || updateSalesOrder.isPending ? "Saving..." : order ? "Update Order" : "Create Order"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}; 