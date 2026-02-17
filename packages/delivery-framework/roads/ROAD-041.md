---
id: ROAD-041
title: "Taxonomy CRUD Operations with Port/Adapter Pattern"
status: proposed
phase: 2
priority: high
created: "2026-02-17"
updated: "2026-02-17"
owner: "OpenCode AI"
tags: [api, taxonomy, crud, ports-adapters, hexagonal-architecture, persistence]
governance:
  adrs:
    validated: false
    ids: []
    validated_by: ""
    validated_at: ""
    notes: "Will reference ADR-013 (Hexagonal Architecture). May need new ADR for dual persistence strategy."
  bdd:
    status: draft
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: [NFR-PERF-001, NFR-PERF-002, NFR-SEC-001, NFR-A11Y-001]
    status: pending
    results: {}
dependencies:
  requires: [ROAD-004]
  enables: [ROAD-042]
---

# ROAD-041: Taxonomy CRUD Operations with Port/Adapter Pattern

## Summary

Implement full CRUD (Create, Read, Update, Delete) operations for ALL taxonomy entity types (8 total) with a port/adapter pattern supporting both database and file-based persistence. This enables incremental taxonomy updates without requiring full snapshot re-ingestion and supports both operational API queries and GitOps workflows.

**Taxonomy Entity Types:**
1. **Nodes** — Organizational hierarchy (systems, subsystems, layers)
2. **Environments** — Deployment environments (dev, staging, prod)
3. **Layer Types** — Canonical architectural layers (presentation, domain, infrastructure)
4. **Capabilities** — System features and functionality
5. **Capability Relationships** — How capabilities relate to nodes
6. **Actions** — Automation workflows (shell, http, workflow)
7. **Stages** — Pipeline stages
8. **Tools** — Automation tools

## Business Value

**Current Pain Points:**
- Cannot add a single node without regenerating entire taxonomy JSON
- No web-based UI for taxonomy editing
- Changes require external tooling (Backstage plugin, custom scripts)
- No support for file-based source of truth (YAML in Git)

**Benefits After Implementation:**
- Platform engineers can add systems/subsystems via API or web UI
- Incremental updates reduce integration friction
- File adapter enables GitOps workflows (edit YAML → commit → CI ingests)
- Maintains backward compatibility with existing snapshot ingestion

**Target Personas:**
- **PER-002** (Platform Engineer) — Primary user for taxonomy management
- **PER-005** (Framework Adopter) — Needs to customize taxonomy structure

## Acceptance Criteria

1. ✅ **Node CRUD via API**
   - POST /api/v1/taxonomy/nodes — Create single node
   - GET /api/v1/taxonomy/nodes — List all nodes (already exists)
   - GET /api/v1/taxonomy/nodes/:name — Get single node
   - PUT /api/v1/taxonomy/nodes/:name — Update node properties
   - DELETE /api/v1/taxonomy/nodes/:name — Remove node (cascade children)
   - Validates parent references exist before creation
   - Prevents deletion of nodes with children (or cascade option)

2. ✅ **Environment CRUD via API**
   - POST /api/v1/taxonomy/environments — Create environment
   - GET /api/v1/taxonomy/environments — List all environments (already exists)
   - GET /api/v1/taxonomy/environments/:name — Get single environment
   - PUT /api/v1/taxonomy/environments/:name — Update environment
   - DELETE /api/v1/taxonomy/environments/:name — Remove environment

3. ✅ **Layer Type CRUD via API**
   - POST /api/v1/taxonomy/layer-types — Create layer type
   - GET /api/v1/taxonomy/layer-types — List all layer types
   - GET /api/v1/taxonomy/layer-types/:name — Get single layer type
   - PUT /api/v1/taxonomy/layer-types/:name — Update layer type
   - DELETE /api/v1/taxonomy/layer-types/:name — Remove layer type
   - Validate layer type referenced by actions before deletion

