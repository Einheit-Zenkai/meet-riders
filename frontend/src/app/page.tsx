import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
    return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 sm:p-12">
            <div className="text-center">
                <div className="mb-8">
                    <h1 className="text-7xl sm:text-8xl font-black text-primary tracking-tight mb-4">
                        Meet Riders
                    </h1>
                    <div className="h-1 w-48 bg-primary mx-auto rounded-full"></div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 tracking-wide">
                    Connect. Ride. Explore.
                </h2>

                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-12">
                    The ultimate platform to connect with fellow students. Plan group rides, discover new routes, and share your passion.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="outline" className="font-bold" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button size="lg" className="font-bold" asChild>
                        <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="outline" size="lg" className="font-bold" asChild>
                        <Link href="/user-create">Create User</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
