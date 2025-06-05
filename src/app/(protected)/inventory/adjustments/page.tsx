"use client";

import { useState, useMemo } from "react";
import { useProducts, useStockAdjustment, useBulkStockAdjustment } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertTriangle,
    Search,
    Edit,
    Save,
    X,
    CheckCircle2,
    Package,
    Plus,
    Minus,
} from "lucide-react";
import { StockAdjustmentData, Product } from "@/types/inventory";

interface ProductAdjustment extends Product {
    newStock?: number;
    reason?: string;
    isEditing?: boolean;
}

export default function StockAdjustmentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [adjustments, setAdjustments] = useState<ProductAdjustment[]>([]);
    const [showBulkDialog, setShowBulkDialog] = useState(false);
    const [globalReason, setGlobalReason] = useState("");

    const { data: productsData, isLoading, error } = useProducts({
        search: searchTerm,
        page: 1,
        per_page: 50,
    });

    const stockAdjustment = useStockAdjustment();
    const bulkStockAdjustment = useBulkStockAdjustment();

    // Filter products that are not already in adjustments
    const availableProducts = useMemo(() => {
        if (!productsData?.data) return [];
        return productsData.data.filter(
            (product) => !adjustments.find((adj) => adj.id === product.id)
        );
    }, [productsData?.data, adjustments]);

    const addProductToAdjustments = (product: Product) => {
        setAdjustments((prev) => [
            ...prev,
            {
                ...product,
                newStock: product.stock?.current_stock || 0,
                reason: "",
                isEditing: false,
            },
        ]);
    };

    const removeProductFromAdjustments = (productId: number) => {
        setAdjustments((prev) => prev.filter((adj) => adj.id !== productId));
    };

    const updateAdjustment = (productId: number, updates: Partial<ProductAdjustment>) => {
        setAdjustments((prev) =>
            prev.map((adj) => (adj.id === productId ? { ...adj, ...updates } : adj))
        );
    };

    const handleSingleAdjustment = async (adjustment: ProductAdjustment) => {
        if (adjustment.newStock === undefined || !adjustment.reason) return;

        const adjustmentData: StockAdjustmentData = {
            product_id: adjustment.id,
            new_quantity: adjustment.newStock,
            reason: adjustment.reason,
        };

        await stockAdjustment.mutateAsync(adjustmentData);
        removeProductFromAdjustments(adjustment.id);
    };

    const handleBulkAdjustment = async () => {
        const validAdjustments = adjustments.filter(
            (adj) => adj.newStock !== undefined && adj.newStock !== adj.stock?.current_stock
        );

        if (validAdjustments.length === 0 || !globalReason.trim()) return;

        const bulkData = {
            adjustments: validAdjustments.map((adj) => ({
                product_id: adj.id,
                new_quantity: adj.newStock!,
            })),
            reason: globalReason,
        };

        await bulkStockAdjustment.mutateAsync(bulkData);
        setAdjustments([]);
        setGlobalReason("");
        setShowBulkDialog(false);
    };

    const getStockDifference = (current: number, newStock: number) => {
        const diff = newStock - current;
        return {
            difference: diff,
            isIncrease: diff > 0,
            isDecrease: diff < 0,
        };
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load products. Please try again.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Stock Adjustments
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manually adjust stock levels for inventory correction
                    </p>
                </div>
                {adjustments.length > 0 && (
                    <Button
                        onClick={() => setShowBulkDialog(true)}
                        disabled={bulkStockAdjustment.isPending}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Apply Adjustments ({adjustments.length})
                    </Button>
                )}
            </div>

            {/* Search Products */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Search className="mr-2 h-5 w-5" />
                        Find Products to Adjust
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search products by name, SKU, or barcode..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {searchTerm && (
                            <div className="border rounded-lg max-h-60 overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-4 text-center text-gray-500">Loading products...</div>
                                ) : availableProducts.length > 0 ? (
                                    availableProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <Package className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {product.sku} • Current: {product.stock?.current_stock || 0} {product.unit?.symbol}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addProductToAdjustments(product)}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        No products found matching your search.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Adjustments Table */}
            {adjustments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Edit className="mr-2 h-5 w-5" />
                            Stock Adjustments ({adjustments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Current Stock</TableHead>
                                        <TableHead>New Stock</TableHead>
                                        <TableHead>Difference</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adjustments.map((adjustment) => {
                                        const currentStock = adjustment.stock?.current_stock || 0;
                                        const newStock = adjustment.newStock || 0;
                                        const { difference, isIncrease, isDecrease } = getStockDifference(
                                            currentStock,
                                            newStock
                                        );

                                        return (
                                            <TableRow key={adjustment.id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                            <Package className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {adjustment.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {adjustment.sku}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <span className="font-medium">{currentStock}</span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {adjustment.unit?.symbol}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={adjustment.newStock || ""}
                                                        onChange={(e) =>
                                                            updateAdjustment(adjustment.id, {
                                                                newStock: parseFloat(e.target.value) || 0,
                                                            })
                                                        }
                                                        className="w-24"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {difference !== 0 && (
                                                        <div className="flex items-center space-x-1">
                                                            {isIncrease ? (
                                                                <Plus className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <Minus className="h-4 w-4 text-red-600" />
                                                            )}
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    isIncrease
                                                                        ? "text-green-600 border-green-600"
                                                                        : "text-red-600 border-red-600"
                                                                }
                                                            >
                                                                {Math.abs(difference)} {adjustment.unit?.symbol}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Reason for adjustment..."
                                                        value={adjustment.reason || ""}
                                                        onChange={(e) =>
                                                            updateAdjustment(adjustment.id, {
                                                                reason: e.target.value,
                                                            })
                                                        }
                                                        className="min-w-[200px]"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleSingleAdjustment(adjustment)}
                                                            disabled={
                                                                !adjustment.reason ||
                                                                adjustment.newStock === currentStock ||
                                                                stockAdjustment.isPending
                                                            }
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeProductFromAdjustments(adjustment.id)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {adjustments.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <Edit className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            No adjustments pending
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Search for products above to add them for stock adjustment.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Bulk Adjustment Dialog */}
            <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Apply Bulk Stock Adjustments</DialogTitle>
                        <DialogDescription>
                            You are about to adjust stock levels for {adjustments.length} products.
                            Please provide a reason for these adjustments.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="reason">Reason for Adjustments</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g., Physical inventory count, damaged goods, etc."
                                value={globalReason}
                                onChange={(e) => setGlobalReason(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                            <h4 className="font-medium mb-2">Adjustments Summary:</h4>
                            <div className="space-y-2">
                                {adjustments
                                    .filter((adj) => adj.newStock !== adj.stock?.current_stock)
                                    .map((adj) => {
                                        const diff = getStockDifference(
                                            adj.stock?.current_stock || 0,
                                            adj.newStock || 0
                                        );
                                        return (
                                            <div key={adj.id} className="flex justify-between text-sm">
                                                <span>{adj.name}</span>
                                                <span
                                                    className={
                                                        diff.isIncrease ? "text-green-600" : "text-red-600"
                                                    }
                                                >
                                                    {diff.isIncrease ? "+" : ""}{diff.difference} {adj.unit?.symbol}
                                                </span>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkAdjustment}
                            disabled={!globalReason.trim() || bulkStockAdjustment.isPending}
                        >
                            {bulkStockAdjustment.isPending ? "Applying..." : "Apply Adjustments"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 