4. ✅ **Capability CRUD via API**
   - POST /api/v1/taxonomy/capabilities — Create capability
   - GET /api/v1/taxonomy/capabilities — List all capabilities
   - GET /api/v1/taxonomy/capabilities/:name — Get single capability
   - PUT /api/v1/taxonomy/capabilities/:name — Update capability
   - DELETE /api/v1/taxonomy/capabilities/:name — Remove capability
   - Validate capability dependencies and relationships

5. ✅ **Capability Relationship CRUD via API**
   - POST /api/v1/taxonomy/capability-rels — Create relationship
   - GET /api/v1/taxonomy/capability-rels — List all relationships
   - GET /api/v1/taxonomy/capability-rels/:name — Get single relationship
   - PUT /api/v1/taxonomy/capability-rels/:name — Update relationship
   - DELETE /api/v1/taxonomy/capability-rels/:name — Remove relationship
   - Validate node and capability references exist

6. ✅ **Action CRUD via API**
   - POST /api/v1/taxonomy/actions — Create action
   - GET /api/v1/taxonomy/actions — List all actions
   - GET /api/v1/taxonomy/actions/:name — Get single action
   - PUT /api/v1/taxonomy/actions/:name — Update action
   - DELETE /api/v1/taxonomy/actions/:name — Remove action
   - Validate layerType reference if provided

7. ✅ **Stage CRUD via API**
   - POST /api/v1/taxonomy/stages — Create stage
   - GET /api/v1/taxonomy/stages — List all stages
   - GET /api/v1/taxonomy/stages/:name — Get single stage
   - PUT /api/v1/taxonomy/stages/:name — Update stage
   - DELETE /api/v1/taxonomy/stages/:name — Remove stage
   - Validate stage dependencies exist

8. ✅ **Tool CRUD via API**
   - POST /api/v1/taxonomy/tools — Create tool
   - GET /api/v1/taxonomy/tools — List all tools
   - GET /api/v1/taxonomy/tools/:name — Get single tool
   - PUT /api/v1/taxonomy/tools/:name — Update tool
   - DELETE /api/v1/taxonomy/tools/:name — Remove tool
   - Validate action references exist

9. ✅ **Port Interface Extension**
   - Extend TaxonomyRepository interface with mutation methods for ALL 8 entity types
   - Maintain backward compatibility with existing query methods
   - Add validation methods for referential integrity

10. ✅ **SQLite Adapter Implementation**
   - Implement mutation methods in TaxonomyRepositorySQLite for ALL entity types
   - Add transaction support for multi-step operations
   - Maintain denormalized tables for fast queries

11. ✅ **File Adapter Implementation (TaxonomyRepositoryFile)**
   - Read/write taxonomy from directory of YAML files
   - Structure: 
     - `taxonomy/nodes/*.yaml`
     - `taxonomy/environments/*.yaml`
     - `taxonomy/layer-types/*.yaml`
     - `taxonomy/capabilities/*.yaml`
     - `taxonomy/capability-rels/*.yaml`
     - `taxonomy/actions/*.yaml`
     - `taxonomy/stages/*.yaml`
     - `taxonomy/tools/*.yaml`
   - Parse on read, serialize on write
   - Validate referential integrity across files

12. ✅ **Web UI Forms (Optional Phase 2)**
   - React forms for all entity types creation/editing
   - Autocomplete for parent node selection
   - Dropdown for layer type references
   - Validation feedback in real-time
   - WCAG 2.1 AA compliant

13. ✅ **Referential Integrity**
   - Cannot delete node with children (or cascade)
   - Cannot delete layer type referenced by actions
   - Cannot delete capability referenced by relationships
   - Cannot delete action referenced by tools
   - Cannot delete stage with dependent stages
   - Cannot set non-existent parent
   - Cannot create circular dependencies
   - Return clear error messages
   - Maintain denormalized tables for fast queries

