import {
  GovernanceRepository,
  GovernanceIndex,
} from "../../domain/governance/ports/GovernanceRepository";
import { db } from "../../db";
import {
  governance_snapshots,
  governance_capabilities,
  governance_road_items,
  governance_contexts,
} from "../../db/schema";
import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class SqliteGovernanceRepository implements GovernanceRepository {
  async saveSnapshot(snapshot: GovernanceIndex): Promise<string> {
    const snapshotId = uuidv4();

    await db.insert(governance_snapshots).values({
      id: snapshotId,
      content: JSON.stringify(snapshot),
    });

    return snapshotId;
  }

  async getLatestSnapshot(): Promise<GovernanceIndex | null> {
    const result = await db
      .select()
      .from(governance_snapshots)
      .orderBy(desc(governance_snapshots.created_at))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return result[0].content as unknown as GovernanceIndex;
  }

  async getRoadItems(): Promise<any[]> {
    const snapshot = await this.getLatestSnapshot();
    return snapshot ? Object.values(snapshot.roadItems) : [];
  }

  async getCapabilityCoverage(): Promise<any[]> {
    const snapshot = await this.getLatestSnapshot();
    return snapshot ? Object.values(snapshot.capabilities) : [];
  }

  async getSnapshots(): Promise<GovernanceIndex[]> {
    const results = await db
      .select()
      .from(governance_snapshots)
      .orderBy(desc(governance_snapshots.created_at));
    return results.map((r) => r.content as unknown as GovernanceIndex);
  }

  async deleteSnapshot(id: string): Promise<void> {
    // ID in our DB is the UUID we generated, but the test might be passing the ID it got back?
    // Wait, the POST / responds with "id" which is the snapshotId.
    // Yes, verify IngestGovernanceSnapshot returns or we access it?
    // We aren't returning the ID in the route!
    // We need to fix that too.
    await db
      .delete(governance_snapshots)
      .where(eq(governance_snapshots.id, id));
  }
}
