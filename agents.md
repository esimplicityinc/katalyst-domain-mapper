# Katalyst Domain Mapper - AI Agents Architecture

## Project Overview

**Katalyst Domain Mapper** is an intelligent system for assessing Flow Optimized Engineering (FOE) practices in software repositories. It combines deterministic code analysis with AI-powered insights to provide comprehensive assessments across three critical dimensions:

- **Understanding** (35% weight) - System clarity, architecture, documentation, domain modeling
- **Feedback** (35% weight) - CI/CD speed, test coverage, deployment frequency, learning cycles
- **Confidence** (30% weight) - Test automation, static analysis, contract testing, stability

The system generates actionable reports that identify strengths, gaps, and provide prioritized recommendations for improvement.

## System Architecture

```
katalyst-domain-mapper/
├── packages/
│   ├── foe-schemas/              # Zod validation schemas
│   ├── foe-field-guide-tools/    # Field Guide parsers and indices
│   ├── foe-scanner/              # Docker container with AI agents
│   └── foe-web-ui/               # React visualization interface
├── package.json                  # Bun workspace root
└── agents.md                     # This file
```

### Package 1: @foe/schemas

**Purpose:** Type-safe validation schemas using Zod for all data structures.

**Key Components:**
- `scan/` - FOE report schemas (dimensions, findings, gaps, recommendations, triangle diagnosis)
- `field-guide/` - Method and observation schemas with maturity levels
- `graph/` - Neo4j node/relationship types (optional knowledge graph)

**Build Output:** 141KB bundled, 45 TypeScript declaration files

**Why Zod?** Runtime validation + TypeScript types from a single source of truth. Ensures data integrity across the entire pipeline.

### Package 2: @foe/field-guide-tools

**Purpose:** Parse Field Guide markdown files and build searchable JSON indices.

**Key Components:**
- **Parsers** (`src/parsers/`) - Convert markdown → validated objects
  - `frontmatter.ts` - YAML frontmatter extraction
  - `method.ts` - Method file parsing with validation
  - `observation.ts` - Observation file parsing
  
- **Builders** (`src/builders/`) - Create searchable indices
  - `keywords.ts` - Extract 625+ keywords from methods
  - `methods-index.ts` - 65 methods (17 FOE + 48 external frameworks)
  - `observations-index.ts` - 39 observations with evidence

- **CLI** (`src/cli.ts`) - Command-line interface
  - `build` - Generate both indices
  - `validate` - Check frontmatter without building
  - `stats` - Print statistics

**Output:** JSON indices baked into scanner container at build time.

**External Frameworks Supported:** DORA, DDD, BDD, Team Topologies, TDD, Continuous Delivery, Double Diamond

### Package 3: @foe/scanner

**Purpose:** Containerized AI-powered scanner using OpenCode agents.

**Architecture:**

#### Docker Multi-Stage Build
1. **Stage 1:** Build Field Guide indices
   - Copies docs and builds @foe/field-guide-tools
   - Generates `methods-index.json` and `observations-index.json`
   
2. **Stage 2:** Runtime container
   - Installs OpenCode CLI
   - Copies AI agents
   - Bakes in pre-built indices

#### AI Agents (6 total)

**Orchestrator:**
- `foe-scanner-container.md` - Batch-mode coordinator
  - Auto-detects tech stack and monorepo structure
  - Dispatches 5 specialist agents in parallel
  - Synthesizes results into unified FOE report
  - Outputs JSON to stdout (no interactive prompts)

**Specialist Agents:**
1. `foe-scanner-ci.md` - **Feedback dimension**
   - Analyzes CI/CD pipelines, caching, parallelization
   - Measures pipeline speed, deployment frequency
   - Detects feedback loop investments

2. `foe-scanner-tests.md` - **Feedback + Confidence dimensions**
   - Test frameworks, coverage reports, BDD patterns
   - Test-to-code ratios, contract testing
   - Quality of test suites

3. `foe-scanner-arch.md` - **Understanding dimension**
   - Detects architecture patterns (hexagonal, vertical slice, microservices)
   - Checks dependency direction and circular dependencies
   - Assesses modularity and boundaries

