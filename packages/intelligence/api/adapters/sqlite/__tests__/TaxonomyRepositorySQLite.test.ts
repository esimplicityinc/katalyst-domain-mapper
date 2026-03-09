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

    CREATE TABLE IF NOT EXISTS taxonomy_teams (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      team_type TEXT NOT NULL,
      description TEXT,
      focus_area TEXT,
      communication_channels TEXT NOT NULL DEFAULT '[]',
      owned_nodes TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS taxonomy_persons (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      email TEXT,
      role TEXT,
      avatar_url TEXT
    );

    CREATE TABLE IF NOT EXISTS taxonomy_team_memberships (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
      team_name TEXT NOT NULL,
      person_name TEXT NOT NULL,
      role TEXT NOT NULL
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
    teams: [],
    persons: [],
    teamMemberships: [],
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

  describe("teams and persons", () => {
    it("saveSnapshot persists teams, persons, and memberships", async () => {
      const data: ValidatedTaxonomyData = {
        ...makeSnapshot([]),
        teams: [
          {
            name: "platform-team",
            displayName: "Platform Team",
            teamType: "platform",
            description: "Builds internal platforms",
            focusArea: "infrastructure",
            communicationChannels: ["#platform"],
            ownedNodes: ["infra-stack"],
            members: [],
          },
          {
            name: "stream-alpha",
            displayName: "Stream Alpha",
            teamType: "stream-aligned",
            description: "Customer-facing features",
            focusArea: "checkout",
            communicationChannels: ["#alpha", "#alpha-dev"],
            ownedNodes: ["checkout-stack"],
            members: [],
          },
        ],
        persons: [
          { name: "alice", displayName: "Alice Smith", email: "alice@example.com", role: "tech-lead", avatarUrl: null },
          { name: "bob", displayName: "Bob Jones", email: "bob@example.com", role: "engineer", avatarUrl: null },
          { name: "carol", displayName: "Carol Wu", email: null, role: null, avatarUrl: null },
        ],
        teamMemberships: [
          { teamName: "platform-team", personName: "alice", role: "tech-lead" },
          { teamName: "platform-team", personName: "bob", role: "engineer" },
          { teamName: "stream-alpha", personName: "bob", role: "contributor" },
          { teamName: "stream-alpha", personName: "carol", role: "engineer" },
        ],
      };

      await repo.saveSnapshot(data);
      const teams = await repo.getTeams();

      expect(teams).toHaveLength(2);

      const platform = teams.find((t) => t.name === "platform-team")!;
      expect(platform.displayName).toBe("Platform Team");
      expect(platform.memberCount).toBe(2);

      const alpha = teams.find((t) => t.name === "stream-alpha")!;
      expect(alpha.displayName).toBe("Stream Alpha");
      expect(alpha.memberCount).toBe(2);
    });

    it("getTeamByName returns team with full member details", async () => {
      const data: ValidatedTaxonomyData = {
        ...makeSnapshot([]),
        teams: [
          {
            name: "core-team",
            displayName: "Core Team",
            teamType: "stream-aligned",
            description: "Core product team",
            focusArea: "product",
            communicationChannels: ["#core"],
            ownedNodes: [],
            members: [],
          },
        ],
        persons: [
          { name: "dana", displayName: "Dana Lee", email: "dana@example.com", role: "lead", avatarUrl: null },
          { name: "evan", displayName: "Evan Park", email: "evan@example.com", role: "engineer", avatarUrl: null },
        ],
        teamMemberships: [
          { teamName: "core-team", personName: "dana", role: "tech-lead" },
          { teamName: "core-team", personName: "evan", role: "engineer" },
        ],
      };

      await repo.saveSnapshot(data);
      const detail = await repo.getTeamByName("core-team");

      expect(detail).not.toBeNull();
      expect(detail!.name).toBe("core-team");
      expect(detail!.members).toHaveLength(2);

      const dana = detail!.members.find((m) => m.personName === "dana")!;
      expect(dana.displayName).toBe("Dana Lee");
      expect(dana.email).toBe("dana@example.com");
      expect(dana.role).toBe("tech-lead");

      const evan = detail!.members.find((m) => m.personName === "evan")!;
      expect(evan.displayName).toBe("Evan Park");
      expect(evan.email).toBe("evan@example.com");
      expect(evan.role).toBe("engineer");
    });

    it("getTeamByName returns null for unknown team", async () => {
      // Save a snapshot with no teams so there IS a latest snapshot
      await repo.saveSnapshot(makeSnapshot([]));

      const result = await repo.getTeamByName("nonexistent");
      expect(result).toBeNull();
    });

    it("getPersons includes team membership info", async () => {
      const data: ValidatedTaxonomyData = {
        ...makeSnapshot([]),
        teams: [
          {
            name: "team-x",
            displayName: "Team X",
            teamType: "platform",
            description: null,
            focusArea: null,
            communicationChannels: [],
            ownedNodes: [],
            members: [],
          },
          {
            name: "team-y",
            displayName: "Team Y",
            teamType: "enabling",
            description: null,
            focusArea: null,
            communicationChannels: [],
            ownedNodes: [],
            members: [],
          },
        ],
        persons: [
          { name: "fiona", displayName: "Fiona Grant", email: "fiona@example.com", role: "architect", avatarUrl: null },
        ],
        teamMemberships: [
          { teamName: "team-x", personName: "fiona", role: "lead" },
          { teamName: "team-y", personName: "fiona", role: "advisor" },
        ],
      };

      await repo.saveSnapshot(data);
      const persons = await repo.getPersons();

      expect(persons).toHaveLength(1);
      const fiona = persons[0];
      expect(fiona.name).toBe("fiona");
      expect(fiona.displayName).toBe("Fiona Grant");
      expect(fiona.teams).toHaveLength(2);

      const teamNames = fiona.teams.map((t) => t.team).sort();
      expect(teamNames).toEqual(["team-x", "team-y"]);

      const teamX = fiona.teams.find((t) => t.team === "team-x")!;
      expect(teamX.role).toBe("lead");

      const teamY = fiona.teams.find((t) => t.team === "team-y")!;
      expect(teamY.role).toBe("advisor");
    });

    it("pluginSummary includes teams and persons counts", async () => {
      const data: ValidatedTaxonomyData = {
        ...makeSnapshot([]),
        teams: [
          {
            name: "ops-team",
            displayName: "Ops Team",
            teamType: "platform",
            description: "Operations",
            focusArea: null,
            communicationChannels: [],
            ownedNodes: [],
            members: [],
          },
        ],
        persons: [
          { name: "greta", displayName: "Greta Holm", email: null, role: null, avatarUrl: null },
          { name: "hank", displayName: "Hank Kim", email: null, role: null, avatarUrl: null },
        ],
        teamMemberships: [
          { teamName: "ops-team", personName: "greta", role: "engineer" },
          { teamName: "ops-team", personName: "hank", role: "engineer" },
        ],
      };

      const stored = await repo.saveSnapshot(data);
      expect(stored.pluginSummary.teams).toBe(1);
      expect(stored.pluginSummary.persons).toBe(2);
    });
  });
});
