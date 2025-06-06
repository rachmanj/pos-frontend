"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Building2 } from "lucide-react"

const warehouseSchema = z.object({
    name: z.string().min(1, "Warehouse name is required"),
    code: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(["main", "branch", "storage", "distribution"]),
    status: z.enum(["active", "inactive", "maintenance"]),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    manager_name: z.string().optional(),
    manager_phone: z.string().optional(),
    max_capacity: z.number().min(1, "Capacity must be greater than 0").optional(),
    total_area: z.number().min(0, "Area must be non-negative").optional(),
    storage_area: z.number().min(0, "Storage area must be non-negative").optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    is_default: z.boolean(),
})

type WarehouseFormData = z.infer<typeof warehouseSchema>

interface WarehouseFormProps {
    onSubmit: (data: WarehouseFormData) => Promise<void>
    onCancel: () => void
    initialData?: Partial<WarehouseFormData>
    isLoading?: boolean
    isEdit?: boolean
}

export function WarehouseForm({
    onSubmit,
    onCancel,
    initialData,
    isLoading = false,
    isEdit = false,
}: WarehouseFormProps) {
    const form = useForm<WarehouseFormData>({
        resolver: zodResolver(warehouseSchema),
        defaultValues: {
            name: "",
            code: "",
            description: "",
            type: "main",
            status: "active",
            address: "",
            city: "",
            state: "",
            postal_code: "",
            country: "Indonesia",
            phone: "",
            email: "",
            manager_name: "",
            manager_phone: "",
            max_capacity: undefined,
            total_area: undefined,
            storage_area: undefined,
            latitude: undefined,
            longitude: undefined,
            is_default: false,
            ...initialData,
        },
    })

    const handleSubmit = async (data: WarehouseFormData) => {
        try {
            await onSubmit(data)
        } catch (error) {
            console.error("Form submission error:", error)
        }
    }

    return (
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {isEdit ? "Edit Warehouse" : "Create New Warehouse"}
                </DialogTitle>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Warehouse Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Main Warehouse" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Warehouse Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="AUTO"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-muted-foreground">Leave blank to auto-generate</p>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Type and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Warehouse Type *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="main">Main Warehouse</SelectItem>
                                            <SelectItem value="branch">Branch Warehouse</SelectItem>
                                            <SelectItem value="storage">Storage Facility</SelectItem>
                                            <SelectItem value="distribution">Distribution Center</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Description */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Brief description of the warehouse..."
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Address Information */}
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Jl. Sudirman No. 123, Senayan"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jakarta" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State/Province</FormLabel>
                                    <FormControl>
                                        <Input placeholder="DKI Jakarta" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="postal_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Postal Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="12190" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                    <Input placeholder="Indonesia" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+62 21 123 4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="warehouse@company.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Management Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="manager_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Manager Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="manager_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Manager Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+62 812 3456 789" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Capacity Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="max_capacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Capacity (units)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="1000"
                                            {...field}
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="total_area"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Area (m²)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="500.00"
                                            {...field}
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="storage_area"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Storage Area (m²)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="400.00"
                                            {...field}
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* GPS Coordinates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="latitude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Latitude</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder="-6.200000"
                                            {...field}
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="longitude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Longitude</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder="106.816666"
                                            {...field}
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Default Warehouse */}
                    <FormField
                        control={form.control}
                        name="is_default"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                    <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </FormControl>
                                <FormLabel className="cursor-pointer">
                                    Set as Default Warehouse
                                </FormLabel>
                            </FormItem>
                        )}
                    />

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : isEdit ? "Update Warehouse" : "Create Warehouse"}
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    )
} 