4. `foe-scanner-domain.md` - **Understanding dimension**
   - DDD patterns (aggregates, bounded contexts, value objects)
   - Ubiquitous language consistency
   - Domain model clarity

5. `foe-scanner-docs.md` - **Understanding dimension**
   - ADRs, README quality, API documentation
   - Runbooks, onboarding guides
   - Documentation coverage and freshness

#### Cognitive Triangle Diagnosis

The scanner calculates a "cognitive triangle" with minimum thresholds:
- **Understanding:** ≥35
- **Feedback:** ≥40  
- **Confidence:** ≥30

Falls below thresholds indicate cycle health issues requiring immediate intervention.

**Usage:**
```bash
docker build -t katalyst-scanner -f packages/foe-scanner/Dockerfile .
docker run -v $(pwd):/repo -e ANTHROPIC_API_KEY=$KEY katalyst-scanner > report.json
```

### Package 4: @foe/web-ui

**Purpose:** React-based visualization for FOE scan reports.

**Tech Stack:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (visualizations)
- Lucide React (icons)

**Components (8 total):**
1. `ReportUpload.tsx` - Drag-and-drop JSON upload with validation
2. `OverviewCard.tsx` - Repository info, overall score, maturity level
3. `DimensionCard.tsx` - Radial charts, subscores, expandable findings
4. `TriangleDiagram.tsx` - SVG cognitive triangle with safe zone
5. `FindingsTable.tsx` - Top strengths display
6. `GapsTable.tsx` - Prioritized improvement opportunities
7. `MethodLink.tsx` - Links to Field Guide methods
8. `App.tsx` - Main application with state management

**Features:**
- Responsive design (mobile, tablet, desktop)
- Dark mode support (respects system preferences)
- Color-coded dimensions (Blue: Feedback, Purple: Understanding, Green: Confidence)
- Interactive expandable sections
- Priority-sorted recommendations

**Deployment:**
```bash
cd packages/foe-web-ui
bun run build  # Static site → dist/
# Deploy to Netlify, Vercel, GitHub Pages, or containerize with Nginx
```

## AI Agent Design Principles

### 1. Separation of Concerns
Each agent has a **single responsibility** aligned with one FOE dimension. This enables:
- Parallel execution for speed
- Independent updates without affecting others
- Clear accountability for findings

### 2. Evidence-Based Assessment
Agents don't just score—they provide:
- **Concrete evidence** (file paths, line numbers, commit patterns)
- **Hypothesis formation** (why gaps exist)
- **Contextual recommendations** (what to do next)

### 3. Deterministic + AI Hybrid
- **Deterministic analysis:** File structure, test counts, CI config parsing
- **AI insights:** Pattern recognition, semantic understanding, intervention strategies

This combination ensures:
- Repeatability (same repo = same base score)
- Nuance (AI understands context and edge cases)
- Explainability (evidence is traceable)

### 4. Batch-Mode Operation
The container agent is designed for **CI/CD integration**:
- No user input required
- JSON output to stdout (parseable by other tools)
- Exit codes indicate success/failure
- Configurable verbosity

### 5. Field Guide Integration
Agents have access to:
- **65 methods** from FOE + external frameworks
- **39 observations** with evidence and learnings
- **625+ keywords** for semantic matching

This enables recommendations to reference **specific, actionable methods** rather than generic advice.

## Maturity Levels

The scanner maps overall scores to maturity levels:

| Score | Maturity Level | Description |
|-------|---------------|-------------|
| 0-39  | Hypothesized  | Exploring FOE concepts, significant gaps |
| 40-59 | Emerging      | Beginning to adopt practices, inconsistent |
| 60-79 | Practicing    | Consistently applying FOE, some optimization needed |
| 80-100| Optimized     | Advanced, refined implementation |

## Data Flow

