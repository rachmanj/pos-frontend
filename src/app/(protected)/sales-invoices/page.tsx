'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Send, Eye, Calendar, DollarSign } from 'lucide-react';

export default function SalesInvoicesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales Invoices</h1>
                    <p className="text-muted-foreground">
                        Generate, manage, and track customer invoices and billing
                    </p>
                </div>
            </div>

            {/* Coming Soon Banner */}
            <Card className="border-2 border-dashed border-muted-foreground/25">
                <CardHeader className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Sales Invoices Module</CardTitle>
                    <CardDescription className="text-base">
                        Advanced invoice management system coming soon
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            This module will provide comprehensive invoice generation, customer billing management,
                            payment tracking, and automated invoice workflows.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Planned Features Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invoice Generation</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Create professional invoices from sales orders and delivery orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">PDF Export</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Download and print professional PDF invoices with company branding
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Email Integration</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Send invoices directly to customers via email with tracking
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Payment Tracking</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Track invoice payments and integrate with accounts receivable
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aging Reports</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Monitor overdue invoices and customer payment patterns
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Custom Templates</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Customize invoice layouts and branding for different business needs
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions (Disabled) */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Common invoice operations (available when module is implemented)
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    <Button disabled variant="outline" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Create Invoice
                    </Button>
                    <Button disabled variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Bulk Export
                    </Button>
                    <Button disabled variant="outline" className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Reminders
                    </Button>
                    <Button disabled variant="outline" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Payment Reports
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
