import { GlassCard } from "@dew/ui";

export default function Page() {
  return (
    <section>
      <h1 className="text-2xl">Expert approvals</h1>
      <p className="mt-1 text-sm text-ink-500">Review applications, verification, portfolios and go-live status.</p>
      <GlassCard className="mt-6">
        <p className="text-sm text-ink-500">
          Admin tooling for this area lands in a later phase.
        </p>
      </GlassCard>
    </section>
  );
}
