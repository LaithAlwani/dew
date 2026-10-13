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

// --- Client discovery (step 3) ---

export const SERVICE_CATEGORIES = ["makeup", "skincare", "lesson"] as const;
export const MAKEUP_OCCASIONS = ["bridal", "event", "everyday", "editorial"] as const;
export const TIMING_OPTIONS = ["within_2_weeks", "this_month", "flexible"] as const;
export const BUDGET_BANDS = ["under_100", "100_250", "250_500", "500_plus", "unsure"] as const;
export const SAFETY_FLAGS = ["sensitive_skin", "allergies", "pregnancy", "none"] as const;

// All fields optional: the questionnaire saves progressively as the client
// answers, so a partial session is valid. Completeness is a separate check.
export const discoveryAnswersSchema = z
  .object({
    category: z.enum(SERVICE_CATEGORIES),
    occasion: z.enum(MAKEUP_OCCASIONS),
    timing: z.enum(TIMING_OPTIONS),
    budget: z.enum(BUDGET_BANDS),
    city: z.string().trim().max(80),
    safetyFlags: z.array(z.enum(SAFETY_FLAGS)),
    notes: z.string().trim().max(1000),
  })
  .partial();

export type DiscoveryAnswers = z.infer<typeof discoveryAnswersSchema>;

// Enough answered to hand off to matching: category always, occasion when it's
// makeup, plus timing and city.
export function isDiscoveryComplete(a: DiscoveryAnswers): boolean {
  if (!a.category) {
    return false;
  }
  if (a.category === "makeup" && !a.occasion) {
    return false;
  }
  return Boolean(a.timing && a.city);
}
