"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { Toaster } from "@/components/ui/toaster"
import { navigation } from "@/components/layout/navigation-config"
import { ExtendedSession } from "@/types/auth"
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context"

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { isCollapsed } = useSidebar()

    // Handle unauthenticated state in useEffect to avoid setState during render
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login")
        }
    }, [status, router])

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Redirecting to login...</p>
                </div>
            </div>
        )
    }

    const userRoles = (session?.user as unknown as ExtendedSession["user"])?.roles || []

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <Sidebar navigation={navigation} userRoles={userRoles} />

            {/* Main content */}
            <div className={`transition-all duration-300 ${isCollapsed ? 'pl-16' : 'pl-64'}`}>
                {/* Header */}
                <Navbar userName={session?.user?.name || undefined} userRoles={userRoles} />

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>

            {/* Toast notifications */}
            <Toaster />
        </div>
    )
}

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
    )
} 