"use client"

import { useState } from "react"
import { useCustomerPaymentReceive } from "@/hooks/useCustomerPaymentReceive"
import { useCustomers } from "@/hooks/useCustomers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    Calendar,
    Download,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    AlertTriangle,
    TrendingUp,
    Users,
    DollarSign,
    Clock
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface AgingFilters {
    customer_id?: number
    customer_type?: string
    date_from?: string
    date_to?: string
}

export function ARAgingReport() {
    const [filters, setFilters] = useState<AgingFilters>({})
    const [expandedCustomers, setExpandedCustomers] = useState<Set<number>>(new Set())

    const { useARAgingReport } = useCustomerPaymentReceive()
    const { data: agingReport, isLoading, refetch } = useARAgingReport(filters)

    const { useCustomers } = useCustomers()
    const { data: customers } = useCustomers({ per_page: 1000 })

    const handleFilterChange = (key: keyof AgingFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === '' ? undefined : value
        }))
    }

    const toggleCustomerExpansion = (customerId: number) => {
        setExpandedCustomers(prev => {
            const newSet = new Set(prev)
            if (newSet.has(customerId)) {
                newSet.delete(customerId)
            } else {
                newSet.add(customerId)
            }
            return newSet
        })
    }

    const getRiskBadge = (riskLevel: string) => {
        switch (riskLevel) {
            case 'low':
                return <Badge variant="default" className="bg-green-600">Low Risk</Badge>
            case 'medium':
                return <Badge variant="secondary">Medium Risk</Badge>
            case 'high':
                return <Badge variant="secondary" className="bg-orange-600">High Risk</Badge>
            case 'critical':
                return <Badge variant="destructive">Critical Risk</Badge>
            default:
                return <Badge variant="outline">{riskLevel}</Badge>
        }
    }

    const getBucketColor = (bucket: string) => {
        switch (bucket) {
            case 'current':
                return 'text-green-600'
            case '31-60':
                return 'text-yellow-600'
            case '61-90':
                return 'text-orange-600'
            case '91-120':
                return 'text-red-600'
            case '120+':
                return 'text-red-700'
            default:
                return 'text-gray-600'
        }
    }

    const exportReport = () => {
        // In a real implementation, this would generate and download a CSV/Excel file
        console.log('Exporting aging report...', agingReport)
        alert('Export functionality would be implemented here')
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Aging Report Filters
                    </CardTitle>
                    <CardDescription>
                        Filter aging analysis by customer and date range
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <div>
                            <label className="text-sm font-medium">Customer</label>
                            <Select
                                value={filters.customer_id?.toString() || ''}
                                onValueChange={(value) => handleFilterChange('customer_id', value ? parseInt(value) : undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All customers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All customers</SelectItem>
                                    {customers?.data?.map((customer: any) => (
                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                            {customer.name} ({customer.customer_code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Customer Type</label>
                            <Select
                                value={filters.customer_type || ''}
                                onValueChange={(value) => handleFilterChange('customer_type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All types</SelectItem>
                                    <SelectItem value="regular">Regular</SelectItem>
                                    <SelectItem value="vip">VIP</SelectItem>
                                    <SelectItem value="wholesale">Wholesale</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">From Date</label>
                            <Input
                                type="date"
                                value={filters.date_from || ''}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">To Date</label>
                            <Input
                                type="date"
                                value={filters.date_to || ''}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            />
                        </div>

                        <div className="flex items-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => refetch()}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                onClick={exportReport}
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {agingReport?.total_customers || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            With outstanding balances
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                        <DollarSign className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(agingReport?.total_aging.total || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all aging buckets
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current (0-30 days)</CardTitle>
                        <Clock className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {agingReport?.aging_percentages.current?.toFixed(1) || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(agingReport?.total_aging.current || 0)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue (30+ days)</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {(100 - (agingReport?.aging_percentages.current || 0)).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(
                                (agingReport?.total_aging.total || 0) - (agingReport?.total_aging.current || 0)
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Aging Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Aging Distribution
                    </CardTitle>
                    <CardDescription>
                        Outstanding balance distribution by aging buckets (Indonesian standards)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-5">
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(agingReport?.total_aging.current || 0)}
                            </p>
                            <p className="text-sm font-medium">Current (0-30 days)</p>
                            <p className="text-xs text-muted-foreground">
                                {agingReport?.aging_percentages.current?.toFixed(1) || 0}%
                            </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">
                                {formatCurrency(agingReport?.total_aging.days_30 || 0)}
                            </p>
                            <p className="text-sm font-medium">31-60 days</p>
                            <p className="text-xs text-muted-foreground">
                                {agingReport?.aging_percentages.days_30?.toFixed(1) || 0}%
                            </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">
                                {formatCurrency(agingReport?.total_aging.days_60 || 0)}
                            </p>
                            <p className="text-sm font-medium">61-90 days</p>
                            <p className="text-xs text-muted-foreground">
                                {agingReport?.aging_percentages.days_60?.toFixed(1) || 0}%
                            </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(agingReport?.total_aging.days_90 || 0)}
                            </p>
                            <p className="text-sm font-medium">91-120 days</p>
                            <p className="text-xs text-muted-foreground">
                                {agingReport?.aging_percentages.days_90?.toFixed(1) || 0}%
                            </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-2xl font-bold text-red-700">
                                {formatCurrency(agingReport?.total_aging.days_120_plus || 0)}
                            </p>
                            <p className="text-sm font-medium">120+ days</p>
                            <p className="text-xs text-muted-foreground">
                                {agingReport?.aging_percentages.days_120_plus?.toFixed(1) || 0}%
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Risk Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Risk Analysis</CardTitle>
                    <CardDescription>
                        Customer risk distribution based on payment patterns
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-2xl font-bold text-green-600">
                                {agingReport?.risk_analysis.low || 0}
                            </p>
                            <p className="text-sm font-medium">Low Risk</p>
                            <Badge variant="default" className="bg-green-600 mt-2">Good Standing</Badge>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">
                                {agingReport?.risk_analysis.medium || 0}
                            </p>
                            <p className="text-sm font-medium">Medium Risk</p>
                            <Badge variant="secondary" className="mt-2">Monitor</Badge>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">
                                {agingReport?.risk_analysis.high || 0}
                            </p>
                            <p className="text-sm font-medium">High Risk</p>
                            <Badge variant="secondary" className="bg-orange-600 mt-2">Action Required</Badge>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-2xl font-bold text-red-600">
                                {agingReport?.risk_analysis.critical || 0}
                            </p>
                            <p className="text-sm font-medium">Critical Risk</p>
                            <Badge variant="destructive" className="mt-2">Immediate Action</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Customer Aging Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Customer Aging Details</CardTitle>
                    <CardDescription>
                        Detailed aging analysis for each customer with outstanding balances
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8"></TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Current</TableHead>
                                <TableHead>31-60 days</TableHead>
                                <TableHead>61-90 days</TableHead>
                                <TableHead>91-120 days</TableHead>
                                <TableHead>120+ days</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Sales Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agingReport?.customer_aging?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8">
                                        No aging data found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                agingReport?.customer_aging?.map((customerAging) => (
                                    <>
                                        <TableRow key={customerAging.customer.id} className="cursor-pointer hover:bg-muted/50">
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleCustomerExpansion(customerAging.customer.id)}
                                                >
                                                    {expandedCustomers.has(customerAging.customer.id) ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{customerAging.customer.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {customerAging.customer.customer_code}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-green-600 font-medium">
                                                {formatCurrency(customerAging.current)}
                                            </TableCell>
                                            <TableCell className="text-yellow-600 font-medium">
                                                {formatCurrency(customerAging.days_30)}
                                            </TableCell>
                                            <TableCell className="text-orange-600 font-medium">
                                                {formatCurrency(customerAging.days_60)}
                                            </TableCell>
                                            <TableCell className="text-red-600 font-medium">
                                                {formatCurrency(customerAging.days_90)}
                                            </TableCell>
                                            <TableCell className="text-red-700 font-medium">
                                                {formatCurrency(customerAging.days_120_plus)}
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                {formatCurrency(customerAging.total)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {customerAging.sales_count}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded Customer Sales Details */}
                                        {expandedCustomers.has(customerAging.customer.id) && (
                                            <TableRow>
                                                <TableCell colSpan={9} className="p-0">
                                                    <div className="p-4 bg-muted/30">
                                                        <h4 className="font-medium mb-2">Outstanding Sales Details</h4>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Sale #</TableHead>
                                                                    <TableHead>Outstanding Amount</TableHead>
                                                                    <TableHead>Due Date</TableHead>
                                                                    <TableHead>Days Overdue</TableHead>
                                                                    <TableHead>Aging Bucket</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {customerAging.sales?.map((sale) => (
                                                                    <TableRow key={sale.sale_number}>
                                                                        <TableCell className="font-medium">
                                                                            {sale.sale_number}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {formatCurrency(sale.outstanding_amount)}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {formatDate(sale.due_date)}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <span className={sale.days_overdue > 0 ? 'text-red-600' : 'text-green-600'}>
                                                                                {sale.days_overdue} days
                                                                            </span>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={getBucketColor(sale.bucket)}
                                                                            >
                                                                                {sale.bucket}
                                                                            </Badge>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
} 