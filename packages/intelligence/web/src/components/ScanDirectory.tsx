import { useState, useEffect, useRef } from "react";
import {
  FolderSearch,
  Loader2,
  CheckCircle2,
  Clock,
  Play,
  XCircle,
} from "lucide-react";
import { api } from "../api/client";
import type { FOEReport } from "../types/report";

interface ScanDirectoryProps {
  onReportLoaded: (report: FOEReport) => void;
}

type ScanPhase =
  | { step: "idle" }
  | { step: "submitting" }
  | { step: "polling"; jobId: string; status: string; startedAt: string | null }
  | { step: "loading-report"; jobId: string; scanId: string }
  | { step: "done" }
  | { step: "error"; message: string };

const POLL_INTERVAL = 3000;

export function ScanDirectory({ onReportLoaded }: ScanDirectoryProps) {
  const [path, setPath] = useState("");
  const [phase, setPhase] = useState<ScanPhase>({ step: "idle" });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = path.trim();
    if (!trimmed) return;

    setPhase({ step: "submitting" });

    try {
      const result = await api.triggerScan(trimmed);
      setPhase({
        step: "polling",
        jobId: result.jobId,
        status: result.status,
        startedAt: null,
      });
      startPolling(result.jobId);
    } catch (err) {
      setPhase({
        step: "error",
        message: err instanceof Error ? err.message : "Failed to start scan",
      });
    }
  };

  const startPolling = (jobId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const job = await api.getScanStatus(jobId);

        if (job.status === "completed" && job.scanId) {
          stopPolling();
          setPhase({ step: "loading-report", jobId, scanId: job.scanId });
          await loadReport(job.scanId);
        } else if (job.status === "failed") {
          stopPolling();
          setPhase({
            step: "error",
            message: job.errorMessage ?? "Scan failed with no error message",
          });
        } else {
          setPhase({
            step: "polling",
            jobId,
            status: job.status,
            startedAt: job.startedAt,
          });
        }
      } catch (err) {
        stopPolling();
        setPhase({
          step: "error",
          message:
            err instanceof Error
              ? err.message
              : "Lost connection while polling",
        });
      }
    }, POLL_INTERVAL);
  };

  const loadReport = async (reportId: string) => {
    try {
      const raw = await api.getReportRaw(reportId);
      onReportLoaded(raw as FOEReport);
      setPhase({ step: "done" });
    } catch (err) {
      setPhase({
        step: "error",
        message: err instanceof Error ? err.message : "Failed to load report",
      });
    }
  };

  const handleReset = () => {
    stopPolling();
    setPhase({ step: "idle" });
  };

  const isActive =
    phase.step === "submitting" ||
    phase.step === "polling" ||
    phase.step === "loading-report";

  return (
    <div className="space-y-6">
      {/* Input form */}
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Repository path
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FolderSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/path/to/your/repository"
              disabled={isActive}
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!path.trim() || isActive}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {phase.step === "submitting" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Scan
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Absolute path to the repository on the server's filesystem (Docker
          volume mount). The scanner will analyze the codebase and generate a
          FOE maturity report.
        </p>
      </form>

      {/* Status display */}
      {phase.step === "polling" && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {phase.status === "queued"
                  ? "Scan queued..."
                  : "Scanning repository..."}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                {phase.status === "queued"
                  ? "Waiting for scanner to pick up the job"
                  : "Analyzing code structure, tests, CI/CD, architecture, and documentation"}
              </p>
              {phase.startedAt && (
                <p className="text-xs text-blue-500 dark:text-blue-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Started {new Date(phase.startedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Cancel
            </button>
          </div>
          {/* Progress animation */}
          <div className="mt-3 h-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {phase.step === "loading-report" && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Scan complete! Loading report...
              </p>
            </div>
          </div>
        </div>
      )}

      {phase.step === "error" && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Scan failed
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {phase.message}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-red-600 dark:text-red-400 hover:underline flex-shrink-0"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      {phase.step === "idle" && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            What gets scanned?
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
              <span>
                <strong>Feedback</strong> — CI/CD pipelines, deployment
                frequency, caching, parallelization
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0 mt-1.5" />
              <span>
                <strong>Understanding</strong> — Architecture patterns, DDD,
                documentation, ADRs
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 mt-1.5" />
              <span>
                <strong>Confidence</strong> — Test coverage, static analysis,
                contract testing
              </span>
            </li>
          </ul>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
            Scans typically take 5–15 minutes depending on repository size.
            Requires a configured Anthropic API key.
          </p>
        </div>
      )}
    </div>
  );
}
