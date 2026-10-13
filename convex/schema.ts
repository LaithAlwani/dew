import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Dew's data model. The Better Auth component keeps its own auth tables
// separately; `users` below is Dew's row, keyed to the auth user by subject.
//
// Matching model (locked): a consultation is broadcast to N ranked
// professionals as previews; ANY professional can unlock independently. Each
// unlock spends its own credit and spawns its own conversation. An
// `introduction` is therefore one (consultation, professional) pair, and a
// client may have several unlocked concurrently — no lock, uncapped.

// ---- Shared validators ----

export const roleValidator = v.union(
  v.literal("client"),
  v.literal("professional"),
  v.literal("admin"),
);

// Invite-only supply gate: a professional receives previews only when approved.
export const approvalStateValidator = v.union(
  v.literal("invited"),
  v.literal("pending_review"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("paused"), // auto-paused after reliability events, pending review
);

// Introduction finite state machine. `transitionIntroduction` (Phase 4) is the
// sole writer of this field and the only creator/canceller of deadlines.
export const introductionStatusValidator = v.union(
  v.literal("previewed"), // preview delivered, awaiting professional action
  v.literal("unlocked"), // credit spent; contact deadline being set
  v.literal("contact_pending"), // awaiting the professional's first message
  v.literal("contact_made"), // professional messaged; exchange clock running
  v.literal("client_unresponsive"), // client ghosted past threshold
  v.literal("connected_off_platform"), // professional marked connected outside Dew
  v.literal("declined"), // professional declined the preview
  v.literal("expired_no_unlock"), // preview expired without a decision
  v.literal("expired_no_contact"), // unlocked but professional never made contact
);

export const deadlineKindValidator = v.union(
  v.literal("preview_reminder"), // 12h
  v.literal("preview_expiry"), // 24h
  v.literal("contact_reminder"), // 12h after unlock
  v.literal("contact_deadline"), // 24h after unlock
  v.literal("client_reminder"), // 24h after first professional message
  v.literal("client_ghost"), // 72h after first professional message
  v.literal("lifecycle_cap"), // 10 days, force-close
);

export const deadlineStateValidator = v.union(
  v.literal("pending"),
  v.literal("fired"),
  v.literal("cancelled"),
);

export const channelValidator = v.union(
  v.literal("email"),
  v.literal("web_push"),
  v.literal("native"),
);

export const deliveryStateValidator = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed"),
);

// Credit ledger is append-only; balanceAfter makes each row self-describing.
export const creditReasonValidator = v.union(
  v.literal("free_grant"), // initial free credits
  v.literal("purchase"), // Stripe top-up
  v.literal("unlock_spend"), // -1 on unlock
  v.literal("restoration"), // +1, narrow reason-coded exception (not a refund)
  v.literal("adjustment"), // admin manual correction
);

export const moderationStateValidator = v.union(
  v.literal("visible"),
  v.literal("reported"),
  v.literal("hidden"),
);

// IANA timezone + the professional's working window; drives quiet-hours math.
const businessHoursValidator = v.object({
  timezone: v.string(),
  // Minutes from local midnight; quiet hours are outside [startMinute, endMinute].
  startMinute: v.number(),
  endMinute: v.number(),
});

