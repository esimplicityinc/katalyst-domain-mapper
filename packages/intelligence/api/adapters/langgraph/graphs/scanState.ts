/**
 * LangGraph scan state definition.
 *
 * Defines the state annotation for the FOE scanner graph, including
 * shared context and aggregated results from specialist nodes.
 */
import { Annotation } from "@langchain/langgraph";
import type { DimensionAssessment } from "../../../ports/ScanOrchestrator.js";

/**
 * Scan graph state.
 *
 * - `repositoryPath`, `techStack`, `monorepo`, `packages` are set by the
 *   `detectContext` node at the start of the graph.
 * - `assessments` uses a concat reducer so each specialist node appends
 *   its result independently (fan-in aggregation).
 * - `report` is set by the final `synthesize` node.
 * - `error` captures any fatal error.
 */
export const ScanStateAnnotation = Annotation.Root({
  /** Absolute path to the repository being scanned */
  repositoryPath: Annotation<string>,

  /** Detected tech stack (e.g. ["node", "typescript"]) */
  techStack: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  /** Whether the repo is a monorepo */
  monorepo: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => false,
  }),

  /** Package names if monorepo */
  packages: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  /** Aggregated specialist assessments — concat reducer for fan-in */
  assessments: Annotation<DimensionAssessment[]>({
    reducer: (a, b) => a.concat(b),
    default: () => [],
  }),

  /** Final synthesized report */
  report: Annotation<unknown>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  /** Fatal error message, if any */
  error: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
});

export type ScanState = typeof ScanStateAnnotation.State;
