// ============================================================================
// CREATE SALES ORDER PAGE
// ============================================================================
// Page for creating new sales orders in the B2B workflow
// Provides comprehensive form for order creation with customer and product selection
// ============================================================================

import { Metadata } from 'next';
import { SalesOrderForm } from '@/components/sales-orders/SalesOrderForm';

export const metadata: Metadata = {
    title: 'Create Sales Order | POS-ATK',
    description: 'Create new B2B sales order with customer and product selection',
};

export default function CreateSalesOrderPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Create Sales Order</h1>
                <p className="text-muted-foreground">
                    Create a new B2B sales order with customer and product selection
                </p>
            </div>
            <SalesOrderForm />
        </div>
    );
} 