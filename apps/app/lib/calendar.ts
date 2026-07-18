/** Epoch ms → Google Calendar UTC basic format (YYYYMMDDTHHMMSSZ). */
function calFmt(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

type CalAppt = {
  serviceName: string;
  expertName: string;
  scheduledAt: number;
  durationMin: number;
  note?: string;
  meetLink?: string;
};

/** Pre-filled "Add to Google Calendar" URL for a consult. */
export function googleCalendarUrl(a: CalAppt): string {
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
