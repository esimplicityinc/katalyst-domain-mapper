import { eq, desc } from "drizzle-orm";
import type {
  TaxonomyRepository,
  StoredTaxonomySnapshot,
  TaxonomyPluginSummary,
  TaxonomyNodeSummary,
  TaxonomyEnvironmentSummary,
  TaxonomyHierarchy,
  TaxonomyHierarchyNode,
  CapabilityNode,
  CapabilityTree,
  TaxonomyTeamSummary,
  TaxonomyTeamDetail,
  TaxonomyTeamMemberSummary,
  TaxonomyPersonSummary,
  StoredGovernanceSnapshot,
  CapabilityCoverage,
  UserTypeCoverage,
  RoadItemSummary,
  IntegrityReport,
  TrendPoint,
  StoredUserType,
  StoredUserStory,
  StoredCapability,
  GovernanceSnapshotInput,
  StoredDomainModel,
  StoredBoundedContext,
  StoredAggregate,
  StoredDomainEvent,
  StoredValueObject,
  StoredGlossaryTerm,
  StoredWorkflow,
  DomainModelWithArtifacts,
  CreateDomainModelInput,
  UpdateDomainModelInput,
  CreateBoundedContextInput,
  UpdateBoundedContextInput,
  CreateAggregateInput,
  UpdateAggregateInput,
  CreateDomainEventInput,
  UpdateDomainEventInput,
  CreateValueObjectInput,
  UpdateValueObjectInput,
  CreateGlossaryTermInput,
  UpdateGlossaryTermInput,
  CreateWorkflowInput,
  UpdateWorkflowInput,
} from "../../ports/TaxonomyRepository.js";
import type { DrizzleDB } from "../../db/client.js";
import type { ValidatedTaxonomyData } from "../../domain/taxonomy/validateTaxonomyData.js";
import type { ValidatedSnapshotData } from "../../domain/governance/validateSnapshotData.js";
import * as schema from "../../db/schema.js";

export class TaxonomyRepositorySQLite implements TaxonomyRepository {
  constructor(private db: DrizzleDB) {}

  // ══════════════════════════════════════════════════════════════════════════
  // TAXONOMY SNAPSHOTS
  // ══════════════════════════════════════════════════════════════════════════

  async saveTaxonomySnapshot(data: ValidatedTaxonomyData): Promise<StoredTaxonomySnapshot> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const generated = data.generated ?? now;

    const pluginSummary: TaxonomyPluginSummary = {
      layerTypes: data.layerTypes.length,
      capabilities: data.capabilities.length,
      capabilityRels: data.capabilityRels.length,
      actions: data.actions.length,
      stages: data.stages.length,
      tools: data.tools.length,
      layerHealths: 0,
      teams: data.teams.length,
      persons: data.persons.length,
    };

    // Insert snapshot
    this.db
      .insert(schema.taxonomySnapshots)
      .values({
        id,
        project: data.project,
        version: data.version,
        generated,
        rawSnapshot: data.rawPayload,
        nodeCount: data.nodes.length,
        environmentCount: data.environments.length,
        createdAt: now,
      })
      .run();

    // Denormalize nodes
    for (const node of data.nodes) {
      this.db
        .insert(schema.taxonomyNodes)
        .values({
          id: `${id}:${node.name}`,
          snapshotId: id,
          name: node.name,
          nodeType: node.nodeType,
          fqtn: node.fqtn,
          description: node.description,
          parentNode: node.parentNode,
          owners: node.owners,
          environments: node.environments,
          labels: node.labels,
          dependsOn: node.dependsOn,
        })
        .run();
    }

    // Denormalize environments
    for (const env of data.environments) {
      this.db
        .insert(schema.taxonomyEnvironments)
        .values({
          id: `${id}:${env.name}`,
          snapshotId: id,
          name: env.name,
          description: env.description,
          parentEnvironment: env.parentEnvironment,
          promotionTargets: env.promotionTargets,
          templateReplacements: env.templateReplacements,
        })
        .run();
    }

    // Denormalize layer types
    for (const lt of data.layerTypes) {
      this.db
        .insert(schema.taxonomyLayerTypes)
        .values({
          id: `${id}:${lt.name}`,
          snapshotId: id,
          name: lt.name,
          description: lt.description,
          defaultLayerDir: lt.defaultLayerDir,
        })
        .run();
    }

    // Denormalize capabilities
    for (const cap of data.capabilities) {
      this.db
        .insert(schema.taxonomyCapabilities)
        .values({
          id: `${id}:${cap.name}`,
          snapshotId: id,
          name: cap.name,
          description: cap.description,
          categories: cap.categories,
          dependsOn: cap.dependsOn,
          parentCapability: cap.parentCapability ?? null,
          tag: cap.tag ?? null,
        })
        .run();
    }

    // Denormalize capability relationships
    for (const rel of data.capabilityRels) {
      this.db
        .insert(schema.taxonomyCapabilityRels)
        .values({
          id: `${id}:${rel.name}`,
          snapshotId: id,
          name: rel.name,
          node: rel.node,
          relationshipType: rel.relationshipType,
          capabilities: rel.capabilities,
        })
        .run();
    }

    // Denormalize actions
    for (const action of data.actions) {
      this.db
        .insert(schema.taxonomyActions)
        .values({
          id: `${id}:${action.name}`,
          snapshotId: id,
          name: action.name,
          actionType: action.actionType,
          layerType: action.layerType,
          tags: action.tags,
        })
        .run();
    }

    // Denormalize stages
    for (const stage of data.stages) {
      this.db
        .insert(schema.taxonomyStages)
        .values({
          id: `${id}:${stage.name}`,
          snapshotId: id,
          name: stage.name,
          description: stage.description,
          dependsOn: stage.dependsOn,
        })
        .run();
    }

    // Denormalize tools
    for (const tool of data.tools) {
      this.db
        .insert(schema.taxonomyTools)
        .values({
          id: `${id}:${tool.name}`,
          snapshotId: id,
          name: tool.name,
          description: tool.description,
          actions: tool.actions,
        })
        .run();
    }

    // Denormalize persons
    for (const person of data.persons) {
      this.db
        .insert(schema.taxonomyPersons)
        .values({
          id: `${id}:${person.name}`,
          snapshotId: id,
          name: person.name,
          displayName: person.displayName,
          email: person.email,
          role: person.role,
          avatarUrl: person.avatarUrl,
        })
        .run();
    }

    // Denormalize teams
    for (const team of data.teams) {
      this.db
        .insert(schema.taxonomyTeams)
        .values({
          id: `${id}:${team.name}`,
          snapshotId: id,
          name: team.name,
          displayName: team.displayName,
          teamType: team.teamType,
          description: team.description,
          focusArea: team.focusArea,
          communicationChannels: team.communicationChannels,
          ownedNodes: team.ownedNodes,
        })
        .run();
    }

    // Denormalize team memberships
    for (const m of data.teamMemberships) {
      this.db
        .insert(schema.taxonomyTeamMemberships)
        .values({
          id: `${id}:${m.teamName}:${m.personName}`,
          snapshotId: id,
          teamName: m.teamName,
          personName: m.personName,
          role: m.role,
        })
        .run();
    }

