"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PurchaseOrderFormDialog } from "@/components/purchase-orders/purchase-order-form-dialog";
import { usePurchaseOrder } from "@/hooks/use-purchase-orders";
import { toast } from "sonner";

export default function EditPurchaseOrderPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: purchaseOrderData, isLoading, error } = usePurchaseOrder(id);

    useEffect(() => {
        if (purchaseOrderData?.data) {
            const po = purchaseOrderData.data;

            // Check if the purchase order can be edited
            if (po.status !== "draft") {
                toast.error("Only draft purchase orders can be edited");
                router.push(`/purchase-orders/${id}`);
                return;
            }

            // Open the form dialog
            setIsFormOpen(true);
        }
    }, [purchaseOrderData, id, router]);

    const handleSuccess = () => {
        setIsFormOpen(false);
        router.push(`/purchase-orders/${id}`);
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        router.push(`/purchase-orders/${id}`);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-6">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !purchaseOrderData?.data) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Purchase Order Not Found</h2>
                    <p className="mt-2 text-gray-600">The purchase order you're trying to edit doesn't exist.</p>
                    <Button
                        onClick={() => router.push("/purchase-orders")}
                        className="mt-4"
                    >
                        Back to Purchase Orders
                    </Button>
                </div>
            </div>
        );
    }

    const po = purchaseOrderData.data;

    return (
        <div className="container mx-auto py-6 space-y-6">
            <PageHeader
                title={`Edit Purchase Order ${po.po_number}`}
                description="Modify purchase order details and items"
                action={
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/purchase-orders/${id}`)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Details
                    </Button>
                }
            />

            <PurchaseOrderFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSuccess={handleSuccess}
                purchaseOrder={po}
                mode="edit"
            />

            {/* Show a message while the form is loading */}
            {!isFormOpen && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading edit form...</p>
                </div>
            )}
        </div>
    );
} 