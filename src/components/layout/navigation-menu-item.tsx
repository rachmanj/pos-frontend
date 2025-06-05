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

    return (
        <li>
            <Link
                href={item.href}
                className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                )}
            >
                {item.name}
            </Link>
        </li>
    )
} 