5. ✅ **File Adapter Implementation (TaxonomyRepositoryFile)**
   - Read/write taxonomy from directory of YAML files
   - Structure: `taxonomy/nodes/*.yaml`, `taxonomy/environments/*.yaml`
   - Parse on read, serialize on write
   - Validate referential integrity across files

6. ✅ **Web UI Forms (Optional Phase 2)**
   - React forms for node creation/editing
   - Autocomplete for parent node selection
   - Validation feedback in real-time
   - WCAG 2.1 AA compliant

7. ✅ **Referential Integrity**
   - Cannot delete node with children (or cascade)
   - Cannot set non-existent parent
   - Cannot create circular dependencies
   - Return clear error messages

## Technical Approach

### Architecture Changes

```
packages/intelligence/api/
├── ports/
│   └── TaxonomyRepository.ts        # EXTEND with CRUD methods
├── adapters/
│   ├── sqlite/
│   │   └── TaxonomyRepositorySQLite.ts  # EXTEND with implementation
│   └── file/                        # NEW
│       └── TaxonomyRepositoryFile.ts    # NEW adapter
├── usecases/
│   └── taxonomy/
│       ├── CreateTaxonomyNode.ts    # NEW
│       ├── UpdateTaxonomyNode.ts    # NEW
│       └── DeleteTaxonomyNode.ts    # NEW
└── http/routes/v1/
    └── taxonomy.ts                  # ADD POST/PUT/DELETE routes
```

### Port Interface Extension

```typescript
// packages/intelligence/api/ports/TaxonomyRepository.ts
export interface TaxonomyRepository {
  // ── Existing read methods ────────────────────────────────
  saveSnapshot(data: ValidatedTaxonomyData): Promise<StoredTaxonomySnapshot>;
  getLatestSnapshot(): Promise<StoredTaxonomySnapshot | null>;
  getNodes(nodeType?: string): Promise<TaxonomyNodeSummary[]>;
  getHierarchy(): Promise<TaxonomyHierarchy>;
  getEnvironments(): Promise<TaxonomyEnvironmentSummary[]>;
  
  // ── NEW: Node CRUD ─────────────────────────────────────
  createNode(node: TaxonomyNode): Promise<TaxonomyNode>;
  getNode(name: string): Promise<TaxonomyNode | null>;
  updateNode(name: string, updates: Partial<TaxonomyNode>): Promise<TaxonomyNode>;
  deleteNode(name: string, cascade?: boolean): Promise<boolean>;
  
  // ── NEW: Environment CRUD ──────────────────────────────
  createEnvironment(env: TaxonomyEnvironment): Promise<TaxonomyEnvironment>;
  getEnvironment(name: string): Promise<TaxonomyEnvironment | null>;
  updateEnvironment(name: string, updates: Partial<TaxonomyEnvironment>): Promise<TaxonomyEnvironment>;
  deleteEnvironment(name: string): Promise<boolean>;
  
  // ── NEW: Layer Type CRUD ───────────────────────────────
  createLayerType(layerType: TaxonomyLayerType): Promise<TaxonomyLayerType>;
  getLayerType(name: string): Promise<TaxonomyLayerType | null>;
  getLayerTypes(): Promise<TaxonomyLayerType[]>;
  updateLayerType(name: string, updates: Partial<TaxonomyLayerType>): Promise<TaxonomyLayerType>;
  deleteLayerType(name: string): Promise<boolean>;
  
  // ── NEW: Capability CRUD ───────────────────────────────
  createCapability(capability: TaxonomyCapability): Promise<TaxonomyCapability>;
  getCapability(name: string): Promise<TaxonomyCapability | null>;
  getCapabilities(): Promise<TaxonomyCapability[]>;
  updateCapability(name: string, updates: Partial<TaxonomyCapability>): Promise<TaxonomyCapability>;
  deleteCapability(name: string): Promise<boolean>;
  
  // ── NEW: Capability Relationship CRUD ──────────────────
  createCapabilityRel(rel: TaxonomyCapabilityRel): Promise<TaxonomyCapabilityRel>;
  getCapabilityRel(name: string): Promise<TaxonomyCapabilityRel | null>;
  getCapabilityRels(): Promise<TaxonomyCapabilityRel[]>;
  updateCapabilityRel(name: string, updates: Partial<TaxonomyCapabilityRel>): Promise<TaxonomyCapabilityRel>;
  deleteCapabilityRel(name: string): Promise<boolean>;
  
  // ── NEW: Action CRUD ───────────────────────────────────
  createAction(action: TaxonomyAction): Promise<TaxonomyAction>;
  getAction(name: string): Promise<TaxonomyAction | null>;
  getActions(): Promise<TaxonomyAction[]>;
  updateAction(name: string, updates: Partial<TaxonomyAction>): Promise<TaxonomyAction>;
  deleteAction(name: string): Promise<boolean>;
  
  // ── NEW: Stage CRUD ────────────────────────────────────
  createStage(stage: TaxonomyStage): Promise<TaxonomyStage>;
  getStage(name: string): Promise<TaxonomyStage | null>;
  getStages(): Promise<TaxonomyStage[]>;
  updateStage(name: string, updates: Partial<TaxonomyStage>): Promise<TaxonomyStage>;
  deleteStage(name: string): Promise<boolean>;
  
  // ── NEW: Tool CRUD ─────────────────────────────────────
  createTool(tool: TaxonomyTool): Promise<TaxonomyTool>;
  getTool(name: string): Promise<TaxonomyTool | null>;
  getTools(): Promise<TaxonomyTool[]>;
  updateTool(name: string, updates: Partial<TaxonomyTool>): Promise<TaxonomyTool>;
  deleteTool(name: string): Promise<boolean>;
  
  // ── NEW: Validation helpers ────────────────────────────
  validateNodeParent(parentName: string): Promise<boolean>;
  detectCircularDependency(nodeName: string, parentName: string): Promise<boolean>;
  getNodeChildren(nodeName: string): Promise<TaxonomyNode[]>;
  validateLayerTypeInUse(layerTypeName: string): Promise<boolean>;
  validateCapabilityInUse(capabilityName: string): Promise<boolean>;
  validateActionInUse(actionName: string): Promise<boolean>;
  validateStageHasDependents(stageName: string): Promise<boolean>;
}
```

