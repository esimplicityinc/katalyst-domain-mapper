import { AlertTriangle } from 'lucide-react';
import type { FOEReport } from '../types/report';

interface TriangleDiagramProps {
  report: FOEReport;
}

const MIN_THRESHOLDS = {
  understanding: 35,
  feedback: 40,
  confidence: 30,
};

export function TriangleDiagram({ report }: TriangleDiagramProps) {
  const { dimensions, triangleDiagnosis } = report;
  
  const scores = {
    understanding: (dimensions.understanding.score / dimensions.understanding.maxScore) * 100,
    feedback: (dimensions.feedback.score / dimensions.feedback.maxScore) * 100,
    confidence: (dimensions.confidence.score / dimensions.confidence.maxScore) * 100,
  };

  // Triangle dimensions
  const size = 300;
  const center = size / 2;
  const radius = size * 0.35;

  // Vertices of equilateral triangle (pointing up)
  const vertices = {
    understanding: { x: center, y: center - radius, angle: -90 }, // Top
    feedback: { x: center - radius * Math.cos(Math.PI / 6), y: center + radius * Math.sin(Math.PI / 6), angle: 210 }, // Bottom left
    confidence: { x: center + radius * Math.cos(Math.PI / 6), y: center + radius * Math.sin(Math.PI / 6), angle: -30 }, // Bottom right
  };

  // Calculate point on line from center to vertex based on score
  const getScorePoint = (dimension: 'understanding' | 'feedback' | 'confidence') => {
    const vertex = vertices[dimension];
    const score = scores[dimension] / 100;
    return {
      x: center + (vertex.x - center) * score,
      y: center + (vertex.y - center) * score,
    };
  };

  const scorePoints = {
    understanding: getScorePoint('understanding'),
    feedback: getScorePoint('feedback'),
    confidence: getScorePoint('confidence'),
  };

  // Calculate minimum threshold points
  const getThresholdPoint = (dimension: 'understanding' | 'feedback' | 'confidence') => {
    const vertex = vertices[dimension];
    const threshold = MIN_THRESHOLDS[dimension] / 100;
    return {
      x: center + (vertex.x - center) * threshold,
      y: center + (vertex.y - center) * threshold,
    };
  };

  const thresholdPoints = {
    understanding: getThresholdPoint('understanding'),
    feedback: getThresholdPoint('feedback'),
    confidence: getThresholdPoint('confidence'),
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Cognitive Triangle Assessment
      </h3>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* SVG Triangle */}
        <div className="flex-shrink-0">
          <svg width={size} height={size} className="mx-auto">
            {/* Background triangle */}
            <polygon
              points={`${vertices.understanding.x},${vertices.understanding.y} ${vertices.feedback.x},${vertices.feedback.y} ${vertices.confidence.x},${vertices.confidence.y}`}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />

            {/* Minimum threshold zone (safe zone) */}
            <polygon
              points={`${thresholdPoints.understanding.x},${thresholdPoints.understanding.y} ${thresholdPoints.feedback.x},${thresholdPoints.feedback.y} ${thresholdPoints.confidence.x},${thresholdPoints.confidence.y}`}
              fill="#dcfce7"
              fillOpacity="0.3"
              stroke="#86efac"
              strokeWidth="1"
              strokeDasharray="4 2"
            />

            {/* Axes from center to vertices */}
            <line
              x1={center}
              y1={center}
              x2={vertices.understanding.x}
              y2={vertices.understanding.y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <line
              x1={center}
              y1={center}
              x2={vertices.feedback.x}
              y2={vertices.feedback.y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <line
              x1={center}
              y1={center}
              x2={vertices.confidence.x}
              y2={vertices.confidence.y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* Current score triangle */}
            <polygon
              points={`${scorePoints.understanding.x},${scorePoints.understanding.y} ${scorePoints.feedback.x},${scorePoints.feedback.y} ${scorePoints.confidence.x},${scorePoints.confidence.y}`}
              fill="#3b82f6"
              fillOpacity="0.2"
              stroke="#3b82f6"
              strokeWidth="2"
            />

            {/* Score points */}
            <circle
              cx={scorePoints.understanding.x}
              cy={scorePoints.understanding.y}
              r="6"
              fill="#9333ea"
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx={scorePoints.feedback.x}
              cy={scorePoints.feedback.y}
              r="6"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx={scorePoints.confidence.x}
              cy={scorePoints.confidence.y}
              r="6"
              fill="#10b981"
              stroke="white"
              strokeWidth="2"
            />

            {/* Labels */}
            <text
              x={vertices.understanding.x}
              y={vertices.understanding.y - 15}
              textAnchor="middle"
              className="text-sm font-semibold fill-gray-900 dark:fill-white"
            >
              Understanding
            </text>
            <text
              x={vertices.understanding.x}
              y={vertices.understanding.y - 2}
              textAnchor="middle"
              className="text-xs fill-purple-600 dark:fill-purple-400 font-bold"
            >
              {Math.round(scores.understanding)}
            </text>

            <text
              x={vertices.feedback.x - 15}
              y={vertices.feedback.y + 20}
              textAnchor="middle"
              className="text-sm font-semibold fill-gray-900 dark:fill-white"
            >
              Feedback
            </text>
            <text
              x={vertices.feedback.x + 15}
              y={vertices.feedback.y + 5}
              textAnchor="middle"
              className="text-xs fill-blue-600 dark:fill-blue-400 font-bold"
            >
              {Math.round(scores.feedback)}
            </text>

            <text
              x={vertices.confidence.x + 15}
              y={vertices.confidence.y + 20}
              textAnchor="middle"
              className="text-sm font-semibold fill-gray-900 dark:fill-white"
            >
              Confidence
            </text>
            <text
              x={vertices.confidence.x - 15}
              y={vertices.confidence.y + 5}
              textAnchor="middle"
              className="text-xs fill-green-600 dark:fill-green-400 font-bold"
            >
              {Math.round(scores.confidence)}
            </text>
          </svg>
        </div>

        {/* Diagnosis info */}
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Cycle Health
            </h4>
            <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
              {triangleDiagnosis.cycleHealth}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Weakest Dimension
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                {triangleDiagnosis.weakestDimension}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({triangleDiagnosis.weakestScore})
              </span>
            </div>
          </div>

          {triangleDiagnosis.belowMinimum.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                    Below Minimum Threshold
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    {triangleDiagnosis.belowMinimum.map((dim) => (
                      <span key={dim} className="capitalize">
                        {dim} (min: {MIN_THRESHOLDS[dim as keyof typeof MIN_THRESHOLDS]})
                      </span>
                    )).reduce((prev, curr) => <>{prev}, {curr}</>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Pattern Identified
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {triangleDiagnosis.pattern}
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Recommended Intervention
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {triangleDiagnosis.intervention}
            </p>
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Minimum Thresholds (Safe Zone)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-purple-600 dark:text-purple-400 font-medium">Understanding:</span> ≥{MIN_THRESHOLDS.understanding}
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">Feedback:</span> ≥{MIN_THRESHOLDS.feedback}
              </div>
              <div>
                <span className="text-green-600 dark:text-green-400 font-medium">Confidence:</span> ≥{MIN_THRESHOLDS.confidence}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
