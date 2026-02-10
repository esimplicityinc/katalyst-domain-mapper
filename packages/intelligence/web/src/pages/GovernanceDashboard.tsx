import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Layers,
  Users,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { api } from "../api/client";
import { KanbanBoard } from "../components/domain/KanbanBoard";
import { CoverageMatrix } from "../components/domain/CoverageMatrix";
import type {
  GovernanceSnapshot,
  RoadItemSummary,
  CapabilityCoverage,
  PersonaCoverage,
  IntegrityReport,
} from "../types/governance";

type LoadingState = "loading" | "ready" | "empty" | "error";

export function GovernanceDashboard() {
  const [state, setState] = useState<LoadingState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data
  const [snapshot, setSnapshot] = useState<GovernanceSnapshot | null>(null);
  const [roads, setRoads] = useState<RoadItemSummary[]>([]);
  const [capabilities, setCapabilities] = useState<CapabilityCoverage[]>([]);
  const [personas, setPersonas] = useState<PersonaCoverage[]>([]);
  const [integrity, setIntegrity] = useState<IntegrityReport | null>(null);

  // Kanban filter
  const [kanbanFilter, setKanbanFilter] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setState("loading");
    setErrorMessage(null);

    try {
      const results = await Promise.allSettled([
        api.getGovernanceLatest(),
        api.getGovernanceRoads(),
        api.getCapabilityCoverage(),
        api.getPersonaCoverage(),
        api.getGovernanceIntegrity(),
      ]);

      const [
        snapshotResult,
        roadsResult,
        capsResult,
        personasResult,
        integrityResult,
      ] = results;

      // Check if the primary snapshot fetch returned a 404 (no data)
      if (snapshotResult.status === "rejected") {
        const errMsg = (snapshotResult.reason as Error)?.message ?? "";
        if (errMsg.includes("404")) {
          setState("empty");
          return;
        }
        // API unreachable — try static fallback
        await tryStaticFallback();
        return;
      }

      setSnapshot(snapshotResult.value);
      setRoads(roadsResult.status === "fulfilled" ? roadsResult.value : []);
      setCapabilities(
        capsResult.status === "fulfilled" ? capsResult.value : [],
      );
      setPersonas(
        personasResult.status === "fulfilled" ? personasResult.value : [],
      );
      setIntegrity(
        integrityResult.status === "fulfilled" ? integrityResult.value : null,
      );

      setState("ready");
    } catch {
      await tryStaticFallback();
    }
  }, []);

  const tryStaticFallback = async () => {
    try {
      const res = await fetch("/governance-snapshot.json");
      if (!res.ok) throw new Error("No static fallback");
      const data = (await res.json()) as GovernanceSnapshot;
      setSnapshot(data);
      setState("ready");
      setErrorMessage(
        "Unable to reach governance API. Showing static snapshot.",
      );
    } catch {
      setState("error");
      setErrorMessage(
        "Unable to reach governance API. No static snapshot available.",
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Computed values ────────────────────────────────────────────────────────

  const completedRoads = roads.filter((r) => r.status === "complete").length;
  const totalRoads = roads.length;
  const governanceScore =
    totalRoads > 0 ? Math.round((completedRoads / totalRoads) * 100) : 0;

  const integrityPercentage = integrity
    ? Math.round(
        ((integrity.totalArtifacts - integrity.errors.length) /
          Math.max(integrity.totalArtifacts, 1)) *
          100,
      )
    : snapshot
      ? snapshot.stats.integrityStatus === "pass"
        ? 100
        : 0
      : 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading governance data...
          </p>
        </div>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <div
          data-testid="empty-state"
          className="flex flex-col items-center justify-center py-24"
        >
          <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Governance Data
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
            Ingest a governance snapshot to see health metrics, road item
            progress, and capability coverage. Run the governance sync command
            to get started.
          </p>
        </div>
      </div>
    );
  }

  if (state === "error" && !snapshot) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorBanner message={errorMessage} onRetry={fetchData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <DashboardHeader onRefresh={fetchData} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error banner (API down but showing static data) */}
        {errorMessage && (
          <ErrorBanner message={errorMessage} onRetry={fetchData} />
        )}

        {/* ── Health Summary ──────────────────────────────────────────── */}
        <HealthSummaryCard
          snapshot={snapshot}
          governanceScore={governanceScore}
          integrityPercentage={integrityPercentage}
          completedRoads={completedRoads}
          totalRoads={totalRoads}
          personaCount={personas.length}
        />

        {/* ── Kanban Board ────────────────────────────────────────────── */}
        {roads.length > 0 && (
          <DashboardSection title="Road Items" icon={MapPin}>
            <KanbanBoard
              items={roads}
              filterState={kanbanFilter}
              onFilterChange={setKanbanFilter}
            />
          </DashboardSection>
        )}

        {/* ── Coverage Matrix ─────────────────────────────────────────── */}
        {capabilities.length > 0 && (
          <DashboardSection title="Capability Coverage" icon={Layers}>
            <CoverageMatrix capabilities={capabilities} />
          </DashboardSection>
        )}

        {/* ── Persona Summary ─────────────────────────────────────────── */}
        {personas.length > 0 && (
          <DashboardSection title="Persona Coverage" icon={Users}>
            <PersonaSummary personas={personas} />
          </DashboardSection>
        )}

        {/* ── Integrity Report ────────────────────────────────────────── */}
        {integrity && <IntegritySection integrity={integrity} />}
      </div>
    </div>
  );
}

