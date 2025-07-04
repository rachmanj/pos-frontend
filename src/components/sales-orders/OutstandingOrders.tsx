// ============================================================================
// OUTSTANDING ORDERS COMPONENT
// ============================================================================
// Display and manage orders that are pending delivery or completion with
// filtering and prioritization capabilities
// ============================================================================

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ClipboardList,
    Search,
    Eye,
    Truck,
    Calendar,
    AlertTriangle,
    Clock,
    DollarSign,
    Package,
    RefreshCw,
    Filter
} from 'lucide-react';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { SalesOrder, SalesOrderStatus } from '@/types/sales-orders';
import { formatCurrency } from '@/lib/utils';

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
    status: SalesOrderStatus;
    className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
    const statusConfig = {
        draft: { label: "Draft", variant: "secondary" as const, className: "bg-gray-100 text-gray-800" },
        confirmed: { label: "Confirmed", variant: "default" as const, className: "bg-blue-100 text-blue-800" },
        approved: { label: "Approved", variant: "default" as const, className: "bg-green-100 text-green-800" },
        in_progress: { label: "In Progress", variant: "default" as const, className: "bg-yellow-100 text-yellow-800" },
        completed: { label: "Completed", variant: "default" as const, className: "bg-emerald-100 text-emerald-800" },
        cancelled: { label: "Cancelled", variant: "destructive" as const, className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className={`${config.className} ${className}`}>
            {config.label}
        </Badge>
    );
};

// ============================================================================
// PRIORITY INDICATOR
// ============================================================================

interface PriorityIndicatorProps {
    daysOverdue: number;
}

const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ daysOverdue }) => {
    if (daysOverdue <= 0) {
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                On Time
            </Badge>
        );
    } else if (daysOverdue <= 3) {
        return (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                {daysOverdue}d Late
            </Badge>
        );
    } else {
        return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {daysOverdue}d Overdue
            </Badge>
        );
    }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const OutstandingOrders: React.FC = () => {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const { salesOrders, isLoading } = useSalesOrders();

    // Filter orders for outstanding status
    const outstandingStatuses = ["confirmed", "approved", "in_progress"];
    const allOrders = salesOrders.data?.data || [];

    const filteredOrders = allOrders.filter(order => {
        // Filter by outstanding status
        if (!outstandingStatuses.includes(order.order_status)) return false;

        // Filter by search
        if (search && !order.sales_order_number.toLowerCase().includes(search.toLowerCase()) &&
            !order.customer?.name.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }

        // Filter by status
        if (statusFilter !== "all" && order.order_status !== statusFilter) {
            return false;
        }

        // Filter by priority
        if (priorityFilter !== "all") {
            const deliveryDate = new Date(order.requested_delivery_date);
            const today = new Date();
            const daysOverdue = Math.floor((today.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));

            if (priorityFilter === "overdue" && daysOverdue <= 0) return false;
            if (priorityFilter === "urgent" && (daysOverdue <= 0 || daysOverdue > 7)) return false;
            if (priorityFilter === "ontime" && daysOverdue > 0) return false;
        }

        return true;
    });

    // Sort by priority (most overdue first)
    const sortedOrders = filteredOrders.sort((a, b) => {
        const aDeliveryDate = new Date(a.requested_delivery_date);
        const bDeliveryDate = new Date(b.requested_delivery_date);
        return aDeliveryDate.getTime() - bDeliveryDate.getTime(); // Earlier dates first
    });

    const calculateDaysOverdue = (deliveryDate: string) => {
        const delivery = new Date(deliveryDate);
        const today = new Date();
        return Math.floor((today.getTime() - delivery.getTime()) / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Outstanding Orders</h2>
                    <p className="text-muted-foreground">
                        Orders pending delivery or completion
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    {filteredOrders.length} of {allOrders.filter(o => outstandingStatuses.includes(o.order_status)).length} orders
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Order number, customer..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority Filter */}
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                    <SelectItem value="urgent">Urgent (1-7 days)</SelectItem>
                                    <SelectItem value="ontime">On Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reset Button */}
                        <div className="space-y-2">
                            <Label>&nbsp;</Label>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("all");
                                    setPriorityFilter("all");
                                }}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Outstanding Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Outstanding Orders ({filteredOrders.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin" />
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No Outstanding Orders</h3>
                            <p>All orders are either completed or cancelled</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Delivery Date</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedOrders.map((order) => {
                                        const daysOverdue = calculateDaysOverdue(order.requested_delivery_date);

                                        return (
                                            <TableRow key={order.id} className={daysOverdue > 3 ? "bg-red-50" : daysOverdue > 0 ? "bg-yellow-50" : ""}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{order.sales_order_number}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {new Date(order.order_date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{order.customer?.name}</div>
                                                        {order.customer?.company_name && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {order.customer.company_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(order.requested_delivery_date).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <PriorityIndicator daysOverdue={daysOverdue} />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={order.order_status} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4" />
                                                        {formatCurrency(order.total_amount)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4" />
                                                        {order.items_count || order.items?.length || 0}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.push(`/sales-orders/${order.id}`)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </Button>
                                                        {order.order_status === "approved" && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => router.push(`/delivery-orders/create?sales_order_id=${order.id}`)}
                                                            >
                                                                <Truck className="h-4 w-4 mr-2" />
                                                                Create Delivery
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            Overdue Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {filteredOrders.filter(order => calculateDaysOverdue(order.requested_delivery_date) > 0).length}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Require immediate attention
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            Due This Week
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {filteredOrders.filter(order => {
                                const deliveryDate = new Date(order.requested_delivery_date);
                                const weekFromNow = new Date();
                                weekFromNow.setDate(weekFromNow.getDate() + 7);
                                return deliveryDate <= weekFromNow && calculateDaysOverdue(order.requested_delivery_date) <= 0;
                            }).length}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Need preparation
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            Total Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(filteredOrders.reduce((sum, order) => sum + order.total_amount, 0))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Outstanding orders value
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OutstandingOrders;
