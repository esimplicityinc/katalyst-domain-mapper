import report from './report.json';

export type PPTCategory = 'people' | 'process' | 'tech';

export interface PPTMapping {
  subscore: string;
  dimension: 'feedback' | 'understanding' | 'confidence';
  category: PPTCategory;
}

// Map each subscore to a People/Process/Tech category
export const subscoreMappings: PPTMapping[] = [
  // Feedback dimension
  { subscore: 'CI Pipeline Speed', dimension: 'feedback', category: 'tech' },
  { subscore: 'Deployment Frequency', dimension: 'feedback', category: 'process' },
  { subscore: 'Test Coverage', dimension: 'feedback', category: 'process' },
  { subscore: 'Feedback Loop Investment', dimension: 'feedback', category: 'tech' },
  
  // Understanding dimension
  { subscore: 'Architecture Clarity', dimension: 'understanding', category: 'process' },
  { subscore: 'Domain Modeling', dimension: 'understanding', category: 'people' },
  { subscore: 'Documentation Quality', dimension: 'understanding', category: 'people' },
  { subscore: 'Code Organization', dimension: 'understanding', category: 'tech' },
  
  // Confidence dimension
  { subscore: 'Test Quality', dimension: 'confidence', category: 'process' },
  { subscore: 'Contract Testing', dimension: 'confidence', category: 'tech' },
  { subscore: 'Dependency Health', dimension: 'confidence', category: 'tech' },
  { subscore: 'Change Safety', dimension: 'confidence', category: 'process' },
];

export interface MatrixCell {
  dimension: 'feedback' | 'understanding' | 'confidence';
  category: PPTCategory;
  score: number;
  max: number;
  percentage: number;
  subscores: {
    name: string;
    score: number;
    max: number;
  }[];
}

export interface PPTMatrix {
  cells: MatrixCell[];
  byDimension: Record<string, Record<PPTCategory, MatrixCell>>;
  byCategory: Record<PPTCategory, Record<string, MatrixCell>>;
  totals: {
    people: { score: number; max: number; percentage: number };
    process: { score: number; max: number; percentage: number };
    tech: { score: number; max: number; percentage: number };
  };
}

// Calculate the 3x3 matrix from report data
export function calculatePPTMatrix(): PPTMatrix {
  const dimensions = ['feedback', 'understanding', 'confidence'] as const;
  const categories: PPTCategory[] = ['people', 'process', 'tech'];
  
  const cells: MatrixCell[] = [];
  const byDimension: Record<string, Record<PPTCategory, MatrixCell>> = {};
  const byCategory: Record<PPTCategory, Record<string, MatrixCell>> = {} as Record<PPTCategory, Record<string, MatrixCell>>;
  
  // Initialize byCategory
  categories.forEach(cat => {
    byCategory[cat] = {};
  });
  
  for (const dim of dimensions) {
    byDimension[dim] = {} as Record<PPTCategory, MatrixCell>;
    const dimData = report.dimensions[dim];
    
    for (const cat of categories) {
      // Find subscores that map to this dimension + category
      const relevantMappings = subscoreMappings.filter(
        m => m.dimension === dim && m.category === cat
      );
      
      const matchedSubscores = relevantMappings.map(mapping => {
        const subscore = dimData.subscores.find(s => s.name === mapping.subscore);
        return subscore ? { name: subscore.name, score: subscore.score, max: subscore.max } : null;
      }).filter((s): s is { name: string; score: number; max: number } => s !== null);
      
      const totalScore = matchedSubscores.reduce((sum, s) => sum + s.score, 0);
      const totalMax = matchedSubscores.reduce((sum, s) => sum + s.max, 0);
      
      const cell: MatrixCell = {
        dimension: dim,
        category: cat,
        score: totalScore,
        max: totalMax || 25, // Default max if no subscores
        percentage: totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0,
        subscores: matchedSubscores,
      };
      
      cells.push(cell);
      byDimension[dim][cat] = cell;
      byCategory[cat][dim] = cell;
    }
  }
  
  // Calculate category totals
  const totals = {
    people: calculateCategoryTotal('people', byCategory),
    process: calculateCategoryTotal('process', byCategory),
    tech: calculateCategoryTotal('tech', byCategory),
  };
  
  return { cells, byDimension, byCategory, totals };
}

function calculateCategoryTotal(
  category: PPTCategory, 
  byCategory: Record<PPTCategory, Record<string, MatrixCell>>
): { score: number; max: number; percentage: number } {
  const cells = Object.values(byCategory[category]);
  const score = cells.reduce((sum, c) => sum + c.score, 0);
  const max = cells.reduce((sum, c) => sum + c.max, 0);
  return {
    score,
    max,
    percentage: max > 0 ? Math.round((score / max) * 100) : 0,
  };
}

