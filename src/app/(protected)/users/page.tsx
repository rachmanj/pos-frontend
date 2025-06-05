'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Search, Filter, MoreHorizontal, Users, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { directUserApi, directRoleApi, setStoredToken } from '@/lib/user-api';
import { User, Role } from '@/types/auth';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import { UserForm } from '@/components/users/user-form';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Form state
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Delete confirmation state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const { showToast } = useToast();
    const { data: session, status } = useSession();

    // Store token in localStorage when session is available
    useEffect(() => {
        if (status === 'authenticated' && session && 'accessToken' in session && session.accessToken) {
            console.log('📝 Storing access token in localStorage');
            setStoredToken(session.accessToken as string);
        }
    }, [session, status]);

    const fetchRoles = async () => {
        try {
            const response = await directRoleApi.getRoles();
            setRoles(response.roles);
        } catch (error: unknown) {
            console.error("Failed to fetch roles:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await directUserApi.getUsers(
                currentPage,
                searchTerm || undefined,
                selectedRole === "all" ? undefined : selectedRole,
                selectedStatus === "all" ? undefined : selectedStatus
            );
            setUsers(response.users);
            setTotalPages(response.pagination.last_page);
        } catch (error: unknown) {
            console.error("Failed to fetch users:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch users";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && session) {
            fetchRoles();
        }
    }, [status, session]);

    useEffect(() => {
        if (status === 'authenticated' && session) {
            fetchUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm, selectedRole, selectedStatus, status, session]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleRoleFilter = (role: string) => {
        setSelectedRole(role);
        setCurrentPage(1);
    };

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status);
        setCurrentPage(1);
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setShowUserForm(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setShowUserForm(true);
    };

    const handleDeleteUser = (user: User) => {
        setDeletingUser(user);
        setShowDeleteDialog(true);
    };

    const confirmDeleteUser = async () => {
        if (!deletingUser) return;

        try {
            await directUserApi.deleteUser(deletingUser.id);
            showToast("User deleted successfully", "success", 3000);
            fetchUsers(); // Refresh the list
        } catch (error: unknown) {
            console.error("Failed to delete user:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
            showToast(errorMessage, "error");
        } finally {
            setShowDeleteDialog(false);
            setDeletingUser(null);
        }
    };

    const handleFormSuccess = () => {
        fetchUsers(); // Refresh the list after successful create/update
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super-admin': return 'bg-red-100 text-red-800';
            case 'manager': return 'bg-blue-100 text-blue-800';
            case 'cashier': return 'bg-green-100 text-green-800';
            case 'stock-clerk': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage users, roles, and permissions for your POS system.
                    </p>
                </div>
                <Button onClick={handleAddUser}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role</label>
                            <Select value={selectedRole} onValueChange={handleRoleFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Users ({users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                        <span className="text-sm font-medium">
                                            {i + 1}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-[250px] bg-muted rounded-md"></div>
                                        <div className="h-4 w-[200px] bg-muted rounded-md"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                    <span className="text-sm font-medium">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    {user.profile?.employee_id && (
                                                        <p className="text-sm text-muted-foreground">
                                                            ID: {user.profile.employee_id}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {user.roles.map((role) => (
                                                    <Badge key={role} className={getRoleColor(role)}>
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(user.profile?.status || 'active')}>
                                                {user.profile?.status || 'active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDeleteUser(user)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}

                    {users.length === 0 && !loading && (
                        <div className="text-center py-8">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold">No users found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                No users match your current filters.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* User Form Dialog */}
            <UserForm
                open={showUserForm}
                onOpenChange={setShowUserForm}
                user={editingUser}
                onSuccess={handleFormSuccess}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            <strong> {deletingUser?.name}</strong> and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 