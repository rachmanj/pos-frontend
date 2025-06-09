// ============================================================================
// SALES ORDERS PAGE
// ============================================================================
// Main page for Sales Order Management System
// Displays the comprehensive sales order list with all functionality
// ============================================================================

import { Metadata } from 'next';
import { SalesOrderList } from '@/components/sales-orders/SalesOrderList';

export const metadata: Metadata = {
    title: 'Sales Orders | POS-ATK',
    description: 'Manage B2B sales orders from creation to completion',
};

export default function SalesOrdersPage() {
    return <SalesOrderList />;
}
