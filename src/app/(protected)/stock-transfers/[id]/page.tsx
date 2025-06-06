"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRightLeft, Clock, CheckCircle, XCircle, Truck, Package, User, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useStockTransfer } from "@/hooks/use-warehouses"
import { TRANSFER_STATUSES } from "@/types/warehouse"
import { formatCurrency } from "@/lib/utils"

export default function StockTransferDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const transferId = parseInt(params.id as string)

    const { data: transferData, isLoading } = useStockTransfer(transferId)
    const transfer = transferData?.data

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <Clock className="h-4 w-4" />
            case 'pending_approval':
                return <Clock className="h-4 w-4" />
            case 'approved':
                return <CheckCircle className="h-4 w-4" />
            case 'in_transit':
                return <Truck className="h-4 w-4" />
            case 'received':
                return <CheckCircle className="h-4 w-4" />
            case 'cancelled':
                return <XCircle className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: string) => {
        const statusConfig = TRANSFER_STATUSES.find(s => s.value === status)
        return statusConfig?.color || 'gray'
    }

    const handleApprove = () => {
        // TODO: Implement approve functionality
        console.log('Approve transfer:', transferId)
    }

    const handleShip = () => {
        // TODO: Implement ship functionality
        console.log('Ship transfer:', transferId)
    }

    const handleReceive = () => {
        // TODO: Implement receive functionality
        console.log('Receive transfer:', transferId)
    }

    const handleCancel = () => {
        // TODO: Implement cancel functionality
        console.log('Cancel transfer:', transferId)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        )
    }

    if (!transfer) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Transfer not found</h3>
                <p className="text-muted-foreground mb-4">
                    The requested stock transfer could not be found.
                </p>
                <Button onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{transfer.transfer_number}</h1>
                    <p className="text-muted-foreground">
                        Stock Transfer Details
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusIcon(transfer.status)}
                    <Badge
                        variant={getStatusColor(transfer.status) === 'green' ? 'default' : 'secondary'}
                        className={`
                            ${getStatusColor(transfer.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                            ${getStatusColor(transfer.status) === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                            ${getStatusColor(transfer.status) === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : ''}
                            ${getStatusColor(transfer.status) === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                        `}
                    >
                        {TRANSFER_STATUSES.find(s => s.value === transfer.status)?.label}
                    </Badge>
                </div>
            </div>

            {/* Transfer Overview */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowRightLeft className="h-5 w-5" />
                            Transfer Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">From Warehouse:</span>
                            <span className="font-medium">{transfer.from_warehouse?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">To Warehouse:</span>
                            <span className="font-medium">{transfer.to_warehouse?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Value:</span>
                            <span className="font-bold text-lg">{formatCurrency(transfer.total_value)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Items:</span>
                            <span className="font-medium">{transfer.total_items} items</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Quantity:</span>
                            <span className="font-medium">{transfer.total_quantity} units</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Requested Date:</span>
                            <span className="font-medium">
                                {new Date(transfer.requested_date).toLocaleDateString()}
                            </span>
                        </div>
                        {transfer.expected_delivery_date && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Expected Delivery:</span>
                                <span className="font-medium">
                                    {new Date(transfer.expected_delivery_date).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {transfer.approved_date && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Approved Date:</span>
                                <span className="font-medium">
                                    {new Date(transfer.approved_date).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {transfer.shipped_date && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Shipped Date:</span>
                                <span className="font-medium">
                                    {new Date(transfer.shipped_date).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {transfer.received_date && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Received Date:</span>
                                <span className="font-medium">
                                    {new Date(transfer.received_date).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* People & Notes */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            People
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Requested By:</span>
                            <span className="font-medium">{transfer.requested_by_user?.name}</span>
                        </div>
                        {transfer.approved_by_user && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Approved By:</span>
                                <span className="font-medium">{transfer.approved_by_user.name}</span>
                            </div>
                        )}
                        {transfer.shipped_by_user && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Shipped By:</span>
                                <span className="font-medium">{transfer.shipped_by_user.name}</span>
                            </div>
                        )}
                        {transfer.received_by_user && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Received By:</span>
                                <span className="font-medium">{transfer.received_by_user.name}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {transfer.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{transfer.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Transfer Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Transfer Items
                    </CardTitle>
                    <CardDescription>
                        Items included in this transfer
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {transfer.items && transfer.items.length > 0 ? (
                        <div className="space-y-4">
                            {transfer.items.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">
                                                {item.product?.name || `Product ID: ${item.product_id}`}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                SKU: {item.product?.sku || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">
                                                {item.requested_quantity} {item.unit?.name || 'units'}
                                            </div>
                                            {item.shipped_quantity && (
                                                <div className="text-sm text-muted-foreground">
                                                    Shipped: {item.shipped_quantity}
                                                </div>
                                            )}
                                            {item.received_quantity && (
                                                <div className="text-sm text-muted-foreground">
                                                    Received: {item.received_quantity}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {item.notes && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Notes: {item.notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No items found for this transfer.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 flex-wrap">
                        {transfer.status === 'pending_approval' && (
                            <>
                                <Button onClick={handleApprove}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve Transfer
                                </Button>
                                <Button variant="outline" onClick={handleCancel}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Transfer
                                </Button>
                            </>
                        )}
                        {transfer.status === 'approved' && (
                            <>
                                <Button onClick={handleShip}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Mark as Shipped
                                </Button>
                                <Button variant="outline" onClick={handleCancel}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Transfer
                                </Button>
                            </>
                        )}
                        {transfer.status === 'in_transit' && (
                            <Button onClick={handleReceive}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Received
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => router.push('/stock-transfers')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Transfers
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 