### File Adapter Structure

```yaml
# taxonomy/nodes/katalyst.yaml
name: katalyst
nodeType: system
fqtn: katalyst
description: "Katalyst Domain Mapper System"
parentNode: null
owners: ["platform-team"]
environments: ["dev", "prod"]
labels:
  tech-stack: "bun,react,typescript"
dependsOn: []

# taxonomy/environments/dev.yaml
name: dev
description: "Development environment"
parentEnvironment: null
promotionTargets: ["staging"]
templateReplacements:
  domain: "dev.katalyst.local"

# taxonomy/layer-types/presentation.yaml
name: presentation
description: "HTTP APIs, CLI, UI components"
defaultLayerDir: "src/presentation"

# taxonomy/layer-types/domain.yaml
name: domain
description: "Business logic, entities, aggregates"
defaultLayerDir: "src/domain"

# taxonomy/capabilities/user-auth.yaml
name: user-auth
description: "User authentication and authorization"
categories: ["security", "identity"]
dependsOnCapabilities: ["session-management"]

# taxonomy/capability-rels/katalyst-supports-user-auth.yaml
name: katalyst-supports-user-auth
node: katalyst
relationshipType: supports
capabilities: ["user-auth", "api-gateway"]

# taxonomy/actions/deploy-api.yaml
name: deploy-api
actionType: shell
layerType: application
tags: ["deployment", "api"]

# taxonomy/stages/build.yaml
name: build
description: "Compile and bundle application"
dependsOn: []

# taxonomy/tools/kubectl.yaml
name: kubectl
description: "Kubernetes CLI tool"
actions: ["deploy-api", "rollback"]
```

