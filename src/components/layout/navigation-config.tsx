import {
    LayoutDashboard,
    Package,
    Warehouse,
    ArrowRightLeft,
    Users,
    ShoppingCart,
    FileText,
    CreditCard,
    Monitor,
    UserCheck,
    TrendingUp,
    Truck,
    Receipt,
    Settings,
    Shield,
    BarChart3,
    MapPin,
    Route,
    LucideIcon
} from "lucide-react"

export interface NavigationItem {
    name: string
    href: string
    roles: string[]
    icon: LucideIcon
    comingSoon?: boolean
}

export interface NavigationGroup {
    name: string
    items: NavigationItem[]
}

export const navigation: NavigationGroup[] = [
    {
        name: "Dashboard",
        items: [
            { name: "Dashboard", href: "/dashboard", roles: ["super-admin", "manager"], icon: LayoutDashboard },
        ]
    },
    {
        name: "Inventories",
        items: [
            { name: "Inventory", href: "/inventory", roles: ["super-admin", "manager", "stock-clerk"], icon: Package },
            { name: "Warehouses", href: "/warehouses", roles: ["super-admin", "manager", "warehouse-supervisor", "stock-clerk"], icon: Warehouse },
            { name: "Stock Transfers", href: "/stock-transfers", roles: ["super-admin", "manager", "warehouse-supervisor", "stock-clerk"], icon: ArrowRightLeft },
        ]
    },
    {
        name: "Purchase",
        items: [
            { name: "Suppliers", href: "/suppliers", roles: ["super-admin", "manager", "purchasing-manager", "purchasing-clerk"], icon: Users },
            { name: "Purchase Orders", href: "/purchase-orders", roles: ["super-admin", "manager", "purchasing-manager", "purchasing-clerk"], icon: ShoppingCart },
            { name: "Purchase Receipts", href: "/purchase-receipts", roles: ["super-admin", "manager", "purchasing-manager", "warehouse-supervisor"], icon: FileText },
            { name: "Purchase Payment", href: "/purchase-payments", roles: ["super-admin", "manager", "purchasing-manager"], icon: CreditCard },
        ]
    },
    {
        name: "Sales",
        items: [
            { name: "POS", href: "/pos", roles: ["super-admin", "manager", "cashier"], icon: Monitor },
            { name: "Sales Orders", href: "/sales-orders", roles: ["super-admin", "manager", "sales-manager", "sales-rep"], icon: FileText },
            { name: "Delivery Orders", href: "/delivery-orders", roles: ["super-admin", "manager", "warehouse-manager", "delivery-driver"], icon: Truck },
            { name: "Sales Invoices", href: "/sales-invoices", roles: ["super-admin", "manager", "finance-manager", "accountant"], icon: Receipt },
            { name: "Delivery Routes", href: "/delivery-routes", roles: ["super-admin", "manager", "warehouse-manager", "delivery-driver"], icon: Route },
            { name: "Customers", href: "/customers", roles: ["super-admin", "manager", "sales-manager", "customer-service", "account-manager"], icon: UserCheck },
            { name: "Sales", href: "/sales", roles: ["super-admin", "manager"], icon: TrendingUp },
            { name: "Sales Payment Receive", href: "/sales-payment-receive", roles: ["super-admin", "manager", "sales-manager", "finance-manager", "accountant"], icon: MapPin },
        ]
    },
    {
        name: "Reports",
        items: [
            { name: "Reports", href: "/reports", roles: ["super-admin", "manager"], icon: BarChart3 },
        ]
    },
    {
        name: "Admin",
        items: [
            { name: "Users", href: "/users", roles: ["super-admin", "manager"], icon: Settings },
            { name: "Roles & Permissions", href: "/roles-permissions", roles: ["super-admin"], icon: Shield },
        ]
    },
] 