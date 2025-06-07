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
            { name: "Purchase Payment", href: "/purchase-payments", roles: ["super-admin", "manager", "purchasing-manager"], icon: CreditCard, comingSoon: true },
        ]
    },
    {
        name: "Sales",
        items: [
            { name: "POS", href: "/pos", roles: ["super-admin", "manager", "cashier"], icon: Monitor },
            { name: "Customers", href: "/customers", roles: ["super-admin", "manager", "sales-manager"], icon: UserCheck, comingSoon: true },
            { name: "Sales", href: "/sales", roles: ["super-admin", "manager"], icon: TrendingUp },
            { name: "Sales Delivery", href: "/sales-delivery", roles: ["super-admin", "manager", "sales-manager"], icon: Truck, comingSoon: true },
            { name: "Sales Receipt", href: "/sales-receipts", roles: ["super-admin", "manager", "sales-manager"], icon: Receipt, comingSoon: true },
        ]
    },
    {
        name: "Admin",
        items: [
            { name: "Users", href: "/users", roles: ["super-admin", "manager"], icon: Settings },
            { name: "Roles & Permissions", href: "/roles-permissions", roles: ["super-admin"], icon: Shield, comingSoon: true },
        ]
    },
    {
        name: "Reports",
        items: [
            { name: "Reports", href: "/reports", roles: ["super-admin", "manager"], icon: BarChart3 },
        ]
    },
] 