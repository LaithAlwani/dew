import { GlassCard } from "@dew/ui";

export default function Page() {
  return (
    <section>
      <h1 className="text-2xl">Reports and moderation</h1>
      <p className="mt-1 text-sm text-ink-500">Reported posts, messages and users, with a moderation log.</p>
      <GlassCard className="mt-6">
        <p className="text-sm text-ink-500">
          Admin tooling for this area lands in a later phase.
        </p>
      </GlassCard>
    </section>
  );
}
