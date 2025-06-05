"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts, useCategories, useDeleteProduct } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    AlertTriangle,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { ProductFilters } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";

export default function ProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category_id") || "");
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
    const [stockFilter, setStockFilter] = useState(searchParams.get("stock") || "");
    const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "name");
    const [sortOrder, setSortOrder] = useState(searchParams.get("sort_order") || "asc");
    const [deleteProductId, setDeleteProductId] = useState<number | null>(null);

    // Build filters object
    const filters: ProductFilters = useMemo(() => {
        const filterObj: ProductFilters = {
            page: 1,
            per_page: 20,
            sort_by: sortBy as any,
            sort_order: sortOrder as any,
        };

        if (searchTerm) filterObj.search = searchTerm;
        if (selectedCategory) filterObj.category_id = parseInt(selectedCategory);
        if (statusFilter) filterObj.status = statusFilter as any;
        if (stockFilter === "low") filterObj.low_stock = true;
        if (stockFilter === "out") filterObj.out_of_stock = true;

        return filterObj;
    }, [searchTerm, selectedCategory, statusFilter, stockFilter, sortBy, sortOrder]);

    const { data: productsData, isLoading, error } = useProducts(filters);
    const { data: categoriesData } = useCategories();
    const deleteProduct = useDeleteProduct();

    const handleDeleteProduct = async () => {
        if (deleteProductId) {
            await deleteProduct.mutateAsync(deleteProductId);
            setDeleteProductId(null);
        }
    };

    const getStockStatus = (product: any) => {
        const currentStock = product.stock?.current_stock || 0;
        if (currentStock === 0) return { status: "out", color: "red", text: "Out of Stock" };
        if (currentStock <= product.min_stock_level) return { status: "low", color: "yellow", text: "Low Stock" };
        return { status: "ok", color: "green", text: "In Stock" };
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your product catalog and inventory
                    </p>
                </div>
                <Link href="/inventory/products/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </Link>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">All Categories</option>
                            {categoriesData?.data?.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        {/* Stock Filter */}
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">All Stock Levels</option>
                            <option value="low">Low Stock</option>
                            <option value="out">Out of Stock</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split("-");
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="sku-asc">SKU (A-Z)</option>
                            <option value="sku-desc">SKU (Z-A)</option>
                            <option value="price-asc">Price (Low-High)</option>
                            <option value="price-desc">Price (High-Low)</option>
                            <option value="stock-asc">Stock (Low-High)</option>
                            <option value="stock-desc">Stock (High-Low)</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                            <Package className="mr-2 h-5 w-5" />
                            Products ({productsData?.pagination?.total || 0})
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
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
                                    {productsData?.data?.map((product) => {
                                        const stockStatus = getStockStatus(product);
                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        {product.image ? (
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="h-10 w-10 rounded-md object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {product.name}
                                                            </div>
                                                            {product.description && (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                                    {product.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {product.sku}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {product.category?.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {formatCurrency(product.selling_price)}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Cost: {formatCurrency(product.cost_price)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium">
                                                            {product.stock?.current_stock || 0}
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {product.unit?.symbol}
                                                        </span>
                                                        {stockStatus.status === "low" && (
                                                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                        )}
                                                        {stockStatus.status === "out" && (
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                        )}
                                                        {stockStatus.status === "ok" && (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        )}
                                                    </div>
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
                                                        {stockStatus.text}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={product.status === "active" ? "default" : "secondary"}
                                                    >
                                                        {product.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/inventory/products/${product.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/inventory/products/${product.id}/edit`}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => setDeleteProductId(product.id)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {productsData?.data?.length === 0 && (
                                <div className="text-center py-12">
                                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                        No products found
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Get started by creating a new product.
                                    </p>
                                    <div className="mt-6">
                                        <Link href="/inventory/products/new">
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Product
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            and all its associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProduct}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 