"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { NavigationGroup } from "@/components/layout/navigation-config"
import { NavigationMenuItem } from "@/components/layout/navigation-menu-item"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/layout/sidebar-context"

interface SidebarProps {
    navigation: NavigationGroup[]
    userRoles: string[]
}

export function Sidebar({ navigation, userRoles }: SidebarProps) {
    const { isCollapsed, setIsCollapsed } = useSidebar()

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
        <div className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
            }`}>
            {/* Logo and Toggle */}
            <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4">
                {!isCollapsed && (
                    <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                        POS-ATK
                    </Link>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-2 overflow-y-auto h-[calc(100vh-4rem)] pb-6">
                <div className="space-y-6">
                    {filteredNavigation.map((group, groupIndex) => (
                        <div key={group.name}>
                            {/* Group Header - only show when not collapsed */}
                            {!isCollapsed && (
                                <div className="mb-3 px-2">
                                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {group.name}
                                    </h3>
                                    <div className="mt-2 border-t border-gray-100 dark:border-gray-800"></div>
                                </div>
                            )}

                            {/* Group Items */}
                            <ul className="space-y-1">
                                {group.items.map((item) => (
                                    <NavigationMenuItem
                                        key={item.name}
                                        item={item}
                                        isCollapsed={isCollapsed}
                                    />
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </nav>
        </div>
    )
} 