// Tax Configuration Utility
// Centralized tax rate management for consistent calculations

export interface TaxConfig {
  rate: number;
  isExempt: boolean;
  source: "system" | "product" | "category" | "customer" | "override";
  inclusivePricing?: boolean;
  exemptionReason?: string;
}

export interface Product {
  id: number;
  tax_rate?: number;
  // other product properties...
}

export interface Customer {
  id: number;
  tax_exempt?: boolean;
  tax_rate_override?: number;
  exemption_reason?: string;
  // other customer properties...
}

export interface GlobalTaxSettings {
  defaultRate: number;
  allowProductOverride: boolean;
  allowCustomerExemption: boolean;
  inclusivePricingDefault: boolean;
  taxCalculationMethod: "exclusive" | "inclusive";
  roundingMethod: "round" | "floor" | "ceil";
  roundingPrecision: number;
}

// System default tax rate (Indonesian PPN)
export const SYSTEM_DEFAULT_TAX_RATE = 11.0;

// Global tax settings (can be configured by admin)
export const DEFAULT_GLOBAL_TAX_SETTINGS: GlobalTaxSettings = {
  defaultRate: SYSTEM_DEFAULT_TAX_RATE,
  allowProductOverride: true,
  allowCustomerExemption: true,
  inclusivePricingDefault: false,
  taxCalculationMethod: "exclusive",
  roundingMethod: "round",
  roundingPrecision: 2,
};

// Common tax rates for dropdown selection
export const COMMON_TAX_RATES = [
  { value: 0, label: "0% - Tax Exempt", description: "No tax applied" },
  { value: 5, label: "5% - Reduced Rate", description: "Essential goods" },
  {
    value: 10,
    label: "10% - Standard Rate",
    description: "Most goods & services",
  },
  { value: 11, label: "11% - Indonesian PPN", description: "Indonesian VAT" },
  { value: 15, label: "15% - Luxury Goods", description: "Premium items" },
  { value: 20, label: "20% - Premium Rate", description: "High-value items" },
];

// Tax exemption reasons
export const TAX_EXEMPTION_REASONS = [
  { value: "government", label: "Government Entity" },
  { value: "nonprofit", label: "Non-Profit Organization" },
  { value: "export", label: "Export Sales" },
  { value: "resale", label: "Resale Certificate" },
  { value: "medical", label: "Medical Exemption" },
  { value: "education", label: "Educational Institution" },
  { value: "other", label: "Other (Specify)" },
];

// Tax calculation methods
export const TAX_CALCULATION_METHODS = [
  {
    value: "exclusive",
    label: "Tax Exclusive",
    description: "Tax added to base price",
  },
  {
    value: "inclusive",
    label: "Tax Inclusive",
    description: "Tax included in price",
  },
];

/**
 * Get effective tax rate considering customer, product, and system defaults
 */
export function getEffectiveTaxRate(
  product?: Product | null,
  customer?: Customer | null,
  overrideRate?: number,
  globalSettings?: GlobalTaxSettings
): number {
  const settings = globalSettings || DEFAULT_GLOBAL_TAX_SETTINGS;

  // 1. Use explicit override if provided
  if (overrideRate !== undefined && overrideRate !== null) {
    return overrideRate;
  }

  // 2. Check customer tax exemption/override
  if (customer && settings.allowCustomerExemption) {
    if (customer.tax_exempt) {
      return 0;
    }
    if (
      customer.tax_rate_override !== undefined &&
      customer.tax_rate_override !== null
    ) {
      return customer.tax_rate_override;
    }
  }

  // 3. Use product-specific tax rate if available and allowed
  if (
    product?.tax_rate !== undefined &&
    product.tax_rate !== null &&
    settings.allowProductOverride
  ) {
    return product.tax_rate;
  }

  // 4. Fall back to system default
  return settings.defaultRate;
}

/**
 * Calculate tax amount for given subtotal and tax rate
 */
