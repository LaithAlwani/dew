import { Clock, ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = [
  { day: "MON", num: 9 }, { day: "TUE", num: 10 }, { day: "WED", num: 11 },
  { day: "THU", num: 12 }, { day: "FRI", num: 13 }, { day: "SAT", num: 14 }, { day: "SUN", num: 15 },
];
const TIMES = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"];
const TODAY = 3; // THU

type Ev = { title: string; who: string; green?: boolean };
const EVENTS: Record<string, Ev> = {
  "1-0": { title: "Consult", who: "Priya" },
  "2-1": { title: "Intro", who: "Jordan", green: true },
  "3-2": { title: "Lena V.", who: "Trial", green: true },
  "5-0": { title: "Reeva K.", who: "Skin Consult" },
  "5-3": { title: "Consult", who: "Maya" },
  "7-4": { title: "Routine", who: "Sana P." },
};

const HOURS = [
  { name: "Monday", on: true }, { name: "Tuesday", on: true }, { name: "Wednesday", on: false },
  { name: "Thursday", on: true }, { name: "Friday", on: true }, { name: "Saturday", on: false }, { name: "Sunday", on: false },
];

export default function ExpertCalendar() {
  return (
    <div className="mx-auto w-full max-w-[1160px]">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">Your schedule</div>
          <h1 className="font-display text-2xl font-semibold leading-tight text-ink-900">June 9 – 15, 2026</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="flex size-[38px] items-center justify-center rounded-full border border-purple-600/[0.12] bg-white/75"><ChevronLeft className="size-4 text-purple-600" /></button>
          <button className="flex size-[38px] items-center justify-center rounded-full border border-purple-600/[0.12] bg-white/75"><ChevronRight className="size-4 text-purple-600" /></button>
        </div>
        <button className="bg-primary-gradient h-11 rounded-[22px] px-5 text-[13.5px] font-bold text-white">+ Block time</button>
      </div>

      <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[1fr_320px]">
        {/* week grid */}
        <div className="overflow-x-auto rounded-[24px] border border-white/90 bg-white/85 shadow-[0_14px_30px_-12px_rgba(120,80,160,0.2)]">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[56px_repeat(7,1fr)]">
              <div className="border-b border-purple-600/[0.08]" />
              {DAYS.map((d, i) => (
                <div key={d.num} className={`border-b border-l border-purple-600/[0.05] py-3.5 text-center ${i === TODAY ? "bg-purple-500/[0.06]" : ""}`}>
                  <div className="text-[10px] font-semibold text-ink-400">{d.day}</div>
                  <div className={`mt-[3px] text-base font-bold ${i === TODAY ? "text-purple-600" : "text-ink-900"}`}>{d.num}</div>
                </div>
              ))}
            </div>
            {TIMES.map((t, ri) => (
              <div key={t} className="grid min-h-16 grid-cols-[56px_repeat(7,1fr)]">
                <div className="border-b border-purple-600/[0.05] px-2 pt-2 text-right text-[10.5px] font-semibold text-ink-400">{t}</div>
                {DAYS.map((_, ci) => {
                  const e = EVENTS[`${ri}-${ci}`];
                  return (
                    <div key={ci} className="border-b border-l border-purple-600/[0.05] p-1">
                      {e && (
                        <div className={`h-full rounded-[9px] border-l-[3px] px-2 py-[7px] ${e.green ? "border-l-[#4FA97C] bg-[rgba(95,185,140,0.12)]" : "border-l-purple-500 bg-purple-500/[0.11]"}`}>
                          <div className={`text-[10.5px] font-bold leading-tight ${e.green ? "text-[#2E4A3A]" : "text-ink-700"}`}>{e.title}</div>
                          <div className={`mt-0.5 text-[9.5px] ${e.green ? "text-[#5E8A70]" : "text-purple-700/80"}`}>{e.who}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* right rail */}
        <div className="flex flex-col gap-5">
          <div className="rounded-[22px] border border-white/90 bg-white/[0.88] p-5 shadow-[0_12px_26px_-10px_rgba(120,80,160,0.2)]">
            <div className="font-display mb-3.5 text-[19px] font-semibold text-ink-900">Weekly hours</div>
            {HOURS.map((h) => (
              <div key={h.name} className="flex items-center gap-3 border-b border-purple-600/[0.05] py-[11px] last:border-0">
                <span className="flex-1 text-[13px] font-semibold text-ink-900">{h.name}</span>
                <span className={`text-[11.5px] font-semibold ${h.on ? "text-ink-500" : "text-ink-400"}`}>{h.on ? "9:00 – 5:00" : "Off"}</span>
                <span className={`relative h-6 w-10 flex-none rounded-full ${h.on ? "bg-primary-gradient" : "bg-purple-600/[0.18]"}`}>
                  <span className={`absolute top-[3px] size-[18px] rounded-full bg-white shadow ${h.on ? "left-[19px]" : "left-[3px]"}`} />
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-[20px] border border-white/90 bg-white/[0.88] px-5 py-[18px] shadow-[0_10px_22px_-8px_rgba(120,80,160,0.18)]">
            <Clock className="size-5 text-purple-500" strokeWidth={1.7} />
            <div className="flex-1">
              <div className="text-[13.5px] font-bold text-ink-900">Buffer between sessions</div>
              <div className="mt-0.5 text-[11px] text-ink-500">Auto breather after each consult</div>
            </div>
            <span className="text-[12.5px] font-bold text-purple-600">15 min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
