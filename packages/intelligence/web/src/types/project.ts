/**
 * Project-related types for the FOE Project Browser
 *
 * A "Project" represents a repository with one or more FOE scans.
 * These types aggregate repository metadata with scan results.
 */

import type { MaturityLevel } from "@foe/schemas";

/**
 * Project summary information
 *
 * Aggregates repository metadata with the latest scan results.
 * Used in the project list view.
 */
export interface Project {
  /** Unique repository identifier (normalized URL or database ID) */
  id: string;

  /** Human-readable repository name */
  name: string;

  /** Repository URL (optional) */
  url: string | null;

  /** Technology stack detected in the repository */
  techStack: string[];

  /** Whether this repository is a monorepo */
  isMonorepo: boolean;

  /** Date of the most recent scan (ISO 8601) */
  lastScanDate: string | null;

  /** Overall score from the latest scan (0-100) */
  latestScore: number | null;

  /** Maturity level from the latest scan */
  maturityLevel: MaturityLevel | null;

  /** Total number of scans for this repository */
  scanCount: number;
}

/**
 * Detailed project information with full scan history
 *
 * Extends Project with additional details needed for the project detail view.
 */
export interface ProjectDetail extends Project {
  /** Date the repository was first scanned */
  firstScanDate: string | null;

  /** Average score across all scans */
  averageScore: number | null;

  /** Score trend (positive = improving, negative = declining) */
  scoreTrend: number | null;

  /** IDs of all scans for this repository, sorted by date (newest first) */
  scanIds: string[];
}

/**
 * Project scan history item
 *
 * Summary of a single scan within a project's history.
 */
export interface ProjectScanHistoryItem {
  /** Unique scan report ID */
  id: string;

  /** Scan date (ISO 8601) */
  scanDate: string;

  /** Overall score (0-100) */
  overallScore: number;

  /** Maturity level */
  maturityLevel: MaturityLevel;

  /** Scanner version used */
  scannerVersion: string;

  /** How long the scan took (milliseconds) */
  scanDuration: number;
}

/**
 * Project filter options for the project list
 */
export interface ProjectFilter {
  /** Filter by maturity level */
  maturityLevel?: MaturityLevel;

  /** Filter by minimum score */
  minScore?: number;

  /** Filter by maximum score */
  maxScore?: number;

  /** Filter by technology stack (matches any) */
  techStack?: string[];

  /** Only show monorepos */
  monorepoOnly?: boolean;

  /** Search by repository name */
  searchQuery?: string;
}

/**
 * Project sort options
 */
export type ProjectSortField =
  | "name"
  | "lastScanDate"
  | "latestScore"
  | "scanCount";

export type ProjectSortOrder = "asc" | "desc";

export interface ProjectSort {
  field: ProjectSortField;
  order: ProjectSortOrder;
}
