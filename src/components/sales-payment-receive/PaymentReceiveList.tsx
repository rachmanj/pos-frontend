"use client"

import { useState } from "react"
import { useCustomerPaymentReceive, type PaymentReceiveFilters } from "@/hooks/useCustomerPaymentReceive"
import { useCustomers } from "@/hooks/useCustomers"
import { useSales } from "@/hooks/useSales"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    CheckCircle,
    XCircle,
    DollarSign,
    Trash2,
    Download,
    RefreshCw
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export function PaymentReceiveList() {
    const [filters, setFilters] = useState<PaymentReceiveFilters>({
        per_page: 20,
        sort_field: 'created_at',
        sort_direction: 'desc'
    })
    const [showFilters, setShowFilters] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<number | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [showAllocationDialog, setShowAllocationDialog] = useState(false)
    const [showVerificationDialog, setShowVerificationDialog] = useState(false)
    const [showApprovalDialog, setShowApprovalDialog] = useState(false)

    const {
        usePaymentReceives,
        deletePaymentReceive,
        verifyPaymentReceive,
        approvePaymentReceive,
        rejectPaymentReceive,
        autoAllocatePayment
    } = useCustomerPaymentReceive()

    const { data: payments, isLoading, refetch } = usePaymentReceives(filters)
    const { data: customers } = useCustomers({ per_page: 1000 })

    // Get payment methods from the first payment (they should be consistent)
    const paymentMethods = payments?.data?.[0]?.paymentMethod ?
        [...new Set(payments.data.map((p: any) => p.paymentMethod).filter(Boolean))] : []

    const handleFilterChange = (key: keyof PaymentReceiveFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === '' ? undefined : value
        }))
    }

    const handleAction = (paymentId: number, action: string) => {
        setSelectedPayment(paymentId)
        switch (action) {
            case 'view':
                setShowDetails(true)
                break
            case 'edit':
                setShowEditForm(true)
                break
            case 'allocate':
                setShowAllocationDialog(true)
                break
            case 'verify':
                setShowVerificationDialog(true)
                break
            case 'approve':
                setShowApprovalDialog(true)
                break
            case 'auto-allocate':
                autoAllocatePayment.mutate(paymentId)
                break
            case 'delete':
                if (confirm('Are you sure you want to delete this payment receive?')) {
                    deletePaymentReceive.mutate(paymentId)
                }
                break
        }
    }

    const getStatusBadge = (status: string, workflowStatus: string) => {
        if (status === 'cancelled') {
            return <Badge variant="destructive">Cancelled</Badge>
        }

        switch (workflowStatus) {
            case 'pending_verification':
                return <Badge variant="secondary">Pending Verification</Badge>
            case 'verified':
                return <Badge variant="outline">Verified</Badge>
            case 'pending_approval':
                return <Badge variant="secondary">Pending Approval</Badge>
            case 'approved':
                return <Badge variant="default">Approved</Badge>
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>
            case 'completed':
                return <Badge variant="default" className="bg-green-600">Completed</Badge>
            default:
                return <Badge variant="outline">{workflowStatus}</Badge>
        }
    }

    const getAllocationBadge = (payment: any) => {
        const allocatedPercentage = payment.total_amount > 0 ?
            (payment.allocated_amount / payment.total_amount) * 100 : 0

        if (allocatedPercentage === 0) {
            return <Badge variant="destructive">Unallocated</Badge>
        } else if (allocatedPercentage < 100) {
            return <Badge variant="secondary">Partial ({allocatedPercentage.toFixed(0)}%)</Badge>
        } else {
            return <Badge variant="default" className="bg-green-600">Fully Allocated</Badge>
        }
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by payment number, customer, or reference..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
                <Button
                    variant="outline"
                    onClick={() => refetch()}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <Card>
                    <CardHeader>
                        <CardTitle>Advanced Filters</CardTitle>
                        <CardDescription>Filter payments by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="text-sm font-medium">Customer</label>
                                <Select
                                    value={filters.customer_id?.toString() || ''}
                                    onValueChange={(value) => handleFilterChange('customer_id', value ? parseInt(value) : undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All customers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All customers</SelectItem>
                                        {customers?.data?.map((customer: any) => (
                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                {customer.name} ({customer.customer_code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={filters.workflow_status || ''}
                                    onValueChange={(value) => handleFilterChange('workflow_status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All statuses</SelectItem>
                                        <SelectItem value="pending_verification">Pending Verification</SelectItem>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Date From</label>
                                <Input
                                    type="date"
                                    value={filters.date_from || ''}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Date To</label>
                                <Input
                                    type="date"
                                    value={filters.date_to || ''}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Amount From</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={filters.amount_from || ''}
                                    onChange={(e) => handleFilterChange('amount_from', e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Amount To</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={filters.amount_to || ''}
                                    onChange={(e) => handleFilterChange('amount_to', e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Sort By</label>
                                <Select
                                    value={filters.sort_field || 'created_at'}
                                    onValueChange={(value) => handleFilterChange('sort_field', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="created_at">Date Created</SelectItem>
                                        <SelectItem value="payment_date">Payment Date</SelectItem>
                                        <SelectItem value="total_amount">Amount</SelectItem>
                                        <SelectItem value="payment_number">Payment Number</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Sort Direction</label>
                                <Select
                                    value={filters.sort_direction || 'desc'}
                                    onValueChange={(value) => handleFilterChange('sort_direction', value as 'asc' | 'desc')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Newest First</SelectItem>
                                        <SelectItem value="asc">Oldest First</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Receives Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payment #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Allocation</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        Loading payments...
                                    </TableCell>
                                </TableRow>
                            ) : payments?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        No payment receives found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments?.data?.map((payment: any) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">
                                            {payment.payment_number}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{payment.customer?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {payment.customer?.customer_code}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(payment.payment_date)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{formatCurrency(payment.total_amount)}</p>
                                                {payment.unallocated_amount > 0 && (
                                                    <p className="text-sm text-orange-600">
                                                        {formatCurrency(payment.unallocated_amount)} unallocated
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getAllocationBadge(payment)}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(payment.status, payment.workflow_status)}
                                        </TableCell>
                                        <TableCell>
                                            {payment.paymentMethod?.name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleAction(payment.id, 'view')}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction(payment.id, 'edit')}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {payment.unallocated_amount > 0 && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleAction(payment.id, 'allocate')}>
                                                                <DollarSign className="mr-2 h-4 w-4" />
                                                                Allocate Payment
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleAction(payment.id, 'auto-allocate')}>
                                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                                Auto Allocate
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {payment.workflow_status === 'pending_verification' && (
                                                        <DropdownMenuItem onClick={() => handleAction(payment.id, 'verify')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Verify
                                                        </DropdownMenuItem>
                                                    )}
                                                    {payment.workflow_status === 'pending_approval' && (
                                                        <DropdownMenuItem onClick={() => handleAction(payment.id, 'approve')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                    )}
                                                    {(payment.workflow_status === 'pending_verification' || payment.workflow_status === 'pending_approval') && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleAction(payment.id, 'reject')}
                                                            className="text-red-600"
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => handleAction(payment.id, 'delete')}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {payments?.meta && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {payments.meta.from} to {payments.meta.to} of {payments.meta.total} payments
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!payments.meta.prev_page_url}
                            onClick={() => handleFilterChange('page', payments.meta.current_page - 1)}
                        >
                            Previous
                        </Button>
                        <span className="text-sm">
                            Page {payments.meta.current_page} of {payments.meta.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!payments.meta.next_page_url}
                            onClick={() => handleFilterChange('page', payments.meta.current_page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* TODO: Add dialogs for payment details, allocation, verification, and approval */}
        </div>
    )
} 