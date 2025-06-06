"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/toast"

import { loginSchema, type LoginFormData } from "@/lib/validations"
import { ExtendedSession } from "@/types/auth"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const { showToast } = useToast()

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: LoginFormData) => {
        console.log("🚀 Login form submitted with:", { email: data.email, password: "***" })
        console.log("🌍 Environment variables:", {
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
            NEXTAUTH_URL: process.env.NEXTAUTH_URL
        })

        setIsLoading(true)
        setError(null)

        try {
            console.log("📞 Calling signIn with credentials provider...")
            showToast("Signing in...", "info", 2000)

            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            })

            console.log("📋 SignIn result:", result)

            if (result?.error) {
                console.error("❌ SignIn error:", result.error)
                setError("Invalid email or password")
                showToast("Invalid email or password", "error")
            } else {
                console.log("✅ SignIn successful, getting session...")
                showToast("Login successful! Redirecting...", "success", 2000)

                // Get the session to check user role and redirect accordingly
                const session = await getSession()
                console.log("👤 Session data:", session)

                const userRoles = (session?.user as unknown as ExtendedSession["user"])?.roles || []
                if (userRoles.includes("super-admin") || userRoles.includes("manager")) {
                    console.log("🔄 Redirecting to dashboard...")
                    router.push("/dashboard")
                } else {
                    console.log("🔄 Redirecting to POS...")
                    router.push("/pos")
                }
            }
        } catch (error) {
            console.error("💥 Exception during login:", error)
            setError("An error occurred. Please try again.")
            showToast("An error occurred. Please try again.", "error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">POS-ATK</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Point of Sale System</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sign in to your account</CardTitle>
                        <CardDescription>
                            Enter your email and password to access the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter your password"
                                                        {...field}
                                                        className="pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Signing in..." : "Sign in"}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/auth/register"
                                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Demo accounts:<br />
                                Admin: admin@pos-atk.com / password<br />
                                Manager: manager@pos-atk.com / password<br />
                                Cashier: cashier@pos-atk.com / password
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 