"use client"

import { useState } from "react"
import { useCustomers } from "@/hooks/useCustomers"
import { useCustomerPaymentReceive } from "@/hooks/useCustomerPaymentReceive"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    Users,
    RefreshCw,
    CreditCard
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface CustomerFilters {
    search?: string
    customer_type?: string
    credit_status?: string
    has_outstanding?: boolean
    sort_field?: string
    sort_direction?: 'asc' | 'desc'
    per_page?: number
}

export function CustomerOutstandingList() {
    const [filters, setFilters] = useState<CustomerFilters>({
        has_outstanding: true,
        per_page: 20,
        sort_field: 'current_ar_balance',
        sort_direction: 'desc'
    })
    const [showFilters, setShowFilters] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
    const [showCustomerDetails, setShowCustomerDetails] = useState(false)

    const { useCustomers } = useCustomers()
    const { data: customers, isLoading, refetch } = useCustomers(filters)
    const { useCustomerOutstanding } = useCustomerPaymentReceive()
    const { data: customerOutstanding } = useCustomerOutstanding(selectedCustomer || 0)

    const handleFilterChange = (key: keyof CustomerFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === '' ? undefined : value
        }))
    }

    const handleViewCustomer = (customerId: number) => {
        setSelectedCustomer(customerId)
        setShowCustomerDetails(true)
    }

    const getCreditStatusBadge = (status: string) => {
        switch (status) {
            case 'good':
                return <Badge variant="default" className="bg-green-600">Good</Badge>
            case 'warning':
                return <Badge variant="secondary">Warning</Badge>
            case 'blocked':
                return <Badge variant="destructive">Blocked</Badge>
            case 'suspended':
                return <Badge variant="destructive">Suspended</Badge>
            case 'defaulted':
                return <Badge variant="destructive">Defaulted</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getRiskBadge = (riskScore: number) => {
        if (riskScore >= 80) {
            return <Badge variant="default" className="bg-green-600">Low Risk</Badge>
        } else if (riskScore >= 60) {
            return <Badge variant="secondary">Medium Risk</Badge>
        } else if (riskScore >= 40) {
            return <Badge variant="secondary" className="bg-orange-600">High Risk</Badge>
        } else {
            return <Badge variant="destructive">Critical Risk</Badge>
        }
    }

    const getAgingDistribution = (customer: any) => {
        // This would come from the customer's aging data in a real implementation
        // For now, we'll simulate it based on the outstanding balance
        const total = customer.current_ar_balance || 0
        if (total === 0) return null

        return (
            <div className="flex items-center gap-1">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                </div>
                <span className="text-xs text-muted-foreground">75% current</span>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search customers by name, code, or email..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
                <Button
                    variant="outline"
                    onClick={() => refetch()}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <Card>
                    <CardHeader>
                        <CardTitle>Advanced Filters</CardTitle>
                        <CardDescription>Filter customers by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                                <label className="text-sm font-medium">Credit Status</label>
                                <Select
                                    value={filters.credit_status || ''}
                                    onValueChange={(value) => handleFilterChange('credit_status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All statuses</SelectItem>
                                        <SelectItem value="good">Good</SelectItem>
                                        <SelectItem value="warning">Warning</SelectItem>
                                        <SelectItem value="blocked">Blocked</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                        <SelectItem value="defaulted">Defaulted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Sort By</label>
                                <Select
                                    value={filters.sort_field || 'current_ar_balance'}
                                    onValueChange={(value) => handleFilterChange('sort_field', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="current_ar_balance">Outstanding Balance</SelectItem>
                                        <SelectItem value="name">Customer Name</SelectItem>
                                        <SelectItem value="customer_code">Customer Code</SelectItem>
                                        <SelectItem value="last_payment_date">Last Payment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Sort Direction</label>
                                <Select
                                    value={filters.sort_direction || 'desc'}
                                    onValueChange={(value) => handleFilterChange('sort_direction', value as 'asc' | 'desc')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Highest First</SelectItem>
                                        <SelectItem value="asc">Lowest First</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {customers?.meta?.total || 0}
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
                            {formatCurrency(
                                customers?.data?.reduce((sum: number, customer: any) =>
                                    sum + (customer.current_ar_balance || 0), 0
                                ) || 0
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all customers
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {customers?.data?.filter((customer: any) =>
                                customer.credit_status === 'blocked' ||
                                customer.credit_status === 'suspended' ||
                                customer.credit_status === 'defaulted'
                            ).length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Customers need attention
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Balance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(
                                customers?.data?.length > 0
                                    ? (customers.data.reduce((sum: number, customer: any) =>
                                        sum + (customer.current_ar_balance || 0), 0
                                    ) / customers.data.length)
                                    : 0
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per customer
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Customers Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Outstanding Balance</TableHead>
                                <TableHead>Credit Status</TableHead>
                                <TableHead>Last Payment</TableHead>
                                <TableHead>Aging Distribution</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Loading customers...
                                    </TableCell>
                                </TableRow>
                            ) : customers?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        No customers with outstanding balances found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers?.data?.map((customer: any) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{customer.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {customer.customer_code}
                                                </p>
                                                {customer.email && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {customer.email}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {customer.customer_type || 'Regular'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-red-600">
                                                    {formatCurrency(customer.current_ar_balance || 0)}
                                                </p>
                                                {customer.current_ar_balance > 0 && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Outstanding
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getCreditStatusBadge(customer.credit_status || 'good')}
                                        </TableCell>
                                        <TableCell>
                                            {customer.last_payment_date ? (
                                                <div>
                                                    <p>{formatDate(customer.last_payment_date)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {Math.floor((new Date().getTime() - new Date(customer.last_payment_date).getTime()) / (1000 * 60 * 60 * 24))} days ago
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">No payments</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {getAgingDistribution(customer)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleViewCustomer(customer.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Outstanding
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        Manage Credit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <DollarSign className="mr-2 h-4 w-4" />
                                                        Create Payment
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {customers?.meta && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {customers.meta.from} to {customers.meta.to} of {customers.meta.total} customers
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!customers.meta.prev_page_url}
                            onClick={() => handleFilterChange('page', customers.meta.current_page - 1)}
                        >
                            Previous
                        </Button>
                        <span className="text-sm">
                            Page {customers.meta.current_page} of {customers.meta.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!customers.meta.next_page_url}
                            onClick={() => handleFilterChange('page', customers.meta.current_page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Customer Outstanding Details Dialog */}
            {selectedCustomer && (
                <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Customer Outstanding Details</DialogTitle>
                        </DialogHeader>
                        {customerOutstanding && (
                            <div className="space-y-6">
                                {/* Customer Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{customerOutstanding.customer.name}</CardTitle>
                                        <CardDescription>
                                            {customerOutstanding.customer.customer_code} •
                                            Outstanding: {formatCurrency(customerOutstanding.summary.total_outstanding)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-red-600">
                                                    {formatCurrency(customerOutstanding.summary.total_outstanding)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Total Outstanding</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold">
                                                    {customerOutstanding.summary.sales_count}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Outstanding Sales</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-orange-600">
                                                    {formatCurrency(customerOutstanding.summary.overdue_amount)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Overdue Amount</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Outstanding Sales */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Outstanding Sales</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Sale #</TableHead>
                                                    <TableHead>Total Amount</TableHead>
                                                    <TableHead>Outstanding</TableHead>
                                                    <TableHead>Due Date</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {customerOutstanding.outstanding_sales.map((sale) => (
                                                    <TableRow key={sale.id}>
                                                        <TableCell className="font-medium">
                                                            {sale.sale_number}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatCurrency(sale.total_amount)}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-red-600">
                                                            {formatCurrency(sale.outstanding_amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {sale.due_date ? formatDate(sale.due_date) : 'No due date'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={sale.payment_status === 'paid' ? 'default' : 'destructive'}>
                                                                {sale.payment_status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
} 