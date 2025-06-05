"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Package,
    Tag,
    Scale,
    Activity,
    AlertTriangle,
    BarChart3,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const inventoryNavigation = [
    {
        name: "Overview",
        href: "/inventory",
        icon: BarChart3,
        description: "Inventory dashboard and summary",
    },
    {
        name: "Products",
        href: "/inventory/products",
        icon: Package,
        description: "Manage products and stock levels",
    },
    {
        name: "Categories",
        href: "/inventory/categories",
        icon: Tag,
        description: "Organize products into categories",
    },
    {
        name: "Units",
        href: "/inventory/units",
        icon: Scale,
        description: "Manage measurement units",
    },
    {
        name: "Movements",
        href: "/inventory/movements",
        icon: Activity,
        description: "View all stock movements",
    },
    {
        name: "Stock Adjustments",
        href: "/inventory/adjustments",
        icon: AlertTriangle,
        description: "Adjust stock levels",
    },
];

export default function InventoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            {/* Header with Quick Actions */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Inventory Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your products, categories, units, and stock levels
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href="/inventory/products/new">
                        <Button size="sm" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                    <Link href="/inventory/categories/new">
                        <Button size="sm" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </Link>
                    <Link href="/inventory/units/new">
                        <Button size="sm" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Unit
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {inventoryNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group inline-flex items-center px-3 py-4 border-b-2 font-medium text-sm whitespace-nowrap",
                                    isActive
                                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                )}
                                title={item.description}
                            >
                                <Icon
                                    className={cn(
                                        "mr-2 h-5 w-5",
                                        isActive
                                            ? "text-blue-500 dark:text-blue-400"
                                            : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            <div>{children}</div>
        </div>
    );
} 