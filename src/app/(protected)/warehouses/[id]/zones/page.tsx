"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Package, Thermometer, Droplets, MapPin, Edit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useWarehouse, useWarehouseZones, useCreateWarehouseZone } from "@/hooks/use-warehouses"
import { ZONE_TYPES, WarehouseZone } from "@/types/warehouse"
import { useState } from "react"

export default function WarehouseZonesPage() {
    const params = useParams()
    const router = useRouter()
    const warehouseId = parseInt(params.id as string)
    const [editingZone, setEditingZone] = useState<WarehouseZone | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        zone_type: 'general',
        status: 'active',
        capacity_cubic_meters: '',
        description: ''
    })

    const { data: warehouse, isLoading: warehouseLoading } = useWarehouse(warehouseId)
    const { data: zones, isLoading: zonesLoading } = useWarehouseZones(warehouseId)
    const createZoneMutation = useCreateWarehouseZone()

    const handleEditZone = (zone: WarehouseZone) => {
        setEditingZone(zone)
        setFormData({
            name: zone.name || '',
            code: zone.code || '',
            zone_type: zone.zone_type || 'general',
            status: zone.status || 'active',
            capacity_cubic_meters: zone.capacity_cubic_meters?.toString() || '',
            description: zone.description || ''
        })
    }

    const handleSaveZone = async () => {
        if (!editingZone) return

        try {
            if (editingZone.id === 0) {
                // Creating new zone
                await createZoneMutation.mutateAsync({
                    warehouse_id: warehouseId,
                    name: formData.name,
                    code: formData.code || undefined,
                    zone_type: formData.zone_type as any,
                    status: formData.status as any,
                    capacity_cubic_meters: formData.capacity_cubic_meters ? Number(formData.capacity_cubic_meters) : undefined,
                    description: formData.description || undefined
                })
            } else {
                // TODO: Implement update zone functionality
                console.log('Update zone:', formData)
            }
            setEditingZone(null)
        } catch (error) {
            console.error('Error saving zone:', error)
        }
    }

    const handleViewStock = (zone: WarehouseZone) => {
        // Navigate to products page filtered by this warehouse and zone
        router.push(`/inventory/products?warehouse_id=${warehouseId}&zone_id=${zone.id}`)
    }

    if (warehouseLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        )
    }

    if (!warehouse) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-red-500 mb-4">
                    <p>Warehouse not found</p>
                </div>
                <Button onClick={() => router.back()}>
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
                    Back to Warehouse
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Zones - {warehouse.name}
                    </h1>
                    <p className="text-muted-foreground">
                        Manage storage zones and their configurations
                    </p>
                </div>
                <Button onClick={() => handleEditZone({
                    id: 0,
                    warehouse_id: warehouseId,
                    code: '',
                    name: '',
                    description: '',
                    zone_type: 'general',
                    status: 'active',
                    created_at: '',
                    updated_at: ''
                } as WarehouseZone)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Zone
                </Button>
            </div>

            {/* Zones Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {zonesLoading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : zones && zones.length > 0 ? (
                    zones.map((zone) => (
                        <Card key={zone.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{zone.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {zone.code}
                                        </p>
                                    </div>
                                    <Badge variant={zone.status === 'active' ? "default" : "secondary"}>
                                        {zone.status?.charAt(0).toUpperCase() + zone.status?.slice(1) || "Unknown"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Zone Type</p>
                                    <p>{ZONE_TYPES.find(type => type.value === zone.zone_type)?.label || zone.zone_type}</p>
                                </div>

                                {zone.description && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                                        <p className="text-sm">{zone.description}</p>
                                    </div>
                                )}

                                {zone.capacity_cubic_meters && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                                        <p className="text-sm">{zone.capacity_cubic_meters.toLocaleString()} m³</p>
                                    </div>
                                )}

                                {(zone.temperature_min || zone.temperature_max) && (
                                    <div className="flex items-center gap-2">
                                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {zone.temperature_min}°C - {zone.temperature_max}°C
                                        </span>
                                    </div>
                                )}

                                {(zone.humidity_min || zone.humidity_max) && (
                                    <div className="flex items-center gap-2">
                                        <Droplets className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {zone.humidity_min}% - {zone.humidity_max}% RH
                                        </span>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEditZone(zone)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Zone
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleViewStock(zone)}
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Stock
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full">
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No zones found</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Create storage zones to organize your warehouse inventory.
                                </p>
                                <Button onClick={() => handleEditZone({
                                    id: 0,
                                    warehouse_id: warehouseId,
                                    code: '',
                                    name: '',
                                    description: '',
                                    zone_type: 'general',
                                    status: 'active',
                                    created_at: '',
                                    updated_at: ''
                                } as WarehouseZone)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Zone
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Edit Zone Dialog */}
            {editingZone && (
                <Dialog open={!!editingZone} onOpenChange={(open) => !open && setEditingZone(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingZone.id === 0 ? 'Add New Zone' : `Edit Zone - ${editingZone.name}`}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="code" className="text-right">
                                    Code
                                </Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">
                                    Type
                                </Label>
                                <Select
                                    value={formData.zone_type}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, zone_type: value }))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ZONE_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Status
                                </Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="capacity" className="text-right">
                                    Capacity (m³)
                                </Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    value={formData.capacity_cubic_meters}
                                    onChange={(e) => setFormData(prev => ({ ...prev, capacity_cubic_meters: e.target.value }))}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingZone(null)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveZone}
                                disabled={createZoneMutation.isPending || !formData.name.trim()}
                            >
                                {createZoneMutation.isPending ? 'Saving...' :
                                    editingZone?.id === 0 ? 'Create Zone' : 'Save Changes'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
} 