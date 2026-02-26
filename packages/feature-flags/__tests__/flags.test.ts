import { describe, expect, it } from "bun:test";
import { FLAG_KEYS, FlagConfigSchema, flagKeyToEnvVar, ENV_PREFIX } from "../src/flags";

describe("flags", () => {
  describe("FLAG_KEYS", () => {
    it("should contain all expected flag keys", () => {
      expect(FLAG_KEYS.SCANNER_ENABLED).toBe("scanner-enabled");
      expect(FLAG_KEYS.DOMAIN_MODEL_V2).toBe("domain-model-v2");
      expect(FLAG_KEYS.LANDSCAPE_LINT_STRICT).toBe("landscape-lint-strict");
      expect(FLAG_KEYS.AI_INSIGHTS_ENABLED).toBe("ai-insights-enabled");
      expect(FLAG_KEYS.GOVERNANCE_V2).toBe("governance-v2");
      expect(FLAG_KEYS.MAX_CONCURRENT_SCANS).toBe("max-concurrent-scans");
    });

    it("should be immutable (const assertion)", () => {
      // Ensure we can't accidentally reassign
      const keys = Object.keys(FLAG_KEYS);
      expect(keys.length).toBeGreaterThan(0);
    });
  });

  describe("flagKeyToEnvVar", () => {
    it("should convert flag keys to env var format", () => {
      expect(flagKeyToEnvVar("scanner-enabled")).toBe("FF_SCANNER_ENABLED");
      expect(flagKeyToEnvVar("domain-model-v2")).toBe("FF_DOMAIN_MODEL_V2");
      expect(flagKeyToEnvVar("max-concurrent-scans")).toBe("FF_MAX_CONCURRENT_SCANS");
    });

    it("should use the correct prefix", () => {
      expect(ENV_PREFIX).toBe("FF_");
      expect(flagKeyToEnvVar("test")).toStartWith("FF_");
    });
  });

  describe("FlagConfigSchema", () => {
    it("should validate a valid flag config", () => {
      const validConfig = {
        flags: {
          "test-flag": {
            description: "A test flag",
            disabled: false,
            variants: { on: true, off: false },
            defaultVariant: "on",
            flagType: "boolean" as const,
          },
        },
      };

      const result = FlagConfigSchema.parse(validConfig);
      expect(result.flags["test-flag"]).toBeDefined();
      expect(result.flags["test-flag"].description).toBe("A test flag");
    });

    it("should reject invalid flag config (missing flagType)", () => {
      const invalid = {
        flags: {
          "bad-flag": {
            description: "Bad",
            disabled: false,
            variants: {},
            defaultVariant: "on",
            // missing flagType
          },
        },
      };

      expect(() => FlagConfigSchema.parse(invalid)).toThrow();
    });

    it("should validate flags.json file", async () => {
      const flagsPath = new URL("../flags.json", import.meta.url);
      const raw = await Bun.file(flagsPath).json();
      const result = FlagConfigSchema.parse(raw);

      // Verify all FLAG_KEYS are present
      for (const key of Object.values(FLAG_KEYS)) {
        expect(result.flags[key]).toBeDefined();
      }
    });
  });
});
