"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (session) {
      // User is authenticated, redirect based on role
      if (session.user?.roles?.includes("super-admin") || session.user?.roles?.includes("manager")) {
        router.push("/dashboard")
      } else {
        router.push("/pos")
      }
    } else {
      // User is not authenticated, redirect to login
      router.push("/auth/login")
    }
  }, [session, status, router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading POS-ATK...</p>
      </div>
    </div>
  )
}
