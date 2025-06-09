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
import { Loader2, User, Phone } from "lucide-react";
import { toast } from "sonner";
import {
    CustomerContact,
    useCreateCustomerContact,
    useUpdateCustomerContact
} from "@/hooks/useCustomerCrm";

// Contact form validation schema
const contactFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    title: z.string().optional(),
    department: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    role: z.enum([
        "primary",
        "decision_maker",
        "technical",
        "financial",
        "invoice_recipient",
        "other"
    ]),
    is_primary: z.boolean(),
    notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerId: number;
    contact?: CustomerContact;
    onSuccess?: () => void;
}

export function ContactForm({ open, onOpenChange, customerId, contact, onSuccess }: ContactFormProps) {
    const createContact = useCreateCustomerContact();
    const updateContact = useUpdateCustomerContact();

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            role: "other",
            is_primary: false,
        },
    });

    // Populate form when editing
    useEffect(() => {
        if (contact && open) {
            form.reset({
                name: contact.name,
                title: contact.title || "",
                department: contact.department || "",
                email: contact.email || "",
                phone: contact.phone || "",
                mobile: contact.mobile || "",
                role: contact.role,
                is_primary: contact.is_primary,
                notes: contact.notes || "",
            });
        } else if (!contact && open) {
            form.reset({
                role: "other",
                is_primary: false,
            });
        }
    }, [contact, open, form]);

    const onSubmit = async (data: ContactFormData) => {
        try {
            if (contact) {
                await updateContact.mutateAsync({
                    customerId,
                    contactId: contact.id,
                    contactData: data,
                });
                toast.success("Contact updated successfully");
            } else {
                await createContact.mutateAsync({
                    customerId,
                    contactData: data,
                });
                toast.success("Contact created successfully");
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast.error(contact ? "Failed to update contact" : "Failed to create contact");
        }
    };

    const isLoading = createContact.isPending || updateContact.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {contact ? "Edit Contact" : "Add New Contact"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Basic Information</CardTitle>
                            <CardDescription>
                                Contact's personal and professional details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        {...form.register("name")}
                                        placeholder="Enter contact name"
                                    />
                                    {form.formState.errors.name && (
                                        <p className="text-sm text-red-500">
                                            {form.formState.errors.name.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title">Job Title</Label>
                                    <Input
                                        id="title"
                                        {...form.register("title")}
                                        placeholder="e.g., Sales Manager"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        {...form.register("department")}
                                        placeholder="e.g., Sales, Finance"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Contact Role *</Label>
                                    <Select
                                        value={form.watch("role")}
                                        onValueChange={(value) =>
                                            form.setValue("role", value as any)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="primary">Primary Contact</SelectItem>
                                            <SelectItem value="decision_maker">Decision Maker</SelectItem>
                                            <SelectItem value="technical">Technical Contact</SelectItem>
                                            <SelectItem value="financial">Financial Contact</SelectItem>
                                            <SelectItem value="invoice_recipient">Invoice Recipient</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_primary"
                                    checked={form.watch("is_primary")}
                                    onCheckedChange={(checked: boolean) => form.setValue("is_primary", checked)}
                                />
                                <Label htmlFor="is_primary">Set as primary contact</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Contact Information
                            </CardTitle>
                            <CardDescription>
                                Phone numbers and email address
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...form.register("email")}
                                    placeholder="contact@example.com"
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Office Phone</Label>
                                    <Input
                                        id="phone"
                                        {...form.register("phone")}
                                        placeholder="+62 21 1234 5678"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile Phone</Label>
                                    <Input
                                        id="mobile"
                                        {...form.register("mobile")}
                                        placeholder="+62 812 3456 7890"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Additional Notes</CardTitle>
                            <CardDescription>
                                Any additional information about this contact
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    {...form.register("notes")}
                                    placeholder="Enter any additional notes about this contact..."
                                    rows={3}
                                />
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
                            {contact ? "Update Contact" : "Create Contact"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 