"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerCrmAnalytics } from "@/hooks/useCustomerCrm";
import { formatCurrency } from "@/lib/utils";

interface CustomerAnalyticsProps {
    analytics: CustomerCrmAnalytics | undefined;
    loading: boolean;
}

export function CustomerAnalytics({ analytics, loading }: CustomerAnalyticsProps) {
    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="h-4 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                            <div className="h-3 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(analytics.customer_lifetime_value)}</div>
                        <p className="text-xs text-muted-foreground">Average per customer</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.conversion_rate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Lead to customer</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.churn_rate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Customer churn</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.total_leads.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">In pipeline</p>
                    </CardContent>
                </Card>
            </div>

            {/* Lead Stage Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Lead Stage Distribution</CardTitle>
                    <CardDescription>Breakdown of leads by stage</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {analytics.leads_by_stage.map((stage) => (
                            <div key={stage.stage} className="text-center">
                                <div className="text-2xl font-bold">{stage.count}</div>
                                <div className="text-sm text-muted-foreground capitalize">{stage.stage}</div>
                                <Badge variant="outline" className="mt-1">
                                    {stage.percentage.toFixed(1)}%
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Loyalty Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Loyalty Tier Distribution</CardTitle>
                    <CardDescription>Customer distribution across loyalty tiers</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {analytics.loyalty_distribution.map((tier) => (
                            <div key={tier.tier} className="text-center">
                                <div className="text-2xl font-bold">{tier.count}</div>
                                <div className="text-sm text-muted-foreground capitalize">{tier.tier}</div>
                                <Badge variant="outline" className="mt-1">
                                    {tier.percentage.toFixed(1)}%
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Top Customers */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Customers</CardTitle>
                    <CardDescription>Highest value customers by total spent</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analytics.top_customers.slice(0, 10).map((item, index) => (
                            <div key={item.customer.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium">{item.customer.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.total_orders} orders
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{formatCurrency(item.total_spent)}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {item.customer.type}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Growth Trends */}
            <Card>
                <CardHeader>
                    <CardTitle>Growth Trends</CardTitle>
                    <CardDescription>Monthly customer acquisition and revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analytics.growth_trends.slice(-6).map((trend) => (
                            <div key={trend.month} className="flex items-center justify-between">
                                <div className="font-medium">{trend.month}</div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm">
                                        <span className="font-medium">{trend.new_customers}</span> new customers
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-medium">{formatCurrency(trend.total_revenue)}</span> revenue
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 