"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCustomerPaymentReceive } from "@/hooks/useCustomerPaymentReceive"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, DollarSign, Calculator, Zap, Info, CheckCircle2, XCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"

const allocationSchema = z.object({
    allocations: z.array(z.object({
        sale_id: z.number(),
        allocated_amount: z.number().min(0),
    })),
    notes: z.string().optional(),
})

type AllocationFormData = z.infer<typeof allocationSchema>

interface PaymentAllocationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    paymentId: number
    paymentAmount: number
    customerId: number
    customerName: string
    onSuccess: () => void
}

interface AllocationItem {
    sale_id: number
    sale_number: string
    sale_date: string
    original_amount: number
    outstanding_amount: number
    allocated_amount: number
    due_date?: string
    days_overdue: number
    priority: 'high' | 'medium' | 'low'
    selected: boolean
}

export function PaymentAllocationDialog({
    open,
    onOpenChange,
    paymentId,
    paymentAmount,
    customerId,
    customerName,
    onSuccess
}: PaymentAllocationDialogProps) {
    const [allocations, setAllocations] = useState<AllocationItem[]>([])
    const [allocationStrategy, setAllocationStrategy] = useState<'oldest_first' | 'highest_first' | 'overdue_first'>('overdue_first')
    const [showAdvanced, setShowAdvanced] = useState(false)

    const {
        allocatePayment,
        useCustomerOutstanding,
        usePaymentReceive
    } = useCustomerPaymentReceive()

    const { data: paymentData } = usePaymentReceive(paymentId)
    const { data: customerOutstanding } = useCustomerOutstanding(customerId)

    const form = useForm<AllocationFormData>({
        resolver: zodResolver(allocationSchema),
        defaultValues: {
            allocations: [],
            notes: '',
        },
    })

    // Initialize allocations when customer outstanding data is loaded
    useEffect(() => {
        if (customerOutstanding?.outstanding_sales) {
            const initialAllocations: AllocationItem[] = customerOutstanding.outstanding_sales.map((sale: any) => {
                const daysOverdue = sale.due_date
                    ? Math.max(0, Math.floor((new Date().getTime() - new Date(sale.due_date).getTime()) / (1000 * 60 * 60 * 24)))
                    : 0

                let priority: 'high' | 'medium' | 'low' = 'low'
                if (daysOverdue > 60) priority = 'high'
                else if (daysOverdue > 30) priority = 'medium'

                return {
                    sale_id: sale.id,
                    sale_number: sale.sale_number,
                    sale_date: sale.sale_date,
                    original_amount: sale.total_amount,
                    outstanding_amount: sale.outstanding_amount,
                    allocated_amount: 0,
                    due_date: sale.due_date,
                    days_overdue: daysOverdue,
                    priority,
                    selected: false,
                }
            })

            // Sort by priority and overdue status
            initialAllocations.sort((a, b) => {
                if (a.priority !== b.priority) {
                    const priorityOrder = { high: 3, medium: 2, low: 1 }
                    return priorityOrder[b.priority] - priorityOrder[a.priority]
                }
                return b.days_overdue - a.days_overdue
            })

            setAllocations(initialAllocations)
        }
    }, [customerOutstanding])

    // Load existing allocations if payment already has them
    useEffect(() => {
        if (paymentData?.allocations) {
            setAllocations(prev => prev.map(allocation => {
                const existingAllocation = paymentData.allocations.find(
                    (existing: any) => existing.sale_id === allocation.sale_id
                )
                return existingAllocation
                    ? { ...allocation, allocated_amount: existingAllocation.allocated_amount, selected: true }
                    : allocation
            }))
        }
    }, [paymentData])

    const getTotalAllocated = () => {
        return allocations.reduce((sum, allocation) => sum + allocation.allocated_amount, 0)
    }

    const getUnallocatedAmount = () => {
        return paymentAmount - getTotalAllocated()
    }

    const getSelectedCount = () => {
        return allocations.filter(allocation => allocation.selected).length
    }

    const handleAllocationChange = (saleId: number, amount: number) => {
        setAllocations(prev => prev.map(allocation =>
            allocation.sale_id === saleId
                ? {
                    ...allocation,
                    allocated_amount: Math.max(0, Math.min(amount, allocation.outstanding_amount)),
                    selected: amount > 0
                }
                : allocation
        ))
    }

    const handleSelectChange = (saleId: number, selected: boolean) => {
        setAllocations(prev => prev.map(allocation =>
            allocation.sale_id === saleId
                ? {
                    ...allocation,
                    selected,
                    allocated_amount: selected ? allocation.allocated_amount : 0
                }
                : allocation
        ))
    }

    const autoAllocatePayments = () => {
        let remainingAmount = paymentAmount

        // Sort allocations based on strategy
        const sortedAllocations = [...allocations].sort((a, b) => {
            switch (allocationStrategy) {
                case 'oldest_first':
                    return new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
                case 'highest_first':
                    return b.outstanding_amount - a.outstanding_amount
                case 'overdue_first':
                default:
                    if (a.days_overdue !== b.days_overdue) {
                        return b.days_overdue - a.days_overdue
                    }
                    return new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
            }
        })

        const updatedAllocations = allocations.map(allocation => {
            const sortedAllocation = sortedAllocations.find(s => s.sale_id === allocation.sale_id)!

            if (remainingAmount <= 0) {
                return { ...allocation, allocated_amount: 0, selected: false }
            }

            const allocateAmount = Math.min(remainingAmount, allocation.outstanding_amount)
            remainingAmount -= allocateAmount

            return {
                ...allocation,
                allocated_amount: allocateAmount,
                selected: allocateAmount > 0
            }
        })

        setAllocations(updatedAllocations)

        toast.success(`Auto-allocated ${formatCurrency(paymentAmount - remainingAmount)} across ${updatedAllocations.filter(a => a.selected).length} sales`)
    }

    const clearAllAllocations = () => {
        setAllocations(prev => prev.map(allocation => ({
            ...allocation,
            allocated_amount: 0,
            selected: false
        })))
        toast.info("All allocations cleared")
    }

    const allocateToSelected = () => {
        const selectedAllocations = allocations.filter(a => a.selected)
        if (selectedAllocations.length === 0) {
            toast.error("Please select at least one sale to allocate to")
            return
        }

        const totalOutstanding = selectedAllocations.reduce((sum, a) => sum + a.outstanding_amount, 0)
        let remainingAmount = paymentAmount

        const updatedAllocations = allocations.map(allocation => {
            if (!allocation.selected) {
                return { ...allocation, allocated_amount: 0 }
            }

            if (remainingAmount <= 0) {
                return { ...allocation, allocated_amount: 0 }
            }

            const allocateAmount = Math.min(remainingAmount, allocation.outstanding_amount)
            remainingAmount -= allocateAmount

            return { ...allocation, allocated_amount: allocateAmount }
        })

        setAllocations(updatedAllocations)
        toast.success(`Allocated to ${selectedAllocations.length} selected sales`)
    }

    const onSubmit = async (data: AllocationFormData) => {
        try {
            const allocationsToSubmit = allocations
                .filter(allocation => allocation.allocated_amount > 0)
                .map(allocation => ({
                    sale_id: allocation.sale_id,
                    allocated_amount: allocation.allocated_amount,
                }))

            if (allocationsToSubmit.length === 0) {
                toast.error("Please allocate payment to at least one sale")
                return
            }

            if (getTotalAllocated() > paymentAmount) {
                toast.error("Total allocation cannot exceed payment amount")
                return
            }

            await allocatePayment.mutateAsync({
                id: paymentId,
                data: {
                    allocations: allocationsToSubmit.map(allocation => ({
                        sale_id: allocation.sale_id,
                        allocated_amount: allocation.allocated_amount,
                        notes: data.notes,
                    })),
                },
            })

            toast.success(`Payment allocated successfully to ${allocationsToSubmit.length} sales`)
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error('Error allocating payment:', error)
            toast.error("Failed to allocate payment")
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200'
            case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'low': return 'bg-green-100 text-green-800 border-green-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getOverdueStatus = (daysOverdue: number) => {
        if (daysOverdue === 0) return { text: 'Current', color: 'text-green-600' }
        if (daysOverdue <= 30) return { text: `${daysOverdue}d overdue`, color: 'text-orange-600' }
        return { text: `${daysOverdue}d overdue`, color: 'text-red-600' }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Payment Allocation
                    </DialogTitle>
                    <DialogDescription>
                        Allocate payment of {formatCurrency(paymentAmount)} for customer: {customerName}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Allocation Summary */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Allocation Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {formatCurrency(paymentAmount)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Payment Amount</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(getTotalAllocated())}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Total Allocated</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-2xl font-bold ${getUnallocatedAmount() < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                            {formatCurrency(getUnallocatedAmount())}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Unallocated</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">
                                            {getSelectedCount()}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Sales Selected</p>
                                    </div>
                                </div>

                                {getUnallocatedAmount() < 0 && (
                                    <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                        <AlertCircle className="h-4 w-4" />
                                        Allocation exceeds payment amount by {formatCurrency(Math.abs(getUnallocatedAmount()))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Allocation Controls */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Zap className="h-5 w-5" />
                                    Allocation Controls
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={autoAllocatePayments}
                                        className="flex items-center gap-2"
                                    >
                                        <Zap className="h-4 w-4" />
                                        Auto Allocate
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={allocateToSelected}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Allocate to Selected
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllAllocations}
                                        className="flex items-center gap-2"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Clear All
                                    </Button>

                                    <Separator orientation="vertical" className="h-6" />

                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="strategy" className="text-sm">Strategy:</Label>
                                        <select
                                            id="strategy"
                                            value={allocationStrategy}
                                            onChange={(e) => setAllocationStrategy(e.target.value as any)}
                                            className="text-sm border rounded px-2 py-1"
                                        >
                                            <option value="overdue_first">Overdue First</option>
                                            <option value="oldest_first">Oldest First</option>
                                            <option value="highest_first">Highest Amount First</option>
                                        </select>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="flex items-center gap-2"
                                    >
                                        <Info className="h-4 w-4" />
                                        {showAdvanced ? 'Hide' : 'Show'} Advanced
                                    </Button>
                                </div>

                                {showAdvanced && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium mb-2">Allocation Strategies:</h4>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li><strong>Overdue First:</strong> Prioritizes overdue invoices, then oldest</li>
                                            <li><strong>Oldest First:</strong> Allocates to oldest sales first (FIFO)</li>
                                            <li><strong>Highest First:</strong> Allocates to highest outstanding amounts first</li>
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Outstanding Sales Table */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Outstanding Sales ({allocations.length})</CardTitle>
                                <CardDescription>
                                    Select and allocate payment amounts to outstanding sales
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">Select</TableHead>
                                                <TableHead>Sale #</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Original</TableHead>
                                                <TableHead>Outstanding</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Priority</TableHead>
                                                <TableHead className="w-32">Allocate</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allocations.map((allocation) => {
                                                const overdueStatus = getOverdueStatus(allocation.days_overdue)
                                                return (
                                                    <TableRow key={allocation.sale_id} className={allocation.selected ? 'bg-blue-50' : ''}>
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={allocation.selected}
                                                                onCheckedChange={(checked) =>
                                                                    handleSelectChange(allocation.sale_id, checked as boolean)
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {allocation.sale_number}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatDate(allocation.sale_date)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatCurrency(allocation.original_amount)}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {formatCurrency(allocation.outstanding_amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`text-sm ${overdueStatus.color}`}>
                                                                {overdueStatus.text}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={getPriorityColor(allocation.priority)}>
                                                                {allocation.priority.toUpperCase()}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max={allocation.outstanding_amount}
                                                                value={allocation.allocated_amount || ''}
                                                                onChange={(e) => handleAllocationChange(
                                                                    allocation.sale_id,
                                                                    parseFloat(e.target.value) || 0
                                                                )}
                                                                className="w-full"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Allocation Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add notes about this payment allocation..."
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={allocatePayment.isPending || getTotalAllocated() === 0 || getUnallocatedAmount() < 0}
                            >
                                {allocatePayment.isPending ? 'Allocating...' : 'Allocate Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
