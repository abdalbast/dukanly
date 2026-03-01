import { describe, expect, it, vi } from "vitest";

describe("Observability integrations", () => {
  it("reports synthetic window errors through configured reporter", async () => {
    vi.resetModules();

    const observability = await import("@/lib/observability");
    const reporter = vi.fn();

    observability.initObservability();
    observability.setErrorReporterForTests(reporter);
    observability.setObservabilityUser({ id: "user-1", email: "user@example.com" });

    const syntheticError = new Error("synthetic failure");
    window.dispatchEvent(
      new ErrorEvent("error", {
        error: syntheticError,
        message: syntheticError.message,
        filename: "synthetic-test",
      }),
    );

    expect(reporter).toHaveBeenCalledTimes(1);
    expect(reporter.mock.calls[0]?.[0]).toBe(syntheticError);
    expect(reporter.mock.calls[0]?.[1]).toMatchObject({
      source: "window.error",
      userId: "user-1",
    });
  });
});
