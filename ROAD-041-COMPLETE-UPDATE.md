# ROAD-041 Update: Complete Taxonomy CRUD Coverage

## ✅ Successfully Updated

### Enhanced Scope: ALL 8 Taxonomy Entity Types

**Previous Scope:** Nodes + Environments only
**Updated Scope:** ALL 8 entity types with full CRUD operations

---

## 📋 Complete Entity Type Coverage

| Entity Type | CRUD Operations | Validation Rules |
|-------------|-----------------|------------------|
| 1. **Nodes** | ✅ Create, Read, Update, Delete | Parent validation, circular dependency detection, cascade delete |
| 2. **Environments** | ✅ Create, Read, Update, Delete | Parent environment validation, promotion target validation |
| 3. **Layer Types** | ✅ Create, Read, Update, Delete | Check if referenced by actions before deletion |
| 4. **Capabilities** | ✅ Create, Read, Update, Delete | Dependency validation, check if used in relationships |
| 5. **Capability Relationships** | ✅ Create, Read, Update, Delete | Validate node and capability references exist |
| 6. **Actions** | ✅ Create, Read, Update, Delete | Validate layerType reference if provided, check if used by tools |
| 7. **Stages** | ✅ Create, Read, Update, Delete | Dependency validation, check for dependent stages |
| 8. **Tools** | ✅ Create, Read, Update, Delete | Validate action references exist |

---

## 🏗️ Complete Port Interface

```typescript
export interface TaxonomyRepository {
  // ── Existing (unchanged) ──────────────────────────────
  saveSnapshot(data: ValidatedTaxonomyData): Promise<StoredTaxonomySnapshot>;
  getNodes(nodeType?: string): Promise<TaxonomyNodeSummary[]>;
  getEnvironments(): Promise<TaxonomyEnvironmentSummary[]>;
  
  // ── NEW: 8 Entity Types × 5 Operations = 40 methods ───
  
  // Nodes (5 methods)
  createNode, getNode, updateNode, deleteNode, getNodeChildren
  
  // Environments (4 methods)
  createEnvironment, getEnvironment, updateEnvironment, deleteEnvironment
  
  // Layer Types (5 methods)
  createLayerType, getLayerType, getLayerTypes, updateLayerType, deleteLayerType
  
  // Capabilities (5 methods)
  createCapability, getCapability, getCapabilities, updateCapability, deleteCapability
  
  // Capability Relationships (5 methods)
  createCapabilityRel, getCapabilityRel, getCapabilityRels, updateCapabilityRel, deleteCapabilityRel
  
  // Actions (5 methods)
  createAction, getAction, getActions, updateAction, deleteAction
  
  // Stages (5 methods)
  createStage, getStage, getStages, updateStage, deleteStage
  
  // Tools (5 methods)
  createTool, getTool, getTools, updateTool, deleteTool
  
  // Validation Helpers (7 methods)
  validateNodeParent, detectCircularDependency, validateLayerTypeInUse,
  validateCapabilityInUse, validateActionInUse, validateStageHasDependents, ...
}
```

**Total New Methods**: ~47 methods added to port interface

---

## 📁 Complete File Adapter Structure

```
taxonomy/
├── nodes/
│   ├── katalyst.yaml
│   ├── intelligence.yaml
│   └── ...
├── environments/
│   ├── dev.yaml
│   ├── staging.yaml
│   └── prod.yaml
├── layer-types/
│   ├── presentation.yaml
│   ├── application.yaml
│   ├── domain.yaml
│   └── infrastructure.yaml
├── capabilities/
│   ├── user-auth.yaml
│   ├── api-gateway.yaml
│   └── ...
├── capability-rels/
│   ├── katalyst-supports-user-auth.yaml
│   └── ...
├── actions/
│   ├── deploy-api.yaml
│   ├── rollback.yaml
│   └── ...
├── stages/
│   ├── build.yaml
│   ├── test.yaml
│   └── deploy.yaml
└── tools/
    ├── kubectl.yaml
    ├── docker.yaml
    └── ...
```

