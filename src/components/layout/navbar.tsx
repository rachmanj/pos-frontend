"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ClientOnly } from "@/components/client-only"
import { useToast } from "@/components/ui/toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface NavbarProps {
    userName?: string
    userRoles: string[]
}

export function Navbar({ userName, userRoles }: NavbarProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogoutConfirm = async () => {
        setIsLoggingOut(true)
        try {
            showToast("Logging out...", "info", 2000)
            await signOut({ redirect: false })
            showToast("Successfully logged out", "success", 2000)
            router.push("/auth/login")
        } catch (error) {
            console.error("Logout error:", error)
            showToast("An error occurred during logout. Please try again.", "error")
        } finally {
            setIsLoggingOut(false)
            setShowLogoutDialog(false)
        }
    }

    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Welcome back, {userName}
                    </h2>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Role: {userRoles.join(", ")}
                    </div>

                    <ClientOnly fallback={<div className="w-9 h-9" />}>
                        <ThemeToggle />
                    </ClientOnly>

                    <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowLogoutDialog(true)}
                            >
                                Logout
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to logout? You will need to sign in again to access the system.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isLoggingOut}>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleLogoutConfirm}
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? "Logging out..." : "Logout"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </header>
    )
} 