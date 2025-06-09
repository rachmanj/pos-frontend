"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft,
    Edit,
    FileText,
    Package,
    Truck,
    User,
    Building,
    Calendar,
    DollarSign,
    Phone,
    Mail
} from 'lucide-react';

interface SalesOrderDetailsProps {
    orderId: number;
}

export const SalesOrderDetails: React.FC<SalesOrderDetailsProps> = ({ orderId }) => {
    const router = useRouter();

    const order = {
        id: orderId,
        sales_order_number: `SO-${orderId.toString().padStart(6, '0')}`,
        order_status: 'confirmed',
        order_date: '2025-01-08',
        requested_delivery_date: '2025-01-15',
        subtotal_amount: 100000,
        tax_amount: 11000,
        total_amount: 111000,
        payment_terms_days: 30,
        notes: 'Sample order notes',
        customer: {
            id: 1,
            name: 'PT. Sample Customer',
            email: 'customer@example.com',
            phone: '+62-21-1234567',
            company_name: 'PT. Sample Customer',
            credit_limit: 5000000
        },
        warehouse: {
            id: 1,
            name: 'Main Warehouse',
            location: 'Jakarta'
        },
        items: [
            {
                id: 1,
                product: {
                    id: 1,
                    name: 'Sample Product 1',
                    sku: 'SKU001'
                },
                quantity_ordered: 5,
                unit_price: 20000,
                line_total: 100000,
                delivery_status: 'pending'
            }
        ]
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
            confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800" },
            approved: { label: "Approved", className: "bg-green-100 text-green-800" },
            pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
            completed: { label: "Completed", className: "bg-emerald-100 text-emerald-800" },
            cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
        };

        const config = statusConfig[status] || statusConfig.draft;
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sales Order Details</h1>
                        <p className="text-muted-foreground">Order {order.sales_order_number}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.push(`/sales-orders/${orderId}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Order
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="items">Items</TabsTrigger>
                    <TabsTrigger value="delivery">Delivery</TabsTrigger>
                    <TabsTrigger value="workflow">Workflow</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                                        <p className="text-lg font-semibold">{order.sales_order_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <div className="mt-1">
                                            <StatusBadge status={order.order_status} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                                        <p className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(order.order_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Delivery Date</label>
                                        <p className="flex items-center gap-2">
                                            <Truck className="h-4 w-4" />
                                            {new Date(order.requested_delivery_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Payment Terms</label>
                                        <p className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            {order.payment_terms_days === 0 ? 'Cash' : `Net ${order.payment_terms_days} days`}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(order.total_amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Items Count</label>
                                        <p className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            {order.items?.length || 0} items
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                                        <p className="font-medium">{order.customer?.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Company</label>
                                        <p className="flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            {order.customer.company_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <p className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            {order.customer.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                        <p className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {order.customer.phone}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Credit Limit</label>
                                        <p className="font-medium">{formatCurrency(order.customer.credit_limit)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="items" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead className="text-right">Qty Ordered</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Line Total</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.product?.name}</TableCell>
                                            <TableCell>{item.product?.sku}</TableCell>
                                            <TableCell className="text-right">{item.quantity_ordered}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.line_total)}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={item.delivery_status} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-6 flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(order.subtotal_amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (11%):</span>
                                        <span>{formatCurrency(order.tax_amount)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="delivery" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Delivery tracking will be available here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="workflow" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Workflow</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Order workflow history will be available here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}; 