"use client";

import * as React from "react";
import Image from "next/image";

/**
 * Dew-styled auth building blocks, shared by the custom sign-in / sign-up pages.
 * Faithful port of the Claude Design screens "Dew Login" / "Dew Sign Up" (mobile
 * + desktop): a borderless lavender gradient page on mobile, and a two-panel
 * brand + form layout on desktop (≥867px). Cormorant headings, purple gradient.
 */

const BP = "min-[867px]"; // desktop breakpoint, matching the get-started story

type Copy = { title: string; subtitle: React.ReactNode };

/**
 * Responsive auth shell.
 * - Desktop (≥867px): left purple brand panel (portrait + brand copy) + right form column.
 * - Mobile: single centered column with the logo lockup on the lavender wash.
 * `mobile`/`desktop` carry the form-panel heading copy (they differ per the design).
 */
export function AuthLayout({
  brand,
  mobile,
  desktop,
  children,
}: {
  brand: Copy;
  mobile: Copy;
  desktop: Copy;
  children: React.ReactNode;
}) {
  return (
    <main className={`flex min-h-dvh ${BP}:items-stretch`}>
      <style>{`@keyframes dwGlowAuth{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.8;transform:scale(1.08)}}`}</style>

      {/* LEFT BRAND PANEL — desktop only */}
      <aside
        className={`relative hidden w-[46%] max-w-[600px] flex-none flex-col overflow-hidden px-12 py-13 text-white ${BP}:flex`}
        style={{ background: "linear-gradient(160deg,#6D4AA0,#8657C8 60%,#A85EB8)" }}
      >
        <div
          className="pointer-events-none absolute -left-16 -top-20 size-80 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,.18),transparent 70%)", animation: "dwGlowAuth 9s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -right-10 size-[340px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(255,214,236,.2),transparent 70%)", animation: "dwGlowAuth 11s ease-in-out infinite 1s" }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <Image src="/logo.webp" alt="" width={56} height={32} className="h-8 w-auto brightness-0 invert" />
          <span className="font-display text-[26px] font-semibold tracking-wide">Dew</span>
        </div>
        <div className="relative z-10 flex flex-1 items-center justify-center py-8">
          <div
            className="h-[380px] w-[300px] flex-none rounded-[150px] bg-[url('/makeup.jpg')] bg-cover bg-center"
            style={{ boxShadow: "0 30px 60px rgba(60,30,90,.34)" }}
          />
        </div>
        <div className="relative z-10">
          <h1 className="m-0 font-display text-[34px] font-medium leading-[1.15]">{brand.title}</h1>
          <p className="mt-3.5 text-[14.5px] leading-relaxed text-white/85">{brand.subtitle}</p>
        </div>
      </aside>

      {/* FORM COLUMN */}
      <div className={`flex flex-1 flex-col items-center overflow-y-auto px-6 py-10 ${BP}:justify-center ${BP}:px-10`}>
        <div className="w-full max-w-[400px]">
          {/* Mobile header — logo lockup + centered copy */}
          <div className={`${BP}:hidden`}>
            <div className="mb-6 flex justify-center">
              <Image src="/logo.webp" alt="Dew" width={120} height={60} priority className="h-[60px] w-auto" />
            </div>
            <h1 className="m-0 text-center font-display text-[29px] font-medium leading-tight text-ink-900">{mobile.title}</h1>
            <p className="mx-auto mb-7 mt-1.5 text-center text-[13.5px] text-[#8A7DA0]">{mobile.subtitle}</p>
          </div>

          {/* Desktop header — left aligned */}
          <div className={`hidden ${BP}:block`}>
            <h2 className="m-0 font-display text-[34px] font-medium leading-tight text-ink-900">{desktop.title}</h2>
            <p className="mb-7 mt-2 text-[14px] text-[#8A7DA0]">{desktop.subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </main>
  );
}

/** Apple + Google SSO. Stacked full-label on mobile, side-by-side short-label on desktop. */
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
        className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[27px] bg-[#1A1626] text-[14.5px] font-semibold text-white transition disabled:opacity-60"
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
        className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[27px] border border-[rgba(90,60,130,0.16)] bg-white text-[14.5px] font-semibold text-ink-700 transition disabled:opacity-60"
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

/** Client / expert segmented control, per the sign-up design. */
export function RoleToggle({
  role,
  onChange,
}: {
  role: "client" | "expert";
  onChange: (r: "client" | "expert") => void;
}) {
  return (
    <div className="mb-5 flex gap-[7px] rounded-2xl bg-purple-500/[0.08] p-[5px]">
      {(["client", "expert"] as const).map((r) => {
        const active = role === r;
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className="h-11 flex-1 rounded-xl text-[12.5px] font-semibold transition"
            style={{
              background: active ? "#ffffff" : "transparent",
              color: active ? "#4A3A6B" : "#8A7DA0",
              boxShadow: active ? "0 4px 12px rgba(90,60,130,.14)" : "none",
            }}
          >
            {r === "client" ? "I'm here for beauty help" : "I'm joining as an expert"}
          </button>
        );
      })}
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
      className={`bg-primary-gradient mt-6 flex h-[54px] w-full items-center justify-center rounded-[27px] text-[15.5px] font-bold text-white shadow-glow transition disabled:opacity-70 ${className ?? ""}`}
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
  href,
}: {
  prompt: string;
  actionLabel: string;
  href: string;
}) {
  return (
    <p className="mt-[22px] text-center text-[13px] text-[#8A7DA0]">
      {prompt}{" "}
      <a href={href} className="font-bold text-purple-500">
        {actionLabel}
      </a>
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
