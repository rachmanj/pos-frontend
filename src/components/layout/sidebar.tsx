"use client"

import Link from "next/link"
import { NavigationGroup } from "@/components/layout/navigation-config"
import { NavigationMenuItem } from "@/components/layout/navigation-menu-item"

interface SidebarProps {
    navigation: NavigationGroup[]
    userRoles: string[]
}

export function Sidebar({ navigation, userRoles }: SidebarProps) {
    // Filter navigation groups and items based on user roles
    const filteredNavigation = navigation
        .map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.roles.some(role => userRoles.includes(role))
            )
        }))
        .filter(group => group.items.length > 0) // Only show groups that have accessible items

    return (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800">
            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-800">
                <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                    POS-ATK
                </Link>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-4 overflow-y-auto h-[calc(100vh-4rem)] pb-6">
                <div className="space-y-8">
                    {filteredNavigation.map((group, groupIndex) => (
                        <div key={group.name}>
                            {/* Group Header */}
                            <div className="mb-3">
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
                                    {group.name}
                                </h3>
                                <div className="mt-2 border-t border-gray-100 dark:border-gray-800"></div>
                            </div>

                            {/* Group Items */}
                            <ul className="space-y-1">
                                {group.items.map((item) => (
                                    <NavigationMenuItem key={item.name} item={item} />
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </nav>
        </div>
    )
} 