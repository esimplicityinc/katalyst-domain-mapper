---
id: ROAD-022
title: "Static Documentation Site Generator"
status: proposed
phase: 3
priority: medium
created: "2026-02-06"
updated: "2026-02-06"
owner: ""
tags: [web-ui, export, static-site, ddd, visualization]
governance:
  adrs:
    validated: false
    ids: []
    validated_by: ""
    validated_at: ""
  bdd:
    status: draft
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: [NFR-PERF-001]
    status: pending
    results: {}
dependencies:
  requires: [ROAD-016, ROAD-017, ROAD-018, ROAD-019, ROAD-020, ROAD-021]
  enables: []
---

# ROAD-022: Static Documentation Site Generator

## Summary

Generate a standalone Vite + React + Tailwind documentation site from a domain model, pre-populated with all DDD data and interactive visualizations. The site works independently of the Katalyst backend and can be deployed to any static host.

## Business Value

Some teams need to share domain documentation with stakeholders, contractors, or other organizations who don't have access to the Katalyst instance. A generated static site provides a professional, interactive documentation experience that works anywhere — similar to the hand-built OPR domain documentation site, but auto-generated from structured data.

## Acceptance Criteria

1. "Generate Site" button in the domain mapper UI
2. Output is a downloadable `.zip` containing a complete Vite + React + Tailwind project
3. `npm install && npm run build` produces a deployable `dist/` directory
4. Site includes 6 sections: Overview (stats + context map preview), Contexts (interactive diagram), Lifecycle (state machine), Aggregates (tree), Events (flow), Glossary (searchable table)
5. "How It Was Generated" page explains the Domain Mapper workflow
6. Domain model data embedded as JSON imports (zero runtime API calls)
7. Responsive design (mobile, tablet, desktop)
8. Dark mode support (respects system preference)
9. Total build output under 5MB
10. Works when served from any static host (Netlify, Vercel, GitHub Pages, S3)

## Technical Approach

### Site Template

A template project stored in `packages/foe-web-ui/templates/domain-site/` containing:

```
templates/domain-site/
├── package.json               # Vite + React + Tailwind deps
├── vite.config.ts
├── index.html
├── src/
│   ├── App.tsx                # Main app with navigation
│   ├── main.tsx
│   ├── index.css              # Tailwind imports
│   ├── data/
│   │   └── model.json         # ← Injected domain model data
│   ├── components/
│   │   ├── ContextMap.tsx     # Adapted from ROAD-016 component
│   │   ├── AggregateTree.tsx  # Adapted from ROAD-017 component
│   │   ├── EventFlow.tsx      # Adapted from ROAD-018 component
│   │   ├── Lifecycle.tsx      # Adapted from ROAD-019 component
│   │   └── Glossary.tsx       # Searchable glossary table
│   └── pages/
│       ├── Overview.tsx       # Stats + context map preview
│       └── HowItWorks.tsx     # Domain Mapper explanation
└── README.md                  # Deployment instructions
```

### Generation Pipeline

1. Load `DomainModelFull` from API
2. Copy template directory to temp folder
3. Inject domain model as `src/data/model.json`
4. Inject site metadata (title, description, branding)
5. Package as `.zip` for download

### Component Adaptation

Visualization components from ROAD-016/017/018/019 are extracted as self-contained, data-driven components that accept props (not API hooks). The static site uses these same components but passes data from the embedded JSON instead of API calls.

## Dependencies

- **Requires**: ROAD-016 (context map), ROAD-017 (aggregate tree), ROAD-018 (event flow), ROAD-019 (lifecycle), ROAD-020 (subdomain classification), ROAD-021 (markdown export as reference)
- **Enables**: None (capstone feature)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Template maintenance burden | Medium | Share components between main UI and template via extraction |
| Generated site becomes stale | Low | Include regeneration instructions in README; timestamp in footer |
| Bundle size exceeds 5MB limit | Low | Tree-shake unused components; optimize images |

## Estimation

- **Complexity**: High
- **Estimated Effort**: 5 days

---

## Governance Checklist

- [ ] ADRs identified and validated
- [ ] BDD scenarios written and approved
- [ ] Implementation complete
- [ ] NFRs validated
- [ ] Change record created
- [ ] Documentation updated
