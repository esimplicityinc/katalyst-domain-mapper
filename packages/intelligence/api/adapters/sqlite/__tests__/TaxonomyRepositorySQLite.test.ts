/**
 * Unit tests for TaxonomyRepositorySQLite focusing on:
 * - saveSnapshot stores parentCapability and tag correctly
 * - getCapabilityTree builds hierarchy and derives status bottom-up
 */

import { describe, it, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../../../db/schema.js";
import { TaxonomyRepositorySQLite } from "../TaxonomyRepositorySQLite.js";
import type { ValidatedTaxonomyData } from "../../../domain/taxonomy/validateTaxonomyData.js";

// ── Helper to create a fresh in-memory DB with the required schema ─────────

function makeDb() {
  const sqlite = new Database(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");

  // Create the minimal tables needed for taxonomy
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS taxonomy_snapshots (
      id TEXT PRIMARY KEY,
      project TEXT NOT NULL,
      version TEXT NOT NULL,
      generated TEXT NOT NULL,
      raw_snapshot TEXT NOT NULL,
      node_count INTEGER NOT NULL,
      environment_count INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS taxonomy_nodes (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      node_type TEXT NOT NULL,
      fqtn TEXT NOT NULL,
      description TEXT,
      parent_node TEXT,
      owners TEXT NOT NULL DEFAULT '[]',
      environments TEXT NOT NULL DEFAULT '[]',
      labels TEXT NOT NULL DEFAULT '{}',
      depends_on TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS taxonomy_environments (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      parent_environment TEXT,
      promotion_targets TEXT NOT NULL DEFAULT '[]',
      template_replacements TEXT NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS taxonomy_layer_types (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      default_layer_dir TEXT
    );

    CREATE TABLE IF NOT EXISTS taxonomy_capabilities (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      categories TEXT NOT NULL DEFAULT '[]',
      depends_on TEXT NOT NULL DEFAULT '[]',
      parent_capability TEXT,
      tag TEXT
    );

    CREATE TABLE IF NOT EXISTS taxonomy_capability_rels (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      node TEXT NOT NULL,
      relationship_type TEXT NOT NULL,
      capabilities TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS taxonomy_actions (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      action_type TEXT NOT NULL,
      layer_type TEXT,
      tags TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS taxonomy_stages (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      depends_on TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS taxonomy_tools (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      actions TEXT NOT NULL DEFAULT '[]'
    );
  `);

  return drizzle(sqlite, { schema });
}

// ── Minimal ValidatedTaxonomyData factory ─────────────────────────────────

function makeSnapshot(
  capabilities: ValidatedTaxonomyData["capabilities"],
  capabilityRels: ValidatedTaxonomyData["capabilityRels"] = [],
): ValidatedTaxonomyData {
  return {
    project: "test-project",
    version: "1.0.0",
    generated: new Date().toISOString(),
    nodes: [],
    environments: [],
    layerTypes: [],
    capabilities,
    capabilityRels,
    actions: [],
    stages: [],
    tools: [],
    rawPayload: {},
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe("TaxonomyRepositorySQLite", () => {
  let repo: TaxonomyRepositorySQLite;

  beforeEach(() => {
    const db = makeDb();
    repo = new TaxonomyRepositorySQLite(db);
  });

  describe("saveSnapshot", () => {
    it("stores parentCapability and tag on capabilities", async () => {
      const data = makeSnapshot([
        {
          name: "regulatory-compliance",
          description: "System-level compliance capability",
          categories: ["compliance"],
          dependsOn: [],
          parentCapability: null,
          tag: "CAP-001",
        },
        {
          name: "water-quality-monitoring",
          description: "Subsystem capability for water quality",
          categories: ["monitoring"],
          dependsOn: [],
          parentCapability: "regulatory-compliance",
          tag: "CAP-002",
        },
      ]);

      const stored = await repo.saveSnapshot(data);
      expect(stored.pluginSummary.capabilities).toBe(2);

      // Verify the tree can be queried back
      const tree = await repo.getCapabilityTreeBySnapshotId(stored.id);
      expect(tree.roots).toHaveLength(1);
      expect(tree.roots[0].name).toBe("regulatory-compliance");
      expect(tree.roots[0].tag).toBe("CAP-001");
      expect(tree.roots[0].children).toHaveLength(1);
      expect(tree.roots[0].children[0].name).toBe("water-quality-monitoring");
      expect(tree.roots[0].children[0].tag).toBe("CAP-002");
    });

    it("treats capabilities with unknown parentCapability as roots", async () => {
      const data = makeSnapshot([
        {
          name: "orphan-cap",
          description: "References a non-existent parent",
          categories: [],
          dependsOn: [],
          parentCapability: "ghost-parent",
          tag: null,
        },
      ]);

      const stored = await repo.saveSnapshot(data);
      const tree = await repo.getCapabilityTreeBySnapshotId(stored.id);
      // Treated as root since parent doesn't exist in the snapshot
      expect(tree.roots).toHaveLength(1);
      expect(tree.roots[0].name).toBe("orphan-cap");
    });
  });

  describe("getCapabilityTree", () => {
    it("returns empty tree when no snapshots exist", async () => {
      const tree = await repo.getCapabilityTree();
      expect(tree.roots).toHaveLength(0);
      expect(tree.byName.size).toBe(0);
    });

    it("returns byName map with all capabilities", async () => {
      const data = makeSnapshot([
        { name: "cap-a", description: "A", categories: [], dependsOn: [], parentCapability: null, tag: null },
        { name: "cap-b", description: "B", categories: [], dependsOn: [], parentCapability: "cap-a", tag: null },
        { name: "cap-c", description: "C", categories: [], dependsOn: [], parentCapability: "cap-a", tag: null },
      ]);

      await repo.saveSnapshot(data);
      const tree = await repo.getCapabilityTree();

      expect(tree.byName.size).toBe(3);
      expect(tree.byName.has("cap-a")).toBe(true);
      expect(tree.byName.has("cap-b")).toBe(true);
      expect(tree.byName.has("cap-c")).toBe(true);
    });

    it("resolves taxonomyNodes from capability relationships", async () => {
      const data = makeSnapshot(
        [
          { name: "lims-sample-analysis", description: "LIMS cap", categories: [], dependsOn: [], parentCapability: null, tag: null },
        ],
        [
          { name: "lims-rel", node: "lims-stack", relationshipType: "supports", capabilities: ["lims-sample-analysis"] },
        ],
      );

      await repo.saveSnapshot(data);
      const tree = await repo.getCapabilityTree();

      expect(tree.byName.get("lims-sample-analysis")?.taxonomyNodes).toEqual(["lims-stack"]);
    });
  });

  describe("status derivation (worst-child-wins)", () => {
    it("leaf node derivedStatus equals declaredStatus (stable default)", async () => {
      const data = makeSnapshot([
        { name: "leaf", description: "Leaf cap", categories: [], dependsOn: [], parentCapability: null, tag: null },
      ]);

      await repo.saveSnapshot(data);
      const tree = await repo.getCapabilityTree();
      const leaf = tree.byName.get("leaf")!;
      expect(leaf.derivedStatus).toBe("stable");
      expect(leaf.declaredStatus).toBe("stable");
    });

    it("parent with all stable children has derivedStatus stable", async () => {
      const data = makeSnapshot([
        { name: "parent", description: "Parent", categories: [], dependsOn: [], parentCapability: null, tag: null },
        { name: "child-1", description: "Child 1", categories: [], dependsOn: [], parentCapability: "parent", tag: null },
        { name: "child-2", description: "Child 2", categories: [], dependsOn: [], parentCapability: "parent", tag: null },
      ]);

      await repo.saveSnapshot(data);
      const tree = await repo.getCapabilityTree();
      const parent = tree.byName.get("parent")!;
      expect(parent.children).toHaveLength(2);
      expect(parent.derivedStatus).toBe("stable");
    });

    it("3-level hierarchy populates correctly", async () => {
      const data = makeSnapshot([
        { name: "system", description: "System cap", categories: [], dependsOn: [], parentCapability: null, tag: null },
        { name: "subsystem", description: "Subsystem cap", categories: [], dependsOn: [], parentCapability: "system", tag: null },
        { name: "stack", description: "Stack cap", categories: [], dependsOn: [], parentCapability: "subsystem", tag: null },
      ]);

      await repo.saveSnapshot(data);
      const tree = await repo.getCapabilityTree();

      expect(tree.roots).toHaveLength(1);
      const sys = tree.roots[0];
      expect(sys.name).toBe("system");
      expect(sys.children).toHaveLength(1);
      const sub = sys.children[0];
      expect(sub.name).toBe("subsystem");
      expect(sub.children).toHaveLength(1);
      expect(sub.children[0].name).toBe("stack");
    });
  });

  describe("getCapabilityTreeBySnapshotId", () => {
    it("uses the specified snapshot, not the latest", async () => {
      // First snapshot: 1 root cap
      const snap1 = await repo.saveSnapshot(
        makeSnapshot([{ name: "cap-v1", description: "v1", categories: [], dependsOn: [], parentCapability: null, tag: null }]),
      );
      // Second snapshot: different cap
      await repo.saveSnapshot(
        makeSnapshot([{ name: "cap-v2", description: "v2", categories: [], dependsOn: [], parentCapability: null, tag: null }]),
      );

      // Query by first snapshot ID
      const tree = await repo.getCapabilityTreeBySnapshotId(snap1.id);
      expect(tree.byName.has("cap-v1")).toBe(true);
      expect(tree.byName.has("cap-v2")).toBe(false);
    });
  });
});
