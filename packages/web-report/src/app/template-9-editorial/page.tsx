"use client";

import { useRef } from "react";
import Link from "next/link";
import report from "@/data/report.json";

type DimensionKey = "feedback" | "understanding" | "confidence";

const dimensionColors: Record<DimensionKey, string> = {
  feedback: "#3b82f6",
  understanding: "#8b5cf6",
  confidence: "#10b981",
};

export default function Template9EditorialPage() {
  const dimensionRefs = useRef<Record<string, HTMLElement | null>>({});
  const {
    repository,
    scanDate,
    overallScore,
    maturityLevel,
    executiveSummary,
    dimensions,
    criticalFailures,
    recommendations,
    strengths,
  } = report;

  const scrollToSection = (id: string) => {
    dimensionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Format date for byline
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  // Priority badge colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "immediate":
        return "text-red-600 bg-red-50 border-red-200";
      case "short-term":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium-term":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const criticalFindings = criticalFailures.filter(
    (f) => f.severity === "critical",
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-stone-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-medium">Back to Templates</span>
            </Link>
            <div className="text-sm text-stone-400 font-serif italic">
              Template 9: Newspaper/Editorial Style
            </div>
          </div>
        </div>
      </nav>

      {/* Breaking News Banner */}
      {criticalFindings.length > 0 && (
        <div className="bg-red-700 text-white py-2 overflow-hidden">
          <div className="flex items-center animate-marquee whitespace-nowrap">
            <span className="mx-4 px-3 py-1 bg-white text-red-700 font-bold text-xs uppercase tracking-wider">
              Breaking
            </span>
            <span className="font-serif">
              {criticalFindings.length} Critical Findings Discovered in FOE
              Assessment
            </span>
            <span className="mx-8 text-red-300">|</span>
            {criticalFindings.slice(0, 3).map((finding, idx) => (
              <span key={finding.id} className="mx-4">
                {finding.title}
                {idx < 2 && <span className="mx-4 text-red-300">|</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Masthead */}
      <header className="bg-white border-b-4 border-double border-stone-900 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-stone-500 mb-2">
            Flow Optimized Engineering
          </div>
          <h1
            className="font-serif text-5xl md:text-6xl font-black tracking-tight text-stone-900 mb-2"
            style={{ fontFamily: "Georgia, Times New Roman, serif" }}
          >
            THE FOE OBSERVER
          </h1>
          <div className="flex items-center justify-center gap-4 text-xs text-stone-500 border-t border-b border-stone-300 py-2 mt-4">
            <span>{formatDate(scanDate)}</span>
            <span className="w-1 h-1 bg-stone-400 rounded-full" />
            <span>Assessment Edition</span>
            <span className="w-1 h-1 bg-stone-400 rounded-full" />
            <span>Vol. XXIX, No. {overallScore}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area - 8 columns */}
          <main className="col-span-12 lg:col-span-8">
            {/* Headline Article */}
            <article className="mb-12">
              <h2
                className="font-serif text-4xl md:text-5xl font-bold leading-tight text-stone-900 mb-4"
                style={{ fontFamily: "Georgia, Times New Roman, serif" }}
              >
                {repository} Repository Scores {overallScore} in FOE Assessment
              </h2>

              {/* Byline */}
              <div className="flex items-center gap-3 text-sm text-stone-600 mb-6 pb-4 border-b border-stone-200">
                <span className="font-semibold">By FOE Scanner</span>
                <span className="text-stone-400">|</span>
                <span>{formatDate(scanDate)}</span>
                <span className="text-stone-400">|</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                  {maturityLevel} Maturity
                </span>
              </div>

              {/* Score Visual Placeholder */}
              <div
                ref={(el) => {
                  dimensionRefs.current["score"] = el;
                }}
                className="float-right ml-6 mb-4 w-64 bg-stone-100 border border-stone-300 p-4"
              >
                <div className="text-center">
                  <div
                    className="text-6xl font-serif font-bold text-stone-900"
                    style={{ fontFamily: "Georgia, Times New Roman, serif" }}
                  >
                    {overallScore}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-stone-500 mt-1 mb-4">
                    Overall Score
                  </div>

                  {/* Mini Radar Visualization */}
                  <div className="relative w-40 h-40 mx-auto">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Background circles */}
                      {[20, 40, 60, 80, 100].map((r) => (
                        <circle
                          key={r}
                          cx="50"
                          cy="50"
                          r={r * 0.4}
                          fill="none"
                          stroke="#d6d3d1"
                          strokeWidth="0.5"
                        />
                      ))}
                      {/* Axis lines */}
                      {[0, 120, 240].map((angle) => (
                        <line
                          key={angle}
                          x1="50"
                          y1="50"
                          x2={
                            50 + 40 * Math.cos(((angle - 90) * Math.PI) / 180)
                          }
                          y2={
                            50 + 40 * Math.sin(((angle - 90) * Math.PI) / 180)
                          }
                          stroke="#d6d3d1"
                          strokeWidth="0.5"
                        />
                      ))}
                      {/* Score polygon */}
                      <polygon
                        points={[
                          [
                            50 +
                              dimensions.feedback.score *
                                0.4 *
                                Math.cos((-90 * Math.PI) / 180),
                            50 +
                              dimensions.feedback.score *
                                0.4 *
                                Math.sin((-90 * Math.PI) / 180),
                          ],
                          [
                            50 +
                              dimensions.understanding.score *
                                0.4 *
                                Math.cos((30 * Math.PI) / 180),
                            50 +
                              dimensions.understanding.score *
                                0.4 *
                                Math.sin((30 * Math.PI) / 180),
                          ],
                          [
                            50 +
                              dimensions.confidence.score *
                                0.4 *
                                Math.cos((150 * Math.PI) / 180),
                            50 +
                              dimensions.confidence.score *
                                0.4 *
                                Math.sin((150 * Math.PI) / 180),
                          ],
                        ]
                          .map((p) => p.join(","))
                          .join(" ")}
                        fill="rgba(245, 158, 11, 0.3)"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                    </svg>
                    {/* Labels */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-xs font-medium text-blue-600">
                      F: {dimensions.feedback.score}
                    </div>
                    <div className="absolute bottom-2 right-0 text-xs font-medium text-purple-600">
                      U: {dimensions.understanding.score}
                    </div>
                    <div className="absolute bottom-2 left-0 text-xs font-medium text-green-600">
                      C: {dimensions.confidence.score}
                    </div>
                  </div>

                  <div className="text-xs text-stone-500 mt-3 italic">
                    Fig. 1: Dimension Analysis
                  </div>
                </div>
              </div>

              {/* Lead Paragraph / Executive Summary */}
              <p
                className="text-xl leading-relaxed text-stone-700 mb-6 first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1"
                style={{ fontFamily: "Georgia, Times New Roman, serif" }}
              >
                {executiveSummary}
              </p>

              {/* Article Body - Multi-column */}
              <div
                className="columns-1 md:columns-2 gap-8 text-stone-700 leading-relaxed"
                style={{ fontFamily: "Georgia, Times New Roman, serif" }}
              >
                <p className="mb-4">
                  The assessment, conducted using FOE&apos;s critical analysis
                  mode, examined {report.methodology.filesAnalyzed} files across
                  the repository, including{" "}
                  {report.methodology.testFilesAnalyzed} test files and{" "}
                  {report.methodology.adrsAnalyzed} Architecture Decision
                  Records.
                </p>

                {/* Pull Quote */}
                <blockquote className="break-inside-avoid my-6 px-4 py-3 border-l-4 border-amber-500 bg-amber-50 italic text-lg text-stone-800">
                  &ldquo;The repository has the appearance of mature engineering
                  practices without the substance.&rdquo;
                </blockquote>

                <p className="mb-4">
                  Investigators found that while the CI pipeline boasts {12}{" "}
                  stages, critical components such as integration tests were
                  discovered to be entirely non-functional, consisting merely of
                  echo statements that create a facade of testing.
                </p>

                <p className="mb-4">
                  Perhaps most concerning is the discovery that {35} Playwright
                  test files exist within the repository, yet none are
                  configured to execute within the continuous integration
                  pipeline. This represents a significant investment in test
                  infrastructure that provides zero automated confidence.
                </p>

                <p className="mb-4">
                  Security analysts also flagged {15} vulnerabilities in the
                  project&apos;s dependencies, with {6} classified as high
                  severity. The project has shown no commit activity in over
                  three months, raising questions about its maintenance status.
                </p>
              </div>
            </article>

            {/* Dimension Breakdown Section */}
            <section className="border-t-2 border-stone-900 pt-8 mb-12">
              <h3
                className="font-serif text-3xl font-bold text-stone-900 mb-6"
                style={{ fontFamily: "Georgia, Times New Roman, serif" }}
              >
                Dimension Analysis
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Object.keys(dimensions) as DimensionKey[]).map((key) => {
                  const dim = dimensions[key];
                  const color = dimensionColors[key];

                  return (
                    <article
                      key={key}
                      ref={(el) => {
                        dimensionRefs.current[key] = el;
                      }}
                      className="border border-stone-300 p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <h4
                          className="font-serif text-xl font-bold text-stone-900"
                          style={{
                            fontFamily: "Georgia, Times New Roman, serif",
                          }}
                        >
                          {dim.name}
                        </h4>
                      </div>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span
                          className="text-4xl font-serif font-bold"
                          style={{
                            color,
                            fontFamily: "Georgia, Times New Roman, serif",
                          }}
                        >
                          {dim.score}
                        </span>
                        <span className="text-stone-500">/ {dim.max}</span>
                      </div>

                      <div className="h-2 bg-stone-200 mb-4">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${dim.score}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>

                      <div
                        className="text-sm text-stone-600 space-y-2"
                        style={{
                          fontFamily: "Georgia, Times New Roman, serif",
                        }}
                      >
                        {dim.subscores.slice(0, 2).map((sub, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="truncate pr-2">{sub.name}</span>
                            <span className="font-medium">
                              {sub.score}/{sub.max}
                            </span>
                          </div>
                        ))}
                        {dim.subscores.length > 2 && (
                          <div className="text-stone-400 text-xs italic">
                            +{dim.subscores.length - 2} more metrics...
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Critical Findings Section */}
            <section
              ref={(el) => {
                dimensionRefs.current["critical"] = el;
              }}
              className="border-t-2 border-stone-900 pt-8 mb-12"
            >
              <h3
                className="font-serif text-3xl font-bold text-stone-900 mb-6"
                style={{ fontFamily: "Georgia, Times New Roman, serif" }}
              >
                Critical Findings
              </h3>

              <div className="space-y-6">
                {criticalFailures.map((failure, idx) => (
                  <article
                    key={failure.id}
                    className="border-l-4 border-stone-900 pl-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-bold uppercase text-white ${getSeverityColor(failure.severity)}`}
                      >
                        {failure.severity}
                      </span>
                      <span className="text-xs text-stone-500 uppercase tracking-wide">
                        {failure.area}
                      </span>
                    </div>

                    <h4
                      className="font-serif text-xl font-bold text-stone-900 mb-2"
                      style={{ fontFamily: "Georgia, Times New Roman, serif" }}
                    >
                      {idx + 1}. {failure.title}
                    </h4>

                    <p
                      className="text-stone-600 mb-2 text-sm"
                      style={{ fontFamily: "Georgia, Times New Roman, serif" }}
                    >
                      {failure.impact}
                    </p>

                    <div className="text-xs text-stone-500 font-mono bg-stone-100 px-2 py-1 inline-block">
                      Evidence: {failure.evidence}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Related Stories (Recommendations) */}
            <section
              ref={(el) => {
                dimensionRefs.current["recommendations"] = el;
              }}
              className="border-t-2 border-stone-900 pt-8"
            >
              <h3
                className="font-serif text-3xl font-bold text-stone-900 mb-6"
                style={{ fontFamily: "Georgia, Times New Roman, serif" }}
              >
                Related Stories: Path Forward
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {recommendations.map((rec, idx) => (
                  <article
                    key={rec.id}
                    className="border border-stone-300 p-4 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium border rounded ${getPriorityColor(rec.priority)}`}
                      >
                        {rec.priority.replace("-", " ")}
                      </span>
                    </div>

                    <h4
                      className="font-serif text-lg font-semibold text-stone-900 mb-1"
                      style={{ fontFamily: "Georgia, Times New Roman, serif" }}
                    >
                      {rec.title}
                    </h4>

                    <p
                      className="text-sm text-stone-600"
                      style={{ fontFamily: "Georgia, Times New Roman, serif" }}
                    >
                      {rec.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </main>

          {/* Sidebar - 4 columns */}
          <aside className="col-span-12 lg:col-span-4">
            {/* In This Issue */}
            <div className="sticky top-20 space-y-6">
              <div className="bg-stone-900 text-white p-4">
                <h3
                  className="font-serif text-xl font-bold mb-4 pb-2 border-b border-stone-700"
                  style={{ fontFamily: "Georgia, Times New Roman, serif" }}
                >
                  In This Issue
                </h3>

                <nav className="space-y-3 text-sm">
                  <button
                    onClick={() => scrollToSection("score")}
                    className="block w-full text-left hover:text-amber-400 transition-colors"
                  >
                    <span className="text-amber-500 mr-2">I.</span>
                    Overall Score Analysis
                  </button>

                  {(Object.keys(dimensions) as DimensionKey[]).map(
                    (key, idx) => (
                      <button
                        key={key}
                        onClick={() => scrollToSection(key)}
                        className="block w-full text-left hover:text-amber-400 transition-colors"
                      >
                        <span className="text-amber-500 mr-2">
                          {["II", "III", "IV"][idx]}.
                        </span>
                        {dimensions[key].name} Dimension
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => scrollToSection("critical")}
                    className="block w-full text-left hover:text-amber-400 transition-colors"
                  >
                    <span className="text-amber-500 mr-2">V.</span>
                    Critical Findings
                  </button>

                  <button
                    onClick={() => scrollToSection("recommendations")}
                    className="block w-full text-left hover:text-amber-400 transition-colors"
                  >
                    <span className="text-amber-500 mr-2">VI.</span>
                    Recommendations
                  </button>
                </nav>
              </div>

              {/* Pull Quote Box */}
              <div className="border-t-4 border-b-4 border-stone-900 py-4 px-2">
                <blockquote
                  className="text-xl italic text-stone-800 leading-relaxed"
                  style={{ fontFamily: "Georgia, Times New Roman, serif" }}
                >
                  &ldquo;E2E tests provide zero automated confidence &mdash;
                  they might as well not exist.&rdquo;
                </blockquote>
                <cite className="block text-sm text-stone-500 mt-2 not-italic">
                  &mdash; FOE Assessment Finding
                </cite>
              </div>

              {/* Strengths Box */}
              <div className="bg-green-50 border border-green-200 p-4">
                <h4
                  className="font-serif text-lg font-bold text-green-900 mb-3"
                  style={{ fontFamily: "Georgia, Times New Roman, serif" }}
                >
                  Bright Spots
                </h4>

                <div className="space-y-3 text-sm">
                  {strengths.map((strength) => (
                    <div
                      key={strength.id}
                      className="pb-3 border-b border-green-200 last:border-0 last:pb-0"
                    >
                      <div className="font-medium text-green-900">
                        {strength.area}
                      </div>
                      <div className="text-green-700 text-xs mt-1">
                        {strength.evidence}
                      </div>
                      {strength.caveat && (
                        <div className="text-green-600 text-xs italic mt-1">
                          Note: {strength.caveat}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Methodology Box */}
              <div className="bg-stone-100 border border-stone-300 p-4">
                <h4
                  className="font-serif text-lg font-bold text-stone-900 mb-3"
                  style={{ fontFamily: "Georgia, Times New Roman, serif" }}
                >
                  About This Assessment
                </h4>

                <div className="space-y-2 text-sm text-stone-700">
                  <div className="flex justify-between">
                    <span>Files Analyzed:</span>
                    <span className="font-medium">
                      {report.methodology.filesAnalyzed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Test Files:</span>
                    <span className="font-medium">
                      {report.methodology.testFilesAnalyzed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ADRs Reviewed:</span>
                    <span className="font-medium">
                      {report.methodology.adrsAnalyzed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assessment Mode:</span>
                    <span className="font-medium capitalize">
                      {report.assessmentMode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-200 p-3 text-center">
                  <div className="text-2xl font-serif font-bold text-red-700">
                    {
                      criticalFailures.filter((f) => f.severity === "critical")
                        .length
                    }
                  </div>
                  <div className="text-xs text-red-600 uppercase tracking-wide">
                    Critical Issues
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 text-center">
                  <div className="text-2xl font-serif font-bold text-amber-700">
                    {
                      recommendations.filter((r) => r.priority === "immediate")
                        .length
                    }
                  </div>
                  <div className="text-xs text-amber-600 uppercase tracking-wide">
                    Immediate Actions
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h5
                className="font-serif text-white font-bold mb-2"
                style={{ fontFamily: "Georgia, Times New Roman, serif" }}
              >
                The FOE Observer
              </h5>
              <p className="text-stone-500">
                Delivering engineering excellence insights since the dawn of
                DevOps.
              </p>
            </div>
            <div>
              <h5
                className="font-serif text-white font-bold mb-2"
                style={{ fontFamily: "Georgia, Times New Roman, serif" }}
              >
                Assessment Details
              </h5>
              <p className="text-stone-500">
                Repository: {repository}
                <br />
                Scan Date: {formatDate(scanDate)}
                <br />
                Mode: {report.assessmentMode}
              </p>
            </div>
            <div>
              <h5
                className="font-serif text-white font-bold mb-2"
                style={{ fontFamily: "Georgia, Times New Roman, serif" }}
              >
                Confidence Notes
              </h5>
              <p className="text-stone-500 text-xs">
                {report.methodology.confidenceNotes[0]}
              </p>
            </div>
          </div>

          <div className="border-t border-stone-800 mt-6 pt-6 text-center text-xs text-stone-600">
            Flow Optimized Engineering Assessment Report |{" "}
            {formatDate(scanDate)} | All findings verified with high confidence
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