export default defineSchema({
  users: defineTable({
    authUserId: v.string(), // Better Auth component user id (JWT subject)
    role: roleValidator,
    timezone: v.optional(v.string()),
    // Notification channel preferences resolved by the notify layer (Phase 5).
    notificationPrefs: v.optional(
      v.object({
        email: v.boolean(),
        webPush: v.boolean(),
      }),
    ),
    // Set when the client exercises erasure; PII is cascade-wiped (Phase 5).
    erasedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_authUserId", ["authUserId"]),

  // The anonymous discovery session; losslessly attached on signup.
  discoverySessions: defineTable({
    anonymousId: v.string(),
    userId: v.optional(v.id("users")),
    // ponytail: placeholder until step 3 replaces with the Zod-derived shape.
    answers: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_anonymousId", ["anonymousId"])
    .index("by_userId", ["userId"]),

  professionals: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    bio: v.optional(v.string()),
    services: v.array(v.string()), // service keys; refined in step 2
    // Fit rules (eligibility gates queried by matching); typed in step 5.
    fitRules: v.optional(v.any()),
    capacity: v.number(), // concurrent active introductions allowed
    bookingLink: v.optional(v.string()),
    approvalState: approvalStateValidator,
    businessHours: businessHoursValidator,
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_approvalState", ["approvalState"]),

  consultations: defineTable({
    clientId: v.id("users"),
    version: v.number(),
    // --- Preview-visible (carried into the professional preview) ---
    safetyFlags: v.array(v.string()),
    serviceHistory: v.optional(v.string()),
    // Structured discovery/category answers; typed in step 3/6.
    categoryAnswers: v.any(),
    // --- Unlock-only (withheld until a professional unlocks) ---
    notes: v.optional(v.string()), // free-text
    contactDetails: v.optional(v.string()),
    facePhotoStorageIds: v.array(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_clientId", ["clientId"]),

  // The broadcast candidate set: which professionals a consultation reached.
  matches: defineTable({
    consultationId: v.id("consultations"),
    rankedProfessionalIds: v.array(v.id("professionals")),
    createdAt: v.number(),
  }).index("by_consultationId", ["consultationId"]),

  // One per (consultation, professional) pair. Many may be unlocked at once.
  introductions: defineTable({
    matchId: v.id("matches"),
    consultationId: v.id("consultations"),
    professionalId: v.id("professionals"),
    status: introductionStatusValidator,
    unlockedAt: v.optional(v.number()),
    creditTxnId: v.optional(v.id("creditLedger")),
    // Reason-coded; feeds matching only, never shown to the next professional.
    declineReason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_professional_status", ["professionalId", "status"])
    .index("by_consultationId", ["consultationId"])
    .index("by_matchId", ["matchId"]),

  conversations: defineTable({
    introductionId: v.id("introductions"),
    clientId: v.id("users"),
    professionalId: v.id("professionals"),
    firstProMessageAt: v.optional(v.number()),
    firstClientReplyAt: v.optional(v.number()), // genuine exchange marker
    closedAt: v.optional(v.number()),
    closureReason: v.optional(v.string()),
  }).index("by_introductionId", ["introductionId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),
    moderationState: moderationStateValidator,
    sentAt: v.number(),
  }).index("by_conversationId", ["conversationId"]),

  // Deadlines are rows, not scheduled jobs. Swept every 5 min for due+pending.
  deadlines: defineTable({
    kind: deadlineKindValidator,
    introductionId: v.id("introductions"),
    dueAt: v.number(),
    state: deadlineStateValidator,
    createdAt: v.number(),
    firedAt: v.optional(v.number()),
  })
    .index("by_state_dueAt", ["state", "dueAt"])
    .index("by_introductionId", ["introductionId"]),

  notifications: defineTable({
    recipientId: v.id("users"),
    templateKey: v.string(),
    introductionId: v.optional(v.id("introductions")),
    channel: channelValidator,
    // Unique per (introductionId, templateKey, channel) — dedupes overlapping sweeps.
    uniqueKey: v.string(),
    deliveryState: deliveryStateValidator,
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_uniqueKey", ["uniqueKey"])
    .index("by_recipientId", ["recipientId"])
    .index("by_deliveryState", ["deliveryState", "createdAt"]),

  reliabilityEvents: defineTable({
    professionalId: v.id("professionals"),
    type: v.string(), // e.g. "no_contact"; two in 90 days auto-pause
    introductionId: v.optional(v.id("introductions")),
    occurredAt: v.number(),
    resolvedAt: v.optional(v.number()),
  }).index("by_professionalId", ["professionalId"]),

  // Every disclosure recorded separately: version, recipient, timestamp.
  disclosureRecords: defineTable({
    consultationId: v.id("consultations"),
    version: v.number(),
    recipientProfessionalId: v.id("professionals"),
    disclosedAt: v.number(),
  }).index("by_consultationId", ["consultationId"]),

  creditLedger: defineTable({
    professionalId: v.id("professionals"),
    delta: v.number(), // +grant/purchase/restoration, -1 spend
    reason: creditReasonValidator,
    introductionId: v.optional(v.id("introductions")),
    balanceAfter: v.number(),
    createdAt: v.number(),
  }).index("by_professionalId", ["professionalId"]),

  // Analytics: the discovery→match→unlock→exchange→booking funnel.
  events: defineTable({
    name: v.string(),
    actorId: v.optional(v.id("users")),
    // ponytail: free-form event props; kept open by design for analytics.
    props: v.optional(v.any()),
    ts: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_actorId", ["actorId"]),

  moderationQueue: defineTable({
    targetType: v.union(v.literal("message"), v.literal("user"), v.literal("professional")),
    targetId: v.string(), // id of the target row (varied table)
    reporterId: v.optional(v.id("users")),
    reason: v.string(),
    state: v.union(v.literal("open"), v.literal("actioned"), v.literal("dismissed")),
    createdAt: v.number(),
  }).index("by_state", ["state"]),
});
