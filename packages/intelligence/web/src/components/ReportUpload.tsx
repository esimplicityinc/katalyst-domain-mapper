import {
  Upload,
  FileJson,
  AlertCircle,
  Database,
  FolderSearch,
} from "lucide-react";
import { useState, useCallback } from "react";
import type { FOEReport } from "../types/report";
import { adaptReport } from "../adapters/reportAdapter";
import { ReportBrowser } from "./ReportBrowser";
import { ScanDirectory } from "./ScanDirectory";

interface ReportUploadProps {
  onReportLoaded: (report: FOEReport) => void;
}

type Tab = "upload" | "api" | "scan";

export function ReportUpload({ onReportLoaded }: ReportUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("upload");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateReport = (data: any): boolean => {
    // Accept both scanner format (version + repository object) and
    // canonical format (scannerVersion + repository string) 
    return (
      data &&
      typeof data === "object" &&
      "repository" in data &&
      "dimensions" in data &&
      "overallScore" in data
    );
  };

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (!file.name.endsWith(".json")) {
        setError("Please upload a JSON file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);

          if (!validateReport(data)) {
            setError(
              "Invalid FOE report format. Please upload a valid report JSON file.",
            );
            return;
          }

          onReportLoaded(adaptReport(data));
        } catch (err) {
          setError("Failed to parse JSON file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    },
    [onReportLoaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            FOE Report Viewer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scan a repository, upload a report, or load one from the API
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "upload"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab("scan")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "scan"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <FolderSearch className="w-4 h-4" />
            Scan Directory
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "api"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Database className="w-4 h-4" />
            Load from API
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-12 transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              <input
                type="file"
                accept=".json"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="flex flex-col items-center text-center">
                {isDragging ? (
                  <Upload className="w-16 h-16 text-blue-500 mb-4 animate-bounce" />
                ) : (
                  <FileJson className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                )}

                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {isDragging
                    ? "Drop your report here"
                    : "Drop your FOE report here"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  or click to browse files
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Accepts JSON files generated by the FOE scanner
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error loading report
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Scan Tab */}
        {activeTab === "scan" && (
          <ScanDirectory onReportLoaded={onReportLoaded} />
        )}

        {/* API Tab */}
        {activeTab === "api" && (
          <ReportBrowser onReportLoaded={onReportLoaded} />
        )}
      </div>
    </div>
  );
}
