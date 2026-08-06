import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
    return (
        <div className="relative z-10 min-h-screen">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <div className="max-w-4xl">
                    <h1 className="text-5xl font-black sm:text-7xl md:text-8xl text-primary">
                        Meet Riders
                    </h1>
                    <p className="mt-4 text-xl font-medium sm:text-2xl md:text-3xl text-foreground">
                        Connect. Ride. Explore.
                    </p>
                    <p className="hidden sm:block max-w-2xl mx-auto mt-6 text-lg text-muted-foreground">
                        The ultimate platform to connect with fellow students. Plan group rides, discover new routes, and share your passion.
                    </p>
                    <div className="flex flex-col justify-center gap-4 mt-10 sm:flex-row">
                        <Button size="lg" className="font-bold" asChild>
                            <Link href="/login">Get Started</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="font-bold" asChild>
                            <Link href="/login">Login</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Share Rides Section */}
            <section className="py-16 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Meet-Riders — Share rides, save time</h2>
                    <p className="text-muted-foreground mb-2">We connect riders going the same way so you can share rides, split costs, and meet new people—safely and conveniently.</p>
                    <p className="text-muted-foreground">Host or join nearby trips, browse upcoming rides, and manage party requests from one dashboard.</p>
                </div>
            </section>

            {/* What We Do Section */}
            <section className="py-16">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="mb-10 text-center">
                        <p className="text-sm uppercase tracking-[0.3em] text-primary">What we do</p>
                        <h3 className="mt-3 text-3xl font-bold text-foreground">A smarter way to ride together</h3>
                        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
                            Meet-Riders helps you find shared rides, reduce costs, and travel with a community of fellow riders. Whether you're hosting a trip or joining one, everything is designed to keep your commute easy and social.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                            <h4 className="text-xl font-semibold text-foreground mb-3">Find the best rides</h4>
                            <p className="text-sm text-muted-foreground">
                                See rides near you, compare destinations, and join one that fits your schedule—no more guesswork or last-minute plans.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                            <h4 className="text-xl font-semibold text-foreground mb-3">Share the cost</h4>
                            <p className="text-sm text-muted-foreground">
                                Split the ride price with other riders, save on commuting, and keep payments transparent with group-based travel plans.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                            <h4 className="text-xl font-semibold text-foreground mb-3">Ride with confidence</h4>
                            <p className="text-sm text-muted-foreground">
                                Join verified groups, manage requests easily, and stay informed with notifications and scheduled ride details.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Get Started CTA */}
            <section className="py-20 text-center">
                <div className="mx-auto max-w-2xl px-6">
                    <h3 className="text-3xl font-bold text-foreground mb-4">Ready to start riding?</h3>
                    <p className="text-muted-foreground mb-8">
                        Join your campus community and discover a smarter way to commute.
                    </p>
                    <Button size="lg" className="font-bold" asChild>
                        <Link href="/login">Get Started</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
