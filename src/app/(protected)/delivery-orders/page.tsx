'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Package, MapPin, Clock, Users, CheckCircle } from 'lucide-react';

export default function DeliveryOrdersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Delivery Orders</h1>
                    <p className="text-muted-foreground">
                        Manage delivery schedules, track shipments, and coordinate logistics
                    </p>
                </div>
            </div>

            {/* Coming Soon Banner */}
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                        <Truck className="h-5 w-5" />
                        Delivery Order Management - Coming Soon
                    </CardTitle>
                    <CardDescription className="text-amber-700 dark:text-amber-300">
                        Advanced delivery management system is currently under development
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                        This module will provide comprehensive delivery order management including route optimization,
                        real-time tracking, and delivery confirmation features.
                    </p>
                </CardContent>
            </Card>

            {/* Planned Features Preview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Package className="h-4 w-4" />
                            Order Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Create, schedule, and track delivery orders with integrated inventory management
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            Route Optimization
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Intelligent route planning to minimize delivery time and transportation costs
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            Real-time Tracking
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Live tracking of delivery status with customer notifications and updates
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4" />
                            Driver Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Assign drivers, track performance, and manage delivery teams efficiently
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Proof of Delivery
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Digital signatures, photos, and confirmation receipts for delivery verification
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Truck className="h-4 w-4" />
                            Fleet Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Vehicle tracking, maintenance scheduling, and fleet optimization tools
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Implementation Roadmap</CardTitle>
                    <CardDescription>
                        Planned development phases for the delivery management system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                                <p className="font-medium">Phase 1: Basic Delivery Orders</p>
                                <p className="text-sm text-muted-foreground">Create and manage delivery orders with customer and product integration</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <div>
                                <p className="font-medium">Phase 2: Driver Assignment & Tracking</p>
                                <p className="text-sm text-muted-foreground">Driver management and basic delivery status tracking</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <div>
                                <p className="font-medium">Phase 3: Advanced Features</p>
                                <p className="text-sm text-muted-foreground">Route optimization, real-time GPS tracking, and proof of delivery</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
