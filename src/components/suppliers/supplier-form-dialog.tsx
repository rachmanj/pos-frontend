"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/use-suppliers";
import { toast } from "sonner";
import type { Supplier } from "@/types/purchasing";

const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    contact_person: z.string().optional(),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    tax_number: z.string().optional(),
    payment_terms: z.coerce.number().min(0, "Payment terms must be 0 or greater").max(365, "Payment terms cannot exceed 365 days"),
    status: z.enum(["active", "inactive"]),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier?: Supplier;
    onSuccess?: () => void;
}

export function SupplierFormDialog({
    open,
    onOpenChange,
    supplier,
    onSuccess,
}: SupplierFormDialogProps) {
    const isEditing = !!supplier;
    const createSupplierMutation = useCreateSupplier();
    const updateSupplierMutation = useUpdateSupplier();

    const form = useForm<SupplierFormData>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: "",
            code: "",
            contact_person: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            country: "",
            tax_number: "",
            payment_terms: 30,
            status: "active",
        },
    });

    useEffect(() => {
        if (supplier) {
            form.reset({
                name: supplier.name,
                code: supplier.code,
                contact_person: supplier.contact_person || "",
                email: supplier.email || "",
                phone: supplier.phone || "",
                address: supplier.address || "",
                city: supplier.city || "",
                country: supplier.country || "",
                tax_number: supplier.tax_number || "",
                payment_terms: supplier.payment_terms || 30,
                status: supplier.status,
            });
        } else {
            form.reset({
                name: "",
                code: "",
                contact_person: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                country: "",
                tax_number: "",
                payment_terms: 30,
                status: "active",
            });
        }
    }, [supplier, form]);

    const handleSubmit = async (data: SupplierFormData) => {
        try {
            if (isEditing) {
                await updateSupplierMutation.mutateAsync({
                    id: supplier.id,
                    data,
                });
                toast.success("Supplier updated successfully");
            } else {
                await createSupplierMutation.mutateAsync(data);
                toast.success("Supplier created successfully");
            }
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to save supplier");
        }
    };

    const isLoading = createSupplierMutation.isPending || updateSupplierMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Supplier" : "Add New Supplier"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter supplier name" {...field} />
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
                                        <FormLabel>Supplier Code *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter supplier code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contact_person"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Person</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter contact person" {...field} />
                                        </FormControl>
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
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Enter email address"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter phone number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter address"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter city" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter country" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="tax_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tax Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter tax number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="payment_terms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Terms (days) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="30"
                                                min="0"
                                                max="365"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 