"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, AlertTriangle, Settings, Calculator, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxRateSelector } from "@/components/ui/tax-rate-selector";
import {
    DEFAULT_GLOBAL_TAX_SETTINGS,
    GlobalTaxSettings,
    COMMON_TAX_RATES,
    TAX_CALCULATION_METHODS,
    formatTaxRate,
    calculateTax,
    type GlobalTaxSettings as TaxSettings,
} from "@/lib/tax-config";
import { toast } from "sonner";

interface TaxSettingsProps {
    settings?: TaxSettings;
    onSave?: (settings: TaxSettings) => void;
    loading?: boolean;
}

export function TaxSettingsComponent({
    settings: initialSettings,
    onSave,
    loading = false,
}: TaxSettingsProps) {
    const [settings, setSettings] = useState<TaxSettings>(
        initialSettings || DEFAULT_GLOBAL_TAX_SETTINGS
    );
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    // Track changes
    useEffect(() => {
        if (initialSettings) {
            const hasModifications = JSON.stringify(settings) !== JSON.stringify(initialSettings);
            setHasChanges(hasModifications);
        }
    }, [settings, initialSettings]);

    const handleSettingChange = <K extends keyof TaxSettings>(
        key: K,
        value: TaxSettings[K]
    ) => {
        setSettings(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = async () => {
        if (onSave) {
            setSaving(true);
            try {
                await onSave(settings);
                toast.success("Tax Settings Updated", {
                    description: "Global tax configuration has been saved successfully.",
                });
                setHasChanges(false);
            } catch (error) {
                toast.error("Failed to save tax settings. Please try again.");
            } finally {
                setSaving(false);
            }
        }
    };

    const handleReset = () => {
        setSettings(initialSettings || DEFAULT_GLOBAL_TAX_SETTINGS);
        setHasChanges(false);
    };

    const previewCalculation = {
        amount: 100,
        tax: calculateTax(100, settings.defaultRate, settings.taxCalculationMethod, settings.roundingMethod, settings.roundingPrecision),
        total: settings.taxCalculationMethod === "inclusive" ? 100 : 100 + calculateTax(100, settings.defaultRate, settings.taxCalculationMethod, settings.roundingMethod, settings.roundingPrecision),
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Tax Configuration</h2>
                    <p className="text-muted-foreground">
                        Configure global tax settings for your organization
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={!hasChanges || loading}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || loading || saving}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            {hasChanges && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        You have unsaved changes. Remember to save your configuration.
                    </AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="calculation">Calculation</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Default Tax Configuration
                            </CardTitle>
                            <CardDescription>
                                Set the default tax rate and basic configuration for your system
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <TaxRateSelector
                                        label="Default Tax Rate"
                                        description="System-wide default tax rate applied when no other rate is specified"
                                        value={settings.defaultRate}
                                        onChange={(rate) => handleSettingChange("defaultRate", rate)}
                                        showCustomInput={true}
                                        showPreview={true}
                                        previewAmount={100}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Tax Calculation Method</Label>
                                    <Select
                                        value={settings.taxCalculationMethod}
                                        onValueChange={(value: "exclusive" | "inclusive") =>
                                            handleSettingChange("taxCalculationMethod", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TAX_CALCULATION_METHODS.map((method) => (
                                                <SelectItem key={method.value} value={method.value}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{method.label}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {method.description}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        How tax is calculated and displayed in the system
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="inclusive-pricing"
                                        checked={settings.inclusivePricingDefault}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange("inclusivePricingDefault", checked === true)
                                        }
                                    />
                                    <Label htmlFor="inclusive-pricing" className="text-sm font-medium">
                                        Use tax-inclusive pricing by default
                                    </Label>
                                </div>
                                <p className="text-xs text-muted-foreground ml-6">
                                    When enabled, prices will include tax by default in forms and calculations
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Calculation Settings */}
                <TabsContent value="calculation" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Calculation Precision
                            </CardTitle>
                            <CardDescription>
                                Configure how tax amounts are calculated and rounded
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="rounding-method">Rounding Method</Label>
                                    <Select
                                        value={settings.roundingMethod}
                                        onValueChange={(value: "round" | "floor" | "ceil") =>
                                            handleSettingChange("roundingMethod", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="round">
                                                <div className="flex flex-col">
                                                    <span>Round (Standard)</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Round to nearest decimal place
                                                    </span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="floor">
                                                <div className="flex flex-col">
                                                    <span>Floor (Round Down)</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Always round down
                                                    </span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="ceil">
                                                <div className="flex flex-col">
                                                    <span>Ceiling (Round Up)</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Always round up
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="precision">Decimal Precision</Label>
                                    <Select
                                        value={settings.roundingPrecision.toString()}
                                        onValueChange={(value) =>
                                            handleSettingChange("roundingPrecision", parseInt(value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">0 decimal places</SelectItem>
                                            <SelectItem value="1">1 decimal place</SelectItem>
                                            <SelectItem value="2">2 decimal places</SelectItem>
                                            <SelectItem value="3">3 decimal places</SelectItem>
                                            <SelectItem value="4">4 decimal places</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Number of decimal places for tax calculations
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium mb-2">Calculation Examples</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Base Amount:</span>
                                        <span>$100.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax Rate:</span>
                                        <span>{formatTaxRate(settings.defaultRate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Method:</span>
                                        <span className="capitalize">{settings.taxCalculationMethod}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Rounding:</span>
                                        <span className="capitalize">{settings.roundingMethod}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-medium">
                                        <span>Tax Amount:</span>
                                        <span>${previewCalculation.tax.toFixed(settings.roundingPrecision)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <span>Total:</span>
                                        <span>${previewCalculation.total.toFixed(settings.roundingPrecision)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Permissions Settings */}
                <TabsContent value="permissions" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Tax Override Permissions
                            </CardTitle>
                            <CardDescription>
                                Control who can override tax rates and exemptions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label htmlFor="product-override" className="text-sm font-medium">
                                            Allow Product Tax Rate Override
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Permit setting custom tax rates for individual products
                                        </p>
                                    </div>
                                    <Checkbox
                                        id="product-override"
                                        checked={settings.allowProductOverride}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange("allowProductOverride", checked === true)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label htmlFor="customer-exemption" className="text-sm font-medium">
                                            Allow Customer Tax Exemption
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Enable tax exemptions for specific customers
                                        </p>
                                    </div>
                                    <Checkbox
                                        id="customer-exemption"
                                        checked={settings.allowCustomerExemption}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange("allowCustomerExemption", checked === true)
                                        }
                                    />
                                </div>
                            </div>

                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    Tax override permissions affect how users can modify tax calculations.
                                    Ensure these settings comply with your accounting and legal requirements.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preview */}
                <TabsContent value="preview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tax Configuration Preview</CardTitle>
                            <CardDescription>
                                See how your tax settings will affect calculations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium">Current Configuration</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Default Rate:</span>
                                            <Badge variant="outline">{formatTaxRate(settings.defaultRate)}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Calculation Method:</span>
                                            <Badge variant="outline" className="capitalize">
                                                {settings.taxCalculationMethod}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Rounding:</span>
                                            <Badge variant="outline" className="capitalize">
                                                {settings.roundingMethod}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Precision:</span>
                                            <Badge variant="outline">
                                                {settings.roundingPrecision} decimals
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Product Override:</span>
                                            <Badge variant={settings.allowProductOverride ? "default" : "secondary"}>
                                                {settings.allowProductOverride ? "Allowed" : "Disabled"}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Customer Exemption:</span>
                                            <Badge variant={settings.allowCustomerExemption ? "default" : "secondary"}>
                                                {settings.allowCustomerExemption ? "Allowed" : "Disabled"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium">Sample Calculations</h4>
                                    <div className="space-y-3">
                                        {[50, 100, 250, 1000].map((amount) => {
                                            const tax = calculateTax(amount, settings.defaultRate, settings.taxCalculationMethod, settings.roundingMethod, settings.roundingPrecision);
                                            const total = settings.taxCalculationMethod === "inclusive" ? amount : amount + tax;

                                            return (
                                                <div key={amount} className="p-3 border rounded">
                                                    <div className="text-sm space-y-1">
                                                        <div className="flex justify-between">
                                                            <span>Amount:</span>
                                                            <span>${amount.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Tax:</span>
                                                            <span>${tax.toFixed(settings.roundingPrecision)}</span>
                                                        </div>
                                                        <div className="flex justify-between font-medium border-t pt-1">
                                                            <span>Total:</span>
                                                            <span>${total.toFixed(settings.roundingPrecision)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 