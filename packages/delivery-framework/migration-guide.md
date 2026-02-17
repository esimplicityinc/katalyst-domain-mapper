---
id: migration-guide
title: Navigation Migration Guide
sidebar_label: Migration Guide
---

# Navigation Migration Guide

The Katalyst Delivery Framework documentation has been reorganized into **lifecycle-oriented navigation** to better match how software delivery teams think about their work.

## What Changed?

### Before: Flat Navigation (11 items)
The old navigation had 11 separate top-level items:

- DDD
- Planning
- BDD
- Agents
- Personas
- Capabilities
- Stories
- Roadmap
- ADRs
- NFRs
- Changes

**Problems**:
- Too many items (cognitive overload)
- No clear relationships between sections
- Unclear where to start
- Not intuitive for non-technical users

### After: Lifecycle Navigation (7 stages)
The new navigation groups content by software delivery lifecycle stages:

- **🎯 Strategy** → Roadmap, System Taxonomy
- **👥 Discovery** → Personas, User Stories
- **📋 Planning** → Implementation Plans, System Capabilities
- **🏗️ Design** → Domain-Driven Design, Architecture Decisions
- **🧪 Testing** → BDD Tests, Non-Functional Requirements
- **🤖 Automation** → AI Agents
- **📝 History** → Change Log

**Benefits**:
- Reduced cognitive load (7 stages vs 11 flat items)
- Clear progression through delivery workflow
- Intuitive for all stakeholders
- Emoji icons for visual scanning

---

## Where Did Content Move?

All existing content has been **preserved** - just reorganized. Here's where everything is now:

| Old Location | New Location | Lifecycle Stage |
|--------------|--------------|-----------------|
| **DDD** | 🏗️ Design → Domain-Driven Design | Design |
| **Planning** | 📋 Planning → Implementation Plans | Planning |
| **BDD** | 🧪 Testing → BDD Tests | Testing |
| **Agents** | 🤖 Automation → AI Agents | Automation |
| **Personas** | 👥 Discovery → Personas | Discovery |
| **Capabilities** | 📋 Planning → System Capabilities | Planning |
| **Stories** | 👥 Discovery → User Stories | Discovery |
| **Roadmap** | 🎯 Strategy → Roadmap | Strategy |
| **ADRs** | 🏗️ Design → Architecture Decisions | Design |
| **NFRs** | 🧪 Testing → Non-Functional Requirements | Testing |
| **Changes** | 📝 History → Change Log | History |

---

## What's New?

### System Taxonomy Section ✨

A **brand new** comprehensive view of organizational and system structure:

- **[Organizational Structure](/docs/taxonomy/org-structure)** - Teams, ownership mapping, RACI matrix
- **[System Hierarchy](/docs/taxonomy/system-hierarchy)** - Systems → Subsystems → Stacks → Layers
- **[Capability Mapping](/docs/taxonomy/capability-mapping)** - How capabilities relate to systems
- **[Environments](/docs/taxonomy/environments)** - Dev/staging/prod configurations
- **[Dependency Graph](/docs/taxonomy/dependency-graph)** - Visual system relationships

**Access via**: 🎯 **Strategy** → **System Taxonomy**

---

## Why This Change?

The lifecycle-oriented structure:

### ✅ Matches Industry Frameworks
- **Agile/Scrum**: Backlog → Sprint → Review → Retro
- **Design Thinking**: Empathize → Define → Ideate → Prototype → Test
- **DevOps**: Plan → Code → Build → Test → Release → Deploy → Operate → Monitor

### ✅ Universal Mental Model
All software teams follow a delivery lifecycle, regardless of methodology

### ✅ Better Discoverability
Users know which stage to check based on their current activity:
- **Planning a feature?** → Check 📋 Planning
- **Reviewing architecture?** → Check 🏗️ Design
- **Validating quality?** → Check 🧪 Testing

### ✅ Stakeholder Inclusivity
Non-technical leaders understand lifecycle stages without technical jargon

---

## How to Navigate

### Using Dropdown Menus

1. **Click a lifecycle stage** in the navbar (e.g., 🎯 Strategy)
2. **Select the section** you want (e.g., System Taxonomy)
3. **Browse content** using the sidebar

### Keyboard Navigation

- **Tab** to focus dropdown menu
- **Enter** to open dropdown
- **Arrow keys** to navigate menu items
- **Enter** to select item

### Mobile Navigation

1. **Tap the hamburger menu** (☰) in top-right
2. **Expand lifecycle stages** by tapping them
3. **Tap a section** to navigate

---

## Finding Content Quickly

