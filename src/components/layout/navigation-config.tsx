export interface NavigationItem {
    name: string
    href: string
    roles: string[]
}

export const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/dashboard", roles: ["super-admin", "manager"] },
    { name: "POS", href: "/pos", roles: ["super-admin", "manager", "cashier"] },
    { name: "Users", href: "/users", roles: ["super-admin", "manager"] },
    { name: "Inventory", href: "/inventory", roles: ["super-admin", "manager", "stock-clerk"] },
    { name: "Suppliers", href: "/suppliers", roles: ["super-admin", "manager", "purchasing-manager", "purchasing-clerk"] },
    { name: "Purchase Orders", href: "/purchase-orders", roles: ["super-admin", "manager", "purchasing-manager", "purchasing-clerk"] },
    { name: "Purchase Receipts", href: "/purchase-receipts", roles: ["super-admin", "manager", "purchasing-manager", "warehouse-supervisor"] },
    { name: "Sales", href: "/sales", roles: ["super-admin", "manager"] },
    { name: "Reports", href: "/reports", roles: ["super-admin", "manager"] },
] 