"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
    const { data: session } = useSession()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome to your POS-ATK dashboard</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {session?.user?.name}</p>
                            <p><strong>Email:</strong> {session?.user?.email}</p>
                            <p><strong>Roles:</strong> {session?.user?.roles?.join(", ")}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                        <CardDescription>System overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p>Total Sales: $0.00</p>
                            <p>Products: 0</p>
                            <p>Active Users: 1</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest system activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">No recent activity</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Authentication Test</CardTitle>
                    <CardDescription>Verify authentication is working</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                            <h3 className="text-green-800 dark:text-green-200 font-medium">✅ Authentication Successful</h3>
                            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                                You are successfully authenticated and can access protected routes.
                            </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                            <h3 className="text-blue-800 dark:text-blue-200 font-medium">🔐 Session Information</h3>
                            <pre className="text-blue-700 dark:text-blue-300 text-xs mt-2 overflow-auto">
                                {JSON.stringify(session, null, 2)}
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 