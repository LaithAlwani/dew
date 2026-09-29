import type { Infer } from "convex/values";
import type { deadlineKindValidator, introductionStatusValidator } from "../schema";

// The introduction finite state machine, as pure data. `applyTransition`
// (convex/introductions.ts) is the sole runtime writer of status and the only
// creator/canceller of deadlines; it consults this table for what's allowed and
// what deadlines each event opens and closes.

export type IntroStatus = Infer<typeof introductionStatusValidator>;
export type DeadlineKind = Infer<typeof deadlineKindValidator>;

export type IntroEvent =
  | "unlock" // professional pays a credit to reveal the client (= accept)
  | "decline" // professional declines (before or after unlock)
  | "make_contact" // professional sends the first message
  | "client_reply" // client replies — the genuine exchange
  | "mark_connected" // professional marks "connected outside Dew"
  | "expire_preview" // preview_expiry fired without an unlock
  | "expire_contact" // contact_deadline fired without first contact
  | "ghost_client" // client_ghost fired without a client reply
  | "cap_lifecycle"; // 10-day lifecycle cap fired

export interface TransitionSpec {
  from: IntroStatus[]; // statuses this event is legal from
  to: IntroStatus | null; // new status, or null to leave status unchanged
  cancelKinds: DeadlineKind[]; // pending deadlines this event cancels
  createKinds: DeadlineKind[]; // deadlines this event opens (from event time)
  closesConversation?: string; // closure reason if the conversation closes
  reliabilityEvent?: string; // reliability event type to record, if any
}

const ALL_KINDS: DeadlineKind[] = [
  "preview_reminder",
  "preview_expiry",
  "contact_reminder",
  "contact_deadline",
  "client_reminder",
  "client_ghost",
  "lifecycle_cap",
];

export const TRANSITIONS: Record<IntroEvent, TransitionSpec> = {
  unlock: {
    from: ["previewed"],
    to: "contact_pending",
    cancelKinds: ["preview_reminder", "preview_expiry"],
    createKinds: ["contact_reminder", "contact_deadline", "lifecycle_cap"],
  },
  decline: {
    from: ["previewed", "contact_pending"],
    to: "declined",
    cancelKinds: [
      "preview_reminder",
      "preview_expiry",
      "contact_reminder",
      "contact_deadline",
      "lifecycle_cap",
    ],
    createKinds: [],
  },
  make_contact: {
    from: ["contact_pending"],
    to: "contact_made",
    cancelKinds: ["contact_reminder", "contact_deadline"],
    createKinds: ["client_reminder", "client_ghost"],
  },
  client_reply: {
    from: ["contact_made"],
    to: null, // stays contact_made; the reply just clears the ghost timers
    cancelKinds: ["client_reminder", "client_ghost"],
    createKinds: [],
  },
  mark_connected: {
    from: ["contact_made"],
    to: "connected_off_platform",
    cancelKinds: ["client_reminder", "client_ghost", "lifecycle_cap"],
    createKinds: [],
    closesConversation: "connected_off_platform",
  },
  expire_preview: {
    from: ["previewed"],
    to: "expired_no_unlock",
    cancelKinds: ["preview_reminder", "preview_expiry"],
    createKinds: [],
  },
  expire_contact: {
    from: ["contact_pending"],
    to: "expired_no_contact",
    cancelKinds: ["contact_reminder", "contact_deadline", "lifecycle_cap"],
    createKinds: [],
    closesConversation: "expired_no_contact",
    reliabilityEvent: "no_contact",
  },
  ghost_client: {
    from: ["contact_made"],
    to: "client_unresponsive",
    cancelKinds: ["client_reminder", "client_ghost", "lifecycle_cap"],
    createKinds: [],
    closesConversation: "client_unresponsive",
  },
  cap_lifecycle: {
    from: ["contact_pending", "contact_made"],
    to: null, // force-closed; status kept, conversation closed
    cancelKinds: ALL_KINDS,
    createKinds: [],
    closesConversation: "lifecycle_cap",
  },
};

// Maps a fired deadline kind to the FSM event it triggers. Reminder kinds map to
// null — they notify only and never change status.
export const DEADLINE_EVENT: Record<DeadlineKind, IntroEvent | null> = {
  preview_reminder: null,
  preview_expiry: "expire_preview",
  contact_reminder: null,
  contact_deadline: "expire_contact",
  client_reminder: null,
  client_ghost: "ghost_client",
  lifecycle_cap: "cap_lifecycle",
};

export function isLegalTransition(event: IntroEvent, from: IntroStatus): boolean {
  return TRANSITIONS[event].from.includes(from);
}

export function assertTransition(event: IntroEvent, from: IntroStatus): TransitionSpec {
  const spec = TRANSITIONS[event];
  if (!spec.from.includes(from)) {
    throw new Error(`Illegal introduction transition: "${event}" from "${from}"`);
  }
  return spec;
}
