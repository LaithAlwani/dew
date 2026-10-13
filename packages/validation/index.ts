// @dew/validation — Zod schemas shared by client and server. Validate once,
// infer the type from the same definition (used by the pro profile form and by
// the Convex updateProfile mutation).
import { z } from "zod";

// The makeup/beauty services a professional can offer. Refined as the taxonomy
// settles; kept here so the form and the server agree on the allowed set.
export const SERVICE_KEYS = [
  "bridal_makeup",
  "event_makeup",
  "everyday_makeup",
  "editorial_makeup",
  "special_effects",
  "makeup_lesson",
  "skincare_consult",
] as const;

export const serviceKeySchema = z.enum(SERVICE_KEYS);
export type ServiceKey = z.infer<typeof serviceKeySchema>;

// A professional's working window (drives the quiet-hours deadline math).
export const businessHoursSchema = z
  .object({
    timezone: z.string().min(1),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(0).max(1439),
  })
  .refine((bh) => bh.startMinute < bh.endMinute, {
    message: "The working window must start before it ends.",
    path: ["endMinute"],
  });

export type BusinessHoursInput = z.infer<typeof businessHoursSchema>;

export const professionalProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(600).optional(),
  services: z.array(serviceKeySchema).min(1).max(SERVICE_KEYS.length),
  businessHours: businessHoursSchema,
  bookingLink: z.string().url().max(300).optional(),
  capacity: z.number().int().min(1).max(20),
});

export type ProfessionalProfileInput = z.infer<typeof professionalProfileSchema>;
