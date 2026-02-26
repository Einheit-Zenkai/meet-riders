'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createClient } from '@/utils/supabase/client';

// Zod schema for form validation
const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must be at most 30 characters long')
    .regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, hyphens, and underscores')
    .transform(val => val.toLowerCase()),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize React Hook Form with Zod validation
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Google OAuth handler
  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=/dashboard`,
      },
    });

    if (error) {
      setIsSubmitting(false);
      toast.error("Sign Up Failed", {
        description: error.message,
      });
    }
    // Note: If successful, user will be redirected to Google
  };

  // Form submission handler
  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);

    try {
      // Step 1: Check if username is already taken
      const { data: existingUsername, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', data.username)
        .maybeSingle();

      if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned", which is what we want
        throw usernameCheckError;
      }

      if (existingUsername) {
        toast.error('Username Already Taken', {
          description: 'This username is already in use. Please choose a different one.',
        });
        form.setError('username', {
          type: 'manual',
          message: 'This username is already taken',
        });
        setIsSubmitting(false);
        return;
      }

      // Step 2: Attempt to sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
          }
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        // Check for specific email already exists error
        if (signUpError.message.toLowerCase().includes('already registered') || 
            signUpError.message.toLowerCase().includes('already exists') ||
            signUpError.message.toLowerCase().includes('user already registered')) {
          toast.error('Email Already Registered', {
            description: 'This email is already registered. Please use a different email or try logging in.',
          });
          form.setError('email', {
            type: 'manual',
            message: 'This email is already registered',
          });
        } else {
          toast.error('Sign Up Failed', {
            description: signUpError.message,
          });
        }
        setIsSubmitting(false);
        return;
      }


      // Profile is now created by the trigger, so we can remove the manual insert.
      // We just need to check for the user object.
      if (signUpData.user) {
        // Success!
        toast.success('Account Created Successfully!', {
          description: 'Please check your email for a verification link before logging in.',
        });
        form.reset(); // Clear the form on success
      } else if (!signUpError) {
        // Handle case where user is not null, but also no error.
        // This can happen with email confirmation enabled.
        toast.info('Please check your email', {
          description: 'A confirmation link has been sent to your email address.',
        });
        form.reset();
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Unexpected Error', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-background">

      {/* Go Back button */}
      <div className="absolute top-4 left-4">
        <Button asChild variant="outline">
          <Link href="/">Go Back</Link>
        </Button>
      </div>

      {/* Signup box */}
      <div className="w-full max-w-md p-8 border rounded-2xl shadow-lg bg-card">
        <h2 className="text-3xl font-bold text-center mb-6 text-foreground">Sign Up</h2>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm font-bold">
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="john_doe or rollnumber123"
                      {...field}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        // Convert to lowercase and remove invalid characters
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    For students: use your roll number. Others: choose a unique username.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm font-bold">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm font-bold">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm font-bold">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-2 text-muted-foreground">
              Or sign up with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignup}
          disabled={isSubmitting}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}