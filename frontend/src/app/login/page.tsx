'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleMicrosoftLogin = () => {
    alert('Sign in with Microsoft coming soon!');
  };

  return (
    <div className="flex h-screen relative">

      {/* Top Buttons */}
      <div className="absolute top-4 left-4">
        <Button asChild variant="outline">
          <Link href="/">Go Back</Link>
        </Button>
      </div>
      <div className="absolute top-4 right-16">
        <Button asChild variant="outline">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>

      {/* Centered Login Form */}
      <div className="flex items-center justify-center w-full">
        <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg border">
          <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Login</h2>

          <form>
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
              />
            </div>

            <div className="mb-6">
              <label className="block text-foreground text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button className="w-full hover:cursor-pointer" type="submit">
              Login (placeholder)
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Microsoft Login */}
          <Button variant="outline" className="w-full mb-4" onClick={handleMicrosoftLogin}>
            Sign in with Microsoft
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:text-primary/80">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
