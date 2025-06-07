"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRange {
    from?: Date;
    to?: Date;
}

interface DatePickerWithRangeProps {
    date?: DateRange;
    onDateChange?: (date: DateRange | undefined) => void;
    className?: string;
    placeholder?: string;
}

export function DatePickerWithRange({
    date,
    onDateChange,
    className,
    placeholder = "Pick a date range",
}: DatePickerWithRangeProps) {
    const [fromDate, setFromDate] = React.useState(
        date?.from ? format(date.from, "yyyy-MM-dd") : ""
    );
    const [toDate, setToDate] = React.useState(
        date?.to ? format(date.to, "yyyy-MM-dd") : ""
    );

    const handleFromDateChange = (value: string) => {
        setFromDate(value);
        const newFromDate = value ? new Date(value) : undefined;
        const newToDate = toDate ? new Date(toDate) : undefined;
        onDateChange?.({
            from: newFromDate,
            to: newToDate,
        });
    };

    const handleToDateChange = (value: string) => {
        setToDate(value);
        const newFromDate = fromDate ? new Date(fromDate) : undefined;
        const newToDate = value ? new Date(value) : undefined;
        onDateChange?.({
            from: newFromDate,
            to: newToDate,
        });
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">From Date</label>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => handleFromDateChange(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">To Date</label>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={(e) => handleToDateChange(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
} 