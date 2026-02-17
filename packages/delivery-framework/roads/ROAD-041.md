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

Implement full CRUD (Create, Read, Update, Delete) operations for individual taxonomy items (nodes, environments, capabilities) with a port/adapter pattern supporting both database and file-based persistence. This enables incremental taxonomy updates without requiring full snapshot re-ingestion and supports both operational API queries and GitOps workflows.

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

1. ✅ **Individual Node CRUD via API**
   - POST /api/v1/taxonomy/nodes — Create single node
   - PUT /api/v1/taxonomy/nodes/:name — Update node properties
   - DELETE /api/v1/taxonomy/nodes/:name — Remove node (cascade children)
   - Validates parent references exist before creation
   - Prevents deletion of nodes with children (or cascade option)

2. ✅ **Environment CRUD via API**
   - POST /api/v1/taxonomy/environments — Create environment
   - PUT /api/v1/taxonomy/environments/:name — Update environment
   - DELETE /api/v1/taxonomy/environments/:name — Remove environment

3. ✅ **Port Interface Extension**
   - Extend TaxonomyRepository interface with mutation methods
   - Maintain backward compatibility with existing query methods
   - Add validation methods for referential integrity

4. ✅ **SQLite Adapter Implementation**
   - Implement mutation methods in TaxonomyRepositorySQLite
   - Add transaction support for multi-step operations
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
  
  // ── NEW: Individual CRUD ─────────────────────────────────
  createNode(node: TaxonomyNode): Promise<TaxonomyNode>;
  updateNode(name: string, updates: Partial<TaxonomyNode>): Promise<TaxonomyNode>;
  deleteNode(name: string, cascade?: boolean): Promise<boolean>;
  
  createEnvironment(env: TaxonomyEnvironment): Promise<TaxonomyEnvironment>;
  updateEnvironment(name: string, updates: Partial<TaxonomyEnvironment>): Promise<TaxonomyEnvironment>;
  deleteEnvironment(name: string): Promise<boolean>;
  
  // ── NEW: Validation ──────────────────────────────────────
  validateNodeParent(parentName: string): Promise<boolean>;
  detectCircularDependency(nodeName: string, parentName: string): Promise<boolean>;
  getNodeChildren(nodeName: string): Promise<TaxonomyNode[]>;
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

# taxonomy/nodes/intelligence.yaml
name: intelligence
nodeType: subsystem
fqtn: katalyst.intelligence
description: "Intelligence API subsystem"
parentNode: katalyst
owners: ["backend-team"]
environments: ["dev", "prod"]
labels:
  language: "typescript"
dependsOn: []

# taxonomy/environments/dev.yaml
name: dev
description: "Development environment"
parentEnvironment: null
promotionTargets: ["staging"]
templateReplacements:
  domain: "dev.katalyst.local"
```

### API Routes

```typescript
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

- **Complexity**: High (dual adapters, referential integrity)
- **Estimated Effort**: 3-5 days

### Breakdown:
1. Port interface extension (4 hours)
2. SQLite adapter implementation (8 hours)
3. Use case implementations (6 hours)
4. API routes + validation (4 hours)
5. BDD scenarios + tests (8 hours)
6. File adapter implementation (8 hours) — Optional Phase 2
7. Web UI forms (16 hours) — Optional Phase 2

**Phase 1 Total**: ~30 hours (SQLite adapter only)
**Phase 2 Total**: +24 hours (File adapter + Web UI)

## Phased Delivery

### Phase 1: Database CRUD (Immediate Value)
- ✅ Port interface extension
- ✅ SQLite adapter with CRUD methods
- ✅ API routes for nodes and environments
- ✅ Use case implementations
- ✅ BDD scenarios for CRUD operations
- ✅ NFR validation (performance, security)

### Phase 2: File Adapter + Web UI (Future)
- ⏱️ TaxonomyRepositoryFile implementation
- ⏱️ YAML parsing and serialization
- ⏱️ React forms for taxonomy editing
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
- [ ] BDD scenarios written and approved (~20 scenarios estimated)
- [ ] Phase 1 implementation complete (SQLite adapter + API)
- [ ] NFRs validated (performance, security)
- [ ] Phase 2 scoped (File adapter + Web UI) — Optional
- [ ] Change record created (CHANGE-041.md)
- [ ] Documentation updated (API docs, adapter pattern guide)

---

**Status**: 🎯 **Proposed**
**Created**: 2026-02-17
**Capability**: CAP-013 (System Taxonomy Management)
**Priority**: High — Unblocks incremental taxonomy evolution
