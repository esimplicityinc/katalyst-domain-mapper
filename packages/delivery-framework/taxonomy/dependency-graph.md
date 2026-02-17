---
id: taxonomy-dependency-graph
title: Dependency Graph
sidebar_label: Dependency Graph
---

# System Dependency Graph

This document visualizes the dependencies and relationships between systems in the Katalyst ecosystem.

## Complete System Dependencies

```mermaid
graph TD
    %% Platform Subsystem
    API[api-gateway.platform.katalyst]
    AUTH[auth-service.platform.katalyst]
    DB[(database.infrastructure.platform.katalyst)]
    CACHE[(cache.infrastructure.platform.katalyst)]
    
    %% Intelligence Subsystem
    SCANNER[scanner.intelligence.katalyst]
    AGENTS[ai-agents.intelligence.katalyst]
    FIELDGUIDE[field-guide-tools.intelligence.katalyst]
    WEBUI[web-ui.intelligence.katalyst]
    
    %% Delivery Subsystem
    GOV[governance.delivery-framework.katalyst]
    BDD[bdd-framework.delivery-framework.katalyst]
    DOCS[documentation.delivery-framework.katalyst]
    
    %% Dependencies
    API --> DB
    API --> CACHE
    API --> AUTH
    
    WEBUI --> API
    
    SCANNER --> AGENTS
    SCANNER --> FIELDGUIDE
    SCANNER --> DB
    
    GOV --> API
    BDD --> API
    DOCS --> GOV
    
    %% Styling by subsystem
    style API fill:#ffcdd2
    style AUTH fill:#ffcdd2
    style DB fill:#ffebee
    style CACHE fill:#ffebee
    
    style SCANNER fill:#c8e6c9
    style AGENTS fill:#c8e6c9
    style FIELDGUIDE fill:#c8e6c9
    style WEBUI fill:#c8e6c9
    
    style GOV fill:#bbdefb
    style BDD fill:#bbdefb
    style DOCS fill:#bbdefb
```

**Legend**:
- 🔴 Red: Platform subsystem
- 🟢 Green: Intelligence subsystem
- 🔵 Blue: Delivery subsystem

---

## Dependencies by Layer

### View 1: Platform Layer Dependencies

```mermaid
graph LR
    subgraph "Application Layer"
        API_APP[API Application Services]
        AUTH_APP[Auth Application Services]
    end
    
    subgraph "Infrastructure Layer"
        DB[(PostgreSQL)]
        CACHE[(Redis)]
        S3[(S3 Storage)]
    end
    
    API_APP --> DB
    API_APP --> CACHE
    API_APP --> S3
    AUTH_APP --> DB
    AUTH_APP --> CACHE
    
    style API_APP fill:#ffcdd2
    style AUTH_APP fill:#ffcdd2
    style DB fill:#f5f5f5
    style CACHE fill:#f5f5f5
    style S3 fill:#f5f5f5
```

---

### View 2: Intelligence Layer Dependencies

```mermaid
graph TD
    SCANNER[FOE Scanner] --> AGENTS[AI Agents]
    SCANNER --> FIELDGUIDE[Field Guide Tools]
    SCANNER --> PLATFORM_API[Platform API]
    
    WEBUI[Web UI] --> PLATFORM_API
    
    AGENTS --> CLAUDE[Claude Sonnet 4.5 API]
    FIELDGUIDE --> MARKDOWN[Markdown Docs]
    
    style SCANNER fill:#c8e6c9
    style AGENTS fill:#c8e6c9
    style FIELDGUIDE fill:#c8e6c9
    style WEBUI fill:#c8e6c9
    style PLATFORM_API fill:#ffcdd2
    style CLAUDE fill:#e1bee7
    style MARKDOWN fill:#f5f5f5
```

---

### View 3: Delivery Layer Dependencies

