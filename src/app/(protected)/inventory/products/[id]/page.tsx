"use client";

import { useParams, useRouter } from "next/navigation";
import {
    useProduct,
    useProductStockHistory,
    useDeleteProduct
} from "@/hooks/useInventory";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Package,
    ArrowLeft,
    Edit,
    Trash2,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Loader2,
    DollarSign,
    CheckCircle2,
    XCircle,
    Tag,
    Scale,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = parseInt(params.id as string);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { data: productData, isLoading: productLoading, error: productError } = useProduct(productId);
    const { data: stockHistoryData, isLoading: historyLoading } = useProductStockHistory(productId);
    const deleteProduct = useDeleteProduct();

    const handleDelete = async () => {
        try {
            await deleteProduct.mutateAsync(productId);
            router.push("/inventory/products");
        } catch (error) {
            console.error("Failed to delete product:", error);
        }
    };

    const getStockStatus = (product: any) => {
        const currentStock = product.stock?.current_stock || 0;
        if (currentStock === 0) return { status: "out", color: "red", text: "Out of Stock", icon: XCircle };
        if (currentStock <= product.min_stock_level) return { status: "low", color: "yellow", text: "Low Stock", icon: AlertTriangle };
        return { status: "ok", color: "green", text: "In Stock", icon: CheckCircle2 };
    };

    if (productLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
                </div>
            </div>
        );
    }

    if (productError || !productData?.data) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load product. Please try again or go back.
                </AlertDescription>
            </Alert>
        );
    }

    const product = productData.data;
    const stockStatus = getStockStatus(product);
    const StockIcon = stockStatus.icon;
    const costPrice = Number(product.cost_price) || 0;
    const sellingPrice = Number(product.selling_price) || 0;
    const profit = sellingPrice - costPrice;
    const profitMargin = costPrice > 0 ? ((profit / costPrice) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/inventory/products">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {product.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            SKU: {product.sku}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href={`/inventory/products/${product.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Product Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="mr-2 h-5 w-5" />
                                Product Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Product Name</h4>
                                    <p className="text-gray-600 dark:text-gray-400">{product.name}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">SKU</h4>
                                    <p className="font-mono text-gray-600 dark:text-gray-400">{product.sku}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Category</h4>
                                    <Badge variant="outline" className="flex items-center w-fit">
                                        <Tag className="mr-1 h-3 w-3" />
                                        {product.category?.name}
                                    </Badge>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Unit</h4>
                                    <Badge variant="outline" className="flex items-center w-fit">
                                        <Scale className="mr-1 h-3 w-3" />
                                        {product.unit?.name} ({product.unit?.symbol})
                                    </Badge>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Status</h4>
                                    <Badge variant={product.status === "active" ? "default" : "secondary"}>
                                        {product.status}
                                    </Badge>
                                </div>
                                {product.barcode && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Barcode</h4>
                                        <p className="font-mono text-gray-600 dark:text-gray-400">{product.barcode}</p>
                                    </div>
                                )}
                            </div>
                            {product.description && (
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Description</h4>
                                    <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pricing Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <DollarSign className="mr-2 h-5 w-5" />
                                Pricing & Profitability
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(costPrice)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Cost Price</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(sellingPrice)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Selling Price</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatCurrency(profit)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Profit ({profitMargin.toFixed(1)}%)
                                    </div>
                                </div>
                            </div>
                            {product.tax_rate > 0 && (
                                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="text-sm">
                                        <span className="font-medium">Tax Rate:</span> {product.tax_rate}%
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stock History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Movement History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {historyLoading ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    <p className="text-gray-500 dark:text-gray-400">Loading stock history...</p>
                                </div>
                            ) : stockHistoryData?.data && stockHistoryData.data.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Notes</TableHead>
                                                <TableHead>User</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stockHistoryData.data.slice(0, 10).map((movement) => (
                                                <TableRow key={movement.id}>
                                                    <TableCell>
                                                        {new Date(movement.created_at).toLocaleDateString()}
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
                                                                {movement.movement_type}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={
                                                            movement.movement_type === "in"
                                                                ? "text-green-600 font-medium"
                                                                : "text-red-600 font-medium"
                                                        }>
                                                            {movement.movement_type === "in" ? "+" : "-"}{movement.quantity}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {movement.notes || "-"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {movement.user?.name}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 dark:text-gray-400">No stock movements recorded</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Product Image */}
                    <Card>
                        <CardContent className="pt-6">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    <Package className="h-16 w-16 text-gray-400" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stock Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {product.stock?.current_stock || 0}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Current Stock ({product.unit?.symbol})
                                </div>
                                <div className="mt-2">
                                    <Badge
                                        variant="outline"
                                        className={
                                            stockStatus.color === "red"
                                                ? "text-red-600 border-red-600"
                                                : stockStatus.color === "yellow"
                                                    ? "text-yellow-600 border-yellow-600"
                                                    : "text-green-600 border-green-600"
                                        }
                                    >
                                        <StockIcon className="mr-1 h-3 w-3" />
                                        {stockStatus.text}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Minimum Level:</span>
                                    <span className="text-sm font-medium">{product.min_stock_level}</span>
                                </div>
                                {product.max_stock_level && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Maximum Level:</span>
                                        <span className="text-sm font-medium">{product.max_stock_level}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Available Stock:</span>
                                    <span className="text-sm font-medium">{product.stock?.available_stock || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Reserved Stock:</span>
                                    <span className="text-sm font-medium">{product.stock?.reserved_stock || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href={`/inventory/adjustments?product_id=${product.id}`}>
                                <Button className="w-full justify-start" variant="outline">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Adjust Stock
                                </Button>
                            </Link>
                            <Link href={`/inventory/products/${product.id}/edit`}>
                                <Button className="w-full justify-start" variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Product
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            "{product.name}" and all its associated data including stock history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            disabled={deleteProduct.isPending}
                        >
                            {deleteProduct.isPending ? "Deleting..." : "Delete Product"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 