"use client";

import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Building2,
    Phone,
    Mail,
    MapPin,
    FileText,
    CreditCard,
    Calendar,
    TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { useSupplierPerformance } from "@/hooks/use-suppliers";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Supplier } from "@/types/purchasing";

interface SupplierDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier?: Supplier;
}

export function SupplierDetailDialog({
    open,
    onOpenChange,
    supplier,
}: SupplierDetailDialogProps) {
    const { data: performanceData, isLoading: isLoadingPerformance } = useSupplierPerformance(
        supplier?.id || 0
    );

    if (!supplier) return null;

    const getStatusBadge = (status: string) => {
        return (
            <Badge variant={status === "active" ? "default" : "secondary"}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {supplier.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                                    <div className="font-medium">{supplier.name}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Code</div>
                                    <div className="font-mono">{supplier.code}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                                    <div>{getStatusBadge(supplier.status)}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Contact Person</div>
                                    <div>{supplier.contact_person || "-"}</div>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Created Date</div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {format(new Date(supplier.created_at), "MMMM dd, yyyy")}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {supplier.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Email</div>
                                        <div>{supplier.email}</div>
                                    </div>
                                </div>
                            )}

                            {supplier.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Phone</div>
                                        <div>{supplier.phone}</div>
                                    </div>
                                </div>
                            )}

                            {(supplier.address || supplier.city || supplier.country) && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Address</div>
                                        <div className="space-y-1">
                                            {supplier.address && <div>{supplier.address}</div>}
                                            {(supplier.city || supplier.country) && (
                                                <div>
                                                    {[supplier.city, supplier.country].filter(Boolean).join(", ")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Business Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Business Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {supplier.tax_number && (
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Tax Number</div>
                                        <div>{supplier.tax_number}</div>
                                    </div>
                                </div>
                            )}

                            {supplier.payment_terms && (
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Payment Terms</div>
                                        <div>{supplier.payment_terms}</div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingPerformance ? (
                                <LoadingSpinner size="sm" />
                            ) : performanceData ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
                                            <div className="text-2xl font-bold">
                                                {performanceData.data.total_orders}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
                                            <div className="text-2xl font-bold">
                                                {formatCurrency(performanceData.data.total_amount)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Avg. Delivery Time</div>
                                            <div className="text-lg font-semibold">
                                                {performanceData.data.average_delivery_time} days
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">On-time Delivery</div>
                                            <div className="text-lg font-semibold">
                                                {(performanceData.data.on_time_delivery_rate * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Quality Rating</div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-lg font-semibold">
                                                {performanceData.data.quality_rating.toFixed(1)}/5.0
                                            </div>
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <div
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= performanceData.data.quality_rating
                                                                ? "text-yellow-400"
                                                                : "text-gray-300"
                                                            }`}
                                                    >
                                                        ★
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No performance data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
} 