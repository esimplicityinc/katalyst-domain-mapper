'use client';

import Link from 'next/link';
import { MapPin, Flag, Target, ArrowRight, CheckCircle, Circle } from 'lucide-react';
import report from '@/data/report.json';

interface Station {
  name: string;
  range: string;
  minScore: number;
  maxScore: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  characteristics: string[];
}

const stations: Station[] = [
  {
    name: 'Emerging',
    range: '0-50',
    minScore: 0,
    maxScore: 50,
    color: '#f59e0b',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    description: 'Foundation building phase with significant gaps in engineering practices.',
    characteristics: [
      'Basic CI/CD exists but may have gaps',
      'Documentation is incomplete or outdated',
      'Test coverage is limited or not enforced',
      'Security practices are reactive',
    ],
  },
  {
    name: 'Developing',
    range: '51-75',
    minScore: 51,
    maxScore: 75,
    color: '#3b82f6',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    description: 'Growing maturity with established practices being refined.',
    characteristics: [
      'CI/CD pipeline is comprehensive',
      'Documentation is maintained and current',
      'Test coverage meets minimum thresholds',
      'Security scanning is automated',
    ],
  },
  {
    name: 'Optimized',
    range: '76-100',
    minScore: 76,
    maxScore: 100,
    color: '#10b981',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
    description: 'Excellence achieved with continuous improvement culture.',
    characteristics: [
      'Fast feedback loops under 10 minutes',
      'Living documentation with automation',
      'High test coverage with quality focus',
      'Proactive security with shift-left practices',
    ],
  },
];

interface RecommendationWithPoints {
  id: string;
  priority: string;
  title: string;
  description: string;
  impact: string;
  estimatedPoints: number;
}

// Estimate points for each recommendation based on impact
const getEstimatedPoints = (rec: { impact: string }): number => {
  switch (rec.impact) {
    case 'high':
      return 8;
    case 'medium':
      return 5;
    case 'low':
      return 3;
    default:
      return 4;
  }
};

