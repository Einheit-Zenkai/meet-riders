'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client'



export default function SignupPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // We can use these states to show different messages to the user
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // STEP 2: Make the handleSubmit function async and add the Supabase logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset messages
    setError('');
    setMessage('');

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // This is the important part: Call Supabase to sign up the user
    const { error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    // Check if Supabase returned an error
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setMessage('Account created successfully! Please check your email for a verification link.');
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
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* STEP 3: Display success or error messages to the user */}
          {error && <p className="text-destructive text-center text-sm mb-4">{error}</p>}
          {message && <p className="text-green-600 text-center text-sm mb-4">{message}</p>}

          <Button className="w-full hover:cursor-pointer" type="submit">
            Create Account
          </Button>
        </form>

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