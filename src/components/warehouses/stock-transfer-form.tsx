"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Search, Package } from "lucide-react"
import { useWarehouses } from "@/hooks/use-warehouses"
import { useProducts } from "@/hooks/useInventory"
import { Product } from "@/types/inventory"
import { Warehouse } from "@/types/warehouse"

const stockTransferSchema = z.object({
    from_warehouse_id: z.string().min(1, "Source warehouse is required"),
    to_warehouse_id: z.string().min(1, "Destination warehouse is required"),
    reference_number: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
        product_id: z.string().min(1, "Product is required"),
        quantity: z.number().min(0.01, "Quantity must be greater than 0"),
        notes: z.string().optional(),
    })).min(1, "At least one item is required"),
})

type StockTransferFormData = z.infer<typeof stockTransferSchema>

interface StockTransferFormProps {
    onSubmit: (data: any) => Promise<void>
    onCancel: () => void
    initialData?: Partial<StockTransferFormData>
    isLoading?: boolean
}

export function StockTransferForm({
    onSubmit,
    onCancel,
    initialData,
    isLoading = false,
}: StockTransferFormProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [showProductSearch, setShowProductSearch] = useState<number | null>(null)
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const form = useForm<StockTransferFormData>({
        resolver: zodResolver(stockTransferSchema),
        defaultValues: {
            from_warehouse_id: "",
            to_warehouse_id: "",
            reference_number: "",
            notes: "",
            items: [{ product_id: "", quantity: 1, notes: "" }],
            ...initialData,
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const { data: warehousesData } = useWarehouses()
    const { data: productsData } = useProducts({
        search: debouncedSearchTerm,
        per_page: 50 // Increase limit for better search results
    })

    const warehouses = warehousesData?.data || []
    const products = productsData?.data || []

    const fromWarehouseId = form.watch("from_warehouse_id")
    const toWarehouseId = form.watch("to_warehouse_id")

    // Filter warehouses to prevent same source and destination
    const availableDestinationWarehouses = warehouses.filter(
        (warehouse: Warehouse) => warehouse.id.toString() !== fromWarehouseId
    )

    // Filter products by search term for better results
    const filteredProducts = products.filter((product: Product) => {
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        return (
            product.name.toLowerCase().includes(searchLower) ||
            product.sku.toLowerCase().includes(searchLower) ||
            (product.barcode && product.barcode.toLowerCase().includes(searchLower))
        )
    })

    const handleSubmit = async (data: StockTransferFormData) => {
        const formattedData = {
            ...data,
            from_warehouse_id: parseInt(data.from_warehouse_id),
            to_warehouse_id: parseInt(data.to_warehouse_id),
            items: data.items.map(item => ({
                ...item,
                product_id: parseInt(item.product_id),
            })),
        }
        await onSubmit(formattedData)
    }

    const addItem = () => {
        append({ product_id: "", quantity: 1, notes: "" })
    }

    const removeItem = (index: number) => {
        if (fields.length > 1) {
            remove(index)
        }
    }

    const selectProduct = (index: number, product: Product) => {
        form.setValue(`items.${index}.product_id`, product.id.toString())
        setShowProductSearch(null)
        setSearchTerm("") // Clear search after selection
    }

    const getSelectedProduct = (productId: string): Product | undefined => {
        return products.find((p: Product) => p.id.toString() === productId)
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Create Stock Transfer
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Transfer Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="from_warehouse_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>From Warehouse</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select source warehouse" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {warehouses.map((warehouse: Warehouse) => (
                                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                        {warehouse.name} ({warehouse.code})
                                                        {warehouse.is_default && (
                                                            <Badge variant="secondary" className="ml-2">Default</Badge>
                                                        )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="to_warehouse_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>To Warehouse</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={!fromWarehouseId}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select destination warehouse" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableDestinationWarehouses.map((warehouse: Warehouse) => (
                                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                        {warehouse.name} ({warehouse.code})
                                                        {warehouse.is_default && (
                                                            <Badge variant="secondary" className="ml-2">Default</Badge>
                                                        )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reference_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reference Number (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Auto-generated if empty" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional notes about this transfer..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Transfer Items */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Transfer Items</h3>
                                <Button type="button" onClick={addItem} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <Card key={field.id} className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                            {/* Product Selection */}
                                            <div className="md:col-span-5">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.product_id`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Product</FormLabel>
                                                            <div className="relative">
                                                                <FormControl>
                                                                    <div className="flex gap-2">
                                                                        <Input
                                                                            placeholder="Search and select product"
                                                                            value={
                                                                                getSelectedProduct(field.value)?.name || ""
                                                                            }
                                                                            readOnly
                                                                            className="cursor-pointer"
                                                                            onClick={() => setShowProductSearch(index)}
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => setShowProductSearch(index)}
                                                                        >
                                                                            <Search className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </FormControl>

                                                                {showProductSearch === index && (
                                                                    <Card className="absolute top-full left-0 right-0 z-10 max-h-64 overflow-y-auto mt-1">
                                                                        <CardContent className="p-2">
                                                                            <Input
                                                                                placeholder="Search products..."
                                                                                value={searchTerm}
                                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                                className="mb-2"
                                                                            />
                                                                            <div className="space-y-1">
                                                                                {filteredProducts.map((product: Product) => (
                                                                                    <div
                                                                                        key={product.id}
                                                                                        className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                                                                                        onClick={() => selectProduct(index, product)}
                                                                                    >
                                                                                        <div className="font-medium">{product.name}</div>
                                                                                        <div className="text-sm text-gray-500">
                                                                                            SKU: {product.sku} | Stock: {product.stock?.current_stock || 0}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                )}
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Quantity */}
                                            <div className="md:col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Quantity</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="0.01"
                                                                    step="0.01"
                                                                    {...field}
                                                                    onChange={(e) =>
                                                                        field.onChange(parseFloat(e.target.value) || 0)
                                                                    }
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Notes */}
                                            <div className="md:col-span-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.notes`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Notes (Optional)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Item notes..." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Remove Button */}
                                            <div className="md:col-span-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                    disabled={fields.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Show selected product details */}
                                        {getSelectedProduct(form.watch(`items.${index}.product_id`)) && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded">
                                                <div className="text-sm">
                                                    <span className="font-medium">Selected:</span>{" "}
                                                    {getSelectedProduct(form.watch(`items.${index}.product_id`))?.name}
                                                    <span className="text-gray-500 ml-2">
                                                        Current Stock: {getSelectedProduct(form.watch(`items.${index}.product_id`))?.stock?.current_stock || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 pt-6">
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create Transfer"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

// Click outside handler for product search
export function useClickOutside(
    ref: React.RefObject<HTMLElement>,
    handler: () => void
) {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [ref, handler])
} 