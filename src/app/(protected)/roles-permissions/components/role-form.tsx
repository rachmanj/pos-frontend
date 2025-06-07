"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Shield, Lock } from "lucide-react"
import { Role, Permission } from "@/types/auth"

interface RoleFormProps {
    role?: Role
    permissions: Record<string, Permission[]>
    onSubmit: (data: { name: string; permissions: string[] }) => void
    onCancel: () => void
}

export function RoleForm({ role, permissions, onSubmit, onCancel }: RoleFormProps) {
    const [name, setName] = useState(role?.name || "")
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        role?.permissions || []
    )
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Expand all groups by default
        const initialExpanded: Record<string, boolean> = {}
        Object.keys(permissions).forEach(group => {
            initialExpanded[group] = true
        })
        setExpandedGroups(initialExpanded)
    }, [permissions])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        try {
            await onSubmit({
                name: name.trim(),
                permissions: selectedPermissions
            })
        } finally {
            setLoading(false)
        }
    }

    const handlePermissionToggle = (permissionName: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionName)
                ? prev.filter(p => p !== permissionName)
                : [...prev, permissionName]
        )
    }

    const handleGroupToggle = (groupName: string, allSelected: boolean) => {
        const groupPermissions = permissions[groupName]?.map(p => p.name) || []

        if (allSelected) {
            // Remove all permissions from this group
            setSelectedPermissions(prev =>
                prev.filter(p => !groupPermissions.includes(p))
            )
        } else {
            // Add all permissions from this group
            setSelectedPermissions(prev => {
                const newPermissions = [...prev]
                groupPermissions.forEach(permission => {
                    if (!newPermissions.includes(permission)) {
                        newPermissions.push(permission)
                    }
                })
                return newPermissions
            })
        }
    }

    const toggleGroupExpansion = (groupName: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }))
    }

    const getGroupStats = (groupName: string) => {
        const groupPermissions = permissions[groupName] || []
        const selectedCount = groupPermissions.filter(p =>
            selectedPermissions.includes(p.name)
        ).length
        return { total: groupPermissions.length, selected: selectedCount }
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Name */}
            <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter role name (e.g., Sales Manager)"
                    required
                />
            </div>

            {/* Permissions Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Permissions</Label>
                    <Badge variant="outline">
                        {selectedPermissions.length} selected
                    </Badge>
                </div>

                <ScrollArea className="h-96 border rounded-md p-4">
                    <div className="space-y-4">
                        {Object.entries(permissions).map(([groupName, groupPermissions]) => {
                            const stats = getGroupStats(groupName)
                            const allSelected = stats.selected === stats.total && stats.total > 0
                            const someSelected = stats.selected > 0 && stats.selected < stats.total

                            return (
                                <Card key={groupName} className="border-l-4 border-l-primary/20">
                                    <Collapsible
                                        open={expandedGroups[groupName]}
                                        onOpenChange={() => toggleGroupExpansion(groupName)}
                                    >
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        {expandedGroups[groupName] ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                        <Shield className="h-4 w-4 text-primary" />
                                                        <div>
                                                            <CardTitle className="text-sm">
                                                                {formatGroupName(groupName)}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs">
                                                                {stats.selected} of {stats.total} permissions selected
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge
                                                            variant={allSelected ? "default" : someSelected ? "secondary" : "outline"}
                                                            className="text-xs"
                                                        >
                                                            {stats.selected}/{stats.total}
                                                        </Badge>
                                                        <Checkbox
                                                            checked={allSelected}
                                                            ref={(el: any) => {
                                                                if (el) el.indeterminate = someSelected
                                                            }}
                                                            onCheckedChange={() => handleGroupToggle(groupName, allSelected)}
                                                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="pt-0">
                                                <Separator className="mb-3" />
                                                <div className="grid gap-3">
                                                    {groupPermissions.map((permission) => (
                                                        <div
                                                            key={permission.id}
                                                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/30 transition-colors"
                                                        >
                                                            <Checkbox
                                                                id={`permission-${permission.id}`}
                                                                checked={selectedPermissions.includes(permission.name)}
                                                                onCheckedChange={() => handlePermissionToggle(permission.name)}
                                                            />
                                                            <div className="flex-1">
                                                                <Label
                                                                    htmlFor={`permission-${permission.id}`}
                                                                    className="text-sm font-medium cursor-pointer"
                                                                >
                                                                    <div className="flex items-center space-x-2">
                                                                        <Lock className="h-3 w-3 text-muted-foreground" />
                                                                        <span>{formatPermissionName(permission.name)}</span>
                                                                    </div>
                                                                </Label>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {permission.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Summary */}
            {selectedPermissions.length > 0 && (
                <Card className="bg-muted/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Selected Permissions Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1">
                            {selectedPermissions.slice(0, 10).map((permission) => (
                                <Badge key={permission} variant="secondary" className="text-xs">
                                    {formatPermissionName(permission)}
                                </Badge>
                            ))}
                            {selectedPermissions.length > 10 && (
                                <Badge variant="outline" className="text-xs">
                                    +{selectedPermissions.length - 10} more
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading || !name.trim()}>
                    {loading ? "Saving..." : role ? "Update Role" : "Create Role"}
                </Button>
            </div>
        </form>
    )
} 