'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import {
  ArrowLeft,
  Users,
  Workflow,
  Cpu,
  MapPin,
  Flag,
  Target,
  ChevronRight,
  TrendingUp,
  Zap,
} from 'lucide-react';
import report from '@/data/report.json';
import {
  calculatePPTMatrix,
  getMatrixRadarData,
  getFOERadarData,
  getTimelineWithPPT,
  categorizeRecommendations,
  pptColors,
  foeColors,
  type PPTCategory,
  type MatrixCell,
} from '@/data/ppt-mapping';

type RadarView = 'foe' | 'matrix';

export default function Template11JourneyRadar() {
  const [radarView, setRadarView] = useState<RadarView>('foe');
  const [selectedCell, setSelectedCell] = useState<MatrixCell | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<PPTCategory | null>(null);

  const matrix = useMemo(() => calculatePPTMatrix(), []);
  const matrixRadarData = useMemo(() => getMatrixRadarData(matrix), [matrix]);
  const foeRadarData = useMemo(() => getFOERadarData(), []);
  const timelineData = useMemo(() => getTimelineWithPPT(report.overallScore), []);
  const categorizedRecs = useMemo(() => categorizeRecommendations(), []);

  const currentMilestoneIndex = timelineData.findIndex(
    (m) => report.overallScore >= m.minScore && report.overallScore <= m.maxScore
  );

  const pptIcons = {
    people: Users,
    process: Workflow,
    tech: Cpu,
  };

  const pptLabels = {
    people: 'People',
    process: 'Process',
    tech: 'Technology',
  };

  const dimensions = ['feedback', 'understanding', 'confidence'] as const;
  const categories: PPTCategory[] = ['people', 'process', 'tech'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors min-h-[44px] px-2 -ml-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Templates</span>
              </Link>
              <div className="h-6 w-px bg-slate-700" />
              <h1 className="text-xl font-bold text-white">Journey Radar Matrix</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-slate-300">Repository</div>
                <div className="font-semibold text-white">{report.repository}</div>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className={`text-4xl font-bold ${
                    report.overallScore < 30
                      ? 'text-red-400'
                      : report.overallScore < 50
                        ? 'text-amber-400'
                        : report.overallScore < 75
                          ? 'text-blue-400'
                          : 'text-emerald-400'
                  }`}
                >
                  {report.overallScore}
                </div>
                <div className="text-slate-300 text-sm">/100</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section: Radar + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Radar Chart */}
          <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Assessment Radar</h2>
              <div className="flex bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setRadarView('foe')}
                  aria-pressed={radarView === 'foe'}
                  className={`px-4 py-2 min-h-[44px] rounded-md text-sm font-medium transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-700 ${
                    radarView === 'foe'
                      ? 'bg-slate-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  FOE View
                </button>
                <button
                  onClick={() => setRadarView('matrix')}
                  aria-pressed={radarView === 'matrix'}
                  className={`px-4 py-2 min-h-[44px] rounded-md text-sm font-medium transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-700 ${
                    radarView === 'matrix'
                      ? 'bg-slate-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Matrix View
                </button>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {radarView === 'foe' ? (
                  <RadarChart data={foeRadarData}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: '#94a3b8', fontSize: 14 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={false}
                    />
                    {/* Ideal benchmark */}
                    <Radar
                      name="Ideal"
                      dataKey="fullMark"
                      stroke="#475569"
                      fill="transparent"
                      strokeDasharray="5 5"
                    />
                    {/* Actual scores */}
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#f1f5f9' }}
                      formatter={(value: number) => [`${value}/100`, 'Score']}
                    />
                  </RadarChart>
                ) : (
                  <RadarChart data={matrixRadarData}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={false}
                    />
                    {/* Ideal benchmark */}
                    <Radar
                      name="Ideal"
                      dataKey="fullMark"
                      stroke="#475569"
                      fill="transparent"
                      strokeDasharray="5 5"
                    />
                    {/* Actual scores with color coding */}
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#f1f5f9' }}
                      formatter={(value: number, _name: string, props: { payload?: { fullLabel?: string } }) => [
                        `${value}%`,
                        props.payload?.fullLabel || 'Score',
                      ]}
                    />
                  </RadarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 mt-4">
              {radarView === 'foe' ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-slate-300">Actual Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-dashed border-slate-500" />
                    <span className="text-sm text-slate-300">Ideal (100)</span>
                  </div>
                </>
              ) : (
                <>
                  {categories.map((cat) => {
                    const Icon = pptIcons[cat];
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <Icon
                          className="w-4 h-4"
                          style={{ color: pptColors[cat].primary }}
                        />
                        <span className="text-sm text-slate-300">{pptLabels[cat]}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            {/* Maturity Badge */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
              <div className="text-sm text-slate-300 mb-2">Maturity Level</div>
              <div
                className={`inline-flex items-center px-4 py-2 rounded-lg font-bold text-lg ${
                  report.maturityLevel === 'Emerging'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : report.maturityLevel === 'Developing'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {report.maturityLevel}
              </div>
            </div>

            {/* FOE Dimension Scores */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
              <div className="text-sm text-slate-300 mb-4">FOE Dimensions</div>
              {dimensions.map((dim) => {
                const dimData = report.dimensions[dim];
                return (
                  <div key={dim} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-sm font-medium capitalize"
                        style={{ color: foeColors[dim].primary }}
                      >
                        {dim}
                      </span>
                      <span className="text-sm text-slate-300">
                        {dimData.score}/{dimData.max}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 motion-reduce:transition-none"
                        style={{
                          width: `${(dimData.score / dimData.max) * 100}%`,
                          backgroundColor: foeColors[dim].primary,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PPT Summary */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
              <div className="text-sm text-slate-300 mb-4">People / Process / Tech</div>
              {categories.map((cat) => {
                const Icon = pptIcons[cat];
                const total = matrix.totals[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-label={`${pptLabels[cat]} score: ${total.percentage}%`}
                    className={`w-full mb-4 last:mb-0 p-3 rounded-lg transition-colors motion-reduce:transition-none cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
                      hoveredCategory === cat
                        ? 'bg-slate-700/50'
                        : 'hover:bg-slate-700/30'
                    }`}
                    onMouseEnter={() => setHoveredCategory(cat)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onFocus={() => setHoveredCategory(cat)}
                    onBlur={() => setHoveredCategory(null)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon
                        className="w-5 h-5"
                        style={{ color: pptColors[cat].primary }}
                      />
                      <span className="text-sm font-medium text-white">
                        {pptLabels[cat]}
                      </span>
                      <span className="ml-auto text-sm text-slate-300">
                        {total.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 motion-reduce:transition-none"
                        style={{
                          width: `${total.percentage}%`,
                          backgroundColor: pptColors[cat].primary,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3x3 Matrix Grid */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Dimension Matrix
          </h2>
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 overflow-x-auto">
            {/* Mobile scroll hint */}
            <div className="md:hidden text-xs text-slate-400 mb-3 flex items-center gap-1">
              <span>Swipe to see all columns</span>
              <ChevronRight className="w-3 h-3" />
            </div>
            <table className="w-full min-w-[500px]">
              <thead>
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-slate-400" />
                  {categories.map((cat) => {
                    const Icon = pptIcons[cat];
                    return (
                      <th
                        key={cat}
                        className="p-3 text-center text-sm font-medium"
                        style={{ color: pptColors[cat].primary }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Icon className="w-4 h-4" />
                          {pptLabels[cat]}
                        </div>
                      </th>
                    );
                  })}
                  <th className="p-3 text-center text-sm font-medium text-slate-400">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {dimensions.map((dim) => {
                  const dimData = report.dimensions[dim];
                  return (
                    <tr key={dim} className="border-t border-slate-700">
                      <td
                        className="p-3 text-sm font-medium capitalize"
                        style={{ color: foeColors[dim].primary }}
                      >
                        {dim}
                      </td>
                      {categories.map((cat) => {
                        const cell = matrix.byDimension[dim][cat];
                        const intensity = cell.percentage / 100;
                        return (
                          <td key={cat} className="p-2">
                            <button
                              onClick={() =>
                                setSelectedCell(selectedCell === cell ? null : cell)
                              }
                              aria-label={`${dim} ${pptLabels[cat]}: ${cell.percentage}% (${cell.score} of ${cell.max}). Click to view details.`}
                              aria-expanded={selectedCell === cell}
                              className={`w-full p-4 min-h-[80px] rounded-lg transition-all motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
                                selectedCell === cell
                                  ? 'ring-2 ring-white'
                                  : 'hover:ring-1 hover:ring-slate-500'
                              }`}
                              style={{
                                backgroundColor: `rgba(${
                                  cat === 'people'
                                    ? '6, 182, 212'
                                    : cat === 'process'
                                      ? '99, 102, 241'
                                      : '100, 116, 139'
                                }, ${0.1 + intensity * 0.4})`,
                              }}
                            >
                              <div className="text-2xl font-bold text-white">
                                {cell.percentage}%
                              </div>
                              <div className="text-xs text-slate-300">
                                {cell.score}/{cell.max}
                              </div>
                            </button>
                          </td>
                        );
                      })}
                      <td className="p-3 text-center">
                        <div
                          className="text-lg font-bold"
                          style={{ color: foeColors[dim].primary }}
                        >
                          {dimData.score}
                        </div>
                        <div className="text-xs text-slate-400">/{dimData.max}</div>
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t border-slate-700 bg-slate-800/30">
                  <td className="p-3 text-sm font-medium text-slate-400">Total</td>
                  {categories.map((cat) => {
                    const total = matrix.totals[cat];
                    return (
                      <td key={cat} className="p-3 text-center">
                        <div
                          className="text-lg font-bold"
                          style={{ color: pptColors[cat].primary }}
                        >
                          {total.percentage}%
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-3 text-center">
                    <div className="text-lg font-bold text-white">
                      {report.overallScore}
                    </div>
                    <div className="text-xs text-slate-400">/100</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Selected Cell Detail */}
            {selectedCell && (
              <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="capitalize font-medium"
                    style={{ color: foeColors[selectedCell.dimension].primary }}
                  >
                    {selectedCell.dimension}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                  <span
                    className="capitalize font-medium"
                    style={{ color: pptColors[selectedCell.category].primary }}
                  >
                    {pptLabels[selectedCell.category]}
                  </span>
                </div>
                <div className="text-sm text-slate-300 mb-2">Contributing Subscores:</div>
                {selectedCell.subscores.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCell.subscores.map((sub) => (
                      <div key={sub.name} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="text-sm text-white">{sub.name}</div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full rounded-full transition-all duration-300 motion-reduce:transition-none"
                              style={{
                                width: `${(sub.score / sub.max) * 100}%`,
                                backgroundColor: pptColors[selectedCell.category].primary,
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-slate-300">
                          {sub.score}/{sub.max}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic">
                    No subscores mapped to this cell
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Timeline Journey */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Maturity Journey
          </h2>
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            {/* Timeline Track */}
            <div className="relative mb-8">
              {/* Track */}
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all duration-700 motion-reduce:transition-none"
                  style={{ width: `${report.overallScore}%` }}
                />
              </div>

              {/* Milestone Markers */}
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none">
                {/* Start marker (0) */}
                <div 
                  className="absolute w-5 h-5 rounded-full bg-red-500 border-4 border-slate-800 -translate-x-1/2"
                  style={{ left: '0%' }}
                  aria-hidden="true"
                />
                {/* Developing threshold (50) */}
                <div
                  className="absolute w-5 h-5 rounded-full border-4 border-slate-800 -translate-x-1/2"
                  style={{
                    left: '50%',
                    backgroundColor: report.overallScore >= 50 ? '#f59e0b' : '#475569',
                  }}
                  aria-hidden="true"
                />
                {/* Optimized threshold (75) */}
                <div
                  className="absolute w-5 h-5 rounded-full border-4 border-slate-800 -translate-x-1/2"
                  style={{
                    left: '75%',
                    backgroundColor: report.overallScore >= 75 ? '#10b981' : '#475569',
                  }}
                  aria-hidden="true"
                />
                {/* End marker (100) */}
                <div 
                  className="absolute w-5 h-5 rounded-full border-4 border-slate-800 -translate-x-1/2"
                  style={{ 
                    left: '100%',
                    backgroundColor: report.overallScore >= 100 ? '#10b981' : '#475569',
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Current Position Marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${report.overallScore}%` }}
              >
                <div className="bg-white rounded-full p-1 shadow-lg shadow-white/20">
                  <MapPin className="w-6 h-6 text-slate-900" />
                </div>
                <div className="mt-2 bg-slate-900 px-2 py-1 rounded text-xs font-bold text-white whitespace-nowrap">
                  You: {report.overallScore}
                </div>
              </div>
            </div>

            {/* Milestone Cards with Stacked Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {timelineData.map((milestone, index) => {
                const isActive = index === currentMilestoneIndex;
                const isPast = index < currentMilestoneIndex;
                const colors =
                  index === 0
                    ? { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' }
                    : index === 1
                      ? { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' }
                      : { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };

                return (
                  <div
                    key={milestone.name}
                    className={`p-5 rounded-xl border ${colors.bg} ${colors.border} ${
                      isActive ? 'ring-2 ring-white/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isActive ? (
                        <MapPin className={`w-5 h-5 ${colors.text}`} />
                      ) : isPast ? (
                        <Flag className="w-5 h-5 text-slate-500" />
                      ) : (
                        <Target className={`w-5 h-5 ${colors.text}`} />
                      )}
                      <h3 className={`font-bold ${colors.text}`}>{milestone.name}</h3>
                      <span className="ml-auto text-xs text-slate-400">
                        {milestone.range}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">{milestone.description}</p>

                    {/* PPT Breakdown - Individual Bars */}
                    <div className="text-xs text-slate-300 mb-2">P/P/T Breakdown</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 flex-shrink-0" style={{ color: pptColors.people.primary }} />
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 motion-reduce:transition-none"
                            style={{
                              width: `${milestone.pptBreakdown.people}%`,
                              backgroundColor: pptColors.people.primary,
                            }}
                          />
                        </div>
                        <span className="text-xs w-8 text-right" style={{ color: pptColors.people.primary }}>
                          {milestone.pptBreakdown.people}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Workflow className="w-3 h-3 flex-shrink-0" style={{ color: pptColors.process.primary }} />
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 motion-reduce:transition-none"
                            style={{
                              width: `${milestone.pptBreakdown.process}%`,
                              backgroundColor: pptColors.process.primary,
                            }}
                          />
                        </div>
                        <span className="text-xs w-8 text-right" style={{ color: pptColors.process.primary }}>
                          {milestone.pptBreakdown.process}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3 h-3 flex-shrink-0" style={{ color: pptColors.tech.primary }} />
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 motion-reduce:transition-none"
                            style={{
                              width: `${milestone.pptBreakdown.tech}%`,
                              backgroundColor: pptColors.tech.primary,
                            }}
                          />
                        </div>
                        <span className="text-xs w-8 text-right" style={{ color: pptColors.tech.primary }}>
                          {milestone.pptBreakdown.tech}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Roadmap by PPT Category */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Flag className="w-5 h-5 text-blue-400" />
            Improvement Roadmap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = pptIcons[cat];
              const recs = categorizedRecs[cat];
              return (
                <div
                  key={cat}
                  className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
                >
                  <div
                    className="px-5 py-4 border-b border-slate-700 flex items-center gap-3"
                    style={{ backgroundColor: `${pptColors[cat].primary}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: pptColors[cat].primary }} />
                    <h3 className="font-semibold text-white">{pptLabels[cat]}</h3>
                    <span
                      className="ml-auto text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${pptColors[cat].primary}30`,
                        color: pptColors[cat].primary,
                      }}
                    >
                      {recs.length} actions
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    {recs.length > 0 ? (
                      recs.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-3 bg-slate-900/50 rounded-lg border border-slate-700"
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                rec.priority === 'immediate'
                                  ? 'bg-red-500/20 text-red-400'
                                  : rec.priority === 'short-term'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {rec.priority}
                            </span>
                          </div>
                          <div className="mt-2 text-sm font-medium text-white">
                            {rec.title}
                          </div>
                          <div className="mt-1 text-xs text-slate-300">
                            {rec.description}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500 italic text-center py-4">
                        No recommendations in this category
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Milestone CTA */}
        {currentMilestoneIndex < timelineData.length - 1 && (
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-400 font-medium mb-1">
                  Next Milestone
                </div>
                <div className="text-2xl font-bold text-white">
                  {timelineData[currentMilestoneIndex + 1].name}
                </div>
                <div className="text-slate-300 mt-1">
                  {timelineData[currentMilestoneIndex + 1].minScore - report.overallScore}{' '}
                  more points needed
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-400">
                  +{timelineData[currentMilestoneIndex + 1].minScore - report.overallScore}
                </div>
                <div className="text-sm text-slate-300">points to go</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