export default function Template6TimelinePage() {
  const { overallScore, maturityLevel, repository, scanDate, recommendations, criticalFailures } =
    report;

  // Determine current station
  const currentStation = stations.find(
    (s) => overallScore >= s.minScore && overallScore <= s.maxScore
  )!;
  const currentStationIndex = stations.indexOf(currentStation);

  // Calculate next milestone
  const nextStation = stations[currentStationIndex + 1];
  const pointsToNextLevel = nextStation ? nextStation.minScore - overallScore : 0;

  // Calculate position percentage within timeline (0-100)
  const timelinePosition = Math.min((overallScore / 100) * 100, 100);

  // Enhance recommendations with estimated points
  const enhancedRecommendations: RecommendationWithPoints[] = recommendations.map((rec) => ({
    ...rec,
    estimatedPoints: getEstimatedPoints(rec),
  }));

  // Sort by estimated points (highest impact first)
  const sortedRecommendations = [...enhancedRecommendations].sort(
    (a, b) => b.estimatedPoints - a.estimatedPoints
  );

  // Group recommendations by priority
  const immediateRecs = sortedRecommendations.filter((r) => r.priority === 'immediate');
  const shortTermRecs = sortedRecommendations.filter((r) => r.priority === 'short-term');
  const mediumTermRecs = sortedRecommendations.filter((r) => r.priority === 'medium-term');

  // Calculate potential score if all immediate actions are completed
  const potentialScoreImmediate =
    overallScore + immediateRecs.reduce((sum, r) => sum + r.estimatedPoints, 0);
  const potentialScoreShortTerm =
    potentialScoreImmediate + shortTermRecs.reduce((sum, r) => sum + r.estimatedPoints, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-medium">Back to Templates</span>
            </Link>
            <div className="text-sm text-slate-400">Template 6: Timeline Journey</div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-2">{repository}</h1>
          <p className="text-slate-400">Your Journey to Engineering Excellence | {scanDate}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Timeline Hero Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-8 text-center">Maturity Journey</h2>

          {/* Visual Timeline */}
          <div className="relative mb-12">
            {/* Timeline Track */}
            <div className="h-3 bg-slate-700 rounded-full relative overflow-hidden">
              {/* Progress Fill */}
              <div
                className="absolute h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${timelinePosition}%`,
                  background: `linear-gradient(90deg, ${currentStation.color}, ${currentStation.color}aa)`,
                }}
              />
            </div>

            {/* Station Markers */}
            <div className="absolute top-0 left-0 w-full h-3 flex justify-between items-center">
              {/* Start marker */}
              <div className="w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-500" />

              {/* 50 marker (Emerging -> Developing boundary) */}
              <div
                className="absolute w-4 h-4 rounded-full border-2"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: overallScore >= 51 ? '#3b82f6' : '#475569',
                  borderColor: overallScore >= 51 ? '#3b82f6' : '#64748b',
                }}
              />

              {/* 75 marker (Developing -> Optimized boundary) */}
              <div
                className="absolute w-4 h-4 rounded-full border-2"
                style={{
                  left: '75%',
                  transform: 'translateX(-50%)',
                  backgroundColor: overallScore >= 76 ? '#10b981' : '#475569',
                  borderColor: overallScore >= 76 ? '#10b981' : '#64748b',
                }}
              />

              {/* End marker */}
              <div className="w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-500" />
            </div>

            {/* "You Are Here" Pin */}
            <div
              className="absolute transition-all duration-1000"
              style={{
                left: `${timelinePosition}%`,
                top: '-40px',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="flex flex-col items-center">
                <div className="bg-slate-900 border-2 border-amber-500 rounded-lg px-3 py-1.5 mb-1 shadow-lg shadow-amber-500/20">
                  <span className="text-amber-400 font-bold text-lg">{overallScore}</span>
                </div>
                <MapPin className="w-8 h-8 text-amber-500 drop-shadow-lg" fill="#f59e0b" />
              </div>
            </div>

            {/* Station Labels */}
            <div className="flex justify-between mt-8">
              {stations.map((station, idx) => {
                const isActive = station.name === maturityLevel;
                const isPast = overallScore > station.maxScore;
                const isFuture = overallScore < station.minScore;

                return (
                  <div
                    key={station.name}
                    className={`flex-1 ${idx === 1 ? 'text-center' : idx === 2 ? 'text-right' : ''}`}
                  >
                    <div className="flex items-center gap-2 justify-start md:justify-center">
                      {isActive ? (
                        <MapPin className="w-5 h-5" style={{ color: station.color }} />
                      ) : isPast ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Flag className="w-5 h-5 text-slate-500" />
                      )}
                      <span
                        className={`font-semibold ${
                          isActive ? 'text-white' : isFuture ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {station.name}
                      </span>
                    </div>
                    <div
                      className={`text-sm mt-1 ${
                        isActive ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {station.range} points
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Position & Next Milestone */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* You Are Here Card */}
            <div
              className={`rounded-xl border-2 p-6 ${currentStation.bgColor} ${currentStation.borderColor}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6" style={{ color: currentStation.color }} />
                <h3 className="text-lg font-semibold text-white">You Are Here</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold" style={{ color: currentStation.color }}>
                  {overallScore}
                </span>
                <span className="text-slate-400">/ 100</span>
              </div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                style={{ backgroundColor: `${currentStation.color}30` }}
              >
                <span className="text-sm font-medium" style={{ color: currentStation.color }}>
                  {maturityLevel} Stage
                </span>
              </div>
              <p className="text-slate-300 text-sm">{currentStation.description}</p>
            </div>

            {/* Next Milestone Card */}
            {nextStation ? (
              <div className="rounded-xl border-2 border-slate-600 bg-slate-800/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6" style={{ color: nextStation.color }} />
                  <h3 className="text-lg font-semibold text-white">Next Milestone</h3>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold" style={{ color: nextStation.color }}>
                    {nextStation.minScore}
                  </span>
                  <span className="text-slate-400">points needed</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-slate-400 text-sm">Gap to close:</span>
                  <span className="text-lg font-semibold text-white">+{pointsToNextLevel} points</span>
                </div>
                <p className="text-slate-300 text-sm">{nextStation.description}</p>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-white">Excellence Achieved!</h3>
                </div>
                <p className="text-slate-300 text-sm">
                  You've reached the Optimized stage. Focus on maintaining excellence and continuous
                  improvement.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Station Details */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stations.map((station, idx) => {
            const isActive = station.name === maturityLevel;
            const isPast = overallScore > station.maxScore;

            return (
              <div
                key={station.name}
                className={`rounded-xl border-2 p-6 transition-all ${
                  isActive
                    ? `${station.bgColor} ${station.borderColor} ring-2 ring-offset-2 ring-offset-slate-900`
                    : isPast
                      ? 'bg-slate-800/30 border-slate-700/30'
                      : 'bg-slate-800/50 border-slate-700/50'
                }`}
                style={isActive ? { ['--tw-ring-color' as string]: station.color } : {}}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <MapPin className="w-5 h-5" style={{ color: station.color }} />
                    ) : isPast ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                    <h3
                      className={`font-semibold ${
                        isActive ? 'text-white' : isPast ? 'text-slate-400' : 'text-slate-300'
                      }`}
                    >
                      {station.name}
                    </h3>
                  </div>
                  <span className="text-sm text-slate-500">{station.range}</span>
                </div>

                <p
                  className={`text-sm mb-4 ${
                    isActive ? 'text-slate-200' : 'text-slate-400'
                  }`}
                >
                  {station.description}
                </p>

                <ul className="space-y-2">
                  {station.characteristics.map((char, charIdx) => (
                    <li
                      key={charIdx}
                      className={`flex items-start gap-2 text-sm ${
                        isActive ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      <ArrowRight
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: isActive ? station.color : '#64748b' }}
                      />
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Progress Tracker - Impact Analysis */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Progress Tracker: Path to {nextStation?.name || 'Excellence'}
          </h2>

          {/* Projected Scores */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <div className="text-sm text-slate-400 mb-1">Current Score</div>
              <div className="text-3xl font-bold text-amber-400">{overallScore}</div>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <div className="text-sm text-slate-400 mb-1">After Immediate Actions</div>
              <div className="text-3xl font-bold text-blue-400">
                ~{Math.min(potentialScoreImmediate, 100)}
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <div className="text-sm text-slate-400 mb-1">After Short-term Actions</div>
              <div className="text-3xl font-bold text-emerald-400">
                ~{Math.min(potentialScoreShortTerm, 100)}
              </div>
            </div>
          </div>

          {/* Highest Impact Recommendations */}
          <h3 className="text-lg font-semibold text-white mb-4">
            Highest Impact Recommendations
          </h3>
          <div className="space-y-3">
            {sortedRecommendations.slice(0, 5).map((rec, idx) => (
              <div
                key={rec.id}
                className="flex items-center gap-4 bg-slate-700/30 rounded-xl p-4"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    idx === 0
                      ? 'bg-amber-500/20 text-amber-400'
                      : idx === 1
                        ? 'bg-slate-500/20 text-slate-300'
                        : idx === 2
                          ? 'bg-orange-700/20 text-orange-400'
                          : 'bg-slate-600/20 text-slate-400'
                  }`}
                >
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{rec.title}</div>
                  <div className="text-sm text-slate-400">{rec.description}</div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${
                      rec.impact === 'high'
                        ? 'text-emerald-400'
                        : rec.impact === 'medium'
                          ? 'text-blue-400'
                          : 'text-slate-400'
                    }`}
                  >
                    +{rec.estimatedPoints}
                  </div>
                  <div className="text-xs text-slate-500">est. points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items by Priority */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Action Items: Your Roadmap to {nextStation?.name || 'Excellence'}
          </h2>

          <div className="space-y-8">
            {/* Immediate Actions */}
            {immediateRecs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <h3 className="text-lg font-semibold text-red-400">Immediate Priority</h3>
                  <span className="text-sm text-slate-500">
                    (+{immediateRecs.reduce((sum, r) => sum + r.estimatedPoints, 0)} potential points)
                  </span>
                </div>
                <div className="space-y-3 pl-6 border-l-2 border-red-500/30">
                  {immediateRecs.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-white">{rec.title}</div>
                          <div className="text-sm text-slate-400 mt-1">{rec.description}</div>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                          <span>+{rec.estimatedPoints}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Short-term Actions */}
            {shortTermRecs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <h3 className="text-lg font-semibold text-amber-400">Short-term Priority</h3>
                  <span className="text-sm text-slate-500">
                    (+{shortTermRecs.reduce((sum, r) => sum + r.estimatedPoints, 0)} potential points)
                  </span>
                </div>
                <div className="space-y-3 pl-6 border-l-2 border-amber-500/30">
                  {shortTermRecs.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-white">{rec.title}</div>
                          <div className="text-sm text-slate-400 mt-1">{rec.description}</div>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                          <span>+{rec.estimatedPoints}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medium-term Actions */}
            {mediumTermRecs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <h3 className="text-lg font-semibold text-blue-400">Medium-term Priority</h3>
                  <span className="text-sm text-slate-500">
                    (+{mediumTermRecs.reduce((sum, r) => sum + r.estimatedPoints, 0)} potential points)
                  </span>
                </div>
                <div className="space-y-3 pl-6 border-l-2 border-blue-500/30">
                  {mediumTermRecs.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-white">{rec.title}</div>
                          <div className="text-sm text-slate-400 mt-1">{rec.description}</div>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                          <span>+{rec.estimatedPoints}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Critical Failures Note */}
          {criticalFailures.length > 0 && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {criticalFailures.length} Critical Issues Must Be Addressed
              </div>
              <p className="text-sm text-slate-400">
                Resolving critical failures is essential before meaningful progress can be made on
                the maturity journey.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          FOE Assessment Report | Generated {scanDate}
        </div>
      </footer>
    </div>
  );
}
