"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, Trash2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { usePurchasePayments, CreatePurchasePaymentData, PurchasePayment } from "@/hooks/usePurchasePayments";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";

const paymentSchema = z.object({
    supplier_id: z.number().min(1, "Supplier is required"),
    payment_method_id: z.number().min(1, "Payment method is required"),
    total_amount: z.number().min(0.01, "Amount must be greater than 0"),
    payment_date: z.string().min(1, "Payment date is required"),
    reference_number: z.string().optional(),
    bank_reference: z.string().optional(),
    notes: z.string().optional(),
    auto_allocate: z.boolean().default(false),
    allocations: z.array(z.object({
        purchase_order_id: z.number(),
        allocated_amount: z.number().min(0.01),
        notes: z.string().optional(),
    })).optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PurchasePaymentFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    payment?: PurchasePayment;
}

export function PurchasePaymentForm({ open, onClose, onSuccess, payment }: PurchasePaymentFormProps) {
    const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
    const [outstandingOrders, setOutstandingOrders] = useState<any[]>([]);
    const [showAllocation, setShowAllocation] = useState(false);

    const {
        useCreatePurchasePayment,
        useUpdatePurchasePayment,
        usePaymentMethods,
        useSuppliersForPayment,
        useSupplierOutstanding,
    } = usePurchasePayments();

    const { data: paymentMethods } = usePaymentMethods();
    const { data: suppliers } = useSuppliersForPayment();
    const { data: supplierOutstanding } = useSupplierOutstanding(selectedSupplier || 0);
    const createPayment = useCreatePurchasePayment();
    const updatePayment = useUpdatePurchasePayment();

    const form = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            payment_date: format(new Date(), "yyyy-MM-dd"),
            auto_allocate: false,
            allocations: [],
        },
    });

    // Update form when payment prop changes (for editing)
    useEffect(() => {
        if (payment) {
            form.reset({
                supplier_id: payment.supplier_id,
                payment_method_id: payment.payment_method_id,
                total_amount: payment.total_amount,
                payment_date: payment.payment_date,
                reference_number: payment.reference_number || "",
                bank_reference: payment.bank_reference || "",
                notes: payment.notes || "",
                auto_allocate: false,
                allocations: payment.allocations?.map(alloc => ({
                    purchase_order_id: alloc.purchase_order_id,
                    allocated_amount: alloc.allocated_amount,
                    notes: alloc.notes || "",
                })) || [],
            });
            setSelectedSupplier(payment.supplier_id);
        }
    }, [payment, form]);

    // Update outstanding orders when supplier changes
    useEffect(() => {
        if (supplierOutstanding?.outstanding_orders) {
            setOutstandingOrders(supplierOutstanding.outstanding_orders);
        }
    }, [supplierOutstanding]);

    const handleSupplierChange = (supplierId: string) => {
        const id = Number(supplierId);
        setSelectedSupplier(id);
        form.setValue("supplier_id", id);

        // Clear existing allocations when supplier changes
        form.setValue("allocations", []);
        setShowAllocation(false);
    };

    const addAllocation = () => {
        const currentAllocations = form.getValues("allocations") || [];
        form.setValue("allocations", [
            ...currentAllocations,
            { purchase_order_id: 0, allocated_amount: 0, notes: "" }
        ]);
    };

    const removeAllocation = (index: number) => {
        const currentAllocations = form.getValues("allocations") || [];
        form.setValue("allocations", currentAllocations.filter((_, i) => i !== index));
    };

    const calculateTotalAllocated = () => {
        const allocations = form.watch("allocations") || [];
        return allocations.reduce((sum, alloc) => sum + (alloc.allocated_amount || 0), 0);
    };

    const onSubmit = async (data: PaymentFormData) => {
        try {
            const paymentData: CreatePurchasePaymentData = {
                supplier_id: data.supplier_id,
                payment_method_id: data.payment_method_id,
                total_amount: data.total_amount,
                payment_date: data.payment_date,
                reference_number: data.reference_number,
                bank_reference: data.bank_reference,
                notes: data.notes,
                auto_allocate: data.auto_allocate,
                allocations: data.allocations?.filter(alloc => alloc.purchase_order_id > 0),
            };

            if (payment) {
                await updatePayment.mutateAsync({ id: payment.id, data: paymentData });
            } else {
                await createPayment.mutateAsync(paymentData);
            }

            onSuccess();
            form.reset();
        } catch (error) {
            // Error handled in hook
        }
    };

    const totalAmount = form.watch("total_amount") || 0;
    const totalAllocated = calculateTotalAllocated();
    const unallocatedAmount = totalAmount - totalAllocated;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {payment ? "Edit Purchase Payment" : "Create Purchase Payment"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Supplier Selection */}
                                    <FormField
                                        control={form.control}
                                        name="supplier_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Supplier</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={field.value?.toString() || ""}
                                                        onValueChange={handleSupplierChange}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select supplier" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {suppliers?.map((supplier: any) => (
                                                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                                    {supplier.name} ({supplier.supplier_code})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Payment Method */}
                                    <FormField
                                        control={form.control}
                                        name="payment_method_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Method</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={field.value?.toString() || ""}
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select payment method" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {paymentMethods?.map((method: any) => (
                                                                <SelectItem key={method.id} value={method.id.toString()}>
                                                                    {method.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Total Amount */}
                                    <FormField
                                        control={form.control}
                                        name="total_amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Enter payment amount"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Payment Date */}
                                    <FormField
                                        control={form.control}
                                        name="payment_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Date</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Reference Number */}
                                    <FormField
                                        control={form.control}
                                        name="reference_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Reference Number</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter reference number"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Bank Reference */}
                                    <FormField
                                        control={form.control}
                                        name="bank_reference"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bank Reference</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter bank reference"
                                                        {...field}
                                                    />
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
                                                    placeholder="Enter payment notes"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Supplier Outstanding Information */}
                        {selectedSupplier && supplierOutstanding && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Supplier Outstanding</span>
                                        <Badge variant="outline">
                                            {formatCurrency(supplierOutstanding.summary.total_outstanding)}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {formatCurrency(supplierOutstanding.summary.total_outstanding)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Total Outstanding</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {formatCurrency(supplierOutstanding.summary.overdue_amount)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Overdue Amount</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">
                                                {supplierOutstanding.summary.orders_count}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Outstanding Orders</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <FormField
                                            control={form.control}
                                            name="auto_allocate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>Auto-allocate to oldest orders</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowAllocation(!showAllocation)}
                                        >
                                            <Calculator className="h-4 w-4 mr-2" />
                                            Manual Allocation
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Manual Allocation */}
                        {showAllocation && outstandingOrders.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Payment Allocation</span>
                                        <Button type="button" variant="outline" size="sm" onClick={addAllocation}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Allocation
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Allocation Summary */}
                                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="text-center">
                                            <div className="text-lg font-bold">{formatCurrency(totalAmount)}</div>
                                            <div className="text-sm text-muted-foreground">Total Payment</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-green-600">{formatCurrency(totalAllocated)}</div>
                                            <div className="text-sm text-muted-foreground">Allocated</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-lg font-bold ${unallocatedAmount < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                                {formatCurrency(unallocatedAmount)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Unallocated</div>
                                        </div>
                                    </div>

                                    {/* Allocation Items */}
                                    {form.watch("allocations")?.map((allocation, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                                            <div className="col-span-4">
                                                <Label>Purchase Order</Label>
                                                <Select
                                                    value={allocation.purchase_order_id?.toString() || ""}
                                                    onValueChange={(value) => {
                                                        const allocations = form.getValues("allocations") || [];
                                                        allocations[index].purchase_order_id = Number(value);
                                                        form.setValue("allocations", allocations);
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select PO" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {outstandingOrders.map((order: any) => (
                                                            <SelectItem key={order.id} value={order.id.toString()}>
                                                                {order.po_number} - {formatCurrency(order.outstanding_amount)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-3">
                                                <Label>Amount</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Amount"
                                                    value={allocation.allocated_amount || ""}
                                                    onChange={(e) => {
                                                        const allocations = form.getValues("allocations") || [];
                                                        allocations[index].allocated_amount = Number(e.target.value);
                                                        form.setValue("allocations", allocations);
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <Label>Notes</Label>
                                                <Input
                                                    placeholder="Allocation notes"
                                                    value={allocation.notes || ""}
                                                    onChange={(e) => {
                                                        const allocations = form.getValues("allocations") || [];
                                                        allocations[index].notes = e.target.value;
                                                        form.setValue("allocations", allocations);
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeAllocation(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createPayment.isPending || updatePayment.isPending}
                            >
                                {payment ? "Update Payment" : "Create Payment"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 