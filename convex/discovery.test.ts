import { convexTest, type TestConvex } from "convex-test";
import { beforeEach, describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = (
  import.meta as unknown as {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
).glob("./**/*.ts");

type TestApi = TestConvex<typeof schema>;

let t: TestApi;
beforeEach(() => {
  t = convexTest(schema, modules);
});

describe("discovery session", () => {
  test("creates a session for a new anonymousId", async () => {
    await t.mutation(api.discovery.saveAnswers, {
      anonymousId: "anon-1",
      answers: { category: "makeup" },
    });
    const session = await t.query(api.discovery.getSession, { anonymousId: "anon-1" });
    expect(session?.answers).toEqual({ category: "makeup" });
  });

  test("merges progressive answers into the same session", async () => {
    await t.mutation(api.discovery.saveAnswers, {
      anonymousId: "anon-1",
      answers: { category: "makeup", occasion: "bridal" },
    });
    await t.mutation(api.discovery.saveAnswers, {
      anonymousId: "anon-1",
      answers: { timing: "within_2_weeks", city: "Toronto" },
    });
    const session = await t.query(api.discovery.getSession, { anonymousId: "anon-1" });
    expect(session?.answers).toEqual({
      category: "makeup",
      occasion: "bridal",
      timing: "within_2_weeks",
      city: "Toronto",
    });
    // One row, not two.
    const all = await t.run((ctx) => ctx.db.query("discoverySessions").collect());
    expect(all).toHaveLength(1);
  });

  test("returns null for an unknown anonymousId", async () => {
    expect(await t.query(api.discovery.getSession, { anonymousId: "nope" })).toBeNull();
  });

  test("rejects an invalid enum value", async () => {
    await expect(
      t.mutation(api.discovery.saveAnswers, {
        anonymousId: "anon-1",
        answers: { category: "tattoo" },
      }),
    ).rejects.toThrow();
  });
});
