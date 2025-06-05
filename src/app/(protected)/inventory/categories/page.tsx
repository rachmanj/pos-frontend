"use client";

import { useState } from "react";
import { useCategoryTree, useDeleteCategory } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    AlertTriangle,
    ChevronRight,
    ChevronDown,
    Package,
} from "lucide-react";
import Link from "next/link";
import { Category } from "@/types/inventory";

interface CategoryTreeNodeProps {
    category: Category;
    level: number;
    onDelete: (id: number) => void;
}

function CategoryTreeNode({ category, level, onDelete }: CategoryTreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = category.children && category.children.length > 0;

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                    {/* Expand/Collapse Button */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        disabled={!hasChildren}
                    >
                        {hasChildren ? (
                            isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )
                        ) : (
                            <div className="w-4 h-4" />
                        )}
                    </button>

                    {/* Category Icon */}
                    {category.image ? (
                        <img
                            src={category.image}
                            alt={category.name}
                            className="h-8 w-8 rounded object-cover"
                        />
                    ) : (
                        <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Tag className="h-4 w-4 text-gray-400" />
                        </div>
                    )}

                    {/* Category Info */}
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                                {category.name}
                            </h3>
                            <Badge
                                variant={category.status === "active" ? "default" : "secondary"}
                            >
                                {category.status}
                            </Badge>
                            {category.products_count !== undefined && (
                                <Badge variant="outline">
                                    {category.products_count} products
                                </Badge>
                            )}
                        </div>
                        {category.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
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
                            <Link href={`/inventory/categories/${category.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/inventory/categories/${category.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/inventory/categories/new?parent_id=${category.id}`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Subcategory
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete(category.id)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div className="pl-8 pb-4 pr-4">
                    {category.children?.map((child) => (
                        <CategoryTreeNode
                            key={child.id}
                            category={child}
                            level={level + 1}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CategoriesPage() {
    const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
    const { data: categoryData, isLoading, error } = useCategoryTree();
    const deleteCategory = useDeleteCategory();

    const handleDeleteCategory = async () => {
        if (deleteCategoryId) {
            await deleteCategory.mutateAsync(deleteCategoryId);
            setDeleteCategoryId(null);
        }
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load categories. Please try again.
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
                        Categories
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Organize your products into hierarchical categories
                    </p>
                </div>
                <Link href="/inventory/categories/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </Link>
            </div>

            {/* Categories Tree */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Tag className="mr-2 h-5 w-5" />
                        Category Tree
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : categoryData?.data && categoryData.data.length > 0 ? (
                        <div className="space-y-2">
                            {categoryData.data.map((category) => (
                                <CategoryTreeNode
                                    key={category.id}
                                    category={category}
                                    level={0}
                                    onDelete={setDeleteCategoryId}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Tag className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                No categories found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Get started by creating your first product category.
                            </p>
                            <div className="mt-6">
                                <Link href="/inventory/categories/new">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Category
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Stats */}
            {categoryData?.data && categoryData.data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Tag className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Total Categories
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {categoryData.data.reduce((count, cat) => {
                                            const countChildren = (category: Category): number => {
                                                let total = 1;
                                                if (category.children) {
                                                    total += category.children.reduce(
                                                        (sum, child) => sum + countChildren(child),
                                                        0
                                                    );
                                                }
                                                return total;
                                            };
                                            return count + countChildren(cat);
                                        }, 0)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Package className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Total Products
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {categoryData.data.reduce((total, cat) => {
                                            const countProducts = (category: Category): number => {
                                                let sum = category.products_count || 0;
                                                if (category.children) {
                                                    sum += category.children.reduce(
                                                        (childSum, child) => childSum + countProducts(child),
                                                        0
                                                    );
                                                }
                                                return sum;
                                            };
                                            return total + countProducts(cat);
                                        }, 0)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Tag className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Root Categories
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {categoryData.data.length}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteCategoryId}
                onOpenChange={() => setDeleteCategoryId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            category and all its subcategories. Products in these categories
                            will need to be reassigned.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCategory}
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