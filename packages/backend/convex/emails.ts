"use node";

import { v } from "convex/values";
import nodemailer from "nodemailer";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

type Appt = Doc<"appointments">;

/** Epoch ms → Google Calendar UTC basic format (YYYYMMDDTHHMMSSZ). */
function calFmt(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** A pre-filled "Add to Google Calendar" URL for the consult. */
function calendarUrl(a: Appt): string {
  const start = calFmt(a.scheduledAt);
  const end = calFmt(a.scheduledAt + a.durationMin * 60000);
  const details = [
    `Your Dew consultation with ${a.expertName}.`,
    a.meetLink ? `Join: ${a.meetLink}` : "A video link will be shared before your consult.",
    a.note ? `Notes: ${a.note}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Dew · ${a.serviceName} with ${a.expertName}`,
    dates: `${start}/${end}`,
    details,
    location: a.meetLink ?? "Video call",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function transporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

const shell = (heading: string, body: string) => `
  <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#F1EAFB;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 14px 30px -12px rgba(120,80,160,.24)">
      <div style="background:linear-gradient(135deg,#6D4AA0,#8657C8);padding:22px 28px;color:#fff;font-size:22px;font-weight:700">Dew</div>
      <div style="padding:28px">
        <h1 style="margin:0 0 12px;font-size:20px;color:#2E2440">${heading}</h1>
        ${body}
      </div>
    </div>
  </div>`;

const detailRows = (a: Appt, when: string) => `
  <table style="width:100%;border-collapse:collapse;font-size:14px;color:#4A3A6B;margin:8px 0 4px">
    <tr><td style="padding:6px 0;color:#8A7DA0">Expert</td><td style="padding:6px 0;text-align:right;font-weight:600">${a.expertName}</td></tr>
    <tr><td style="padding:6px 0;color:#8A7DA0">Service</td><td style="padding:6px 0;text-align:right;font-weight:600">${a.serviceName}</td></tr>
    <tr><td style="padding:6px 0;color:#8A7DA0">When</td><td style="padding:6px 0;text-align:right;font-weight:600">${when}</td></tr>
    <tr><td style="padding:6px 0;color:#8A7DA0">Duration</td><td style="padding:6px 0;text-align:right;font-weight:600">${a.durationMin} min · video</td></tr>
  </table>`;

const calButton = (url: string) =>
  `<a href="${url}" style="display:inline-block;margin-top:16px;background:#6D4AA0;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:22px">Add to Google Calendar</a>`;

const meetLine = (a: Appt) =>
  a.meetLink
    ? `<p style="font-size:14px;color:#4A3A6B">Video link: <a href="${a.meetLink}" style="color:#7B52C4;font-weight:600">${a.meetLink}</a></p>`
    : `<p style="font-size:13px;color:#8A7DA0">Your video link will be added to this booking before the consult.</p>`;

export const sendBookingEmails = internalAction({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, { appointmentId }) => {
    const a = await ctx.runQuery(internal.appointments.byId, { id: appointmentId });
    if (!a) return null;

    const tx = transporter();
    if (!tx) {
      console.log("[dew emails] SMTP not configured (SMTP_HOST unset) — skipping booking emails.");
      return null;
    }

    const from = process.env.MAIL_FROM ?? "Dew <no-reply@dewbeautyapp.com>";
    const when = new Date(a.scheduledAt).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });
    const cal = calendarUrl(a);
    const paidLine =
      a.paymentStatus === "free"
        ? `<p style="font-size:14px;color:#4FB477;font-weight:700">Free consult — no charge.</p>`
        : `<p style="font-size:14px;color:#4FB477;font-weight:700">Paid: $${(a.amountCents / 100).toFixed(2)} ✓</p>`;

    if (a.clientEmail) {
      await tx.sendMail({
        from,
        to: a.clientEmail,
        subject: `Appointment confirmation — ${a.serviceName} with ${a.expertName}`,
        html: shell(
          "Your appointment is confirmed",
          `<p style="font-size:14px;color:#4A3A6B">Thanks for booking! Here are the details:</p>
           ${detailRows(a, when)}${paidLine}${meetLine(a)}${calButton(cal)}`,
        ),
      });
    }

    if (a.expertEmail) {
      await tx.sendMail({
        from,
        to: a.expertEmail,
        subject: `New consultation booked${a.clientName ? ` with ${a.clientName}` : ""}`,
        html: shell(
          "New booking on Dew",
          `<p style="font-size:14px;color:#4A3A6B">${a.clientName ?? "A client"} just booked a consultation with you.</p>
           ${detailRows(a, when)}${meetLine(a)}${calButton(cal)}`,
        ),
      });
    }

    return null;
  },
});
