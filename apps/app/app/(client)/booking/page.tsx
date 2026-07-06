"use client";

import { useState } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";

const SERVICES = [
  { name: "Free Intro Consult", desc: "15 min · video · a quick get-to-know-you", price: 0, label: "Free" },
  { name: "Skin Concern Consult", desc: "30 min · video · focused help + clear next steps", price: 25, label: "$25" },
  { name: "Full Routine Review", desc: "45 min · video · complete review + routine plan", price: 40, label: "$40" },
];
const DATES = [
  { day: "MON", num: 9, off: false }, { day: "TUE", num: 10, off: false },
  { day: "WED", num: 11, off: true }, { day: "THU", num: 12, off: false },
  { day: "FRI", num: 13, off: false }, { day: "SAT", num: 14, off: true },
];
const TIMES = ["10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM", "6:30 PM", "7:00 PM", "8:30 PM"];

export default function Booking() {
  const [service, setService] = useState(1);
  const [date, setDate] = useState(3);
  const [time, setTime] = useState(2);

  const svc = SERVICES[service]!;
  const day = DATES[date]!;
  const slot = TIMES[time]!;
  const price = svc.price;
  const fee = price > 0 ? 2 : 0;

  return (
    <div className="mx-auto grid w-full max-w-[1080px] grid-cols-1 items-start gap-8 xl:grid-cols-[1fr_372px]">
      {/* LEFT: steps */}
      <div className="flex flex-col gap-7">
        {/* Step 1 */}
        <section>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[2px] text-ink-400">Step 1</div>
          <h2 className="font-display mb-4 text-[26px] font-semibold text-ink-900">Choose a service</h2>
          <div className="flex flex-col gap-3">
            {SERVICES.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setService(i)}
                className={`flex items-center justify-between rounded-[18px] px-5 py-[18px] text-left transition ${
                  service === i ? "border-[1.5px] border-purple-500 bg-purple-500/[0.09]" : "border border-purple-600/10 bg-white/85"
                }`}
              >
                <div>
                  <div className="text-[15px] font-bold text-ink-900">{s.name}</div>
                  <div className="mt-0.5 text-xs text-ink-500">{s.desc}</div>
                </div>
                <span className="text-[15px] font-bold text-purple-600">{s.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2 */}
        <section>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[2px] text-ink-400">Step 2</div>
          <h2 className="font-display mb-1 text-[26px] font-semibold text-ink-900">Pick a date &amp; time</h2>
          <div className="mb-4 text-[12.5px] text-ink-500">June 2026 · times in your timezone</div>
          <div className="mb-5 flex gap-2.5">
            {DATES.map((d, i) => (
              <button
                key={d.num}
                disabled={d.off}
                onClick={() => setDate(i)}
                className={`flex-1 rounded-2xl py-3.5 text-center transition ${
                  date === i ? "bg-primary-gradient" : "border border-purple-600/10 bg-white/85"
                } ${d.off ? "opacity-40" : ""}`}
              >
                <div className={`text-[10.5px] font-semibold ${date === i ? "text-white/80" : "text-ink-400"}`}>{d.day}</div>
                <div className={`mt-1 text-lg font-bold ${date === i ? "text-white" : d.off ? "text-ink-400" : "text-ink-900"}`}>{d.num}</div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {TIMES.map((t, i) => (
              <button
                key={t}
                onClick={() => setTime(i)}
                className={`rounded-[14px] py-3.5 text-center text-[13.5px] font-semibold transition ${
                  time === i ? "bg-primary-gradient text-white" : "border border-purple-600/10 bg-white/85 text-ink-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* Step 3 */}
        <section>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[2px] text-ink-400">Step 3</div>
          <h2 className="font-display mb-4 text-[26px] font-semibold text-ink-900">
            Help Amara prepare <span className="font-sans text-sm font-medium text-ink-400">· optional</span>
          </h2>
          <textarea
            placeholder="What do you want help with most? e.g. persistent breakouts along my jaw"
            className="h-24 w-full resize-none rounded-2xl border border-purple-600/10 bg-white/90 p-4 text-sm text-ink-900 outline-none placeholder:text-ink-400/70"
          />
        </section>
      </div>

      {/* RIGHT: summary */}
      <div className="rounded-[26px] border border-white/90 bg-white/90 p-6 shadow-[0_18px_40px_-14px_rgba(120,80,160,0.28)] xl:sticky xl:top-4">
        <div className="flex items-center gap-3 border-b border-purple-600/[0.08] pb-[18px]">
          <div className="size-[52px] flex-none rounded-full bg-[url('/makeup.jpg')] bg-cover bg-center" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-ink-900">Amara R.</span>
              <BadgeCheck className="size-[13px] text-purple-500" />
            </div>
            <div className="mt-0.5 text-[11.5px] text-ink-500">Licensed Esthetician · ★ 4.9</div>
          </div>
        </div>
        <div className="border-b border-purple-600/[0.08] py-[18px] text-[13.5px]">
          <Row label="Service" value={svc.name} />
          <Row label="When" value={`Thu Jun ${day.num} · ${slot}`} />
          <Row label="Format" value="Video · 30 min" last />
        </div>
        <div className="border-b border-purple-600/[0.08] py-[18px] text-[13.5px]">
          <Row label={svc.name} value={`$${price.toFixed(2)}`} />
          <Row label="Service fee" value={`$${fee.toFixed(2)}`} last />
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="text-[15px] font-bold text-ink-900">Total</span>
          <span className="text-xl font-bold text-purple-600">${(price + fee).toFixed(2)}</span>
        </div>
        <button className="bg-primary-gradient h-[52px] w-full rounded-[26px] text-[15px] font-bold text-white shadow-glow">Confirm &amp; pay</button>
        <div className="mt-4 flex items-center gap-2.5 rounded-[14px] bg-[linear-gradient(135deg,rgba(123,82,196,0.1),rgba(200,120,190,0.1))] px-3.5 py-3">
          <ShieldCheck className="size-4 text-purple-500" />
          <span className="flex-1 text-[11.5px] text-ink-700">Premium members save 15%.</span>
          <span className="cursor-pointer text-[11.5px] font-bold text-purple-500">Upgrade</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between ${last ? "" : "mb-2.5"}`}>
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  );
}
