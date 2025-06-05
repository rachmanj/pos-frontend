"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useUnit,
    useUpdateUnit,
    useBaseUnits
} from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Scale, ArrowLeft, Info, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

const unitSchema = z.object({
    name: z.string().min(1, "Unit name is required").max(255),
    symbol: z.string().min(1, "Symbol is required").max(10),
    base_unit_id: z.string().optional(),
    conversion_factor: z.string().min(1, "Conversion factor is required"),
});

type UnitFormData = z.infer<typeof unitSchema>;

export default function EditUnitPage() {
    const router = useRouter();
    const params = useParams();
    const unitId = parseInt(params.id as string);

    const { data: unitData, isLoading: unitLoading, error: unitError } = useUnit(unitId);
    const { data: baseUnitsData, isLoading: baseUnitsLoading } = useBaseUnits();
    const updateUnit = useUpdateUnit();

    const form = useForm<UnitFormData>({
        resolver: zodResolver(unitSchema),
        defaultValues: {
            name: "",
            symbol: "",
            base_unit_id: "none",
            conversion_factor: "1",
        },
    });

    // Load unit data into form when available
    useEffect(() => {
        if (unitData?.data) {
            const unit = unitData.data;
            form.reset({
                name: unit.name,
                symbol: unit.symbol,
                base_unit_id: unit.base_unit_id?.toString() || "none",
                conversion_factor: unit.conversion_factor.toString(),
            });
        }
    }, [unitData, form]);

    const watchBaseUnit = form.watch("base_unit_id");
    const watchConversionFactor = form.watch("conversion_factor");

    // Auto-adjust conversion factor when base unit changes
    useEffect(() => {
        if (watchBaseUnit === "none") {
            // For base units, conversion factor should always be 1
            form.setValue("conversion_factor", "1");
        }
    }, [watchBaseUnit, form]);

    const onSubmit = async (data: UnitFormData) => {
        try {
            const hasBaseUnit = data.base_unit_id && data.base_unit_id !== "none";
            const formData: any = {
                name: data.name,
                symbol: data.symbol,
                base_unit_id: hasBaseUnit ? parseInt(data.base_unit_id!) : null,
            };

            // Only include conversion_factor for derived units
            if (hasBaseUnit) {
                formData.conversion_factor = parseFloat(data.conversion_factor);
            }

            await updateUnit.mutateAsync({ id: unitId, data: formData });
            router.push("/inventory/units");
        } catch (error) {
            console.error("Failed to update unit:", error);
        }
    };

    const selectedBaseUnit = baseUnitsData?.data?.find(
        unit => unit.id.toString() === watchBaseUnit
    );

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
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Edit Unit
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Update measurement unit information
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Scale className="mr-2 h-5 w-5" />
                                        Unit Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Kilogram, Meter, Liter" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="symbol"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Symbol *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., kg, m, L" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="base_unit_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Base Unit (Optional)</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        disabled={baseUnitsLoading}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select base unit (leave empty for base unit)" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">No Base Unit (This is a base unit)</SelectItem>
                                                            {baseUnitsData?.data?.filter(unit => unit.id !== unitId).map((unit) => (
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

                                    <FormField
                                        control={form.control}
                                        name="conversion_factor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Conversion Factor *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        min="0.0001"
                                                        placeholder="1"
                                                        disabled={watchBaseUnit === "none"}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                {watchBaseUnit === "none" && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Base units always have a conversion factor of 1
                                                    </p>
                                                )}
                                                {watchBaseUnit !== "none" && selectedBaseUnit && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        How many {selectedBaseUnit.symbol} equals 1 of this unit?
                                                    </p>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Conversion Example */}
                                    {watchBaseUnit && selectedBaseUnit && watchConversionFactor && (
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertDescription>
                                                <div className="space-y-1">
                                                    <div className="font-medium">Conversion Example:</div>
                                                    <div>
                                                        1 {form.watch("name") || "unit"} = {watchConversionFactor} {selectedBaseUnit.name}
                                                    </div>
                                                </div>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex space-x-4">
                                <Button
                                    type="submit"
                                    disabled={updateUnit.isPending}
                                    className="flex-1"
                                >
                                    {updateUnit.isPending ? "Updating..." : "Update Unit"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

                {/* Sidebar Information */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Unit Types</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Base Units</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Fundamental units of measurement (e.g., Kilogram, Meter, Liter)
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Derived Units</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Units that are multiples or fractions of base units (e.g., Gram = 0.001 Kilogram)
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Common Examples</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm">
                                <div className="font-medium text-gray-900 dark:text-white">Weight/Mass:</div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    kg (base), g (0.001), lb (0.453592)
                                </div>
                            </div>
                            <div className="text-sm">
                                <div className="font-medium text-gray-900 dark:text-white">Length:</div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    m (base), cm (0.01), ft (0.3048)
                                </div>
                            </div>
                            <div className="text-sm">
                                <div className="font-medium text-gray-900 dark:text-white">Volume:</div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    L (base), mL (0.001), gal (3.78541)
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 