```
1. Repository → Docker Container
   ↓
2. Orchestrator Agent analyzes structure
   ↓
3. Dispatches 5 specialist agents (parallel)
   ↓
4. Each agent returns dimension assessment
   ↓
5. Orchestrator synthesizes:
   - Scores across 3 dimensions
   - Top strengths (3)
   - Top gaps (3)
   - Triangle diagnosis
   - Intervention recommendations
   ↓
6. JSON output validated against Zod schemas
   ↓
7. Web UI visualizes results
```

## Key Technical Decisions

### 1. Bun Workspaces
**Why?** Faster than npm/yarn, native TypeScript support, simpler than Lerna.

### 2. Zod Over TypeScript-Only
**Why?** Runtime validation catches issues at the boundary. TypeScript types are compile-time only.

### 3. Docker Multi-Stage Build
**Why?** Keeps runtime image small (no build tools). Indices pre-built = faster startup.

### 4. OpenCode Agents
**Why?** Claude Sonnet 4.5 provides excellent code analysis. OpenCode CLI handles session management, file access, and tool execution.

### 5. Static Web UI
**Why?** No backend needed. Deploy anywhere. Works offline. Fast.

### 6. Cognitive Triangle Thresholds
**Why?** Research-backed minimum thresholds prevent imbalanced development (e.g., great architecture but no tests).

## Extending the System

### Adding a New Agent
1. Create `packages/foe-scanner/.opencode/agents/foe-scanner-{domain}.md`
2. Define trigger phrases, tools, and prompt
3. Add to `foe-scanner-container.md` orchestrator dispatch
4. Update schemas if new data fields needed

### Adding a New External Framework
1. Add markdown files to `/docs/docs/external-frameworks/{framework}/`
2. Include frontmatter with `framework`, `foeRelevance`, `maturity` (optional)
3. Rebuild Field Guide indices: `bun run build`
4. Agents automatically get access via methods index

### Customizing Scoring Weights
Edit dimension weights in `@foe/schemas/src/scan/report.ts`:
```typescript
const DIMENSION_WEIGHTS = {
  understanding: 0.35,  // 35%
  feedback: 0.35,       // 35%
  confidence: 0.30,     // 30%
};
```

## Performance Characteristics

- **Schema validation:** ~5ms per report
- **Field Guide indexing:** ~2s for 133 files
- **Scanner execution:** 5-15 minutes (depends on repo size)
- **Web UI load:** <100ms (static files)
- **Docker image size:** ~500MB (includes OpenCode + Node)

## Future Enhancements

### Short-Term
- [ ] JSON Schema export for IDE autocomplete
- [ ] CI/CD GitHub Action for automated scanning
- [ ] Report comparison (track progress over time)
- [ ] PDF export from Web UI

### Medium-Term
- [ ] Neo4j knowledge graph integration
- [ ] Natural language query interface ("Show me all repos with low confidence")
- [ ] Trend analysis across multiple scans
- [ ] Integration with incident management tools

### Long-Term
- [ ] Auto-remediation suggestions with code patches
- [ ] Team topology analysis (Conway's Law alignment)
- [ ] Predictive modeling (forecast future issues)
- [ ] Collaborative review features (team annotations)

## Security Considerations

- **API Keys:** Never commit `ANTHROPIC_API_KEY`. Use environment variables or secrets managers.
- **Repository Access:** Scanner has read-only access to `/repo` mount. Uses least-privilege principle.
- **Output Sanitization:** Reports may contain file paths. Review before sharing externally.
- **Dependencies:** Regularly update to patch vulnerabilities. Use `bun update` and rebuild containers.

## Contributing

This system was built with AI assistance (OpenCode + Claude Sonnet 4.5). The architecture follows these principles:

1. **Schema-first design** - Define data structures before implementation
2. **Progressive enhancement** - Start simple, add complexity as needed
3. **Clear boundaries** - Each package has a single responsibility
4. **Evidence over opinion** - Back assessments with concrete data
5. **Actionable insights** - Every finding includes next steps

When extending the system, maintain these principles to ensure consistency and maintainability.

---

**Built with:** OpenCode AI + Claude Sonnet 4.5  
**License:** Part of the Flow Optimized Engineering project  
**Maintainer:** eSimplicity Inc.