```mermaid
graph TD
    DOCS[Documentation Site] --> GOV[Governance Tooling]
    DOCS --> DDD_DOCS[DDD Documentation]
    DOCS --> BDD_DOCS[BDD Documentation]
    
    BDD[BDD Framework] --> PLAYWRIGHT[Playwright]
    BDD --> ELYSIA[Elysia Test Client]
    
    GOV --> SCHEMAS[Zod Schemas]
    GOV --> PARSERS[Markdown Parsers]
    
    style DOCS fill:#bbdefb
    style GOV fill:#bbdefb
    style BDD fill:#bbdefb
    style PLAYWRIGHT fill:#f5f5f5
    style ELYSIA fill:#f5f5f5
    style SCHEMAS fill:#f5f5f5
    style PARSERS fill:#f5f5f5
```

---

## Dependencies by Team

### Platform Team Ownership

```mermaid
graph TB
    subgraph "Owned by Platform Team"
        API[API Gateway]
        AUTH[Auth Service]
        DB[(Database)]
        CACHE[(Redis)]
    end
    
    subgraph "Consumes Platform Services"
        WEBUI[Web UI]
        SCANNER[Scanner]
        GOV[Governance]
    end
    
    WEBUI --> API
    SCANNER --> DB
    GOV --> API
    
    style API fill:#ffcdd2
    style AUTH fill:#ffcdd2
    style DB fill:#ffebee
    style CACHE fill:#ffebee
    style WEBUI fill:#e8f5e9
    style SCANNER fill:#e8f5e9
    style GOV fill:#e8f5e9
```

**Platform Team** provides:
- REST API gateway (`api-gateway.platform.katalyst`)
- Authentication services (`auth-service.platform.katalyst`)
- Database infrastructure (`database.infrastructure.platform.katalyst`)
- Caching infrastructure (`cache.infrastructure.platform.katalyst`)

**Consumers**:
- Intelligence Team (via API, database)
- Delivery Team (via API)
- External clients (via API)

---

### Intelligence Team Ownership

```mermaid
graph TB
    subgraph "Owned by Intelligence Team"
        SCANNER[Scanner]
        AGENTS[AI Agents]
        FIELDGUIDE[Field Guide Tools]
        WEBUI[Web UI]
    end
    
    subgraph "External Dependencies"
        PLATFORM_API[Platform API]
        CLAUDE[Claude API]
        DOCS_MD[Markdown Docs]
    end
    
    SCANNER --> AGENTS
    SCANNER --> FIELDGUIDE
    SCANNER --> PLATFORM_API
    WEBUI --> PLATFORM_API
    AGENTS --> CLAUDE
    FIELDGUIDE --> DOCS_MD
    
    style SCANNER fill:#c8e6c9
    style AGENTS fill:#c8e6c9
    style FIELDGUIDE fill:#c8e6c9
    style WEBUI fill:#c8e6c9
    style PLATFORM_API fill:#ffcdd2
    style CLAUDE fill:#e1bee7
    style DOCS_MD fill:#f5f5f5
```

**Intelligence Team** provides:
- FOE scanner (`scanner.intelligence.katalyst`)
- AI agent orchestration (`ai-agents.intelligence.katalyst`)
- Field Guide indexing (`field-guide-tools.intelligence.katalyst`)
- Report visualization (`web-ui.intelligence.katalyst`)

**Dependencies**:
- Platform Team (API, database)
- External AI services (Claude Sonnet 4.5)
- Markdown documentation sources

---

### Delivery Team Ownership

```mermaid
graph TB
    subgraph "Owned by Delivery Team"
        GOV[Governance]
        BDD[BDD Framework]
        DOCS[Documentation]
    end
    
    subgraph "External Dependencies"
        PLATFORM_API[Platform API]
        SCHEMAS[Zod Schemas]
        PLAYWRIGHT[Playwright]
    end
    
    DOCS --> GOV
    BDD --> PLATFORM_API
    GOV --> SCHEMAS
    BDD --> PLAYWRIGHT
    
    style GOV fill:#bbdefb
    style BDD fill:#bbdefb
    style DOCS fill:#bbdefb
    style PLATFORM_API fill:#ffcdd2
    style SCHEMAS fill:#f5f5f5
    style PLAYWRIGHT fill:#f5f5f5
```

**Delivery Team** provides:
- Governance validation (`governance.delivery-framework.katalyst`)
- BDD testing framework (`bdd-framework.delivery-framework.katalyst`)
- Documentation platform (`documentation.delivery-framework.katalyst`)

