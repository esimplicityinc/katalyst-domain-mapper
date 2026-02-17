"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Upload } from "lucide-react";
import { AssessmentWizard } from "@/components/manual-assessment/AssessmentWizard";
import type { FOEReport } from "@/data/types";

export default function ManualAssessmentPage() {
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generatedReport, setGeneratedReport] =
    useState<Partial<FOEReport> | null>(null);

  const handleComplete = (report: Partial<FOEReport>) => {
    setGeneratedReport(report);
    setReportGenerated(true);
  };

  const handleDownload = () => {
    if (!generatedReport) return;

    const dataStr = JSON.stringify(generatedReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `foe-report-${generatedReport.repository}-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadInViewer = () => {
    if (!generatedReport) return;

    // Store in localStorage for viewing
    localStorage.setItem("foe-report-temp", JSON.stringify(generatedReport));

    // Navigate to template 1 (or any template)
    window.location.href = "/template-1-dashboard";
  };

  if (reportGenerated && generatedReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Assessment Complete!
            </h1>
            <p className="text-gray-600 mb-6">
              Your FOE report has been generated successfully.
            </p>

            {/* Score Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Overall Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {generatedReport.overallScore}/100
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">Feedback</p>
                <p className="text-2xl font-bold text-blue-900">
                  {generatedReport.dimensions?.feedback.score}/100
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-700">Understanding</p>
                <p className="text-2xl font-bold text-purple-900">
                  {generatedReport.dimensions?.understanding.score}/100
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700">Confidence</p>
                <p className="text-2xl font-bold text-green-900">
                  {generatedReport.dimensions?.confidence.score}/100
                </p>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <button
              onClick={handleDownload}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Download JSON
                  </h3>
                  <p className="text-sm text-gray-600">
                    Save your report as a JSON file. You can load it later or
                    share it with your team.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={handleLoadInViewer}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-green-300 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    View in Template
                  </h3>
                  <p className="text-sm text-gray-600">
                    Open your report in one of our visualization templates to
                    explore the results.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Templates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manual FOE Assessment
          </h1>
          <p className="text-gray-600">
            Complete this step-by-step wizard to create an FOE report without
            running an automated scan.
          </p>
        </div>

        {/* Wizard */}
        <AssessmentWizard onComplete={handleComplete} />
      </div>
    </div>
  );
}
