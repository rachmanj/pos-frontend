"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface Toast {
    id: string
    message: string
    type: "success" | "error" | "info" | "warning"
    duration?: number
}

interface ToastContextType {
    toasts: Toast[]
    showToast: (message: string, type?: Toast["type"], duration?: number) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback((message: string, type: Toast["type"] = "info", duration = 4000) => {
        const id = Math.random().toString(36).substr(2, 9)
        const toast: Toast = { id, message, type, duration }

        setToasts((prev) => [...prev, toast])

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }, [removeToast])

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-[100] space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
            max-w-sm rounded-lg shadow-lg p-4 border-l-4 bg-white dark:bg-gray-800
            ${toast.type === "success" ? "border-green-500" : ""}
            ${toast.type === "error" ? "border-red-500" : ""}
            ${toast.type === "warning" ? "border-yellow-500" : ""}
            ${toast.type === "info" ? "border-blue-500" : ""}
            animate-in slide-in-from-right duration-300
          `}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div
                                className={`
                  w-3 h-3 rounded-full mr-3
                  ${toast.type === "success" ? "bg-green-500" : ""}
                  ${toast.type === "error" ? "bg-red-500" : ""}
                  ${toast.type === "warning" ? "bg-yellow-500" : ""}
                  ${toast.type === "info" ? "bg-blue-500" : ""}
                `}
                            />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 ml-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
} 