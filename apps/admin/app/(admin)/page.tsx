import { GlassCard } from "@dew/ui";

export default function Page() {
  return (
    <section>
      <h1 className="text-2xl">Platform overview</h1>
      <p className="mt-1 text-sm text-ink-500">Users, experts, pending approvals, bookings, reports and revenue at a glance.</p>
      <GlassCard className="mt-6">
        <p className="text-sm text-ink-500">
          Admin tooling for this area lands in a later phase.
        </p>
      </GlassCard>
    </section>
  );
}