**Dependencies**:
- Platform Team (API for governance data)
- Open-source libraries (Zod, Playwright, Docusaurus)

---

## Critical Path Analysis

### Critical Path for FOE Report Generation

```mermaid
graph LR
    A[User Triggers Scan] --> B[Scanner Container Starts]
    B --> C[Load Field Guide Indices]
    C --> D[Dispatch AI Agents]
    D --> E[Analyze Repository]
    E --> F[Generate FOE Report]
    F --> G[Store in Database]
    G --> H[Display in Web UI]
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#fff3e0
    style D fill:#fff3e0
    style E fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#e8f5e9
    style H fill:#e8f5e9
```

**Critical Systems**:
1. `scanner.intelligence.katalyst` (orchestrator)
2. `field-guide-tools.intelligence.katalyst` (data dependency)
3. `ai-agents.intelligence.katalyst` (execution dependency)
4. `database.infrastructure.platform.katalyst` (persistence)
5. `web-ui.intelligence.katalyst` (presentation)

**Failure Points**:
- If Field Guide indices missing → Scanner fails
- If AI API unavailable → Scanner degrades (partial results)
- If database down → Results not persisted
- If Web UI down → Results not visible (but stored)

**Mitigation**:
- Pre-build Field Guide indices in Docker image
- Retry logic for AI API calls
- Database high availability (read replicas)
- Web UI served from CDN (99.9% uptime)

---

### Critical Path for Domain Model CRUD

```mermaid
graph LR
    A[User Request] --> B[API Gateway]
    B --> C[Auth Service]
    C --> D[Application Service]
    D --> E[Domain Layer]
    E --> F[Infrastructure Layer]
    F --> G[PostgreSQL Database]
    G --> H[Return to User]
    
    style A fill:#e3f2fd
    style B fill:#ffcdd2
    style C fill:#ffcdd2
    style D fill:#ffcdd2
    style E fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#f5f5f5
    style H fill:#e8f5e9
```

**Critical Systems**:
1. `api-gateway.platform.katalyst` (entry point)
2. `auth-service.platform.katalyst` (security gate)
3. `database.infrastructure.platform.katalyst` (persistence)

**Failure Points**:
- If API gateway down → All requests fail (single point of failure)
- If auth service down → All requests rejected
- If database primary down → Write operations fail (reads continue via replicas)

**Mitigation**:
- API gateway multi-instance (4 instances in prod, load balanced)
- Auth service multi-instance (4 instances in prod)
- Database high availability (primary + 2 replicas, auto-failover)

---

## Circular Dependency Detection

**Status**: ✅ No circular dependencies detected

### Validation Rules

1. **Layer Dependencies**: Must flow inward only (UI → App → Domain)
2. **Subsystem Dependencies**: Can reference other subsystems but no cycles
3. **Service Dependencies**: No service should depend on itself (directly or transitively)

### Automated Checks

```bash
# Check for circular dependencies in codebase
bun run check-circular-deps

# Output:
✓ No circular dependencies found in platform subsystem
✓ No circular dependencies found in intelligence subsystem
✓ No circular dependencies found in delivery subsystem
```

---

## Dependency Impact Analysis

### Scenario 1: Database Outage

**Affected Systems**:
- `api-gateway.platform.katalyst` (cannot persist data)
- `scanner.intelligence.katalyst` (cannot store scan results)
- `auth-service.platform.katalyst` (cannot validate sessions)

**Workarounds**:
- Read-only mode (use read replicas)
- Cache-first strategy (serve stale data)
- Queue write operations for later processing

**Recovery Time**:
- Automatic failover to replica: < 1 minute
- Manual restoration from backup: 1 hour (RTO)

---

### Scenario 2: Claude API Rate Limit

**Affected Systems**:
- `scanner.intelligence.katalyst` (AI agents cannot run)
- `ai-agents.intelligence.katalyst` (degraded functionality)

**Workarounds**:
- Queue scan requests
- Prioritize critical scans
- Use cached results if available

**Recovery Time**:
- Rate limits typically reset: 1 hour
- Fallback to rule-based analysis (no AI)

---

