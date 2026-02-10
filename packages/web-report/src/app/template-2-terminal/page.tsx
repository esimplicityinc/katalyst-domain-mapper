"use client";

import report from "@/data/report.json";
import Link from "next/link";

function ProgressBar({
  value,
  max,
  width = 20,
}: {
  value: number;
  max: number;
  width?: number;
}) {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  return (
    <span className="text-green-400">
      [{"█".repeat(filled)}
      {"░".repeat(empty)}] {value}/{max}
    </span>
  );
}

function BlinkingCursor() {
  return <span className="animate-pulse text-green-400">_</span>;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <div className="text-amber-400 font-bold mt-8 mb-2">$ {children}</div>;
}

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-green-300 mb-1">
      {">"} {children}
    </div>
  );
}

function CriticalBadge() {
  return <span className="text-red-500 font-bold">[CRITICAL]</span>;
}

function HighBadge() {
  return <span className="text-orange-500 font-bold">[HIGH]</span>;
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded px-3 py-2 my-2 text-sm overflow-x-auto">
      {children}
    </div>
  );
}

export default function TerminalTemplate() {
  const dimensions = Object.values(report.dimensions);

  return (
    <main className="min-h-screen bg-[#0d1117] text-green-400 font-mono p-6 text-sm leading-relaxed">
      {/* Navigation */}
      <div className="mb-4">
        <Link
          href="/"
          className="text-gray-500 hover:text-green-400 transition-colors"
        >
          {"<"} Back to templates
        </Link>
      </div>

      {/* ASCII Header */}
      <pre className="text-green-500 text-xs mb-6">
        {`
 ███████╗ ██████╗ ███████╗    ███████╗ ██████╗ █████╗ ███╗   ██╗
 ██╔════╝██╔═══██╗██╔════╝    ██╔════╝██╔════╝██╔══██╗████╗  ██║
 █████╗  ██║   ██║█████╗      ███████╗██║     ███████║██╔██╗ ██║
 ██╔══╝  ██║   ██║██╔══╝      ╚════██║██║     ██╔══██║██║╚██╗██║
 ██║     ╚██████╔╝███████╗    ███████║╚██████╗██║  ██║██║ ╚████║
 ╚═╝      ╚═════╝ ╚══════╝    ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝
`}
      </pre>

      <div className="border-b border-gray-700 pb-4 mb-6">
        <div className="text-gray-400">
          Repository: <span className="text-white">{report.repository}</span>
        </div>
        <div className="text-gray-400">
          Scan Date: <span className="text-white">{report.scanDate}</span>
        </div>
        <div className="text-gray-400">
          Assessment Mode:{" "}
          <span className="text-amber-400">{report.assessmentMode}</span>
        </div>
      </div>

      {/* Overall Score */}
      <SectionHeader>scan --report overall</SectionHeader>
      <div className="ml-4">
        <div className="text-2xl mb-2">
          Overall Score:{" "}
          <ProgressBar value={report.overallScore} max={100} width={30} />
        </div>
        <div className="text-gray-400">
          Maturity Level:{" "}
          <span className="text-amber-400">{report.maturityLevel}</span>
        </div>
      </div>

      {/* Executive Summary */}
      <SectionHeader>cat executive-summary.txt</SectionHeader>
      <CodeBlock>
        <div className="text-gray-300 whitespace-pre-wrap">
          {report.executiveSummary}
        </div>
      </CodeBlock>

      {/* Dimension Scores */}
      <SectionHeader>analyze --dimensions</SectionHeader>
      <div className="ml-4 space-y-4">
        {dimensions.map((dim) => (
          <div key={dim.name} className="border-l-2 border-gray-700 pl-4">
            <div className="text-white font-bold mb-1">
              {dim.name.toUpperCase()}
            </div>
            <div className="mb-2">
              <ProgressBar value={dim.score} max={dim.max} />
              <span className="text-gray-500 ml-2">
                (confidence: {dim.confidence})
              </span>
            </div>

            {dim.subscores.map((sub) => (
              <div key={sub.name} className="ml-4 mb-2">
                <Prompt>
                  {sub.name}:{" "}
                  <ProgressBar value={sub.score} max={sub.max} width={15} />
                </Prompt>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Critical Failures */}
      <SectionHeader>grep -r "CRITICAL\|HIGH" ./findings/</SectionHeader>
      <div className="ml-4 space-y-4">
        {report.criticalFailures.map((failure) => (
          <div
            key={failure.id}
            className="border border-red-900/50 bg-red-950/20 rounded p-3"
          >
            <div className="mb-1">
              {failure.severity === "critical" ? (
                <CriticalBadge />
              ) : (
                <HighBadge />
              )}
              <span className="text-white ml-2 font-bold">{failure.title}</span>
              <span className="text-gray-500 ml-2">({failure.area})</span>
            </div>
            <CodeBlock>
              <div className="text-gray-400">Evidence:</div>
              <div className="text-red-400">{failure.evidence}</div>
              {failure.location && (
                <div className="text-gray-500 mt-1">
                  Location: {failure.location}
                </div>
              )}
            </CodeBlock>
            <div className="text-gray-400 text-xs mt-2">
              Impact: <span className="text-orange-400">{failure.impact}</span>
            </div>
            <div className="text-gray-400 text-xs">
              Fix:{" "}
              <span className="text-green-400">{failure.recommendation}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Strengths */}
      <SectionHeader>find ./strengths -type f -name "*.md"</SectionHeader>
      <div className="ml-4 space-y-2">
        {report.strengths.map((strength) => (
          <div key={strength.id}>
            <Prompt>
              <span className="text-green-400">[+]</span> {strength.area}
            </Prompt>
            <div className="ml-6 text-gray-400 text-xs">
              {strength.evidence}
              {strength.caveat && (
                <span className="text-amber-500">
                  {" "}
                  (caveat: {strength.caveat})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gaps */}
      <SectionHeader>diff --stat expected/ actual/</SectionHeader>
      <div className="ml-4 space-y-3">
        {report.gaps.map((gap) => (
          <div key={gap.id} className="border-l-2 border-amber-600 pl-3">
            <div className="text-amber-400">
              [-] {gap.title}{" "}
              <span className="text-gray-500">({gap.severity})</span>
            </div>
            <div className="text-gray-500 text-xs ml-4">{gap.evidence}</div>
            <div className="text-gray-400 text-xs ml-4">
              Recommendation:{" "}
              <span className="text-green-400">{gap.recommendation}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <SectionHeader>cat RECOMMENDATIONS.md | head -20</SectionHeader>
      <div className="ml-4">
        <div className="text-white mb-3">Priority Queue:</div>

        {["immediate", "short-term", "medium-term"].map((priority) => {
          const recs = report.recommendations.filter(
            (r) => r.priority === priority,
          );
          if (recs.length === 0) return null;

          return (
            <div key={priority} className="mb-4">
              <div
                className={`font-bold mb-2 ${
                  priority === "immediate"
                    ? "text-red-400"
                    : priority === "short-term"
                      ? "text-amber-400"
                      : "text-blue-400"
                }`}
              >
                [{priority.toUpperCase()}]
              </div>
              {recs.map((rec, idx) => (
                <div key={rec.id} className="ml-4 mb-1">
                  <span className="text-gray-500">{idx + 1}.</span>
                  <span className="text-white ml-2">{rec.title}</span>
                  <span className="text-gray-500 ml-2">
                    - {rec.description}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Methodology */}
      <SectionHeader>cat .foe/methodology.json</SectionHeader>
      <CodeBlock>
        <div className="text-gray-300">
          <div>{"{"}</div>
          <div className="ml-4">
            "filesAnalyzed": {report.methodology.filesAnalyzed},
          </div>
          <div className="ml-4">
            "testFilesAnalyzed": {report.methodology.testFilesAnalyzed},
          </div>
          <div className="ml-4">
            "adrsAnalyzed": {report.methodology.adrsAnalyzed},
          </div>
          <div className="ml-4">"confidenceNotes": [</div>
          {report.methodology.confidenceNotes.map((note, idx) => (
            <div key={idx} className="ml-8 text-green-400">
              "{note}"
              {idx < report.methodology.confidenceNotes.length - 1 ? "," : ""}
            </div>
          ))}
          <div className="ml-4">]</div>
          <div>{"}"}</div>
        </div>
      </CodeBlock>

      {/* Footer with blinking cursor */}
      <div className="mt-12 pt-4 border-t border-gray-700">
        <div className="text-green-400">
          scan complete.{" "}
          <span className="text-gray-500">{new Date().toISOString()}</span>
        </div>
        <div className="mt-2">
          $ <BlinkingCursor />
        </div>
      </div>

      {/* Custom styles for animation */}
      <style jsx>{`
        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}
