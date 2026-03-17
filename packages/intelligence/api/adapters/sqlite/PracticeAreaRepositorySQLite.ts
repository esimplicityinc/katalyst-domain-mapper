// ── Practice Area / Competency / Adoption SQLite Adapter ────────────────────
// Implements the practice area, competency, and adoption CRUD methods
// from the TaxonomyRepository port using Drizzle + SQLite.

import { eq, and } from "drizzle-orm";
import type {
  StoredPracticeArea,
  CreatePracticeAreaInput,
  UpdatePracticeAreaInput,
  StoredCompetency,
  CreateCompetencyInput,
  UpdateCompetencyInput,
  StoredTeamAdoption,
  CreateTeamAdoptionInput,
  UpdateTeamAdoptionInput,
  StoredIndividualAdoption,
  CreateIndividualAdoptionInput,
  UpdateIndividualAdoptionInput,
} from "../../ports/TaxonomyRepository.js";
import type { DrizzleDB } from "../../db/client.js";
import * as schema from "../../db/schema.js";

// ── Mixin interface ────────────────────────────────────────────────────────
// This describes the subset of TaxonomyRepository that this file implements.
// The TaxonomyRepositorySQLite class delegates to an instance of this helper.

export interface PracticeAreaMethods {
  // Practice Areas
  listPracticeAreas(snapshotId: string): Promise<StoredPracticeArea[]>;
  getPracticeAreaById(snapshotId: string, id: string): Promise<StoredPracticeArea | null>;
  createPracticeArea(snapshotId: string, input: CreatePracticeAreaInput): Promise<StoredPracticeArea>;
  updatePracticeArea(snapshotId: string, id: string, input: UpdatePracticeAreaInput): Promise<StoredPracticeArea>;
  deletePracticeArea(snapshotId: string, id: string): Promise<void>;

  // Competencies
  listCompetencies(snapshotId: string, practiceAreaId?: string): Promise<StoredCompetency[]>;
  getCompetencyById(snapshotId: string, id: string): Promise<StoredCompetency | null>;
  createCompetency(snapshotId: string, input: CreateCompetencyInput): Promise<StoredCompetency>;
  updateCompetency(snapshotId: string, id: string, input: UpdateCompetencyInput): Promise<StoredCompetency>;
  deleteCompetency(snapshotId: string, id: string): Promise<void>;

  // Team Adoptions
  listTeamAdoptions(snapshotId: string, teamName?: string): Promise<StoredTeamAdoption[]>;
  getTeamAdoption(snapshotId: string, teamName: string, practiceAreaId: string): Promise<StoredTeamAdoption | null>;
  createTeamAdoption(snapshotId: string, input: CreateTeamAdoptionInput): Promise<StoredTeamAdoption>;
  updateTeamAdoption(snapshotId: string, id: string, input: UpdateTeamAdoptionInput): Promise<StoredTeamAdoption>;
  deleteTeamAdoption(snapshotId: string, id: string): Promise<void>;

  // Individual Adoptions
  listIndividualAdoptions(snapshotId: string, personName?: string): Promise<StoredIndividualAdoption[]>;
  getIndividualAdoption(snapshotId: string, personName: string, practiceAreaId: string): Promise<StoredIndividualAdoption | null>;
  createIndividualAdoption(snapshotId: string, input: CreateIndividualAdoptionInput): Promise<StoredIndividualAdoption>;
  updateIndividualAdoption(snapshotId: string, id: string, input: UpdateIndividualAdoptionInput): Promise<StoredIndividualAdoption>;
  deleteIndividualAdoption(snapshotId: string, id: string): Promise<void>;
}

// ── Implementation ─────────────────────────────────────────────────────────

export class PracticeAreaRepositorySQLite implements PracticeAreaMethods {
  constructor(private db: DrizzleDB) {}

  // ══════════════════════════════════════════════════════════════════════════
  // PRACTICE AREAS
  // ══════════════════════════════════════════════════════════════════════════

