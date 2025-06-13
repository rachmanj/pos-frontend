"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Info, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    COMMON_TAX_RATES,
    TAX_EXEMPTION_REASONS,
    TAX_CALCULATION_METHODS,
    formatTaxRate,
    calculateTax,
    calculateReverseTax,
    isValidTaxRate,
} from "@/lib/tax-config";

interface TaxRateSelectorProps {
    value?: number;
    onChange: (value: number) => void;
    onExemptionChange?: (isExempt: boolean, reason?: string) => void;
    onMethodChange?: (method: "exclusive" | "inclusive") => void;
    disabled?: boolean;
    placeholder?: string;
    showCustomInput?: boolean;
    showExemptionOptions?: boolean;
    showCalculationMethod?: boolean;
    showPreview?: boolean;
    previewAmount?: number;
    className?: string;
    label?: string;
    description?: string;
    required?: boolean;
    error?: string;
}

export function TaxRateSelector({
    value,
    onChange,
    onExemptionChange,
    onMethodChange,
    disabled = false,
    placeholder = "Select tax rate",
    showCustomInput = true,
    showExemptionOptions = false,
    showCalculationMethod = false,
    showPreview = false,
    previewAmount = 100,
    className,
    label,
    description,
    required = false,
    error,
}: TaxRateSelectorProps) {
    const [open, setOpen] = useState(false);
    const [customRate, setCustomRate] = useState("");
    const [showCustomDialog, setShowCustomDialog] = useState(false);
    const [isExempt, setIsExempt] = useState(false);
    const [exemptionReason, setExemptionReason] = useState<string>("");
    const [exemptionDetails, setExemptionDetails] = useState<string>("");
    const [calculationMethod, setCalculationMethod] = useState<"exclusive" | "inclusive">("exclusive");
    const [showTaxCalculator, setShowTaxCalculator] = useState(false);

    const currentRate = value ?? 0;
    const selectedRate = COMMON_TAX_RATES.find(rate => rate.value === currentRate);

    // Handle exemption changes
    useEffect(() => {
        if (isExempt && currentRate !== 0) {
            onChange(0);
        }
    }, [isExempt, currentRate, onChange]);

    // Notify parent of exemption changes
    useEffect(() => {
        if (onExemptionChange) {
            onExemptionChange(isExempt, exemptionReason);
        }
    }, [isExempt, exemptionReason, onExemptionChange]);

    // Notify parent of method changes
    useEffect(() => {
        if (onMethodChange) {
            onMethodChange(calculationMethod);
        }
    }, [calculationMethod, onMethodChange]);

    const handleRateSelect = (rateValue: number) => {
        onChange(rateValue);
        setIsExempt(rateValue === 0);
        setOpen(false);
    };

    const handleCustomRate = () => {
        const rate = parseFloat(customRate);
        if (isValidTaxRate(rate)) {
            onChange(rate);
            setIsExempt(rate === 0);
            setShowCustomDialog(false);
            setCustomRate("");
        }
    };

    const handleExemptionToggle = (exempt: boolean) => {
        setIsExempt(exempt);
        if (exempt) {
            onChange(0);
        }
    };

    // Calculate preview values
    const previewTax = calculateTax(previewAmount, currentRate, calculationMethod);
    const previewTotal = calculationMethod === "inclusive" ? previewAmount : previewAmount + previewTax;
    const reverseCalc = calculateReverseTax(previewAmount, currentRate);

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <Label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
            )}

            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}

            <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                                "flex-1 justify-between",
                                error && "border-red-500"
                            )}
                            disabled={disabled}
                        >
                            {selectedRate ? (
                                <span className="flex items-center gap-2">
                                    {formatTaxRate(currentRate)}
                                    {currentRate === 0 && (
                                        <Badge variant="secondary" className="text-xs">EXEMPT</Badge>
                                    )}
                                </span>
                            ) : (
                                placeholder
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Search tax rates..." />
                            <CommandEmpty>No tax rate found.</CommandEmpty>
                            <CommandGroup>
                                {COMMON_TAX_RATES.map((rate) => (
                                    <CommandItem
                                        key={rate.value}
                                        value={rate.label}
                                        onSelect={() => handleRateSelect(rate.value)}
                                        className="flex flex-col items-start gap-1"
                                    >
                                        <div className="flex items-center w-full">
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    currentRate === rate.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="font-medium">{rate.label}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground ml-6">
                                            {rate.description}
                                        </span>
                                    </CommandItem>
                                ))}

                                {showCustomInput && (
                                    <>
                                        <Separator className="my-2" />
                                        <CommandItem onSelect={() => setShowCustomDialog(true)}>
                                            <Calculator className="mr-2 h-4 w-4" />
                                            Custom Tax Rate
                                        </CommandItem>
                                    </>
                                )}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>

                {showPreview && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowTaxCalculator(true)}
                        title="Tax Calculator"
                    >
                        <Calculator className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Tax Exemption Options */}
            {showExemptionOptions && (
                <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="tax-exempt"
                            checked={isExempt}
                            onCheckedChange={handleExemptionToggle}
                        />
                        <Label htmlFor="tax-exempt" className="text-sm font-medium">
                            Tax Exempt
                        </Label>
                    </div>

                    {isExempt && (
                        <div className="space-y-2 ml-6">
                            <Label htmlFor="exemption-reason" className="text-sm">
                                Exemption Reason
                            </Label>
                            <Select value={exemptionReason} onValueChange={setExemptionReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TAX_EXEMPTION_REASONS.map((reason) => (
                                        <SelectItem key={reason.value} value={reason.value}>
                                            {reason.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {exemptionReason === "other" && (
                                <div className="space-y-1">
                                    <Label htmlFor="exemption-details" className="text-sm">
                                        Additional Details
                                    </Label>
                                    <Textarea
                                        id="exemption-details"
                                        value={exemptionDetails}
                                        onChange={(e) => setExemptionDetails(e.target.value)}
                                        placeholder="Specify exemption details..."
                                        rows={2}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Calculation Method */}
            {showCalculationMethod && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Tax Calculation Method</Label>
                    <Select value={calculationMethod} onValueChange={(value: "exclusive" | "inclusive") => setCalculationMethod(value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TAX_CALCULATION_METHODS.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                    <div className="flex flex-col">
                                        <span>{method.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {method.description}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Quick Preview */}
            {showPreview && currentRate > 0 && (
                <div className="text-xs text-muted-foreground space-y-1 p-2 bg-blue-50 rounded">
                    <div className="font-medium text-blue-700">Tax Preview</div>
                    {calculationMethod === "exclusive" ? (
                        <>
                            <div>Amount: ${previewAmount.toFixed(2)}</div>
                            <div>Tax ({formatTaxRate(currentRate)}): ${previewTax.toFixed(2)}</div>
                            <div className="font-medium">Total: ${previewTotal.toFixed(2)}</div>
                        </>
                    ) : (
                        <>
                            <div>Total (incl. tax): ${previewAmount.toFixed(2)}</div>
                            <div>Tax ({formatTaxRate(currentRate)}): ${reverseCalc.taxAmount.toFixed(2)}</div>
                            <div className="font-medium">Subtotal: ${reverseCalc.subtotal.toFixed(2)}</div>
                        </>
                    )}
                </div>
            )}

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Custom Rate Dialog */}
            <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Custom Tax Rate</DialogTitle>
                        <DialogDescription>
                            Enter a custom tax rate percentage (0-100%).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="custom-rate">Tax Rate (%)</Label>
                            <Input
                                id="custom-rate"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={customRate}
                                onChange={(e) => setCustomRate(e.target.value)}
                                placeholder="e.g., 12.5"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCustomRate}
                            disabled={!customRate || !isValidTaxRate(parseFloat(customRate))}
                        >
                            Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Tax Calculator Dialog */}
            <Dialog open={showTaxCalculator} onOpenChange={setShowTaxCalculator}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tax Calculator</DialogTitle>
                        <DialogDescription>
                            Calculate tax amounts with {formatTaxRate(currentRate)} rate
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Method</Label>
                                <Select value={calculationMethod} onValueChange={(value: "exclusive" | "inclusive") => setCalculationMethod(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TAX_CALCULATION_METHODS.map((method) => (
                                            <SelectItem key={method.value} value={method.value}>
                                                {method.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={previewAmount}
                                    onChange={(e) => {
                                        // This would need to be handled by parent component
                                    }}
                                    placeholder="Enter amount"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            {calculationMethod === "exclusive" ? (
                                <>
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${previewAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax ({formatTaxRate(currentRate)}):</span>
                                        <span>${previewTax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold border-t pt-2">
                                        <span>Total:</span>
                                        <span>${previewTotal.toFixed(2)}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between font-bold">
                                        <span>Total (incl. tax):</span>
                                        <span>${previewAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax ({formatTaxRate(currentRate)}):</span>
                                        <span>${reverseCalc.taxAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                        <span>Subtotal:</span>
                                        <span>${reverseCalc.subtotal.toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowTaxCalculator(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 