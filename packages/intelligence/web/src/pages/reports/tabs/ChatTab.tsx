import { Loader2, AlertCircle } from "lucide-react";
import { FOEChat } from "../../../components/reports/FOEChat";
import type { FOEReport } from "../../../types/report";
import type { ProjectDetail } from "../../../types/project";

interface ChatTabProps {
  report: FOEReport | null;
  project: ProjectDetail;
}

export function ChatTab({ report, project }: ChatTabProps) {
  // Loading state - waiting for report data
  if (!report) {
    return (
      <div
        className="flex items-center justify-center h-full"
        data-testid="chat-tab-loading"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading assessment data...
          </p>
        </div>
      </div>
    );
  }

  // Error state - report exists but might be invalid
  if (!report.dimensions || !report.triangleDiagnosis) {
    return (
      <div
        className="flex items-center justify-center h-full p-8"
        data-testid="chat-tab-error"
      >
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Invalid Report Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The report data is incomplete or invalid. Please try refreshing the
            page or re-scanning the repository.
          </p>
        </div>
      </div>
    );
  }

  // Main chat interface - full height
  return (
    <div className="h-full" data-testid="chat-tab">
      <FOEChat report={report} project={project} />
    </div>
  );
}
