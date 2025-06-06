"use client"

import { useState, useRef, useEffect, useMemo } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/ui/page-header'
import {
    Search,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Maximize,
    Minimize,
    User,
    ShoppingCart,
    Calculator,
    Receipt,
    Check,
    ChevronsUpDown
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { useSales, useCreateSale, useProductSearch, useDailySummary, useActivePaymentMethods } from '@/hooks/useSales'
import { useCustomers, useCreateCustomer, type Customer } from '@/hooks/useCustomers'
import { useCashSessions, useOpenCashSession, useCloseCashSession } from '@/hooks/useCashSessions'

// Form schemas
const customerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    type: z.enum(['regular', 'vip', 'wholesale', 'member']),
})

const paymentSchema = z.object({
    payment_method_id: z.number(),
    amount: z.number().min(0),
    reference: z.string().optional(),
})

type CustomerForm = z.infer<typeof customerSchema>
type PaymentForm = z.infer<typeof paymentSchema>

// CartItem interface for POS
interface CartItem {
    product_id: number
    product_name: string
    price: number
    quantity: number
    warehouse_id: number
}

// Currency formatter
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount)
}

export default function POSPage() {
    // State management
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [cashGiven, setCashGiven] = useState<number>(0)
    const [productComboOpen, setProductComboOpen] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Debounce search query to avoid excessive API calls
    const debouncedSearchQuery = useDebounce(searchQuery, 300) // 300ms delay

    // API hooks
    const { data: productsData, isLoading: isSearchLoading, error: searchError } = useProductSearch(debouncedSearchQuery)
    const { data: customersData } = useCustomers({})
    const { data: dailySummary } = useDailySummary()
    const { data: cashSession } = useCashSessions()
    const { data: paymentMethods } = useActivePaymentMethods()
    const createSale = useCreateSale()
    const createCustomer = useCreateCustomer()
    const openCashSession = useOpenCashSession()
    const closeCashSession = useCloseCashSession()

    // Forms
    const customerForm = useForm<CustomerForm>({
        resolver: zodResolver(customerSchema),
        defaultValues: { type: 'regular' },
    })

    const paymentForm = useForm<PaymentForm>({
        resolver: zodResolver(paymentSchema),
    })

    // Focus search on mount
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [])

    // Cart calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.11 // 11% PPN for Indonesia
    const total = subtotal + tax
    const change = cashGiven - total

    // Add product to cart
    const addToCart = (product: any) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product_id === product.id)
            if (existingItem) {
                return prevCart.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            } else {
                return [...prevCart, {
                    product_id: product.id,
                    product_name: product.name,
                    price: product.selling_price,
                    quantity: 1,
                    warehouse_id: product.warehouse_id,
                }]
            }
        })
        setSearchQuery('')
        setProductComboOpen(false)
    }

    // Update cart item quantity
    const updateQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            setCart(prevCart => prevCart.filter(item => item.product_id !== productId))
        } else {
            setCart(prevCart =>
                prevCart.map(item =>
                    item.product_id === productId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            )
        }
    }

    // Remove item from cart
    const removeFromCart = (productId: number) => {
        setCart(prevCart => prevCart.filter(item => item.product_id !== productId))
    }

    // Clear cart
    const clearCart = () => {
        setCart([])
        setSelectedCustomer(null)
        setCashGiven(0)
    }

    // Create new customer
    const onCreateCustomer = async (data: CustomerForm) => {
        try {
            const newCustomer = await createCustomer.mutateAsync(data)
            setSelectedCustomer(newCustomer)
            setIsCustomerDialogOpen(false)
            customerForm.reset()
        } catch (error) {
            // Error handled in hook
        }
    }

    // Process sale
    const onProcessSale = async (data: PaymentForm) => {
        if (cart.length === 0) return

        try {
            await createSale.mutateAsync({
                warehouse_id: cart[0]?.warehouse_id || 1,
                customer_id: selectedCustomer?.id,
                items: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.price,
                })),
                payments: [{
                    payment_method_id: data.payment_method_id,
                    amount: data.amount,
                    reference_number: data.reference,
                }],
            })

            clearCart()
            setIsPaymentDialogOpen(false)
            paymentForm.reset()
        } catch (error) {
            // Error handled in hook
        }
    }

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'container mx-auto py-6'} space-y-6`}>
            {/* Header */}
            <PageHeader
                title="Point of Sale"
                description="Process sales transactions and manage cash register"
                action={
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </Button>

                        {(!cashSession || cashSession.status !== 'open') && (
                            <Button onClick={() => openCashSession.mutate({ warehouse_id: 1, opening_cash: 100000, opening_notes: "Main Register Session" })}>
                                Open Cash Session
                            </Button>
                        )}
                    </div>
                }
            />

            {/* Cash Session Alert */}
            {(!cashSession || cashSession.status !== 'open') && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 text-yellow-800">
                            <Receipt className="h-4 w-4" />
                            <span className="font-medium">Cash session is not open. Please open a cash session to process sales.</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Search & Selection */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Product Search Combobox */}
                    <Card>
                        <CardContent className="pt-6">
                            <Popover open={productComboOpen} onOpenChange={setProductComboOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={productComboOpen}
                                        className="w-full justify-between h-auto py-3"
                                    >
                                        <div className="flex items-center">
                                            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                Search products by name, barcode, or SKU...
                                            </span>
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[600px] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onValueChange={setSearchQuery}
                                        />
                                        <CommandEmpty>
                                            {isSearchLoading && debouncedSearchQuery.length >= 2 ? (
                                                <div className="flex items-center justify-center py-4">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                    <span className="ml-2">Searching products...</span>
                                                </div>
                                            ) : searchError ? (
                                                <div className="text-red-500 py-4">
                                                    Error searching products. Please try again.
                                                </div>
                                            ) : debouncedSearchQuery.length < 2 ? (
                                                "Type at least 2 characters to search..."
                                            ) : (
                                                "No products found."
                                            )}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {!isSearchLoading && productsData && productsData.length > 0 && (
                                                productsData.map((product: any) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        value={product.name}
                                                        onSelect={() => addToCart(product)}
                                                        className="flex items-center justify-between p-3 cursor-pointer"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-medium">{product.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {product.sku} • Stock: {product.available_stock} {product.unit?.abbreviation || product.unit?.symbol}
                                                            </div>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <div className="font-medium">{formatCurrency(product.selling_price)}</div>
                                                            <div className="text-sm text-muted-foreground">{product.category?.name || 'No Category'}</div>
                                                        </div>
                                                    </CommandItem>
                                                ))
                                            )}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>

                    {/* Daily Summary */}
                    {dailySummary && (
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-2">
                                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="text-2xl font-bold">{dailySummary.total_sales_count}</div>
                                            <div className="text-sm text-muted-foreground">Transactions</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-2">
                                        <Calculator className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="text-2xl font-bold">{formatCurrency(dailySummary.total_sales_amount)}</div>
                                            <div className="text-sm text-muted-foreground">Sales Today</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="text-2xl font-bold">{dailySummary.payment_breakdown?.length || 0}</div>
                                            <div className="text-sm text-muted-foreground">Payment Methods</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Shopping Cart & Checkout */}
                <div className="space-y-4">
                    {/* Customer Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Customer</span>
                                <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Plus className="h-4 w-4 mr-1" />
                                            New
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Customer</DialogTitle>
                                        </DialogHeader>
                                        <Form {...customerForm}>
                                            <form onSubmit={customerForm.handleSubmit(onCreateCustomer)} className="space-y-4">
                                                <FormField
                                                    control={customerForm.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Name</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={customerForm.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Phone</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="flex justify-end space-x-2">
                                                    <Button type="button" variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit">Add Customer</Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select
                                value={selectedCustomer?.id?.toString() ?? ''}
                                onValueChange={(value) => {
                                    if (value) {
                                        const customer = customersData?.data?.find((c: Customer) => c.id.toString() === value)
                                        setSelectedCustomer(customer || null)
                                    } else {
                                        setSelectedCustomer(null)
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customersData?.data?.map((customer: Customer) => (
                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                            {customer.name} ({customer.customer_code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Shopping Cart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Cart ({cart.length})</span>
                                {cart.length > 0 && (
                                    <Button variant="outline" size="sm" onClick={clearCart}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {cart.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Cart is empty</p>
                                    <p className="text-sm">Search and add products above</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map((item) => (
                                        <div key={item.product_id} className="flex items-center justify-between p-2 border rounded">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{item.product_name}</div>
                                                <div className="text-xs text-muted-foreground">{formatCurrency(item.price)}</div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Totals & Payment */}
                    {cart.length > 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (11%):</span>
                                        <span>{formatCurrency(tax)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>

                                    <div className="space-y-2">
                                        <Input
                                            type="number"
                                            placeholder="Cash received"
                                            value={cashGiven === 0 ? '' : cashGiven.toString()}
                                            onChange={(e) => setCashGiven(e.target.value ? Number(e.target.value) : 0)}
                                        />

                                        {cashGiven > 0 && (
                                            <div className="flex justify-between text-lg">
                                                <span>Change:</span>
                                                <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {formatCurrency(change)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                className="w-full"
                                                disabled={!cashSession?.is_open || cart.length === 0}
                                            >
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Process Payment
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Process Payment</DialogTitle>
                                            </DialogHeader>
                                            <Form {...paymentForm}>
                                                <form onSubmit={paymentForm.handleSubmit(onProcessSale)} className="space-y-4">
                                                    <div className="bg-gray-50 p-4 rounded">
                                                        <div className="text-lg font-bold">Total: {formatCurrency(total)}</div>
                                                    </div>

                                                    <FormField
                                                        control={paymentForm.control}
                                                        name="payment_method_id"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Payment Method</FormLabel>
                                                                <Select
                                                                    value={field.value?.toString() ?? ''}
                                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select payment method" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="1">Cash</SelectItem>
                                                                        <SelectItem value="2">Credit Card</SelectItem>
                                                                        <SelectItem value="3">Debit Card</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={paymentForm.control}
                                                        name="amount"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Amount</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="flex justify-end space-x-2">
                                                        <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit">Complete Sale</Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
} 