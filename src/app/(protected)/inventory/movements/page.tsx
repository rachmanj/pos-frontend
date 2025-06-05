"use client";

import { useState } from "react";
import { useStockMovements } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Activity,
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    Calendar,
    Package,
    User,
    MoreHorizontal,
    Eye,
    AlertTriangle,
    RefreshCw,
    Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StockMovementFilters } from "@/types/inventory";

export default function StockMovementsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [movementType, setMovementType] = useState<string>("all");
    const [dateRange, setDateRange] = useState<string>("all");
    const [page, setPage] = useState(1);

    // Build filters
    const filters: StockMovementFilters = {
        page,
        per_page: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(movementType !== "all" && { movement_type: movementType as "in" | "out" }),
        ...(dateRange !== "all" && getDateRangeFilter(dateRange)),
    };

    const { data: movementsData, isLoading, error, refetch } = useStockMovements(filters);

    function getDateRangeFilter(range: string) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (range) {
            case "today":
                return { date_from: startOfDay.toISOString().split('T')[0] };
            case "week":
                const weekAgo = new Date(startOfDay);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return { date_from: weekAgo.toISOString().split('T')[0] };
            case "month":
                const monthAgo = new Date(startOfDay);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return { date_from: monthAgo.toISOString().split('T')[0] };
            default:
                return {};
        }
    }

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPage(1);
    };

    const handleFilterChange = (type: string, value: string) => {
        if (type === "movement_type") {
            setMovementType(value);
        } else if (type === "date_range") {
            setDateRange(value);
        }
        setPage(1);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setMovementType("all");
        setDateRange("all");
        setPage(1);
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load stock movements. Please try again.
                </AlertDescription>
            </Alert>
        );
    }

    const movements = movementsData?.data || [];
    const pagination = movementsData?.pagination;
    const hasActiveFilters = searchTerm || movementType !== "all" || dateRange !== "all";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Stock Movements
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Track all inventory movements and transactions
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Filter className="mr-2 h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Movement Type Filter */}
                        <Select value={movementType} onValueChange={(value) => handleFilterChange("movement_type", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="in">Stock In</SelectItem>
                                <SelectItem value="out">Stock Out</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Date Range Filter */}
                        <Select value={dateRange} onValueChange={(value) => handleFilterChange("date_range", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">Past Week</SelectItem>
                                <SelectItem value="month">Past Month</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Stock Movements Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                            <Activity className="mr-2 h-5 w-5" />
                            Stock Movements ({pagination?.total || 0})
                        </span>
                        {hasActiveFilters && (
                            <Badge variant="outline">
                                {Object.keys(filters).filter(key => key !== "page" && key !== "per_page").length} filters applied
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : movements.length > 0 ? (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit Cost</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {movements.map((movement) => (
                                            <TableRow key={movement.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center text-sm font-medium">
                                                            <Calendar className="mr-1 h-3 w-3 text-gray-400" />
                                                            {new Date(movement.created_at).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(movement.created_at).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        {movement.product.image ? (
                                                            <img
                                                                src={movement.product.image}
                                                                alt={movement.product.name}
                                                                className="h-8 w-8 rounded object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                                <Package className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {movement.product.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {movement.product.sku}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {movement.movement_type === "in" ? (
                                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <TrendingDown className="h-4 w-4 text-red-600" />
                                                        )}
                                                        <Badge
                                                            variant={movement.movement_type === "in" ? "default" : "secondary"}
                                                        >
                                                            {movement.movement_type === "in" ? "Stock In" : "Stock Out"}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <span
                                                            className={`font-medium ${movement.movement_type === "in"
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                                }`}
                                                        >
                                                            {movement.movement_type === "in" ? "+" : "-"}{movement.quantity}
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {movement.product.unit?.symbol}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {movement.unit_cost ? (
                                                            <span className="font-medium">
                                                                {formatCurrency(movement.unit_cost)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {movement.reference_type && movement.reference_id ? (
                                                            <div>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {movement.reference_type}
                                                                </Badge>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    #{movement.reference_id}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">Manual</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <User className="h-3 w-3 text-gray-400" />
                                                        <span className="text-gray-600 dark:text-gray-300">
                                                            {movement.user?.name || "System"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-32 truncate">
                                                        {movement.notes || "-"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>
                                                                <Package className="mr-2 h-4 w-4" />
                                                                View Product
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.total > pagination.per_page && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Showing {pagination.from} to {pagination.to} of {pagination.total} movements
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page - 1)}
                                            disabled={page <= 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                                const pageNum = Math.max(1, Math.min(page - 2, pagination.last_page - 4)) + i;
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={pageNum === page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setPage(pageNum)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page + 1)}
                                            disabled={page >= pagination.last_page}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Activity className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                No stock movements found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {hasActiveFilters
                                    ? "Try adjusting your filters to see more results."
                                    : "Stock movements will appear here as they occur."
                                }
                            </p>
                            {hasActiveFilters && (
                                <div className="mt-6">
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary Stats */}
            {movements.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Activity className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Total Movements
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {pagination?.total || movements.length}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Stock In
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {movements.filter(m => m.movement_type === "in").length}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <TrendingDown className="h-8 w-8 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Stock Out
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {movements.filter(m => m.movement_type === "out").length}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Package className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Products Affected
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {new Set(movements.map(m => m.product.id)).size}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
} 