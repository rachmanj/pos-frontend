"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, Ban, CheckCircle, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomerCrm, CustomerCrmFilters, useDeleteCustomerCrm, useBlacklistCustomer, useUnblacklistCustomer } from "@/hooks/useCustomerCrm";
import { formatCurrency } from "@/lib/utils";

interface CustomerTableProps {
    customers: any;
    loading: boolean;
    filters: CustomerCrmFilters;
    onFiltersChange: (filters: Partial<CustomerCrmFilters>) => void;
    onViewCustomer?: (customerId: number) => void;
    onEditCustomer?: (customer: CustomerCrm) => void;
}

export function CustomerTable({ customers, loading, filters, onFiltersChange, onViewCustomer, onEditCustomer }: CustomerTableProps) {
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerCrm | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [deleteCustomerId, setDeleteCustomerId] = useState<number | null>(null);
    const [blacklistCustomerId, setBlacklistCustomerId] = useState<number | null>(null);

    const deleteCustomer = useDeleteCustomerCrm();
    const blacklistCustomer = useBlacklistCustomer();
    const unblacklistCustomer = useUnblacklistCustomer();

    const handleSort = (field: string) => {
        const direction = filters.sort_field === field && filters.sort_direction === "asc" ? "desc" : "asc";
        onFiltersChange({ sort_field: field, sort_direction: direction });
    };

    const handleEdit = (customer: CustomerCrm) => {
        if (onEditCustomer) {
            onEditCustomer(customer);
        } else {
            setSelectedCustomer(customer);
            setShowEditForm(true);
        }
    };

    const handleView = (customer: CustomerCrm) => {
        if (onViewCustomer) {
            onViewCustomer(customer.id);
        } else {
            setSelectedCustomer(customer);
            setShowDetails(true);
        }
    };

    const handleDelete = async () => {
        if (deleteCustomerId) {
            await deleteCustomer.mutateAsync(deleteCustomerId);
            setDeleteCustomerId(null);
        }
    };

    const handleBlacklist = async () => {
        if (blacklistCustomerId) {
            await blacklistCustomer.mutateAsync({
                customerId: blacklistCustomerId,
                reason: "Blacklisted via customer management"
            });
            setBlacklistCustomerId(null);
        }
    };

    const handleUnblacklist = async (customerId: number) => {
        await unblacklistCustomer.mutateAsync(customerId);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            active: "default",
            inactive: "secondary",
            suspended: "destructive",
        };
        return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
    };

    const getTypeBadge = (type: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            regular: "outline",
            vip: "default",
            wholesale: "secondary",
            member: "default",
        };
        return <Badge variant={variants[type] || "outline"}>{type}</Badge>;
    };

    const getLoyaltyTierBadge = (tier?: string) => {
        if (!tier) return null;

        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            bronze: "outline",
            silver: "secondary",
            gold: "default",
            platinum: "default",
            diamond: "destructive",
        };
        return <Badge variant={variants[tier] || "outline"}>{tier}</Badge>;
    };

    const getLeadStageBadge = (stage?: string) => {
        if (!stage) return null;

        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            lead: "outline",
            prospect: "secondary",
            qualified: "default",
            customer: "default",
            vip: "destructive",
        };
        return <Badge variant={variants[stage] || "outline"}>{stage}</Badge>;
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
            </div>
        );
    }

    if (!customers?.data?.length) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No customers found</p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort("type")}
                            >
                                Type
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort("status")}
                            >
                                Status
                            </TableHead>
                            <TableHead>Lead Stage</TableHead>
                            <TableHead>Loyalty Tier</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort("total_spent")}
                            >
                                Total Spent
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort("total_orders")}
                            >
                                Orders
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort("last_purchase_date")}
                            >
                                Last Purchase
                            </TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.data.map((customer: CustomerCrm) => (
                            <TableRow key={customer.id}>
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                            {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {customer.name}
                                                {customer.is_blacklisted && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Blacklisted
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {customer.customer_code}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {customer.email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {customer.email}
                                                    </div>
                                                )}
                                                {customer.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{getTypeBadge(customer.type)}</TableCell>
                                <TableCell>{getStatusBadge(customer.status)}</TableCell>
                                <TableCell>{getLeadStageBadge(customer.lead_stage)}</TableCell>
                                <TableCell>{getLoyaltyTierBadge(customer.loyalty_tier)}</TableCell>
                                <TableCell className="font-medium">
                                    {formatCurrency(customer.total_spent)}
                                </TableCell>
                                <TableCell>{customer.total_orders}</TableCell>
                                <TableCell>
                                    {customer.last_purchase_date
                                        ? new Date(customer.last_purchase_date).toLocaleDateString()
                                        : "Never"
                                    }
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleView(customer)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEdit(customer)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {customer.is_blacklisted ? (
                                                <DropdownMenuItem
                                                    onClick={() => handleUnblacklist(customer.id)}
                                                    className="text-green-600"
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Unblacklist
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    onClick={() => setBlacklistCustomerId(customer.id)}
                                                    className="text-orange-600"
                                                >
                                                    <Ban className="mr-2 h-4 w-4" />
                                                    Blacklist
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => setDeleteCustomerId(customer.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {customers?.meta && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Showing {customers.meta.from || 0} to {customers.meta.to || 0} of {customers.meta.total || 0} customers
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onFiltersChange({ page: customers.meta.current_page - 1 })}
                            disabled={!customers.meta.prev_page_url}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onFiltersChange({ page: customers.meta.current_page + 1 })}
                            disabled={!customers.meta.next_page_url}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Customer Form - Handled at page level when onEditCustomer is provided */}
            {!onEditCustomer && showEditForm && selectedCustomer && (
                <div className="text-center p-4 text-muted-foreground">
                    Edit form would be shown here (handled at page level)
                </div>
            )}

            {/* Customer Details - Handled at page level when onViewCustomer is provided */}
            {!onViewCustomer && showDetails && selectedCustomer && (
                <div className="text-center p-4 text-muted-foreground">
                    Customer details would be shown here (handled at page level)
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteCustomerId} onOpenChange={() => setDeleteCustomerId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the customer
                            and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Blacklist Confirmation */}
            <AlertDialog open={!!blacklistCustomerId} onOpenChange={() => setBlacklistCustomerId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Blacklist Customer?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will blacklist the customer and prevent them from making purchases.
                            You can unblacklist them later if needed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBlacklist} className="bg-orange-600 hover:bg-orange-700">
                            Blacklist
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 