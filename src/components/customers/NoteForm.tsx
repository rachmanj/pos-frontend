"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, AlertCircle, Calendar, User, Tag, Paperclip } from "lucide-react";
import { toast } from "sonner";
import {
    CustomerNote,
    useCreateCustomerNote,
    useUpdateCustomerNote,
    useCustomerCrmDropdownData
} from "@/hooks/useCustomerCrm";

// Note form validation schema
const noteFormSchema = z.object({
    type: z.enum([
        "general",
        "call",
        "meeting",
        "email",
        "complaint",
        "opportunity",
        "follow_up"
    ]),
    title: z.string().min(3, "Title must be at least 3 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    is_private: z.boolean(),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    follow_up_date: z.string().optional(),
    follow_up_assigned_to: z.number().optional(),
    tags: z.array(z.string()).optional(),
});

type NoteFormData = z.infer<typeof noteFormSchema>;

interface NoteFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerId: number;
    note?: CustomerNote;
    onSuccess?: () => void;
}

export function NoteForm({ open, onOpenChange, customerId, note, onSuccess }: NoteFormProps) {
    const createNote = useCreateCustomerNote();
    const updateNote = useUpdateCustomerNote();
    const { data: dropdownData } = useCustomerCrmDropdownData();

    const form = useForm<NoteFormData>({
        resolver: zodResolver(noteFormSchema),
        defaultValues: {
            type: "general",
            priority: "medium",
            is_private: false,
            tags: [],
        },
    });

    // Populate form when editing
    useEffect(() => {
        if (note && open) {
            form.reset({
                type: note.type,
                title: note.title,
                content: note.content,
                is_private: note.is_private,
                priority: note.priority,
                follow_up_date: note.follow_up_date || "",
                follow_up_assigned_to: note.follow_up_assigned_to || undefined,
                tags: note.tags || [],
            });
        } else if (!note && open) {
            form.reset({
                type: "general",
                priority: "medium",
                is_private: false,
                tags: [],
            });
        }
    }, [note, open, form]);

    const onSubmit = async (data: NoteFormData) => {
        try {
            // Clean up empty values
            const cleanData = {
                ...data,
                follow_up_date: data.follow_up_date || undefined,
                follow_up_assigned_to: data.follow_up_assigned_to || undefined,
                tags: data.tags?.filter(tag => tag.trim() !== "") || [],
            };

            if (note) {
                await updateNote.mutateAsync({
                    customerId,
                    noteId: note.id,
                    noteData: cleanData,
                });
                toast.success("Note updated successfully");
            } else {
                await createNote.mutateAsync({
                    customerId,
                    noteData: cleanData,
                });
                toast.success("Note created successfully");
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast.error(note ? "Failed to update note" : "Failed to create note");
        }
    };

    const isLoading = createNote.isPending || updateNote.isPending;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "bg-red-500";
            case "high":
                return "bg-orange-500";
            case "medium":
                return "bg-yellow-500";
            case "low":
                return "bg-green-500";
            default:
                return "bg-gray-500";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "call":
                return "📞";
            case "meeting":
                return "🤝";
            case "email":
                return "📧";
            case "complaint":
                return "⚠️";
            case "opportunity":
                return "💰";
            case "follow_up":
                return "📅";
            default:
                return "📝";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {note ? "Edit Note" : "Add New Note"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Note Type & Priority */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Note Classification</CardTitle>
                            <CardDescription>
                                Categorize and prioritize this interaction
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Note Type *</Label>
                                    <Select
                                        value={form.watch("type")}
                                        onValueChange={(value) =>
                                            form.setValue("type", value as any)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">
                                                <span className="flex items-center gap-2">
                                                    📝 General Note
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="call">
                                                <span className="flex items-center gap-2">
                                                    📞 Phone Call
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="meeting">
                                                <span className="flex items-center gap-2">
                                                    🤝 Meeting
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="email">
                                                <span className="flex items-center gap-2">
                                                    📧 Email Communication
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="complaint">
                                                <span className="flex items-center gap-2">
                                                    ⚠️ Complaint
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="opportunity">
                                                <span className="flex items-center gap-2">
                                                    💰 Sales Opportunity
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="follow_up">
                                                <span className="flex items-center gap-2">
                                                    📅 Follow-up Required
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Priority Level *</Label>
                                    <Select
                                        value={form.watch("priority")}
                                        onValueChange={(value) =>
                                            form.setValue("priority", value as any)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor("low")}`}></div>
                                                    Low Priority
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor("medium")}`}></div>
                                                    Medium Priority
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="high">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor("high")}`}></div>
                                                    High Priority
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="urgent">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor("urgent")}`}></div>
                                                    Urgent
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_private"
                                    checked={form.watch("is_private")}
                                    onCheckedChange={(checked: boolean) => form.setValue("is_private", checked)}
                                />
                                <Label htmlFor="is_private" className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Mark as private (visible only to assigned users)
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Note Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Note Content
                            </CardTitle>
                            <CardDescription>
                                Detailed information about this interaction
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Note Title *</Label>
                                <Input
                                    id="title"
                                    {...form.register("title")}
                                    placeholder="Brief summary of the interaction"
                                />
                                {form.formState.errors.title && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.title.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Note Content *</Label>
                                <Textarea
                                    id="content"
                                    {...form.register("content")}
                                    placeholder="Detailed description of the interaction, outcomes, and any important information..."
                                    rows={6}
                                    className="min-h-[150px]"
                                />
                                {form.formState.errors.content && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.content.message}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Follow-up Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Follow-up Information
                            </CardTitle>
                            <CardDescription>
                                Schedule follow-up actions and assign responsibility
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="follow_up_date">Follow-up Date</Label>
                                    <Input
                                        id="follow_up_date"
                                        type="date"
                                        {...form.register("follow_up_date")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Assign Follow-up To</Label>
                                    <Select
                                        value={form.watch("follow_up_assigned_to")?.toString() || "none"}
                                        onValueChange={(value) =>
                                            form.setValue("follow_up_assigned_to", value === "none" ? undefined : parseInt(value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No assignment</SelectItem>
                                            {dropdownData?.users?.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tags and Attachments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Tags & Organization
                            </CardTitle>
                            <CardDescription>
                                Add tags for better organization and searchability
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma-separated)</Label>
                                <Input
                                    id="tags"
                                    placeholder="e.g., important, pricing, contract, urgent"
                                    value={form.watch("tags")?.join(", ") || ""}
                                    onChange={(e) => {
                                        const tags = e.target.value
                                            .split(",")
                                            .map(tag => tag.trim())
                                            .filter(tag => tag !== "");
                                        form.setValue("tags", tags);
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Separate multiple tags with commas
                                </p>
                            </div>

                            {form.watch("tags") && form.watch("tags")!.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {form.watch("tags")!.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* File Attachments Note */}
                            <div className="border border-dashed border-muted-foreground/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Paperclip className="h-4 w-4" />
                                    <span>
                                        <strong>Note:</strong> File attachment support will be added in future updates for enhanced documentation capabilities.
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {note ? "Update Note" : "Create Note"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 