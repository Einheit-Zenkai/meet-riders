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
  
  // --- 1. ADD STATE FOR THE NEW FIELDS ---
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [location, setLocation] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // --- 2. ADD THE NEW DATA TO THE SIGN-UP REQUEST ---
    // Supabase lets you pass extra data during sign-up.
    // This data is stored temporarily and we can use it in our SQL trigger.
    const { error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          birth_date: birthDate,
          location: location,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setMessage('Account created successfully! Please check your email for a verification link.');
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-background">
      <div className="absolute top-4 left-4">
        <Button asChild variant="outline"><Link href="/">Go Back</Link></Button>
      </div>

      <div className="w-full max-w-md p-8 border rounded-2xl shadow-lg bg-card">
        <h2 className="text-3xl font-bold text-center mb-6 text-foreground">Sign Up</h2>

        <form onSubmit={handleSubmit}>
          
          {/* --- 3. ADDED THE NEW JSX INPUT FIELDS --- */}
          <div className="mb-4">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="fullName">
              Full Name
            </label>
            <Input id="fullName" type="text" placeholder="e.g. Alex Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div className="mb-4">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="birthDate">
              Date of Birth
            </label>
            <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
          </div>
          
          <div className="mb-4">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="location">
              General Location (City)
            </label>
            <Input id="location" type="text" placeholder="e.g. New York" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          {/* --- YOUR EXISTING INPUTS (UNTOUCHED) --- */}
          <div className="mb-4">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

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