"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Lock, Shield, Users, Package, ShoppingCart, Monitor, FileText, BarChart3 } from "lucide-react"
import { Permission } from "@/types/auth"

interface PermissionsListProps {
    permissions: Record<string, Permission[]>
}

export function PermissionsList({ permissions }: PermissionsListProps) {
    const getGroupIcon = (groupName: string) => {
        const name = groupName.toLowerCase()
        if (name.includes('user')) return Users
        if (name.includes('inventory') || name.includes('product')) return Package
        if (name.includes('purchase') || name.includes('supplier')) return ShoppingCart
        if (name.includes('sale') || name.includes('pos')) return Monitor
        if (name.includes('report')) return BarChart3
        if (name.includes('warehouse')) return Package
        return Shield
    }

    const formatGroupName = (groupName: string) => {
        return groupName
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const formatPermissionName = (permissionName: string) => {
        return permissionName
            .replace(/[-_]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const getPermissionDescription = (permissionName: string) => {
        const descriptions: Record<string, string> = {
            'view users': 'View user profiles and basic information',
            'create users': 'Create new user accounts',
            'edit users': 'Modify existing user information',
            'delete users': 'Remove users from the system',
            'assign roles': 'Assign and manage user roles',
            'view inventory': 'View product inventory and stock levels',
            'manage inventory': 'Create, edit, and manage inventory items',
            'view purchasing': 'View purchase orders and supplier information',
            'manage purchasing': 'Create and manage purchase orders',
            'approve purchase orders': 'Approve purchase orders for processing',
            'process sales': 'Process sales transactions and POS operations',
            'manage sales': 'Manage sales data and customer information',
            'view reports': 'Access system reports and analytics',
            'manage reports': 'Create and configure custom reports',
            'view warehouses': 'View warehouse information and stock',
            'manage warehouses': 'Create and manage warehouse configurations',
            'manage stock transfers': 'Handle stock transfers between warehouses',
        }

        return descriptions[permissionName.toLowerCase()] || 'System permission for specific functionality'
    }

    const totalPermissions = Object.values(permissions).reduce((acc, perms) => acc + perms.length, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">System Permissions</h2>
                    <p className="text-muted-foreground">
                        Overview of all available permissions in the system
                    </p>
                </div>
                <Badge variant="outline" className="text-sm">
                    {totalPermissions} total permissions
                </Badge>
            </div>

            {/* Permissions Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(permissions).map(([groupName, groupPermissions]) => {
                    const IconComponent = getGroupIcon(groupName)

                    return (
                        <Card key={groupName} className="border-l-4 border-l-primary/20">
                            <CardHeader className="pb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <IconComponent className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">
                                            {formatGroupName(groupName)}
                                        </CardTitle>
                                        <CardDescription>
                                            {groupPermissions.length} permissions
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Separator />
                                <div className="space-y-3">
                                    {groupPermissions.map((permission) => (
                                        <div
                                            key={permission.id}
                                            className="flex items-start space-x-3 p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                                        >
                                            <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium">
                                                        {formatPermissionName(permission.name)}
                                                    </h4>
                                                    <Badge variant="secondary" className="text-xs ml-2">
                                                        {permission.guard_name}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {getPermissionDescription(permission.name)}
                                                </p>
                                                <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                                                    {permission.name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Permission System Overview</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                                {Object.keys(permissions).length}
                            </div>
                            <p className="text-sm text-muted-foreground">Permission Groups</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                                {totalPermissions}
                            </div>
                            <p className="text-sm text-muted-foreground">Total Permissions</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                                {Math.round(totalPermissions / Object.keys(permissions).length)}
                            </div>
                            <p className="text-sm text-muted-foreground">Avg per Group</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="text-sm text-muted-foreground">
                        <p>
                            Permissions are organized into logical groups based on system functionality.
                            Each permission controls access to specific features and operations within the POS-ATK system.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 