# ROAD-041 Creation Summary

## ✅ Successfully Created

### 1. **Capability Document: CAP-013**
- **Location**: `packages/delivery-framework/capabilities/CAP-013.md`
- **Title**: System Taxonomy Management
- **Status**: planned
- **Category**: Business

**Key Features:**
- Individual node CRUD operations
- Environment management
- Capability mapping to taxonomy nodes
- Dual persistence via port/adapter pattern (Database + File-based)
- Incremental updates without full snapshot re-ingestion
- Referential integrity validation

**Port/Adapter Architecture:**
```
TaxonomyRepository (Port)
├── TaxonomyRepositorySQLite (Adapter) — Fast queries, API optimized
└── TaxonomyRepositoryFile (Adapter) — GitOps workflows, YAML/JSON
```

---

### 2. **Roadmap Item: ROAD-041**
- **Location**: `packages/delivery-framework/roads/ROAD-041.md`
- **Title**: Taxonomy CRUD Operations with Port/Adapter Pattern
- **Status**: proposed
- **Phase**: 2 — Parsers & CLI
- **Priority**: high

**Implements**: CAP-013 (System Taxonomy Management)

**Dependencies:**
- **Requires**: ROAD-004 (Governance Parsers, Index Builder & CLI)
- **Enables**: ROAD-042 (Interactive Taxonomy Editor UI — future)

---

## Phased Delivery Plan

### Phase 1: Database CRUD (30 hours) — **Immediate Value**
✅ **What's Included:**
1. Extend `TaxonomyRepository` port interface with CRUD methods
2. Implement mutations in `TaxonomyRepositorySQLite` adapter
3. Create use cases: `CreateTaxonomyNode`, `UpdateTaxonomyNode`, `DeleteTaxonomyNode`
4. Add API routes: POST/PUT/DELETE `/api/v1/taxonomy/nodes`
5. Write ~20 BDD scenarios for CRUD + validation
6. Validate NFRs (performance <200ms, security)

✅ **Deliverables:**
- Individual node creation without full snapshot re-ingestion
- Update node properties (description, owners, labels)
- Delete nodes with cascade option
- Referential integrity checks (parent validation, circular dependency detection)

---

### Phase 2: File Adapter + Web UI (24 hours) — **Future Enhancement**
⏱️ **What's Included:**
1. Implement `TaxonomyRepositoryFile` adapter
2. YAML parsing/serialization (structure: `taxonomy/nodes/*.yaml`)
3. React forms for web-based taxonomy editing
4. BDD scenarios for file adapter workflows
5. GitOps workflow documentation

⏱️ **Deliverables:**
- File-based source of truth for version control
- WCAG 2.1 AA compliant web forms
- GitOps workflow: edit YAML → commit → CI ingests

---

## Technical Architecture

### Port Interface Extension

```typescript
// packages/intelligence/api/ports/TaxonomyRepository.ts

export interface TaxonomyRepository {
  // ── Existing methods (unchanged) ────────────────────────
  saveSnapshot(data: ValidatedTaxonomyData): Promise<StoredTaxonomySnapshot>;
  getNodes(nodeType?: string): Promise<TaxonomyNodeSummary[]>;
  getHierarchy(): Promise<TaxonomyHierarchy>;
  
  // ── NEW: Individual CRUD ────────────────────────────────
  createNode(node: TaxonomyNode): Promise<TaxonomyNode>;
  updateNode(name: string, updates: Partial<TaxonomyNode>): Promise<TaxonomyNode>;
  deleteNode(name: string, cascade?: boolean): Promise<boolean>;
  
  createEnvironment(env: TaxonomyEnvironment): Promise<TaxonomyEnvironment>;
  updateEnvironment(name: string, updates: Partial<TaxonomyEnvironment>): Promise<TaxonomyEnvironment>;
  deleteEnvironment(name: string): Promise<boolean>;
  
  // ── NEW: Validation helpers ─────────────────────────────
  validateNodeParent(parentName: string): Promise<boolean>;
  detectCircularDependency(nodeName: string, parentName: string): Promise<boolean>;
  getNodeChildren(nodeName: string): Promise<TaxonomyNode[]>;
}
```

### File Structure Changes

```
packages/intelligence/api/
├── ports/
│   └── TaxonomyRepository.ts        # EXTEND with CRUD methods ✅
├── adapters/
│   ├── sqlite/
│   │   └── TaxonomyRepositorySQLite.ts  # EXTEND with implementation ✅
│   └── file/                        # NEW ⏱️
│       └── TaxonomyRepositoryFile.ts    # NEW adapter ⏱️
├── usecases/
│   └── taxonomy/
│       ├── CreateTaxonomyNode.ts    # NEW ✅
│       ├── UpdateTaxonomyNode.ts    # NEW ✅
│       └── DeleteTaxonomyNode.ts    # NEW ✅
└── http/routes/v1/
    └── taxonomy.ts                  # ADD POST/PUT/DELETE routes ✅
```

---

## API Endpoints (New)

