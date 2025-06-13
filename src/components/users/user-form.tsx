'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { directUserApi, directRoleApi, setStoredToken } from '@/lib/user-api';
import { User, Role, CreateUserData, UpdateUserData } from '@/types/auth';
import { toast } from 'sonner';

const userFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    employee_id: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended']),
    roles: z.array(z.string()).min(1, 'At least one role must be selected'),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User | null;
    onSuccess: () => void;
}

export function UserForm({ open, onOpenChange, user, onSuccess }: UserFormProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    // Toast functionality now handled by Sonner
    const { data: session, status } = useSession();
    const isEditing = !!user;

    // Store token in localStorage when session is available
    useEffect(() => {
        if (status === 'authenticated' && session && 'accessToken' in session && session.accessToken) {
            console.log('📝 Storing access token in localStorage (UserForm)');
            setStoredToken(session.accessToken as string);
        }
    }, [session, status]);

    const form = useForm<UserFormData>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            employee_id: '',
            status: 'active',
            roles: [],
        },
    });

    useEffect(() => {
        if (open && status === 'authenticated' && session) {
            fetchRoles();
            if (user) {
                // Populate form with user data
                form.reset({
                    name: user.name,
                    email: user.email,
                    password: '', // Never populate password
                    phone: user.profile?.phone || '',
                    address: user.profile?.address || '',
                    employee_id: user.profile?.employee_id || '',
                    status: (user.profile?.status as 'active' | 'inactive' | 'suspended') || 'active',
                    roles: user.roles || [],
                });
            } else {
                // Reset form for new user
                form.reset({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    address: '',
                    employee_id: '',
                    status: 'active',
                    roles: [],
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, user, form, status, session]);

    const fetchRoles = async () => {
        if (!session || !('accessToken' in session) || !session.accessToken) {
            console.log("⚠️ No session or access token available for fetchRoles");
            return;
        }

        try {
            console.log("🔄 Fetching roles with direct API...");
            const response = await directRoleApi.getRoles();
            setRoles(response.roles);
            console.log("✅ Roles fetched successfully:", response.roles.length);
        } catch (error: unknown) {
            console.error('❌ Failed to fetch roles:', error);
            toast.error('Failed to fetch roles');
        }
    };

    const onSubmit = async (data: UserFormData) => {
        if (status !== 'authenticated' || !session || !('accessToken' in session) || !session.accessToken) {
            toast.error('You must be logged in to perform this action');
            return;
        }

        // Custom password validation
        if (!isEditing) {
            // For new users, password is required
            if (!data.password || data.password.trim() === '') {
                form.setError('password', {
                    type: 'manual',
                    message: 'Password is required for new users'
                });
                return;
            }
            if (data.password.length < 6) {
                form.setError('password', {
                    type: 'manual',
                    message: 'Password must be at least 6 characters'
                });
                return;
            }
        }

        setLoading(true);
        try {
            if (isEditing && user) {
                // Update user
                const updateData: UpdateUserData = {
                    name: data.name,
                    email: data.email,
                    profile: {
                        phone: data.phone || '',
                        address: data.address || '',
                        employee_id: data.employee_id || '',
                        status: data.status,
                    },
                };

                // Only include password if provided
                if (data.password && data.password.trim() !== '') {
                    updateData.password = data.password;
                }

                await directUserApi.updateUser(user.id, updateData);

                // Update roles separately
                const currentRoles = user.roles || [];
                const newRoles = data.roles;

                // Remove roles that are no longer selected
                for (const role of currentRoles) {
                    if (!newRoles.includes(role)) {
                        await directUserApi.removeRole(user.id, role);
                    }
                }

                // Add new roles
                for (const role of newRoles) {
                    if (!currentRoles.includes(role)) {
                        await directUserApi.assignRole(user.id, role);
                    }
                }

                toast.success('User updated successfully');
            } else {
                // Create new user
                const createData: CreateUserData = {
                    name: data.name,
                    email: data.email,
                    password: data.password!,
                    password_confirmation: data.password!,
                    profile: {
                        phone: data.phone || '',
                        address: data.address || '',
                        employee_id: data.employee_id || '',
                        status: data.status,
                    },
                    role: data.roles[0], // Primary role for creation
                };

                const response = await directUserApi.createUser(createData);

                // Assign additional roles if more than one selected
                if (data.roles.length > 1) {
                    for (let i = 1; i < data.roles.length; i++) {
                        await directUserApi.assignRole(response.user.id, data.roles[i]);
                    }
                }

                toast.success('User created successfully');
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: unknown) {
            console.error('Failed to save user:', error);

            // Handle validation errors more specifically
            const errorMessage = error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} user`;

            if (error instanceof Error && error.message.includes('email has already been taken')) {
                form.setError('email', {
                    type: 'manual',
                    message: 'This email address is already in use by another user'
                });
            } else if (error instanceof Error && error.message.includes('employee_id')) {
                form.setError('employee_id', {
                    type: 'manual',
                    message: 'This employee ID is already in use'
                });
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleToggle = (roleName: string) => {
        const currentRoles = form.getValues('roles');
        const newRoles = currentRoles.includes(roleName)
            ? currentRoles.filter(r => r !== roleName)
            : [...currentRoles, roleName];

        form.setValue('roles', newRoles);
    };

    const selectedRoles = form.watch('roles');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit User' : 'Create New User'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update user information and permissions.'
                            : 'Add a new user to your POS system.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {status === 'loading' ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-sm text-gray-600">Loading...</p>
                        </div>
                    </div>
                ) : status !== 'authenticated' ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <p className="text-red-600">You must be logged in to access this form.</p>
                        </div>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter full name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="Enter email address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Password {isEditing && '(leave blank to keep current password)'}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder={isEditing ? "Enter new password (optional)" : "Enter password"}
                                                {...field}
                                            />
                                        </FormControl>
                                        {isEditing && (
                                            <FormDescription>
                                                Leave this field blank if you don&apos;t want to change the password.
                                            </FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter phone number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="employee_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Employee ID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter employee ID" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="roles"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Roles</FormLabel>
                                        <FormDescription>
                                            Select one or more roles for this user.
                                        </FormDescription>
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                {roles.map((role) => (
                                                    <Button
                                                        key={role.id}
                                                        type="button"
                                                        variant={selectedRoles.includes(role.name) ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handleRoleToggle(role.name)}
                                                    >
                                                        {selectedRoles.includes(role.name) ? (
                                                            <X className="w-3 h-3 mr-1" />
                                                        ) : (
                                                            <Plus className="w-3 h-3 mr-1" />
                                                        )}
                                                        {role.name}
                                                    </Button>
                                                ))}
                                            </div>
                                            {selectedRoles.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    <span className="text-sm text-muted-foreground">Selected:</span>
                                                    {selectedRoles.map((role) => (
                                                        <Badge key={role} variant="secondary">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}