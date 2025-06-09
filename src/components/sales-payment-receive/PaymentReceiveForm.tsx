"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCustomerPaymentReceive, type CreatePaymentReceiveData } from "@/hooks/useCustomerPaymentReceive"
import { useCustomers } from "@/hooks/useCustomers"
import { useSales } from "@/hooks/useSales"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Minus, DollarSign, AlertCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

const paymentReceiveSchema = z.object({
    customer_id: z.number().min(1, "Customer is required"),
    payment_method_id: z.number().min(1, "Payment method is required"),
    total_amount: z.number().min(0.01, "Amount must be greater than 0"),
    payment_date: z.string().min(1, "Payment date is required"),
    reference_number: z.string().optional(),
    bank_reference: z.string().optional(),
    notes: z.string().optional(),
    auto_allocate: z.boolean().default(false),
})

type PaymentReceiveFormData = z.infer<typeof paymentReceiveSchema>

interface PaymentReceiveFormProps {
    paymentId?: number
    onSuccess: () => void
    onCancel: () => void
}

interface AllocationItem {
    sale_id: number
    sale_number: string
    outstanding_amount: number
    allocated_amount: number
    due_date?: string
}

export function PaymentReceiveForm({ paymentId, onSuccess, onCancel }: PaymentReceiveFormProps) {
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
    const [outstandingSales, setOutstandingSales] = useState<any[]>([])
    const [allocations, setAllocations] = useState<AllocationItem[]>([])
    const [showAllocation, setShowAllocation] = useState(false)

    const {
        createPaymentReceive,
        updatePaymentReceive,
        usePaymentReceive,
        useCustomerOutstanding
    } = useCustomerPaymentReceive()

    const { useCustomers } = useCustomers()
    const { data: customers } = useCustomers({ per_page: 1000 })

    // Get existing payment data if editing
    const { data: existingPayment } = usePaymentReceive(paymentId || 0)

    // Get customer outstanding data when customer is selected
    const { data: customerOutstanding } = useCustomerOutstanding(selectedCustomerId || 0)

    const form = useForm<PaymentReceiveFormData>({
        resolver: zodResolver(paymentReceiveSchema),
        defaultValues: {
            customer_id: 0,
            payment_method_id: 0,
            total_amount: 0,
            payment_date: new Date().toISOString().split('T')[0],
            reference_number: '',
            bank_reference: '',
            notes: '',
            auto_allocate: false,
        },
    })

    // Payment methods (should come from API in real implementation)
    const paymentMethods = [
        { id: 1, name: 'Cash', type: 'cash' },
        { id: 2, name: 'Bank Transfer', type: 'bank_transfer' },
        { id: 3, name: 'Credit Card', type: 'credit_card' },
        { id: 4, name: 'Debit Card', type: 'debit_card' },
        { id: 5, name: 'OVO', type: 'digital_wallet' },
        { id: 6, name: 'GoPay', type: 'digital_wallet' },
        { id: 7, name: 'DANA', type: 'digital_wallet' },
    ]

    // Load existing payment data
    useEffect(() => {
        if (existingPayment) {
            form.reset({
                customer_id: existingPayment.customer_id,
                payment_method_id: existingPayment.payment_method_id,
                total_amount: existingPayment.total_amount,
                payment_date: existingPayment.payment_date,
                reference_number: existingPayment.reference_number || '',
                bank_reference: existingPayment.bank_reference || '',
                notes: existingPayment.notes || '',
                auto_allocate: false,
            })
            setSelectedCustomerId(existingPayment.customer_id)
        }
    }, [existingPayment, form])

    // Update outstanding sales when customer changes
    useEffect(() => {
        if (customerOutstanding?.outstanding_sales) {
            setOutstandingSales(customerOutstanding.outstanding_sales)
            // Initialize allocations
            const initialAllocations = customerOutstanding.outstanding_sales.map((sale: any) => ({
                sale_id: sale.id,
                sale_number: sale.sale_number,
                outstanding_amount: sale.outstanding_amount,
                allocated_amount: 0,
                due_date: sale.due_date,
            }))
            setAllocations(initialAllocations)
        }
    }, [customerOutstanding])

    const handleCustomerChange = (customerId: string) => {
        const id = parseInt(customerId)
        setSelectedCustomerId(id)
        form.setValue('customer_id', id)
    }

    const handleAllocationChange = (saleId: number, amount: number) => {
        setAllocations(prev => prev.map(allocation =>
            allocation.sale_id === saleId
                ? { ...allocation, allocated_amount: Math.max(0, Math.min(amount, allocation.outstanding_amount)) }
                : allocation
        ))
    }

    const getTotalAllocated = () => {
        return allocations.reduce((sum, allocation) => sum + allocation.allocated_amount, 0)
    }

    const getUnallocatedAmount = () => {
        const totalAmount = form.watch('total_amount') || 0
        return totalAmount - getTotalAllocated()
    }

    const autoAllocatePayments = () => {
        const totalAmount = form.watch('total_amount') || 0
        let remainingAmount = totalAmount

        const updatedAllocations = allocations.map(allocation => {
            if (remainingAmount <= 0) return { ...allocation, allocated_amount: 0 }

            const allocateAmount = Math.min(remainingAmount, allocation.outstanding_amount)
            remainingAmount -= allocateAmount

            return { ...allocation, allocated_amount: allocateAmount }
        })

        setAllocations(updatedAllocations)
    }

    const onSubmit = async (data: PaymentReceiveFormData) => {
        try {
            const submitData: CreatePaymentReceiveData = {
                ...data,
                allocations: showAllocation ? allocations
                    .filter(allocation => allocation.allocated_amount > 0)
                    .map(allocation => ({
                        sale_id: allocation.sale_id,
                        allocated_amount: allocation.allocated_amount,
                    })) : undefined,
            }

            if (paymentId) {
                await updatePaymentReceive.mutateAsync({ id: paymentId, data: submitData })
            } else {
                await createPaymentReceive.mutateAsync(submitData)
            }

            onSuccess()
        } catch (error) {
            console.error('Error saving payment receive:', error)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Payment Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Information</CardTitle>
                        <CardDescription>
                            Enter the basic payment receive details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="customer_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer *</FormLabel>
                                        <Select
                                            value={field.value?.toString() || ''}
                                            onValueChange={handleCustomerChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select customer" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers?.data?.map((customer: any) => (
                                                    <SelectItem key={customer.id} value={customer.id.toString()}>
                                                        {customer.name} ({customer.customer_code})
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
                                name="payment_method_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Method *</FormLabel>
                                        <Select
                                            value={field.value?.toString() || ''}
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {paymentMethods.map((method) => (
                                                    <SelectItem key={method.id} value={method.id.toString()}>
                                                        {method.name}
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
                                name="total_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Amount *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
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
                                name="payment_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Date *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reference_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reference Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Payment reference" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bank_reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bank Reference</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Bank transaction reference" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional notes about this payment"
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Customer Outstanding Balance */}
                {selectedCustomerId && customerOutstanding && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Customer Outstanding Balance
                            </CardTitle>
                            <CardDescription>
                                Current outstanding balance: {formatCurrency(customerOutstanding.summary.total_outstanding)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600">
                                        {formatCurrency(customerOutstanding.summary.total_outstanding)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Total Outstanding</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">
                                        {customerOutstanding.summary.sales_count}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Outstanding Sales</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-orange-600">
                                        {formatCurrency(customerOutstanding.summary.overdue_amount)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Overdue Amount</p>
                                </div>
                            </div>

                            {outstandingSales.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label>Allocate Payment to Outstanding Sales</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAllocation(!showAllocation)}
                                        >
                                            {showAllocation ? 'Hide' : 'Show'} Allocation
                                        </Button>
                                    </div>

                                    {showAllocation && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={autoAllocatePayments}
                                                >
                                                    Auto Allocate
                                                </Button>
                                                <div className="text-sm">
                                                    <span className="font-medium">Unallocated: </span>
                                                    <span className={getUnallocatedAmount() < 0 ? 'text-red-600' : 'text-green-600'}>
                                                        {formatCurrency(getUnallocatedAmount())}
                                                    </span>
                                                </div>
                                            </div>

                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Sale #</TableHead>
                                                        <TableHead>Outstanding</TableHead>
                                                        <TableHead>Due Date</TableHead>
                                                        <TableHead>Allocate Amount</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {allocations.map((allocation) => (
                                                        <TableRow key={allocation.sale_id}>
                                                            <TableCell className="font-medium">
                                                                {allocation.sale_number}
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatCurrency(allocation.outstanding_amount)}
                                                            </TableCell>
                                                            <TableCell>
                                                                {allocation.due_date ? formatDate(allocation.due_date) : 'No due date'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    max={allocation.outstanding_amount}
                                                                    value={allocation.allocated_amount}
                                                                    onChange={(e) => handleAllocationChange(
                                                                        allocation.sale_id,
                                                                        parseFloat(e.target.value) || 0
                                                                    )}
                                                                    className="w-32"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>

                                            {getUnallocatedAmount() < 0 && (
                                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Allocation exceeds payment amount
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={createPaymentReceive.isPending || updatePaymentReceive.isPending}
                    >
                        {createPaymentReceive.isPending || updatePaymentReceive.isPending
                            ? 'Saving...'
                            : paymentId ? 'Update Payment' : 'Create Payment'
                        }
                    </Button>
                </div>
            </form>
        </Form>
    )
} 