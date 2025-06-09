"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    User,
    Building,
    CreditCard,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Target,
    Users,
    FileText,
    Star,
    Edit,
    Plus,
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Award
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import {
    useCustomerCrm,
    useCustomerContacts,
    useCustomerAddresses,
    useCustomerNotes,
    useCustomerLoyaltyPoints,
    CustomerCrm,
    CustomerContact,
    CustomerAddress,
    CustomerNote,
    CustomerLoyaltyPoint
} from "@/hooks/useCustomerCrm";
import { ContactForm } from "./ContactForm";
import { AddressForm } from "./AddressForm";
import { NoteForm } from "./NoteForm";

interface CustomerDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerId: number;
    onEdit?: (customer: CustomerCrm) => void;
}

export function CustomerDetails({ open, onOpenChange, customerId, onEdit }: CustomerDetailsProps) {
    const [activeTab, setActiveTab] = useState("overview");

    // Form states
    const [contactFormOpen, setContactFormOpen] = useState(false);
    const [addressFormOpen, setAddressFormOpen] = useState(false);
    const [noteFormOpen, setNoteFormOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<CustomerContact | undefined>();
    const [editingAddress, setEditingAddress] = useState<CustomerAddress | undefined>();
    const [editingNote, setEditingNote] = useState<CustomerNote | undefined>();

    const { data: customer, isLoading } = useCustomerCrm(customerId);
    const { data: contacts } = useCustomerContacts(customerId);
    const { data: addresses } = useCustomerAddresses(customerId);
    const { data: notes } = useCustomerNotes(customerId);
    const { data: loyaltyPoints } = useCustomerLoyaltyPoints(customerId);

    // Form handlers
    const handleAddContact = () => {
        setEditingContact(undefined);
        setContactFormOpen(true);
    };

    const handleEditContact = (contact: CustomerContact) => {
        setEditingContact(contact);
        setContactFormOpen(true);
    };

    const handleAddAddress = () => {
        setEditingAddress(undefined);
        setAddressFormOpen(true);
    };

    const handleEditAddress = (address: CustomerAddress) => {
        setEditingAddress(address);
        setAddressFormOpen(true);
    };

    const handleAddNote = () => {
        setEditingNote(undefined);
        setNoteFormOpen(true);
    };

    const handleEditNote = (note: CustomerNote) => {
        setEditingNote(note);
        setNoteFormOpen(true);
    };

    const handleFormSuccess = () => {
        // Forms will close themselves and invalidate queries
        setEditingContact(undefined);
        setEditingAddress(undefined);
        setEditingNote(undefined);
    };

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading customer details...</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!customer) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-muted-foreground">Customer not found.</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
            case "inactive":
                return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Inactive</Badge>;
            case "suspended":
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "vip":
                return <Badge variant="default" className="bg-purple-500"><Star className="h-3 w-3 mr-1" />VIP</Badge>;
            case "wholesale":
                return <Badge variant="default" className="bg-blue-500"><Building className="h-3 w-3 mr-1" />Wholesale</Badge>;
            case "member":
                return <Badge variant="default" className="bg-green-500"><Award className="h-3 w-3 mr-1" />Member</Badge>;
            default:
                return <Badge variant="outline"><User className="h-3 w-3 mr-1" />Regular</Badge>;
        }
    };

    const getLoyaltyTierBadge = (tier?: string) => {
        if (!tier) return null;

        const colors = {
            bronze: "bg-amber-600",
            silver: "bg-gray-500",
            gold: "bg-yellow-500",
            platinum: "bg-purple-500",
            diamond: "bg-blue-500"
        };

        return (
            <Badge variant="default" className={colors[tier as keyof typeof colors] || "bg-gray-500"}>
                <Award className="h-3 w-3 mr-1" />
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
        );
    };

    const getLeadStageBadge = (stage?: string) => {
        if (!stage) return null;

        const colors = {
            lead: "bg-gray-500",
            prospect: "bg-blue-500",
            qualified: "bg-yellow-500",
            customer: "bg-green-500",
            vip: "bg-purple-500"
        };

        return (
            <Badge variant="default" className={colors[stage as keyof typeof colors] || "bg-gray-500"}>
                <Target className="h-3 w-3 mr-1" />
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </Badge>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {customer.name}
                            <span className="text-sm text-muted-foreground font-normal">
                                ({customer.customer_code})
                            </span>
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            {customer.is_blacklisted && (
                                <Badge variant="destructive">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Blacklisted
                                </Badge>
                            )}
                            {getStatusBadge(customer.status)}
                            {getTypeBadge(customer.type)}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit?.(customer)}
                            >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview" className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="contacts" className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            Contacts
                            {contacts && contacts.length > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                                    {contacts.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="addresses" className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            Addresses
                            {addresses && addresses.length > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                                    {addresses.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Notes
                            {notes && notes.length > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                                    {notes.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="loyalty" className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            Loyalty
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-muted-foreground">Customer Code:</span>
                                            <p className="font-mono">{customer.customer_code}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Full Name:</span>
                                            <p>{customer.name}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Email:</span>
                                            <p className="flex items-center gap-1">
                                                {customer.email ? (
                                                    <>
                                                        <Mail className="h-3 w-3" />
                                                        {customer.email}
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground">Not provided</span>
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Phone:</span>
                                            <p className="flex items-center gap-1">
                                                {customer.phone ? (
                                                    <>
                                                        <Phone className="h-3 w-3" />
                                                        {customer.phone}
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground">Not provided</span>
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Birth Date:</span>
                                            <p className="flex items-center gap-1">
                                                {customer.birth_date ? (
                                                    <>
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(customer.birth_date), "PPP")}
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground">Not provided</span>
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Gender:</span>
                                            <p>{customer.gender ? customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1) : "Not specified"}</p>
                                        </div>
                                    </div>

                                    {customer.address && (
                                        <>
                                            <Separator />
                                            <div>
                                                <span className="font-medium text-muted-foreground">Address:</span>
                                                <p className="mt-1 text-sm">
                                                    {customer.address}
                                                    {customer.city && `, ${customer.city}`}
                                                    {customer.state && `, ${customer.state}`}
                                                    {customer.postal_code && ` ${customer.postal_code}`}
                                                    {customer.country && `, ${customer.country}`}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Business Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Business Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-muted-foreground">Business Type:</span>
                                            <p>{customer.business_type ? customer.business_type.charAt(0).toUpperCase() + customer.business_type.slice(1) : "Individual"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Company:</span>
                                            <p>{customer.company_name || "Not provided"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Industry:</span>
                                            <p>{customer.industry || "Not specified"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Company Size:</span>
                                            <p>{customer.company_size ? customer.company_size.charAt(0).toUpperCase() + customer.company_size.slice(1) : "Not specified"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Annual Revenue:</span>
                                            <p>{customer.annual_revenue ? formatCurrency(customer.annual_revenue) : "Not provided"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Website:</span>
                                            <p>{customer.website ? (
                                                <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                    {customer.website}
                                                </a>
                                            ) : "Not provided"}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="font-medium text-muted-foreground">Tax Number (NPWP):</span>
                                            <p className="font-mono">{customer.tax_number || "Not provided"}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Financial Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Financial Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-muted-foreground">Credit Limit:</span>
                                            <p className="font-semibold">{customer.credit_limit ? formatCurrency(customer.credit_limit) : "No limit set"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Payment Terms:</span>
                                            <p>{customer.payment_terms ? customer.payment_terms.replace("_", " ").toUpperCase() : "Cash"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Loyalty Tier:</span>
                                            <div className="mt-1">
                                                {getLoyaltyTierBadge(customer.loyalty_tier)}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Loyalty Points:</span>
                                            <p className="font-semibold text-green-600">{customer.loyalty_points_balance || 0} points</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Lead & Relationship */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Lead & Relationship
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-muted-foreground">Lead Source:</span>
                                            <p>{customer.lead_source ? customer.lead_source.replace("_", " ").charAt(0).toUpperCase() + customer.lead_source.replace("_", " ").slice(1) : "Not specified"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Lead Stage:</span>
                                            <div className="mt-1">
                                                {getLeadStageBadge(customer.lead_stage)}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Account Manager:</span>
                                            <p>{customer.account_manager || "Not assigned"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Referral Count:</span>
                                            <p className="font-semibold">{customer.referral_count || 0} referrals</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Last Contact:</span>
                                            <p>{customer.last_contact_date ? format(new Date(customer.last_contact_date), "PPP") : "Never"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Next Follow-up:</span>
                                            <p>{customer.next_follow_up_date ? format(new Date(customer.next_follow_up_date), "PPP") : "Not scheduled"}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Customer Notes */}
                        {customer.customer_notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Customer Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{customer.customer_notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Contacts Tab */}
                    <TabsContent value="contacts" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Customer Contacts</h3>
                            <Button size="sm" onClick={handleAddContact}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Contact
                            </Button>
                        </div>

                        {contacts && contacts.length > 0 ? (
                            <div className="grid gap-4">
                                {contacts.map((contact: CustomerContact) => (
                                    <Card key={contact.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold">{contact.name}</h4>
                                                        {contact.is_primary && (
                                                            <Badge variant="default" className="bg-blue-500">Primary</Badge>
                                                        )}
                                                        <Badge variant="outline">{contact.role.replace("_", " ").charAt(0).toUpperCase() + contact.role.replace("_", " ").slice(1)}</Badge>
                                                    </div>
                                                    {contact.title && (
                                                        <p className="text-sm text-muted-foreground">{contact.title}</p>
                                                    )}
                                                    {contact.department && (
                                                        <p className="text-sm text-muted-foreground">{contact.department}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm">
                                                        {contact.email && (
                                                            <div className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {contact.email}
                                                            </div>
                                                        )}
                                                        {contact.phone && (
                                                            <div className="flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {contact.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {contact.notes && (
                                                        <p className="text-sm text-muted-foreground mt-2">{contact.notes}</p>
                                                    )}
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => handleEditContact(contact)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No contacts found</p>
                                        <p className="text-sm text-muted-foreground">Add contacts to manage customer communication</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Addresses Tab */}
                    <TabsContent value="addresses" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Customer Addresses</h3>
                            <Button size="sm" onClick={handleAddAddress}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Address
                            </Button>
                        </div>

                        {addresses && addresses.length > 0 ? (
                            <div className="grid gap-4">
                                {addresses.map((address: CustomerAddress) => (
                                    <Card key={address.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold">{address.label || address.type.charAt(0).toUpperCase() + address.type.slice(1)}</h4>
                                                        {address.is_default && (
                                                            <Badge variant="default" className="bg-green-500">Default</Badge>
                                                        )}
                                                        <Badge variant="outline">{address.type.charAt(0).toUpperCase() + address.type.slice(1)}</Badge>
                                                    </div>
                                                    <div className="text-sm">
                                                        <p>{address.address_line_1}</p>
                                                        {address.address_line_2 && <p>{address.address_line_2}</p>}
                                                        <p>{address.city}, {address.state} {address.postal_code}</p>
                                                        <p>{address.country}</p>
                                                    </div>
                                                    {address.contact_person && (
                                                        <div className="text-sm text-muted-foreground">
                                                            <p>Contact: {address.contact_person}</p>
                                                            {address.contact_phone && <p>Phone: {address.contact_phone}</p>}
                                                        </div>
                                                    )}
                                                    {address.delivery_instructions && (
                                                        <p className="text-sm text-muted-foreground">
                                                            <strong>Delivery Instructions:</strong> {address.delivery_instructions}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => handleEditAddress(address)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No addresses found</p>
                                        <p className="text-sm text-muted-foreground">Add addresses for billing and shipping</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Notes Tab */}
                    <TabsContent value="notes" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Customer Notes & Interactions</h3>
                            <Button size="sm" onClick={handleAddNote}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Note
                            </Button>
                        </div>

                        {notes && notes.length > 0 ? (
                            <div className="space-y-4">
                                {notes.map((note: CustomerNote) => (
                                    <Card key={note.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold">{note.title}</h4>
                                                        <Badge variant="outline">{note.type.replace("_", " ").charAt(0).toUpperCase() + note.type.replace("_", " ").slice(1)}</Badge>
                                                        {note.priority !== "low" && (
                                                            <Badge variant={note.priority === "urgent" ? "destructive" : "default"}>
                                                                {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
                                                            </Badge>
                                                        )}
                                                        {note.is_private && (
                                                            <Badge variant="secondary">
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                Private
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                                                    {note.follow_up_date && (
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            Follow-up: {format(new Date(note.follow_up_date), "PPP")}
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-muted-foreground">
                                                        Created {format(new Date(note.created_at), "PPP 'at' p")}
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => handleEditNote(note)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No notes found</p>
                                        <p className="text-sm text-muted-foreground">Add notes to track customer interactions</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Loyalty Tab */}
                    <TabsContent value="loyalty" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Loyalty Points</h3>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Adjust Points
                                </Button>
                                <Button size="sm">
                                    <Star className="h-4 w-4 mr-1" />
                                    Redeem Points
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{customer.loyalty_points_balance || 0}</div>
                                        <p className="text-sm text-muted-foreground">Current Balance</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{getLoyaltyTierBadge(customer.loyalty_tier)}</div>
                                        <p className="text-sm text-muted-foreground">Loyalty Tier</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{customer.referral_commission_earned ? formatCurrency(customer.referral_commission_earned) : "Rp 0"}</div>
                                        <p className="text-sm text-muted-foreground">Commission Earned</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {loyaltyPoints && loyaltyPoints.length > 0 ? (
                            <div className="space-y-4">
                                {loyaltyPoints.map((point: CustomerLoyaltyPoint) => (
                                    <Card key={point.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={point.transaction_type === "earned" ? "default" : point.transaction_type === "redeemed" ? "destructive" : "secondary"}>
                                                            {point.transaction_type.charAt(0).toUpperCase() + point.transaction_type.slice(1)}
                                                        </Badge>
                                                        <span className="font-semibold">
                                                            {point.transaction_type === "earned" ? "+" : "-"}{point.points} points
                                                        </span>
                                                    </div>
                                                    <p className="text-sm">{point.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(point.created_at), "PPP 'at' p")}
                                                        {point.expires_at && ` • Expires ${format(new Date(point.expires_at), "PPP")}`}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-muted-foreground">Balance After</p>
                                                    <p className="font-semibold">{point.balance_after} points</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No loyalty points history</p>
                                        <p className="text-sm text-muted-foreground">Points will appear here as customer earns and redeems them</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-4">
                        <h3 className="text-lg font-semibold">Customer Analytics</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{formatCurrency(customer.total_spent)}</div>
                                        <p className="text-sm text-muted-foreground">Total Spent</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{customer.total_orders}</div>
                                        <p className="text-sm text-muted-foreground">Total Orders</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{customer.average_order_value ? formatCurrency(customer.average_order_value) : "Rp 0"}</div>
                                        <p className="text-sm text-muted-foreground">Avg Order Value</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{customer.last_purchase_date ? format(new Date(customer.last_purchase_date), "MMM dd") : "Never"}</div>
                                        <p className="text-sm text-muted-foreground">Last Purchase</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Timeline</CardTitle>
                                <CardDescription>Key milestones and important dates</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="font-medium">Customer Created:</span>
                                        <span>{format(new Date(customer.created_at), "PPP")}</span>
                                    </div>
                                    {customer.conversion_date && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="font-medium">Converted to Customer:</span>
                                            <span>{format(new Date(customer.conversion_date), "PPP")}</span>
                                        </div>
                                    )}
                                    {customer.last_purchase_date && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                            <span className="font-medium">Last Purchase:</span>
                                            <span>{format(new Date(customer.last_purchase_date), "PPP")}</span>
                                        </div>
                                    )}
                                    {customer.last_contact_date && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            <span className="font-medium">Last Contact:</span>
                                            <span>{format(new Date(customer.last_contact_date), "PPP")}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>

            {/* Contact Form */}
            <ContactForm
                open={contactFormOpen}
                onOpenChange={setContactFormOpen}
                customerId={customerId}
                contact={editingContact}
                onSuccess={handleFormSuccess}
            />

            {/* Address Form */}
            <AddressForm
                open={addressFormOpen}
                onOpenChange={setAddressFormOpen}
                customerId={customerId}
                address={editingAddress}
                onSuccess={handleFormSuccess}
            />

            {/* Note Form */}
            <NoteForm
                open={noteFormOpen}
                onOpenChange={setNoteFormOpen}
                customerId={customerId}
                note={editingNote}
                onSuccess={handleFormSuccess}
            />
        </Dialog>
    );
} 