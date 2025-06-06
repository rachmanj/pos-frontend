"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NavigationItem } from "@/components/layout/navigation-config"

interface NavigationMenuItemProps {
    item: NavigationItem
}

export function NavigationMenuItem({ item }: NavigationMenuItemProps) {
    const pathname = usePathname()
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

    const content = (
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
    )

    return (
        <li>
            {item.comingSoon ? (
                <div
                    className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg cursor-not-allowed opacity-75",
                        "text-gray-500 dark:text-gray-400"
                    )}
                >
                    {content}
                </div>
            ) : (
                <Link
                    href={item.href}
                    className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                        isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    )}
                >
                    {content}
                </Link>
            )}
        </li>
    )
} 