import { convexTest, type TestConvex } from "convex-test";
import { beforeEach, describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = (
  import.meta as unknown as {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
).glob("./**/*.ts");

type TestApi = TestConvex<typeof schema>;

const VALID_PROFILE = {
  displayName: "Ada Glow",
  bio: "Bridal & editorial MUA",
  services: ["bridal_makeup", "event_makeup"],
  businessHours: { timezone: "America/Toronto", startMinute: 540, endMinute: 1020 },
  bookingLink: "https://cal.com/ada",
  capacity: 5,
};

let t: TestApi;
beforeEach(() => {
  t = convexTest(schema, modules);
});

async function seedUser(t: TestApi, subject: string, role: "client" | "professional" | "admin") {
  return await t.run((ctx) => ctx.db.insert("users", { authUserId: subject, role, createdAt: 0 }));
}

describe("claim", () => {
  test("creates a pending profile and flips the caller to professional", async () => {
    await seedUser(t, "u1", "client");
    const asUser = t.withIdentity({ subject: "u1" });
    const proId = await asUser.mutation(api.professionals.claimProfessional, {});

    const { pro, user } = await t.run(async (ctx) => ({
      pro: await ctx.db.get(proId as Id<"professionals">),
      user: await ctx.db
        .query("users")
        .withIndex("by_authUserId", (q) => q.eq("authUserId", "u1"))
        .unique(),
    }));
    expect(pro?.approvalState).toBe("pending_review");
    expect(user?.role).toBe("professional");
  });

  test("is idempotent", async () => {
    await seedUser(t, "u1", "client");
    const asUser = t.withIdentity({ subject: "u1" });
    const first = await asUser.mutation(api.professionals.claimProfessional, {});
    const second = await asUser.mutation(api.professionals.claimProfessional, {});
    expect(first).toBe(second);
  });
});

describe("updateProfile", () => {
  test("owner saves a valid profile", async () => {
    await seedUser(t, "u1", "client");
    const asUser = t.withIdentity({ subject: "u1" });
    await asUser.mutation(api.professionals.claimProfessional, {});
    await asUser.mutation(api.professionals.updateProfile, VALID_PROFILE);

    const pro = await asUser.query(api.professionals.getMyProfessional, {});
    expect(pro?.displayName).toBe("Ada Glow");
    expect(pro?.services).toEqual(["bridal_makeup", "event_makeup"]);
    expect(pro?.capacity).toBe(5);
  });

  test("rejects an invalid profile (no services, bad window)", async () => {
    await seedUser(t, "u1", "client");
    const asUser = t.withIdentity({ subject: "u1" });
    await asUser.mutation(api.professionals.claimProfessional, {});

    await expect(
      asUser.mutation(api.professionals.updateProfile, { ...VALID_PROFILE, services: [] }),
    ).rejects.toThrow();
    await expect(
      asUser.mutation(api.professionals.updateProfile, {
        ...VALID_PROFILE,
        businessHours: { timezone: "America/Toronto", startMinute: 1020, endMinute: 540 },
      }),
    ).rejects.toThrow();
  });

  test("a non-professional cannot update", async () => {
    await seedUser(t, "client1", "client");
    const asClient = t.withIdentity({ subject: "client1" });
    await expect(asClient.mutation(api.professionals.updateProfile, VALID_PROFILE)).rejects.toThrow(
      /Forbidden/,
    );
  });
});

describe("admin approval", () => {
  test("approve flips state and grants free credits once; non-admin is rejected", async () => {
    await seedUser(t, "u1", "client");
    const asUser = t.withIdentity({ subject: "u1" });
    const proId = (await asUser.mutation(
      api.professionals.claimProfessional,
      {},
    )) as Id<"professionals">;

    // A client cannot approve.
    await seedUser(t, "client1", "client");
    await expect(
      t
        .withIdentity({ subject: "client1" })
        .mutation(api.professionals.approveProfessional, { professionalId: proId }),
    ).rejects.toThrow(/Forbidden/);

    // Admin approves.
    await seedUser(t, "admin1", "admin");
    const asAdmin = t.withIdentity({ subject: "admin1" });

    const pendingBefore = await asAdmin.query(api.professionals.listPendingProfessionals, {});
    expect(pendingBefore).toHaveLength(1);

    await asAdmin.mutation(api.professionals.approveProfessional, { professionalId: proId });
    await asAdmin.mutation(api.professionals.approveProfessional, { professionalId: proId }); // idempotent

    const { pro, ledger } = await t.run(async (ctx) => ({
      pro: await ctx.db.get(proId),
      ledger: await ctx.db
        .query("creditLedger")
        .withIndex("by_professionalId", (q) => q.eq("professionalId", proId))
        .collect(),
    }));
    expect(pro?.approvalState).toBe("approved");
    expect(ledger).toHaveLength(1); // granted once, not twice
    expect(ledger[0].reason).toBe("free_grant");
    expect(ledger[0].balanceAfter).toBe(3);

    const pendingAfter = await asAdmin.query(api.professionals.listPendingProfessionals, {});
    expect(pendingAfter).toHaveLength(0);
  });

  test("a rejected professional can resubmit and reappears in the queue", async () => {
    await seedUser(t, "u1", "client");
    const asUser = t.withIdentity({ subject: "u1" });
    const proId = (await asUser.mutation(
      api.professionals.claimProfessional,
      {},
    )) as Id<"professionals">;

    await seedUser(t, "admin1", "admin");
    const asAdmin = t.withIdentity({ subject: "admin1" });
    await asAdmin.mutation(api.professionals.rejectProfessional, { professionalId: proId });

    // Rejected → not in the pending queue, resubmit not yet done.
    expect(await asAdmin.query(api.professionals.listPendingProfessionals, {})).toHaveLength(0);

    await asUser.mutation(api.professionals.resubmitForReview, {});

    const pro = await t.run((ctx) => ctx.db.get(proId));
    expect(pro?.approvalState).toBe("pending_review");
    expect(await asAdmin.query(api.professionals.listPendingProfessionals, {})).toHaveLength(1);
  });

  test("resubmit is only valid from rejected", async () => {
    await seedUser(t, "u1", "client");
    const asUser = t.withIdentity({ subject: "u1" });
    await asUser.mutation(api.professionals.claimProfessional, {}); // pending_review
    await expect(asUser.mutation(api.professionals.resubmitForReview, {})).rejects.toThrow(
      /Only a rejected profile/,
    );
  });

  test("listing pending requires admin", async () => {
    await seedUser(t, "client1", "client");
    await expect(
      t.withIdentity({ subject: "client1" }).query(api.professionals.listPendingProfessionals, {}),
    ).rejects.toThrow(/Forbidden/);
  });
});
