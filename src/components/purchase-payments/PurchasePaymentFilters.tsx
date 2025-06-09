"use client";

import { useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { usePurchasePayments, type PurchasePaymentFilters } from "@/hooks/usePurchasePayments";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PurchasePaymentFiltersProps {
    filters: PurchasePaymentFilters;
    onFilterChange: (filters: Partial<PurchasePaymentFilters>) => void;
}

export function PurchasePaymentFilters({ filters, onFilterChange }: PurchasePaymentFiltersProps) {
    const [dateFrom, setDateFrom] = useState<Date | undefined>(
        filters.date_from ? new Date(filters.date_from) : undefined
    );
    const [dateTo, setDateTo] = useState<Date | undefined>(
        filters.date_to ? new Date(filters.date_to) : undefined
    );

    const { usePaymentMethods, useSuppliersForPayment } = usePurchasePayments();
    const { data: paymentMethods } = usePaymentMethods();
    const { data: suppliers } = useSuppliersForPayment();

    const handleDateFromChange = (date: Date | undefined) => {
        setDateFrom(date);
        onFilterChange({
            date_from: date ? format(date, "yyyy-MM-dd") : undefined,
        });
    };

    const handleDateToChange = (date: Date | undefined) => {
        setDateTo(date);
        onFilterChange({
            date_to: date ? format(date, "yyyy-MM-dd") : undefined,
        });
    };

    const clearFilters = () => {
        setDateFrom(undefined);
        setDateTo(undefined);
        onFilterChange({
            supplier_id: undefined,
            payment_method_id: undefined,
            status: undefined,
            workflow_status: undefined,
            date_from: undefined,
            date_to: undefined,
            amount_from: undefined,
            amount_to: undefined,
            search: undefined,
        });
    };

    const hasActiveFilters = Object.values(filters).some(value =>
        value !== undefined && value !== "" && value !== null
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Advanced Filters</h3>
                {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Supplier Filter */}
                <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select
                        value={filters.supplier_id?.toString() || "all"}
                        onValueChange={(value) =>
                            onFilterChange({ supplier_id: value === "all" ? undefined : Number(value) })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All suppliers" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All suppliers</SelectItem>
                            {suppliers?.map((supplier: any) => (
                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                    {supplier.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Payment Method Filter */}
                <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select
                        value={filters.payment_method_id?.toString() || "all"}
                        onValueChange={(value) =>
                            onFilterChange({ payment_method_id: value === "all" ? undefined : Number(value) })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All methods" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All methods</SelectItem>
                            {paymentMethods?.map((method: any) => (
                                <SelectItem key={method.id} value={method.id.toString()}>
                                    {method.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={filters.status || "all"}
                        onValueChange={(value) => onFilterChange({ status: value === "all" ? undefined : value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Workflow Status Filter */}
                <div className="space-y-2">
                    <Label htmlFor="workflow-status">Workflow Status</Label>
                    <Select
                        value={filters.workflow_status || "all"}
                        onValueChange={(value) => onFilterChange({ workflow_status: value === "all" ? undefined : value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All workflow statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All workflow statuses</SelectItem>
                            <SelectItem value="pending_approval">Pending Approval</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date From */}
                <div className="space-y-2">
                    <Label>Date From</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateFrom && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateFrom}
                                onSelect={handleDateFromChange}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Date To */}
                <div className="space-y-2">
                    <Label>Date To</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateTo && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateTo}
                                onSelect={handleDateToChange}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Amount From */}
                <div className="space-y-2">
                    <Label htmlFor="amount-from">Amount From</Label>
                    <Input
                        id="amount-from"
                        type="number"
                        placeholder="Minimum amount"
                        value={filters.amount_from || ""}
                        onChange={(e) =>
                            onFilterChange({
                                amount_from: e.target.value ? Number(e.target.value) : undefined
                            })
                        }
                    />
                </div>

                {/* Amount To */}
                <div className="space-y-2">
                    <Label htmlFor="amount-to">Amount To</Label>
                    <Input
                        id="amount-to"
                        type="number"
                        placeholder="Maximum amount"
                        value={filters.amount_to || ""}
                        onChange={(e) =>
                            onFilterChange({
                                amount_to: e.target.value ? Number(e.target.value) : undefined
                            })
                        }
                    />
                </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                    <Label htmlFor="sort-field">Sort By</Label>
                    <Select
                        value={filters.sort_field || "created_at"}
                        onValueChange={(value) => onFilterChange({ sort_field: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="created_at">Created Date</SelectItem>
                            <SelectItem value="payment_date">Payment Date</SelectItem>
                            <SelectItem value="total_amount">Amount</SelectItem>
                            <SelectItem value="payment_number">Payment Number</SelectItem>
                            <SelectItem value="supplier_name">Supplier Name</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sort-direction">Sort Direction</Label>
                    <Select
                        value={filters.sort_direction || "desc"}
                        onValueChange={(value) => onFilterChange({ sort_direction: value as "asc" | "desc" })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sort direction" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">Newest First</SelectItem>
                            <SelectItem value="asc">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
} 