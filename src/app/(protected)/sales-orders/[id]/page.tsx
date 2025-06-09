// ============================================================================
// SALES ORDER DETAILS PAGE
// ============================================================================
// Page for viewing individual sales order details
// Displays comprehensive order information with tabs for different aspects
// ============================================================================

import { Metadata } from 'next';
import { SalesOrderDetails } from '@/components/sales-orders/SalesOrderDetails';

export const metadata: Metadata = {
    title: 'Sales Order Details | POS-ATK',
    description: 'View detailed information about a specific sales order',
};

interface SalesOrderDetailsPageProps {
    params: {
        id: string;
    };
}

export default function SalesOrderDetailsPage({ params }: SalesOrderDetailsPageProps) {
    const orderId = parseInt(params.id, 10);

    return (
        <div className="container mx-auto py-6">
            <SalesOrderDetails orderId={orderId} />
        </div>
    );
} 