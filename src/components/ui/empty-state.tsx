import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
                className
            )}
        >
            {icon && (
                <div className="mb-4 text-muted-foreground">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}
        </div>
    );
} 