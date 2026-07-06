const SCHEDULE = [
  { time: "2:00", ap: "PM", name: "Reeva K.", svc: "Skin Concern Consult · 30 min", open: false },
  { time: "4:30", ap: "PM", name: "Jordan M.", svc: "Free Intro Consult · 15 min", open: false },
  { time: "6:00", ap: "PM", name: "", svc: "", open: true },
];

export default function ExpertDashboard() {
  return (
    <div className="mx-auto w-full max-w-[1160px]">
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">Expert workspace</div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink-900">Hi, Amara</h1>
      </div>

      {/* stat row */}
      <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="bg-primary-gradient relative overflow-hidden rounded-[24px] p-6 shadow-[0_18px_36px_-12px_rgba(109,74,160,0.34)]">
          <div className="pointer-events-none absolute -right-5 -top-8 size-[150px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_70%)]" />
          <div className="relative z-10">
            <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[2px] text-white/75">Available to pay out</div>
            <div className="font-display text-[38px] font-semibold leading-none text-white">$340.00</div>
            <div className="mt-2.5 text-[11.5px] text-white/80">Next payout · Mon, Jun 16</div>
          </div>
        </div>
        {[
          { label: "This week", value: "12", sub: "sessions booked" },
          { label: "Clients", value: "28", sub: "total" },
          { label: "Rating", value: "4.9", sub: "320 reviews", star: true },
        ].map((s) => (
          <div key={s.label} className="rounded-[24px] border border-white/90 bg-white/85 p-6 shadow-[0_12px_26px_-10px_rgba(120,80,160,0.2)]">
            <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[1.5px] text-ink-400">{s.label}</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[32px] font-bold leading-none text-ink-900">{s.value}</span>
              {s.star && <span className="text-base text-warning">★</span>}
            </div>
            <div className="mt-2 text-[11.5px] text-ink-500">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* schedule + rail */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_372px]">
        <div>
          <div className="mb-3.5 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold text-ink-900">Today&apos;s schedule</h2>
            <span className="cursor-pointer text-[13px] font-semibold text-purple-500">Open calendar</span>
          </div>
          <div className="flex flex-col gap-3">
            {SCHEDULE.map((s, i) =>
              s.open ? (
                <div key={i} className="flex items-center gap-4 rounded-[20px] border border-dashed border-purple-600/[0.18] bg-white/60 p-[18px]">
                  <div className="w-14 flex-none text-center">
                    <div className="text-base font-bold text-ink-400">{s.time}</div>
                    <div className="text-[10px] font-semibold text-ink-400">{s.ap}</div>
                  </div>
                  <div className="h-[42px] w-px bg-purple-600/[0.08]" />
                  <span className="flex-1 text-[13px] text-ink-400">Open slot</span>
                  <span className="cursor-pointer text-xs font-semibold text-purple-500">Block time</span>
                </div>
              ) : (
                <div key={i} className="flex items-center gap-4 rounded-[20px] border border-white/90 bg-white/[0.88] p-[18px] shadow-[0_10px_24px_-10px_rgba(120,80,160,0.2)]">
                  <div className="w-14 flex-none text-center">
                    <div className="text-base font-bold text-purple-600">{s.time}</div>
                    <div className="text-[10px] font-semibold text-ink-400">{s.ap}</div>
                  </div>
                  <div className="h-[42px] w-px bg-purple-600/10" />
                  <div className="size-11 flex-none rounded-full bg-[url('/makeup.jpg')] bg-cover bg-center" />
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-ink-900">{s.name}</div>
                    <div className="mt-0.5 text-xs text-ink-500">{s.svc}</div>
                  </div>
                  <button className="bg-primary-gradient h-[38px] rounded-[19px] px-5 text-[13px] font-bold text-white">Join</button>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-[22px] border border-purple-500/20 bg-white/[0.88] p-5 shadow-[0_12px_26px_-10px_rgba(120,80,160,0.2)]">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">New request</div>
              <span className="rounded-lg bg-purple-500 px-2 py-[3px] text-[10.5px] font-bold text-white">1 new</span>
            </div>
            <div className="mb-3.5 flex items-center gap-3">
              <div className="size-11 flex-none rounded-full bg-[url('/makeup.jpg')] bg-cover bg-center" />
              <div className="flex-1">
                <div className="text-[14.5px] font-bold text-ink-900">Sana P.</div>
                <div className="mt-0.5 text-[11.5px] text-ink-500">Full Routine Review · Fri Jun 13 · 3:30 PM</div>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button className="bg-primary-gradient h-10 flex-1 rounded-full text-[13px] font-bold text-white">Accept</button>
              <button className="h-10 flex-1 rounded-full border border-purple-600/15 bg-white text-[13px] font-semibold text-ink-700">Details</button>
            </div>
          </div>
          <div className="rounded-[22px] border border-white/90 bg-white/[0.88] p-5 shadow-[0_12px_26px_-10px_rgba(120,80,160,0.2)]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">Messages</span>
              <span className="flex size-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">3</span>
            </div>
            <div className="text-[13px] leading-relaxed text-ink-700">3 unread from clients waiting on your reply.</div>
            <div className="mt-3 cursor-pointer text-xs font-semibold text-purple-500">Open inbox →</div>
          </div>
        </div>
      </div>
    </div>
  );
}
