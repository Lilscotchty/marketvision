"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { AlertConfig, AssetCategory } from "@/types";
import { PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchMarketData, type FetchMarketDataResult } from "@/lib/actions"; 
import { categorizeAssetAction } from "@/lib/actions";

const alertSchema = z.object({
  name: z.string().min(3, "Alert name must be at least 3 characters"),
  asset: z.string().min(2, "Asset symbol is required (e.g., BTC/USD)"),
  conditionType: z.enum(["price_target", "confidence_change", "pattern_detected"]),
  value: z.string().min(1, "Value is required"),
  notificationMethod: z.enum(["email", "sms", "in-app"]),
  isActive: z.boolean().default(true),
});

interface AlertConfigFormProps {
  onAddAlert: (alert: AlertConfig) => void;
}

export function AlertConfigForm({ onAddAlert }: AlertConfigFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof alertSchema>>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      name: "",
      asset: "",
      conditionType: "price_target",
      value: "",
      notificationMethod: "in-app",
      isActive: true,
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(values: z.infer<typeof alertSchema>) {
    setIsSubmitting(true);
    let originalPrice: number | undefined = undefined;
    let category: AssetCategory | undefined = undefined;
    
    // Categorize
    try {
        const catResult = await categorizeAssetAction(values.asset);
        if (catResult && !catResult.error && catResult.category) {
            category = catResult.category;
        }
    } catch (error) {
        console.warn("Could not categorize asset on creation:", error);
    }
    
    // Fetch initial price
    if (values.conditionType === 'price_target') {
      try {
        const result: FetchMarketDataResult = await fetchMarketData(values.asset);
        if (result.data) {
          originalPrice = result.data.price;
        }
      } catch (error) {
        console.warn("Could not fetch current price for alert:", error);
      }
    }

    const newAlert: AlertConfig = {
      id: Date.now().toString(), // Temp ID, server will replace
      createdAt: new Date().toISOString(),
      originalPrice: originalPrice,
      category: category,
      ...values,
    };

    onAddAlert(newAlert);
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-2 pb-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alert Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., BTC Price Target" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="asset"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Asset/Pair</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., AAPL" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Target Price</FormLabel>
                    <FormControl>
                    <Input placeholder="50000" type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          <FormField
            control={form.control}
            name="conditionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="price_target">Price Target</SelectItem>
                    <SelectItem value="confidence_change" disabled>Confidence Change (soon)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notificationMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notification Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="in-app">In-App Notification</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium">Active Immediately</FormLabel>
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
          
          <div className="pt-4 sticky bottom-0 bg-background/95 backdrop-blur z-10 pb-2">
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90">
                {isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                </>
                ) : (
                <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Alert
                </>
                )}
            </Button>
          </div>
      </form>
    </Form>
  );
}