import { Check, BadgeCheck } from "lucide-react";

const CHECKLIST = [
  { label: "Profile photo", done: true },
  { label: "Bio", done: true },
  { label: "Specialties", done: true },
  { label: "Services & pricing", done: true },
  { label: "Availability", done: true },
  { label: "Connect payouts", done: false },
];

const SERVICES = [
  { name: "Free Intro Consult", meta: "15 min · video", price: "Free" },
  { name: "Skin Concern Consult", meta: "30 min · video", price: "$25" },
  { name: "Full Routine Review", meta: "45 min · video", price: "$40" },
];

export default function ExpertProfileBuilder() {
  return (
    <div className="mx-auto w-full max-w-[1160px]">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">Expert profile</div>
          <h1 className="font-display text-2xl font-semibold leading-tight text-ink-900">Build your profile</h1>
        </div>
        <button className="h-11 rounded-[22px] border border-purple-600/15 bg-white px-[18px] text-[13.5px] font-semibold text-ink-700">Preview</button>
        <button className="bg-primary-gradient h-11 rounded-[22px] px-[22px] text-[13.5px] font-bold text-white shadow-glow">Publish profile</button>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[1fr_380px]">
        {/* LEFT builder */}
        <div className="flex flex-col gap-[22px]">
          {/* progress */}
          <div className="rounded-[24px] border border-white/90 bg-white/90 p-[22px] shadow-[0_14px_30px_-12px_rgba(120,80,160,0.22)]">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="text-[15px] font-bold text-ink-900">5 of 6 complete</span>
              <span className="text-xs font-bold text-warning">Almost there</span>
            </div>
            <div className="mb-4 h-[9px] overflow-hidden rounded bg-purple-500/[0.14]">
              <div className="h-full rounded bg-[linear-gradient(90deg,#8657C8,#C079C4)]" style={{ width: "83%" }} />
            </div>
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {CHECKLIST.map((it) => (
                <div key={it.label} className="flex items-center gap-3 py-2.5">
                  <span className={`flex size-6 flex-none items-center justify-center rounded-full ${it.done ? "bg-purple-500" : "border-[1.5px] border-purple-500/30"}`}>
                    {it.done && <Check className="size-3 text-white" strokeWidth={2.5} />}
                  </span>
                  <span className={`flex-1 text-[13px] font-semibold ${it.done ? "text-ink-500" : "text-ink-900"}`}>{it.label}</span>
                  <span className={`text-[11px] font-bold ${it.done ? "text-success" : "text-purple-500"}`}>{it.done ? "Done" : "Add"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* about & specialties */}
          <div className="rounded-[24px] border border-white/90 bg-white/90 p-6 shadow-[0_14px_30px_-12px_rgba(120,80,160,0.22)]">
            <div className="font-display mb-4 text-xl font-semibold text-ink-900">About &amp; specialties</div>
            <div className="mb-[7px] text-xs font-semibold text-ink-700">Bio</div>
            <textarea
              defaultValue="I help overwhelmed beginners build calm, effective skin routines that fit real life and real budgets."
              className="mb-[18px] h-[88px] w-full resize-none rounded-[14px] border border-purple-600/[0.12] bg-white/90 p-3.5 text-[13.5px] text-ink-900 outline-none"
            />
            <div className="mb-[9px] text-xs font-semibold text-ink-700">Specialties</div>
            <div className="flex flex-wrap gap-2">
              {["Dry skin", "Oily skin", "Acne", "Texture"].map((s) => (
                <span key={s} className="rounded-[15px] bg-purple-500/[0.09] px-[13px] py-[7px] text-xs font-semibold text-purple-600">{s} ✕</span>
              ))}
              <span className="rounded-[15px] border border-dashed border-purple-500/40 bg-white/90 px-[13px] py-[7px] text-xs font-semibold text-purple-500">+ Add</span>
            </div>
          </div>

          {/* services */}
          <div className="rounded-[24px] border border-white/90 bg-white/90 p-6 shadow-[0_14px_30px_-12px_rgba(120,80,160,0.22)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-display text-xl font-semibold text-ink-900">Services &amp; pricing</div>
              <span className="cursor-pointer text-[12.5px] font-bold text-purple-500">+ Add service</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {SERVICES.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-2xl border border-purple-600/10 px-4 py-[15px]">
                  <div>
                    <div className="text-sm font-bold text-ink-900">{s.name}</div>
                    <div className="mt-0.5 text-[11.5px] text-ink-500">{s.meta}</div>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{s.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT live preview */}
        <div className="flex flex-col gap-3.5 xl:sticky xl:top-4">
          <div className="flex items-center gap-2">
            <span className="size-[7px] rounded-full bg-success" />
            <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">How clients see you</span>
          </div>
          <div className="overflow-hidden rounded-[26px] border border-white/90 bg-white/[0.92] shadow-[0_18px_40px_-14px_rgba(120,80,160,0.28)]">
            <div className="relative h-[150px] bg-[url('/makeup.jpg')] bg-cover bg-center">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(46,36,64,0.55))]" />
            </div>
            <div className="relative -mt-[38px] px-[22px] pb-[22px]">
              <div className="size-[76px] rounded-full border-4 border-white bg-[url('/makeup.jpg')] bg-cover bg-center" />
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[19px] font-bold text-ink-900">Amara R.</span>
                <BadgeCheck className="size-[15px] text-purple-500" />
              </div>
              <div className="mt-0.5 text-xs text-ink-500">Licensed Esthetician</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className="text-warning">★</span>
                <span className="font-bold text-ink-900">4.9</span>
                <span className="text-ink-400">· 320 reviews</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Skincare", "Acne", "Beginner-friendly"].map((t) => (
                  <span key={t} className="rounded-xl bg-purple-500/[0.09] px-[11px] py-[5px] text-[11px] font-semibold text-purple-600">{t}</span>
                ))}
              </div>
              <p className="mt-3.5 text-[12.5px] leading-relaxed text-ink-500">
                I help overwhelmed beginners build calm, effective skin routines that fit real life and real budgets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