    return {
      id,
      project: data.project,
      version: data.version,
      generated,
      nodeCount: data.nodes.length,
      environmentCount: data.environments.length,
      pluginSummary,
      createdAt: now,
    };
  }

  async getLatestTaxonomySnapshot(): Promise<StoredTaxonomySnapshot | null> {
    const row = this.db
      .select()
      .from(schema.taxonomySnapshots)
      .orderBy(desc(schema.taxonomySnapshots.createdAt))
      .limit(1)
      .get();

    if (!row) return null;
    return this.toStoredTaxonomySnapshot(row);
  }

  async getLatestTaxonomySnapshotByProject(project: string): Promise<StoredTaxonomySnapshot | null> {
    const row = this.db
      .select()
      .from(schema.taxonomySnapshots)
      .where(eq(schema.taxonomySnapshots.project, project))
      .orderBy(desc(schema.taxonomySnapshots.createdAt))
      .limit(1)
      .get();

    if (!row) return null;
    return this.toStoredTaxonomySnapshot(row);
  }

  async getTaxonomySnapshotById(id: string): Promise<StoredTaxonomySnapshot | null> {
    const row = this.db
      .select()
      .from(schema.taxonomySnapshots)
      .where(eq(schema.taxonomySnapshots.id, id))
      .get();

    if (!row) return null;
    return this.toStoredTaxonomySnapshot(row);
  }

  async listTaxonomySnapshots(limit?: number): Promise<StoredTaxonomySnapshot[]> {
    const rows = this.db
      .select()
      .from(schema.taxonomySnapshots)
      .orderBy(desc(schema.taxonomySnapshots.createdAt))
      .limit(limit ?? 50)
      .all();

    return rows.map((row) => this.toStoredTaxonomySnapshot(row));
  }

  async deleteTaxonomySnapshot(id: string): Promise<boolean> {
    const existing = this.db
      .select({ id: schema.taxonomySnapshots.id })
      .from(schema.taxonomySnapshots)
      .where(eq(schema.taxonomySnapshots.id, id))
      .get();

    if (!existing) return false;

    this.db
      .delete(schema.taxonomySnapshots)
      .where(eq(schema.taxonomySnapshots.id, id))
      .run();
    return true;
  }

  async getNodes(nodeType?: string): Promise<TaxonomyNodeSummary[]> {
    const latest = await this.getLatestTaxonomySnapshot();
    if (!latest) return [];

    const rows = this.db
      .select()
      .from(schema.taxonomyNodes)
      .where(eq(schema.taxonomyNodes.snapshotId, latest.id))
      .all();

    const filtered = nodeType
      ? rows.filter((r) => r.nodeType === nodeType)
      : rows;

    return filtered.map((r) => ({
      name: r.name,
      nodeType: r.nodeType,
      fqtn: r.fqtn,
      description: r.description,
      parentNode: r.parentNode,
      owners: (r.owners as string[]) ?? [],
    }));
  }

  async getHierarchy(): Promise<TaxonomyHierarchy> {
    const latest = await this.getLatestTaxonomySnapshot();
    if (!latest) return { systems: [] };
    return this.getHierarchyBySnapshotId(latest.id);
  }

  private async getHierarchyBySnapshotId(snapshotId: string): Promise<TaxonomyHierarchy> {
    const rows = this.db
      .select()
      .from(schema.taxonomyNodes)
      .where(eq(schema.taxonomyNodes.snapshotId, snapshotId))
      .all();

    // Build parent-to-children map
    const nodeMap = new Map<
      string,
      TaxonomyHierarchyNode & { parentNode: string | null }
    >();
    for (const r of rows) {
      nodeMap.set(r.name, {
        name: r.name,
        nodeType: r.nodeType,
        fqtn: r.fqtn,
        description: r.description,
        children: [],
        parentNode: r.parentNode,
      });
    }

    // Assemble tree
    const systems: TaxonomyHierarchyNode[] = [];
    for (const node of nodeMap.values()) {
      if (node.parentNode && nodeMap.has(node.parentNode)) {
        nodeMap.get(node.parentNode)!.children.push(node);
      } else if (!node.parentNode) {
        systems.push(node);
      }
    }

    return { systems };
  }

  async getEnvironments(): Promise<TaxonomyEnvironmentSummary[]> {
    const latest = await this.getLatestTaxonomySnapshot();
    if (!latest) return [];

    const rows = this.db
      .select()
      .from(schema.taxonomyEnvironments)
      .where(eq(schema.taxonomyEnvironments.snapshotId, latest.id))
      .all();

    return rows.map((r) => ({
      name: r.name,
      description: r.description,
      parentEnvironment: r.parentEnvironment,
    }));
  }

  async getPluginSummary(): Promise<TaxonomyPluginSummary> {
    const latest = await this.getLatestTaxonomySnapshot();
    if (!latest) {
      return {
        layerTypes: 0,
        capabilities: 0,
        capabilityRels: 0,
        actions: 0,
        stages: 0,
        tools: 0,
        layerHealths: 0,
        teams: 0,
        persons: 0,
      };
    }

    return {
      layerTypes: this.db.select().from(schema.taxonomyLayerTypes).where(eq(schema.taxonomyLayerTypes.snapshotId, latest.id)).all().length,
      capabilities: this.db.select().from(schema.taxonomyCapabilities).where(eq(schema.taxonomyCapabilities.snapshotId, latest.id)).all().length,
      capabilityRels: this.db.select().from(schema.taxonomyCapabilityRels).where(eq(schema.taxonomyCapabilityRels.snapshotId, latest.id)).all().length,
      actions: this.db.select().from(schema.taxonomyActions).where(eq(schema.taxonomyActions.snapshotId, latest.id)).all().length,
      stages: this.db.select().from(schema.taxonomyStages).where(eq(schema.taxonomyStages.snapshotId, latest.id)).all().length,
      tools: this.db.select().from(schema.taxonomyTools).where(eq(schema.taxonomyTools.snapshotId, latest.id)).all().length,
      layerHealths: 0,
      teams: this.db.select().from(schema.taxonomyTeams).where(eq(schema.taxonomyTeams.snapshotId, latest.id)).all().length,
      persons: this.db.select().from(schema.taxonomyPersons).where(eq(schema.taxonomyPersons.snapshotId, latest.id)).all().length,
    };
  }

  async getCapabilitiesByNode(nodeName: string): Promise<string[]> {
    const latest = await this.getLatestTaxonomySnapshot();
    if (!latest) return [];

    const rels = this.db
      .select()
      .from(schema.taxonomyCapabilityRels)
      .where(eq(schema.taxonomyCapabilityRels.snapshotId, latest.id))
      .all();

    const matchingRels = rels.filter((r) => r.node === nodeName);
    const capNames = new Set<string>();
    for (const rel of matchingRels) {
      const caps = rel.capabilities ?? [];
      for (const cap of caps) {
        capNames.add(cap);
      }
    }

    return Array.from(capNames);
  }

  async getCapabilityTree(): Promise<CapabilityTree> {
    const latest = await this.getLatestTaxonomySnapshot();
    if (!latest) return { roots: [], byName: new Map() };
    return this.getCapabilityTreeBySnapshotId(latest.id);
  }

  async getCapabilityTreeBySnapshotId(snapshotId: string): Promise<CapabilityTree> {
    // Load all capabilities for this snapshot
    const rows = this.db
      .select()
      .from(schema.taxonomyCapabilities)
      .where(eq(schema.taxonomyCapabilities.snapshotId, snapshotId))
      .all();

    // Load all capability relationships for this snapshot to resolve node mappings
    const relRows = this.db
      .select()
      .from(schema.taxonomyCapabilityRels)
      .where(eq(schema.taxonomyCapabilityRels.snapshotId, snapshotId))
      .all();

    // Build a map: capability name → list of taxonomy nodes
    const capToNodes = new Map<string, string[]>();
    for (const rel of relRows) {
      for (const cap of (rel.capabilities ?? [])) {
        const existing = capToNodes.get(cap) ?? [];
        if (!existing.includes(rel.node)) existing.push(rel.node);
        capToNodes.set(cap, existing);
      }
    }

    // First pass: build flat map of CapabilityNode (children empty, no derivedStatus yet)
    const byName = new Map<string, CapabilityNode>();
    for (const row of rows) {
      const node: CapabilityNode = {
        name: row.name,
        description: row.description,
        tag: row.tag ?? null,
        declaredStatus: "stable", // taxonomy capabilities don't have explicit status — default stable
        derivedStatus: "stable",  // will be re-derived after tree assembly
        taxonomyNodes: capToNodes.get(row.name) ?? [],
        dependsOn: (row.dependsOn as string[]) ?? [],
        categories: (row.categories as string[]) ?? [],
        children: [],
      };
      byName.set(row.name, node);
    }

    // Second pass: link children to parents
    const roots: CapabilityNode[] = [];
    for (const row of rows) {
      const node = byName.get(row.name)!;
      const parentName = row.parentCapability ?? null;
      if (parentName && byName.has(parentName)) {
        byName.get(parentName)!.children.push(node);
      } else {
        // No parent or parent not found → treat as root
        roots.push(node);
      }
    }

    // Third pass: derive status bottom-up (worst-child-wins)
    // planned < stable < deprecated
    const deriveStatus = (node: CapabilityNode): CapabilityNode["derivedStatus"] => {
      if (node.children.length === 0) {
        node.derivedStatus = node.declaredStatus;
        return node.derivedStatus;
      }
      // Recurse children first
      const childStatuses = node.children.map((c) => deriveStatus(c));
      // Worst-child-wins: deprecated > planned > stable
      if (childStatuses.includes("deprecated")) {
        node.derivedStatus = "deprecated";
      } else if (childStatuses.includes("planned")) {
        node.derivedStatus = "planned";
      } else {
        node.derivedStatus = "stable";
      }
      return node.derivedStatus;
    };

    for (const root of roots) {
      deriveStatus(root);
    }

    return { roots, byName };
  }

  async getTeams(): Promise<TaxonomyTeamSummary[]> {
    const latest = await this.getLatestTaxonomySnapshot();
    if (!latest) return [];

    const teams = this.db
      .select()
      .from(schema.taxonomyTeams)
      .where(eq(schema.taxonomyTeams.snapshotId, latest.id))
      .all();

    const memberships = this.db
      .select()
      .from(schema.taxonomyTeamMemberships)
      .where(eq(schema.taxonomyTeamMemberships.snapshotId, latest.id))
      .all();

    // Count members per team
    const memberCounts = new Map<string, number>();
    for (const m of memberships) {
      memberCounts.set(m.teamName, (memberCounts.get(m.teamName) ?? 0) + 1);
    }

    return teams.map((t) => ({
      name: t.name,
      displayName: t.displayName,
      teamType: t.teamType,
      description: t.description,
      focusArea: t.focusArea,
      communicationChannels: (t.communicationChannels as string[]) ?? [],
      ownedNodes: (t.ownedNodes as string[]) ?? [],
      memberCount: memberCounts.get(t.name) ?? 0,
    }));
  }

  async getTeamByName(name: string): Promise<TaxonomyTeamDetail | null> {
    const latest = await this.getLatestTaxonomySnapshot();
    if (!latest) return null;

    const team = this.db
      .select()
      .from(schema.taxonomyTeams)
      .where(eq(schema.taxonomyTeams.snapshotId, latest.id))
      .all()
      .find((t) => t.name === name);

    if (!team) return null;

    // Get memberships for this team
    const memberships = this.db
      .select()
      .from(schema.taxonomyTeamMemberships)
      .where(eq(schema.taxonomyTeamMemberships.snapshotId, latest.id))
      .all()
      .filter((m) => m.teamName === name);

    // Get person details
    const persons = this.db
      .select()
      .from(schema.taxonomyPersons)
      .where(eq(schema.taxonomyPersons.snapshotId, latest.id))
      .all();
    const personMap = new Map(persons.map((p) => [p.name, p]));

    const members: TaxonomyTeamMemberSummary[] = memberships.map((m) => {
      const person = personMap.get(m.personName);
      return {
        personName: m.personName,
        displayName: person?.displayName ?? m.personName,
        email: person?.email ?? null,
        role: m.role,
      };
    });

    return {
      name: team.name,
      displayName: team.displayName,
      teamType: team.teamType,
      description: team.description,
      focusArea: team.focusArea,
      communicationChannels: (team.communicationChannels as string[]) ?? [],
      ownedNodes: (team.ownedNodes as string[]) ?? [],
      memberCount: members.length,
      members,
    };
  }

  async getPersons(): Promise<TaxonomyPersonSummary[]> {
    const latest = await this.getLatestTaxonomySnapshot();
    if (!latest) return [];

    const persons = this.db
      .select()
      .from(schema.taxonomyPersons)
      .where(eq(schema.taxonomyPersons.snapshotId, latest.id))
      .all();

    const memberships = this.db
      .select()
      .from(schema.taxonomyTeamMemberships)
      .where(eq(schema.taxonomyTeamMemberships.snapshotId, latest.id))
      .all();

    // Group memberships by person
    const personTeams = new Map<string, Array<{ team: string; role: string }>>();
    for (const m of memberships) {
      const teams = personTeams.get(m.personName) ?? [];
      teams.push({ team: m.teamName, role: m.role });
      personTeams.set(m.personName, teams);
    }

    return persons.map((p) => ({
      name: p.name,
      displayName: p.displayName,
      email: p.email,
      role: p.role,
      avatarUrl: p.avatarUrl,
      teams: personTeams.get(p.name) ?? [],
    }));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GOVERNANCE
  // ══════════════════════════════════════════════════════════════════════════

  async saveGovernanceSnapshot(data: GovernanceSnapshotInput): Promise<StoredGovernanceSnapshot> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const generated = data.generated ?? now;

    const stats = {
      capabilities:
        data.stats.capabilities ??
        data.stats.totalCapabilities ??
        Object.keys(data.capabilities).length,
      userTypes: data.stats.userTypes ?? data.stats.totalUserTypes ?? 0,
      userStories: data.stats.userStories ?? data.stats.totalStories ?? 0,
      roadItems:
        data.stats.roadItems ??
        data.stats.totalRoadItems ??
        Object.keys(data.roadItems).length,
      integrityStatus:
        data.stats.integrityStatus ??
        (data.stats.referentialIntegrity?.valid ? "pass" : "fail"),
      integrityErrors:
        data.stats.integrityErrors ??
        data.stats.referentialIntegrity?.errors?.length ??
        0,
    };

    // Insert snapshot
    this.db
      .insert(schema.governanceSnapshots)
      .values({
        id,
        project: data.project,
        version: data.version,
        generated,
        rawIndex: data as unknown as Record<string, unknown>,
        createdAt: now,
      })
      .run();

    // Denormalize capabilities (expanded with full fields)
    const byCapability = data.byCapability ?? {};
    for (const [capId, cap] of Object.entries(data.capabilities)) {
      const capData = byCapability[capId];
      const capFull = cap as Record<string, unknown>;
      this.db
        .insert(schema.governanceCapabilities)
        .values({
          id: `${id}:${capId}`,
          snapshotId: id,
          capabilityId: capId,
          title: cap.title ?? capId,
          status: cap.status ?? "unknown",
          description: capFull.description ?? null,
          category: capFull.category ?? null,
          parentCapability: capFull.parent_capability ?? capFull.parentCapability ?? null,
          dependsOn: capFull.depends_on ?? capFull.dependsOn ?? [],
          roadCount: capData?.roads?.length ?? 0,
          storyCount: capData?.stories?.length ?? 0,
          taxonomyNode: capFull.taxonomy_node ?? capFull.taxonomyNode ?? null,
        })
        .run();
    }

    // Denormalize road items
    for (const [roadId, road] of Object.entries(data.roadItems)) {
      this.db
        .insert(schema.governanceRoadItems)
        .values({
          id: `${id}:${roadId}`,
          snapshotId: id,
          roadId,
          title: road.title ?? roadId,
          status: road.status ?? "proposed",
          phase: road.phase ?? 0,
          priority: road.priority ?? "medium",
        })
        .run();
    }

    // Denormalize bounded contexts if present
    const contexts = data.boundedContexts ?? {};
    const byContext = data.byContext ?? {};
    for (const [slug, ctx] of Object.entries(contexts)) {
      const ctxData = byContext[slug];
      this.db
        .insert(schema.governanceContexts)
        .values({
          id: `${id}:${slug}`,
          snapshotId: id,
          slug,
          title: ctx.title ?? slug,
          aggregateCount: ctxData?.aggregates?.length ?? 0,
          eventCount: ctxData?.events?.length ?? 0,
        })
        .run();
    }

    // Denormalize user types if present
    const userTypes = data.userTypes ?? {};
    const byUserType = data.byUserType ?? {};
    for (const [utId, userType] of Object.entries(userTypes as Record<string, Record<string, unknown>>)) {
      const userTypeData = byUserType[utId];
      this.db
        .insert(schema.governanceUserTypes)
        .values({
          id: `${id}:${utId}`,
          snapshotId: id,
          userTypeId: utId,
          name: userType.name ?? utId,
          type: userType.type ?? "human",
          status: userType.status ?? "draft",
          archetype: userType.archetype ?? "consumer",
          description: userType.description ?? null,
          goals: userType.goals ?? [],
          painPoints: userType.pain_points ?? userType.painPoints ?? [],
          behaviors: userType.behaviors ?? [],
          typicalCapabilities: userType.typical_capabilities ?? userType.typicalCapabilities ?? [],
          technicalProfile: userType.technical_profile ?? userType.technicalProfile ?? null,
          relatedStories: userType.related_stories ?? userType.relatedStories ?? [],
          relatedUserTypes: userType.related_user_types ?? userType.relatedUserTypes ?? [],
          storyCount: userTypeData?.stories?.length ?? 0,
          capabilityCount: userTypeData?.capabilities?.length ?? 0,
        })
        .run();
    }

    // Denormalize user stories if present
    const userStories = data.userStories ?? {};
    for (const [storyId, story] of Object.entries(userStories as Record<string, Record<string, unknown>>)) {
      if (typeof story !== "object" || !story) continue;
      this.db
        .insert(schema.governanceUserStories)
        .values({
          id: `${id}:${storyId}`,
          snapshotId: id,
          storyId,
          title: story.title ?? storyId,
          userType: story.userType ?? "",
          status: story.status ?? "draft",
          capabilities: story.capabilities ?? [],
          useCases: story.use_cases ?? story.useCases ?? [],
          acceptanceCriteria: story.acceptance_criteria ?? story.acceptanceCriteria ?? [],
          taxonomyNode: story.taxonomy_node ?? story.taxonomyNode ?? null,
        })
        .run();
    }

    return {
      id,
      project: data.project,
      version: data.version,
      generated,
      createdAt: now,
      stats,
    };
  }

  async getLatestGovernanceSnapshot(): Promise<StoredGovernanceSnapshot | null> {
    const row = this.db
      .select()
      .from(schema.governanceSnapshots)
      .orderBy(desc(schema.governanceSnapshots.createdAt))
      .limit(1)
      .get();

    if (!row) return null;
    return this.toStoredGovernanceSnapshot(row);
  }

  async getLatestGovernanceSnapshotByProject(project: string): Promise<StoredGovernanceSnapshot | null> {
    const row = this.db
      .select()
      .from(schema.governanceSnapshots)
      .where(eq(schema.governanceSnapshots.project, project))
      .orderBy(desc(schema.governanceSnapshots.createdAt))
      .limit(1)
      .get();

    if (!row) return null;
    return this.toStoredGovernanceSnapshot(row);
  }

  async getGovernanceSnapshotById(id: string): Promise<StoredGovernanceSnapshot | null> {
    const row = this.db
      .select()
      .from(schema.governanceSnapshots)
      .where(eq(schema.governanceSnapshots.id, id))
      .get();

    if (!row) return null;
    return this.toStoredGovernanceSnapshot(row);
  }

  async listGovernanceSnapshots(limit?: number): Promise<StoredGovernanceSnapshot[]> {
    const rows = this.db
      .select()
      .from(schema.governanceSnapshots)
      .orderBy(desc(schema.governanceSnapshots.createdAt))
      .limit(limit ?? 50)
      .all();

    return rows.map((row) => this.toStoredGovernanceSnapshot(row));
  }

  async deleteGovernanceSnapshot(id: string): Promise<boolean> {
    const existing = this.db
      .select({ id: schema.governanceSnapshots.id })
      .from(schema.governanceSnapshots)
      .where(eq(schema.governanceSnapshots.id, id))
      .get();

    if (!existing) return false;

    this.db
      .delete(schema.governanceSnapshots)
      .where(eq(schema.governanceSnapshots.id, id))
      .run();
    return true;
  }

  async getCapabilityCoverage(): Promise<CapabilityCoverage[]> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return [];

    const rows = this.db
      .select()
      .from(schema.governanceCapabilities)
      .where(eq(schema.governanceCapabilities.snapshotId, latest.id))
      .all();

    return rows.map((r) => ({
      id: r.id.replace(`${latest.id}:`, ""),
      title: r.title,
      status: r.status,
      roadCount: r.roadCount,
      storyCount: r.storyCount,
    }));
  }

  async getUserTypeCoverage(): Promise<UserTypeCoverage[]> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return [];

    const rows = this.db
      .select()
      .from(schema.governanceUserTypes)
      .where(eq(schema.governanceUserTypes.snapshotId, latest.id))
      .all();

    // Fall back to raw_index if no denormalized user types (older snapshots)
    if (rows.length === 0) {
      const raw = await this.governanceGetRawIndex(latest.id);
      if (!raw) return [];
      const rawUserTypes = raw.userTypes ?? {};
      const rawByUserType = raw.byUserType ?? {};
      return Object.entries(rawUserTypes as Record<string, Record<string, unknown>>).map(([utId, userType]) => {
        const userTypeData = rawByUserType[utId];
        return {
          id: utId,
          name: String(userType.name ?? utId),
          type: String(userType.type ?? "human"),
          storyCount: userTypeData?.stories?.length ?? 0,
          capabilityCount: userTypeData?.capabilities?.length ?? 0,
        };
      });
    }

    return rows.map((r) => ({
      id: r.userTypeId,
      name: r.name,
      type: r.type,
      storyCount: r.storyCount,
      capabilityCount: r.capabilityCount,
    }));
  }

  async getRoadItems(statusFilter?: string): Promise<RoadItemSummary[]> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return [];

    let query = this.db
      .select()
      .from(schema.governanceRoadItems)
      .where(eq(schema.governanceRoadItems.snapshotId, latest.id));

    const rows = query.all();

    const filtered = statusFilter
      ? rows.filter((r) => r.status === statusFilter)
      : rows;

    return filtered.map((r) => ({
      id: r.roadId,
      title: r.title,
      status: r.status,
      phase: r.phase,
      priority: r.priority as RoadItemSummary["priority"],
    }));
  }

  async getIntegrity(): Promise<IntegrityReport> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) {
      return {
        valid: true,
        errors: [],
        totalArtifacts: 0,
        checkedAt: new Date().toISOString(),
      };
    }

    const raw = await this.governanceGetRawIndex(latest.id);
    if (!raw) {
      return {
        valid: true,
        errors: [],
        totalArtifacts: 0,
        checkedAt: latest.generated,
      };
    }

    const statsObj = raw.stats;
    const integrity = statsObj?.referentialIntegrity;

    // Count total artifacts from stats
    const totalArtifacts =
      (statsObj?.totalCapabilities ?? statsObj?.capabilities ?? 0) +
      (statsObj?.totalUserTypes ?? statsObj?.userTypes ?? 0) +
      (statsObj?.totalStories ?? statsObj?.userStories ?? 0) +
      (statsObj?.totalRoadItems ?? statsObj?.roadItems ?? 0);

    return {
      valid: integrity?.valid ?? latest.stats.integrityStatus === "pass",
      errors: integrity?.errors ?? [],
      totalArtifacts,
      checkedAt: latest.generated,
    };
  }

  async getTrends(limit?: number): Promise<TrendPoint[]> {
    const snapshots = this.db
      .select()
      .from(schema.governanceSnapshots)
      .orderBy(desc(schema.governanceSnapshots.createdAt))
      .limit(limit ?? 50)
      .all();

    return snapshots.map((snap) => {
      const raw = snap.rawIndex as unknown as ValidatedSnapshotData;
      const statsObj = raw?.stats;

      // Count completed roads from denormalized table
      const roadRows = this.db
        .select()
        .from(schema.governanceRoadItems)
        .where(eq(schema.governanceRoadItems.snapshotId, snap.id))
        .all();

      const completedRoads = roadRows.filter(
        (r) => r.status === "complete",
      ).length;

      const capCount = this.db
        .select()
        .from(schema.governanceCapabilities)
        .where(eq(schema.governanceCapabilities.snapshotId, snap.id))
        .all().length;

      return {
        snapshotId: snap.id,
        generated: snap.generated,
        totalCapabilities: capCount,
        totalRoadItems: roadRows.length,
        integrityStatus:
          statsObj?.integrityStatus ??
          (statsObj?.referentialIntegrity?.valid ? "pass" : "fail"),
        completedRoads,
      };
    });
  }

  // ── Governance Capability CRUD ────────────────────────────────────────────

  async listGovernanceCapabilities(): Promise<StoredCapability[]> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return [];
    const rows = this.db
      .select()
      .from(schema.governanceCapabilities)
      .where(eq(schema.governanceCapabilities.snapshotId, latest.id))
      .all();
    return rows.map((r) => this.rowToCapability(r, latest.id));
  }

  async getGovernanceCapabilityById(id: string): Promise<StoredCapability | null> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return null;
    const row = this.db
      .select()
      .from(schema.governanceCapabilities)
      .where(eq(schema.governanceCapabilities.id, `${latest.id}:${id}`))
      .get();
    if (!row) return null;
    return this.rowToCapability(row, latest.id);
  }

  async createGovernanceCapability(data: Omit<StoredCapability, 'roadCount' | 'storyCount'>): Promise<StoredCapability> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) throw new Error("No governance snapshot exists. Ingest a snapshot first.");
    this.db.insert(schema.governanceCapabilities).values({
      id: `${latest.id}:${data.id}`,
      snapshotId: latest.id,
      capabilityId: data.id,
      title: data.title,
      status: data.status,
      description: data.description ?? null,
      category: data.category ?? null,
      parentCapability: data.parentCapability ?? null,
      dependsOn: data.dependsOn ?? [],
      roadCount: 0,
      storyCount: 0,
      taxonomyNode: data.taxonomyNode ?? null,
    }).run();
    return { ...data, roadCount: 0, storyCount: 0 };
  }

  async updateGovernanceCapability(id: string, data: Partial<Omit<StoredCapability, 'id' | 'roadCount' | 'storyCount'>>): Promise<StoredCapability | null> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return null;
    const compositeId = `${latest.id}:${id}`;
    const existing = this.db.select().from(schema.governanceCapabilities).where(eq(schema.governanceCapabilities.id, compositeId)).get();
    if (!existing) return null;
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.parentCapability !== undefined) updateData.parentCapability = data.parentCapability;
    if (data.dependsOn !== undefined) updateData.dependsOn = data.dependsOn;
    if (data.taxonomyNode !== undefined) updateData.taxonomyNode = data.taxonomyNode;
    this.db.update(schema.governanceCapabilities).set(updateData).where(eq(schema.governanceCapabilities.id, compositeId)).run();
    const updated = this.db.select().from(schema.governanceCapabilities).where(eq(schema.governanceCapabilities.id, compositeId)).get();
    if (!updated) return null;
    return this.rowToCapability(updated, latest.id);
  }

  async deleteGovernanceCapability(id: string): Promise<boolean> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return false;
    const compositeId = `${latest.id}:${id}`;
    const existing = this.db.select({ id: schema.governanceCapabilities.id }).from(schema.governanceCapabilities).where(eq(schema.governanceCapabilities.id, compositeId)).get();
    if (!existing) return false;
    this.db.delete(schema.governanceCapabilities).where(eq(schema.governanceCapabilities.id, compositeId)).run();
    return true;
  }

  // ── Governance User Type CRUD ───────────────────────────────────────────────

  async listUserTypes(): Promise<StoredUserType[]> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return [];
    const rows = this.db.select().from(schema.governanceUserTypes).where(eq(schema.governanceUserTypes.snapshotId, latest.id)).all();
    return rows.map((r) => this.rowToUserType(r, latest.id));
  }

  async getUserTypeById(id: string): Promise<StoredUserType | null> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return null;
    const row = this.db.select().from(schema.governanceUserTypes).where(eq(schema.governanceUserTypes.id, `${latest.id}:${id}`)).get();
    if (!row) return null;
    return this.rowToUserType(row, latest.id);
  }

  async createUserType(data: Omit<StoredUserType, 'storyCount' | 'capabilityCount'>): Promise<StoredUserType> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) throw new Error("No governance snapshot exists. Ingest a snapshot first.");
    this.db.insert(schema.governanceUserTypes).values({
      id: `${latest.id}:${data.id}`,
      snapshotId: latest.id,
      userTypeId: data.id,
      name: data.name,
      type: data.type,
      status: data.status,
      archetype: data.archetype,
      description: data.description ?? null,
      goals: data.goals ?? [],
      painPoints: data.painPoints ?? [],
      behaviors: data.behaviors ?? [],
      typicalCapabilities: data.typicalCapabilities ?? [],
      technicalProfile: data.technicalProfile ?? null,
      relatedStories: data.relatedStories ?? [],
      relatedUserTypes: data.relatedUserTypes ?? [],
      storyCount: 0,
      capabilityCount: 0,
    }).run();
    return { ...data, storyCount: 0, capabilityCount: 0 };
  }

  async updateUserType(id: string, data: Partial<Omit<StoredUserType, 'id' | 'storyCount' | 'capabilityCount'>>): Promise<StoredUserType | null> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return null;
    const compositeId = `${latest.id}:${id}`;
    const existing = this.db.select().from(schema.governanceUserTypes).where(eq(schema.governanceUserTypes.id, compositeId)).get();
    if (!existing) return null;
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.archetype !== undefined) updateData.archetype = data.archetype;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.goals !== undefined) updateData.goals = data.goals;
    if (data.painPoints !== undefined) updateData.painPoints = data.painPoints;
    if (data.behaviors !== undefined) updateData.behaviors = data.behaviors;
    if (data.typicalCapabilities !== undefined) updateData.typicalCapabilities = data.typicalCapabilities;
    if (data.technicalProfile !== undefined) updateData.technicalProfile = data.technicalProfile;
    if (data.relatedStories !== undefined) updateData.relatedStories = data.relatedStories;
    if (data.relatedUserTypes !== undefined) updateData.relatedUserTypes = data.relatedUserTypes;
    this.db.update(schema.governanceUserTypes).set(updateData).where(eq(schema.governanceUserTypes.id, compositeId)).run();
    const updated = this.db.select().from(schema.governanceUserTypes).where(eq(schema.governanceUserTypes.id, compositeId)).get();
    if (!updated) return null;
    return this.rowToUserType(updated, latest.id);
  }

  async deleteUserType(id: string): Promise<boolean> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return false;
    const compositeId = `${latest.id}:${id}`;
    const existing = this.db.select({ id: schema.governanceUserTypes.id }).from(schema.governanceUserTypes).where(eq(schema.governanceUserTypes.id, compositeId)).get();
    if (!existing) return false;
    this.db.delete(schema.governanceUserTypes).where(eq(schema.governanceUserTypes.id, compositeId)).run();
    return true;
  }

  // ── Governance User Story CRUD ────────────────────────────────────────────

  async listUserStories(): Promise<StoredUserStory[]> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return [];
    const rows = this.db.select().from(schema.governanceUserStories).where(eq(schema.governanceUserStories.snapshotId, latest.id)).all();
    return rows.map((r) => this.rowToUserStory(r, latest.id));
  }

  async getUserStoryById(id: string): Promise<StoredUserStory | null> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return null;
    const row = this.db.select().from(schema.governanceUserStories).where(eq(schema.governanceUserStories.id, `${latest.id}:${id}`)).get();
    if (!row) return null;
    return this.rowToUserStory(row, latest.id);
  }

  async createUserStory(data: StoredUserStory): Promise<StoredUserStory> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) throw new Error("No governance snapshot exists. Ingest a snapshot first.");
    this.db.insert(schema.governanceUserStories).values({
      id: `${latest.id}:${data.id}`,
      snapshotId: latest.id,
      storyId: data.id,
      title: data.title,
      userType: data.userType,
      status: data.status,
      capabilities: data.capabilities ?? [],
      useCases: data.useCases ?? [],
      acceptanceCriteria: data.acceptanceCriteria ?? [],
      taxonomyNode: data.taxonomyNode ?? null,
    }).run();
    return data;
  }

  async updateUserStory(id: string, data: Partial<Omit<StoredUserStory, 'id'>>): Promise<StoredUserStory | null> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return null;
    const compositeId = `${latest.id}:${id}`;
    const existing = this.db.select().from(schema.governanceUserStories).where(eq(schema.governanceUserStories.id, compositeId)).get();
    if (!existing) return null;
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.userType !== undefined) updateData.userType = data.userType;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.capabilities !== undefined) updateData.capabilities = data.capabilities;
    if (data.useCases !== undefined) updateData.useCases = data.useCases;
    if (data.acceptanceCriteria !== undefined) updateData.acceptanceCriteria = data.acceptanceCriteria;
    if (data.taxonomyNode !== undefined) updateData.taxonomyNode = data.taxonomyNode;
    this.db.update(schema.governanceUserStories).set(updateData).where(eq(schema.governanceUserStories.id, compositeId)).run();
    const updated = this.db.select().from(schema.governanceUserStories).where(eq(schema.governanceUserStories.id, compositeId)).get();
    if (!updated) return null;
    return this.rowToUserStory(updated, latest.id);
  }

  async deleteUserStory(id: string): Promise<boolean> {
    const latest = await this.getLatestGovernanceSnapshot();
    if (!latest) return false;
    const compositeId = `${latest.id}:${id}`;
    const existing = this.db.select({ id: schema.governanceUserStories.id }).from(schema.governanceUserStories).where(eq(schema.governanceUserStories.id, compositeId)).get();
    if (!existing) return false;
    this.db.delete(schema.governanceUserStories).where(eq(schema.governanceUserStories.id, compositeId)).run();
    return true;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DOMAIN MODELS
  // ══════════════════════════════════════════════════════════════════════════

  async createDomainModel(input: CreateDomainModelInput): Promise<StoredDomainModel> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    this.db
      .insert(schema.domainModels)
      .values({
        id,
        name: input.name,
        description: input.description ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    return { id, name: input.name, description: input.description ?? null, createdAt: now, updatedAt: now };
  }

  async updateDomainModel(id: string, input: UpdateDomainModelInput): Promise<void> {
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { updatedAt: now };
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    this.db
      .update(schema.domainModels)
      .set(updates)
      .where(eq(schema.domainModels.id, id))
      .run();
  }

  async listDomainModels(): Promise<StoredDomainModel[]> {
    return this.db.select().from(schema.domainModels).orderBy(desc(schema.domainModels.createdAt)).all();
  }

  async getDomainModelById(id: string): Promise<DomainModelWithArtifacts | null> {
    const model = this.db
      .select()
      .from(schema.domainModels)
      .where(eq(schema.domainModels.id, id))
      .get();
    if (!model) return null;

    const contexts = this.db
      .select()
      .from(schema.boundedContexts)
      .where(eq(schema.boundedContexts.domainModelId, id))
      .all();
    const aggs = this.db
      .select()
      .from(schema.aggregates)
      .where(eq(schema.aggregates.domainModelId, id))
      .all();
    const vos = this.db
      .select()
      .from(schema.valueObjects)
      .where(eq(schema.valueObjects.domainModelId, id))
      .all();
    const events = this.db
      .select()
      .from(schema.domainEvents)
      .where(eq(schema.domainEvents.domainModelId, id))
      .all();
    const glossary = this.db
      .select()
      .from(schema.glossaryTerms)
      .where(eq(schema.glossaryTerms.domainModelId, id))
      .all();
    const workflows = this.db
      .select()
      .from(schema.domainWorkflows)
      .where(eq(schema.domainWorkflows.domainModelId, id))
      .all();

    return {
      ...model,
      boundedContexts: contexts as StoredBoundedContext[],
      aggregates: aggs as StoredAggregate[],
      valueObjects: vos as StoredValueObject[],
      domainEvents: events as StoredDomainEvent[],
      glossaryTerms: glossary as StoredGlossaryTerm[],
      workflows: workflows as StoredWorkflow[],
    };
  }

  async deleteDomainModel(id: string): Promise<boolean> {
    const existing = this.db
      .select({ id: schema.domainModels.id })
      .from(schema.domainModels)
      .where(eq(schema.domainModels.id, id))
      .get();
    if (!existing) return false;

    this.db
      .delete(schema.domainModels)
      .where(eq(schema.domainModels.id, id))
      .run();
    return true;
  }

  async domainModelExists(id: string): Promise<boolean> {
    const row = this.db
      .select({ id: schema.domainModels.id })
      .from(schema.domainModels)
      .where(eq(schema.domainModels.id, id))
      .get();
    return !!row;
  }

  // ── Bounded Contexts ────────────────────────────────────────────────────────

  async addBoundedContext(
    modelId: string,
    input: CreateBoundedContextInput,
  ): Promise<StoredBoundedContext> {
    const now = new Date().toISOString();
    const ctxId = crypto.randomUUID();
    const values = {
      id: ctxId,
      domainModelId: modelId,
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      responsibility: input.responsibility,
      sourceDirectory: input.sourceDirectory ?? null,
      teamOwnership: input.teamOwnership ?? null,
      ownerTeam: input.ownerTeam ?? null,
      status: input.status ?? "draft",
      subdomainType: input.subdomainType ?? null,
      contextType: input.contextType ?? "internal",
      taxonomyNode: input.taxonomyNode ?? null,
      relationships: input.relationships ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(schema.boundedContexts).values(values).run();
    return values as StoredBoundedContext;
  }

  async updateBoundedContext(
    ctxId: string,
    input: UpdateBoundedContextInput,
  ): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(schema.boundedContexts)
      .set({
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        responsibility: input.responsibility,
        sourceDirectory: input.sourceDirectory ?? null,
        teamOwnership: input.teamOwnership ?? null,
        ownerTeam: input.ownerTeam ?? null,
        status: input.status ?? "draft",
        subdomainType: input.subdomainType ?? null,
        contextType: input.contextType ?? "internal",
        taxonomyNode: input.taxonomyNode ?? null,
        relationships: input.relationships ?? [],
        updatedAt: now,
      })
      .where(eq(schema.boundedContexts.id, ctxId))
      .run();
  }

  async deleteBoundedContext(ctxId: string): Promise<void> {
    this.db
      .delete(schema.boundedContexts)
      .where(eq(schema.boundedContexts.id, ctxId))
      .run();
  }

  // ── Aggregates ──────────────────────────────────────────────────────────────

  async addAggregate(
    modelId: string,
    input: CreateAggregateInput,
  ): Promise<StoredAggregate> {
    const now = new Date().toISOString();
    const aggId = crypto.randomUUID();
    const values = {
      id: aggId,
      domainModelId: modelId,
      contextId: input.contextId,
      slug: input.slug,
      title: input.title,
      rootEntity: input.rootEntity,
      entities: input.entities ?? [],
      valueObjects: input.valueObjects ?? [],
      events: input.events ?? [],
      commands: input.commands ?? [],
      invariants: input.invariants ?? [],
      sourceFile: input.sourceFile ?? null,
      status: input.status ?? "draft",
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(schema.aggregates).values(values).run();
    return values as StoredAggregate;
  }

  async updateAggregate(
    aggId: string,
    input: UpdateAggregateInput,
  ): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(schema.aggregates)
      .set({
        slug: input.slug,
        title: input.title,
        rootEntity: input.rootEntity,
        entities: input.entities ?? [],
        valueObjects: input.valueObjects ?? [],
        events: input.events ?? [],
        commands: input.commands ?? [],
        invariants: input.invariants ?? [],
        sourceFile: input.sourceFile ?? null,
        status: input.status ?? "draft",
        updatedAt: now,
      })
      .where(eq(schema.aggregates.id, aggId))
      .run();
  }

  async deleteAggregate(aggId: string): Promise<void> {
    this.db
      .delete(schema.aggregates)
      .where(eq(schema.aggregates.id, aggId))
      .run();
  }

  // ── Domain Events ───────────────────────────────────────────────────────────

  async addDomainEvent(
    modelId: string,
    input: CreateDomainEventInput,
  ): Promise<StoredDomainEvent> {
    const now = new Date().toISOString();
    const eventId = crypto.randomUUID();
    const values = {
      id: eventId,
      domainModelId: modelId,
      contextId: input.contextId,
      aggregateId: input.aggregateId ?? null,
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      payload: input.payload ?? [],
      consumedBy: input.consumedBy ?? [],
      triggers: input.triggers ?? [],
      sideEffects: input.sideEffects ?? [],
      sourceFile: input.sourceFile ?? null,
      sourceCapabilityId: input.sourceCapabilityId ?? null,
      targetCapabilityIds: input.targetCapabilityIds ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(schema.domainEvents).values(values).run();
    return values as StoredDomainEvent;
  }

  async updateDomainEvent(
    eventId: string,
    input: UpdateDomainEventInput,
  ): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(schema.domainEvents)
      .set({
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        payload: input.payload ?? [],
        consumedBy: input.consumedBy ?? [],
        triggers: input.triggers ?? [],
        sideEffects: input.sideEffects ?? [],
        sourceFile: input.sourceFile ?? null,
        sourceCapabilityId: input.sourceCapabilityId ?? null,
        targetCapabilityIds: input.targetCapabilityIds ?? [],
        updatedAt: now,
      })
      .where(eq(schema.domainEvents.id, eventId))
      .run();
  }

  async deleteDomainEvent(eventId: string): Promise<void> {
    this.db
      .delete(schema.domainEvents)
      .where(eq(schema.domainEvents.id, eventId))
      .run();
  }

  // ── Value Objects ───────────────────────────────────────────────────────────

  async addValueObject(
    modelId: string,
    input: CreateValueObjectInput,
  ): Promise<StoredValueObject> {
    const now = new Date().toISOString();
    const voId = crypto.randomUUID();
    const values = {
      id: voId,
      domainModelId: modelId,
      contextId: input.contextId,
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      properties: input.properties ?? [],
      validationRules: input.validationRules ?? [],
      immutable: input.immutable ?? true,
      sourceFile: input.sourceFile ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(schema.valueObjects).values(values).run();
    return values as StoredValueObject;
  }

  async updateValueObject(
    voId: string,
    input: UpdateValueObjectInput,
  ): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(schema.valueObjects)
      .set({
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        properties: input.properties ?? [],
        validationRules: input.validationRules ?? [],
        immutable: input.immutable ?? true,
        sourceFile: input.sourceFile ?? null,
        updatedAt: now,
      })
      .where(eq(schema.valueObjects.id, voId))
      .run();
  }

  async deleteValueObject(voId: string): Promise<void> {
    this.db
      .delete(schema.valueObjects)
      .where(eq(schema.valueObjects.id, voId))
      .run();
  }

  // ── Glossary ────────────────────────────────────────────────────────────────

  async addGlossaryTerm(
    modelId: string,
    input: CreateGlossaryTermInput,
  ): Promise<StoredGlossaryTerm> {
    const now = new Date().toISOString();
    const termId = crypto.randomUUID();
    const values = {
      id: termId,
      domainModelId: modelId,
      contextId: input.contextId ?? null,
      term: input.term,
      definition: input.definition,
      aliases: input.aliases ?? [],
      examples: input.examples ?? [],
      relatedTerms: input.relatedTerms ?? [],
      source: input.source ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(schema.glossaryTerms).values(values).run();
    return values as StoredGlossaryTerm;
  }

  async updateGlossaryTerm(
    termId: string,
    input: UpdateGlossaryTermInput,
  ): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(schema.glossaryTerms)
      .set({
        contextId: input.contextId ?? null,
        term: input.term,
        definition: input.definition,
        aliases: input.aliases ?? [],
        examples: input.examples ?? [],
        relatedTerms: input.relatedTerms ?? [],
        source: input.source ?? null,
        updatedAt: now,
      })
      .where(eq(schema.glossaryTerms.id, termId))
      .run();
  }

  async listGlossaryTerms(modelId: string): Promise<StoredGlossaryTerm[]> {
    return this.db
      .select()
      .from(schema.glossaryTerms)
      .where(eq(schema.glossaryTerms.domainModelId, modelId))
      .all() as StoredGlossaryTerm[];
  }

  async deleteGlossaryTerm(termId: string): Promise<void> {
    this.db
      .delete(schema.glossaryTerms)
      .where(eq(schema.glossaryTerms.id, termId))
      .run();
  }

  // ── Workflows ───────────────────────────────────────────────────────────────

  async addWorkflow(
    modelId: string,
    input: CreateWorkflowInput,
  ): Promise<StoredWorkflow> {
    const now = new Date().toISOString();
    const wfId = crypto.randomUUID();
    const values = {
      id: wfId,
      domainModelId: modelId,
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      contextIds: input.contextIds ?? [],
      states: input.states ?? [],
      transitions: input.transitions ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(schema.domainWorkflows).values(values).run();
    return values as StoredWorkflow;
  }

  async updateWorkflow(
    wfId: string,
    input: UpdateWorkflowInput,
  ): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(schema.domainWorkflows)
      .set({
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        contextIds: input.contextIds ?? [],
        states: input.states ?? [],
        transitions: input.transitions ?? [],
        updatedAt: now,
      })
      .where(eq(schema.domainWorkflows.id, wfId))
      .run();
  }

  async listWorkflows(modelId: string): Promise<StoredWorkflow[]> {
    return this.db
      .select()
      .from(schema.domainWorkflows)
      .where(eq(schema.domainWorkflows.domainModelId, modelId))
      .all() as StoredWorkflow[];
  }

  async deleteWorkflow(wfId: string): Promise<void> {
    this.db
      .delete(schema.domainWorkflows)
      .where(eq(schema.domainWorkflows.id, wfId))
      .run();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Taxonomy snapshot helpers ─────────────────────────────────────────────

  private toStoredTaxonomySnapshot(row: {
    id: string;
    project: string;
    version: string;
    generated: string;
    nodeCount: number;
    environmentCount: number;
    createdAt: string;
  }): StoredTaxonomySnapshot {
    return {
      id: row.id,
      project: row.project,
      version: row.version,
      generated: row.generated,
      nodeCount: row.nodeCount,
      environmentCount: row.environmentCount,
      pluginSummary: {
        layerTypes: this.db.select().from(schema.taxonomyLayerTypes).where(eq(schema.taxonomyLayerTypes.snapshotId, row.id)).all().length,
        capabilities: this.db.select().from(schema.taxonomyCapabilities).where(eq(schema.taxonomyCapabilities.snapshotId, row.id)).all().length,
        capabilityRels: this.db.select().from(schema.taxonomyCapabilityRels).where(eq(schema.taxonomyCapabilityRels.snapshotId, row.id)).all().length,
        actions: this.db.select().from(schema.taxonomyActions).where(eq(schema.taxonomyActions.snapshotId, row.id)).all().length,
        stages: this.db.select().from(schema.taxonomyStages).where(eq(schema.taxonomyStages.snapshotId, row.id)).all().length,
        tools: this.db.select().from(schema.taxonomyTools).where(eq(schema.taxonomyTools.snapshotId, row.id)).all().length,
        layerHealths: 0,
        teams: this.db.select().from(schema.taxonomyTeams).where(eq(schema.taxonomyTeams.snapshotId, row.id)).all().length,
        persons: this.db.select().from(schema.taxonomyPersons).where(eq(schema.taxonomyPersons.snapshotId, row.id)).all().length,
      },
      createdAt: row.createdAt,
    };
  }

  // ── Governance snapshot helpers ───────────────────────────────────────────

  private rowToCapability(row: typeof schema.governanceCapabilities.$inferSelect, snapshotId: string): StoredCapability {
    return {
      id: row.capabilityId ?? row.id.replace(`${snapshotId}:`, ""),
      title: row.title,
      status: row.status as StoredCapability["status"],
      description: row.description ?? null,
      category: row.category as StoredCapability["category"] ?? null,
      parentCapability: row.parentCapability ?? null,
      dependsOn: (row.dependsOn as string[]) ?? [],
      roadCount: row.roadCount,
      storyCount: row.storyCount,
      taxonomyNode: row.taxonomyNode ?? null,
    };
  }

  private rowToUserType(row: typeof schema.governanceUserTypes.$inferSelect, _snapshotId: string): StoredUserType {
    return {
      id: row.userTypeId,
      name: row.name,
      type: row.type as StoredUserType["type"],
      status: row.status as StoredUserType["status"],
      archetype: row.archetype as StoredUserType["archetype"],
      description: row.description ?? null,
      goals: (row.goals as string[]) ?? [],
      painPoints: (row.painPoints as string[]) ?? [],
      behaviors: (row.behaviors as string[]) ?? [],
      typicalCapabilities: (row.typicalCapabilities as string[]) ?? [],
      technicalProfile: row.technicalProfile as StoredUserType['technicalProfile'] ?? null,
      relatedStories: (row.relatedStories as string[]) ?? [],
      relatedUserTypes: (row.relatedUserTypes as string[]) ?? [],
      storyCount: row.storyCount,
      capabilityCount: row.capabilityCount,
    };
  }

  private rowToUserStory(row: typeof schema.governanceUserStories.$inferSelect, _snapshotId: string): StoredUserStory {
    return {
      id: row.storyId,
      title: row.title,
      userType: row.userType,
      status: row.status as StoredUserStory["status"],
      capabilities: (row.capabilities as string[]) ?? [],
      useCases: (row.useCases as string[]) ?? [],
      acceptanceCriteria: (row.acceptanceCriteria as string[]) ?? [],
      taxonomyNode: row.taxonomyNode ?? null,
    };
  }

  private toStoredGovernanceSnapshot(row: {
    id: string;
    project: string;
    version: string;
    generated: string;
    rawIndex: Record<string, unknown>;
    createdAt: string;
  }): StoredGovernanceSnapshot {
    const raw = row.rawIndex as unknown as ValidatedSnapshotData;
    const statsObj = raw?.stats;

    return {
      id: row.id,
      project: row.project,
      version: row.version,
      generated: row.generated,
      createdAt: row.createdAt,
      stats: {
        capabilities:
          statsObj?.capabilities ?? statsObj?.totalCapabilities ?? 0,
        userTypes: statsObj?.userTypes ?? statsObj?.totalUserTypes ?? 0,
        userStories: statsObj?.userStories ?? statsObj?.totalStories ?? 0,
        roadItems: statsObj?.roadItems ?? statsObj?.totalRoadItems ?? 0,
        integrityStatus:
          statsObj?.integrityStatus ??
          (statsObj?.referentialIntegrity?.valid ? "pass" : "fail"),
        integrityErrors:
          statsObj?.integrityErrors ??
          statsObj?.referentialIntegrity?.errors?.length ??
          0,
      },
    };
  }

  private async governanceGetRawIndex(
    snapshotId: string,
  ): Promise<ValidatedSnapshotData | null> {
    const row = this.db
      .select({ rawIndex: schema.governanceSnapshots.rawIndex })
      .from(schema.governanceSnapshots)
      .where(eq(schema.governanceSnapshots.id, snapshotId))
      .get();

    return (row?.rawIndex as unknown as ValidatedSnapshotData) ?? null;
  }
}
