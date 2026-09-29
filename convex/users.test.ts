import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import { requireRole, requireUser } from "./lib/auth";
import schema from "./schema";

// Vitest injects import.meta.glob (a Vite feature). Its types live in
// vite/client, which is present in the root tsc context but not in Convex's
// deploy typecheck — so cast locally rather than globally augmenting ImportMeta.
const modules = (
  import.meta as unknown as {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
).glob("./**/*.ts");

describe("anonymous session merge", () => {
  test("losslessly attaches the discovery session to the account", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "auth-user-1" });

    const answers = { skinType: "combination", occasion: "wedding", budget: "mid" };
    await asUser.run(async (ctx) => {
      await ctx.db.insert("users", {
        authUserId: "auth-user-1",
        role: "client",
        createdAt: 0,
      });
      await ctx.db.insert("discoverySessions", {
        anonymousId: "anon-1",
        answers,
        createdAt: 0,
      });
    });

    const result = await asUser.mutation(api.users.mergeAnonymousSession, {
      anonymousId: "anon-1",
    });
    expect(result.merged).toBe(1);

    await t.run(async (ctx) => {
      const session = await ctx.db
        .query("discoverySessions")
        .withIndex("by_anonymousId", (q) => q.eq("anonymousId", "anon-1"))
        .unique();
      const user = await ctx.db
        .query("users")
        .withIndex("by_authUserId", (q) => q.eq("authUserId", "auth-user-1"))
        .unique();
      // Ownership transferred...
      expect(session?.userId).toBe(user?._id);
      // ...and nothing lost.
      expect(session?.answers).toEqual(answers);
    });
  });

  test("is idempotent (re-running merges nothing new)", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "auth-user-2" });
    await asUser.run(async (ctx) => {
      await ctx.db.insert("users", { authUserId: "auth-user-2", role: "client", createdAt: 0 });
      await ctx.db.insert("discoverySessions", { anonymousId: "anon-2", createdAt: 0 });
    });
    await asUser.mutation(api.users.mergeAnonymousSession, { anonymousId: "anon-2" });
    const second = await asUser.mutation(api.users.mergeAnonymousSession, {
      anonymousId: "anon-2",
    });
    // Still reports the session it owns; the patch is a no-op the second time.
    expect(second.merged).toBe(1);
  });
});

describe("authorization guards", () => {
  test("requireRole rejects a wrong-role caller and accepts the right one", async () => {
    const t = convexTest(schema, modules);
    const asClient = t.withIdentity({ subject: "auth-user-3" });
    await asClient.run(async (ctx) => {
      await ctx.db.insert("users", { authUserId: "auth-user-3", role: "client", createdAt: 0 });
    });

    await expect(asClient.run((ctx) => requireRole(ctx, "admin"))).rejects.toThrow(/Forbidden/);
    await expect(asClient.run((ctx) => requireRole(ctx, "client"))).resolves.toMatchObject({
      role: "client",
    });
  });

  test("requireUser rejects an unauthenticated caller", async () => {
    const t = convexTest(schema, modules);
    await expect(t.run((ctx) => requireUser(ctx))).rejects.toThrow(/Unauthenticated/);
  });
});
