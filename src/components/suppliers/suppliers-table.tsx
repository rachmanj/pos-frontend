"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Building2,
    Phone,
    Mail,
    MapPin
} from "lucide-react";
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
import { SupplierFormDialog } from "./supplier-form-dialog";
import { SupplierDetailDialog } from "./supplier-detail-dialog";
import { formatCurrency } from "@/lib/utils";
import { useDeleteSupplier } from "@/hooks/use-suppliers";
import { toast } from "sonner";
import type { Supplier, PaginationData } from "@/types/purchasing";

interface SuppliersTableProps {
    suppliers: Supplier[];
    pagination?: PaginationData;
    onPageChange?: (page: number) => void;
    onRefresh?: () => void;
}

export function SuppliersTable({
    suppliers,
    pagination,
    onPageChange,
    onRefresh,
}: SuppliersTableProps) {
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

    const deleteSupplierMutation = useDeleteSupplier();

    const handleDeleteConfirm = async () => {
        if (!deletingSupplier) return;

        try {
            await deleteSupplierMutation.mutateAsync(deletingSupplier.id);
            toast.success("Supplier deleted successfully");
            setDeletingSupplier(null);
            onRefresh?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete supplier");
        }
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge variant={status === "active" ? "default" : "secondary"}>
                {status}
            </Badge>
        );
    };

    const getPaginationInfo = () => {
        if (!pagination) return "";
        return `Showing ${pagination.from} to ${pagination.to} of ${pagination.total} suppliers`;
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No suppliers found
                                </TableCell>
                            </TableRow>
                        ) : (
                            suppliers.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{supplier.name}</div>
                                                {supplier.contact_person && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {supplier.contact_person}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-sm">{supplier.code}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {supplier.phone && (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                    {supplier.phone}
                                                </div>
                                            )}
                                            {supplier.email && (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                    {supplier.email}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {supplier.city || supplier.country ? (
                                            <div className="flex items-center gap-1 text-sm">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                {[supplier.city, supplier.country].filter(Boolean).join(", ")}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(supplier.status)}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">
                                            {supplier.purchase_orders_count || 0}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">
                                            {supplier.total_purchase_amount
                                                ? formatCurrency(supplier.total_purchase_amount)
                                                : "-"
                                            }
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {format(new Date(supplier.created_at), "MMM dd, yyyy")}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setViewingSupplier(supplier)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setEditingSupplier(supplier)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setDeletingSupplier(supplier)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {getPaginationInfo()}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange?.(pagination.current_page - 1)}
                            disabled={pagination.current_page <= 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange?.(pagination.current_page + 1)}
                            disabled={pagination.current_page >= pagination.last_page}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Dialog */}
            <SupplierFormDialog
                open={!!editingSupplier}
                onOpenChange={(open: boolean) => !open && setEditingSupplier(null)}
                supplier={editingSupplier || undefined}
                onSuccess={() => {
                    setEditingSupplier(null);
                    onRefresh?.();
                }}
            />

            {/* View Dialog */}
            <SupplierDetailDialog
                open={!!viewingSupplier}
                onOpenChange={(open) => !open && setViewingSupplier(null)}
                supplier={viewingSupplier || undefined}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingSupplier} onOpenChange={() => setDeletingSupplier(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the supplier "{deletingSupplier?.name}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 