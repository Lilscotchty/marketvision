"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { AuthFormWrapper } from '@/components/auth/auth-form-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Lock, User, Eye, EyeOff } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      ></path>
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      ></path>
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      ></path>
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      ></path>
      <path d="M1 1h22v22H1z" fill="none"></path>
    </svg>
);

const FacebookIcon = () => (
    <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
    </svg>
);

const signupSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).max(20, { message: 'Username must be less than 20 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions."
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<null | 'google' | 'facebook'>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setIsSocialLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      toast({
        title: 'Sign Up Failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsSocialLoading(null);
    }
  };

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${location.origin}/api/auth/callback`,
        data: {
          username: data.username,
        }
      },
    });

    if (error) {
      toast({
        title: 'Sign Up Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Confirm Your Email',
        description: 'We sent a confirmation link to your email address.',
      });
    }
    setIsLoading(false);
  };

  const isButtonDisabled = isLoading || isSocialLoading !== null;

  return (
    <AuthFormWrapper 
      title="Get started quickly"
      description="Create an account to access exclusive market insights."
    >
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button variant="outline" onClick={() => handleSocialSignIn('google')} disabled={isButtonDisabled}>
            {isSocialLoading === 'google' ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
            Google
        </Button>
        <Button variant="outline" onClick={() => handleSocialSignIn('facebook')} disabled={isButtonDisabled}>
            {isSocialLoading === 'facebook' ? <Loader2 className="animate-spin" /> : <FacebookIcon />}
            Facebook
        </Button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or create with email</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="johndoe123" {...field} className="pl-9" />
                  </div>
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
                <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Min 8 characters" 
                      {...field} 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                   <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm password" 
                      {...field} 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/40">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                   <FormLabel className="text-xs text-muted-foreground">
                    I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full shiny-button text-base font-semibold" disabled={isButtonDisabled}>
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </Form>
      
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in here
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <Lock className="h-3 w-3" />
        Your data is securely encrypted and protected
      </p>
    </AuthFormWrapper>
  );
}