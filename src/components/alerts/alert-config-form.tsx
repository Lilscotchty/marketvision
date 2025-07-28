
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { AlertConfig } from "@/types";
import { PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  function onSubmit(values: z.infer<typeof alertSchema>) {
    setIsSubmitting(true);
    setTimeout(() => {
      const newAlert: AlertConfig = {
        id: Date.now().toString(),
        ...values,
      };
      onAddAlert(newAlert);
      form.reset();
      toast({
        title: "Alert Created Successfully",
        description: `Your new alert "${newAlert.name}" is now set up.`,
        variant: "default",
      });
      setIsSubmitting(false);
    }, 1000);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Configure New Alert</CardTitle>
        <CardDescription>Set up notifications for specific market events or AI predictions.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., BTC Price Target Hit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="asset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset/Pair</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., BTC/USD, ETH/USD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="conditionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a condition type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="price_target">Price Target</SelectItem>
                      <SelectItem value="confidence_change">Confidence Change</SelectItem>
                      <SelectItem value="pattern_detected">Pattern Detected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value / Threshold</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 50000, 0.8, Bullish Engulfing" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter target price, confidence (0-1), or pattern name.
                  </FormDescription>
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
                        <SelectValue placeholder="Select notification method" />
                      </Trigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="in-app">In-App (Mock)</SelectItem>
                      <SelectItem value="email">Email (Mock)</SelectItem>
                      <SelectItem value="sms">SMS (Mock)</SelectItem>
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Activate Alert</FormLabel>
                    <FormDescription>
                      Enable this alert to receive notifications.
                    </Form.Description>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Alert...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Alert
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