---

## 🎯 Updated API Endpoints (40 total)

### Nodes (5 endpoints)
- POST   /api/v1/taxonomy/nodes
- GET    /api/v1/taxonomy/nodes
- GET    /api/v1/taxonomy/nodes/:name
- PUT    /api/v1/taxonomy/nodes/:name
- DELETE /api/v1/taxonomy/nodes/:name

### Environments (5 endpoints)
- POST   /api/v1/taxonomy/environments
- GET    /api/v1/taxonomy/environments
- GET    /api/v1/taxonomy/environments/:name
- PUT    /api/v1/taxonomy/environments/:name
- DELETE /api/v1/taxonomy/environments/:name

### Layer Types (5 endpoints)
- POST   /api/v1/taxonomy/layer-types
- GET    /api/v1/taxonomy/layer-types
- GET    /api/v1/taxonomy/layer-types/:name
- PUT    /api/v1/taxonomy/layer-types/:name
- DELETE /api/v1/taxonomy/layer-types/:name

### Capabilities (5 endpoints)
- POST   /api/v1/taxonomy/capabilities
- GET    /api/v1/taxonomy/capabilities
- GET    /api/v1/taxonomy/capabilities/:name
- PUT    /api/v1/taxonomy/capabilities/:name
- DELETE /api/v1/taxonomy/capabilities/:name

### Capability Relationships (5 endpoints)
- POST   /api/v1/taxonomy/capability-rels
- GET    /api/v1/taxonomy/capability-rels
- GET    /api/v1/taxonomy/capability-rels/:name
- PUT    /api/v1/taxonomy/capability-rels/:name
- DELETE /api/v1/taxonomy/capability-rels/:name

### Actions (5 endpoints)
- POST   /api/v1/taxonomy/actions
- GET    /api/v1/taxonomy/actions
- GET    /api/v1/taxonomy/actions/:name
- PUT    /api/v1/taxonomy/actions/:name
- DELETE /api/v1/taxonomy/actions/:name

### Stages (5 endpoints)
- POST   /api/v1/taxonomy/stages
- GET    /api/v1/taxonomy/stages
- GET    /api/v1/taxonomy/stages/:name
- PUT    /api/v1/taxonomy/stages/:name
- DELETE /api/v1/taxonomy/stages/:name

### Tools (5 endpoints)
- POST   /api/v1/taxonomy/tools
- GET    /api/v1/taxonomy/tools
- GET    /api/v1/taxonomy/tools/:name
- PUT    /api/v1/taxonomy/tools/:name
- DELETE /api/v1/taxonomy/tools/:name

---

## 📊 Updated Estimates

### Previous Estimate
- Phase 1: 30 hours (nodes + environments only)
- Phase 2: +24 hours (file adapter + UI)
- **Total**: 54 hours

### Updated Estimate (All 8 Entity Types)
- **Phase 1**: 112 hours (14-16 working days)
  - Port interface: 8 hours
  - SQLite adapter: 40 hours
  - Use cases: 24 hours
  - API routes: 16 hours
  - BDD scenarios: 24 hours

- **Phase 2**: +80 hours (10 working days)
  - File adapter: 32 hours
  - Web UI forms: 48 hours

- **Total**: 192 hours (24 working days / ~5 weeks)

---

## 🎯 BDD Test Coverage

**Previous**: ~20 scenarios (nodes + environments)
**Updated**: ~80 scenarios across all 8 entity types

### Scenario Breakdown (10 scenarios per entity type):
1. **Nodes** (10 scenarios)
   - Create with valid parent
   - Reject non-existent parent
   - Update properties
   - Delete without children
   - Delete with cascade
   - Circular dependency detection
   - Hierarchy traversal
   - FQTN calculation
   - Bulk operations
   - Error handling

