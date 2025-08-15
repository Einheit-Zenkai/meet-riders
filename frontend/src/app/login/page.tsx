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
    <div className="flex h-screen">

      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-red-600 text-white p-12">
        <h1 className="text-5xl font-bold mb-4">Meetriders</h1>
        <p className="text-xl text-center">Your carpooling community. Share rides, save money and make new friends.</p>
      </div>


      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/">go back</Link>
            </Button>
            <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>

          <form>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
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
            <Button className="w-full" type="submit">
              Login
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full mb-4" onClick={handleMicrosoftLogin}>
            Sign in with Microsoft
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-red-600 hover:text-red-500">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}