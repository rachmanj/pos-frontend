"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NavigationItem } from "@/components/layout/navigation-config"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavigationMenuItemProps {
    item: NavigationItem
    isCollapsed: boolean
}

export function NavigationMenuItem({ item, isCollapsed }: NavigationMenuItemProps) {
    const pathname = usePathname()
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

    const content = (
        <>
            <item.icon className={cn(
                "flex-shrink-0",
                isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-3"
            )} />
            {!isCollapsed && (
                <>
                    <span className="truncate">{item.name}</span>
                    {item.comingSoon && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded dark:bg-amber-900/50 dark:text-amber-300">
                            Soon
                        </span>
                    )}
                    {isActive && !item.comingSoon && (
                        <div className="ml-auto w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                    )}
                </>
            )}
        </>
    )

    const menuItem = (
        <li>
            {item.comingSoon ? (
                <div
                    className={cn(
                        "flex items-center text-sm font-medium rounded-lg cursor-not-allowed opacity-75",
                        "text-gray-500 dark:text-gray-400",
                        isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-2"
                    )}
                >
                    {content}
                </div>
            ) : (
                <Link
                    href={item.href}
                    className={cn(
                        "flex items-center text-sm font-medium rounded-lg transition-colors group relative",
                        isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                        isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-2"
                    )}
                >
                    {content}
                    {/* Active indicator for collapsed state */}
                    {isCollapsed && isActive && !item.comingSoon && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-l"></div>
                    )}
                </Link>
            )}
        </li>
    )

    // Wrap with tooltip when collapsed
    if (isCollapsed) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {menuItem}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                        <p>{item.name}</p>
                        {item.comingSoon && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">Coming Soon</p>
                        )}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return menuItem
} 