export function calculateTax(
  subtotal: number,
  taxRate: number,
  method: "exclusive" | "inclusive" = "exclusive",
  roundingMethod: "round" | "floor" | "ceil" = "round",
  precision: number = 2
): number {
  if (taxRate <= 0 || subtotal <= 0) return 0;

  let taxAmount: number;

  if (method === "inclusive") {
    // Tax is included in the price: tax = price - (price / (1 + rate/100))
    taxAmount = subtotal - subtotal / (1 + taxRate / 100);
  } else {
    // Tax is added to the price: tax = price * (rate/100)
    taxAmount = (subtotal * taxRate) / 100;
  }

  // Apply rounding method
  const multiplier = Math.pow(10, precision);
  switch (roundingMethod) {
    case "floor":
      return Math.floor(taxAmount * multiplier) / multiplier;
    case "ceil":
      return Math.ceil(taxAmount * multiplier) / multiplier;
    default:
      return Math.round(taxAmount * multiplier) / multiplier;
  }
}

/**
 * Calculate totals including tax with advanced options
 */
export function calculateTotals(
  subtotal: number,
  taxRate: number,
  options: {
    method?: "exclusive" | "inclusive";
    roundingMethod?: "round" | "floor" | "ceil";
    precision?: number;
  } = {}
) {
  const {
    method = "exclusive",
    roundingMethod = "round",
    precision = 2,
  } = options;

  const taxAmount = calculateTax(
    subtotal,
    taxRate,
    method,
    roundingMethod,
    precision
  );

  let total: number;
  if (method === "inclusive") {
    total = subtotal;
  } else {
    total = subtotal + taxAmount;
  }

  const multiplier = Math.pow(10, precision);

  return {
    subtotal: Math.round(subtotal * multiplier) / multiplier,
    taxRate,
    taxAmount,
    total: Math.round(total * multiplier) / multiplier,
    method,
  };
}

/**
 * Calculate line item totals with tax and advanced options
 */
export function calculateLineItemTotals(
  quantity: number,
  unitPrice: number,
  product?: Product | null,
  customer?: Customer | null,
  options: {
    taxRateOverride?: number;
    globalSettings?: GlobalTaxSettings;
    method?: "exclusive" | "inclusive";
  } = {}
) {
  const lineSubtotal = quantity * unitPrice;
  const globalSettings = options.globalSettings || DEFAULT_GLOBAL_TAX_SETTINGS;
  const effectiveTaxRate = getEffectiveTaxRate(
    product,
    customer,
    options.taxRateOverride,
    globalSettings
  );

  return calculateTotals(lineSubtotal, effectiveTaxRate, {
    method: options.method || globalSettings.taxCalculationMethod,
    roundingMethod: globalSettings.roundingMethod,
    precision: globalSettings.roundingPrecision,
  });
}

/**
 * Get comprehensive tax configuration for a transaction
 */
export function getTaxConfig(
  product?: Product | null,
  customer?: Customer | null,
  overrideRate?: number,
  globalSettings?: GlobalTaxSettings
): TaxConfig {
  const settings = globalSettings || DEFAULT_GLOBAL_TAX_SETTINGS;
  const rate = getEffectiveTaxRate(product, customer, overrideRate, settings);

  let source: TaxConfig["source"] = "system";
  let exemptionReason: string | undefined;

  if (overrideRate !== undefined) {
    source = "override";
  } else if (customer?.tax_exempt) {
    source = "customer";
    exemptionReason = customer.exemption_reason;
  } else if (customer?.tax_rate_override !== undefined) {
    source = "customer";
  } else if (product?.tax_rate !== undefined) {
    source = "product";
  }

  return {
    rate,
    isExempt: rate === 0,
    source,
    inclusivePricing: settings.inclusivePricingDefault,
    exemptionReason,
  };
}

/**
 * Format tax rate for display with context
 */
