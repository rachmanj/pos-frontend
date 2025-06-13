"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Settings, Users, FileText, TrendingUp, ArrowRight } from "lucide-react";
import { TaxSettingsComponent } from "@/components/settings/tax-settings";
import { TaxRateSelector } from "@/components/ui/tax-rate-selector";
import {
    formatTaxRate,
    COMMON_TAX_RATES,
    TAX_EXEMPTION_REASONS,
    getEffectiveTaxRate,
    calculateTax,
    type GlobalTaxSettings,
} from "@/lib/tax-config";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function TaxManagementPage() {
    const [selectedDemoRate, setSelectedDemoRate] = useState<number>(11);
    const [demoAmount, setDemoAmount] = useState<number>(100000);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tax Management</h1>
                    <p className="text-muted-foreground">
                        Configure tax rates, exemptions, and manage tax calculations for your organization
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/demo/tax-management">
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            View Demo Features
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Default Tax Rate</p>
                                <p className="text-2xl font-bold">11%</p>
                                <p className="text-xs text-muted-foreground">Indonesian PPN</p>
                            </div>
                            <Calculator className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tax Methods</p>
                                <p className="text-2xl font-bold">2</p>
                                <p className="text-xs text-muted-foreground">Inclusive & Exclusive</p>
                            </div>
                            <Settings className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Exemption Types</p>
                                <p className="text-2xl font-bold">{TAX_EXEMPTION_REASONS.length}</p>
                                <p className="text-xs text-muted-foreground">Available categories</p>
                            </div>
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tax Rates</p>
                                <p className="text-2xl font-bold">{COMMON_TAX_RATES.length}</p>
                                <p className="text-xs text-muted-foreground">Common rates available</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="settings" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Global Settings
                    </TabsTrigger>
                    <TabsTrigger value="calculator" className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Tax Calculator
                    </TabsTrigger>
                    <TabsTrigger value="integration" className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        System Integration
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-6">
                    <TaxSettingsComponent />
                </TabsContent>

                <TabsContent value="calculator" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tax Calculator</CardTitle>
                                <CardDescription>
                                    Test tax calculations with different rates and methods
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <TaxRateSelector
                                    value={selectedDemoRate}
                                    onChange={setSelectedDemoRate}
                                    label="Tax Rate"
                                    description="Select rate for calculation"
                                    showCustomInput={true}
                                    showPreview={true}
                                    previewAmount={demoAmount}
                                />

                                <div className="space-y-3">
                                    <label className="text-sm font-medium">Amount (IDR)</label>
                                    <input
                                        type="number"
                                        value={demoAmount}
                                        onChange={(e) => setDemoAmount(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border rounded-md"
                                        placeholder="Enter amount"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Calculation Results</CardTitle>
                                <CardDescription>
                                    Live calculation preview
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Base Amount:</span>
                                        <span className="font-medium">{formatCurrency(demoAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax Rate:</span>
                                        <Badge>{formatTaxRate(selectedDemoRate)}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax Amount:</span>
                                        <span className="font-medium">{formatCurrency(calculateTax(demoAmount, selectedDemoRate))}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total Amount:</span>
                                        <span>{formatCurrency(demoAmount + calculateTax(demoAmount, selectedDemoRate))}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Available Tax Rates</CardTitle>
                            <CardDescription>
                                Standard tax rates configured in your system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {COMMON_TAX_RATES.map((rate) => (
                                    <Card key={rate.value} className="p-3 text-center">
                                        <div className="text-xl font-bold">{formatTaxRate(rate.value)}</div>
                                        <div className="text-sm text-muted-foreground">{rate.label.split(' - ')[1]}</div>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="integration" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Purchase Orders</CardTitle>
                                <CardDescription>
                                    Tax management integration in purchasing
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Tax Rate Override</span>
                                        <Badge variant="outline">✓ Enabled</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Supplier-specific Rates</span>
                                        <Badge variant="outline">✓ Supported</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Product Tax Rates</span>
                                        <Badge variant="outline">✓ Dynamic</Badge>
                                    </div>
                                </div>
                                <Link href="/purchase-orders">
                                    <Button variant="outline" className="w-full">
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        Manage Purchase Orders
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Management</CardTitle>
                                <CardDescription>
                                    Tax exemption and customer-specific rates
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Customer Exemptions</span>
                                        <Badge variant="outline">✓ Enabled</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Exemption Categories</span>
                                        <Badge variant="outline">{TAX_EXEMPTION_REASONS.length} types</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Override Rates</span>
                                        <Badge variant="outline">✓ Supported</Badge>
                                    </div>
                                </div>
                                <Link href="/customers">
                                    <Button variant="outline" className="w-full">
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        Manage Customers
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sales Orders</CardTitle>
                                <CardDescription>
                                    Tax calculation in sales workflow
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Customer Tax Status</span>
                                        <Badge variant="outline">✓ Auto-applied</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Tax-inclusive Pricing</span>
                                        <Badge variant="outline">✓ Configurable</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Line Item Taxes</span>
                                        <Badge variant="outline">✓ Individual</Badge>
                                    </div>
                                </div>
                                <Link href="/sales-orders">
                                    <Button variant="outline" className="w-full">
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        Manage Sales Orders
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Point of Sale</CardTitle>
                                <CardDescription>
                                    Real-time tax calculation in POS
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Real-time Calculation</span>
                                        <Badge variant="outline">✓ Live</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Customer Selection</span>
                                        <Badge variant="outline">✓ Tax-aware</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Receipt Tax Display</span>
                                        <Badge variant="outline">✓ Detailed</Badge>
                                    </div>
                                </div>
                                <Link href="/pos">
                                    <Button variant="outline" className="w-full">
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        Open POS System
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tax Compliance Features</CardTitle>
                            <CardDescription>
                                Ensure compliance with Indonesian PPN and other tax requirements
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <h4 className="font-medium text-green-900 mb-2">Indonesian PPN</h4>
                                    <ul className="space-y-1 text-sm text-green-800">
                                        <li>✓ 11% Default Rate</li>
                                        <li>✓ Compliance Ready</li>
                                        <li>✓ Audit Trail</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Tax Exemptions</h4>
                                    <ul className="space-y-1 text-sm text-blue-800">
                                        <li>✓ Government Entities</li>
                                        <li>✓ Non-profit Organizations</li>
                                        <li>✓ Export Sales</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <h4 className="font-medium text-purple-900 mb-2">Calculation Methods</h4>
                                    <ul className="space-y-1 text-sm text-purple-800">
                                        <li>✓ Tax Exclusive</li>
                                        <li>✓ Tax Inclusive</li>
                                        <li>✓ Configurable Rounding</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 