"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Building2, MapPin, Users, Package, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useWarehouses, useWarehouseAnalytics, useCreateWarehouse } from "@/hooks/use-warehouses"
import { WarehouseFilters } from "@/types/warehouse"
import { WarehouseForm } from "@/components/warehouses/warehouse-form"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export default function WarehousesPage() {
    const [filters, setFilters] = useState<WarehouseFilters>({})
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const router = useRouter()

    const { data: warehousesData, isLoading: warehousesLoading, error: warehousesError, refetch } = useWarehouses(filters)
    const { data: analytics, isLoading: analyticsLoading } = useWarehouseAnalytics()
    const createWarehouseMutation = useCreateWarehouse()

    // Ensure warehouses is always an array and add computed properties
    const warehouses = Array.isArray(warehousesData?.data) ? warehousesData.data.map(warehouse => ({
        ...warehouse,
        is_active: warehouse.status === 'active',
        capacity_cubic_meters: warehouse.max_capacity,
        used_capacity: warehouse.current_utilization || 0,
    })) : []

    // Debug logging
    if (warehousesError) {
        console.error("Warehouses fetch error:", warehousesError)
    }

    const handleCreateWarehouse = async (data: any) => {
        try {
            await createWarehouseMutation.mutateAsync(data)
            setIsCreateModalOpen(false)
            refetch()
            toast.success("Warehouse created successfully!")
        } catch (error: any) {
            console.error("Create warehouse error:", error)
            toast.error(error?.message || "Failed to create warehouse")
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Warehouse Management</h1>
                    <p className="text-muted-foreground">
                        Manage your warehouse locations, zones, and inventory distribution
                    </p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Warehouse
                        </Button>
                    </DialogTrigger>
                    <WarehouseForm
                        onSubmit={handleCreateWarehouse}
                        onCancel={() => setIsCreateModalOpen(false)}
                        isLoading={createWarehouseMutation.isPending}
                    />
                </Dialog>
            </div>

            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {analyticsLoading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <div className="text-2xl font-bold">{analytics?.total_warehouses || 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {analytics?.active_warehouses || 0} active locations
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {analyticsLoading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <div className="text-2xl font-bold">
                                {analytics?.total_capacity?.toLocaleString() || 0} units
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {analytics?.used_capacity?.toLocaleString() || 0} units used
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilization</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {analyticsLoading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <div className="text-2xl font-bold">
                                {analytics?.utilization_percentage?.toFixed(1) || 0}%
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Average across all warehouses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {analyticsLoading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <div className="text-2xl font-bold">
                                {formatCurrency(analytics?.total_stock_value || 0)}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Total inventory value
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Warehouses Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {warehousesError ? (
                    <div className="col-span-full">
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <div className="text-red-500 mb-4">
                                    <p>Error loading warehouses</p>
                                    <p className="text-sm text-muted-foreground mt-2">{warehousesError.message}</p>
                                </div>
                                <Button onClick={() => window.location.reload()}>
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : warehousesLoading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : warehouses.length === 0 ? (
                    <div className="col-span-full">
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No warehouses found</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Get started by creating your first warehouse location.
                                </p>
                                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Warehouse
                                        </Button>
                                    </DialogTrigger>
                                    <WarehouseForm
                                        onSubmit={handleCreateWarehouse}
                                        onCancel={() => setIsCreateModalOpen(false)}
                                        isLoading={createWarehouseMutation.isPending}
                                    />
                                </Dialog>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    warehouses.map((warehouse) => (
                        <Card key={warehouse.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                                        <CardDescription className="flex items-center mt-1">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {warehouse.city}, {warehouse.state}
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Badge variant={warehouse.is_active ? "default" : "secondary"}>
                                            {warehouse.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                        {warehouse.is_default && (
                                            <Badge variant="outline" className="text-xs">
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    <p>{warehouse.address}</p>
                                    {warehouse.description && (
                                        <p className="mt-1">{warehouse.description}</p>
                                    )}
                                </div>

                                {warehouse.manager_name && (
                                    <div className="flex items-center text-sm">
                                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>{warehouse.manager_name}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Zones</p>
                                        <p className="font-medium">{warehouse.total_zones || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Utilization</p>
                                        <p className="font-medium">
                                            {warehouse.utilization_percentage?.toFixed(1) || 0}%
                                        </p>
                                    </div>
                                </div>

                                {warehouse.max_capacity && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Capacity</span>
                                            <span>
                                                {warehouse.used_capacity?.toLocaleString() || 0} / {warehouse.max_capacity.toLocaleString()} units
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(warehouse.utilization_percentage || 0, 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => router.push(`/warehouses/${warehouse.id}`)}
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => router.push(`/warehouses/${warehouse.id}/zones`)}
                                    >
                                        Manage Zones
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
} 