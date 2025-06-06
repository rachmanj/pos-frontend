"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, ArrowRightLeft, Clock, CheckCircle, XCircle, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useStockTransfers } from "@/hooks/use-warehouses"
import { StockTransferFilters, TRANSFER_STATUSES } from "@/types/warehouse"
import { formatCurrency } from "@/lib/utils"

export default function StockTransfersPage() {
    const router = useRouter()
    const [filters, setFilters] = useState<StockTransferFilters>({})

    const { data: transfersData, isLoading } = useStockTransfers(filters)
    const transfers = transfersData?.data || []

    const handleNewTransfer = () => {
        router.push('/stock-transfers/new')
    }

    const handleViewDetails = (transferId: number) => {
        router.push(`/stock-transfers/${transferId}`)
    }

    const handleApprove = (transferId: number) => {
        // TODO: Implement approve functionality
        console.log('Approve transfer:', transferId)
    }

    const handleShip = (transferId: number) => {
        // TODO: Implement ship functionality
        console.log('Ship transfer:', transferId)
    }

    const handleReceive = (transferId: number) => {
        // TODO: Implement receive functionality
        console.log('Receive transfer:', transferId)
    }

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Stock Transfers</h1>
                    <p className="text-muted-foreground">
                        Manage inter-warehouse stock transfers and track shipments
                    </p>
                </div>
                <Button onClick={handleNewTransfer}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Transfer
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{transfers.length}</div>
                        <p className="text-xs text-muted-foreground">
                            All time transfers
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {transfers.filter(t => t.status === 'pending_approval').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {transfers.filter(t => t.status === 'in_transit').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Currently shipping
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(transfers.reduce((sum, t) => sum + (t.total_value || 0), 0))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total transfer value
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Transfers List */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transfers</CardTitle>
                    <CardDescription>
                        Track and manage your warehouse-to-warehouse transfers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : transfers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <ArrowRightLeft className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No transfers found</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Create your first stock transfer to move inventory between warehouses.
                            </p>
                            <Button onClick={handleNewTransfer}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Transfer
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transfers.map((transfer) => (
                                <div
                                    key={transfer.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900">
                                            {getStatusIcon(transfer.status)}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-semibold">{transfer.transfer_number}</h4>
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
                                            <p className="text-sm text-muted-foreground">
                                                From: {transfer.from_warehouse?.name} → To: {transfer.to_warehouse?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Requested: {new Date(transfer.requested_date).toLocaleDateString()}
                                                {transfer.expected_delivery_date && (
                                                    <span> • Expected: {new Date(transfer.expected_delivery_date).toLocaleDateString()}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-semibold">{formatCurrency(transfer.total_value)}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {transfer.total_items} items • {transfer.total_quantity} units
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            By: {transfer.requested_by_user?.name}
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(transfer.id)}
                                        >
                                            View Details
                                        </Button>
                                        {transfer.status === 'pending_approval' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(transfer.id)}
                                            >
                                                Approve
                                            </Button>
                                        )}
                                        {transfer.status === 'approved' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleShip(transfer.id)}
                                            >
                                                Ship
                                            </Button>
                                        )}
                                        {transfer.status === 'in_transit' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleReceive(transfer.id)}
                                            >
                                                Receive
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 