  async listPracticeAreas(snapshotId: string): Promise<StoredPracticeArea[]> {
    const rows = this.db
      .select()
      .from(schema.practiceAreas)
      .where(eq(schema.practiceAreas.snapshotId, snapshotId))
      .all();

    return rows.map((r) => this.rowToPracticeArea(r));
  }

  async getPracticeAreaById(snapshotId: string, id: string): Promise<StoredPracticeArea | null> {
    const row = this.db
      .select()
      .from(schema.practiceAreas)
      .where(
        and(
          eq(schema.practiceAreas.snapshotId, snapshotId),
          eq(schema.practiceAreas.id, id),
        ),
      )
      .get();

    if (!row) return null;
    return this.rowToPracticeArea(row);
  }

  async createPracticeArea(snapshotId: string, input: CreatePracticeAreaInput): Promise<StoredPracticeArea> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const values = {
      id,
      snapshotId,
      name: input.name,
      title: input.title,
      description: input.description ?? null,
      canonical: input.canonical ?? false,
      pillars: JSON.stringify(input.pillars ?? []),
      competencies: JSON.stringify(input.competencies ?? []),
      methods: JSON.stringify(input.methods ?? []),
      tools: JSON.stringify(input.tools ?? []),
      labels: "{}",
      owners: "[]",
      dependsOn: "[]",
      contribution: "{}",
      createdAt: now,
      updatedAt: now,
    };

    this.db.insert(schema.practiceAreas).values(values).run();

