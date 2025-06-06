"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useWarehouses, useCreateStockTransfer } from "@/hooks/use-warehouses"
import { StockTransferFormData } from "@/types/warehouse"

export default function NewStockTransferPage() {
    const router = useRouter()
    const { data: warehousesData } = useWarehouses()
    const warehouses = warehousesData?.data || []
    const createTransferMutation = useCreateStockTransfer()

    const [formData, setFormData] = useState<Partial<StockTransferFormData>>({
        from_warehouse_id: 0,
        to_warehouse_id: 0,
        expected_delivery_date: '',
        notes: '',
        items: []
    })

    const [newItem, setNewItem] = useState({
        product_id: 0,
        requested_quantity: 1,
        notes: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.from_warehouse_id || !formData.to_warehouse_id || !formData.items?.length) {
            alert('Please fill all required fields and add at least one item')
            return
        }

        try {
            const result = await createTransferMutation.mutateAsync(formData as StockTransferFormData)
            if (result.success) {
                router.push('/stock-transfers')
            } else {
                alert('Failed to create transfer')
            }
        } catch (error) {
            console.error('Error creating transfer:', error)
            alert('Failed to create transfer')
        }
    }

    const addItem = () => {
        if (!newItem.product_id || !newItem.requested_quantity) {
            alert('Please fill item details')
            return
        }

        setFormData(prev => ({
            ...prev,
            items: [...(prev.items || []), { ...newItem }]
        }))

        setNewItem({
            product_id: 0,
            requested_quantity: 1,
            notes: ''
        })
    }

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items?.filter((_, i) => i !== index) || []
        }))
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

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Stock Transfer</h1>
                <p className="text-muted-foreground">
                    Move inventory between warehouses
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Transfer Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transfer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="from_warehouse">From Warehouse *</Label>
                                <Select
                                    value={formData.from_warehouse_id?.toString()}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, from_warehouse_id: parseInt(value) }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((warehouse) => (
                                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                {warehouse.name} ({warehouse.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="to_warehouse">To Warehouse *</Label>
                                <Select
                                    value={formData.to_warehouse_id?.toString()}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, to_warehouse_id: parseInt(value) }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses
                                            .filter(w => w.id !== formData.from_warehouse_id)
                                            .map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                    {warehouse.name} ({warehouse.code})
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                                <Input
                                    id="expected_delivery_date"
                                    type="date"
                                    value={formData.expected_delivery_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes for this transfer..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transfer Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Add Item Form */}
                        <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                            <div>
                                <Label>Product ID</Label>
                                <Input
                                    type="number"
                                    value={newItem.product_id || ''}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, product_id: parseInt(e.target.value) || 0 }))}
                                    placeholder="Product ID"
                                />
                            </div>
                            <div>
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    value={newItem.requested_quantity}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, requested_quantity: parseInt(e.target.value) || 1 }))}
                                    min="1"
                                />
                            </div>
                            <div>
                                <Label>Notes</Label>
                                <Input
                                    value={newItem.notes}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Item notes"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button type="button" onClick={addItem} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>
                        </div>

                        {/* Items List */}
                        {formData.items && formData.items.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium">Items to Transfer:</h4>
                                {formData.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <span className="font-medium">Product ID: {item.product_id}</span>
                                            <span className="mx-2">•</span>
                                            <span>Qty: {item.requested_quantity}</span>
                                            {item.notes && (
                                                <>
                                                    <span className="mx-2">•</span>
                                                    <span className="text-muted-foreground">{item.notes}</span>
                                                </>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(!formData.items || formData.items.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground">
                                No items added yet. Add items using the form above.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={createTransferMutation.isPending || !formData.from_warehouse_id || !formData.to_warehouse_id || !formData.items?.length}
                    >
                        {createTransferMutation.isPending ? 'Creating...' : 'Create Transfer'}
                    </Button>
                </div>
            </form>
        </div>
    )
} 