// ── DashboardHeader ──────────────────────────────────────────────────────────

function DashboardHeader({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Governance Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Health, coverage & road item progress
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ── ErrorBanner ──────────────────────────────────────────────────────────────

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div
      data-testid="api-error-banner"
      className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
    >
      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {message ?? "Unable to reach governance API."}
        </p>
        {message?.includes("static snapshot") && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Data may be outdated. Click Retry to attempt a live connection.
          </p>
        )}
      </div>
      <button
        onClick={onRetry}
        className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 rounded-md transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

// ── HealthSummaryCard ────────────────────────────────────────────────────────

function HealthSummaryCard({
  snapshot,
  governanceScore,
  integrityPercentage,
  completedRoads,
  totalRoads,
  personaCount,
}: {
  snapshot: GovernanceSnapshot | null;
  governanceScore: number;
  integrityPercentage: number;
  completedRoads: number;
  totalRoads: number;
  personaCount: number;
}) {
  return (
    <div
      data-testid="health-summary-card"
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
    >
      {/* Top row: score + metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div
            data-testid="governance-score"
            className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
          >
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {governanceScore}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Governance Health
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {completedRoads} of {totalRoads} road items complete
            </p>
          </div>
        </div>
        {snapshot && (
          <div className="sm:ml-auto text-right text-xs text-gray-400 dark:text-gray-500">
            <p>
              Project:{" "}
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {snapshot.project}
              </span>
            </p>
            <p>
              v{snapshot.version} &middot;{" "}
              {new Date(snapshot.generated).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCell
          label="Road Items"
          value={snapshot?.stats.roadItems ?? totalRoads}
          icon={MapPin}
        />
        <StatCell
          label="Capabilities"
          value={snapshot?.stats.capabilities ?? 0}
          icon={Layers}
        />
        <StatCell
          label="Personas"
          value={snapshot?.stats.personas ?? personaCount}
          icon={Users}
        />
        <StatCell
          label="User Stories"
          value={snapshot?.stats.userStories ?? 0}
          icon={BarChart3}
        />
        <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            {integrityPercentage === 100 ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Integrity
            </span>
          </div>
          <span
            data-testid="integrity-percentage"
            className={`text-xl font-bold ${
              integrityPercentage === 100
                ? "text-green-600 dark:text-green-400"
                : integrityPercentage >= 80
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
            }`}
          >
            {integrityPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ── StatCell ─────────────────────────────────────────────────────────────────

function StatCell({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
        {value}
      </span>
    </div>
  );
}

// ── DashboardSection ─────────────────────────────────────────────────────────

function DashboardSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

// ── PersonaSummary ───────────────────────────────────────────────────────────

function PersonaSummary({ personas }: { personas: PersonaCoverage[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {personas.map((p) => (
        <div
          key={p.id}
          className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {p.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {p.type}
            </p>
            <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{p.storyCount} stories</span>
              <span>{p.capabilityCount} capabilities</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── IntegritySection ─────────────────────────────────────────────────────────

function IntegritySection({ integrity }: { integrity: IntegrityReport }) {
  return (
    <section
      data-testid="integrity-report"
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Integrity Report
          </h2>
        </div>
        <span
          data-testid="integrity-status-badge"
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${
            integrity.valid
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {integrity.valid ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <XCircle className="w-3.5 h-3.5" />
          )}
          {integrity.valid ? "Valid" : "Invalid"}
        </span>
      </div>

      <div className="p-6">
        <div className="flex gap-6 mb-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">
              Total artifacts:{" "}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {integrity.totalArtifacts}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Errors: </span>
            <span
              className={`font-semibold ${
                integrity.errors.length > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {integrity.errors.length}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Checked: </span>
            <span className="text-gray-700 dark:text-gray-300">
              {new Date(integrity.checkedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {integrity.errors.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Errors ({integrity.errors.length})
            </h3>
            <ul className="space-y-1.5">
              {integrity.errors.map((error, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-md"
                >
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {integrity.errors.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              All cross-references are valid. No integrity issues detected.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
