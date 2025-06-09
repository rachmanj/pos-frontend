"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCustomerPaymentReceive } from "@/hooks/useCustomerPaymentReceive"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    FileText,
    CreditCard,
    DollarSign,
    User,
    Calendar,
    Info,
    AlertCircle
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"

const verificationSchema = z.object({
    verification_notes: z.string().min(10, "Verification notes must be at least 10 characters"),
    document_verified: z.boolean().refine(val => val === true, "Document verification is required"),
    amount_verified: z.boolean().refine(val => val === true, "Amount verification is required"),
    customer_verified: z.boolean().refine(val => val === true, "Customer verification is required"),
    payment_method_verified: z.boolean().refine(val => val === true, "Payment method verification is required"),
    reference_verified: z.boolean().optional(),
    additional_checks: z.array(z.string()).optional(),
})

type VerificationFormData = z.infer<typeof verificationSchema>

interface VerificationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    paymentId: number
    paymentData: any
    onSuccess: () => void
}

interface VerificationCheck {
    id: string
    label: string
    description: string
    required: boolean
    icon: React.ComponentType<{ className?: string }>
    status: 'pending' | 'verified' | 'failed'
}

export function VerificationDialog({
    open,
    onOpenChange,
    paymentId,
    paymentData,
    onSuccess
}: VerificationDialogProps) {
    const [verificationChecks, setVerificationChecks] = useState<VerificationCheck[]>([
        {
            id: 'document_verified',
            label: 'Document Verification',
            description: 'Verify payment receipt, bank statement, or transaction proof',
            required: true,
            icon: FileText,
            status: 'pending'
        },
        {
            id: 'amount_verified',
            label: 'Amount Verification',
            description: 'Confirm payment amount matches the recorded amount',
            required: true,
            icon: DollarSign,
            status: 'pending'
        },
        {
            id: 'customer_verified',
            label: 'Customer Verification',
            description: 'Verify customer identity and authorization',
            required: true,
            icon: User,
            status: 'pending'
        },
        {
            id: 'payment_method_verified',
            label: 'Payment Method Verification',
            description: 'Confirm payment method and transaction details',
            required: true,
            icon: CreditCard,
            status: 'pending'
        },
        {
            id: 'reference_verified',
            label: 'Reference Verification',
            description: 'Verify bank reference or transaction ID (if applicable)',
            required: false,
            icon: CheckCircle2,
            status: 'pending'
        }
    ])

    const [additionalChecks, setAdditionalChecks] = useState<string[]>([])
    const [showAdvancedChecks, setShowAdvancedChecks] = useState(false)

    const { verifyPaymentReceive } = useCustomerPaymentReceive()

    const form = useForm<VerificationFormData>({
        resolver: zodResolver(verificationSchema),
        defaultValues: {
            verification_notes: '',
            document_verified: false,
            amount_verified: false,
            customer_verified: false,
            payment_method_verified: false,
            reference_verified: false,
            additional_checks: [],
        },
    })

    const handleCheckChange = (checkId: string, verified: boolean) => {
        setVerificationChecks(prev => prev.map(check =>
            check.id === checkId
                ? { ...check, status: verified ? 'verified' : 'pending' }
                : check
        ))

        // Update form field
        form.setValue(checkId as keyof VerificationFormData, verified)
    }

    const addAdditionalCheck = () => {
        const checkName = prompt("Enter additional verification check:")
        if (checkName && checkName.trim()) {
            setAdditionalChecks(prev => [...prev, checkName.trim()])
        }
    }

    const removeAdditionalCheck = (index: number) => {
        setAdditionalChecks(prev => prev.filter((_, i) => i !== index))
    }

    const getVerificationProgress = () => {
        const requiredChecks = verificationChecks.filter(check => check.required)
        const verifiedRequired = requiredChecks.filter(check => check.status === 'verified')
        return {
            completed: verifiedRequired.length,
            total: requiredChecks.length,
            percentage: (verifiedRequired.length / requiredChecks.length) * 100
        }
    }

    const canProceedWithVerification = () => {
        const progress = getVerificationProgress()
        return progress.completed === progress.total
    }

    const onSubmit = async (data: VerificationFormData) => {
        try {
            if (!canProceedWithVerification()) {
                toast.error("Please complete all required verification checks")
                return
            }

            await verifyPaymentReceive.mutateAsync({
                id: paymentId,
                notes: data.verification_notes,
            })

            toast.success("Payment verification completed successfully")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error('Error verifying payment:', error)
            toast.error("Failed to verify payment")
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-600" />
            default:
                return <AlertCircle className="h-4 w-4 text-orange-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified':
                return 'border-green-200 bg-green-50'
            case 'failed':
                return 'border-red-200 bg-red-50'
            default:
                return 'border-orange-200 bg-orange-50'
        }
    }

    const progress = getVerificationProgress()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" />
                        Payment Verification
                    </DialogTitle>
                    <DialogDescription>
                        Verify payment #{paymentData?.payment_number} for {formatCurrency(paymentData?.total_amount || 0)}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Payment Summary */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Payment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Payment Number</p>
                                        <p className="font-medium">{paymentData?.payment_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Customer</p>
                                        <p className="font-medium">{paymentData?.customer?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Amount</p>
                                        <p className="font-medium text-lg">{formatCurrency(paymentData?.total_amount || 0)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Payment Date</p>
                                        <p className="font-medium">{formatDate(paymentData?.payment_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Payment Method</p>
                                        <p className="font-medium">{paymentData?.paymentMethod?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Reference</p>
                                        <p className="font-medium">{paymentData?.reference_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Bank Reference</p>
                                        <p className="font-medium">{paymentData?.bank_reference || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <Badge variant="outline" className="capitalize">
                                            {paymentData?.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Verification Progress */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Verification Progress
                                </CardTitle>
                                <CardDescription>
                                    Complete all required verification checks to proceed
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">
                                            Progress: {progress.completed}/{progress.total} checks completed
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {progress.percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {!canProceedWithVerification() && (
                                    <Alert className="mb-4">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            Please complete all required verification checks before proceeding.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Verification Checklist */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Verification Checklist</CardTitle>
                                <CardDescription>
                                    Complete each verification step by checking the boxes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {verificationChecks.map((check) => {
                                        const IconComponent = check.icon
                                        return (
                                            <div
                                                key={check.id}
                                                className={`p-4 border rounded-lg transition-all ${getStatusColor(check.status)}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <IconComponent className="h-5 w-5" />
                                                        {getStatusIcon(check.status)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium">{check.label}</h4>
                                                            {check.required && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    Required
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-3">
                                                            {check.description}
                                                        </p>
                                                        <FormField
                                                            control={form.control}
                                                            name={check.id as keyof VerificationFormData}
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value as boolean}
                                                                            onCheckedChange={(checked) => {
                                                                                field.onChange(checked)
                                                                                handleCheckChange(check.id, checked as boolean)
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none">
                                                                        <FormLabel className="text-sm">
                                                                            I have verified this requirement
                                                                        </FormLabel>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Additional Checks */}
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium">Additional Verification Checks</h4>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAdvancedChecks(!showAdvancedChecks)}
                                        >
                                            {showAdvancedChecks ? 'Hide' : 'Show'} Advanced
                                        </Button>
                                    </div>

                                    {showAdvancedChecks && (
                                        <div className="space-y-3">
                                            {additionalChecks.map((check, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                                    <Checkbox />
                                                    <span className="flex-1 text-sm">{check}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeAdditionalCheck(index)}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addAdditionalCheck}
                                                className="w-full"
                                            >
                                                Add Custom Check
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Verification Notes */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Verification Notes</CardTitle>
                                <CardDescription>
                                    Document your verification process and any important observations
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="verification_notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Detailed Verification Notes *</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Document the verification process, checks performed, documents reviewed, and any observations or concerns..."
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <p className="text-xs text-muted-foreground">
                                                Minimum 10 characters required. Be specific about verification steps taken.
                                            </p>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Risk Assessment */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Risk Assessment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                        <p className="font-medium text-green-800">Low Risk</p>
                                        <p className="text-xs text-green-600">All checks verified</p>
                                    </div>
                                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                                        <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                        <p className="font-medium text-orange-800">Medium Risk</p>
                                        <p className="text-xs text-orange-600">Some checks pending</p>
                                    </div>
                                    <div className="text-center p-3 bg-red-50 rounded-lg">
                                        <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                                        <p className="font-medium text-red-800">High Risk</p>
                                        <p className="text-xs text-red-600">Failed verification</p>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Current Risk Level:</strong> {
                                            canProceedWithVerification() ? 'Low Risk' :
                                                progress.percentage > 50 ? 'Medium Risk' : 'High Risk'
                                        }
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={verifyPaymentReceive.isPending || !canProceedWithVerification()}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {verifyPaymentReceive.isPending ? 'Verifying...' : 'Complete Verification'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
