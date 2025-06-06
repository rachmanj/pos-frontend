"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, Calendar, User, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSuppliers } from "@/hooks/use-suppliers";
import type { PurchaseOrderFilters as PurchaseOrderFiltersType } from "@/types/purchasing";

interface PurchaseOrderFiltersProps {
    filters: PurchaseOrderFiltersType;
    onFiltersChange: (filters: PurchaseOrderFiltersType) => void;
}

export function PurchaseOrderFilters({ filters, onFiltersChange }: PurchaseOrderFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<PurchaseOrderFiltersType>(filters);

    const { data: suppliersData } = useSuppliers({
        status: "active",
        per_page: 100,
        page: 1,
    });

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = (key: keyof PurchaseOrderFiltersType, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleClearFilters = () => {
        const clearedFilters: PurchaseOrderFiltersType = {
            per_page: filters.per_page || 20,
            page: 1,
        };
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (localFilters.search) count++;
        if (localFilters.supplier_id) count++;
        if (localFilters.status) count++;
        if (localFilters.date_from) count++;
        if (localFilters.date_to) count++;
        if (localFilters.created_by) count++;
        if (localFilters.approved_by) count++;
        return count;
    };

    const statusOptions = [
        { value: "draft", label: "Draft" },
        { value: "pending_approval", label: "Pending Approval" },
        { value: "approved", label: "Approved" },
        { value: "sent_to_supplier", label: "Sent to Supplier" },
        { value: "partially_received", label: "Partially Received" },
        { value: "fully_received", label: "Fully Received" },
        { value: "cancelled", label: "Cancelled" },
    ];

    const sortOptions = [
        { value: "po_number", label: "PO Number" },
        { value: "order_date", label: "Order Date" },
        { value: "total_amount", label: "Total Amount" },
        { value: "created_at", label: "Created Date" },
    ];

    const activeFiltersCount = getActiveFiltersCount();

    return (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-4">
                    {/* Search and Toggle Row */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by PO number, supplier, or notes..."
                                value={localFilters.search || ""}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filters
                                    {activeFiltersCount > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {activeFiltersCount}
                                        </Badge>
                                    )}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                    {/* Supplier Filter */}
                                    <div className="space-y-2">
                                        <Label htmlFor="supplier" className="flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Supplier
                                        </Label>
                                        <Select
                                            value={localFilters.supplier_id?.toString() || "all"}
                                            onValueChange={(value) => handleFilterChange("supplier_id", value === "all" ? undefined : parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All suppliers" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All suppliers</SelectItem>
                                                {suppliersData?.data?.map((supplier) => (
                                                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                        {supplier.name} ({supplier.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Status Filter */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={localFilters.status || "all"}
                                            onValueChange={(value) => handleFilterChange("status", value === "all" ? undefined : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All statuses</SelectItem>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Date From */}
                                    <div className="space-y-2">
                                        <Label htmlFor="date_from" className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Date From
                                        </Label>
                                        <Input
                                            type="date"
                                            id="date_from"
                                            value={localFilters.date_from || ""}
                                            onChange={(e) => handleFilterChange("date_from", e.target.value || undefined)}
                                        />
                                    </div>

                                    {/* Date To */}
                                    <div className="space-y-2">
                                        <Label htmlFor="date_to" className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Date To
                                        </Label>
                                        <Input
                                            type="date"
                                            id="date_to"
                                            value={localFilters.date_to || ""}
                                            onChange={(e) => handleFilterChange("date_to", e.target.value || undefined)}
                                        />
                                    </div>

                                    {/* Sort By */}
                                    <div className="space-y-2">
                                        <Label htmlFor="sort_by">Sort By</Label>
                                        <Select
                                            value={localFilters.sort_by || "created_at"}
                                            onValueChange={(value) => handleFilterChange("sort_by", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sortOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Sort Order */}
                                    <div className="space-y-2">
                                        <Label htmlFor="sort_order">Sort Order</Label>
                                        <Select
                                            value={localFilters.sort_order || "desc"}
                                            onValueChange={(value) => handleFilterChange("sort_order", value as "asc" | "desc")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="asc">Ascending</SelectItem>
                                                <SelectItem value="desc">Descending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {activeFiltersCount > 0 && (
                                    <div className="flex justify-end mt-4">
                                        <Button variant="outline" size="sm" onClick={handleClearFilters}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Filters
                                        </Button>
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    {/* Active Filters Display */}
                    {activeFiltersCount > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {localFilters.supplier_id && (
                                <Badge variant="outline" className="gap-1">
                                    Supplier: {suppliersData?.data?.find(s => s.id === localFilters.supplier_id)?.name}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => handleFilterChange("supplier_id", undefined)}
                                    />
                                </Badge>
                            )}
                            {localFilters.status && (
                                <Badge variant="outline" className="gap-1">
                                    Status: {statusOptions.find(s => s.value === localFilters.status)?.label}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => handleFilterChange("status", undefined)}
                                    />
                                </Badge>
                            )}
                            {localFilters.date_from && (
                                <Badge variant="outline" className="gap-1">
                                    From: {localFilters.date_from}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => handleFilterChange("date_from", undefined)}
                                    />
                                </Badge>
                            )}
                            {localFilters.date_to && (
                                <Badge variant="outline" className="gap-1">
                                    To: {localFilters.date_to}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => handleFilterChange("date_to", undefined)}
                                    />
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 