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