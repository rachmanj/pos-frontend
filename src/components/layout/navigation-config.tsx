export interface NavigationItem {
    name: string
    href: string
    roles: string[]
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
            { name: "Dashboard", href: "/dashboard", roles: ["super-admin", "manager"] },
        ]
    },
    {
        name: "Inventories",
        items: [
            { name: "Inventory", href: "/inventory", roles: ["super-admin", "manager", "stock-clerk"] },
            { name: "Warehouses", href: "/warehouses", roles: ["super-admin", "manager", "warehouse-supervisor", "stock-clerk"] },
            { name: "Stock Transfers", href: "/stock-transfers", roles: ["super-admin", "manager", "warehouse-supervisor", "stock-clerk"] },
        ]
    },
    {
        name: "Purchase",
        items: [
            { name: "Suppliers", href: "/suppliers", roles: ["super-admin", "manager", "purchasing-manager", "purchasing-clerk"] },
            { name: "Purchase Orders", href: "/purchase-orders", roles: ["super-admin", "manager", "purchasing-manager", "purchasing-clerk"] },
            { name: "Purchase Receipts", href: "/purchase-receipts", roles: ["super-admin", "manager", "purchasing-manager", "warehouse-supervisor"] },
            { name: "Purchase Payment", href: "/purchase-payments", roles: ["super-admin", "manager", "purchasing-manager"], comingSoon: true },
        ]
    },
    {
        name: "Sales",
        items: [
            { name: "POS", href: "/pos", roles: ["super-admin", "manager", "cashier"] },
            { name: "Customers", href: "/customers", roles: ["super-admin", "manager", "sales-manager"], comingSoon: true },
            { name: "Sales", href: "/sales", roles: ["super-admin", "manager"] },
            { name: "Sales Delivery", href: "/sales-delivery", roles: ["super-admin", "manager", "sales-manager"], comingSoon: true },
            { name: "Sales Receipt", href: "/sales-receipts", roles: ["super-admin", "manager", "sales-manager"], comingSoon: true },
        ]
    },
    {
        name: "Admin",
        items: [
            { name: "Users", href: "/users", roles: ["super-admin", "manager"] },
            { name: "Roles & Permissions", href: "/roles-permissions", roles: ["super-admin"], comingSoon: true },
        ]
    },
    {
        name: "Reports",
        items: [
            { name: "Reports", href: "/reports", roles: ["super-admin", "manager"] },
        ]
    },
] 