### Use Case 1: "I want to see the roadmap"
**Path**: 🎯 Strategy → Roadmap & Taxonomy

### Use Case 2: "I want to understand the domain model"
**Path**: 🏗️ Design → Domain-Driven Design

### Use Case 3: "I want to see test coverage"
**Path**: 🧪 Testing → BDD Tests

### Use Case 4: "I want to know who owns a system"
**Path**: 🎯 Strategy → System Taxonomy → Organizational Structure

### Use Case 5: "I want to see architecture decisions"
**Path**: 🏗️ Design → Architecture Decisions

---

## Bookmarks & Links

### Old URLs Still Work ✅

All old URLs automatically redirect to new locations. Your bookmarks won't break!

**Example redirects**:
- `/docs/ddd` → `/docs/design/ddd` (automatically)
- `/docs/bdd` → `/docs/testing/bdd` (automatically)
- `/docs/roadmap` → `/docs/strategy/roads` (automatically)

### Updating Bookmarks (Optional)

If you want to update your bookmarks to the new structure:

| Old Bookmark | New Bookmark |
|--------------|--------------|
| `/docs/ddd` | `/docs/ddd` (sidebar will show Design section) |
| `/docs/bdd` | `/docs/bdd` (sidebar will show Testing section) |
| `/docs/roads` | `/docs/roads` (sidebar will show Strategy section) |
| `/docs/taxonomy` | `/docs/taxonomy` (**NEW**) |

**Note**: Direct page URLs haven't changed - only the sidebar grouping changed!

---

## Lifecycle Stage Details

### 🎯 Strategy
**When to use**: Planning what to build, understanding system structure

**Contents**:
- **Roadmap** - ROAD items organized by phase
- **System Taxonomy** - Org structure, system hierarchy, capabilities, environments, dependencies

**Key questions answered**:
- What should we build next?
- Who owns which systems?
- How are systems structured?
- What are the dependencies?

---

### 👥 Discovery
**When to use**: Understanding who you're building for, what they need

**Contents**:
- **Personas** - PER-001 through PER-005
- **User Stories** - US-001 through US-032 (grouped by persona)

**Key questions answered**:
- Who are our users?
- What do they need?
- What problems are we solving?

---

### 📋 Planning
**When to use**: Planning how to implement features

**Contents**:
- **Implementation Plans** - Detailed feature plans
- **System Capabilities** - CAP-001 through CAP-012

**Key questions answered**:
- How will we build this?
- What capabilities do we need?
- What's the implementation strategy?

---

### 🏗️ Design
**When to use**: Understanding architecture and domain model

**Contents**:
- **Domain-Driven Design** - Bounded contexts, aggregates, entities, value objects, events
- **Architecture Decisions** - ADR-001 through ADR-013

**Key questions answered**:
- What's the architecture?
- How is the domain modeled?
- Why were these decisions made?

---

### 🧪 Testing
**When to use**: Validating quality, ensuring requirements met

**Contents**:
- **BDD Tests** - Gherkin scenarios, feature index
- **Non-Functional Requirements** - Performance, reliability, security, maintainability, accessibility

**Key questions answered**:
- How do we test this?
- What are the quality thresholds?
- Are non-functional requirements met?

---

### 🤖 Automation
**When to use**: Understanding AI agents and automation

**Contents**:
- **AI Agents** - Agent overview and documentation

**Key questions answered**:
- What can be automated?
- How do AI agents help?
- What agents are available?

---

### 📝 History
**When to use**: Tracking what's been done, reviewing changes

**Contents**:
- **Change Log** - CHANGE-XXX entries

**Key questions answered**:
- What changed recently?
- Who made changes?
- Why were changes made?

---

## Feedback

Questions or feedback about the new navigation?

- **GitHub Issues**: [Open an issue](https://github.com/esimplicity/katalyst-domain-mapper/issues)
- **Slack**: #katalyst-delivery-framework
- **Email**: delivery@katalyst.dev

We're here to help you adapt to the new structure!

---

## Quick Reference Card

Print or bookmark this quick reference:

```
🎯 Strategy      → Roadmap, System Taxonomy
👥 Discovery     → Personas, User Stories  
📋 Planning      → Implementation Plans, System Capabilities
🏗️ Design        → Domain-Driven Design, Architecture Decisions
🧪 Testing       → BDD Tests, Non-Functional Requirements
🤖 Automation    → AI Agents
📝 History       → Change Log
```

**Remember**: All content is still there - just better organized!

---

**Migration Guide Version**: 1.0.0  
**Last Updated**: 2026-02-16  
**Questions?** See the [Taxonomy Overview](/docs/taxonomy/index) for more details.
