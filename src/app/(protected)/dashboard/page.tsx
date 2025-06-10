"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    DollarSign,
    Warehouse,
    FileText,
    AlertTriangle
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    const { data: session } = useSession()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Welcome to Sarange ERP - Your complete business management solution
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp 45,231,890</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,350</div>
                        <p className="text-xs text-muted-foreground">+180 new this month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales Orders</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">573</div>
                        <p className="text-xs text-muted-foreground">+201 since last week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Point of Sale
                        </CardTitle>
                        <CardDescription>Process sales transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/pos">
                            <Button className="w-full">Open POS</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Inventory Management
                        </CardTitle>
                        <CardDescription>Manage products and stock</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Link href="/products">
                                <Button variant="outline" className="w-full">View Products</Button>
                            </Link>
                            <Link href="/categories">
                                <Button variant="outline" className="w-full">Manage Categories</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Warehouse className="h-5 w-5" />
                            Warehouse Operations
                        </CardTitle>
                        <CardDescription>Manage warehouses and stock</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Link href="/warehouses">
                                <Button variant="outline" className="w-full">View Warehouses</Button>
                            </Link>
                            <Link href="/stock-transfers">
                                <Button variant="outline" className="w-full">Stock Transfers</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Customer Management
                        </CardTitle>
                        <CardDescription>Manage customer relationships</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Link href="/customers">
                                <Button variant="outline" className="w-full">View Customers</Button>
                            </Link>
                            <Link href="/sales-orders">
                                <Button variant="outline" className="w-full">Sales Orders</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Purchasing
                        </CardTitle>
                        <CardDescription>Manage suppliers and purchases</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Link href="/suppliers">
                                <Button variant="outline" className="w-full">View Suppliers</Button>
                            </Link>
                            <Link href="/purchase-orders">
                                <Button variant="outline" className="w-full">Purchase Orders</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Financial Management
                        </CardTitle>
                        <CardDescription>Track payments and finances</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Link href="/purchase-payments">
                                <Button variant="outline" className="w-full">Purchase Payments</Button>
                            </Link>
                            <Link href="/customer-payments">
                                <Button variant="outline" className="w-full">Customer Payments</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        System Alerts
                    </CardTitle>
                    <CardDescription>Important notifications and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    Low Stock Alert
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                    15 products are running low on stock
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    Pending Purchase Orders
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    8 purchase orders awaiting approval
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    System Status
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                    All systems operational - Sarange ERP running smoothly
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 