import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const governance_snapshots = sqliteTable('governance_snapshots', {
    id: text('id').primaryKey(),
    created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    content: text('content', { mode: 'json' }).notNull(),
});

export const governance_capabilities = sqliteTable('governance_capabilities', {
    id: text('id').primaryKey(), // CAP-XXX
    snapshot_id: text('snapshot_id').notNull().references(() => governance_snapshots.id),
    title: text('title').notNull(),
    status: text('status').notNull(),
    coverage_score: integer('coverage_score').notNull(),
});

export const governance_road_items = sqliteTable('governance_road_items', {
    id: text('id').primaryKey(), // ROAD-XXX
    snapshot_id: text('snapshot_id').notNull().references(() => governance_snapshots.id),
    title: text('title').notNull(),
    status: text('status').notNull(),
    phase: integer('phase').notNull(),
});

export const governance_contexts = sqliteTable('governance_contexts', {
    id: text('id').primaryKey(), // CTX-xxx
    snapshot_id: text('snapshot_id').notNull().references(() => governance_snapshots.id),
    name: text('name').notNull(),
    description: text('description'),
});
