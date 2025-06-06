"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuppliersTable } from "@/components/suppliers/suppliers-table";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form-dialog";
import { SupplierFilters } from "@/components/suppliers/supplier-filters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useSuppliers } from "@/hooks/use-suppliers";
import type { SupplierFilters as SupplierFiltersType } from "@/types/purchasing";

export default function SuppliersPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [filters, setFilters] = useState<SupplierFiltersType>({
        per_page: 20,
        page: 1,
    });

    const {
        data: suppliersData,
        isLoading,
        error,
        refetch
    } = useSuppliers(filters);

    const handleCreateSuccess = () => {
        setIsCreateDialogOpen(false);
        refetch();
    };

    const handleFiltersChange = (newFilters: SupplierFiltersType) => {
        setFilters({ ...newFilters, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    if (error) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-red-600">
                    Error loading suppliers: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <PageHeader
                title="Suppliers"
                description="Manage your suppliers and vendor relationships"
                action={
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Supplier
                    </Button>
                }
            />

            <div className="space-y-4">
                <SupplierFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                />

                {isLoading ? (
                    <LoadingSpinner />
                ) : suppliersData?.data?.length === 0 ? (
                    <EmptyState
                        title="No suppliers found"
                        description="Get started by adding your first supplier."
                        action={
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Supplier
                            </Button>
                        }
                    />
                ) : (
                    <SuppliersTable
                        suppliers={suppliersData?.data || []}
                        pagination={suppliersData?.pagination}
                        onPageChange={handlePageChange}
                        onRefresh={refetch}
                    />
                )}
            </div>

            <SupplierFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
} 