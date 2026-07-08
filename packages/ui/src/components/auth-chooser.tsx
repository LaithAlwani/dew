"use client";

import * as React from "react";

/**
 * The Dew auth "chooser" sheet — the single source of truth for the entry screen
 * used by the get-started CTA (apps/web) AND the app's sign-up / sign-in landings.
 * Presentational only: actions are props, so web wires redirects and app wires Clerk.
 *
 * Sign-up passes `role`/`onRole` (shows the client/expert toggle); sign-in passes
 * `showRole={false}`. It never renders the email/password inputs — those belong to
 * the app, revealed after "Continue with email".
 */

const PRIMARY = "linear-gradient(135deg,#6D4AA0,#8657C8)";
const FONT = "var(--font-sans)";

export type AuthChooserProps = {
  onApple: () => void;
  onGoogle: () => void;
  onEmail: () => void;
  onFooter: () => void;
  title?: string;
  subtitle?: React.ReactNode;
  footerPrompt?: string;
  footerAction?: string;
  role?: "client" | "expert";
  onRole?: (r: "client" | "expert") => void;
  /** Show the client/expert toggle (sign-up). Defaults to true. */
  showRole?: boolean;
  /** Shows a "Connecting…" state on the matching social button. */
  busy?: "apple" | "google" | null;
  logoSrc?: string;
};

export function AuthChooser({
  onApple,
  onGoogle,
  onEmail,
  onFooter,
  title = "Let's make beauty feel easier.",
  subtitle,
  footerPrompt = "Already have an account?",
  footerAction = "Log in",
  role = "client",
  onRole,
  showRole = true,
  busy = null,
  logoSrc = "/logo.webp",
}: AuthChooserProps) {
  const resolvedSubtitle =
    subtitle ??
    (role === "expert"
      ? "Set up your expert profile to start guiding clients."
      : "Create your account to meet your matches.");

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        {/* plain <img> keeps this component framework-agnostic (no next/image) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="Dew" width={78} height={40} style={{ height: 40, width: "auto" }} />
      </div>
      <div style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, color: "#2E2440", marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ textAlign: "center", fontSize: 12.5, color: "#8A7DA0", marginBottom: 20 }}>
        {resolvedSubtitle}
      </div>

      {showRole && onRole && (
        <div style={{ display: "flex", gap: 7, background: "rgba(123,82,196,.08)", padding: 5, borderRadius: 16, marginBottom: 20 }}>
          {(["client", "expert"] as const).map((r) => (
            <button
              key={r}
              onClick={() => onRole(r)}
              style={{ flex: 1, height: 44, border: "none", borderRadius: 12, cursor: "pointer", fontFamily: FONT, fontSize: 12.5, fontWeight: 600, background: role === r ? "#ffffff" : "transparent", color: role === r ? "#4A3A6B" : "#8A7DA0", boxShadow: role === r ? "0 4px 12px rgba(90,60,130,.14)" : "none", transition: "all .2s" }}
            >
              {r === "client" ? "I'm here for beauty help" : "I'm joining as an expert"}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={onApple} style={{ width: "100%", height: 50, border: "none", borderRadius: 25, cursor: "pointer", fontFamily: FONT, fontSize: 14.5, fontWeight: 600, color: "#fff", background: "#1A1626", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
          <svg width="15" height="18" viewBox="0 0 15 18" fill="#fff"><path d="M12.6 9.6c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7C4.5 5 3.3 5.7 2.6 6.9c-1.4 2.4-.4 6 1 8 .7.9 1.4 2 2.5 2 1 0 1.4-.6 2.6-.6s1.6.6 2.6.6c1.1 0 1.8-1 2.4-1.9.8-1.1 1.1-2.1 1.1-2.2 0 0-2.1-.8-2.2-3.2zM10.7 3.9c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.2-.5.6-1 1.5-.9 2.4.9.1 1.9-.4 2.5-1z" /></svg>
          {busy === "apple" ? "Connecting…" : "Continue with Apple"}
        </button>
        <button onClick={onGoogle} style={{ width: "100%", height: 50, border: "1px solid rgba(90,60,130,.16)", borderRadius: 25, cursor: "pointer", fontFamily: FONT, fontSize: 14.5, fontWeight: 600, color: "#3A2E52", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
          <svg width="17" height="17" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z" /><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z" /><path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3z" /><path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" /></svg>
          {busy === "google" ? "Connecting…" : "Continue with Google"}
        </button>
        <button onClick={onEmail} style={{ width: "100%", height: 50, border: "none", borderRadius: 25, cursor: "pointer", fontFamily: FONT, fontSize: 14.5, fontWeight: 600, color: "#fff", background: PRIMARY, boxShadow: "0 10px 22px rgba(109,74,160,.3)" }}>
          Continue with email
        </button>
      </div>

      <div style={{ textAlign: "center", fontSize: 12.5, color: "#8A7DA0", marginTop: 18 }}>
        {footerPrompt}{" "}
        <button onClick={onFooter} style={{ border: "none", background: "none", cursor: "pointer", color: "#7B52C4", fontWeight: 600, fontSize: 12.5, fontFamily: FONT }}>{footerAction}</button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, fontSize: 11, color: "#A99CBC" }}>
        <span>Privacy</span><span>Terms</span><span>Support</span>
      </div>
    </>
  );
}