### API Routes

```typescript
// ── Nodes ──────────────────────────────────────────────
// POST /api/v1/taxonomy/nodes
{
  "name": "new-subsystem",
  "nodeType": "subsystem",
  "fqtn": "katalyst.new-subsystem",
  "description": "A new subsystem",
  "parentNode": "katalyst",
  "owners": ["team-a"],
  "environments": ["dev"],
  "labels": {},
  "dependsOn": []
}

// PUT /api/v1/taxonomy/nodes/new-subsystem
{
  "description": "Updated description",
  "owners": ["team-a", "team-b"]
}

// DELETE /api/v1/taxonomy/nodes/new-subsystem?cascade=false
// Returns 400 if node has children and cascade=false
// Returns 204 if successful

// ── Environments ───────────────────────────────────────
// POST /api/v1/taxonomy/environments
{
  "name": "staging",
  "description": "Staging environment",
  "parentEnvironment": "dev",
  "promotionTargets": ["prod"],
  "templateReplacements": {
    "domain": "staging.katalyst.io"
  }
}

// ── Layer Types ────────────────────────────────────────
// POST /api/v1/taxonomy/layer-types
{
  "name": "infrastructure",
  "description": "Databases, external APIs, file systems",
  "defaultLayerDir": "src/infrastructure"
}

// GET /api/v1/taxonomy/layer-types
// Returns array of all layer types

// DELETE /api/v1/taxonomy/layer-types/infrastructure
// Returns 400 if layer type is referenced by actions

// ── Capabilities ───────────────────────────────────────
// POST /api/v1/taxonomy/capabilities
{
  "name": "user-auth",
  "description": "User authentication and authorization",
  "categories": ["security", "identity"],
  "dependsOnCapabilities": ["session-management"]
}

// ── Capability Relationships ───────────────────────────
// POST /api/v1/taxonomy/capability-rels
{
  "name": "katalyst-supports-user-auth",
  "node": "katalyst",
  "relationshipType": "supports",
  "capabilities": ["user-auth", "api-gateway"]
}

// ── Actions ────────────────────────────────────────────
// POST /api/v1/taxonomy/actions
{
  "name": "deploy-api",
  "actionType": "shell",
  "layerType": "application",
  "tags": ["deployment", "api"]
}

// Returns 400 if layerType doesn't exist

// ── Stages ─────────────────────────────────────────────
// POST /api/v1/taxonomy/stages
{
  "name": "test",
  "description": "Run automated tests",
  "dependsOn": ["build"]
}

// ── Tools ──────────────────────────────────────────────
// POST /api/v1/taxonomy/tools
{
  "name": "kubectl",
  "description": "Kubernetes CLI tool",
  "actions": ["deploy-api", "rollback"]
}
```

### Use Case Implementation

```typescript
// packages/intelligence/api/usecases/taxonomy/CreateTaxonomyNode.ts
export class CreateTaxonomyNode {
  constructor(private taxonomyRepo: TaxonomyRepository) {}

  async execute(node: TaxonomyNode): Promise<TaxonomyNode> {
    // 1. Validate schema with Zod
    const validated = TaxonomyNodeSchema.parse(node);
    
    // 2. Check parent exists (if specified)
    if (validated.parentNode) {
      const parentExists = await this.taxonomyRepo.validateNodeParent(validated.parentNode);
      if (!parentExists) {
        throw new TaxonomyValidationError(`Parent node not found: ${validated.parentNode}`);
      }
    }
    
    // 3. Check for circular dependencies
    if (validated.parentNode) {
      const circular = await this.taxonomyRepo.detectCircularDependency(
        validated.name,
        validated.parentNode
      );
      if (circular) {
        throw new TaxonomyValidationError("Circular dependency detected");
      }
    }
    
    // 4. Create node
    return this.taxonomyRepo.createNode(validated);
  }
}
```

