"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useCreateProduct,
    useCategories,
    useUnits
} from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Package, ArrowLeft, Upload, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const productSchema = z.object({
    name: z.string().min(1, "Product name is required").max(255),
    description: z.string().optional(),
    sku: z.string().min(1, "SKU is required").max(100),
    barcode: z.string().optional(),
    category_id: z.string().min(1, "Category is required"),
    unit_id: z.string().min(1, "Unit is required"),
    cost_price: z.string().min(1, "Cost price is required"),
    selling_price: z.string().min(1, "Selling price is required"),
    min_stock_level: z.string().min(1, "Minimum stock level is required"),
    max_stock_level: z.string().optional(),
    tax_rate: z.string().min(0).max(100),
    initial_stock: z.string().min(0).optional(),
    status: z.enum(["active", "inactive"]),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function NewProductPage() {
    const router = useRouter();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            sku: "",
            barcode: "",
            category_id: "",
            unit_id: "",
            cost_price: "",
            selling_price: "",
            min_stock_level: "",
            max_stock_level: "",
            status: "active",
            tax_rate: "0",
            initial_stock: "0",
        },
    });

    const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
    const { data: unitsData, isLoading: unitsLoading } = useUnits();
    const createProduct = useCreateProduct();

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

    const onSubmit = async (data: ProductFormData) => {
        try {
            const formData = {
                ...data,
                category_id: parseInt(data.category_id),
                unit_id: parseInt(data.unit_id),
                cost_price: parseFloat(data.cost_price),
                selling_price: parseFloat(data.selling_price),
                min_stock_level: parseInt(data.min_stock_level),
                max_stock_level: data.max_stock_level ? parseInt(data.max_stock_level) : undefined,
                tax_rate: parseFloat(data.tax_rate),
                initial_stock: data.initial_stock ? parseInt(data.initial_stock) : undefined,
                image: imagePreview || undefined,
            };

            await createProduct.mutateAsync(formData);
            router.push("/inventory/products");
        } catch (error) {
            console.error("Failed to create product:", error);
        }
    };

    const costPriceStr = form.watch("cost_price") || "0";
    const sellingPriceStr = form.watch("selling_price") || "0";
    const costPrice = parseFloat(costPriceStr) || 0;
    const sellingPrice = parseFloat(sellingPriceStr) || 0;
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
                            Add New Product
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Create a new product in your inventory
                        </p>
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Product Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Package className="mr-2 h-5 w-5" />
                                        Product Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter product name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="sku"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SKU *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter SKU" {...field} />
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
                                                        placeholder="Enter product description"
                                                        className="min-h-[80px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="barcode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Barcode</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter barcode" {...field} />
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
                                </CardContent>
                            </Card>

                            {/* Category & Unit */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Category & Unit</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="category_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category *</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                            disabled={categoriesLoading}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {categoriesData?.data?.map((category) => (
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

                                        <FormField
                                            control={form.control}
                                            name="unit_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit *</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                            disabled={unitsLoading}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select unit" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {unitsData?.data?.map((unit) => (
                                                                    <SelectItem
                                                                        key={unit.id}
                                                                        value={unit.id.toString()}
                                                                    >
                                                                        {unit.name} ({unit.symbol})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="cost_price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cost Price *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="0.00"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="selling_price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Selling Price *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="0.00"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="tax_rate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tax Rate (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            placeholder="0.00"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Profit Calculation */}
                                    {costPrice > 0 && sellingPrice > 0 && (
                                        <Alert>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                <div className="space-y-1">
                                                    <div>Profit: {formatCurrency(profit)}</div>
                                                    <div>Profit Margin: {profitMargin.toFixed(2)}%</div>
                                                </div>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Inventory */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventory</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="initial_stock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Initial Stock</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="min_stock_level"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Min Stock Level *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="max_stock_level"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Stock Level</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Optional"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Product Image */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Image</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                        {imagePreview ? (
                                            <div className="space-y-4">
                                                <img
                                                    src={imagePreview}
                                                    alt="Product preview"
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
                                                        Upload a product image
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
                                            disabled={createProduct.isPending}
                                        >
                                            {createProduct.isPending ? "Creating..." : "Create Product"}
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