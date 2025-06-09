"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesList } from "@/components/sales/SalesList";
import { SalesAnalytics } from "@/components/sales/SalesAnalytics";
import { useSales } from "@/hooks/useSales";
import { SaleFilters } from "@/hooks/useSales";

export default function SalesPage() {
    const [filters, setFilters] = useState<SaleFilters>({
        sort_field: "sale_date",
        sort_direction: "desc",
        per_page: 15,
    });

    const { data: salesData, isLoading, error } = useSales(filters);

    const handleFiltersChange = (newFilters: Partial<SaleFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
                <p className="text-muted-foreground">
                    View and manage all sales transactions across your warehouses
                </p>
            </div>

            <Tabs defaultValue="sales-list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="sales-list">Sales Transactions</TabsTrigger>
                    <TabsTrigger value="analytics">Sales Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="sales-list" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Transactions</CardTitle>
                            <CardDescription>
                                Complete list of all sales transactions with filtering and search capabilities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SalesList
                                salesData={salesData}
                                isLoading={isLoading}
                                error={error}
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <SalesAnalytics />
                </TabsContent>
            </Tabs>
        </div>
    );
} 