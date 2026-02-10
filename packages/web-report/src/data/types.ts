export type Severity = "critical" | "high" | "medium" | "low";
export type MaturityLevel = "Emerging" | "Developing" | "Optimized";
export type Confidence = "high" | "medium" | "low";

export interface DimensionScore {
  name: string;
  score: number;
  max: number;
  confidence: Confidence;
  color: string;
  subscores: SubScore[];
}

export interface SubScore {
  name: string;
  score: number;
  max: number;
  evidence: string[];
  gaps: string[];
  deductions?: string[];
}

export interface Finding {
  id: string;
  area: string;
  severity: Severity;
  title: string;
  evidence: string;
  impact: string;
  recommendation: string;
  location?: string;
}

export interface Strength {
  id: string;
  area: string;
  evidence: string;
  caveat?: string;
}

export interface Recommendation {
  id: string;
  priority: "immediate" | "short-term" | "medium-term";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

export interface FOEReport {
  repository: string;
  scanDate: string;
  overallScore: number;
  maturityLevel: MaturityLevel;
  assessmentMode: "standard" | "critical";

  executiveSummary: string;

  dimensions: {
    feedback: DimensionScore;
    understanding: DimensionScore;
    confidence: DimensionScore;
  };

  criticalFailures: Finding[];
  strengths: Strength[];
  gaps: Finding[];
  recommendations: Recommendation[];

  methodology: {
    filesAnalyzed: number;
    testFilesAnalyzed: number;
    adrsAnalyzed: number;
    confidenceNotes: string[];
  };
}
