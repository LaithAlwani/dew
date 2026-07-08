"use client";

import * as React from "react";
import Image from "next/image";

/**
 * Dew-styled auth building blocks for the custom sign-in / sign-up pages.
 * The entry "chooser" sheet itself lives in @dew/ui (<AuthChooser>) so it stays
 * identical to the get-started CTA. These helpers render the centered sheet
 * shell + the email/password form that the app reveals after "Continue with email".
 */

const BP = "min-[867px]"; // desktop breakpoint, matching the get-started story

/**
 * Auth shell shared by sign-in AND sign-up, matching the get-started marketing look:
 * - Desktop (≥867px): a left photo brand panel (makeup.jpg + purple tint + logo) and
 *   the content on the right.
 * - Mobile: the same photo as the full-screen background, content in a frosted card.
 * Renders a logo + heading only when `title` is set (the chooser brings its own).
 */
export function AuthCard({
  title,
  subtitle,
  onBack,
  children,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh">
      <style>{`@keyframes dwGlowAuth{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.82;transform:scale(1.08)}}`}</style>

      {/* LEFT brand panel — desktop only (photo + purple tint), like get-started */}
      <aside className={`relative hidden w-[44%] max-w-[620px] flex-none overflow-hidden bg-[url('/makeup.jpg')] bg-cover bg-center ${BP}:block`}>
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(160deg,#6D4AA0,#8657C8 60%,#A85EB8)", opacity: 0.5 }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(30,20,45,.12),rgba(30,20,45,.55))" }} />
        <div className="pointer-events-none absolute -left-16 -top-20 size-80 rounded-full blur-2xl" style={{ background: "radial-gradient(circle,rgba(158,120,224,.5),transparent 68%)", animation: "dwGlowAuth 9s ease-in-out infinite" }} />
        <div className="pointer-events-none absolute -bottom-16 -right-10 size-[340px] rounded-full blur-2xl" style={{ background: "radial-gradient(circle,rgba(226,140,200,.42),transparent 68%)", animation: "dwGlowAuth 11s ease-in-out infinite 1s" }} />
        <div className="absolute left-[52px] top-12 z-10 flex items-center gap-2.5">
          <Image src="/logo.webp" alt="Dew" width={56} height={32} className="h-8 w-auto brightness-0 invert" />
          <span className="font-display text-[26px] font-semibold tracking-wide text-white">Dew</span>
        </div>
        <div className="absolute inset-x-[52px] bottom-14 z-10 text-white">
          <h2 className="m-0 font-display text-[38px] font-medium leading-[1.1]">Beauty guidance that actually fits you.</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/85">Matched to your real goals, budget, and routine.</p>
        </div>
      </aside>

      {/* MAIN — mobile shows the photo as background; desktop is the lavender wash */}
      <div className="relative flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
        <div className={`pointer-events-none absolute inset-0 bg-[url('/makeup.jpg')] bg-cover bg-center ${BP}:hidden`} />
        {/* light wash so form text stays readable directly over the photo (no card) */}
        <div className={`pointer-events-none absolute inset-0 ${BP}:hidden`} style={{ background: "linear-gradient(180deg,rgba(248,244,254,.72),rgba(251,249,254,.9))" }} />

        <div className="relative z-10 w-full max-w-[420px]">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-500 transition hover:text-ink-900"
            >
              <svg width="8" height="14" viewBox="0 0 9 16" fill="none">
                <path d="M8 1L1.5 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="underline underline-offset-4">Back</span>
            </button>
          )}
          {title && (
            <div className="mb-6">
              <div className="mb-2.5 flex justify-center">
                <Image src="/logo.webp" alt="Dew" width={78} height={40} priority className="h-10 w-auto" />
              </div>
              <h1 className="text-center font-display text-[26px] font-semibold leading-tight text-ink-900">{title}</h1>
              {subtitle && <p className="mt-1 text-center text-[12.5px] text-[#8A7DA0]">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </main>
  );
}

/** Apple + Google SSO, stacked full-width to match the primary button. */
export function OAuthButtons({
  onProvider,
  disabled,
  busyProvider,
}: {
  onProvider: (strategy: "oauth_apple" | "oauth_google") => void;
  disabled?: boolean;
  busyProvider?: "oauth_apple" | "oauth_google" | null;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => onProvider("oauth_apple")}
        disabled={disabled}
        className="flex h-[50px] w-full items-center justify-center gap-[9px] rounded-[25px]bg-[#1A1626] text-[14.5px] font-semibold text-white transition disabled:opacity-60"
      >
        <svg width="15" height="18" viewBox="0 0 15 18" fill="#fff">
          <path d="M12.6 9.6c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7C4.5 5 3.3 5.7 2.6 6.9c-1.4 2.4-.4 6 1 8 .7.9 1.4 2 2.5 2 1 0 1.4-.6 2.6-.6s1.6.6 2.6.6c1.1 0 1.8-1 2.4-1.9.8-1.1 1.1-2.1 1.1-2.2 0 0-2.1-.8-2.2-3.2zM10.7 3.9c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.2-.5.6-1 1.5-.9 2.4.9.1 1.9-.4 2.5-1z" />
        </svg>
        {busyProvider === "oauth_apple" ? "Connecting…" : "Continue with Apple"}
      </button>
      <button
        type="button"
        onClick={() => onProvider("oauth_google")}
        disabled={disabled}
        className="flex h-[50px] w-full items-center justify-center gap-[9px] rounded-[25px]border border-[rgba(90,60,130,0.16)] bg-white text-[14.5px] font-semibold text-ink-700 transition disabled:opacity-60"
      >
        <svg width="17" height="17" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z" />
          <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3z" />
          <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" />
        </svg>
        {busyProvider === "oauth_google" ? "Connecting…" : "Continue with Google"}
      </button>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-[rgba(90,60,130,0.12)]" />
      <span className="text-[12px] text-[#A99CBC]">or</span>
      <span className="h-px flex-1 bg-[rgba(90,60,130,0.12)]" />
    </div>
  );
}

export function Field({
  label,
  aside,
  ...props
}: {
  label: string;
  aside?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = React.useId();
  return (
    <div>
      <div className="mb-[7px] flex items-center justify-between">
        <label htmlFor={id} className="text-[12.5px] font-semibold text-[#5A4E70]">
          {label}
        </label>
        {aside}
      </div>
      <input
        id={id}
        className="box-border w-full rounded-[14px] border border-[rgba(90,60,130,0.12)] bg-white/90 px-[15px] py-3.5 text-[14px] text-ink-900 outline-none transition placeholder:text-[#B0A4C2] focus:border-purple-500"
        {...props}
      />
    </div>
  );
}

export function SubmitButton({
  children,
  loading,
  className,
  ...props
}: { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className={`bg-primary-gradient mt-5 flex h-[50px] w-full items-center justify-center rounded-[25px] text-[14.5px] font-semibold text-white shadow-[0_10px_22px_rgba(109,74,160,0.3)] transition disabled:opacity-70 ${className ?? ""}`}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="mb-3 rounded-xl bg-error/10 px-3.5 py-2.5 text-[12.5px] font-medium text-error">
      {children}
    </p>
  );
}

export function FooterSwitch({
  prompt,
  actionLabel,
  onAction,
}: {
  prompt: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <p className="mt-[18px] text-center text-[12.5px] text-[#8A7DA0]">
      {prompt}{" "}
      <button type="button" onClick={onAction} className="font-semibold text-purple-500">
        {actionLabel}
      </button>
    </p>
  );
}

export function LegalNote() {
  return (
    <p className="mt-4 text-center text-[11.5px] leading-relaxed text-[#A99CBC]">
      By continuing, you agree to Dew&apos;s Terms &amp; Privacy Policy.
    </p>
  );
}

/** Turn a Clerk error (Future-API `ClerkError`, or legacy shape) into a human string. */
export function clerkErrorMessage(err: unknown): string {
  const e = err as {
    longMessage?: string;
    message?: string;
    errors?: Array<{ longMessage?: string; message?: string }>;
  } | null;
  return (
    e?.longMessage ??
    e?.errors?.[0]?.longMessage ??
    e?.errors?.[0]?.message ??
    e?.message ??
    "Something went wrong. Please try again."
  );
}
