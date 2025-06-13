"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, Users, Gift, TrendingUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "sonner";

const loyaltyConfigSchema = z.object({
    // Basic Settings
    program_enabled: z.boolean(),
    program_name: z.string().min(1, "Program name is required"),
    program_description: z.string().optional(),

    // Points Configuration
    points_per_currency: z.number().min(0.0001, "Points per currency must be positive"),
    minimum_purchase_for_points: z.number().min(0, "Minimum purchase must be non-negative"),
    points_expiry_months: z.number().min(1, "Expiry months must be at least 1").max(120, "Expiry months cannot exceed 120"),

    // Redemption Settings
    redemption_enabled: z.boolean(),
    minimum_redemption_points: z.number().min(1, "Minimum redemption must be at least 1"),
    redemption_value_per_point: z.number().min(0.0001, "Redemption value must be positive"),
    maximum_redemption_percentage: z.number().min(1, "Max redemption must be at least 1%").max(100, "Max redemption cannot exceed 100%"),

    // Tier Settings
    tier_system_enabled: z.boolean(),
    bronze_threshold: z.number().min(0),
    silver_threshold: z.number().min(0),
    gold_threshold: z.number().min(0),
    platinum_threshold: z.number().min(0),
    diamond_threshold: z.number().min(0),

    // Bonus Settings
    birthday_bonus_enabled: z.boolean(),
    birthday_bonus_points: z.number().min(0),
    referral_bonus_enabled: z.boolean(),
    referral_bonus_points: z.number().min(0),
});

type LoyaltyConfigFormData = z.infer<typeof loyaltyConfigSchema>;