    return this.rowToPracticeArea({
      ...values,
      canonical: values.canonical ? 1 : 0,
    } as unknown as typeof schema.practiceAreas.$inferSelect);
  }

  async updatePracticeArea(snapshotId: string, id: string, input: UpdatePracticeAreaInput): Promise<StoredPracticeArea> {
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = { updatedAt: now };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.pillars !== undefined) updateData.pillars = JSON.stringify(input.pillars);
    if (input.competencies !== undefined) updateData.competencies = JSON.stringify(input.competencies);
    if (input.methods !== undefined) updateData.methods = JSON.stringify(input.methods);
    if (input.tools !== undefined) updateData.tools = JSON.stringify(input.tools);

    this.db
      .update(schema.practiceAreas)
      .set(updateData)
      .where(
        and(
          eq(schema.practiceAreas.snapshotId, snapshotId),
          eq(schema.practiceAreas.id, id),
        ),
      )
      .run();

    const updated = this.db
      .select()
      .from(schema.practiceAreas)
      .where(
        and(
          eq(schema.practiceAreas.snapshotId, snapshotId),
          eq(schema.practiceAreas.id, id),
        ),
      )
      .get();

    if (!updated) throw new Error(`Practice area ${id} not found after update`);
    return this.rowToPracticeArea(updated);
  }

  async deletePracticeArea(snapshotId: string, id: string): Promise<void> {
    this.db
      .delete(schema.practiceAreas)
      .where(
        and(
          eq(schema.practiceAreas.snapshotId, snapshotId),
          eq(schema.practiceAreas.id, id),
        ),
      )
      .run();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COMPETENCIES
  // ══════════════════════════════════════════════════════════════════════════

  async listCompetencies(snapshotId: string, practiceAreaId?: string): Promise<StoredCompetency[]> {
    const rows = this.db
      .select()
      .from(schema.competencies)
      .where(eq(schema.competencies.snapshotId, snapshotId))
      .all();

    const filtered = practiceAreaId
      ? rows.filter((r) => r.practiceAreaId === practiceAreaId)
      : rows;

    return filtered.map((r) => this.rowToCompetency(r));
  }

  async getCompetencyById(snapshotId: string, id: string): Promise<StoredCompetency | null> {
    const row = this.db
      .select()
      .from(schema.competencies)
      .where(
        and(
          eq(schema.competencies.snapshotId, snapshotId),
          eq(schema.competencies.id, id),
        ),
      )
      .get();

    if (!row) return null;
    return this.rowToCompetency(row);
  }

  async createCompetency(snapshotId: string, input: CreateCompetencyInput): Promise<StoredCompetency> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const values = {
      id,
      snapshotId,
      name: input.name,
      title: input.title,
      description: input.description ?? null,
      practiceAreaId: input.practiceAreaId,
      competencyType: input.competencyType,
      skills: JSON.stringify(input.skills ?? []),
      levelDefinitions: JSON.stringify(input.levelDefinitions),
      dependencies: JSON.stringify(input.dependencies ?? []),
      labels: "{}",
      owners: "[]",
      dependsOn: "[]",
      contribution: "{}",
      createdAt: now,
      updatedAt: now,
    };

    this.db.insert(schema.competencies).values(values).run();

    return this.rowToCompetency(values as unknown as typeof schema.competencies.$inferSelect);
  }

  async updateCompetency(snapshotId: string, id: string, input: UpdateCompetencyInput): Promise<StoredCompetency> {
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = { updatedAt: now };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.competencyType !== undefined) updateData.competencyType = input.competencyType;
    if (input.skills !== undefined) updateData.skills = JSON.stringify(input.skills);
    if (input.levelDefinitions !== undefined) updateData.levelDefinitions = JSON.stringify(input.levelDefinitions);
    if (input.dependencies !== undefined) updateData.dependencies = JSON.stringify(input.dependencies);

    this.db
      .update(schema.competencies)
      .set(updateData)
      .where(
        and(
          eq(schema.competencies.snapshotId, snapshotId),
          eq(schema.competencies.id, id),
        ),
      )
      .run();

    const updated = this.db
      .select()
      .from(schema.competencies)
      .where(
        and(
          eq(schema.competencies.snapshotId, snapshotId),
          eq(schema.competencies.id, id),
        ),
      )
      .get();

    if (!updated) throw new Error(`Competency ${id} not found after update`);
    return this.rowToCompetency(updated);
  }

  async deleteCompetency(snapshotId: string, id: string): Promise<void> {
    this.db
      .delete(schema.competencies)
      .where(
        and(
          eq(schema.competencies.snapshotId, snapshotId),
          eq(schema.competencies.id, id),
        ),
      )
      .run();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TEAM ADOPTIONS
  // ══════════════════════════════════════════════════════════════════════════

  async listTeamAdoptions(snapshotId: string, teamName?: string): Promise<StoredTeamAdoption[]> {
    const rows = this.db
      .select()
      .from(schema.teamAdoptions)
      .where(eq(schema.teamAdoptions.snapshotId, snapshotId))
      .all();

    const filtered = teamName
      ? rows.filter((r) => r.teamName === teamName)
      : rows;

    return filtered.map((r) => this.rowToTeamAdoption(r));
  }

  async getTeamAdoption(snapshotId: string, teamName: string, practiceAreaId: string): Promise<StoredTeamAdoption | null> {
    const rows = this.db
      .select()
      .from(schema.teamAdoptions)
      .where(eq(schema.teamAdoptions.snapshotId, snapshotId))
      .all();

    const match = rows.find(
      (r) => r.teamName === teamName && r.practiceAreaId === practiceAreaId,
    );

    if (!match) return null;
    return this.rowToTeamAdoption(match);
  }

  async createTeamAdoption(snapshotId: string, input: CreateTeamAdoptionInput): Promise<StoredTeamAdoption> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const name = `${input.teamName}:${input.practiceAreaId}`;

    const values = {
      id,
      snapshotId,
      name,
      description: null,
      teamName: input.teamName,
      practiceAreaId: input.practiceAreaId,
      adoptionLevel: input.adoptionLevel,
      adoptedAt: now,
      lastAssessedAt: null,
      assessedBy: null,
      competencyProgress: "[]",
      scanEvidence: "[]",
      notes: input.notes ?? null,
      labels: "{}",
      owners: "[]",
      dependsOn: "[]",
      contribution: "{}",
      createdAt: now,
      updatedAt: now,
    };

    this.db.insert(schema.teamAdoptions).values(values).run();

    return this.rowToTeamAdoption(values as unknown as typeof schema.teamAdoptions.$inferSelect);
  }

  async updateTeamAdoption(snapshotId: string, id: string, input: UpdateTeamAdoptionInput): Promise<StoredTeamAdoption> {
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = { updatedAt: now };

    if (input.adoptionLevel !== undefined) updateData.adoptionLevel = input.adoptionLevel;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.competencyProgress !== undefined) updateData.competencyProgress = JSON.stringify(input.competencyProgress);

    this.db
      .update(schema.teamAdoptions)
      .set(updateData)
      .where(
        and(
          eq(schema.teamAdoptions.snapshotId, snapshotId),
          eq(schema.teamAdoptions.id, id),
        ),
      )
      .run();

    const updated = this.db
      .select()
      .from(schema.teamAdoptions)
      .where(
        and(
          eq(schema.teamAdoptions.snapshotId, snapshotId),
          eq(schema.teamAdoptions.id, id),
        ),
      )
      .get();

    if (!updated) throw new Error(`Team adoption ${id} not found after update`);
    return this.rowToTeamAdoption(updated);
  }

  async deleteTeamAdoption(snapshotId: string, id: string): Promise<void> {
    this.db
      .delete(schema.teamAdoptions)
      .where(
        and(
          eq(schema.teamAdoptions.snapshotId, snapshotId),
          eq(schema.teamAdoptions.id, id),
        ),
      )
      .run();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INDIVIDUAL ADOPTIONS
  // ══════════════════════════════════════════════════════════════════════════

  async listIndividualAdoptions(snapshotId: string, personName?: string): Promise<StoredIndividualAdoption[]> {
    const rows = this.db
      .select()
      .from(schema.individualAdoptions)
      .where(eq(schema.individualAdoptions.snapshotId, snapshotId))
      .all();

    const filtered = personName
      ? rows.filter((r) => r.personName === personName)
      : rows;

    return filtered.map((r) => this.rowToIndividualAdoption(r));
  }

  async getIndividualAdoption(snapshotId: string, personName: string, practiceAreaId: string): Promise<StoredIndividualAdoption | null> {
    const rows = this.db
      .select()
      .from(schema.individualAdoptions)
      .where(eq(schema.individualAdoptions.snapshotId, snapshotId))
      .all();

    const match = rows.find(
      (r) => r.personName === personName && r.practiceAreaId === practiceAreaId,
    );

    if (!match) return null;
    return this.rowToIndividualAdoption(match);
  }

  async createIndividualAdoption(snapshotId: string, input: CreateIndividualAdoptionInput): Promise<StoredIndividualAdoption> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const name = `${input.personName}:${input.practiceAreaId}`;

    const values = {
      id,
      snapshotId,
      name,
      description: null,
      personName: input.personName,
      practiceAreaId: input.practiceAreaId,
      role: input.role,
      competencyProgress: "[]",
      skillAssessments: "[]",
      notes: input.notes ?? null,
      labels: "{}",
      owners: "[]",
      dependsOn: "[]",
      contribution: "{}",
      createdAt: now,
      updatedAt: now,
    };

    this.db.insert(schema.individualAdoptions).values(values).run();

    return this.rowToIndividualAdoption(values as unknown as typeof schema.individualAdoptions.$inferSelect);
  }

  async updateIndividualAdoption(snapshotId: string, id: string, input: UpdateIndividualAdoptionInput): Promise<StoredIndividualAdoption> {
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = { updatedAt: now };

    if (input.role !== undefined) updateData.role = input.role;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.competencyProgress !== undefined) updateData.competencyProgress = JSON.stringify(input.competencyProgress);
    if (input.skillAssessments !== undefined) updateData.skillAssessments = JSON.stringify(input.skillAssessments);

    this.db
      .update(schema.individualAdoptions)
      .set(updateData)
      .where(
        and(
          eq(schema.individualAdoptions.snapshotId, snapshotId),
          eq(schema.individualAdoptions.id, id),
        ),
      )
      .run();

    const updated = this.db
      .select()
      .from(schema.individualAdoptions)
      .where(
        and(
          eq(schema.individualAdoptions.snapshotId, snapshotId),
          eq(schema.individualAdoptions.id, id),
        ),
      )
      .get();

    if (!updated) throw new Error(`Individual adoption ${id} not found after update`);
    return this.rowToIndividualAdoption(updated);
  }

  async deleteIndividualAdoption(snapshotId: string, id: string): Promise<void> {
    this.db
      .delete(schema.individualAdoptions)
      .where(
        and(
          eq(schema.individualAdoptions.snapshotId, snapshotId),
          eq(schema.individualAdoptions.id, id),
        ),
      )
      .run();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS – Row → Stored Type Mappers
  // ══════════════════════════════════════════════════════════════════════════

  private rowToPracticeArea(row: typeof schema.practiceAreas.$inferSelect): StoredPracticeArea {
    return {
      id: row.id,
      name: row.name,
      title: row.title,
      description: row.description ?? null,
      canonical: Boolean(row.canonical),
      pillars: typeof row.pillars === "string" ? row.pillars : JSON.stringify(row.pillars ?? []),
      competencies: typeof row.competencies === "string" ? row.competencies : JSON.stringify(row.competencies ?? []),
      methods: typeof row.methods === "string" ? row.methods : JSON.stringify(row.methods ?? []),
      tools: typeof row.tools === "string" ? row.tools : JSON.stringify(row.tools ?? []),
      labels: typeof row.labels === "string" ? row.labels : JSON.stringify(row.labels ?? {}),
      owners: typeof row.owners === "string" ? row.owners : JSON.stringify(row.owners ?? []),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      taxonomyNode: null,
    };
  }

  private rowToCompetency(row: typeof schema.competencies.$inferSelect): StoredCompetency {
    return {
      id: row.id,
      name: row.name,
      title: row.title,
      description: row.description ?? null,
      practiceAreaId: row.practiceAreaId,
      competencyType: row.competencyType as StoredCompetency["competencyType"],
      skills: typeof row.skills === "string" ? row.skills : JSON.stringify(row.skills ?? []),
      levelDefinitions: typeof row.levelDefinitions === "string" ? row.levelDefinitions : JSON.stringify(row.levelDefinitions ?? []),
      dependencies: typeof row.dependencies === "string" ? row.dependencies : JSON.stringify(row.dependencies ?? []),
      labels: typeof row.labels === "string" ? row.labels : JSON.stringify(row.labels ?? {}),
      owners: typeof row.owners === "string" ? row.owners : JSON.stringify(row.owners ?? []),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      taxonomyNode: null,
    };
  }

  private rowToTeamAdoption(row: typeof schema.teamAdoptions.$inferSelect): StoredTeamAdoption {
    return {
      id: row.id,
      name: row.name,
      teamName: row.teamName,
      practiceAreaId: row.practiceAreaId,
      adoptionLevel: row.adoptionLevel as StoredTeamAdoption["adoptionLevel"],
      adoptedAt: row.adoptedAt,
      lastAssessedAt: row.lastAssessedAt ?? null,
      assessedBy: row.assessedBy ?? null,
      competencyProgress: typeof row.competencyProgress === "string" ? row.competencyProgress : JSON.stringify(row.competencyProgress ?? []),
      scanEvidence: typeof row.scanEvidence === "string" ? row.scanEvidence : JSON.stringify(row.scanEvidence ?? []),
      notes: row.notes ?? null,
      labels: typeof row.labels === "string" ? row.labels : JSON.stringify(row.labels ?? {}),
      owners: typeof row.owners === "string" ? row.owners : JSON.stringify(row.owners ?? []),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private rowToIndividualAdoption(row: typeof schema.individualAdoptions.$inferSelect): StoredIndividualAdoption {
    return {
      id: row.id,
      name: row.name,
      personName: row.personName,
      practiceAreaId: row.practiceAreaId,
      role: row.role as StoredIndividualAdoption["role"],
      competencyProgress: typeof row.competencyProgress === "string" ? row.competencyProgress : JSON.stringify(row.competencyProgress ?? []),
      skillAssessments: typeof row.skillAssessments === "string" ? row.skillAssessments : JSON.stringify(row.skillAssessments ?? []),
      notes: row.notes ?? null,
      labels: typeof row.labels === "string" ? row.labels : JSON.stringify(row.labels ?? {}),
      owners: typeof row.owners === "string" ? row.owners : JSON.stringify(row.owners ?? []),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
