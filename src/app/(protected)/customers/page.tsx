"use client";

import { useState } from "react";
import { Plus, Search, Filter, Download, Users, TrendingUp, DollarSign, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomersCrm, useCustomerCrmAnalytics, CustomerCrmFilters } from "@/hooks/useCustomerCrm";
import { formatCurrency } from "@/lib/utils";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerFilters } from "@/components/customers/CustomerFilters";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { CustomerDetails } from "@/components/customers/CustomerDetails";
import { CustomerAnalytics } from "@/components/customers/CustomerAnalytics";
import { CustomerCrm } from "@/hooks/useCustomerCrm";

export default function CustomersPage() {
    const [filters, setFilters] = useState<CustomerCrmFilters>({
        per_page: 20,
        sort_field: "created_at",
        sort_direction: "desc",
    });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<CustomerCrm | null>(null);
    const [viewingCustomerId, setViewingCustomerId] = useState<number | null>(null);

    const { data: customers, isLoading: customersLoading } = useCustomersCrm(filters);
    const { data: analytics, isLoading: analyticsLoading } = useCustomerCrmAnalytics();

    const handleFilterChange = (newFilters: Partial<CustomerCrmFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleSearch = (search: string) => {
        setFilters(prev => ({ ...prev, search }));
    };

    const handleCreateSuccess = () => {
        setShowCreateForm(false);
        // Refresh the customer list
    };

    const handleEditSuccess = () => {
        setEditingCustomer(null);
        // Refresh the customer list
    };

    const handleViewCustomer = (customerId: number) => {
        setViewingCustomerId(customerId);
    };

    const handleEditCustomer = (customer: CustomerCrm) => {
        setEditingCustomer(customer);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
                    <p className="text-muted-foreground">
                        Comprehensive CRM system for managing customer relationships
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Customer
                    </Button>
                </div>
            </div>

            {/* Analytics Cards */}
            {!analyticsLoading && analytics && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.total_customers.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                +{analytics.new_customers_this_month} this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.active_customers.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {((analytics.active_customers / analytics.total_customers) * 100).toFixed(1)}% of total
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(analytics.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                Avg: {formatCurrency(analytics.average_order_value)} per order
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.vip_customers.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {((analytics.vip_customers / analytics.total_customers) * 100).toFixed(1)}% of total
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            <Tabs defaultValue="customers" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="customers">Customer List</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="customers" className="space-y-4">
                    {/* Search and Quick Filters */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search customers..."
                                className="pl-10"
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <Select
                            value={filters.type || "all"}
                            onValueChange={(value) => handleFilterChange({ type: value === "all" ? undefined : value })}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Customer Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="regular">Regular</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                                <SelectItem value="wholesale">Wholesale</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.status || "all"}
                            onValueChange={(value) => handleFilterChange({ status: value === "all" ? undefined : value })}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.lead_stage || "all"}
                            onValueChange={(value) => handleFilterChange({ lead_stage: value === "all" ? undefined : value })}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Lead Stage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stages</SelectItem>
                                <SelectItem value="lead">Lead</SelectItem>
                                <SelectItem value="prospect">Prospect</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Advanced Filters</CardTitle>
                                <CardDescription>
                                    Use advanced filters to find specific customers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CustomerFilters
                                    filters={filters}
                                    onFiltersChange={handleFilterChange}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Customer Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customers</CardTitle>
                            <CardDescription>
                                {customers?.data?.length || 0} customers found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CustomerTable
                                customers={customers}
                                loading={customersLoading}
                                filters={filters}
                                onFiltersChange={handleFilterChange}
                                onViewCustomer={handleViewCustomer}
                                onEditCustomer={handleEditCustomer}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <CustomerAnalytics analytics={analytics} loading={analyticsLoading} />
                </TabsContent>
            </Tabs>

            {/* Create Customer Form */}
            <CustomerForm
                open={showCreateForm}
                onOpenChange={setShowCreateForm}
                onSuccess={handleCreateSuccess}
            />

            {/* Edit Customer Form */}
            <CustomerForm
                open={!!editingCustomer}
                onOpenChange={(open: boolean) => !open && setEditingCustomer(null)}
                customer={editingCustomer || undefined}
                onSuccess={handleEditSuccess}
            />

            {/* Customer Details */}
            {viewingCustomerId && (
                <CustomerDetails
                    open={!!viewingCustomerId}
                    onOpenChange={(open: boolean) => !open && setViewingCustomerId(null)}
                    customerId={viewingCustomerId}
                    onEdit={handleEditCustomer}
                />
            )}
        </div>
    );
}