export function formatTaxRate(
  rate: number,
  options: {
    verbose?: boolean;
    showZeroAsExempt?: boolean;
  } = {}
): string {
  const { verbose = false, showZeroAsExempt = true } = options;

  if (rate === 0) {
    return showZeroAsExempt ? "Tax Exempt" : "0%";
  }

  const rateStr = `${rate}%`;

  if (!verbose) {
    return rateStr;
  }

  // Add contextual information for common rates
  if (rate === 11) return `${rateStr} (Indonesian PPN)`;
  if (rate === 10) return `${rateStr} (Standard Rate)`;
  if (rate === 5) return `${rateStr} (Reduced Rate)`;
  if (rate === 15) return `${rateStr} (Luxury Goods)`;

  return rateStr;
}

/**
 * Validate tax rate
 */
export function isValidTaxRate(rate: number): boolean {
  return rate >= 0 && rate <= 100;
}

/**
 * Get tax breakdown for multiple items
 */
export function calculateOrderTaxBreakdown(
  items: Array<{
    quantity: number;
    unitPrice: number;
    product?: Product;
    taxRateOverride?: number;
  }>,
  customer?: Customer,
  globalSettings?: GlobalTaxSettings
) {
  const settings = globalSettings || DEFAULT_GLOBAL_TAX_SETTINGS;
  let totalSubtotal = 0;
  let totalTaxAmount = 0;
  const taxBreakdown: Record<number, { amount: number; items: number }> = {};

  items.forEach((item) => {
    const itemTotals = calculateLineItemTotals(
      item.quantity,
      item.unitPrice,
      item.product,
      customer,
      {
        taxRateOverride: item.taxRateOverride,
        globalSettings: settings,
      }
    );

    totalSubtotal += itemTotals.subtotal;
    totalTaxAmount += itemTotals.taxAmount;

    // Group by tax rate for breakdown
    const rate = itemTotals.taxRate;
    if (!taxBreakdown[rate]) {
      taxBreakdown[rate] = { amount: 0, items: 0 };
    }
    taxBreakdown[rate].amount += itemTotals.taxAmount;
    taxBreakdown[rate].items += 1;
  });

  return {
    subtotal: totalSubtotal,
    totalTax: totalTaxAmount,
    total: totalSubtotal + totalTaxAmount,
    breakdown: Object.entries(taxBreakdown).map(([rate, data]) => ({
      rate: Number(rate),
      amount: data.amount,
      items: data.items,
      label: formatTaxRate(Number(rate), { verbose: true }),
    })),
  };
}

/**
 * Check if customer is tax exempt
 */
export function isCustomerTaxExempt(customer?: Customer | null): boolean {
  return customer?.tax_exempt === true;
}

/**
 * Validate tax exemption reason
 */
export function validateTaxExemption(reason: string): boolean {
  return TAX_EXEMPTION_REASONS.some((r) => r.value === reason);
}

/**
 * Get display label for tax exemption reason
 */
export function getTaxExemptionLabel(reason?: string): string {
  if (!reason) return "Not specified";
  const exemption = TAX_EXEMPTION_REASONS.find((r) => r.value === reason);
  return exemption?.label || reason;
}

/**
 * Calculate reverse tax (from tax-inclusive price to tax amount)
 */
export function calculateReverseTax(
  totalInclusivePrice: number,
  taxRate: number,
  roundingMethod: "round" | "floor" | "ceil" = "round",
  precision: number = 2
): { subtotal: number; taxAmount: number; taxRate: number } {
  if (taxRate <= 0) {
    return {
      subtotal: totalInclusivePrice,
      taxAmount: 0,
      taxRate: 0,
    };
  }

  const subtotal = totalInclusivePrice / (1 + taxRate / 100);
  const taxAmount = totalInclusivePrice - subtotal;

  const multiplier = Math.pow(10, precision);

  return {
    subtotal: Math.round(subtotal * multiplier) / multiplier,
    taxAmount: Math.round(taxAmount * multiplier) / multiplier,
    taxRate,
  };
}
