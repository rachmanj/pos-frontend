"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
    Plus,
    Edit,
    Trash2,
    Users,
    Shield,
    Search,
    Settings,
    Eye,
    Lock
} from "lucide-react"
import { roleApiWithSession } from "@/lib/user-api"
import { Role, Permission, ExtendedSession } from "@/types/auth"
import { RoleForm } from "./components/role-form"
import { PermissionsList } from "./components/permissions-list"

export default function RolesPermissionsPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null }
    const [roles, setRoles] = useState<Role[]>([])
    const [permissions, setPermissions] = useState<Record<string, Permission[]>>({})
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

    useEffect(() => {
        fetchData()
    }, [session])

    const fetchData = async () => {
        if (!session) return

        try {
            setLoading(true)
            const [rolesResponse, permissionsResponse] = await Promise.all([
                roleApiWithSession.getRoles(session),
                roleApiWithSession.getPermissions(session)
            ])

            setRoles(rolesResponse.roles)
            setPermissions(permissionsResponse.permissions)
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Failed to load roles and permissions")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateRole = async (data: { name: string; permissions: string[] }) => {
        if (!session) return

        try {
            await roleApiWithSession.createRole(session, data)
            toast.success("Role created successfully")
            setIsCreateDialogOpen(false)
            fetchData()
        } catch (error) {
            console.error("Error creating role:", error)
            toast.error("Failed to create role")
        }
    }

    const handleUpdateRole = async (data: { name?: string; permissions?: string[] }) => {
        if (!session || !selectedRole) return

        try {
            await roleApiWithSession.updateRole(session, selectedRole.id, data)
            toast.success("Role updated successfully")
            setIsEditDialogOpen(false)
            setSelectedRole(null)
            fetchData()
        } catch (error) {
            console.error("Error updating role:", error)
            toast.error("Failed to update role")
        }
    }

    const handleDeleteRole = async () => {
        if (!session || !roleToDelete) return

        try {
            await roleApiWithSession.deleteRole(session, roleToDelete.id)
            toast.success("Role deleted successfully")
            setIsDeleteDialogOpen(false)
            setRoleToDelete(null)
            fetchData()
        } catch (error) {
            console.error("Error deleting role:", error)
            toast.error("Failed to delete role")
        }
    }

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalPermissions = Object.values(permissions).reduce((acc, perms) => acc + perms.length, 0)

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                    <p className="text-muted-foreground">
                        Manage user roles and their associated permissions
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                            <DialogDescription>
                                Create a new role and assign permissions to it.
                            </DialogDescription>
                        </DialogHeader>
                        <RoleForm
                            permissions={permissions}
                            onSubmit={handleCreateRole}
                            onCancel={() => setIsCreateDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roles.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active system roles
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPermissions}</div>
                        <p className="text-xs text-muted-foreground">
                            Available permissions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {roles.reduce((acc, role) => acc + role.users_count, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Users with roles assigned
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="roles" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="roles">Roles Management</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions Overview</TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="space-y-4">
                    {/* Search */}
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    {/* Roles Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Roles</CardTitle>
                            <CardDescription>
                                Manage roles and their permissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role Name</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRoles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                                    <span className="capitalize">{role.name.replace('-', ' ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.slice(0, 3).map((permission) => (
                                                        <Badge key={permission} variant="secondary" className="text-xs">
                                                            {permission}
                                                        </Badge>
                                                    ))}
                                                    {role.permissions.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{role.permissions.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {role.users_count} users
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(role.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedRole(role)
                                                            setIsEditDialogOpen(true)
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setRoleToDelete(role)}
                                                                disabled={role.users_count > 0}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete the role "{role.name}"?
                                                                    This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={handleDeleteRole}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                    <PermissionsList permissions={permissions} />
                </TabsContent>
            </Tabs>

            {/* Edit Role Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>
                            Update the role name and permissions.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRole && (
                        <RoleForm
                            role={selectedRole}
                            permissions={permissions}
                            onSubmit={handleUpdateRole}
                            onCancel={() => {
                                setIsEditDialogOpen(false)
                                setSelectedRole(null)
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
} 