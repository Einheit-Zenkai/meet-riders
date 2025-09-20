import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
    return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <div className="max-w-4xl">
                <h1 className="text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl text-primary">
                    Meet Riders
                </h1>
                <p className="mt-4 text-xl font-medium tracking-wide sm:text-2xl md:text-3xl text-foreground">
                    Connect. Ride. Explore.
                </p>
                <p className="max-w-2xl mx-auto mt-6 text-lg text-muted-foreground">
                    The ultimate platform to connect with fellow students. Plan group rides, discover new routes, and share your passion.
                </p>
                <div className="flex flex-col justify-center gap-4 mt-10 sm:flex-row">
                    <Button size="lg" className="font-bold" asChild>
                        <Link href="/dashboard">Get Started</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="font-bold" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
