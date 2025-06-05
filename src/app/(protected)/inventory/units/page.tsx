"use client";

import { useState } from "react";
import { useUnits, useDeleteUnit } from "@/hooks/useInventory";
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
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    AlertTriangle,
    Link2,
} from "lucide-react";
import Link from "next/link";

export default function UnitsPage() {
    const [deleteUnitId, setDeleteUnitId] = useState<number | null>(null);
    const { data: unitsData, isLoading, error } = useUnits();
    const deleteUnit = useDeleteUnit();

    const handleDeleteUnit = async () => {
        if (deleteUnitId) {
            await deleteUnit.mutateAsync(deleteUnitId);
            setDeleteUnitId(null);
        }
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load units. Please try again.
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
                        Units of Measurement
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage measurement units and their conversions
                    </p>
                </div>
                <Link href="/inventory/units/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Unit
                    </Button>
                </Link>
            </div>

            {/* Units Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Scale className="mr-2 h-5 w-5" />
                        Units ({unitsData?.pagination?.total || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(8)].map((_, i) => (
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
                                        <TableHead>Unit Name</TableHead>
                                        <TableHead>Symbol</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Base Unit</TableHead>
                                        <TableHead>Conversion Factor</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {unitsData?.data?.map((unit) => (
                                        <TableRow key={unit.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                        <Scale className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {unit.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                                                    {unit.symbol}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={unit.base_unit_id ? "outline" : "default"}
                                                >
                                                    {unit.base_unit_id ? "Derived" : "Base"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {unit.base_unit ? (
                                                    <div className="flex items-center space-x-1">
                                                        <Link2 className="h-3 w-3 text-gray-400" />
                                                        <span className="text-sm">
                                                            {unit.base_unit.name} ({unit.base_unit.symbol})
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {unit.conversion_factor !== 1 ? (
                                                    <span className="font-mono text-sm">
                                                        {unit.conversion_factor}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
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
                                                            <Link href={`/inventory/units/${unit.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/inventory/units/${unit.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteUnitId(unit.id)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {unitsData?.data?.length === 0 && (
                                <div className="text-center py-12">
                                    <Scale className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                        No units found
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Get started by creating measurement units for your products.
                                    </p>
                                    <div className="mt-6">
                                        <Link href="/inventory/units/new">
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Unit
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Info */}
            {unitsData?.data && unitsData.data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Scale className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Total Units
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {unitsData.data.length}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Scale className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Base Units
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {unitsData.data.filter((unit) => !unit.base_unit_id).length}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Link2 className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Derived Units
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {unitsData.data.filter((unit) => unit.base_unit_id).length}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Common Unit Types Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Common Unit Types</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                Weight/Mass
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                kg, g, lb, oz, ton
                            </p>
                        </div>
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                Length/Distance
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                m, cm, mm, ft, in
                            </p>
                        </div>
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                Volume
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                L, mL, gal, qt, pt
                            </p>
                        </div>
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                Count
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                pcs, dozen, box, pack
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteUnitId}
                onOpenChange={() => setDeleteUnitId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            unit. Products using this unit will need to be updated.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUnit}
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