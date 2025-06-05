"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useCategory,
    useUpdateCategory,
    useCategories
} from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tag, ArrowLeft, Upload, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

const categorySchema = z.object({
    name: z.string().min(1, "Category name is required").max(255),
    description: z.string().optional(),
    parent_id: z.string().optional(),
    status: z.enum(["active", "inactive"]),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function EditCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const categoryId = parseInt(params.id as string);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useCategory(categoryId);
    const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
    const updateCategory = useUpdateCategory();

    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            description: "",
            parent_id: "none",
            status: "active",
        },
    });

    // Load category data into form when available
    useEffect(() => {
        if (categoryData?.data) {
            const category = categoryData.data;
            form.reset({
                name: category.name,
                description: category.description || "",
                parent_id: category.parent_id?.toString() || "none",
                status: category.status,
            });

            if (category.image) {
                setImagePreview(category.image);
            }
        }
    }, [categoryData, form]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: CategoryFormData) => {
        try {
            const formData = {
                ...data,
                parent_id: data.parent_id && data.parent_id !== "none" ? parseInt(data.parent_id) : undefined,
                image: imagePreview || undefined,
            };

            await updateCategory.mutateAsync({ id: categoryId, data: formData });
            router.push("/inventory/categories");
        } catch (error) {
            console.error("Failed to update category:", error);
        }
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
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Edit Category
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Update category information
                        </p>
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Category Information */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Tag className="mr-2 h-5 w-5" />
                                        Category Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter category name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Status *</FormLabel>
                                                    <FormControl>
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="active">Active</SelectItem>
                                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Enter category description"
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="parent_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Parent Category</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        disabled={categoriesLoading}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select parent category (optional)" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">No Parent (Root Category)</SelectItem>
                                                            {categoriesData?.data?.filter(cat => cat.id !== categoryId).map((category) => (
                                                                <SelectItem
                                                                    key={category.id}
                                                                    value={category.id.toString()}
                                                                >
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Category Image */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Category Image</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                        {imagePreview ? (
                                            <div className="space-y-4">
                                                <img
                                                    src={imagePreview}
                                                    alt="Category preview"
                                                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setImageFile(null);
                                                        setImagePreview(null);
                                                    }}
                                                >
                                                    Remove Image
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Upload a category image
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                                        PNG, JPG up to 5MB
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="mt-4"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Actions */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={updateCategory.isPending}
                                        >
                                            {updateCategory.isPending ? "Updating..." : "Update Category"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.back()}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
} 