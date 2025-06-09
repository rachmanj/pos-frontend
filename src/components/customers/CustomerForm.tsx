"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Loader2, User, Building, CreditCard, Target, Users, Shield } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import {
    CustomerCrm,
    CustomerCrmFormData,
    useCreateCustomerCrm,
    useUpdateCustomerCrm,
    useCustomerCrmDropdownData
} from "@/hooks/useCustomerCrm";

// Comprehensive form validation schema
const customerFormSchema = z.object({
    // Basic Information
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    birth_date: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),

    // Address Information
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),

    // Customer Classification
    type: z.enum(["regular", "vip", "wholesale", "member"]),
    status: z.enum(["active", "inactive", "suspended"]).optional(),

    // Financial Information
    credit_limit: z.number().min(0).optional(),
    tax_number: z.string().optional(),
    company_name: z.string().optional(),
    notes: z.string().optional(),

    // Enhanced CRM Fields
    business_type: z.enum(["individual", "company", "government", "ngo"]).optional(),
    industry: z.string().optional(),
    company_size: z.enum(["micro", "small", "medium", "large", "enterprise"]).optional(),
    annual_revenue: z.number().min(0).optional(),
    website: z.string().url("Invalid website URL").optional().or(z.literal("")),

    // Lead Management
    lead_source: z.enum([
        "website", "referral", "advertisement", "cold_call",
        "social_media", "trade_show", "other"
    ]).optional(),
    lead_stage: z.enum(["lead", "prospect", "qualified", "customer", "vip"]).optional(),
    assigned_to: z.number().optional(),

    // Payment & Loyalty
    payment_terms: z.enum(["cash", "net_15", "net_30", "net_45", "net_60", "custom"]).optional(),
    loyalty_tier: z.enum(["bronze", "silver", "gold", "platinum", "diamond"]).optional(),
    referred_by: z.number().optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer?: CustomerCrm;
    onSuccess?: () => void;
}

