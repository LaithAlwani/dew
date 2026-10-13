// Delivery channels behind one interface. Email is wired to a provider (Resend)
// but only sends when a key is configured; without one it reports
// "not_configured" so the notification stays pending and retries. Web push and
// native are stubbed behind the same shape — adding them changes nothing else.

export type NotificationChannel = "email" | "web_push" | "native";

export interface SendResult {
  ok: boolean;
  reason?: string;
}

// Minimal template skeleton (subject + text). Swap for react-email rendering
// when email delivery is switched on. Unknown keys fall back to a generic body.
export function renderTemplate(
  templateKey: string,
  _payload: Record<string, unknown>,
): { subject: string; text: string } {
  const subjects: Record<string, string> = {
    preview_reminder: "A client preview is waiting",
    contact_reminder: "Reach out to your unlocked client",
    client_reminder: "Your professional is waiting to hear back",
  };
  return {
    subject: subjects[templateKey] ?? "An update from Dew",
    text: `[${templateKey}] — open Dew to see the details.`,
  };
}

async function sendEmail(
  to: string,
  templateKey: string,
  payload: Record<string, unknown>,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) {
    return { ok: false, reason: "not_configured" };
  }
  const { subject, text } = renderTemplate(templateKey, payload);
  const from = process.env.EMAIL_FROM ?? "Dew <hello@dew.local>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });
  return res.ok ? { ok: true } : { ok: false, reason: `resend_${res.status}` };
}

export async function sendViaChannel(
  channel: NotificationChannel,
  to: string,
  templateKey: string,
  payload: Record<string, unknown>,
): Promise<SendResult> {
  switch (channel) {
    case "email":
      return await sendEmail(to, templateKey, payload);
    default:
      // web_push / native land here until wired; leaves the row pending.
      return { ok: false, reason: "channel_not_implemented" };
  }
}