2. **Environments** (10 scenarios)
   - Create with promotion targets
   - Update template replacements
   - Delete environment
   - Parent environment validation
   - Promotion pipeline validation
   - Template variable substitution
   - Bulk operations
   - Error handling
   - Name uniqueness
   - Cascade promotions

3. **Layer Types** (10 scenarios)
   - Create layer type
   - Update default directory
   - Delete unused layer type
   - Prevent delete when referenced by actions
   - List all layer types
   - Name uniqueness
   - Directory path validation
   - Bulk operations
   - Error handling
   - Referenced by queries

4-8. **Similar coverage for:** Capabilities, Capability Rels, Actions, Stages, Tools

---

## 🔗 Referential Integrity Rules (20+ rules)

1. **Nodes**:
   - Cannot set non-existent parent
   - Cannot create circular dependencies
   - Cannot delete with children (unless cascade=true)

2. **Environments**:
   - Cannot set non-existent parent environment
   - Promotion targets must exist

3. **Layer Types**:
   - Cannot delete if referenced by actions

4. **Capabilities**:
   - Cannot delete if used in capability relationships
   - Dependency capabilities must exist

5. **Capability Relationships**:
   - Node must exist
   - All referenced capabilities must exist

6. **Actions**:
   - Layer type (if provided) must exist
   - Cannot delete if referenced by tools

7. **Stages**:
   - Dependency stages must exist
   - Cannot delete if other stages depend on it

8. **Tools**:
   - All referenced actions must exist

---

## 📝 Files Modified

1. ✅ `packages/delivery-framework/roads/ROAD-041.md` (updated)
   - Expanded from 2 entity types → 8 entity types
   - Added complete port interface with 47 new methods
   - Added file adapter structure for all 8 types
   - Added API routes for all 8 types
   - Updated estimates: 54h → 192h

2. ✅ `packages/delivery-framework/capabilities/CAP-013.md` (updated)
   - Updated description to reflect all 8 entity types
   - Enhanced key features section
   - Added complete referential integrity rules

---

## 🚀 Implementation Checklist

### Phase 1: Database CRUD (14-16 days)
- [ ] Extend TaxonomyRepository port interface (+47 methods)
- [ ] Implement SQLite adapter for all 8 entity types
- [ ] Create use cases for all CRUD operations (24 use cases)
- [ ] Add HTTP routes for all 8 entity types (40 endpoints)
- [ ] Write BDD scenarios (~80 scenarios)
- [ ] Implement referential integrity validation (20+ rules)
- [ ] Run BDD tests and achieve 100% pass rate
- [ ] Validate NFRs (performance <200ms, security)

### Phase 2: File Adapter + Web UI (10 days)
- [ ] Implement TaxonomyRepositoryFile for all 8 types
- [ ] Create YAML parser/serializer for each type
- [ ] Build React forms for all entity types
- [ ] Add autocomplete/dropdowns for references
- [ ] Implement real-time validation
- [ ] WCAG 2.1 AA compliance testing
- [ ] GitOps workflow documentation

---

## 🎯 Key Benefits of Complete Coverage

**Before Update:**
- ✅ Nodes and Environments only
- ❌ Layer Types: Snapshot-only ingestion
- ❌ Capabilities: Snapshot-only ingestion
- ❌ Actions: Snapshot-only ingestion
- ❌ Stages: Snapshot-only ingestion
- ❌ Tools: Snapshot-only ingestion

**After Update:**
- ✅ **ALL 8 entity types**: Full CRUD operations
- ✅ **Incremental updates**: No full snapshot required
- ✅ **Referential integrity**: 20+ validation rules
- ✅ **Dual persistence**: Database + File adapters
- ✅ **GitOps friendly**: YAML files in version control
- ✅ **Complete coverage**: No gaps in taxonomy management

---

**Status**: 🎯 **Proposed** — Ready for review
**Estimated Effort**: 192 hours (5 weeks)
**Priority**: High — Complete taxonomy management foundation
