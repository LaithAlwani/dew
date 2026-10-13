import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col justify-center gap-6 px-6 py-24">
      <p className="font-body text-navy/60 text-sm uppercase tracking-widest">Dew</p>
      <h1 className="font-display text-5xl text-navy leading-tight">
        Thoughtful introductions for beauty and makeup.
      </h1>
      <p className="font-body text-lg text-navy/80">
        Tell us what you&rsquo;re looking for and we&rsquo;ll connect you with a professional who
        fits. Full experience coming soon.
      </p>
      <div>
        <Link
          href="/discover"
          className="inline-flex items-center rounded-md bg-coral px-6 py-3 font-body text-surface"
        >
          Get matched
        </Link>
      </div>
    </main>
  );
}
