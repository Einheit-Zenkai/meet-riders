"use client";

export default function PurposeParallax() {
  return (
    <>
      <section className="relative h-96 md:h-[480px] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#06b6d4,#3b82f6)] bg-fixed transform-gpu scale-110" />

        <div className="absolute inset-0 opacity-40 bg-[url('/globe.svg')] bg-center bg-no-repeat bg-contain mix-blend-overlay" />

        <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Meet-Riders — Share rides, save time</h2>
            <p className="text-white/90 mb-2">We connect riders going the same way so you can share rides, split costs, and meet new people—safely and conveniently.</p>
            <p className="text-white/80">Host or join nearby trips, browse upcoming rides, and manage party requests from one dashboard.</p>
          </div>
        </div>
      </section>

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
    </>
  );
}