## BDD Scenarios

Feature files will be created at:
- `stack-tests/features/api/taxonomy/create-node.feature`
- `stack-tests/features/api/taxonomy/update-node.feature`
- `stack-tests/features/api/taxonomy/delete-node.feature`
- `stack-tests/features/api/taxonomy/file-adapter.feature`

### Example Scenarios

```gherkin
Feature: Taxonomy Node CRUD Operations
  As a platform engineer
  I want to manage taxonomy nodes incrementally
  So that I don't need to regenerate entire taxonomy snapshots

  @CAP-013 @ROAD-041 @api @taxonomy
  Scenario: Create a new system node
    Given the taxonomy is empty
    When I POST to "/api/v1/taxonomy/nodes" with:
      """
      {
        "name": "katalyst",
        "nodeType": "system",
        "fqtn": "katalyst",
        "description": "Katalyst Domain Mapper",
        "parentNode": null,
        "owners": ["platform-team"]
      }
      """
    Then the response status should be 201
    And the response should match:
      """
      {
        "name": "katalyst",
        "nodeType": "system",
        "fqtn": "katalyst"
      }
      """

  @CAP-013 @ROAD-041 @api @taxonomy
  Scenario: Cannot create node with non-existent parent
    Given the taxonomy is empty
    When I POST to "/api/v1/taxonomy/nodes" with:
      """
      {
        "name": "subsystem-a",
        "nodeType": "subsystem",
        "fqtn": "katalyst.subsystem-a",
        "parentNode": "katalyst"
      }
      """
    Then the response status should be 400
    And the response should contain error "Parent node not found: katalyst"

  @CAP-013 @ROAD-041 @api @taxonomy
  Scenario: Update node description
    Given a taxonomy node exists:
      | name     | nodeType | description    |
      | katalyst | system   | Old description |
    When I PUT to "/api/v1/taxonomy/nodes/katalyst" with:
      """
      { "description": "Updated description" }
      """
    Then the response status should be 200
    And the node "katalyst" should have description "Updated description"

  @CAP-013 @ROAD-041 @api @taxonomy
  Scenario: Cannot delete node with children
    Given a taxonomy hierarchy exists:
      | name        | nodeType  | parentNode |
      | katalyst    | system    | null       |
      | intelligence | subsystem | katalyst   |
    When I DELETE "/api/v1/taxonomy/nodes/katalyst"
    Then the response status should be 400
    And the response should contain error "Cannot delete node with children"

  @CAP-013 @ROAD-041 @api @taxonomy
  Scenario: File adapter reads taxonomy from YAML
    Given a taxonomy directory exists at "test-fixtures/taxonomy"
    And the file "taxonomy/nodes/katalyst.yaml" contains:
      """
      name: katalyst
      nodeType: system
      fqtn: katalyst
      description: "Test system"
      """
    When I initialize TaxonomyRepositoryFile with "test-fixtures/taxonomy"
    And I call getNodes()
    Then the result should contain 1 node
    And the node "katalyst" should exist
```

## Dependencies

### Requires (Blocking)
- **ROAD-004**: Governance Parsers, Index Builder & CLI
  - File adapter will use similar YAML parsing patterns
  - Status: Proposed

### Enables (Unlocks)
- **ROAD-042**: Interactive Taxonomy Editor UI (Web App)
  - Provides the API foundation for web-based editing
  - Status: Not yet defined

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dual persistence complexity | High | Start with SQLite only, add File adapter in Phase 2 |
| Referential integrity bugs | Medium | Comprehensive BDD scenarios for edge cases |
| Performance degradation with large taxonomies | Medium | Add indexes on parent_node and name columns |
| Breaking changes to existing snapshot workflow | High | Maintain full backward compatibility, add new endpoints |

