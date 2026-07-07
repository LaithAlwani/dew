import { CreditCard, Bell, Lock, Bookmark, HelpCircle, FileText, ChevronRight } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

const SETTINGS = [
  { icon: CreditCard, label: "Subscription & billing", meta: "Free" },
  { icon: Bell, label: "Notifications" },
  { icon: Lock, label: "Privacy & permissions" },
  { icon: Bookmark, label: "Saved experts & products" },
  { icon: HelpCircle, label: "Help & support" },
  { icon: FileText, label: "Terms & privacy" },
];

export default function ClientProfile() {
  return (
    <div className="mx-auto w-full max-w-[1160px]">
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">Account</div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink-900">Profile &amp; settings</h1>
      </div>

      <div className="grid max-w-[960px] grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* LEFT */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[24px] border border-white/90 bg-white/[0.88] p-6 shadow-[0_14px_30px_-12px_rgba(120,80,160,0.22)]">
            <div className="flex items-center gap-4">
              <div className="size-[76px] flex-none rounded-full bg-[url('/makeup.jpg')] bg-cover bg-center" />
              <div className="flex-1">
                <div className="font-display text-[26px] font-semibold leading-none text-ink-900">Reeva K.</div>
                <div className="mt-1.5 text-[12.5px] text-ink-500">reeva.k@email.com</div>
                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-[10px] bg-purple-500/10 px-2.5 py-1">
                  <span className="size-1.5 rounded-full bg-ink-400" />
                  <span className="text-[11px] font-bold text-purple-600">Free plan</span>
                </div>
              </div>
              <button className="h-[38px] rounded-[19px] border border-purple-600/15 bg-white px-4 text-[12.5px] font-semibold text-ink-700">Edit</button>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/90 bg-white/[0.88] p-6 shadow-[0_14px_30px_-12px_rgba(120,80,160,0.22)]">
            <div className="mb-4 flex items-baseline justify-between">
              <div className="font-display text-xl font-semibold text-ink-900">Your beauty profile</div>
              <span className="cursor-pointer text-[12.5px] font-semibold text-purple-500">Edit</span>
            </div>
            <div className="flex items-center justify-between border-b border-purple-600/[0.07] pb-3">
              <span className="text-[13px] text-ink-500">Skin type</span>
              <span className="text-[13.5px] font-bold text-ink-900">Combination</span>
            </div>
            <div className="flex items-center justify-between border-b border-purple-600/[0.07] py-3">
              <span className="text-[13px] text-ink-500">Budget</span>
              <span className="text-[13.5px] font-bold text-ink-900">Mid-range</span>
            </div>
            <div className="pt-3">
              <div className="mb-2.5 text-[13px] text-ink-500">Concerns &amp; goals</div>
              <div className="flex flex-wrap gap-2">
                {["Acne", "Texture", "Clear, calm skin", "Budget-friendly"].map((t) => (
                  <span key={t} className="rounded-[13px] bg-purple-500/[0.09] px-3 py-1.5 text-xs font-semibold text-purple-600">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">
          <div className="bg-primary-gradient relative overflow-hidden rounded-[24px] p-6 shadow-[0_16px_34px_-12px_rgba(109,74,160,0.34)]">
            <div className="pointer-events-none absolute -right-5 -top-8 size-[150px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_70%)]" />
            <div className="relative z-10">
              <div className="font-display mb-1.5 text-[22px] text-white">Unlock Dew Premium</div>
              <div className="mb-4 text-[12.5px] leading-relaxed text-white/85">
                Message experts anytime, save 15% on consults, and unlock unlimited tools.
              </div>
              <button className="h-[42px] rounded-[21px] bg-white px-5 text-[13.5px] font-bold text-purple-600">Upgrade — from $10/wk</button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white/90 bg-white/[0.88] shadow-[0_14px_30px_-12px_rgba(120,80,160,0.2)]">
            {SETTINGS.map(({ icon: Icon, label, meta }, i) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3.5 px-[18px] py-[17px] text-left transition hover:bg-purple-500/[0.04] ${i < SETTINGS.length - 1 ? "border-b border-purple-600/[0.05]" : ""}`}
              >
                <Icon className="size-5 text-purple-500" strokeWidth={1.7} />
                <span className="flex-1 text-sm font-semibold text-ink-900">{label}</span>
                {meta && <span className="text-xs text-ink-400">{meta}</span>}
                <ChevronRight className="size-4 text-ink-400/70" />
              </button>
            ))}
          </div>

          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
