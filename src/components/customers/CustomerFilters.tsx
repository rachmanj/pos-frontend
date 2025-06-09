"use client";

import { CustomerCrmFilters } from "@/hooks/useCustomerCrm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomerFiltersProps {
    filters: CustomerCrmFilters;
    onFiltersChange: (filters: Partial<CustomerCrmFilters>) => void;
}

export function CustomerFilters({ filters, onFiltersChange }: CustomerFiltersProps) {
    const handleReset = () => {
        onFiltersChange({
            search: undefined,
            type: undefined,
            status: undefined,
            lead_stage: undefined,
            loyalty_tier: undefined,
            assigned_to: undefined,
            is_blacklisted: undefined,
            has_follow_up: undefined,
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="loyalty_tier">Loyalty Tier</Label>
                <Select
                    value={filters.loyalty_tier || "all"}
                    onValueChange={(value) => onFiltersChange({ loyalty_tier: value === "all" ? undefined : value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select loyalty tier" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="bronze">Bronze</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Input
                    id="assigned_to"
                    type="number"
                    placeholder="User ID"
                    value={filters.assigned_to || ""}
                    onChange={(e) => onFiltersChange({ assigned_to: e.target.value ? parseInt(e.target.value) : undefined })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="blacklisted">Blacklisted Status</Label>
                <Select
                    value={filters.is_blacklisted?.toString() || "all"}
                    onValueChange={(value) => onFiltersChange({ is_blacklisted: value === "true" ? true : value === "false" ? false : undefined })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Blacklist status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="false">Not Blacklisted</SelectItem>
                        <SelectItem value="true">Blacklisted</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="follow_up">Has Follow-up</Label>
                <Select
                    value={filters.has_follow_up?.toString() || "all"}
                    onValueChange={(value) => onFiltersChange({ has_follow_up: value === "true" ? true : value === "false" ? false : undefined })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Follow-up status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Has Follow-up</SelectItem>
                        <SelectItem value="false">No Follow-up</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="sort_field">Sort By</Label>
                <Select
                    value={filters.sort_field || ""}
                    onValueChange={(value) => onFiltersChange({ sort_field: value || undefined })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sort field" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created_at">Created Date</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="total_spent">Total Spent</SelectItem>
                        <SelectItem value="total_orders">Total Orders</SelectItem>
                        <SelectItem value="last_purchase_date">Last Purchase</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="sort_direction">Sort Direction</Label>
                <Select
                    value={filters.sort_direction || ""}
                    onValueChange={(value) => onFiltersChange({ sort_direction: value as "asc" | "desc" || undefined })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sort direction" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-end">
                <Button variant="outline" onClick={handleReset} className="w-full">
                    Reset Filters
                </Button>
            </div>
        </div>
    );
} 