// Generate radar chart data for 9-axis view
export function getMatrixRadarData(matrix: PPTMatrix) {
  const dimensions = ['feedback', 'understanding', 'confidence'] as const;
  const categories: PPTCategory[] = ['people', 'process', 'tech'];
  
  return dimensions.flatMap(dim => 
    categories.map(cat => ({
      axis: `${dim.charAt(0).toUpperCase()}${dim.slice(1, 4)}-${cat.charAt(0).toUpperCase()}${cat.slice(1, 3)}`,
      fullLabel: `${dim.charAt(0).toUpperCase()}${dim.slice(1)} (${cat.charAt(0).toUpperCase()}${cat.slice(1)})`,
      dimension: dim,
      category: cat,
      score: matrix.byDimension[dim][cat].percentage,
      fullMark: 100,
    }))
  );
}

// Generate radar chart data for 3-axis FOE view
export function getFOERadarData() {
  return [
    { 
      axis: 'Feedback', 
      score: report.dimensions.feedback.score, 
      fullMark: 100,
      color: '#3b82f6'
    },
    { 
      axis: 'Understanding', 
      score: report.dimensions.understanding.score, 
      fullMark: 100,
      color: '#8b5cf6'
    },
    { 
      axis: 'Confidence', 
      score: report.dimensions.confidence.score, 
      fullMark: 100,
      color: '#10b981'
    },
  ];
}

// PPT Colors
export const pptColors = {
  people: {
    primary: '#06b6d4', // cyan-500
    light: '#cffafe',   // cyan-100
    dark: '#0e7490',    // cyan-700
  },
  process: {
    primary: '#6366f1', // indigo-500
    light: '#e0e7ff',   // indigo-100
    dark: '#4338ca',    // indigo-700
  },
  tech: {
    primary: '#64748b', // slate-500
    light: '#f1f5f9',   // slate-100
    dark: '#334155',    // slate-700
  },
};

// FOE Colors (from existing templates)
export const foeColors = {
  feedback: {
    primary: '#3b82f6', // blue-500
    light: '#dbeafe',   // blue-100
    dark: '#1d4ed8',    // blue-700
  },
  understanding: {
    primary: '#8b5cf6', // purple-500
    light: '#ede9fe',   // purple-100
    dark: '#6d28d9',    // purple-700
  },
  confidence: {
    primary: '#10b981', // emerald-500
    light: '#d1fae5',   // emerald-100
    dark: '#047857',    // emerald-700
  },
};

// Categorize recommendations by PPT impact
export function categorizeRecommendations() {
  const recommendations = report.recommendations;
  
  // Heuristic mapping based on recommendation content
  const categorized: Record<PPTCategory, typeof recommendations> = {
    people: [],
    process: [],
    tech: [],
  };
  
  recommendations.forEach(rec => {
    const title = rec.title.toLowerCase();
    const desc = rec.description.toLowerCase();
    
    if (title.includes('document') || title.includes('runbook') || title.includes('adr') || 
        desc.includes('documentation') || desc.includes('onboarding')) {
      categorized.people.push(rec);
    } else if (title.includes('test') || title.includes('coverage') || title.includes('deploy') ||
               desc.includes('process') || desc.includes('integration')) {
      categorized.process.push(rec);
    } else if (title.includes('security') || title.includes('dependency') || title.includes('vulnerab') ||
               desc.includes('tool') || desc.includes('enforcement')) {
      categorized.tech.push(rec);
    } else {
      // Default to process for uncategorized
      categorized.process.push(rec);
    }
  });
  
  return categorized;
}

// Timeline data with PPT breakdown at each milestone
export interface MilestoneData {
  name: string;
  range: string;
  minScore: number;
  maxScore: number;
  description: string;
  pptBreakdown: {
    people: number;
    process: number;
    tech: number;
  };
}

export function getTimelineWithPPT(currentScore: number): MilestoneData[] {
  const matrix = calculatePPTMatrix();
  
  // Current state percentages
  const currentPPT = {
    people: matrix.totals.people.percentage,
    process: matrix.totals.process.percentage,
    tech: matrix.totals.tech.percentage,
  };
  
  return [
    {
      name: 'Emerging',
      range: '0-50',
      minScore: 0,
      maxScore: 50,
      description: 'Basic practices in place, significant gaps remain',
      pptBreakdown: currentScore <= 50 ? currentPPT : { people: 15, process: 20, tech: 15 },
    },
    {
      name: 'Developing',
      range: '51-75',
      minScore: 51,
      maxScore: 75,
      description: 'Good practices established, optimization opportunities exist',
      pptBreakdown: currentScore > 50 && currentScore <= 75 
        ? currentPPT 
        : { people: 55, process: 65, tech: 60 },
    },
    {
      name: 'Optimized',
      range: '76-100',
      minScore: 76,
      maxScore: 100,
      description: 'Excellent practices, continuous improvement culture',
      pptBreakdown: currentScore > 75 
        ? currentPPT 
        : { people: 85, process: 90, tech: 88 },
    },
  ];
}
