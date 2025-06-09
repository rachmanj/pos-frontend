"use client"

import { useState } from "react"
import { useCustomerPaymentReceive } from "@/hooks/useCustomerPaymentReceive"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    User,
    Calendar,
    DollarSign,
    CreditCard,
    Shield,
    Loader2
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface ApprovalDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    paymentId: number | null
    onSuccess?: () => void
}

export function ApprovalDialog({ open, onOpenChange, paymentId, onSuccess }: ApprovalDialogProps) {
    const [approvalNotes, setApprovalNotes] = useState("")
    const [rejectionReason, setRejectionReason] = useState("")
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)

    const {
        usePaymentReceive,
        approvePaymentReceive,
        rejectPaymentReceive
    } = useCustomerPaymentReceive()

    const { data: payment } = usePaymentReceive(paymentId || 0, { enabled: !!paymentId })

    const handleApprove = async () => {
        if (!paymentId) return

        setIsApproving(true)
        try {
            await approvePaymentReceive.mutateAsync({
                paymentId,
                approval_notes: approvalNotes.trim() || undefined
            })

            toast.success("Payment approved successfully")
            onSuccess?.()
            onOpenChange(false)
            setApprovalNotes("")
        } catch (error) {
            toast.error("Failed to approve payment")
        } finally {
            setIsApproving(false)
        }
    }

    const handleReject = async () => {
        if (!paymentId) return

        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection")
            return
        }

        setIsRejecting(true)
        try {
            await rejectPaymentReceive.mutateAsync({
                paymentId,
                rejection_reason: rejectionReason.trim()
            })

            toast.success("Payment rejected")
            onSuccess?.()
            onOpenChange(false)
            setRejectionReason("")
        } catch (error) {
            toast.error("Failed to reject payment")
        } finally {
            setIsRejecting(false)
        }
    }

    if (!paymentId || !payment) return null

    const canApprove = payment.workflow_status === 'pending_approval'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Approve Payment Receive
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Payment Number:</span>
                                    <p className="font-mono">{payment.payment_number}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Amount:</span>
                                    <p className="font-bold text-lg">{formatCurrency(payment.total_amount)}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Customer:</span>
                                    <p className="font-medium">{payment.customer?.name}</p>
                                    <p className="text-sm text-muted-foreground">{payment.customer?.customer_code}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Payment Date:</span>
                                    <p className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(payment.payment_date)}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Payment Method:</span>
                                    <p className="flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        {payment.paymentMethod?.name}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Reference:</span>
                                    <p>{payment.reference_number || 'N/A'}</p>
                                </div>
                            </div>
                            {payment.bank_reference && (
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Bank Reference:</span>
                                    <p className="font-mono">{payment.bank_reference}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Current Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Current Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Workflow Status:</span>
                                <Badge variant={
                                    payment.workflow_status === 'pending_approval' ? 'secondary' :
                                        payment.workflow_status === 'approved' ? 'default' :
                                            payment.workflow_status === 'rejected' ? 'destructive' :
                                                'outline'
                                }>
                                    {payment.workflow_status.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                            {payment.workflow_status === 'pending_approval' && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="flex items-center gap-2 text-blue-800">
                                        <Shield className="h-4 w-4" />
                                        <span className="text-sm font-medium">Pending Approval</span>
                                    </div>
                                    <p className="text-sm text-blue-700 mt-1">
                                        This payment has been verified and requires approval before processing.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Verification Information */}
                    {payment.verified_at && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Verification Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Verified By:</span>
                                    <p className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {payment.verifiedBy?.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(payment.verified_at)}
                                    </p>
                                </div>
                                {payment.verification_notes && (
                                    <>
                                        <Separator />
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Verification Notes:</span>
                                            <p className="text-sm bg-gray-50 p-2 rounded mt-1">{payment.verification_notes}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Processing Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Processing Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Processed By:</span>
                                <p className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {payment.processedBy?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(payment.created_at)}
                                </p>
                            </div>
                            {payment.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Processing Notes:</span>
                                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">{payment.notes}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Customer Risk Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Current AR Balance:</span>
                                    <p className="font-medium text-orange-600">
                                        {formatCurrency(payment.customer?.current_ar_balance || 0)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Payment Impact:</span>
                                    <p className="font-medium text-green-600">
                                        -{formatCurrency(payment.total_amount)}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">New AR Balance (after payment):</span>
                                <p className="font-bold text-lg">
                                    {formatCurrency((payment.customer?.current_ar_balance || 0) - payment.total_amount)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {canApprove ? (
                        <>
                            {/* Approval Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Approval</CardTitle>
                                    <CardDescription>
                                        Add approval notes (optional) and approve the payment
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="approval-notes">Approval Notes</Label>
                                        <Textarea
                                            id="approval-notes"
                                            placeholder="Add any approval notes or conditions..."
                                            value={approvalNotes}
                                            onChange={(e) => setApprovalNotes(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Rejection Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base text-red-600">Rejection</CardTitle>
                                    <CardDescription>
                                        If there are issues with this payment, provide a reason and reject it
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                        <Textarea
                                            id="rejection-reason"
                                            placeholder="Explain why this payment is being rejected..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-8">
                                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    This payment is not in a state that can be approved
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Current status: {payment.workflow_status.replace('_', ' ')}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isApproving || isRejecting}
                    >
                        Cancel
                    </Button>
                    {canApprove && (
                        <>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={isApproving || isRejecting || !rejectionReason.trim()}
                            >
                                {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                            <Button
                                onClick={handleApprove}
                                disabled={isApproving || isRejecting}
                            >
                                {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve Payment
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 