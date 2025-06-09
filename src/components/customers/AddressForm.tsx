"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Building, Phone, Clock, User } from "lucide-react";
import { toast } from "sonner";
import {
    CustomerAddress,
    useCreateCustomerAddress,
    useUpdateCustomerAddress
} from "@/hooks/useCustomerCrm";

// Address form validation schema
const addressFormSchema = z.object({
    type: z.enum(["billing", "shipping", "office", "warehouse", "other"]),
    label: z.string().optional(),
    address_line_1: z.string().min(5, "Address line 1 must be at least 5 characters"),
    address_line_2: z.string().optional(),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State/Province must be at least 2 characters"),
    postal_code: z.string().min(3, "Postal code must be at least 3 characters"),
    country: z.string().min(2, "Country must be at least 2 characters"),
    is_default: z.boolean(),
    delivery_instructions: z.string().optional(),
    access_notes: z.string().optional(),
    contact_person: z.string().optional(),
    contact_phone: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

interface AddressFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerId: number;
    address?: CustomerAddress;
    onSuccess?: () => void;
}

export function AddressForm({ open, onOpenChange, customerId, address, onSuccess }: AddressFormProps) {
    const createAddress = useCreateCustomerAddress();
    const updateAddress = useUpdateCustomerAddress();

    const form = useForm<AddressFormData>({
        resolver: zodResolver(addressFormSchema),
        defaultValues: {
            type: "other",
            country: "Indonesia",
            is_default: false,
        },
    });

    // Populate form when editing
    useEffect(() => {
        if (address && open) {
            form.reset({
                type: address.type,
                label: address.label || "",
                address_line_1: address.address_line_1,
                address_line_2: address.address_line_2 || "",
                city: address.city,
                state: address.state,
                postal_code: address.postal_code,
                country: address.country,
                is_default: address.is_default,
                delivery_instructions: address.delivery_instructions || "",
                access_notes: address.access_notes || "",
                contact_person: address.contact_person || "",
                contact_phone: address.contact_phone || "",
            });
        } else if (!address && open) {
            form.reset({
                type: "other",
                country: "Indonesia",
                is_default: false,
            });
        }
    }, [address, open, form]);

    const onSubmit = async (data: AddressFormData) => {
        try {
            if (address) {
                await updateAddress.mutateAsync({
                    customerId,
                    addressId: address.id,
                    addressData: data,
                });
                toast.success("Address updated successfully");
            } else {
                await createAddress.mutateAsync({
                    customerId,
                    addressData: data,
                });
                toast.success("Address created successfully");
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast.error(address ? "Failed to update address" : "Failed to create address");
        }
    };

    const isLoading = createAddress.isPending || updateAddress.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {address ? "Edit Address" : "Add New Address"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Address Type & Label */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Address Type & Label</CardTitle>
                            <CardDescription>
                                Specify the type and purpose of this address
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Address Type *</Label>
                                    <Select
                                        value={form.watch("type")}
                                        onValueChange={(value) =>
                                            form.setValue("type", value as any)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="billing">Billing Address</SelectItem>
                                            <SelectItem value="shipping">Shipping Address</SelectItem>
                                            <SelectItem value="office">Office Address</SelectItem>
                                            <SelectItem value="warehouse">Warehouse Address</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="label">Address Label</Label>
                                    <Input
                                        id="label"
                                        {...form.register("label")}
                                        placeholder="e.g., Main Office, Jakarta Branch"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_default"
                                    checked={form.watch("is_default")}
                                    onCheckedChange={(checked: boolean) => form.setValue("is_default", checked)}
                                />
                                <Label htmlFor="is_default">Set as default address</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Address Information
                            </CardTitle>
                            <CardDescription>
                                Complete address details and location
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address_line_1">Address Line 1 *</Label>
                                <Input
                                    id="address_line_1"
                                    {...form.register("address_line_1")}
                                    placeholder="Street address, building name, floor"
                                />
                                {form.formState.errors.address_line_1 && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.address_line_1.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address_line_2">Address Line 2</Label>
                                <Input
                                    id="address_line_2"
                                    {...form.register("address_line_2")}
                                    placeholder="Apartment, suite, unit, building (optional)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City *</Label>
                                    <Input
                                        id="city"
                                        {...form.register("city")}
                                        placeholder="e.g., Jakarta, Surabaya"
                                    />
                                    {form.formState.errors.city && (
                                        <p className="text-sm text-red-500">
                                            {form.formState.errors.city.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">State/Province *</Label>
                                    <Input
                                        id="state"
                                        {...form.register("state")}
                                        placeholder="e.g., DKI Jakarta, Jawa Timur"
                                    />
                                    {form.formState.errors.state && (
                                        <p className="text-sm text-red-500">
                                            {form.formState.errors.state.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Postal Code *</Label>
                                    <Input
                                        id="postal_code"
                                        {...form.register("postal_code")}
                                        placeholder="e.g., 12345"
                                    />
                                    {form.formState.errors.postal_code && (
                                        <p className="text-sm text-red-500">
                                            {form.formState.errors.postal_code.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Country *</Label>
                                    <Input
                                        id="country"
                                        {...form.register("country")}
                                        placeholder="e.g., Indonesia"
                                    />
                                    {form.formState.errors.country && (
                                        <p className="text-sm text-red-500">
                                            {form.formState.errors.country.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Contact Information
                            </CardTitle>
                            <CardDescription>
                                Contact person and phone number for this address
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_person">Contact Person</Label>
                                    <Input
                                        id="contact_person"
                                        {...form.register("contact_person")}
                                        placeholder="Name of contact person at this address"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">Contact Phone</Label>
                                    <Input
                                        id="contact_phone"
                                        {...form.register("contact_phone")}
                                        placeholder="+62 21 1234 5678"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delivery & Access Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Delivery & Access Information
                            </CardTitle>
                            <CardDescription>
                                Special instructions for deliveries and access
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="delivery_instructions">Delivery Instructions</Label>
                                <Textarea
                                    id="delivery_instructions"
                                    {...form.register("delivery_instructions")}
                                    placeholder="Special delivery instructions, preferred delivery times, etc."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="access_notes">Access Notes</Label>
                                <Textarea
                                    id="access_notes"
                                    {...form.register("access_notes")}
                                    placeholder="Building access codes, security procedures, parking information, etc."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Geolocation Note */}
                    <Card className="border-dashed border-muted-foreground/30">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>
                                    <strong>Note:</strong> Geolocation support (latitude/longitude) will be added in future updates for enhanced mapping and delivery optimization.
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {address ? "Update Address" : "Create Address"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 