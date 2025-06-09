// ============================================================================
// EDIT SALES ORDER PAGE
// ============================================================================
// Page for editing existing sales orders
// Uses the same form component but in edit mode with pre-populated data
// ============================================================================

import { Metadata } from 'next';
import { SalesOrderForm } from '@/components/sales-orders/SalesOrderForm';

export const metadata: Metadata = {
    title: 'Edit Sales Order | POS-ATK',
    description: 'Edit existing sales order details and items',
};

interface EditSalesOrderPageProps {
    params: {
        id: string;
    };
}

export default function EditSalesOrderPage({ params }: EditSalesOrderPageProps) {
    // Note: The SalesOrderForm component will fetch the order data internally
    // based on the URL or we need to fetch it here and pass it as a prop

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Edit Sales Order</h1>
                <p className="text-muted-foreground">
                    Modify sales order details and items
                </p>
            </div>
            {/* For now, we'll use the form without pre-populated data */}
            {/* TODO: Fetch order data and pass as order prop */}
            <SalesOrderForm />
        </div>
    );
} 