### Scenario 3: API Gateway Down

**Affected Systems**:
- `web-ui.intelligence.katalyst` (cannot fetch data)
- `governance.delivery-framework.katalyst` (cannot sync artifacts)
- `bdd-framework.delivery-framework.katalyst` (API tests fail)

**Workarounds**:
- Serve cached static reports from CDN
- Direct database access for internal tools (emergency only)

**Recovery Time**:
- Auto-scaling adds instances: < 5 minutes
- Manual intervention: < 15 minutes

---

## External Dependencies

### Third-Party Services

```mermaid
graph TD
    KATALYST[Katalyst System] --> AWS[AWS Services]
    KATALYST --> ANTHROPIC[Anthropic Claude API]
    KATALYST --> GITHUB[GitHub API]
    KATALYST --> DATADOG[DataDog]
    
    AWS --> ECS[ECS Container Service]
    AWS --> RDS[RDS PostgreSQL]
    AWS --> S3[S3 Storage]
    AWS --> CLOUDFRONT[CloudFront CDN]
    
    style KATALYST fill:#e1f5ff
    style AWS fill:#fff3e0
    style ANTHROPIC fill:#e1bee7
    style GITHUB fill:#f5f5f5
    style DATADOG fill:#f5f5f5
```

**Critical External Dependencies**:

| Service | Purpose | SLA | Fallback |
|---------|---------|-----|----------|
| **AWS ECS** | Container orchestration | 99.99% | N/A (infrastructure) |
| **AWS RDS** | Database hosting | 99.95% | Multi-AZ failover |
| **Claude API** | AI analysis | 99.9% | Rule-based analysis |
| **GitHub API** | Code repository access | 99.9% | Local git clones |
| **DataDog** | Monitoring | 99.9% | Fallback to CloudWatch |

---

## Dependency Management

### Adding New Dependencies

**Checklist**:
- [ ] Document dependency purpose
- [ ] Evaluate SLA and reliability
- [ ] Plan fallback strategy
- [ ] Update dependency graph
- [ ] Add to monitoring
- [ ] Create runbook for failures
- [ ] Get security approval (if external)
- [ ] Add to risk register

**Example: Adding Jira Integration**

1. **Document**: "Jira API for syncing ROAD items to Jira tickets"
2. **SLA**: 99.9% (Atlassian Cloud)
3. **Fallback**: Manual ticket creation
4. **Graph**: `api-gateway.platform.katalyst --> Jira API`
5. **Monitoring**: Track Jira API response times
6. **Runbook**: [Jira Integration Failure Runbook](link)
7. **Security**: OAuth 2.0 approved by security team
8. **Risk**: Added to external dependency risk register

---

### Removing Dependencies

**Checklist**:
- [ ] Identify all consumers of the dependency
- [ ] Plan migration strategy
- [ ] Update documentation
- [ ] Remove from dependency graph
- [ ] Remove from monitoring
- [ ] Archive runbooks
- [ ] Notify affected teams

---

## Visualization Tools

### Generating Dependency Graphs

```bash
# Generate dependency graph from codebase
bun run generate-dependency-graph

# Output formats
--format=mermaid  # Mermaid diagram (for Docusaurus)
--format=dot      # Graphviz DOT format
--format=json     # Machine-readable JSON

# Example: Generate Mermaid diagram
bun run generate-dependency-graph --format=mermaid > dependency-graph.mmd
```

### Interactive Dependency Explorer

**Coming Soon**: Interactive web-based dependency explorer

**Features**:
- Click nodes to see details
- Filter by subsystem, team, or layer
- Highlight critical paths
- Show impact analysis for changes
- Export diagrams

---

## Contributing

To update dependency information:

1. **Identify change**: New dependency, removed dependency, or modified relationship
2. **Update diagrams**: Modify Mermaid diagrams in this file
3. **Update impact analysis**: If critical path affected
4. **Test locally**: Verify Mermaid renders correctly
5. **Open PR** with changes
6. **Get approval** from affected teams
7. **Merge** and announce in #engineering-all

---

**Last Updated**: 2026-02-16  
**Maintained By**: Platform Team + Architecture Review Board  
**Version**: 1.0.0
