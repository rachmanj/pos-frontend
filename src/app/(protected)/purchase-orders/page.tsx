"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PurchaseOrdersTable } from "@/components/purchase-orders/purchase-orders-table";
import { PurchaseOrderFilters } from "@/components/purchase-orders/purchase-order-filters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import type { PurchaseOrderFilters as PurchaseOrderFiltersType } from "@/types/purchasing";

export default function PurchaseOrdersPage() {
    const router = useRouter();
    const [filters, setFilters] = useState<PurchaseOrderFiltersType>({
        per_page: 20,
        page: 1,
    });

    const {
        data: purchaseOrdersData,
        isLoading,
        error,
        refetch
    } = usePurchaseOrders(filters);

    const handleFiltersChange = (newFilters: PurchaseOrderFiltersType) => {
        setFilters({ ...newFilters, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    if (error) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-red-600">
                    Error loading purchase orders: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <PageHeader
                title="Purchase Orders"
                description="Manage purchase orders and procurement"
                action={
                    <Button onClick={() => router.push("/purchase-orders/create")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create PO
                    </Button>
                }
            />

            <div className="space-y-4">
                <PurchaseOrderFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                />

                {isLoading ? (
                    <LoadingSpinner />
                ) : purchaseOrdersData?.data?.length === 0 ? (
                    <EmptyState
                        title="No purchase orders found"
                        description="Get started by creating your first purchase order."
                        action={
                            <Button onClick={() => router.push("/purchase-orders/create")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create PO
                            </Button>
                        }
                    />
                ) : (
                    <PurchaseOrdersTable
                        purchaseOrders={purchaseOrdersData?.data || []}
                        pagination={purchaseOrdersData?.pagination}
                        onPageChange={handlePageChange}
                        onRefresh={refetch}
                    />
                )}
            </div>
        </div>
    );
} 