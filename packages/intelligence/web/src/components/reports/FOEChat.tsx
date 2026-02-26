import { OpenCodeChat } from "@katalyst/chat";
import type { FOEReport } from "../../types/report";
import type { Project } from "../../types/project";

interface FOEChatProps {
  report: FOEReport;
  project: Project;
  onReportUpdated?: () => void;
}

const FOE_SUGGESTIONS = [
  "Why is my Feedback score low?",
  "What should I improve first?",
  "Explain my cognitive triangle diagnosis",
  "How can I improve test confidence?",
  "What's blocking me from reaching Practicing maturity?",
];

export function FOEChat({ report, project }: FOEChatProps) {
  const dims = report.dimensions;
  const triangle = report.triangleDiagnosis;

  return (
    <OpenCodeChat
      agentName="foe-assessment-coach"
      model={{
        providerID: "amazon-bedrock",
        modelID: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
      }}
      accentColor="blue"
      title="FOE Assessment Coach"
      subtitle="Ask questions about your FOE assessment results, dimension scores, cognitive triangle diagnosis, or get guidance on improvement priorities."
      suggestions={FOE_SUGGESTIONS}
      inputPlaceholder="Ask about your FOE assessment..."
      buildContextPreamble={() =>
        `[Context: You are coaching a team on their Flow Optimized Engineering (FOE) assessment.

PROJECT: ${project.name}
REPOSITORY: ${report.repository.name} (${report.repository.path})
TECH_STACK: ${report.repository.techStack.join(", ")}
MONOREPO: ${report.repository.monorepo ? "Yes" : "No"}

SCAN_DATE: ${report.generated}
OVERALL_SCORE: ${report.overallScore}/100
MATURITY_LEVEL: ${report.maturityLevel}

DIMENSION_SCORES:
- Understanding: ${dims.understanding.score}/${dims.understanding.maxScore} (${((dims.understanding.score / dims.understanding.maxScore) * 100).toFixed(0)}%)
- Feedback: ${dims.feedback.score}/${dims.feedback.maxScore} (${((dims.feedback.score / dims.feedback.maxScore) * 100).toFixed(0)}%)
- Confidence: ${dims.confidence.score}/${dims.confidence.maxScore} (${((dims.confidence.score / dims.confidence.maxScore) * 100).toFixed(0)}%)

COGNITIVE_TRIANGLE_DIAGNOSIS:
- Cycle Health: ${triangle.cycleHealth}
- Weakest Dimension: ${triangle.weakestDimension} (${triangle.weakestScore})
- Pattern: ${triangle.pattern}
- Intervention: ${triangle.intervention}
${triangle.belowMinimum.length > 0 ? `- Below Minimum Thresholds: ${triangle.belowMinimum.join(", ")}` : ""}

TOP_3_STRENGTHS:
${report.topStrengths.map((s) => `- ${s.area} (${s.score}): ${s.reason}`).join("\n")}

TOP_3_GAPS:
${report.topGaps.map((g, i) => `${i + 1}. ${g.area} (Impact: high): ${g.reason}`).join("\n")}

IMPORTANT: Use the FOE Field Guide methods to provide specific, actionable recommendations. Reference specific methods, observations, and maturity levels when relevant.]

`
      }
      sessionTitle={`FOE Assessment: ${project.name}`}
      reinitTrigger={report.generated}
    />
  );
}
