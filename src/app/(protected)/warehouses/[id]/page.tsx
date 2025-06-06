"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Building2, Package, BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useWarehouse } from "@/hooks/use-warehouses"
import { formatCurrency } from "@/lib/utils"

export default function WarehouseDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const warehouseId = parseInt(params.id as string)

    const { data: warehouse, isLoading, error } = useWarehouse(warehouseId)

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        )
    }

    if (error || !warehouse) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-red-500 mb-4">
                    <p>Error loading warehouse details</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        {error?.message || "Warehouse not found"}
                    </p>
                </div>
                <Button onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        )
    }

    const isActive = warehouse.status === 'active'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Warehouses
                </Button>
            </div>

            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
                        <p className="text-muted-foreground">
                            {warehouse.code} • {warehouse.type?.charAt(0).toUpperCase() + warehouse.type?.slice(1)} Warehouse
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={isActive ? "default" : "secondary"}>
                        {warehouse.status?.charAt(0).toUpperCase() + warehouse.status?.slice(1)}
                    </Badge>
                    {warehouse.is_default && (
                        <Badge variant="outline">Default</Badge>
                    )}
                    <Button>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Warehouse
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Number(warehouse.total_zones) || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {Number(warehouse.active_zones_count) || 0} active zones
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(Number(warehouse.total_stock_value) || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {Number(warehouse.total_products) || 0} different products
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Capacity</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {warehouse.max_capacity ? Number(warehouse.max_capacity).toLocaleString() : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {warehouse.utilization_percentage ? warehouse.utilization_percentage.toFixed(1) : '0.0'}% utilized
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Number(warehouse.low_stock_count) || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Items below minimum
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Basic Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Warehouse Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                <p className="mt-1">{warehouse.description || 'No description provided'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Type</label>
                                <p className="mt-1 capitalize">{warehouse.type}</p>
                            </div>
                            {warehouse.address && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                                    <p className="mt-1">{warehouse.address}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {[warehouse.city, warehouse.state, warehouse.postal_code, warehouse.country]
                                            .filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            {warehouse.manager_name && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Manager</label>
                                    <p className="mt-1">{warehouse.manager_name}</p>
                                    {warehouse.manager_phone && (
                                        <p className="text-sm text-muted-foreground">{warehouse.manager_phone}</p>
                                    )}
                                </div>
                            )}
                            {warehouse.phone && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                    <p className="mt-1">{warehouse.phone}</p>
                                </div>
                            )}
                            {warehouse.email && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="mt-1">{warehouse.email}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 