export default function LoyaltyProgramPage() {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoyaltyConfigFormData>({
        resolver: zodResolver(loyaltyConfigSchema),
        defaultValues: {
            program_enabled: true,
            program_name: "Sarange Loyalty Program",
            program_description: "Earn points with every purchase and redeem for discounts",
            points_per_currency: 0.01, // 1 point per 100 IDR
            minimum_purchase_for_points: 10000, // 10,000 IDR minimum
            points_expiry_months: 12, // 1 year expiry
            redemption_enabled: true,
            minimum_redemption_points: 100,
            redemption_value_per_point: 100, // 1 point = 100 IDR
            maximum_redemption_percentage: 50, // Max 50% of purchase can be paid with points
            tier_system_enabled: true,
            bronze_threshold: 0,
            silver_threshold: 1000000, // 1M IDR
            gold_threshold: 5000000, // 5M IDR
            platinum_threshold: 15000000, // 15M IDR
            diamond_threshold: 50000000, // 50M IDR
            birthday_bonus_enabled: true,
            birthday_bonus_points: 500,
            referral_bonus_enabled: true,
            referral_bonus_points: 1000,
        },
    });

    const onSubmit = async (data: LoyaltyConfigFormData) => {
        setIsLoading(true);
        try {
            // TODO: Implement API call to save loyalty program configuration
            console.log("Loyalty program configuration:", data);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success("Loyalty program configuration saved successfully");
        } catch (error: any) {
            toast.error("Failed to save loyalty program configuration");
        } finally {
            setIsLoading(false);
        }
    };

    const watchedValues = form.watch();

    return (
        <div className="container mx-auto py-6 space-y-6">
            <PageHeader
                title="Loyalty Program Configuration"
                description="Configure loyalty program settings, point earning rules, and tier thresholds"
                action={
                    <div className="flex items-center gap-2">
                        <Badge variant={watchedValues.program_enabled ? "default" : "secondary"}>
                            {watchedValues.program_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                    </div>
                }
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="basic" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                            <TabsTrigger value="points">Points & Redemption</TabsTrigger>
                            <TabsTrigger value="tiers">Tier System</TabsTrigger>
                            <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
                        </TabsList>

                        {/* Basic Settings Tab */}
                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Program Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="program_enabled"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Enable Loyalty Program
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Turn the loyalty program on or off for all customers
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="program_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Program Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Enter program name" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="points_expiry_months"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Points Expiry (Months)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        How many months before points expire
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="program_description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Program Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Describe your loyalty program..."
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Points & Redemption Tab */}
                        <TabsContent value="points" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Points Earning */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Points Earning
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="points_per_currency"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Points per IDR</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.0001"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        How many points earned per 1 IDR spent
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="minimum_purchase_for_points"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Minimum Purchase (IDR)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Minimum purchase amount to earn points
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-700">
                                                <strong>Example:</strong> With current settings, a purchase of IDR 100,000 will earn{" "}
                                                {Math.floor(100000 * watchedValues.points_per_currency)} points
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Points Redemption */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Gift className="h-5 w-5" />
                                            Points Redemption
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="redemption_enabled"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Enable Redemption</FormLabel>
                                                        <FormDescription className="text-xs">
                                                            Allow customers to redeem points
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="minimum_redemption_points"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Minimum Redemption Points</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="redemption_value_per_point"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Value per Point (IDR)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        How much IDR each point is worth when redeemed
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="maximum_redemption_percentage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Redemption (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max="100"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Maximum percentage of purchase that can be paid with points
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="text-sm text-green-700">
                                                <strong>Example:</strong> {watchedValues.minimum_redemption_points} points = IDR{" "}
                                                {(watchedValues.minimum_redemption_points * watchedValues.redemption_value_per_point).toLocaleString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Tier System Tab */}
                        <TabsContent value="tiers" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Customer Tier System
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="tier_system_enabled"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Enable Tier System
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Automatically upgrade customers based on spending
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {watchedValues.tier_system_enabled && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Bronze Tier</Label>
                                                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                        <p className="text-sm text-orange-700">
                                                            Starting tier for all customers
                                                        </p>
                                                        <p className="text-xs text-orange-600 mt-1">
                                                            IDR 0+
                                                        </p>
                                                    </div>
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="silver_threshold"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Silver Tier Threshold (IDR)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="gold_threshold"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Gold Tier Threshold (IDR)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="platinum_threshold"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Platinum Tier Threshold (IDR)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="diamond_threshold"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Diamond Tier Threshold (IDR)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <h4 className="font-medium text-blue-900 mb-2">Tier Preview</h4>
                                                <div className="space-y-1 text-sm text-blue-700">
                                                    <p>🥉 Bronze: IDR 0 - {(watchedValues.silver_threshold - 1).toLocaleString()}</p>
                                                    <p>🥈 Silver: IDR {watchedValues.silver_threshold.toLocaleString()} - {(watchedValues.gold_threshold - 1).toLocaleString()}</p>
                                                    <p>🥇 Gold: IDR {watchedValues.gold_threshold.toLocaleString()} - {(watchedValues.platinum_threshold - 1).toLocaleString()}</p>
                                                    <p>💎 Platinum: IDR {watchedValues.platinum_threshold.toLocaleString()} - {(watchedValues.diamond_threshold - 1).toLocaleString()}</p>
                                                    <p>💎 Diamond: IDR {watchedValues.diamond_threshold.toLocaleString()}+</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Bonuses Tab */}
                        <TabsContent value="bonuses" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Birthday Bonus */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Birthday Bonus</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="birthday_bonus_enabled"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Enable Birthday Bonus</FormLabel>
                                                        <FormDescription className="text-xs">
                                                            Give bonus points on customer birthdays
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        {watchedValues.birthday_bonus_enabled && (
                                            <FormField
                                                control={form.control}
                                                name="birthday_bonus_points"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Birthday Bonus Points</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Points awarded on customer's birthday
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Referral Bonus */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Referral Bonus</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="referral_bonus_enabled"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Enable Referral Bonus</FormLabel>
                                                        <FormDescription className="text-xs">
                                                            Reward customers for successful referrals
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        {watchedValues.referral_bonus_enabled && (
                                            <FormField
                                                control={form.control}
                                                name="referral_bonus_points"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Referral Bonus Points</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Points awarded for each successful referral
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading} size="lg">
                            <Save className="mr-2 h-4 w-4" />
                            {isLoading ? "Saving..." : "Save Configuration"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
} 