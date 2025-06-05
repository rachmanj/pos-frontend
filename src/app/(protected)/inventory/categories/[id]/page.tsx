"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useCategory, useProducts, useDeleteCategory } from "@/hooks/useInventory";
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
    Tag,
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
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function CategoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = parseInt(params.id as string);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useCategory(categoryId);
    const { data: productsData, isLoading: productsLoading } = useProducts({
        category_id: categoryId,
        per_page: 50,
    });
    const deleteCategory = useDeleteCategory();

    const handleDelete = async () => {
        try {
            await deleteCategory.mutateAsync(categoryId);
            router.push("/inventory/categories");
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
        setShowDeleteDialog(false);
    };

    if (categoryLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading category...</p>
                </div>
            </div>
        );
    }

    if (categoryError || !categoryData?.data) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load category. Please try again or go back.
                </AlertDescription>
            </Alert>
        );
    }

    const category = categoryData.data;
    const products = productsData?.data || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/inventory/categories">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center space-x-4">
                        {category.image ? (
                            <img
                                src={category.image}
                                alt={category.name}
                                className="h-12 w-12 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Tag className="h-6 w-6 text-gray-400" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {category.name}
                            </h2>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={category.status === "active" ? "default" : "secondary"}>
                                    {category.status}
                                </Badge>
                                {category.parent && (
                                    <Badge variant="outline">
                                        Parent: {category.parent.name}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/inventory/categories/${categoryId}/edit`}>
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

            {/* Category Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    {category.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {category.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Subcategories */}
                    {category.children && category.children.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center">
                                        <Tag className="mr-2 h-5 w-5" />
                                        Subcategories ({category.children.length})
                                    </span>
                                    <Link href={`/inventory/categories/new?parent_id=${categoryId}`}>
                                        <Button size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Subcategory
                                        </Button>
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {category.children.map((subcategory) => (
                                        <Link
                                            key={subcategory.id}
                                            href={`/inventory/categories/${subcategory.id}`}
                                            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                {subcategory.image ? (
                                                    <img
                                                        src={subcategory.image}
                                                        alt={subcategory.name}
                                                        className="h-8 w-8 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                        <Tag className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {subcategory.name}
                                                    </div>
                                                    {subcategory.products_count !== undefined && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {subcategory.products_count} products
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Products in Category */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center">
                                    <Package className="mr-2 h-5 w-5" />
                                    Products ({products.length})
                                </span>
                                <Link href={`/inventory/products/new?category_id=${categoryId}`}>
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
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {product.unit?.name}
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
                                                        {formatCurrency(product.selling_price)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <span>{product.current_stock || 0}</span>
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
                                        Add products to this category to see them here.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Category Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Activity className="mr-2 h-5 w-5" />
                                Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Products</span>
                                <span className="font-medium">{products.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Subcategories</span>
                                <span className="font-medium">{category.children?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total Value</span>
                                <span className="font-medium">
                                    {formatCurrency(
                                        products.reduce((total, product) =>
                                            total + (product.selling_price * (product.current_stock || 0)), 0
                                        )
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Low Stock Items</span>
                                <span className="font-medium">
                                    {products.filter(p =>
                                        p.current_stock !== undefined &&
                                        p.min_stock_level &&
                                        p.current_stock <= p.min_stock_level
                                    ).length}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</span>
                                <p className="text-sm text-gray-900 dark:text-white">{category.id}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                                <p className="text-sm">
                                    <Badge variant={category.status === "active" ? "default" : "secondary"}>
                                        {category.status}
                                    </Badge>
                                </p>
                            </div>
                            {category.parent && (
                                <div>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Parent Category</span>
                                    <p className="text-sm">
                                        <Link
                                            href={`/inventory/categories/${category.parent.id}`}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            {category.parent.name}
                                        </Link>
                                    </p>
                                </div>
                            )}
                            <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</span>
                                <p className="text-sm text-gray-900 dark:text-white flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {new Date(category.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated</span>
                                <p className="text-sm text-gray-900 dark:text-white flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {new Date(category.updated_at).toLocaleDateString()}
                                </p>
                            </div>
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
                            This action cannot be undone. This will permanently delete the
                            category "{category.name}" and all its subcategories. Products in
                            these categories will need to be reassigned.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete Category
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 