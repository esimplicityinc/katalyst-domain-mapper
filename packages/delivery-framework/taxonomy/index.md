---
id: taxonomy-index
title: System Taxonomy Overview
sidebar_label: Overview
---

# System Taxonomy

A comprehensive view of the organizational and system structure powering the Katalyst Delivery Framework.

## What is System Taxonomy?

The Katalyst System Taxonomy provides a hierarchical representation of how teams, systems, and capabilities are organized and interact within your organization. It serves as the **single source of truth** for:

- **Who owns what** - Teams and their responsibilities
- **How systems are structured** - Hierarchical organization of systems, subsystems, stacks, and layers
- **What each system can do** - Capabilities mapped to systems
- **Where systems are deployed** - Environment configurations
- **How systems interact** - Dependencies and relationships

## Why Taxonomy Matters

### For Non-Technical Leaders
- **Strategic Visibility**: Understand the complete system landscape at a glance
- **Ownership Clarity**: Quickly identify who is responsible for each system
- **Dependency Awareness**: See how changes in one system might affect others
- **Resource Planning**: Make informed decisions about team allocation

### For Technical Teams
- **Architectural Clarity**: Understand system boundaries and responsibilities
- **Integration Planning**: Know which systems to integrate with and how
- **Troubleshooting**: Quickly identify where issues originate
- **Onboarding**: New team members can quickly understand the system landscape

### For Platform Engineers
- **Infrastructure Planning**: Know what environments and configurations are needed
- **Deployment Strategy**: Understand deployment dependencies and order
- **Monitoring Setup**: Know which systems to monitor and alert on

## Navigation Guide

Explore the taxonomy documentation:

### [Organizational Structure](org-structure.md)
- Team hierarchy and reporting structure
- System ownership mapping (RACI matrix)
- Contact information for system owners
- Organizational decision-making authority

### [System Hierarchy](system-hierarchy.md)
- Node types (System, Subsystem, Stack, Layer, User, Org Unit)
- Fully Qualified Taxonomy Names (FQTN) conventions
- System tree visualization
- Integration with `@foe/schemas/taxonomy`

### [Capability Mapping](capability-mapping.md)
- Which systems provide which capabilities
- Capability-to-system matrix (CAP-001...CAP-009 × Systems)
- Relationship types (supports, depends-on, implements, enables)
- Cross-system capability dependencies

### [Environment Structure](environments.md)
- Environment definitions (dev, staging, prod)
- Per-system environment configurations
- Deployment topology and promotion workflow
- Environment-specific configuration management

### [Dependency Graph](dependency-graph.md)
- Visual system-to-system dependencies
- Multiple views (by layer, by capability, by team)
- Color-coded by subsystem
- Impact analysis for changes

## Fully Qualified Taxonomy Names (FQTN)

Every node in the taxonomy has a unique **Fully Qualified Taxonomy Name (FQTN)** following Kubernetes naming conventions:

```
{node-name}.{parent-node}.{ancestor-node}...{root}
```

### FQTN Examples

```
katalyst                                    # Root system
platform.katalyst                           # Subsystem
api-gateway.platform.katalyst              # Stack
auth-service.security.platform.katalyst    # Service in stack
```

### FQTN Rules

1. **Kebab-case**: All lowercase with hyphens (e.g., `api-gateway`, not `API_Gateway`)
2. **Max 63 chars**: Each node name must be ≤ 63 characters
3. **DNS-safe**: Must match regex `^[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$`
4. **Unique**: No two nodes at the same level can have the same name
5. **Hierarchical**: Dot-separated from most specific to least specific

## Node Types

The taxonomy supports six node types:

| Node Type | Purpose | Example |
|-----------|---------|---------|
| **system** | Top-level organizational boundary | `katalyst` |
| **subsystem** | Major functional area within a system | `platform`, `intelligence`, `delivery-framework` |
| **stack** | Technology stack or service group | `api-gateway`, `web-ui`, `scanner` |
| **layer** | Architectural layer | `domain`, `application`, `infrastructure` |
| **user** | End user or service account | `admin-user`, `scanner-bot` |
| **org_unit** | Organizational unit (team, department) | `platform-team`, `delivery-team` |

## Integration with Schemas

The taxonomy documentation integrates with the `@foe/schemas/taxonomy` package:

```typescript
import { TaxonomyNodeSchema } from '@foe/schemas/taxonomy/taxonomy-snapshot';

// Example taxonomy node
const node = {
  name: 'api-gateway',
  nodeType: 'stack',
  fqtn: 'api-gateway.platform.katalyst',
  description: 'REST API gateway for all services',
  parentNode: 'platform.katalyst',
  owners: ['platform-team'],
  environments: ['dev', 'staging', 'prod'],
  labels: {
    tech: 'elysia',
    language: 'typescript',
  },
  dependsOn: ['auth-service.platform.katalyst'],
};
```

## Taxonomy Use Cases

### Use Case 1: Incident Response
**Scenario**: API gateway is down

1. Check **Dependency Graph** to see what systems are affected
2. Check **Organizational Structure** to identify the owning team
3. Check **Environment Structure** to understand which environments are impacted
4. Alert appropriate team members

### Use Case 2: New Feature Planning
**Scenario**: Adding Jira integration

1. Check **Capability Mapping** to see if similar integrations exist
2. Check **System Hierarchy** to decide where to place the new service
3. Check **Dependency Graph** to understand what systems will integrate with it
4. Update taxonomy after implementation

### Use Case 3: Team Restructuring
**Scenario**: Creating a new "Integrations Team"

1. Update **Organizational Structure** with new team
2. Update **System Hierarchy** to assign system ownership
3. Update **Capability Mapping** to reflect new responsibilities
4. Update contact information and RACI matrix

### Use Case 4: Architecture Review
**Scenario**: Validating hexagonal architecture compliance

1. Check **System Hierarchy** to understand layer structure
2. Check **Dependency Graph** to verify dependencies flow inward
3. Validate no circular dependencies exist
4. Confirm ports & adapters pattern is followed

## Maintenance

### Who Updates the Taxonomy?

- **Platform Engineers**: System hierarchy, environment structure
- **Engineering Leads**: Organizational structure, ownership mapping
- **Product Managers**: Capability mapping, strategic priorities
- **DevOps Team**: Environment configurations, deployment topology

### When to Update?

- **New system added**: Update system hierarchy and dependency graph
- **Team changes**: Update organizational structure and ownership mapping
- **New capability**: Update capability mapping
- **Architecture changes**: Update system hierarchy and dependency graph
- **Environment changes**: Update environment structure

### How to Update?

1. Edit the relevant markdown files in `taxonomy/`
2. Validate changes against `@foe/schemas/taxonomy` schemas
3. Update any auto-generated sections
4. Commit changes with descriptive message
5. Deploy documentation updates

## Future Enhancements

### Short-Term
- ☐ Auto-generate system hierarchy from API
- ☐ Interactive dependency graph with clickable nodes
- ☐ Real-time ownership data from HR systems
- ☐ Environment status indicators (health checks)

### Long-Term
- ☐ Visual taxonomy explorer UI component
- ☐ Natural language query ("Who owns the API gateway?")
- ☐ Automated org chart generation from taxonomy
- ☐ Integration with incident management tools
- ☐ Predictive impact analysis for changes

## Questions?

For questions about the taxonomy:
- **Technical Questions**: Contact Platform Team
- **Organizational Questions**: Contact Engineering Leadership
- **Taxonomy Updates**: Open a PR or issue in GitHub

---

**Last Updated**: 2026-02-16  
**Maintained By**: Platform Team  
**Version**: 1.0.0
