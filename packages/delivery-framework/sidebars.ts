import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  dddSidebar: [
    {
      type: 'doc',
      id: 'ddd/index',
      label: 'DDD Overview',
    },
    {
      type: 'doc',
      id: 'ddd/domain-overview',
      label: 'Domain Overview',
    },
    {
      type: 'doc',
      id: 'ddd/bounded-contexts',
      label: 'Bounded Contexts',
    },
    {
      type: 'doc',
      id: 'ddd/ubiquitous-language',
      label: 'Ubiquitous Language',
    },
    {
      type: 'doc',
      id: 'ddd/aggregates-entities',
      label: 'Aggregates & Entities',
    },
    {
      type: 'doc',
      id: 'ddd/value-objects',
      label: 'Value Objects',
    },
    {
      type: 'doc',
      id: 'ddd/domain-events',
      label: 'Domain Events',
    },
    {
      type: 'doc',
      id: 'ddd/use-cases',
      label: 'Use Cases',
    },
    {
      type: 'doc',
      id: 'ddd/context-map',
      label: 'Context Map',
    },
  ],
  bddSidebar: [
    {
      type: 'doc',
      id: 'bdd/index',
      label: 'BDD Overview',
    },
    {
      type: 'doc',
      id: 'bdd/bdd-overview',
      label: 'Methodology',
    },
    {
      type: 'doc',
      id: 'bdd/gherkin-syntax',
      label: 'Gherkin Syntax',
    },
    {
      type: 'doc',
      id: 'bdd/feature-index',
      label: 'Feature Index',
    },
  ],
  agentsSidebar: [
    {
      type: 'doc',
      id: 'agents/index',
      label: 'Agent Overview',
    },
  ],
  personasSidebar: [
    {
      type: 'doc',
      id: 'personas/index',
      label: 'Personas Overview',
    },
    { type: 'doc', id: 'personas/PER-001', label: 'PER-001: Engineering Team Lead' },
    { type: 'doc', id: 'personas/PER-002', label: 'PER-002: Platform Engineer' },
    { type: 'doc', id: 'personas/PER-003', label: 'PER-003: AI Agent' },
    { type: 'doc', id: 'personas/PER-004', label: 'PER-004: Documentation Author' },
    { type: 'doc', id: 'personas/PER-005', label: 'PER-005: Framework Adopter' },
  ],
  capabilitiesSidebar: [
    {
      type: 'doc',
      id: 'capabilities/index',
      label: 'Capabilities Overview',
    },
    { type: 'doc', id: 'capabilities/CAP-001', label: 'CAP-001: FOE Report Generation' },
    { type: 'doc', id: 'capabilities/CAP-002', label: 'CAP-002: Governance Validation' },
    { type: 'doc', id: 'capabilities/CAP-003', label: 'CAP-003: Field Guide Indexing' },
    { type: 'doc', id: 'capabilities/CAP-004', label: 'CAP-004: Repository Scanning' },
    { type: 'doc', id: 'capabilities/CAP-005', label: 'CAP-005: Jira Integration' },
    { type: 'doc', id: 'capabilities/CAP-006', label: 'CAP-006: Confluence Integration' },
    { type: 'doc', id: 'capabilities/CAP-007', label: 'CAP-007: GitHub Integration' },
    { type: 'doc', id: 'capabilities/CAP-008', label: 'CAP-008: Real-time Streaming' },
    { type: 'doc', id: 'capabilities/CAP-009', label: 'CAP-009: DDD Domain Modeling API' },
  ],
  storiesSidebar: [
    {
      type: 'doc',
      id: 'user-stories/index',
      label: 'User Stories Overview',
    },
    {
      type: 'category',
      label: 'Team Lead Stories',
      items: [
        { type: 'doc', id: 'user-stories/US-001', label: 'US-001: View FOE Scan Report' },
        { type: 'doc', id: 'user-stories/US-002', label: 'US-002: Track Governance Health' },
        { type: 'doc', id: 'user-stories/US-010', label: 'US-010: View Governance Dashboard' },
      ],
    },
    {
      type: 'category',
      label: 'Platform Engineer Stories',
      items: [
        { type: 'doc', id: 'user-stories/US-003', label: 'US-003: Governance Zod Schemas' },
        { type: 'doc', id: 'user-stories/US-004', label: 'US-004: Build Governance Index' },
        { type: 'doc', id: 'user-stories/US-005', label: 'US-005: API Governance Ingest' },
        { type: 'doc', id: 'user-stories/US-006', label: 'US-006: Scanner Docker Build' },
        { type: 'doc', id: 'user-stories/US-007', label: 'US-007: DDD Artifact Schemas' },
      ],
    },
    {
      type: 'category',
      label: 'AI Agent Stories',
      items: [
        { type: 'doc', id: 'user-stories/US-008', label: 'US-008: Validate Before Commit' },
        { type: 'doc', id: 'user-stories/US-009', label: 'US-009: Advance Governance Gates' },
        { type: 'doc', id: 'user-stories/US-011', label: 'US-011: Score Governance Maturity' },
      ],
    },
    {
      type: 'category',
      label: 'Documentation Author Stories',
      items: [
        { type: 'doc', id: 'user-stories/US-012', label: 'US-012: Author DDD Model Docs' },
        { type: 'doc', id: 'user-stories/US-013', label: 'US-013: Validate Frontmatter' },
      ],
    },
    {
      type: 'category',
      label: 'Framework Adopter Stories',
      items: [
        { type: 'doc', id: 'user-stories/US-014', label: 'US-014: Import Framework' },
        { type: 'doc', id: 'user-stories/US-015', label: 'US-015: CI Governance Validation' },
      ],
    },
    {
      type: 'category',
      label: 'Integration & Enhancement Stories',
      items: [
        { type: 'doc', id: 'user-stories/US-028', label: 'US-028: Manage Domain Models via API' },
        { type: 'doc', id: 'user-stories/US-029', label: 'US-029: View Domain Model in UI' },
        { type: 'doc', id: 'user-stories/US-030', label: 'US-030: Compare FOE Reports' },
        { type: 'doc', id: 'user-stories/US-031', label: 'US-031: Filter & Paginate Reports' },
        { type: 'doc', id: 'user-stories/US-032', label: 'US-032: Configure API Key' },
      ],
    },
  ],
  roadsSidebar: [
    {
      type: 'doc',
      id: 'roads/index',
      label: 'Roadmap Overview',
    },
    {
      type: 'doc',
      id: 'roads/ROAD-XXX',
      label: 'Template',
    },
    {
      type: 'category',
      label: 'Phase 0: Foundation',
      items: [
        { type: 'doc', id: 'roads/ROAD-001', label: 'ROAD-001: Import Infrastructure' },
      ],
    },
    {
      type: 'category',
      label: 'Phase 1: Core Schemas & Skills',
      items: [
        { type: 'doc', id: 'roads/ROAD-002', label: 'ROAD-002: Governance Schemas' },
        { type: 'doc', id: 'roads/ROAD-003', label: 'ROAD-003: DDD Schemas' },
        { type: 'doc', id: 'roads/ROAD-007', label: 'ROAD-007: BDD Agent Skills' },
      ],
    },
    {
      type: 'category',
      label: 'Phase 2: Parsers & CLI',
      items: [
        { type: 'doc', id: 'roads/ROAD-004', label: 'ROAD-004: Parsers, Builder & CLI' },
      ],
    },
    {
      type: 'category',
      label: 'Phase 3: API & Services',
      items: [
        { type: 'doc', id: 'roads/ROAD-005', label: 'ROAD-005: API Governance Domain' },
        { type: 'doc', id: 'roads/ROAD-006', label: 'ROAD-006: Scanner Governance Agent' },
        { type: 'doc', id: 'roads/ROAD-008', label: 'ROAD-008: Framework Integration' },
      ],
    },
    {
      type: 'category',
      label: 'Phase 4: Visualization',
      items: [
        { type: 'doc', id: 'roads/ROAD-009', label: 'ROAD-009: Web Visualization' },
      ],
    },
  ],
  adrSidebar: [
    {
      type: 'doc',
      id: 'adr/index',
      label: 'ADR Overview',
    },
    {
      type: 'doc',
      id: 'adr/ADR-XXX',
      label: 'Template',
    },
    {
      type: 'category',
      label: 'Accepted ADRs',
      collapsed: false,
      items: [
        { type: 'doc', id: 'adr/ADR-001', label: 'ADR-001: Bun Workspaces' },
        { type: 'doc', id: 'adr/ADR-002', label: 'ADR-002: Zod Validation' },
        { type: 'doc', id: 'adr/ADR-003', label: 'ADR-003: Hexagonal Architecture' },
        { type: 'doc', id: 'adr/ADR-004', label: 'ADR-004: Elysia + Drizzle API' },
        { type: 'doc', id: 'adr/ADR-005', label: 'ADR-005: Docusaurus Docs Platform' },
        { type: 'doc', id: 'adr/ADR-006', label: 'ADR-006: OpenCode AI Agents' },
        { type: 'doc', id: 'adr/ADR-007', label: 'ADR-007: Docker Multi-Stage Builds' },
        { type: 'doc', id: 'adr/ADR-008', label: 'ADR-008: 8-State Governance Workflow' },
        { type: 'doc', id: 'adr/ADR-009', label: 'ADR-009: Markdown Frontmatter Format' },
        { type: 'doc', id: 'adr/ADR-010', label: 'ADR-010: Progressive Replacement' },
      ],
    },
  ],
  nfrSidebar: [
    {
      type: 'doc',
      id: 'nfr/index',
      label: 'NFR Overview',
    },
    {
      type: 'doc',
      id: 'nfr/NFR-XXX-000',
      label: 'Template',
    },
    {
      type: 'category',
      label: 'Performance',
      collapsed: false,
      items: [
        { type: 'doc', id: 'nfr/NFR-PERF-001', label: 'NFR-PERF-001: Index Build Performance' },
        { type: 'doc', id: 'nfr/NFR-PERF-002', label: 'NFR-PERF-002: API Response Time' },
      ],
    },
    {
      type: 'category',
      label: 'Reliability',
      collapsed: false,
      items: [
        { type: 'doc', id: 'nfr/NFR-REL-001', label: 'NFR-REL-001: Schema Validation at Boundaries' },
      ],
    },
    {
      type: 'category',
      label: 'Security',
      collapsed: false,
      items: [
        { type: 'doc', id: 'nfr/NFR-SEC-001', label: 'NFR-SEC-001: Credential Protection' },
      ],
    },
    {
      type: 'category',
      label: 'Maintainability',
      collapsed: false,
      items: [
        { type: 'doc', id: 'nfr/NFR-MAINT-001', label: 'NFR-MAINT-001: Cross-Reference Integrity' },
        { type: 'doc', id: 'nfr/NFR-MAINT-002', label: 'NFR-MAINT-002: Backward-Compatible CLI' },
      ],
    },
    {
      type: 'category',
      label: 'Accessibility',
      collapsed: false,
      items: [
        { type: 'doc', id: 'nfr/NFR-A11Y-001', label: 'NFR-A11Y-001: WCAG 2.1 AA Compliance' },
      ],
    },
  ],
  changesSidebar: [
    {
      type: 'doc',
      id: 'changes/changes-index',
      label: 'Change History',
    },
    {
      type: 'doc',
      id: 'changes/CHANGE-XXX',
      label: 'Change Template',
    },
  ],
  planningSidebar: [
    {
      type: 'doc',
      id: 'plans/index',
      label: 'Plans Overview',
    },
    {
      type: 'category',
      label: 'Implementation Plans',
      link: {
        type: 'generated-index',
        title: 'Implementation Plans',
        description: 'Detailed implementation plans for features',
        slug: '/plans/all',
      },
      items: [
        {
          type: 'autogenerated',
          dirName: 'plans',
        },
      ],
    },
  ],
};

export default sidebars;
