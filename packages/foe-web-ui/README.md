# FOE Web UI

Visual report viewer for Flow Optimized Engineering scanner results.

## Overview

The FOE Web UI is a React-based application that visualizes FOE scan reports in an interactive, user-friendly interface. It provides comprehensive views of:

- **Overall Assessment**: Repository information, overall score, and maturity level
- **Cognitive Triangle**: Visual representation of the three FOE dimensions (Understanding, Feedback, Confidence)
- **Dimension Details**: Detailed breakdowns with subscores, findings, and gaps
- **Top Strengths**: Highlighting what the project does well
- **Improvement Opportunities**: Prioritized gaps with recommendations

## Features

- 📤 **Drag-and-drop JSON upload** - Load FOE reports with a simple file drop
- 📊 **Interactive visualizations** - Radial charts, SVG diagrams, and progress bars
- 🌓 **Dark mode support** - Automatically respects system preferences
- 📱 **Responsive design** - Works on desktop, tablet, and mobile
- 🎨 **Color-coded dimensions** - Blue (Feedback), Purple (Understanding), Green (Confidence)
- 🔍 **Expandable details** - Drill down into findings and recommendations

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Charts and visualizations
- **Lucide React** - Icons

## Getting Started

### Development

1. Install dependencies (from monorepo root):
   ```bash
   bun install
   ```

2. Start the development server:
   ```bash
   cd packages/foe-web-ui
   bun run dev
   ```

3. Open http://localhost:3000 in your browser

4. Load a sample report:
   - Use the provided `sample-report.json`
   - Or generate a real report with the FOE scanner

### Building for Production

Build a static site for deployment:

```bash
bun run build
```

Output will be in `dist/` directory. Deploy with any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

### Preview Production Build

```bash
bun run preview
```

## Usage

### Loading a Report

1. **Drag and drop**: Drop a JSON file onto the upload area
2. **Click to browse**: Click the upload area to select a file

### Viewing Results

The report view is organized into sections:

#### 1. Overview Card
- Repository name and tech stack
- Overall FOE score (0-100)
- Maturity level (Hypothesized → Emerging → Practicing → Optimized)
- Scan metadata (duration, agents used, confidence level)

#### 2. Cognitive Triangle
- Visual representation of the three dimensions
- Shows weakest dimension and pattern
- Highlights below-threshold areas
- Displays recommended intervention

#### 3. Dimension Cards
Three cards for Feedback, Understanding, and Confidence:
- Overall dimension score with radial chart
- Subscores with progress bars and confidence indicators
- Expandable findings and gaps

#### 4. Top Strengths
- Areas where the project excels
- Evidence and impact details

#### 5. Improvement Opportunities
- Prioritized gaps sorted by score
- Recommendations with expected impact
- Links to relevant Field Guide methods

### Interpreting Scores

**Overall Scores:**
- **80-100**: Excellent - High FOE maturity
- **60-79**: Good - Solid FOE practices
- **40-59**: Fair - Basic FOE adoption
- **0-39**: Needs Attention - Significant gaps

**Maturity Levels:**
- **Hypothesized**: Exploring FOE concepts
- **Emerging**: Beginning to adopt practices
- **Practicing**: Consistently applying FOE
- **Optimized**: Advanced, refined implementation

**Minimum Thresholds (Safe Zone):**
- Understanding: ≥35
- Feedback: ≥40
- Confidence: ≥30

## Component Structure

```
src/
├── components/
│   ├── ReportUpload.tsx      # File upload interface
│   ├── OverviewCard.tsx       # Repository & overall score
│   ├── DimensionCard.tsx      # Individual dimension details
│   ├── TriangleDiagram.tsx    # Cognitive triangle visualization
│   ├── FindingsTable.tsx      # Strengths display
│   ├── GapsTable.tsx          # Gaps & recommendations
│   └── MethodLink.tsx         # Field Guide method links
├── types/
│   └── report.ts              # TypeScript interfaces
├── App.tsx                    # Main application
├── main.tsx                   # React entry point
└── index.css                  # Global styles
```

## Customization

### Colors

Dimension colors are defined in `App.tsx`:

```typescript
const DIMENSION_COLORS = {
  feedback: '#3b82f6',      // blue-600
  understanding: '#9333ea',  // purple-600
  confidence: '#10b981',     // green-600
};
```

### Thresholds

Cognitive triangle minimum thresholds are in `TriangleDiagram.tsx`:

```typescript
const MIN_THRESHOLDS = {
  understanding: 35,
  feedback: 40,
  confidence: 30,
};
```

## Deployment

### Static Hosting

Since this is a client-side React app with no backend, you can deploy it anywhere that serves static files:

**Netlify:**
```bash
bun run build
netlify deploy --prod --dir=dist
```

**Vercel:**
```bash
bun run build
vercel --prod
```

**GitHub Pages:**
```bash
bun run build
# Copy dist/ to gh-pages branch
```

### Containerization

You can containerize the web UI with Nginx:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Future Enhancements

Potential improvements:

- [ ] **Save/export report as PDF** - Generate printable reports
- [ ] **Compare multiple reports** - Track progress over time
- [ ] **Filter and search** - Find specific findings or methods
- [ ] **Shareable URLs** - Load reports from URL parameters
- [ ] **Interactive Field Guide** - Link directly to method documentation
- [ ] **Custom themes** - User-configurable color schemes
- [ ] **Report history** - Store and compare past scans

## Troubleshooting

### Dark mode not working
Ensure your system preferences are set correctly. The app respects the `prefers-color-scheme` media query.

### Charts not rendering
Check browser console for errors. Ensure Recharts is properly installed:
```bash
bun install recharts
```

### Upload validation failing
Verify your JSON file matches the FOEReport schema. Check the browser console for specific validation errors.

## License

Part of the Flow Optimized Engineering project.
