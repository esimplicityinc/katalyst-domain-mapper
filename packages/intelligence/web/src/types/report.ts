export interface FOEReport {
  version: string;
  generated: string;
  repository: {
    name: string;
    path: string;
    techStack: string[];
    monorepo: boolean;
  };
  dimensions: {
    feedback: DimensionReport;
    understanding: DimensionReport;
    confidence: DimensionReport;
  };
  triangleDiagnosis: {
    cycleHealth: string;
    weakestDimension: string;
    weakestScore: number;
    pattern: string;
    intervention: string;
    belowMinimum: Array<string | {
      dimension: string;
      score: number;
      minimum: number;
      risk: string;
    }>;
  };
  overallScore: number;
  maturityLevel: string;
  topStrengths: TopItem[];
  topGaps: TopItem[];
  methodology: {
    scanDuration: string;
    agentsUsed: string[];
    filesAnalyzed?: number;
    confidenceLevel: string;
  };
}

export interface DimensionReport {
  score: number;
  maxScore: number;
  subscores: Record<string, Subscore>;
  findings: Finding[];
  gaps: Gap[];
}

export interface Subscore {
  score: number;
  max: number;
  confidence: "high" | "medium" | "low";
}

export interface Finding {
  area: string;
  type: "strength" | "observation";
  description: string;
  evidence: string[];
}

export interface Gap {
  area: string;
  currentState: string;
  hypothesis: string;
  recommendation: string;
  impact: "high" | "medium" | "low";
  foeMethod?: string;
  foeInsights?: {
    understanding: string;
    feedback: string;
    confidence: string;
  };
}

export interface TopItem {
  area: string;
  score: number;
  reason: string;
}
