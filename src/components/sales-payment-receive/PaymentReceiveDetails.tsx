"use client"

import { useCustomerPaymentReceive, type CustomerPaymentReceive, type PaymentAllocation } from "@/hooks/useCustomerPaymentReceive"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
    User,
    Calendar,
    DollarSign,
    CreditCard,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Eye
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface PaymentReceiveDetailsProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    paymentId: number | null
    onEdit?: (payment: CustomerPaymentReceive) => void
}

export function PaymentReceiveDetails({ open, onOpenChange, paymentId, onEdit }: PaymentReceiveDetailsProps) {
    const { usePaymentReceive } = useCustomerPaymentReceive()
    const { data: payment, isLoading } = usePaymentReceive(paymentId || 0)

    if (!paymentId) return null

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

    const getAllocationBadge = (payment: CustomerPaymentReceive) => {
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Payment Receive Details
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p>Loading payment details...</p>
                        </div>
                    </div>
                ) : payment ? (
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="allocations">Allocations</TabsTrigger>
                            <TabsTrigger value="workflow">Workflow</TabsTrigger>
                            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Payment Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Payment Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Payment Number:</span>
                                            <p className="font-mono">{payment.payment_number}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Reference Number:</span>
                                            <p>{payment.reference_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Payment Date:</span>
                                            <p className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(payment.payment_date)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Payment Method:</span>
                                            <p className="flex items-center gap-1">
                                                <CreditCard className="h-3 w-3" />
                                                {payment.paymentMethod?.name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Bank Reference:</span>
                                            <p>{payment.bank_reference || 'N/A'}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Customer Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Customer Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Customer Name:</span>
                                            <p className="font-medium">{payment.customer?.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Customer Code:</span>
                                            <p className="font-mono">{payment.customer?.customer_code}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                                            <p>{payment.customer?.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Email:</span>
                                            <p>{payment.customer?.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">AR Balance:</span>
                                            <p className="font-medium text-orange-600">
                                                {formatCurrency(payment.customer?.current_ar_balance || 0)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Amount Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Amount Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold">{formatCurrency(payment.total_amount)}</p>
                                            <p className="text-sm text-muted-foreground">Total Amount</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">{formatCurrency(payment.allocated_amount)}</p>
                                            <p className="text-sm text-muted-foreground">Allocated Amount</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-orange-600">{formatCurrency(payment.unallocated_amount)}</p>
                                            <p className="text-sm text-muted-foreground">Unallocated Amount</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Payment Status:</span>
                                        {getStatusBadge(payment.status, payment.workflow_status)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Allocation Status:</span>
                                        {getAllocationBadge(payment)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Requires Approval:</span>
                                        <Badge variant={payment.requires_approval ? "secondary" : "outline"}>
                                            {payment.requires_approval ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {payment.notes && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">{payment.notes}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="allocations" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Allocations</CardTitle>
                                    <CardDescription>
                                        How this payment has been allocated to outstanding sales
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {payment.allocations && payment.allocations.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Sale Number</TableHead>
                                                    <TableHead>Allocated Amount</TableHead>
                                                    <TableHead>Allocation Type</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Allocated By</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {payment.allocations.map((allocation: PaymentAllocation) => (
                                                    <TableRow key={allocation.id}>
                                                        <TableCell className="font-mono">
                                                            {allocation.sale?.sale_number}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {formatCurrency(allocation.allocated_amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {allocation.allocation_type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={
                                                                allocation.status === 'applied' ? 'default' :
                                                                    allocation.status === 'pending' ? 'secondary' :
                                                                        'destructive'
                                                            }>
                                                                {allocation.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatDate(allocation.allocation_date)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {allocation.allocatedBy?.name}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-8">
                                            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-muted-foreground">No allocations found</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="workflow" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Workflow History</CardTitle>
                                    <CardDescription>
                                        Payment verification and approval workflow
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Verification */}
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${payment.verified_at ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {payment.verified_at ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">Verification</p>
                                            {payment.verified_at ? (
                                                <div className="text-sm text-muted-foreground">
                                                    <p>Verified by {payment.verifiedBy?.name}</p>
                                                    <p>{formatDate(payment.verified_at)}</p>
                                                    {payment.verification_notes && (
                                                        <p className="mt-1 italic">"{payment.verification_notes}"</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Pending verification</p>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Approval */}
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${payment.approved_at ? 'bg-green-100 text-green-600' :
                                            payment.rejected_at ? 'bg-red-100 text-red-600' :
                                                'bg-gray-100 text-gray-400'
                                            }`}>
                                            {payment.approved_at ? <CheckCircle className="h-4 w-4" /> :
                                                payment.rejected_at ? <XCircle className="h-4 w-4" /> :
                                                    <Clock className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">Approval</p>
                                            {payment.approved_at ? (
                                                <div className="text-sm text-muted-foreground">
                                                    <p>Approved by {payment.approvedBy?.name}</p>
                                                    <p>{formatDate(payment.approved_at)}</p>
                                                    {payment.approval_notes && (
                                                        <p className="mt-1 italic">"{payment.approval_notes}"</p>
                                                    )}
                                                </div>
                                            ) : payment.rejected_at ? (
                                                <div className="text-sm text-red-600">
                                                    <p>Rejected</p>
                                                    <p>{formatDate(payment.rejected_at)}</p>
                                                    {payment.rejection_reason && (
                                                        <p className="mt-1 italic">"{payment.rejection_reason}"</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    {payment.requires_approval ? 'Pending approval' : 'No approval required'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="audit" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Audit Trail</CardTitle>
                                    <CardDescription>
                                        Creation and modification history
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Created:</span>
                                        <p>{formatDate(payment.created_at)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            by {payment.processedBy?.name}
                                        </p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                                        <p>{formatDate(payment.updated_at)}</p>
                                    </div>
                                    {payment.metadata && (
                                        <>
                                            <Separator />
                                            <div>
                                                <span className="text-sm font-medium text-muted-foreground">Additional Data:</span>
                                                <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                                                    {JSON.stringify(payment.metadata, null, 2)}
                                                </pre>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Payment not found</p>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                    {payment && onEdit && (
                        <Button variant="outline" onClick={() => onEdit(payment)}>
                            Edit Payment
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
