"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, Calendar, Package, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import type { PurchaseReceiptFilters as PurchaseReceiptFiltersType } from "@/types/purchasing";

interface PurchaseReceiptFiltersProps {
    filters: PurchaseReceiptFiltersType;
    onFiltersChange: (filters: PurchaseReceiptFiltersType) => void;
}

export function PurchaseReceiptFilters({ filters, onFiltersChange }: PurchaseReceiptFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<PurchaseReceiptFiltersType>(filters);

    const { data: purchaseOrdersData } = usePurchaseOrders({
        per_page: 100,
        page: 1,
    });

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = (key: keyof PurchaseReceiptFiltersType, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleClearFilters = () => {
        const clearedFilters: PurchaseReceiptFiltersType = {
            per_page: filters.per_page || 20,
            page: 1,
        };
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (localFilters.purchase_order_id) count++;
        if (localFilters.status) count++;
        if (localFilters.quality_check_status) count++;
        if (localFilters.date_from) count++;
        if (localFilters.date_to) count++;
        if (localFilters.received_by) count++;
        if (localFilters.approved_by) count++;
        if (localFilters.stock_updated !== undefined) count++;
        return count;
    };

    const statusOptions = [
        { value: "draft", label: "Draft" },
        { value: "received", label: "Received" },
        { value: "quality_check", label: "Quality Check" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
    ];

    const qualityStatusOptions = [
        { value: "pending", label: "Pending" },
        { value: "passed", label: "Passed" },
        { value: "failed", label: "Failed" },
        { value: "partial", label: "Partial" },
    ];

    const sortOptions = [
        { value: "receipt_number", label: "Receipt Number" },
        { value: "received_date", label: "Received Date" },
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
                                placeholder="Search by receipt number or notes..."
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
                                    {/* Purchase Order Filter */}
                                    <div className="space-y-2">
                                        <Label htmlFor="purchase_order" className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            Purchase Order
                                        </Label>
                                        <Select
                                            value={localFilters.purchase_order_id?.toString() || "all"}
                                            onValueChange={(value) => handleFilterChange("purchase_order_id", value === "all" ? undefined : parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All purchase orders" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All purchase orders</SelectItem>
                                                {purchaseOrdersData?.data?.map((po) => (
                                                    <SelectItem key={po.id} value={po.id.toString()}>
                                                        {po.po_number} - {po.supplier?.name}
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

                                    {/* Quality Check Status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="quality_status" className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Quality Status
                                        </Label>
                                        <Select
                                            value={localFilters.quality_check_status || "all"}
                                            onValueChange={(value) => handleFilterChange("quality_check_status", value === "all" ? undefined : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All quality statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All quality statuses</SelectItem>
                                                {qualityStatusOptions.map((status) => (
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

                                    {/* Stock Updated Filter */}
                                    <div className="space-y-2">
                                        <Label htmlFor="stock_updated">Stock Updated</Label>
                                        <Select
                                            value={localFilters.stock_updated?.toString() || "all"}
                                            onValueChange={(value) => handleFilterChange("stock_updated", value === "true" ? true : value === "false" ? false : undefined)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All receipts" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All receipts</SelectItem>
                                                <SelectItem value="true">Stock Updated</SelectItem>
                                                <SelectItem value="false">Stock Not Updated</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                            {localFilters.purchase_order_id && (
                                <Badge variant="outline" className="gap-1">
                                    PO: {purchaseOrdersData?.data?.find(po => po.id === localFilters.purchase_order_id)?.po_number}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => handleFilterChange("purchase_order_id", undefined)}
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
                            {localFilters.quality_check_status && (
                                <Badge variant="outline" className="gap-1">
                                    Quality: {qualityStatusOptions.find(s => s.value === localFilters.quality_check_status)?.label}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => handleFilterChange("quality_check_status", undefined)}
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
                            {localFilters.stock_updated !== undefined && (
                                <Badge variant="outline" className="gap-1">
                                    Stock: {localFilters.stock_updated ? "Updated" : "Not Updated"}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => handleFilterChange("stock_updated", undefined)}
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