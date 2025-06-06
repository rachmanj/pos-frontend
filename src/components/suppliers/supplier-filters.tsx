"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SupplierFilters } from "@/types/purchasing";

interface SupplierFiltersProps {
    filters: SupplierFilters;
    onFiltersChange: (filters: SupplierFilters) => void;
}

export function SupplierFilters({
    filters,
    onFiltersChange,
}: SupplierFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<SupplierFilters>(filters);

    const handleFilterChange = (key: keyof SupplierFilters, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleSearch = (search: string) => {
        handleFilterChange("search", search);
    };

    const clearFilters = () => {
        const clearedFilters: SupplierFilters = {
            per_page: filters.per_page,
            page: 1,
        };
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const hasActiveFilters = Object.entries(localFilters).some(
        ([key, value]) => key !== "per_page" && key !== "page" && value
    );

    return (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search suppliers..."
                            value={localFilters.search || ""}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Advanced Filters Toggle */}
                    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Filter className="mr-2 h-4 w-4" />
                                Advanced Filters
                                {hasActiveFilters && (
                                    <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs">
                                        Active
                                    </span>
                                )}
                            </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select
                                        value={localFilters.status || "all"}
                                        onValueChange={(value) =>
                                            handleFilterChange("status", value === "all" ? undefined : value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* City Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">City</label>
                                    <Input
                                        placeholder="Filter by city"
                                        value={localFilters.city || ""}
                                        onChange={(e) => handleFilterChange("city", e.target.value)}
                                    />
                                </div>

                                {/* Country Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Country</label>
                                    <Input
                                        placeholder="Filter by country"
                                        value={localFilters.country || ""}
                                        onChange={(e) => handleFilterChange("country", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Sort By */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Sort By</label>
                                    <Select
                                        value={localFilters.sort_by || "created_at"}
                                        onValueChange={(value) => handleFilterChange("sort_by", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="name">Name</SelectItem>
                                            <SelectItem value="code">Code</SelectItem>
                                            <SelectItem value="created_at">Created Date</SelectItem>
                                            <SelectItem value="purchase_orders_count">Order Count</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sort Order */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Sort Order</label>
                                    <Select
                                        value={localFilters.sort_order || "desc"}
                                        onValueChange={(value) => handleFilterChange("sort_order", value)}
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

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-muted-foreground"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </CardContent>
        </Card>
    );
} 