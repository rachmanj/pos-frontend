"use client";

import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PurchaseReceiptsTable } from "@/components/purchase-receipts/purchase-receipts-table";
import { PurchaseReceiptFormDialog } from "@/components/purchase-receipts/purchase-receipt-form-dialog";
import { PurchaseReceiptFilters } from "@/components/purchase-receipts/purchase-receipt-filters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { usePurchaseReceipts } from "@/hooks/use-purchase-receipts";
import type { PurchaseReceiptFilters as PurchaseReceiptFiltersType } from "@/types/purchasing";

export default function PurchaseReceiptsPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [filters, setFilters] = useState<PurchaseReceiptFiltersType>({
        per_page: 20,
        page: 1,
    });

    const {
        data: receiptsData,
        isLoading,
        error,
        refetch
    } = usePurchaseReceipts(filters);

    const handleCreateSuccess = () => {
        setIsCreateDialogOpen(false);
        refetch();
    };

    const handleFiltersChange = (newFilters: PurchaseReceiptFiltersType) => {
        setFilters({ ...newFilters, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    if (error) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-red-600">
                    Error loading purchase receipts: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <PageHeader
                title="Purchase Receipts"
                description="Manage goods receiving and quality control"
                action={
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Receive Goods
                    </Button>
                }
            />

            <div className="space-y-4">
                <PurchaseReceiptFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                />

                {isLoading ? (
                    <LoadingSpinner />
                ) : receiptsData?.data?.length === 0 ? (
                    <EmptyState
                        title="No purchase receipts found"
                        description="Start receiving goods from your purchase orders."
                        action={
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Package className="mr-2 h-4 w-4" />
                                Receive Goods
                            </Button>
                        }
                    />
                ) : (
                    <PurchaseReceiptsTable
                        receipts={receiptsData?.data || []}
                        pagination={receiptsData?.pagination}
                        onPageChange={handlePageChange}
                        onRefresh={refetch}
                    />
                )}
            </div>

            <PurchaseReceiptFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
} 