### Create Node
```http
POST /api/v1/taxonomy/nodes
Content-Type: application/json

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

Response: 201 Created
{
  "name": "new-subsystem",
  "nodeType": "subsystem",
  "fqtn": "katalyst.new-subsystem",
  ...
}
```

### Update Node
```http
PUT /api/v1/taxonomy/nodes/new-subsystem
Content-Type: application/json

{
  "description": "Updated description",
  "owners": ["team-a", "team-b"]
}

Response: 200 OK
{
  "name": "new-subsystem",
  "description": "Updated description",
  ...
}
```

### Delete Node
```http
DELETE /api/v1/taxonomy/nodes/new-subsystem?cascade=false

Response: 204 No Content (if successful)
Response: 400 Bad Request (if node has children and cascade=false)
{
  "error": "Cannot delete node with children. Use cascade=true to delete all descendants."
}
```

---

## BDD Scenarios (Planned)

**Feature Files:**
- `stack-tests/features/api/taxonomy/create-node.feature` (6 scenarios)
- `stack-tests/features/api/taxonomy/update-node.feature` (4 scenarios)
- `stack-tests/features/api/taxonomy/delete-node.feature` (5 scenarios)
- `stack-tests/features/api/taxonomy/validation.feature` (5 scenarios)
- `stack-tests/features/api/taxonomy/file-adapter.feature` (Phase 2, 4 scenarios)

**Coverage:**
- ✅ Create node with valid parent
- ✅ Reject node with non-existent parent
- ✅ Detect circular dependencies
- ✅ Update node properties
- ✅ Delete node with/without children
- ✅ Cascade deletion
- ✅ File adapter read/write operations (Phase 2)

---

## NFR Validation Checkpoints

| NFR | Requirement | Test Method |
|-----|-------------|-------------|
| NFR-PERF-001 | CRUD <200ms | BDD timing assertions |
| NFR-PERF-002 | Hierarchy queries <2s (500 nodes) | Load test with synthetic data |
| NFR-SEC-001 | Authenticated mutations | BDD scenarios with auth headers |
| NFR-A11Y-001 | WCAG 2.1 AA (Phase 2 web forms) | axe-core + keyboard testing |

---

## Governance Checklist

- [ ] **ADRs validated** — Leverage ADR-013 (Hexagonal Architecture)
- [ ] **BDD scenarios written** — ~20 scenarios across 4 feature files
- [ ] **Phase 1 implemented** — SQLite adapter + API routes
- [ ] **NFRs validated** — Performance, security tests passing
- [ ] **Phase 2 scoped** — File adapter + Web UI (optional future work)
- [ ] **Change entry created** — CHANGE-041.md after completion
- [ ] **Documentation updated** — API docs, adapter pattern guide

---

## Files Created

1. ✅ `packages/delivery-framework/capabilities/CAP-013.md` — Capability definition
2. ✅ `packages/delivery-framework/roads/ROAD-041.md` — Roadmap item with full implementation plan
3. ✅ `packages/delivery-framework/capabilities/index.md` — Updated with CAP-013 entry

---

## Next Steps

### Immediate (For Implementation)
1. **Review & Approve** — Get stakeholder buy-in on the phased approach
2. **Write ADR** — Document dual persistence strategy (if new ADR needed)
3. **Write BDD Scenarios** — Start with create-node.feature
4. **Extend Port Interface** — Add CRUD methods to TaxonomyRepository.ts
5. **Implement SQLite Adapter** — Add mutation methods
6. **Create Use Cases** — CreateTaxonomyNode, UpdateTaxonomyNode, DeleteTaxonomyNode
7. **Add API Routes** — POST/PUT/DELETE endpoints in taxonomy.ts

### Future (Phase 2)
1. **File Adapter** — Implement TaxonomyRepositoryFile
2. **Web UI Forms** — React components for taxonomy editing
3. **GitOps Docs** — Document file-based workflow

---

## Key Benefits of This Approach

### ✅ **Port/Adapter Pattern**
- ✅ **Flexibility**: Swap persistence strategies without changing business logic
- ✅ **Testability**: Mock the port interface for unit tests
- ✅ **Clean Architecture**: Use cases depend on abstractions, not implementations

### ✅ **Dual Persistence Options**
- ✅ **Database (SQLite)**: Fast queries, denormalized views, API optimized
- ✅ **Files (YAML)**: Version control, GitOps workflows, human-readable

### ✅ **Incremental Evolution**
- ✅ Add single nodes without regenerating entire taxonomy
- ✅ Update properties without external tooling
- ✅ Maintain backward compatibility with snapshot workflow

### ✅ **Governance Alignment**
- ✅ Follows existing hexagonal architecture (ADR-013)
- ✅ Similar pattern to DDD Domain Modeling API (CAP-009)
- ✅ BDD-driven development with comprehensive scenarios
- ✅ NFR validation gates (performance, security, accessibility)

---

**Status**: 🎯 **Proposed** — Ready for review and implementation kickoff
**Estimated Effort**: 30 hours (Phase 1) + 24 hours (Phase 2)
**Priority**: High — Unblocks incremental taxonomy management
