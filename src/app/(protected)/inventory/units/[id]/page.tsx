"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useUnit, useProducts, useDeleteUnit } from "@/hooks/useInventory";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Scale,
    ArrowLeft,
    Edit,
    Trash2,
    Plus,
    Package,
    MoreHorizontal,
    Eye,
    AlertTriangle,
    Loader2,
    Calendar,
    Activity,
    Link2,
    Calculator,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function UnitDetailPage() {
    const params = useParams();
    const router = useRouter();
    const unitId = parseInt(params.id as string);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { data: unitData, isLoading: unitLoading, error: unitError } = useUnit(unitId);
    const { data: productsData, isLoading: productsLoading } = useProducts({
        unit_id: unitId,
        per_page: 50,
    });
    const deleteUnit = useDeleteUnit();

    const handleDelete = async () => {
        try {
            await deleteUnit.mutateAsync(unitId);
            router.push("/inventory/units");
        } catch (error) {
            console.error("Failed to delete unit:", error);
        }
        setShowDeleteDialog(false);
    };

    if (unitLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading unit...</p>
                </div>
            </div>
        );
    }

    if (unitError || !unitData?.data) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load unit. Please try again or go back.
                </AlertDescription>
            </Alert>
        );
    }

    const unit = unitData.data;
    const products = productsData?.data || [];
    const isBaseUnit = !unit.base_unit_id;
    const isDerivedUnit = !!unit.base_unit_id;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/inventory/units">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Scale className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {unit.name}
                            </h2>
                            <div className="flex items-center space-x-2 mt-1">
                                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                                    {unit.symbol}
                                </code>
                                <Badge variant={isBaseUnit ? "default" : "outline"}>
                                    {isBaseUnit ? "Base Unit" : "Derived Unit"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/inventory/units/${unitId}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Unit Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Conversion Information */}
                    {isDerivedUnit && unit.base_unit && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calculator className="mr-2 h-5 w-5" />
                                    Conversion Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Base Unit
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Link2 className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {unit.base_unit.name} ({unit.base_unit.symbol})
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Conversion Factor
                                        </div>
                                        <div className="font-mono text-lg font-medium text-gray-900 dark:text-white">
                                            {unit.conversion_factor}
                                        </div>
                                    </div>
                                </div>

                                <Alert>
                                    <Calculator className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="space-y-2">
                                            <div className="font-medium">Conversion Formula:</div>
                                            <div className="space-y-1 text-sm">
                                                <div>1 {unit.name} = {unit.conversion_factor} {unit.base_unit.name}</div>
                                                <div>1 {unit.base_unit.name} = {(1 / unit.conversion_factor).toFixed(4)} {unit.name}</div>
                                            </div>
                                        </div>
                                    </AlertDescription>
                                </Alert>

                                {/* Example conversions */}
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Example Conversions:
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="font-medium">10 {unit.symbol}</span> = {" "}
                                            <span className="text-green-600 dark:text-green-400">
                                                {(10 * unit.conversion_factor).toFixed(4)} {unit.base_unit.symbol}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium">100 {unit.symbol}</span> = {" "}
                                            <span className="text-green-600 dark:text-green-400">
                                                {(100 * unit.conversion_factor).toFixed(4)} {unit.base_unit.symbol}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium">10 {unit.base_unit.symbol}</span> = {" "}
                                            <span className="text-blue-600 dark:text-blue-400">
                                                {(10 / unit.conversion_factor).toFixed(4)} {unit.symbol}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium">100 {unit.base_unit.symbol}</span> = {" "}
                                            <span className="text-blue-600 dark:text-blue-400">
                                                {(100 / unit.conversion_factor).toFixed(4)} {unit.symbol}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Products Using This Unit */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center">
                                    <Package className="mr-2 h-5 w-5" />
                                    Products Using This Unit ({products.length})
                                </span>
                                <Link href={`/inventory/products/new?unit_id=${unitId}`}>
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Product
                                    </Button>
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {productsLoading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : products.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>SKU</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Stock</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            {product.image ? (
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="h-10 w-10 rounded object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                                    <Package className="h-5 w-5 text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-medium text-gray-900 dark:text-white">
                                                                    {product.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                                                            {product.sku}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.category ? (
                                                            <Link
                                                                href={`/inventory/categories/${product.category.id}`}
                                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                {product.category.name}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">
                                                                {formatCurrency(product.selling_price)}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                per {unit.symbol}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <span>{product.current_stock || 0} {unit.symbol}</span>
                                                            {product.current_stock !== undefined && product.min_stock_level &&
                                                                product.current_stock <= product.min_stock_level && (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        Low
                                                                    </Badge>
                                                                )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={product.status === "active" ? "default" : "secondary"}>
                                                            {product.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/inventory/products/${product.id}`}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/inventory/products/${product.id}/edit`}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                        No products found
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        No products are currently using this unit of measurement.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Unit Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Activity className="mr-2 h-5 w-5" />
                                Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Products Using</span>
                                <span className="font-medium">{products.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Unit Type</span>
                                <span className="font-medium">{isBaseUnit ? "Base" : "Derived"}</span>
                            </div>
                            {isDerivedUnit && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Conversion Factor</span>
                                    <span className="font-medium font-mono">{unit.conversion_factor}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total Inventory Value</span>
                                <span className="font-medium">
                                    {formatCurrency(
                                        products.reduce((total, product) =>
                                            total + (product.selling_price * (product.current_stock || 0)), 0
                                        )
                                    )}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Unit Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</span>
                                <p className="text-sm text-gray-900 dark:text-white">{unit.id}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</span>
                                <p className="text-sm text-gray-900 dark:text-white">{unit.name}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Symbol</span>
                                <p className="text-sm">
                                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                        {unit.symbol}
                                    </code>
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</span>
                                <p className="text-sm">
                                    <Badge variant={isBaseUnit ? "default" : "outline"}>
                                        {isBaseUnit ? "Base Unit" : "Derived Unit"}
                                    </Badge>
                                </p>
                            </div>
                            {isDerivedUnit && unit.base_unit && (
                                <div>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Base Unit</span>
                                    <p className="text-sm">
                                        <Link
                                            href={`/inventory/units/${unit.base_unit.id}`}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            {unit.base_unit.name} ({unit.base_unit.symbol})
                                        </Link>
                                    </p>
                                </div>
                            )}
                            <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</span>
                                <p className="text-sm text-gray-900 dark:text-white flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {new Date(unit.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated</span>
                                <p className="text-sm text-gray-900 dark:text-white flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {new Date(unit.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Conversion Calculator */}
                    {isDerivedUnit && unit.base_unit && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calculator className="mr-2 h-5 w-5" />
                                    Quick Converter
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        1 {unit.symbol}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">=</div>
                                    <div className="text-xl font-medium text-green-600 dark:text-green-400">
                                        {unit.conversion_factor} {unit.base_unit.symbol}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            unit "{unit.name}" ({unit.symbol}). Products using this unit will need to be updated.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete Unit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 