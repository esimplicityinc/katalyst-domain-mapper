import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { buildProviderConfig, initServerFlags, evaluateAllFlags } from "../src/server";
import { FLAG_KEYS, type FlagConfig } from "../src/flags";
import { OpenFeature } from "@openfeature/server-sdk";

const testFlagConfig: FlagConfig = {
  flags: {
    "scanner-enabled": {
      description: "Test scanner flag",
      disabled: false,
      variants: { on: true, off: false },
      defaultVariant: "on",
      flagType: "boolean",
    },
    "max-concurrent-scans": {
      description: "Test numeric flag",
      disabled: false,
      variants: { low: 1, medium: 3, high: 5 },
      defaultVariant: "low",
      flagType: "number",
    },
  },
};

describe("server", () => {
  afterEach(async () => {
    // Clean up OpenFeature state between tests
    await OpenFeature.clearProviders();
  });

  describe("buildProviderConfig", () => {
    it("should convert flag config to provider format", () => {
      const result = buildProviderConfig(testFlagConfig);

      expect(result["scanner-enabled"]).toBeDefined();
      expect(result["scanner-enabled"].disabled).toBe(false);
      expect(result["scanner-enabled"].defaultVariant).toBe("on");
      expect(result["scanner-enabled"].variants).toEqual({ on: true, off: false });
    });

    it("should apply environment variable overrides", () => {
      const originalEnv = process.env.FF_SCANNER_ENABLED;
      process.env.FF_SCANNER_ENABLED = "false";

      try {
        const result = buildProviderConfig(testFlagConfig);
        // "false" should match the "off" variant
        expect(result["scanner-enabled"].defaultVariant).toBe("off");
      } finally {
        if (originalEnv === undefined) {
          delete process.env.FF_SCANNER_ENABLED;
        } else {
          process.env.FF_SCANNER_ENABLED = originalEnv;
        }
      }
    });

    it("should create _env_override variant for non-matching values", () => {
      const originalEnv = process.env.FF_MAX_CONCURRENT_SCANS;
      process.env.FF_MAX_CONCURRENT_SCANS = "10";

      try {
        const config: FlagConfig = JSON.parse(JSON.stringify(testFlagConfig));
        const result = buildProviderConfig(config);
        expect(result["max-concurrent-scans"].defaultVariant).toBe("_env_override");
        expect(result["max-concurrent-scans"].variants["_env_override"]).toBe(10);
      } finally {
        if (originalEnv === undefined) {
          delete process.env.FF_MAX_CONCURRENT_SCANS;
        } else {
          process.env.FF_MAX_CONCURRENT_SCANS = originalEnv;
        }
      }
    });
  });

  describe("initServerFlags", () => {
    it("should initialize OpenFeature with provided config", async () => {
      const client = await initServerFlags({ flagConfig: testFlagConfig });
      expect(client).toBeDefined();

      const scannerEnabled = await client.getBooleanValue("scanner-enabled", false);
      expect(scannerEnabled).toBe(true);
    });

    it("should evaluate numeric flags", async () => {
      const client = await initServerFlags({ flagConfig: testFlagConfig });
      const maxScans = await client.getNumberValue("max-concurrent-scans", 0);
      expect(maxScans).toBe(1); // defaultVariant is "low" = 1
    });
  });

  describe("evaluateAllFlags", () => {
    it("should return all flag values as a flat map", async () => {
      await initServerFlags({ flagConfig: testFlagConfig });
      const allFlags = await evaluateAllFlags(testFlagConfig);

      expect(allFlags["scanner-enabled"]).toBe(true);
      expect(allFlags["max-concurrent-scans"]).toBe(1);
    });
  });
});