export function CustomerForm({ open, onOpenChange, customer, onSuccess }: CustomerFormProps) {
    const [activeTab, setActiveTab] = useState("basic");
    const [birthDate, setBirthDate] = useState<Date>();

    const { data: dropdownData } = useCustomerCrmDropdownData();
    const createCustomer = useCreateCustomerCrm();
    const updateCustomer = useUpdateCustomerCrm();

    const form = useForm<CustomerFormData>({
        resolver: zodResolver(customerFormSchema),
        defaultValues: {
            type: "regular",
            status: "active",
            business_type: "individual",
            lead_stage: "lead",
            payment_terms: "cash",
            loyalty_tier: "bronze",
        },
    });

    // Populate form when editing
    useEffect(() => {
        if (customer && open) {
            form.reset({
                name: customer.name,
                email: customer.email || "",
                phone: customer.phone || "",
                birth_date: customer.birth_date || "",
                gender: customer.gender,
                address: customer.address || "",
                city: customer.city || "",
                state: customer.state || "",
                postal_code: customer.postal_code || "",
                country: customer.country || "",
                type: customer.type,
                status: customer.status,
                credit_limit: customer.credit_limit || 0,
                tax_number: customer.tax_number || "",
                company_name: customer.company_name || "",
                notes: customer.customer_notes || "",
                business_type: customer.business_type,
                industry: customer.industry || "",
                company_size: customer.company_size,
                annual_revenue: customer.annual_revenue || 0,
                website: customer.website || "",
                lead_source: customer.lead_source,
                lead_stage: customer.lead_stage,
                assigned_to: customer.assigned_to,
                payment_terms: customer.payment_terms,
                loyalty_tier: customer.loyalty_tier,
                referred_by: customer.referred_by,
            });

            if (customer.birth_date) {
                setBirthDate(new Date(customer.birth_date));
            }
        } else if (!customer && open) {
            form.reset({
                type: "regular",
                status: "active",
                business_type: "individual",
                lead_stage: "lead",
                payment_terms: "cash",
                loyalty_tier: "bronze",
            });
            setBirthDate(undefined);
        }
    }, [customer, open, form]);

    const onSubmit = async (data: CustomerFormData) => {
        try {
            const formData: CustomerCrmFormData = {
                ...data,
                birth_date: birthDate ? format(birthDate, "yyyy-MM-dd") : undefined,
            };

            if (customer) {
                await updateCustomer.mutateAsync({
                    id: customer.id,
                    ...formData,
                });
                toast.success("Customer updated successfully");
            } else {
                await createCustomer.mutateAsync(formData);
                toast.success("Customer created successfully");
            }

            onOpenChange(false);
            onSuccess?.();
        } catch {
            toast.error(customer ? "Failed to update customer" : "Failed to create customer");
        }
    };

    const isLoading = createCustomer.isPending || updateCustomer.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {customer ? "Edit Customer" : "Add New Customer"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="basic" className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                Basic
                            </TabsTrigger>
                            <TabsTrigger value="business" className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                Business
                            </TabsTrigger>
                            <TabsTrigger value="financial" className="flex items-center gap-1">
                                <CreditCard className="h-4 w-4" />
                                Financial
                            </TabsTrigger>
                            <TabsTrigger value="lead" className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                Lead
                            </TabsTrigger>
                            <TabsTrigger value="relationship" className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Relations
                            </TabsTrigger>
                            <TabsTrigger value="advanced" className="flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                Advanced
                            </TabsTrigger>
                        </TabsList>

                        {/* Basic Information Tab */}
                        <TabsContent value="basic" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Essential customer details and contact information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                {...form.register("name")}
                                                placeholder="Enter customer name"
                                            />
                                            {form.formState.errors.name && (
                                                <p className="text-sm text-red-500">
                                                    {form.formState.errors.name.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                {...form.register("email")}
                                                placeholder="customer@example.com"
                                            />
                                            {form.formState.errors.email && (
                                                <p className="text-sm text-red-500">
                                                    {form.formState.errors.email.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                {...form.register("phone")}
                                                placeholder="+62 812 3456 7890"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Birth Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !birthDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {birthDate ? format(birthDate, "PPP") : "Pick a date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={birthDate}
                                                        onSelect={setBirthDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Gender</Label>
                                            <Select
                                                value={form.watch("gender") || ""}
                                                onValueChange={(value) =>
                                                    form.setValue("gender", value as "male" | "female" | "other")
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h4 className="font-medium">Address Information</h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="address">Street Address</Label>
                                            <Textarea
                                                id="address"
                                                {...form.register("address")}
                                                placeholder="Enter street address"
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    {...form.register("city")}
                                                    placeholder="Jakarta"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">State/Province</Label>
                                                <Input
                                                    id="state"
                                                    {...form.register("state")}
                                                    placeholder="DKI Jakarta"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="postal_code">Postal Code</Label>
                                                <Input
                                                    id="postal_code"
                                                    {...form.register("postal_code")}
                                                    placeholder="12345"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="country">Country</Label>
                                                <Input
                                                    id="country"
                                                    {...form.register("country")}
                                                    placeholder="Indonesia"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Customer Type *</Label>
                                            <Select
                                                value={form.watch("type")}
                                                onValueChange={(value) =>
                                                    form.setValue("type", value as "regular" | "vip" | "wholesale" | "member")
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="regular">Regular</SelectItem>
                                                    <SelectItem value="vip">VIP</SelectItem>
                                                    <SelectItem value="wholesale">Wholesale</SelectItem>
                                                    <SelectItem value="member">Member</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select
                                                value={form.watch("status") || "active"}
                                                onValueChange={(value) =>
                                                    form.setValue("status", value as "active" | "inactive" | "suspended")
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="suspended">Suspended</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Business Information Tab */}
                        <TabsContent value="business" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Business Information</CardTitle>
                                    <CardDescription>
                                        Company details and business classification
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Business Type</Label>
                                            <Select
                                                value={form.watch("business_type") || "individual"}
                                                onValueChange={(value) =>
                                                    form.setValue("business_type", value as "individual" | "company" | "government" | "ngo")
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="individual">Individual</SelectItem>
                                                    <SelectItem value="company">Company</SelectItem>
                                                    <SelectItem value="government">Government</SelectItem>
                                                    <SelectItem value="ngo">NGO</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="company_name">Company Name</Label>
                                            <Input
                                                id="company_name"
                                                {...form.register("company_name")}
                                                placeholder="PT. Example Company"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Industry</Label>
                                            <Select
                                                value={form.watch("industry") || ""}
                                                onValueChange={(value) => form.setValue("industry", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select industry" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dropdownData?.industries?.map((industry) => (
                                                        <SelectItem key={industry} value={industry}>
                                                            {industry}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Company Size</Label>
                                            <Select
                                                value={form.watch("company_size") || ""}
                                                onValueChange={(value) =>
                                                    form.setValue("company_size", value as "micro" | "small" | "medium" | "large" | "enterprise")
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select size" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="micro">Micro (1-9 employees)</SelectItem>
                                                    <SelectItem value="small">Small (10-49 employees)</SelectItem>
                                                    <SelectItem value="medium">Medium (50-249 employees)</SelectItem>
                                                    <SelectItem value="large">Large (250-999 employees)</SelectItem>
                                                    <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="annual_revenue">Annual Revenue (IDR)</Label>
                                            <Input
                                                id="annual_revenue"
                                                type="number"
                                                {...form.register("annual_revenue", { valueAsNumber: true })}
                                                placeholder="1000000000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="website">Website</Label>
                                            <Input
                                                id="website"
                                                {...form.register("website")}
                                                placeholder="https://example.com"
                                            />
                                            {form.formState.errors.website && (
                                                <p className="text-sm text-red-500">
                                                    {form.formState.errors.website.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tax_number">Tax Number (NPWP)</Label>
                                        <Input
                                            id="tax_number"
                                            {...form.register("tax_number")}
                                            placeholder="12.345.678.9-012.345"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Financial Information Tab */}
                        <TabsContent value="financial" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Financial Information</CardTitle>
                                    <CardDescription>
                                        Credit limits, payment terms, and financial preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="credit_limit">Credit Limit (IDR)</Label>
                                            <Input
                                                id="credit_limit"
                                                type="number"
                                                {...form.register("credit_limit", { valueAsNumber: true })}
                                                placeholder="5000000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Payment Terms</Label>
                                            <Select
                                                value={form.watch("payment_terms") || "cash"}
                                                onValueChange={(value) =>
                                                    form.setValue("payment_terms", value as "cash" | "net_15" | "net_30" | "net_45" | "net_60" | "custom")
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="net_15">Net 15 Days</SelectItem>
                                                    <SelectItem value="net_30">Net 30 Days</SelectItem>
                                                    <SelectItem value="net_45">Net 45 Days</SelectItem>
                                                    <SelectItem value="net_60">Net 60 Days</SelectItem>
                                                    <SelectItem value="custom">Custom Terms</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Loyalty Tier</Label>
                                        <Select
                                            value={form.watch("loyalty_tier") || "bronze"}
                                            onValueChange={(value) =>
                                                form.setValue("loyalty_tier", value as "bronze" | "silver" | "gold" | "platinum" | "diamond")
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bronze">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary">Bronze</Badge>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="silver">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary">Silver</Badge>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="gold">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="default">Gold</Badge>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="platinum">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="default">Platinum</Badge>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="diamond">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="default">Diamond</Badge>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Lead Management Tab */}
                        <TabsContent value="lead" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lead Management</CardTitle>
                                    <CardDescription>
                                        Lead source, stage, and conversion tracking
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Lead Source</Label>
                                            <Select
                                                value={form.watch("lead_source") || ""}
                                                onValueChange={(value) =>
                                                    form.setValue("lead_source", value as "website" | "referral" | "advertisement" | "cold_call" | "social_media" | "trade_show" | "other")
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select lead source" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="website">Website</SelectItem>
                                                    <SelectItem value="referral">Referral</SelectItem>
                                                    <SelectItem value="advertisement">Advertisement</SelectItem>
                                                    <SelectItem value="cold_call">Cold Call</SelectItem>
                                                    <SelectItem value="social_media">Social Media</SelectItem>
                                                    <SelectItem value="trade_show">Trade Show</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Lead Stage</Label>
                                            <Select
                                                value={form.watch("lead_stage") || "lead"}
                                                onValueChange={(value) =>
                                                    form.setValue("lead_stage", value as "lead" | "prospect" | "qualified" | "customer" | "vip")
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="lead">Lead</SelectItem>
                                                    <SelectItem value="prospect">Prospect</SelectItem>
                                                    <SelectItem value="qualified">Qualified</SelectItem>
                                                    <SelectItem value="customer">Customer</SelectItem>
                                                    <SelectItem value="vip">VIP</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Assigned To</Label>
                                        <Select
                                            value={form.watch("assigned_to")?.toString() || ""}
                                            onValueChange={(value) =>
                                                form.setValue("assigned_to", value ? parseInt(value) : undefined)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account manager" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dropdownData?.users?.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Relationship Management Tab */}
                        <TabsContent value="relationship" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Relationship Management</CardTitle>
                                    <CardDescription>
                                        Referrals and relationship tracking
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Referred By</Label>
                                        <Select
                                            value={form.watch("referred_by")?.toString() || "none"}
                                            onValueChange={(value) =>
                                                form.setValue("referred_by", value === "none" ? undefined : parseInt(value))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select referring customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* This would be populated with existing customers */}
                                                <SelectItem value="none">No referral</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Advanced Settings Tab */}
                        <TabsContent value="advanced" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Notes</CardTitle>
                                    <CardDescription>
                                        Additional information and notes about the customer
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Customer Notes</Label>
                                        <Textarea
                                            id="notes"
                                            {...form.register("notes")}
                                            placeholder="Enter any additional notes about this customer..."
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

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
                            {customer ? "Update Customer" : "Create Customer"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}