## Estimation

- **Complexity**: High (8 entity types, dual adapters, referential integrity)
- **Estimated Effort**: 5-7 days

### Breakdown by Entity Type:

**Core Infrastructure (8 hours):**
1. Port interface extension for all 8 entity types (4 hours)
2. Base validation helpers and referential integrity checks (4 hours)

**SQLite Adapter Implementation (40 hours):**
1. Node CRUD (5 hours)
2. Environment CRUD (4 hours)
3. Layer Type CRUD (4 hours)
4. Capability CRUD (4 hours)
5. Capability Relationship CRUD (5 hours)
6. Action CRUD (4 hours)
7. Stage CRUD (4 hours)
8. Tool CRUD (4 hours)
9. Transaction support + referential integrity validation (6 hours)

**Use Case Implementations (24 hours):**
- Create/Update/Delete use cases for each entity type (3 hours × 8 = 24 hours)

**API Routes + Validation (16 hours):**
- HTTP routes for all 8 entity types (2 hours × 8 = 16 hours)

**BDD Scenarios + Tests (24 hours):**
- CRUD scenarios for each entity type (3 hours × 8 = 24 hours)
- Referential integrity edge cases (4 scenarios estimated)

**File Adapter Implementation (32 hours) — Optional Phase 2:**
- YAML parser/serializer for all 8 entity types (4 hours × 8 = 32 hours)

**Web UI Forms (48 hours) — Optional Phase 2:**
- React forms for all 8 entity types (6 hours × 8 = 48 hours)

**Phase 1 Total**: ~112 hours (SQLite adapter + API + BDD)
**Phase 2 Total**: +80 hours (File adapter + Web UI)

**Realistic Estimate**: 
- Phase 1: 14-16 working days (2 weeks)
- Phase 2: +10 working days (2 additional weeks)

## Phased Delivery

### Phase 1: Database CRUD (Immediate Value)
- ✅ Port interface extension for all 8 entity types
- ✅ SQLite adapter with CRUD methods for all 8 types
- ✅ API routes for: nodes, environments, layer-types, capabilities, capability-rels, actions, stages, tools
- ✅ Use case implementations for all entity types
- ✅ BDD scenarios for CRUD operations across all types
- ✅ Referential integrity validation (20+ validation rules)
- ✅ NFR validation (performance, security)

### Phase 2: File Adapter + Web UI (Future)
- ⏱️ TaxonomyRepositoryFile implementation for all 8 types
- ⏱️ YAML parsing and serialization (8 directories)
- ⏱️ React forms for all entity types editing
- ⏱️ BDD scenarios for file adapter
- ⏱️ GitOps workflow documentation

## NFR Validation

| NFR | Requirement | Test Approach |
|-----|-------------|---------------|
| NFR-PERF-001 | CRUD operations <200ms | BDD timing assertions |
| NFR-PERF-002 | Hierarchy queries <2s for <500 nodes | Load test with synthetic data |
| NFR-SEC-001 | Authenticated mutations | BDD scenarios with auth headers |
| NFR-A11Y-001 | WCAG 2.1 AA compliant forms | Phase 2: axe-core + keyboard testing |

---

## Governance Checklist

- [ ] ADRs identified and validated (ADR-013 Hexagonal Architecture applies)
- [ ] BDD scenarios written and approved (~80 scenarios estimated across 8 entity types)
- [ ] Phase 1 implementation complete (SQLite adapter + API for all 8 types)
- [ ] NFRs validated (performance, security)
- [ ] Phase 2 scoped (File adapter + Web UI) — Optional
- [ ] Change record created (CHANGE-041.md)
- [ ] Documentation updated (API docs, adapter pattern guide, entity type reference)

---

**Status**: 🎯 **Proposed**
**Created**: 2026-02-17
**Capability**: CAP-013 (System Taxonomy Management)
**Priority**: High — Unblocks incremental taxonomy evolution
