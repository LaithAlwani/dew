import { ExpertsBrowser } from "./experts-browser";

export default function Experts() {
  return (
    <div className="mx-auto w-full max-w-[1160px]">
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">Marketplace</div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink-900">Find your beauty expert</h1>
      </div>

      <ExpertsBrowser />
    </div>
  );
}
