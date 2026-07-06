import { GlassCard } from "@dew/ui";

export default function Page() {
  return (
    <section>
      <h1 className="text-2xl">User management</h1>
      <p className="mt-1 text-sm text-ink-500">Search accounts by name, email, role, subscription and status.</p>
      <GlassCard className="mt-6">
        <p className="text-sm text-ink-500">
          Admin tooling for this area lands in a later phase.
        </p>
      </GlassCard>
    </section>
  );
}
