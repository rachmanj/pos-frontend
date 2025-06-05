"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function POSPage() {
    const { data: session } = useSession()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
                <p className="mt-2 text-gray-600">Process sales transactions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Selection */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Selection</CardTitle>
                            <CardDescription>Select products to add to cart</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Placeholder product cards */}
                                {[1, 2, 3, 4, 5, 6].map((item) => (
                                    <Card key={item} className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-gray-200 rounded-md mx-auto mb-2"></div>
                                                <h3 className="font-medium">Product {item}</h3>
                                                <p className="text-sm text-gray-600">$10.00</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Shopping Cart */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Shopping Cart</CardTitle>
                            <CardDescription>Current transaction</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center text-gray-500 py-8">
                                    <p>No items in cart</p>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span>Subtotal:</span>
                                        <span>$0.00</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span>Tax:</span>
                                        <span>$0.00</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-lg">
                                        <span>Total:</span>
                                        <span>$0.00</span>
                                    </div>
                                </div>

                                <Button className="w-full" disabled>
                                    Process Payment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Role Access Test</CardTitle>
                    <CardDescription>Verify role-based access control</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <h3 className="text-green-800 font-medium">✅ POS Access Granted</h3>
                            <p className="text-green-700 text-sm mt-1">
                                You have access to the POS system with role: {session?.user?.roles?.join(", ")}
                            </p>
                        </div>

                        {session?.user?.roles?.includes("cashier") && (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <h3 className="text-blue-800 font-medium">👤 Cashier Role Detected</h3>
                                <p className="text-blue-700 text-sm mt-1">
                                    You have cashier permissions and can process sales transactions.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 