"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Download, CheckCircle } from "lucide-react";
import type { FOEReport } from "@/data/types";

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

const steps: WizardStep[] = [
  {
    id: "metadata",
    title: "Repository Info",
    description: "Basic information about the project being assessed",
  },
  {
    id: "feedback",
    title: "Feedback Dimension",
    description: "CI/CD, deployment frequency, test speed",
  },
  {
    id: "understanding",
    title: "Understanding Dimension",
    description: "Architecture, documentation, domain modeling",
  },
  {
    id: "confidence",
    title: "Confidence Dimension",
    description: "Test coverage, static analysis, stability",
  },
  {
    id: "findings",
    title: "Strengths & Gaps",
    description: "What's working well and what needs improvement",
  },
  {
    id: "recommendations",
    title: "Recommendations",
    description: "Prioritized next steps",
  },
  {
    id: "review",
    title: "Review & Export",
    description: "Review your assessment and export JSON",
  },
];

interface AssessmentWizardProps {
  onComplete: (report: Partial<FOEReport>) => void;
}

export function AssessmentWizard({ onComplete }: AssessmentWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<FOEReport>>({
    repository: "",
    scanDate: new Date().toISOString(),
    assessmentMode: "standard",
    dimensions: {
      feedback: {
        name: "Feedback",
        score: 0,
        max: 100,
        subscores: [],
        color: "#3B82F6",
        confidence: "medium",
      },
      understanding: {
        name: "Understanding",
        score: 0,
        max: 100,
        subscores: [],
        color: "#8B5CF6",
        confidence: "medium",
      },
      confidence: {
        name: "Confidence",
        score: 0,
        max: 100,
        subscores: [],
        color: "#10B981",
        confidence: "medium",
      },
    },
    strengths: [],
    gaps: [],
    recommendations: [],
    criticalFailures: [],
  });

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    // Calculate overall score
    const overallScore = Math.round(
      (formData.dimensions?.feedback.score ?? 0) * 0.35 +
        (formData.dimensions?.understanding.score ?? 0) * 0.35 +
        (formData.dimensions?.confidence.score ?? 0) * 0.3,
    );

    // Determine maturity level
    let maturityLevel: "Emerging" | "Developing" | "Optimized" = "Emerging";
    if (overallScore >= 76) maturityLevel = "Optimized";
    else if (overallScore >= 51) maturityLevel = "Developing";

    const completeReport: Partial<FOEReport> = {
      ...formData,
      overallScore,
      maturityLevel,
      executiveSummary:
        formData.executiveSummary || "Manual assessment completed",
      methodology: {
        filesAnalyzed: 0,
        testFilesAnalyzed: 0,
        adrsAnalyzed: 0,
        confidenceNotes: ["Manual assessment"],
      },
    };

    onComplete(completeReport);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
            complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Step Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStepIndex(index)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                index === currentStepIndex
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : index < currentStepIndex
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {index < currentStepIndex && <CheckCircle className="w-4 h-4" />}
              <span>{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {currentStep.title}
        </h2>
        <p className="text-gray-600 mb-6">{currentStep.description}</p>

        {/* Step Content Components */}
        <div className="space-y-6">
          {currentStep.id === "metadata" && (
            <MetadataStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep.id === "feedback" && (
            <DimensionStep
              dimension="feedback"
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {currentStep.id === "understanding" && (
            <DimensionStep
              dimension="understanding"
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {currentStep.id === "confidence" && (
            <DimensionStep
              dimension="confidence"
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {currentStep.id === "findings" && (
            <FindingsStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep.id === "recommendations" && (
            <RecommendationsStep
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {currentStep.id === "review" && <ReviewStep formData={formData} />}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={isFirstStep}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {isLastStep ? (
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Step Components

function MetadataStep({
  formData,
  setFormData,
}: {
  formData: Partial<FOEReport>;
  setFormData: (data: Partial<FOEReport>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Repository Name *
        </label>
        <input
          type="text"
          value={formData.repository || ""}
          onChange={(e) =>
            setFormData({ ...formData, repository: e.target.value })
          }
          placeholder="my-awesome-project"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Executive Summary
        </label>
        <textarea
          value={formData.executiveSummary || ""}
          onChange={(e) =>
            setFormData({ ...formData, executiveSummary: e.target.value })
          }
          placeholder="Brief overview of the assessment findings..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function DimensionStep({
  dimension,
  formData,
  setFormData,
}: {
  dimension: "feedback" | "understanding" | "confidence";
  formData: Partial<FOEReport>;
  setFormData: (data: Partial<FOEReport>) => void;
}) {
  const dimensionData = formData.dimensions?.[dimension];

  const handleScoreChange = (score: number) => {
    setFormData({
      ...formData,
      dimensions: {
        ...formData.dimensions!,
        [dimension]: {
          ...dimensionData!,
          score,
        },
      },
    });
  };

  const dimensionInfo = {
    feedback: {
      color: "#3B82F6",
      aspects: [
        "CI/CD pipeline speed (<10 minutes)",
        "Deployment frequency (daily or more)",
        "Test execution time",
        "Feedback loop investments",
      ],
    },
    understanding: {
      color: "#8B5CF6",
      aspects: [
        "Architecture documentation",
        "Domain modeling (DDD patterns)",
        "Bounded contexts clarity",
        "README and onboarding quality",
      ],
    },
    confidence: {
      color: "#10B981",
      aspects: [
        "Test coverage (>80%)",
        "Test automation strategy",
        "Static analysis tools",
        "Production stability",
      ],
    },
  };

  const info = dimensionInfo[dimension];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Score (0-100)
        </label>

        {/* Visual Slider */}
        <div className="mb-6">
          <input
            type="range"
            min="0"
            max="100"
            value={dimensionData?.score || 0}
            onChange={(e) => handleScoreChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${info.color} 0%, ${info.color} ${dimensionData?.score}%, #e5e7eb ${dimensionData?.score}%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>0</span>
            <span className="font-bold text-lg" style={{ color: info.color }}>
              {dimensionData?.score || 0}
            </span>
            <span>100</span>
          </div>
        </div>

        {/* Numeric Input */}
        <input
          type="number"
          min="0"
          max="100"
          value={dimensionData?.score || 0}
          onChange={(e) => handleScoreChange(Number(e.target.value))}
          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Assessment Guidance */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Assessment Criteria</h4>
        <ul className="space-y-2">
          {info.aspects.map((aspect, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-gray-600"
            >
              <span className="text-gray-400">•</span>
              <span>{aspect}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Maturity Guidance */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <p className="text-blue-900">
          <strong>Scoring Guide:</strong>
        </p>
        <ul className="mt-2 space-y-1 text-blue-800">
          <li>• 0-25: Hypothesized (exploring concepts)</li>
          <li>• 26-50: Emerging (beginning adoption)</li>
          <li>• 51-75: Practicing (consistent application)</li>
          <li>• 76-100: Optimized (advanced, refined)</li>
        </ul>
      </div>
    </div>
  );
}

function FindingsStep({
  formData,
  setFormData,
}: {
  formData: Partial<FOEReport>;
  setFormData: (data: Partial<FOEReport>) => void;
}) {
  const [strengthTitle, setStrengthTitle] = useState("");
  const [strengthImpact, setStrengthImpact] = useState("");
  const [gapTitle, setGapTitle] = useState("");
  const [gapImpact, setGapImpact] = useState("");

  const addStrength = () => {
    if (!strengthTitle.trim()) return;

    const newId = `strength-${Date.now()}`;
    setFormData({
      ...formData,
      strengths: [
        ...(formData.strengths || []),
        {
          id: newId,
          area: strengthTitle,
          evidence: strengthImpact,
        },
      ],
    });
    setStrengthTitle("");
    setStrengthImpact("");
  };

  const addGap = () => {
    if (!gapTitle.trim()) return;

    const newId = `gap-${Date.now()}`;
    setFormData({
      ...formData,
      gaps: [
        ...(formData.gaps || []),
        {
          id: newId,
          area: gapTitle,
          severity: "medium",
          title: gapTitle,
          impact: gapImpact,
          evidence: "",
          recommendation: "",
        },
      ],
    });
    setGapTitle("");
    setGapImpact("");
  };

  return (
    <div className="space-y-8">
      {/* Strengths */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h3>

        <div className="space-y-3 mb-4">
          <input
            type="text"
            value={strengthTitle}
            onChange={(e) => setStrengthTitle(e.target.value)}
            placeholder="What's working well?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={strengthImpact}
            onChange={(e) => setStrengthImpact(e.target.value)}
            placeholder="What's the impact?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={addStrength}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add Strength
          </button>
        </div>

        {formData.strengths && formData.strengths.length > 0 && (
          <div className="space-y-2">
            {formData.strengths.map((strength, index) => (
              <div key={index} className="bg-green-50 p-3 rounded-lg">
                <p className="font-medium text-green-900">{strength.area}</p>
                {strength.evidence && (
                  <p className="text-sm text-green-700">{strength.evidence}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gaps */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gaps</h3>

        <div className="space-y-3 mb-4">
          <input
            type="text"
            value={gapTitle}
            onChange={(e) => setGapTitle(e.target.value)}
            placeholder="What needs improvement?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={gapImpact}
            onChange={(e) => setGapImpact(e.target.value)}
            placeholder="What's the impact?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={addGap}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Add Gap
          </button>
        </div>

        {formData.gaps && formData.gaps.length > 0 && (
          <div className="space-y-2">
            {formData.gaps.map((gap, index) => (
              <div key={index} className="bg-red-50 p-3 rounded-lg">
                <p className="font-medium text-red-900">{gap.title}</p>
                {gap.impact && (
                  <p className="text-sm text-red-700">{gap.impact}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationsStep({
  formData,
  setFormData,
}: {
  formData: Partial<FOEReport>;
  setFormData: (data: Partial<FOEReport>) => void;
}) {
  const [recTitle, setRecTitle] = useState("");
  const [recRationale, setRecRationale] = useState("");

  const addRecommendation = () => {
    if (!recTitle.trim()) return;

    const newId = `rec-${Date.now()}`;
    setFormData({
      ...formData,
      recommendations: [
        ...(formData.recommendations || []),
        {
          id: newId,
          priority: "immediate",
          title: recTitle,
          description: recRationale,
          impact: "high",
        },
      ],
    });
    setRecTitle("");
    setRecRationale("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <input
          type="text"
          value={recTitle}
          onChange={(e) => setRecTitle(e.target.value)}
          placeholder="Recommendation title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <textarea
          value={recRationale}
          onChange={(e) => setRecRationale(e.target.value)}
          placeholder="Rationale and next steps..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={addRecommendation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Recommendation
        </button>
      </div>

      {formData.recommendations && formData.recommendations.length > 0 && (
        <div className="space-y-2 mt-4">
          {formData.recommendations.map((rec, index) => (
            <div key={index} className="bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-900">{rec.title}</p>
              {rec.description && (
                <p className="text-sm text-blue-700">{rec.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewStep({ formData }: { formData: Partial<FOEReport> }) {
  const overallScore = Math.round(
    (formData.dimensions?.feedback.score ?? 0) * 0.35 +
      (formData.dimensions?.understanding.score ?? 0) * 0.35 +
      (formData.dimensions?.confidence.score ?? 0) * 0.3,
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Repository</p>
          <p className="font-semibold text-gray-900">{formData.repository}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Overall Score</p>
          <p className="text-2xl font-bold text-gray-900">{overallScore}/100</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">Feedback</p>
          <p className="text-xl font-bold text-blue-900">
            {formData.dimensions?.feedback.score}/100
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-700">Understanding</p>
          <p className="text-xl font-bold text-purple-900">
            {formData.dimensions?.understanding.score}/100
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-700">Confidence</p>
          <p className="text-xl font-bold text-green-900">
            {formData.dimensions?.confidence.score}/100
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Summary</p>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• {formData.strengths?.length || 0} strengths identified</li>
          <li>• {formData.gaps?.length || 0} gaps identified</li>
          <li>• {formData.recommendations?.length || 0} recommendations</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          Click <strong>Export Report</strong> below to download your assessment
          as a JSON file. You can then upload this file to view it in any
          template.
        </p>
      </div>
    </div>
  );
}
