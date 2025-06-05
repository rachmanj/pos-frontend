"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        if (theme === "light") {
            setTheme("dark")
        } else if (theme === "dark") {
            setTheme("system")
        } else {
            setTheme("light")
        }
    }

    const getIcon = () => {
        if (!mounted) {
            return <Monitor className="h-4 w-4" />
        }

        switch (theme) {
            case "light":
                return <Sun className="h-4 w-4" />
            case "dark":
                return <Moon className="h-4 w-4" />
            default:
                return <Monitor className="h-4 w-4" />
        }
    }

    const getLabel = () => {
        if (!mounted) {
            return "Toggle theme"
        }

        switch (theme) {
            case "light":
                return "Switch to dark mode"
            case "dark":
                return "Switch to system mode"
            default:
                return "Switch to light mode"
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="w-9 h-9 p-0"
            suppressHydrationWarning
        >
            <span suppressHydrationWarning>
                {getIcon()}
            </span>
            <span className="sr-only" suppressHydrationWarning>
                {getLabel()}
            </span>
        </Button>
    )
} 