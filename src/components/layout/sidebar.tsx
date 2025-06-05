"use client"

import Link from "next/link"
import { NavigationItem } from "@/components/layout/navigation-config"
import { NavigationMenuItem } from "@/components/layout/navigation-menu-item"

interface SidebarProps {
    navigation: NavigationItem[]
    userRoles: string[]
}

export function Sidebar({ navigation, userRoles }: SidebarProps) {
    const filteredNavigation = navigation.filter(item =>
        item.roles.some(role => userRoles.includes(role))
    )

    return (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800">
            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-800">
                <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                    POS-ATK
                </Link>
            </div>

            {/* Navigation */}
            <nav className="mt-8 px-4">
                <ul className="space-y-2">
                    {filteredNavigation.map((item) => (
                        <NavigationMenuItem key={item.name} item={item} />
                    ))}
                </ul>
            </nav>
        </div>
    )
} 