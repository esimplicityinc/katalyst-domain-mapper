#!/usr/bin/env bash
# =============================================================================
# Prima AI Platform — Demo Seed Script (Official Taxonomy)
# =============================================================================
# Seeds a Business Landscape for eSimplicity's Prima AI platform
# using the OFFICIAL taxonomy from `kata --path ~/Documents/Projects/prima tree`.
#
# Prima-only — NO Katalyst system, NO foundry subsystem.
# Only `prima` system (atlas, cicd, control_tower, engine, foundation, web)
# and `prima-delivery-hub` external system.
#
# Usage:
#   ./scripts/seed-prima-katalyst.sh [API_BASE_URL]
#
# Default API_BASE_URL: http://localhost:8090/api/v1
# =============================================================================

set -euo pipefail

API="${1:-http://localhost:8090/api/v1}"
echo "=== Prima AI Platform — Seed Script (Official Taxonomy) ==="
echo "API: $API"
echo ""

# ─── Helper ──────────────────────────────────────────────────────────────────
post() {
  local url="$1"
  local data="$2"
  local response
  response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
    -H "Content-Type: application/json" \
    -d "$data")
  local http_code
  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')
  
  if [[ "$http_code" -ge 400 ]]; then
    echo "  ERROR ($http_code): $body" >&2
    return 1
  fi
  echo "$body"
}

extract_id() {
  echo "$1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
}

# =============================================================================
# 1. CREATE DOMAIN MODEL
# =============================================================================
echo "─── Creating Domain Model ───"

MODEL_RESP=$(post "$API/domain-models" '{
  "name": "Prima AI Platform",
  "description": "eSimplicity enterprise AI platform — multi-model orchestration, governance, guardrails, RAG, and client applications serving government and enterprise customers. Official taxonomy from kata CLI."
}')
MODEL_ID=$(extract_id "$MODEL_RESP")
echo "  Domain Model: $MODEL_ID"
echo ""

# =============================================================================
# 1b. INGEST TAXONOMY SNAPSHOT — Full official taxonomy from `kata tree`
#     (foundry subsystem excluded)
# =============================================================================
echo "─── Ingesting Taxonomy Snapshot (Official from kata) ───"

post "$API/taxonomy" '{
  "project": "prima-platform",
  "version": "3.1.0",
  "generated": "2026-02-18T18:00:00Z",
  "documents": [
    {
      "taxonomyNodeType": "system",
      "metadata": { "name": "prima", "labels": { "org": "esimplicity", "domain": "ai" } },
      "spec": {
        "description": "Enterprise AI platform — multi-model orchestration, governance, guardrails, RAG, and client applications serving government and enterprise customers",
        "parents": { "node": null },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "atlas", "labels": { "layer": "docs" } },
      "spec": {
        "description": "Atlas subsystem housing documentation and related experiences",
        "parents": { "node": "prima" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "docsite", "labels": { "technology": "docs" } },
      "spec": {
        "description": "Prima documentation site — platform guides, API references, and onboarding materials",
        "parents": { "node": "atlas" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "cicd", "labels": { "layer": "pipeline" } },
      "spec": {
        "description": "Continuous integration and delivery tooling for Prima services",
        "parents": { "node": "prima" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "bootstrap", "labels": { "technology": "terragrunt" } },
      "spec": {
        "description": "Bootstrap pipeline assets — terragrunt wrappers, shared GitHub/AWS configuration for Prima CI/CD",
        "parents": { "node": "cicd" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "control_tower", "labels": { "layer": "governance" } },
      "spec": {
        "description": "Control Tower subsystem composed of the frontend and backend services — user/team/workspace management, LLM model registry, credential vault, guardrail policies, usage analytics, and SCIM provisioning",
        "parents": { "node": "prima" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "backend", "labels": { "technology": "fastapi" } },
      "spec": {
        "description": "Control Tower FastAPI backend — Prisma ORM, PostgreSQL, JWT/SSO auth, SCIM, encrypted credential vault, guardrail policies, model registry, tool providers, usage analytics",
        "parents": { "node": "control_tower" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "frontend", "labels": { "technology": "astro-react" } },
      "spec": {
        "description": "Control Tower admin UI — Astro 5 + React 19 islands, Radix UI, TailwindCSS 4, auto-generated OpenAPI client",
        "parents": { "node": "control_tower" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": ["backend"] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "engine", "labels": { "layer": "ai" } },
      "spec": {
        "description": "AI orchestration layer — AiOx gateway, LiteLLM provider proxy, Presidio PII detection, and Celery async workers",
        "parents": { "node": "prima" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": ["control_tower"] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "aiox", "labels": { "technology": "fastapi" } },
      "spec": {
        "description": "AiOx AI orchestration engine — FastAPI OpenAI-compatible gateway, Pydantic-AI agents, MCP tool proxy, RAG context injection, routing requests through guardrails to LLM providers",
        "parents": { "node": "engine" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": ["backend"] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "litellm", "labels": { "technology": "litellm" } },
      "spec": {
        "description": "LiteLLM proxy server — unified LLM gateway for routing requests to 100+ providers with load balancing, fallback, and spend tracking",
        "parents": { "node": "engine" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": ["backend"] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "presidio", "labels": { "technology": "presidio" } },
      "spec": {
        "description": "Microsoft Presidio PII detection and anonymization service for input/output content scanning",
        "parents": { "node": "engine" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "worker", "labels": { "technology": "celery" } },
      "spec": {
        "description": "Celery async workers — background task execution for AI agent tool calls, document processing, and batch operations",
        "parents": { "node": "engine" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": ["aiox"] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "foundation", "labels": { "layer": "infra" } },
      "spec": {
        "description": "Shared foundation resources reused across stacks — datastores, ingress prerequisites, networking",
        "parents": { "node": "prima" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "dns", "labels": { "technology": "route53" } },
      "spec": {
        "description": "Public DNS zones and wildcard certificates for alvisprima.com domains",
        "parents": { "node": "foundation" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "istio", "labels": { "technology": "istio" } },
      "spec": {
        "description": "Istio service mesh foundation for Prima platform networking",
        "parents": { "node": "foundation" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "kong", "labels": { "technology": "kong" } },
      "spec": {
        "description": "Kong API Gateway for Prima platform — request routing, rate limiting, authentication",
        "parents": { "node": "foundation" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "postgres", "labels": { "technology": "postgresql" } },
      "spec": {
        "description": "Shared PostgreSQL instance for Control Tower and Web services",
        "parents": { "node": "foundation" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "redis", "labels": { "technology": "redis" } },
      "spec": {
        "description": "Redis for caching, Celery task queues, and SSE streaming in Prima services",
        "parents": { "node": "foundation" },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "web", "labels": { "layer": "frontend" } },
      "spec": {
        "description": "User-facing web applications — RAG chat UI, document management, agent flow builder, embeddable widgets",
        "parents": { "node": "prima" },
        "owners": ["prima-frontend-team"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": ["engine", "control_tower"] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "collector", "labels": { "technology": "python" } },
      "spec": {
        "description": "Document collector — file processing, OCR, transcription, web scraping, chunking, and embedding pipeline for RAG knowledge bases with 7 data connectors",
        "parents": { "node": "web" },
        "owners": ["prima-frontend-team"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "web-frontend", "labels": { "technology": "react" } },
      "spec": {
        "description": "Prima Web frontend — React chat UI, document management, knowledge bases, agent flow builder, MCP integration, data connectors, embeddable widgets, TTS/STT, i18n",
        "parents": { "node": "web" },
        "owners": ["prima-frontend-team"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": ["server", "collector"] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "server", "labels": { "technology": "express" } },
      "spec": {
        "description": "Prima Web backend API server — Express.js, handles chat sessions, workspace CRUD, knowledge base management, agent flow execution, embeddable chat widgets, OpenAI-compatible API",
        "parents": { "node": "web" },
        "owners": ["prima-frontend-team"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": ["backend"] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "storage", "labels": { "technology": "pgvector" } },
      "spec": {
        "description": "Document and vector storage — PostgreSQL + pgvector, 9 vector DB provider adapters, file storage for uploaded documents and workspace assets",
        "parents": { "node": "web" },
        "owners": ["prima-frontend-team"],
        "environments": ["prod", "staging"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "system",
      "metadata": { "name": "prima-delivery-hub", "labels": { "org": "esimplicity", "external": "true" } },
      "spec": {
        "description": "Prima Delivery — AI agent distribution hub with 108+ agents, 140 skills, 72 plugins via OpenPackage across backend, security, CI/CD, and frontend categories",
        "parents": { "node": null },
        "owners": ["prima-platform-engineering"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    }
  ],
  "environments": [
    {
      "name": "prod",
      "description": "Production environment",
      "spec": { "parents": { "environment": null }, "promotionTargets": [], "templateReplacements": { "domain": "prima.esimplicity.com" } }
    },
    {
      "name": "staging",
      "description": "Staging environment",
      "spec": { "parents": { "environment": "prod" }, "promotionTargets": ["prod"], "templateReplacements": { "domain": "prima-staging.esimplicity.com" } }
    }
  ],
  "capabilities": [],
  "capabilityRels": [],
  "actions": [],
  "stages": [],
  "tools": []
}' > /dev/null
echo "  Taxonomy snapshot ingested (1 system, 6 subsystems, 18 stacks, 1 external system)"
echo ""

# =============================================================================
# 2. CREATE BOUNDED CONTEXTS (10 total)
# =============================================================================
echo "─── Creating Bounded Contexts ───"

# --- Core Domain (Prima business logic) ---

CTX_IAM_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "identity-access",
  "title": "Identity & Access Management",
  "description": "User registration, JWT/SSO authentication, SCIM provisioning, API token management, team/workspace role-based access control, rate limiting and budget enforcement.",
  "responsibility": "Authenticate users and service principals, enforce RBAC across workspaces, manage SSO integrations, provision/deprovision via SCIM, issue and validate JWTs.",
  "teamOwnership": "Prima Platform Engineering",
  "status": "active",
  "subdomainType": "core",
  "contextType": "internal",
  "taxonomyNode": "prima.control_tower"
}')
CTX_IAM=$(extract_id "$CTX_IAM_RESP")
echo "  identity-access: $CTX_IAM"

CTX_MODEL_REG_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "model-registry",
  "title": "LLM Model Registry & Credentials",
  "description": "Registration of Prima Models (abstraction over provider models), encrypted credential vault for 20+ LLM providers, workspace-level model assignment, guardrail rule management, tool provider management, and provider discovery.",
  "responsibility": "Store and manage LLM provider credentials (Fernet-encrypted at rest), define Prima Model abstractions, assign models to workspaces, manage guardrail rules, manage MCP tool providers and instances.",
  "teamOwnership": "Prima Platform Engineering",
  "status": "active",
  "subdomainType": "core",
  "contextType": "internal",
  "taxonomyNode": "prima.control_tower.backend"
}')
CTX_MODEL_REG=$(extract_id "$CTX_MODEL_REG_RESP")
echo "  model-registry: $CTX_MODEL_REG"

CTX_ORCHESTRATION_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "ai-orchestration",
  "title": "AI Orchestration (AiOx)",
  "description": "OpenAI-compatible chat completion gateway routing requests through guardrails to the appropriate LLM provider. Pydantic-AI agent framework, MCP tool gateway, RAG context injection, Redis Streams for SSE streaming.",
  "responsibility": "Accept chat completion requests, resolve workspace credentials from Control Tower, apply input guardrails, dispatch to LLM provider via LiteLLM, apply output guardrails, proxy MCP tool calls, inject RAG context, stream responses via SSE, report usage telemetry.",
  "teamOwnership": "Prima Platform Engineering",
  "status": "active",
  "subdomainType": "core",
  "contextType": "internal",
  "taxonomyNode": "prima.engine.aiox"
}')
CTX_ORCHESTRATION=$(extract_id "$CTX_ORCHESTRATION_RESP")
echo "  ai-orchestration: $CTX_ORCHESTRATION"

CTX_PII_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "pii-detection",
  "title": "PII Detection & Anonymization",
  "description": "Microsoft Presidio-based PII entity recognition and optional anonymization. Scans input/output for personally identifiable information with configurable entity types and actions.",
  "responsibility": "Detect PII entities in text, optionally redact or anonymize detected entities, report PII findings to orchestration layer for guardrail enforcement.",
  "teamOwnership": "Prima Platform Engineering",
  "status": "active",
  "subdomainType": "core",
  "contextType": "internal",
  "taxonomyNode": "prima.engine.presidio"
}')
CTX_PII=$(extract_id "$CTX_PII_RESP")
echo "  pii-detection: $CTX_PII"

CTX_LLM_PROXY_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "llm-proxy",
  "title": "LLM Provider Proxy (LiteLLM)",
  "description": "Unified gateway for routing requests to 100+ LLM providers with load balancing, fallback, and spend tracking. Abstracts provider-specific APIs behind OpenAI-compatible interface.",
  "responsibility": "Route LLM requests to configured providers, handle provider failover and load balancing, track token usage and costs per provider, manage API key rotation.",
  "teamOwnership": "Prima Platform Engineering",
  "status": "active",
  "subdomainType": "core",
  "contextType": "internal",
  "taxonomyNode": "prima.engine.litellm"
}')
CTX_LLM_PROXY=$(extract_id "$CTX_LLM_PROXY_RESP")
echo "  llm-proxy: $CTX_LLM_PROXY"

# --- Supporting Domain ---

CTX_RAG_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "knowledge-rag",
  "title": "Knowledge Base & RAG",
  "description": "Document ingestion pipeline with 9 file converters, OCR, Whisper transcription, web scraping. 7 data connectors (GitHub, GitLab, Confluence, YouTube, Obsidian, Drupal, Website). Vector storage via PostgreSQL + pgvector with 9 vector DB provider adapters.",
  "responsibility": "Process uploaded documents into vector embeddings via the collector, manage data connector imports, manage knowledge base assignments to workspaces, perform similarity search, store vectors and documents.",
  "teamOwnership": "Prima Frontend Team",
  "status": "active",
  "subdomainType": "supporting",
  "contextType": "internal",
  "taxonomyNode": "prima.web.collector"
}')
CTX_RAG=$(extract_id "$CTX_RAG_RESP")
echo "  knowledge-rag: $CTX_RAG"

CTX_WORKSPACE_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "workspace-chat",
  "title": "Workspace Chat & Agents",
  "description": "Multi-threaded AI chat within workspaces, visual agent flow builder with 9 node types, data connector UI, MCP tool integration, slash commands, prompt sidebar, citations, TTS/STT, i18n, community hub for sharing agent skills.",
  "responsibility": "Manage chat threads and message history, execute AI agent flows, integrate MCP servers for tool use, provide slash command presets, render data connector UI, host embeddable chat widgets.",
  "teamOwnership": "Prima Frontend Team",
  "status": "active",
  "subdomainType": "supporting",
  "contextType": "internal",
  "taxonomyNode": "prima.web.web-frontend"
}')
CTX_WORKSPACE=$(extract_id "$CTX_WORKSPACE_RESP")
echo "  workspace-chat: $CTX_WORKSPACE"

CTX_WEB_SERVER_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "web-api-server",
  "title": "Web API Server",
  "description": "Express.js backend API for Prima Web — handles chat sessions, workspace management, knowledge base CRUD, document uploads, agent flow execution, embeddable chat widgets, OpenAI-compatible API endpoints.",
  "responsibility": "Serve REST API for Prima Web frontend, manage workspace sessions, proxy AI requests to engine, handle file uploads to storage, execute agent flows, manage embed sessions, serve OpenAI-compatible endpoints.",
  "teamOwnership": "Prima Frontend Team",
  "status": "active",
  "subdomainType": "supporting",
  "contextType": "internal",
  "taxonomyNode": "prima.web.server"
}')
CTX_WEB_SERVER=$(extract_id "$CTX_WEB_SERVER_RESP")
echo "  web-api-server: $CTX_WEB_SERVER"

CTX_ASYNC_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "async-workers",
  "title": "Async Task Workers",
  "description": "Celery workers for background task execution — AI agent tool calls, MCP tool invocations, document processing, batch operations, and scheduled jobs.",
  "responsibility": "Execute long-running AI tool calls asynchronously, process document embedding queues, run scheduled batch operations, report task status and results.",
  "teamOwnership": "Prima Platform Engineering",
  "status": "active",
  "subdomainType": "supporting",
  "contextType": "internal",
  "taxonomyNode": "prima.engine.worker"
}')
CTX_ASYNC=$(extract_id "$CTX_ASYNC_RESP")
echo "  async-workers: $CTX_ASYNC"

# --- Generic / External ---

CTX_DELIVERY_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "agent-delivery",
  "title": "Agent Delivery Hub",
  "description": "Distribution hub for 108+ AI agents, 140 skills, and 72 plugins via OpenPackage across categories: backend, security, CI/CD, frontend, and more.",
  "responsibility": "Package, version, and distribute reusable AI agent skills to Prima Web and other OpenCode-compatible clients.",
  "teamOwnership": "Prima Platform Engineering",
  "status": "active",
  "subdomainType": "generic",
  "contextType": "external-system",
  "taxonomyNode": "prima-delivery-hub"
}')
CTX_DELIVERY=$(extract_id "$CTX_DELIVERY_RESP")
echo "  agent-delivery: $CTX_DELIVERY"

echo ""
echo "  Total: 10 bounded contexts created"
echo ""

# =============================================================================
# 3. CREATE DOMAIN EVENTS (14 events)
# =============================================================================
echo "─── Creating Domain Events ───"

# Event 1: User authenticated
# CAP-001 (control_tower.backend) → CAP-008 (engine.aiox), CAP-017 (web.web-frontend)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_IAM\",
  \"slug\": \"user-authenticated\",
  \"title\": \"User Authenticated\",
  \"description\": \"User successfully authenticated via password or SSO. JWT session token issued. Rate limit counters initialized.\",
  \"payload\": [
    {\"field\": \"userId\", \"type\": \"string\"},
    {\"field\": \"authMethod\", \"type\": \"string\", \"enum\": [\"password\", \"sso\", \"api-token\"]},
    {\"field\": \"workspaceIds\", \"type\": \"array\"},
    {\"field\": \"siteRole\", \"type\": \"string\", \"enum\": [\"admin\", \"user\"]}
  ],
  \"consumedBy\": [\"ai-orchestration\", \"workspace-chat\", \"web-api-server\"],
  \"sourceCapabilityId\": \"CAP-001\",
  \"targetCapabilityIds\": [\"CAP-008\", \"CAP-017\"],
  \"triggers\": [\"User submits login form\", \"SSO callback received\", \"API token presented\"],
  \"sideEffects\": [\"JWT cookie set\", \"Rate limit counters initialized\", \"Last login timestamp updated\"]
}" > /dev/null
echo "  user-authenticated"

# Event 2: Workspace created
# CAP-001 (control_tower.backend) → CAP-017 (web.web-frontend), CAP-020 (web.collector)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_IAM\",
  \"slug\": \"workspace-created\",
  \"title\": \"Workspace Created\",
  \"description\": \"A new workspace has been provisioned with default settings, model assignments, and team membership.\",
  \"payload\": [
    {\"field\": \"workspaceId\", \"type\": \"string\"},
    {\"field\": \"name\", \"type\": \"string\"},
    {\"field\": \"visibility\", \"type\": \"string\", \"enum\": [\"public\", \"private\"]},
    {\"field\": \"createdBy\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"workspace-chat\", \"knowledge-rag\", \"model-registry\"],
  \"sourceCapabilityId\": \"CAP-001\",
  \"targetCapabilityIds\": [\"CAP-017\", \"CAP-020\"],
  \"triggers\": [\"Admin creates workspace via Tower UI\", \"API call to create workspace\"],
  \"sideEffects\": [\"Default knowledge base created\", \"Creator assigned as workspace manager\"]
}" > /dev/null
echo "  workspace-created"

# Event 3: Prima model registered
# CAP-002 (control_tower.backend) → CAP-008 (engine.aiox), CAP-011 (engine.litellm)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_MODEL_REG\",
  \"slug\": \"prima-model-registered\",
  \"title\": \"Prima Model Registered\",
  \"description\": \"A new Prima Model abstraction has been registered over an LLM provider model with encrypted credentials and optional guardrail rules attached.\",
  \"payload\": [
    {\"field\": \"primaModelId\", \"type\": \"string\"},
    {\"field\": \"providerName\", \"type\": \"string\"},
    {\"field\": \"modelName\", \"type\": \"string\"},
    {\"field\": \"guardrailRuleIds\", \"type\": \"array\"}
  ],
  \"consumedBy\": [\"ai-orchestration\", \"llm-proxy\", \"workspace-chat\"],
  \"sourceCapabilityId\": \"CAP-002\",
  \"targetCapabilityIds\": [\"CAP-008\", \"CAP-011\"],
  \"triggers\": [\"Admin registers model in Tower UI\"],
  \"sideEffects\": [\"Model available for workspace assignment\", \"Credentials encrypted and stored\", \"LiteLLM routing updated\"]
}" > /dev/null
echo "  prima-model-registered"

# Event 4: Chat completion requested
# CAP-008 (engine.aiox) → CAP-012 (engine.presidio), CAP-011 (engine.litellm)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_ORCHESTRATION\",
  \"slug\": \"chat-completion-requested\",
  \"title\": \"Chat Completion Requested\",
  \"description\": \"An OpenAI-compatible chat completion request has been received by AiOx. Workspace resolved, credentials fetched, input guardrails applied.\",
  \"payload\": [
    {\"field\": \"requestId\", \"type\": \"string\"},
    {\"field\": \"workspaceId\", \"type\": \"string\"},
    {\"field\": \"modelId\", \"type\": \"string\"},
    {\"field\": \"streaming\", \"type\": \"boolean\"},
    {\"field\": \"messageCount\", \"type\": \"integer\"}
  ],
  \"consumedBy\": [\"pii-detection\", \"llm-proxy\"],
  \"sourceCapabilityId\": \"CAP-008\",
  \"targetCapabilityIds\": [\"CAP-012\", \"CAP-011\"],
  \"triggers\": [\"Client sends POST /v1/chat/completions\"],
  \"sideEffects\": [\"Input PII scan triggered\", \"Provider credentials resolved via LiteLLM\", \"Request dispatched to LLM\"]
}" > /dev/null
echo "  chat-completion-requested"

# Event 5: PII detected
# CAP-012 (engine.presidio) → CAP-008 (engine.aiox)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_PII\",
  \"slug\": \"pii-detected\",
  \"title\": \"PII Detected\",
  \"description\": \"Presidio has detected personally identifiable information in input or output text. Action taken based on guardrail rule: log, warn, block, or redact.\",
  \"payload\": [
    {\"field\": \"detectionId\", \"type\": \"string\"},
    {\"field\": \"entityType\", \"type\": \"string\"},
    {\"field\": \"direction\", \"type\": \"string\", \"enum\": [\"input\", \"output\"]},
    {\"field\": \"action\", \"type\": \"string\", \"enum\": [\"log\", \"warn\", \"block\", \"redact\"]},
    {\"field\": \"confidence\", \"type\": \"number\"}
  ],
  \"consumedBy\": [\"ai-orchestration\"],
  \"sourceCapabilityId\": \"CAP-012\",
  \"targetCapabilityIds\": [\"CAP-008\"],
  \"triggers\": [\"Presidio entity recognition scan match\"],
  \"sideEffects\": [\"Request blocked if action=block\", \"Content redacted if action=redact\", \"Detection logged to telemetry\"]
}" > /dev/null
echo "  pii-detected"

# Event 6: LLM request routed
# CAP-011 (engine.litellm) → CAP-008 (engine.aiox)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_LLM_PROXY\",
  \"slug\": \"llm-request-routed\",
  \"title\": \"LLM Request Routed\",
  \"description\": \"LiteLLM has routed a chat completion request to the selected LLM provider with load balancing and fallback handling.\",
  \"payload\": [
    {\"field\": \"requestId\", \"type\": \"string\"},
    {\"field\": \"provider\", \"type\": \"string\"},
    {\"field\": \"model\", \"type\": \"string\"},
    {\"field\": \"fallbackUsed\", \"type\": \"boolean\"},
    {\"field\": \"latencyMs\", \"type\": \"number\"}
  ],
  \"consumedBy\": [\"ai-orchestration\"],
  \"sourceCapabilityId\": \"CAP-011\",
  \"targetCapabilityIds\": [\"CAP-008\"],
  \"triggers\": [\"AiOx dispatches to LiteLLM proxy\"],
  \"sideEffects\": [\"Provider metrics updated\", \"Spend tracking incremented\", \"Fallback triggered if primary fails\"]
}" > /dev/null
echo "  llm-request-routed"

# Event 7: Chat response streamed
# CAP-008 (engine.aiox) → CAP-017 (web.web-frontend)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_ORCHESTRATION\",
  \"slug\": \"chat-response-streamed\",
  \"title\": \"Chat Response Streamed\",
  \"description\": \"LLM response fully streamed to the client via Redis Streams + SSE. Token usage captured, output guardrails applied per-delta.\",
  \"payload\": [
    {\"field\": \"requestId\", \"type\": \"string\"},
    {\"field\": \"totalTokens\", \"type\": \"integer\"},
    {\"field\": \"latencyMs\", \"type\": \"number\"},
    {\"field\": \"provider\", \"type\": \"string\"},
    {\"field\": \"guardrailBlocked\", \"type\": \"boolean\"}
  ],
  \"consumedBy\": [\"workspace-chat\"],
  \"sourceCapabilityId\": \"CAP-008\",
  \"targetCapabilityIds\": [\"CAP-017\"],
  \"triggers\": [\"LLM response stream completes\"],
  \"sideEffects\": [\"Usage span exported to telemetry\", \"Chat history updated\", \"Rate limit counters incremented\"]
}" > /dev/null
echo "  chat-response-streamed"

# Event 8: Document embedded
# CAP-020 (web.collector) → CAP-022 (web.storage), CAP-014 (web.server)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_RAG\",
  \"slug\": \"document-embedded\",
  \"title\": \"Document Embedded\",
  \"description\": \"The collector has processed an uploaded document — chunked and embedded into the workspace vector database for RAG retrieval.\",
  \"payload\": [
    {\"field\": \"documentId\", \"type\": \"string\"},
    {\"field\": \"knowledgebaseId\", \"type\": \"string\"},
    {\"field\": \"chunkCount\", \"type\": \"integer\"},
    {\"field\": \"vectorDbProvider\", \"type\": \"string\"},
    {\"field\": \"embeddingModel\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"workspace-chat\", \"web-api-server\"],
  \"sourceCapabilityId\": \"CAP-020\",
  \"targetCapabilityIds\": [\"CAP-022\", \"CAP-014\"],
  \"triggers\": [\"User uploads document via Prima Web\", \"Data connector sync completes\"],
  \"sideEffects\": [\"Vector embeddings stored\", \"Knowledge base updated\", \"Document available for RAG queries\"]
}" > /dev/null
echo "  document-embedded"

# Event 9: Agent flow executed
# CAP-017 (web.web-frontend) → CAP-008 (engine.aiox), CAP-013 (engine.worker)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_WORKSPACE\",
  \"slug\": \"agent-flow-executed\",
  \"title\": \"Agent Flow Executed\",
  \"description\": \"A visual agent flow has been triggered in a workspace — executing a chain of nodes (LLM instruction, API call, web scraping, code execution).\",
  \"payload\": [
    {\"field\": \"flowId\", \"type\": \"string\"},
    {\"field\": \"workspaceId\", \"type\": \"string\"},
    {\"field\": \"nodeCount\", \"type\": \"integer\"},
    {\"field\": \"triggeredBy\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"ai-orchestration\", \"async-workers\"],
  \"sourceCapabilityId\": \"CAP-017\",
  \"targetCapabilityIds\": [\"CAP-008\", \"CAP-013\"],
  \"triggers\": [\"User triggers flow in workspace\", \"Scheduled flow execution\"],
  \"sideEffects\": [\"Multiple LLM calls dispatched\", \"Worker tasks enqueued\", \"Flow execution logged\"]
}" > /dev/null
echo "  agent-flow-executed"

# Event 10: Async task completed
# CAP-013 (engine.worker) → CAP-008 (engine.aiox)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_ASYNC\",
  \"slug\": \"async-task-completed\",
  \"title\": \"Async Task Completed\",
  \"description\": \"A Celery worker has completed a background task — tool call result, document embedding, or batch operation.\",
  \"payload\": [
    {\"field\": \"taskId\", \"type\": \"string\"},
    {\"field\": \"taskType\", \"type\": \"string\"},
    {\"field\": \"durationMs\", \"type\": \"number\"},
    {\"field\": \"status\", \"type\": \"string\", \"enum\": [\"success\", \"failure\", \"retry\"]}
  ],
  \"consumedBy\": [\"ai-orchestration\"],
  \"sourceCapabilityId\": \"CAP-013\",
  \"targetCapabilityIds\": [\"CAP-008\"],
  \"triggers\": [\"Celery task finishes execution\"],
  \"sideEffects\": [\"Result stored in Redis\", \"Caller notified via callback\", \"Task metrics exported\"]
}" > /dev/null
echo "  async-task-completed"

# Event 11: MCP tool invoked
# CAP-009 (engine.aiox) → CAP-013 (engine.worker), CAP-017 (web.web-frontend)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_ORCHESTRATION\",
  \"slug\": \"mcp-tool-invoked\",
  \"title\": \"MCP Tool Invoked\",
  \"description\": \"An MCP (Model Context Protocol) tool has been invoked during an agent conversation — connecting to GitHub, Slack, Atlassian, or custom tool providers.\",
  \"payload\": [
    {\"field\": \"toolProviderId\", \"type\": \"string\"},
    {\"field\": \"toolName\", \"type\": \"string\"},
    {\"field\": \"workspaceId\", \"type\": \"string\"},
    {\"field\": \"transport\", \"type\": \"string\", \"enum\": [\"stdio\", \"http-streamable\"]}
  ],
  \"consumedBy\": [\"workspace-chat\", \"async-workers\"],
  \"sourceCapabilityId\": \"CAP-009\",
  \"targetCapabilityIds\": [\"CAP-013\", \"CAP-017\"],
  \"triggers\": [\"LLM requests tool_call in response\"],
  \"sideEffects\": [\"Tool credentials resolved from Tower\", \"Worker task enqueued for execution\", \"Tool result returned to LLM context\"]
}" > /dev/null
echo "  mcp-tool-invoked"

# Event 12: Agent skill published
# CAP-030 (prima-delivery-hub) → CAP-017 (web.web-frontend)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_DELIVERY\",
  \"slug\": \"agent-skill-published\",
  \"title\": \"Agent Skill Published\",
  \"description\": \"A new AI agent skill or plugin has been published to the Prima Delivery hub, available for installation in Prima Web.\",
  \"payload\": [
    {\"field\": \"skillId\", \"type\": \"string\"},
    {\"field\": \"category\", \"type\": \"string\"},
    {\"field\": \"version\", \"type\": \"string\"},
    {\"field\": \"compatibleClients\", \"type\": \"array\"}
  ],
  \"consumedBy\": [\"workspace-chat\"],
  \"sourceCapabilityId\": \"CAP-030\",
  \"targetCapabilityIds\": [\"CAP-017\"],
  \"triggers\": [\"Developer publishes skill via delivery pipeline\"],
  \"sideEffects\": [\"Skill available in community hub\", \"Documentation updated\"]
}" > /dev/null
echo "  agent-skill-published"

# Event 13: Guardrail rule updated
# CAP-003 (control_tower.backend) → CAP-012 (engine.presidio), CAP-008 (engine.aiox)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_MODEL_REG\",
  \"slug\": \"guardrail-rule-updated\",
  \"title\": \"Guardrail Rule Updated\",
  \"description\": \"An admin has created or modified a guardrail rule and attached it to one or more Prima Models. The updated policy takes effect immediately on next request.\",
  \"payload\": [
    {\"field\": \"ruleId\", \"type\": \"string\"},
    {\"field\": \"severity\", \"type\": \"string\"},
    {\"field\": \"action\", \"type\": \"string\"},
    {\"field\": \"affectedModelIds\", \"type\": \"array\"}
  ],
  \"consumedBy\": [\"pii-detection\", \"ai-orchestration\"],
  \"sourceCapabilityId\": \"CAP-003\",
  \"targetCapabilityIds\": [\"CAP-012\", \"CAP-008\"],
  \"triggers\": [\"Admin edits guardrail rule in Tower UI\"],
  \"sideEffects\": [\"Policy cache invalidated\", \"Next request applies updated rules\"]
}" > /dev/null
echo "  guardrail-rule-updated"

# Event 14: Web session started
# CAP-014 (web.server) → CAP-017 (web.web-frontend), CAP-020 (web.collector)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_WEB_SERVER\",
  \"slug\": \"web-session-started\",
  \"title\": \"Web Session Started\",
  \"description\": \"Prima Web server has initialized a user session — workspace loaded, chat history fetched, knowledge bases indexed.\",
  \"payload\": [
    {\"field\": \"sessionId\", \"type\": \"string\"},
    {\"field\": \"userId\", \"type\": \"string\"},
    {\"field\": \"workspaceId\", \"type\": \"string\"},
    {\"field\": \"chatThreadCount\", \"type\": \"integer\"}
  ],
  \"consumedBy\": [\"workspace-chat\", \"knowledge-rag\"],
  \"sourceCapabilityId\": \"CAP-014\",
  \"targetCapabilityIds\": [\"CAP-017\", \"CAP-020\"],
  \"triggers\": [\"User navigates to workspace in Prima Web\"],
  \"sideEffects\": [\"Chat history loaded\", \"Knowledge base index warmed\", \"Active workspace set\"]
}" > /dev/null
echo "  web-session-started"

echo ""
echo "  Total: 14 domain events created"
echo ""

# =============================================================================
# 4. CREATE WORKFLOWS (2 workflows)
# =============================================================================
echo "─── Creating Workflows ───"

# Workflow 1: Chat Completion Lifecycle
post "$API/domain-models/$MODEL_ID/workflows" "{
  \"slug\": \"chat-completion-lifecycle\",
  \"title\": \"Chat Completion Lifecycle\",
  \"description\": \"End-to-end flow from user sending a chat message through authentication, PII scanning, RAG context injection, LLM dispatch via LiteLLM, response streaming, and usage recording.\",
  \"contextIds\": [\"$CTX_IAM\", \"$CTX_ORCHESTRATION\", \"$CTX_PII\", \"$CTX_LLM_PROXY\", \"$CTX_RAG\", \"$CTX_WORKSPACE\", \"$CTX_WEB_SERVER\"],
  \"states\": [
    {\"name\": \"Request Received\", \"type\": \"initial\"},
    {\"name\": \"Authenticated\", \"type\": \"intermediate\"},
    {\"name\": \"Input Scanned\", \"type\": \"intermediate\"},
    {\"name\": \"Context Enriched\", \"type\": \"intermediate\"},
    {\"name\": \"Routed to Provider\", \"type\": \"intermediate\"},
    {\"name\": \"Output Scanned\", \"type\": \"intermediate\"},
    {\"name\": \"Response Streamed\", \"type\": \"terminal\"},
    {\"name\": \"Blocked by PII\", \"type\": \"terminal\", \"isError\": true},
    {\"name\": \"Rate Limited\", \"type\": \"terminal\", \"isError\": true}
  ],
  \"transitions\": [
    {\"from\": \"Request Received\", \"to\": \"Authenticated\", \"label\": \"JWT validated\"},
    {\"from\": \"Authenticated\", \"to\": \"Rate Limited\", \"label\": \"Budget exceeded\"},
    {\"from\": \"Authenticated\", \"to\": \"Input Scanned\", \"label\": \"Presidio PII check\"},
    {\"from\": \"Input Scanned\", \"to\": \"Blocked by PII\", \"label\": \"PII detected (block)\"},
    {\"from\": \"Input Scanned\", \"to\": \"Context Enriched\", \"label\": \"RAG context injected\"},
    {\"from\": \"Context Enriched\", \"to\": \"Routed to Provider\", \"label\": \"LiteLLM dispatches to provider\"},
    {\"from\": \"Routed to Provider\", \"to\": \"Output Scanned\", \"label\": \"Response deltas received\"},
    {\"from\": \"Output Scanned\", \"to\": \"Response Streamed\", \"label\": \"All deltas clean, SSE complete\"},
    {\"from\": \"Output Scanned\", \"to\": \"Blocked by PII\", \"label\": \"Output PII violation\"}
  ]
}" > /dev/null
echo "  chat-completion-lifecycle (7 contexts)"

# Workflow 2: Model Governance Setup
post "$API/domain-models/$MODEL_ID/workflows" "{
  \"slug\": \"model-governance-setup\",
  \"title\": \"Model Governance Setup\",
  \"description\": \"Admin workflow for registering a new LLM provider in LiteLLM, creating a Prima Model abstraction, attaching guardrail rules, and assigning to workspaces.\",
  \"contextIds\": [\"$CTX_IAM\", \"$CTX_MODEL_REG\", \"$CTX_PII\", \"$CTX_LLM_PROXY\", \"$CTX_WORKSPACE\"],
  \"states\": [
    {\"name\": \"Credentials Stored\", \"type\": \"initial\"},
    {\"name\": \"LiteLLM Configured\", \"type\": \"intermediate\"},
    {\"name\": \"Model Registered\", \"type\": \"intermediate\"},
    {\"name\": \"Guardrails Attached\", \"type\": \"intermediate\"},
    {\"name\": \"Assigned to Workspace\", \"type\": \"intermediate\"},
    {\"name\": \"Ready for Use\", \"type\": \"terminal\"},
    {\"name\": \"Validation Failed\", \"type\": \"terminal\", \"isError\": true}
  ],
  \"transitions\": [
    {\"from\": \"Credentials Stored\", \"to\": \"LiteLLM Configured\", \"label\": \"Provider routing added\"},
    {\"from\": \"Credentials Stored\", \"to\": \"Validation Failed\", \"label\": \"Provider credentials invalid\"},
    {\"from\": \"LiteLLM Configured\", \"to\": \"Model Registered\", \"label\": \"Prima Model created\"},
    {\"from\": \"Model Registered\", \"to\": \"Guardrails Attached\", \"label\": \"PII and content rules selected\"},
    {\"from\": \"Guardrails Attached\", \"to\": \"Assigned to Workspace\", \"label\": \"Model assigned to workspace(s)\"},
    {\"from\": \"Assigned to Workspace\", \"to\": \"Ready for Use\", \"label\": \"Users can select model in chat\"}
  ]
}" > /dev/null
echo "  model-governance-setup (5 contexts)"

echo ""
echo "  Total: 2 workflows created"
echo ""

# =============================================================================
# 5. CREATE AGGREGATES (5 aggregates)
# =============================================================================
echo "─── Creating Aggregates ───"

post "$API/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_IAM\",
  \"slug\": \"user-identity\",
  \"title\": \"User Identity\",
  \"rootEntity\": \"User\",
  \"entities\": [\"User\", \"UserApiToken\", \"LocalUserProfile\"],
  \"valueObjects\": [\"Email\", \"SiteRole\", \"TeamMembership\", \"WorkspaceRole\"],
  \"events\": [\"user-authenticated\", \"workspace-created\"],
  \"commands\": [\"RegisterUser\", \"Authenticate\", \"CreateApiToken\", \"AssignWorkspaceRole\"],
  \"invariants\": [
    {\"rule\": \"Email must be unique across the system\", \"severity\": \"critical\"},
    {\"rule\": \"JWT must not be expired or revoked\", \"severity\": \"critical\"},
    {\"rule\": \"Rate limits must be checked before processing requests\", \"severity\": \"high\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  user-identity (Identity & Access)"

post "$API/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_MODEL_REG\",
  \"slug\": \"prima-model\",
  \"title\": \"Prima Model\",
  \"rootEntity\": \"PrimaModel\",
  \"entities\": [\"PrimaModel\", \"LLMProviderCredential\", \"GuardrailRule\", \"ToolProvider\"],
  \"valueObjects\": [\"ProviderName\", \"ModelName\", \"EncryptedCredential\", \"GuardrailAction\", \"ToolInstanceConfig\"],
  \"events\": [\"prima-model-registered\", \"guardrail-rule-updated\"],
  \"commands\": [\"RegisterModel\", \"AttachGuardrail\", \"AssignToWorkspace\", \"RotateCredential\", \"RegisterToolProvider\"],
  \"invariants\": [
    {\"rule\": \"Credentials must be Fernet-encrypted at rest\", \"severity\": \"critical\"},
    {\"rule\": \"Model must have at least one workspace assignment to be usable\", \"severity\": \"high\"},
    {\"rule\": \"Guardrail rules must have a valid action (log/warn/block/redact)\", \"severity\": \"high\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  prima-model (Model Registry)"

post "$API/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_ORCHESTRATION\",
  \"slug\": \"chat-session\",
  \"title\": \"Chat Session\",
  \"rootEntity\": \"ChatRequest\",
  \"entities\": [\"ChatRequest\", \"StreamingResponse\", \"ToolCall\", \"MCPToolInvocation\"],
  \"valueObjects\": [\"ModelMessage\", \"TokenUsage\", \"ProviderConfig\", \"StreamDelta\", \"RAGContext\"],
  \"events\": [\"chat-completion-requested\", \"chat-response-streamed\", \"mcp-tool-invoked\"],
  \"commands\": [\"SubmitCompletion\", \"ResolveCredentials\", \"ApplyGuardrails\", \"StreamResponse\", \"InvokeMCPTool\", \"InjectRAGContext\"],
  \"invariants\": [
    {\"rule\": \"Request must target a model assigned to the workspace\", \"severity\": \"critical\"},
    {\"rule\": \"Streaming must use Redis Streams with heartbeat timeout\", \"severity\": \"high\"},
    {\"rule\": \"Tool calls must be resolved before final response\", \"severity\": \"high\"},
    {\"rule\": \"RAG context must be injected before LLM dispatch if knowledge base is configured\", \"severity\": \"medium\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  chat-session (AI Orchestration)"

post "$API/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_RAG\",
  \"slug\": \"knowledge-document\",
  \"title\": \"Knowledge Document\",
  \"rootEntity\": \"Document\",
  \"entities\": [\"Document\", \"DocumentChunk\", \"VectorEmbedding\", \"Knowledgebase\", \"DataConnector\"],
  \"valueObjects\": [\"EmbeddingVector\", \"SimilarityScore\", \"ChunkMetadata\", \"ConnectorConfig\"],
  \"events\": [\"document-embedded\"],
  \"commands\": [\"UploadDocument\", \"EmbedChunks\", \"SearchSimilar\", \"SyncConnector\", \"ImportRepository\"],
  \"invariants\": [
    {\"rule\": \"Document must be chunked before embedding\", \"severity\": \"critical\"},
    {\"rule\": \"Knowledgebase must be assigned to workspace for RAG injection\", \"severity\": \"high\"},
    {\"rule\": \"Vector DB provider must be configured before embedding\", \"severity\": \"critical\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  knowledge-document (Knowledge & RAG)"

post "$API/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_LLM_PROXY\",
  \"slug\": \"llm-route\",
  \"title\": \"LLM Route\",
  \"rootEntity\": \"RouteConfig\",
  \"entities\": [\"RouteConfig\", \"ProviderEndpoint\", \"FallbackChain\"],
  \"valueObjects\": [\"ProviderCredential\", \"LoadBalanceWeight\", \"SpendLimit\"],
  \"events\": [\"llm-request-routed\"],
  \"commands\": [\"AddRoute\", \"UpdateWeights\", \"SetFallback\", \"PauseProvider\"],
  \"invariants\": [
    {\"rule\": \"Route must have at least one healthy provider endpoint\", \"severity\": \"critical\"},
    {\"rule\": \"Fallback chain must not contain circular references\", \"severity\": \"high\"},
    {\"rule\": \"Spend limits must be checked before routing\", \"severity\": \"high\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  llm-route (LLM Proxy)"

echo ""
echo "  Total: 5 aggregates created"
echo ""

# =============================================================================
# 6. CREATE GLOSSARY TERMS (9 terms)
# =============================================================================
echo "─── Creating Glossary Terms ───"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_ORCHESTRATION\",
  \"term\": \"AiOx\",
  \"definition\": \"AI Orchestration Exchange — the core service that accepts OpenAI-compatible chat completion requests and routes them through guardrails to LLM providers via LiteLLM. Also serves as MCP tool gateway and RAG context injector. Pronounced 'AY-ox'.\",
  \"aliases\": [\"Prima Engine\", \"AI Gateway\"],
  \"examples\": [\"AiOx dispatches requests to Anthropic Claude via LiteLLM proxy\"],
  \"relatedTerms\": [\"Pydantic-AI\", \"SSE\", \"Redis Streams\", \"LiteLLM\"]
}" > /dev/null
echo "  AiOx"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_MODEL_REG\",
  \"term\": \"Prima Model\",
  \"definition\": \"An abstraction over a specific LLM provider model (e.g., 'prima-mini' backed by Claude Sonnet). Includes encrypted credentials, workspace assignments, and guardrail rules.\",
  \"aliases\": [\"Model Abstraction\", \"Platform Model\"],
  \"examples\": [\"prima-mini maps to gpt-4.1-nano with specific API credentials\"],
  \"relatedTerms\": [\"LLM Provider\", \"Guardrail Rule\", \"Workspace\"]
}" > /dev/null
echo "  Prima Model"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_PII\",
  \"term\": \"Guardrail Rule\",
  \"definition\": \"A policy rule that scans LLM input/output for prohibited content, PII, or safety violations. Each rule has a severity (info/low/medium/high/critical) and action (log/warn/block/redact).\",
  \"aliases\": [\"Content Policy\", \"Safety Rule\"],
  \"examples\": [\"Block rule for PII prevents SSNs from appearing in LLM output\"],
  \"relatedTerms\": [\"Presidio\", \"PII\", \"Content Filter\"]
}" > /dev/null
echo "  Guardrail Rule"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_RAG\",
  \"term\": \"RAG\",
  \"definition\": \"Retrieval-Augmented Generation — a technique where relevant document chunks are retrieved from a vector database and injected into the LLM prompt context to provide grounded, factual answers.\",
  \"aliases\": [\"Retrieval-Augmented Generation\"],
  \"examples\": [\"User asks about PFAS regulations; RAG injects relevant EPA document chunks\"],
  \"relatedTerms\": [\"Knowledge Base\", \"Vector Database\", \"Embedding\", \"Collector\"]
}" > /dev/null
echo "  RAG"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_ORCHESTRATION\",
  \"term\": \"MCP\",
  \"definition\": \"Model Context Protocol — an open standard for connecting AI agents to external tools (GitHub, Slack, Atlassian, databases). Supports stdio and HTTP streamable transports.\",
  \"aliases\": [\"Model Context Protocol\"],
  \"examples\": [\"Prima Web agent connects to GitHub MCP server to read repository files\"],
  \"relatedTerms\": [\"Tool Provider\", \"Agent\", \"Tool Call\"]
}" > /dev/null
echo "  MCP"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_IAM\",
  \"term\": \"SCIM\",
  \"definition\": \"System for Cross-domain Identity Management — an open standard for automating user provisioning and deprovisioning between an identity provider (e.g., Entra ID) and Prima Control Tower.\",
  \"aliases\": [\"SCIM 2.0\", \"User Provisioning\"],
  \"examples\": [\"When an employee leaves the org, SCIM automatically deactivates their Prima account\"],
  \"relatedTerms\": [\"SSO\", \"Identity Provider\", \"JWT\"]
}" > /dev/null
echo "  SCIM"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_LLM_PROXY\",
  \"term\": \"LiteLLM\",
  \"definition\": \"Unified LLM gateway proxy — routes requests to 100+ LLM providers (OpenAI, Anthropic, Bedrock, etc.) with a single OpenAI-compatible API. Provides load balancing, fallback, and spend tracking.\",
  \"aliases\": [\"LLM Proxy\", \"Provider Gateway\"],
  \"examples\": [\"LiteLLM fails over from OpenAI to Anthropic when rate-limited\"],
  \"relatedTerms\": [\"AiOx\", \"Provider\", \"Load Balancing\"]
}" > /dev/null
echo "  LiteLLM"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_PII\",
  \"term\": \"Presidio\",
  \"definition\": \"Microsoft Presidio — open-source PII detection and anonymization engine. Recognizes entities (SSN, phone, email, credit card) with configurable confidence thresholds.\",
  \"aliases\": [\"Microsoft Presidio\", \"PII Detector\"],
  \"examples\": [\"Presidio detects a credit card number in LLM output with 0.95 confidence\"],
  \"relatedTerms\": [\"PII\", \"Guardrail Rule\", \"Anonymization\"]
}" > /dev/null
echo "  Presidio"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_WORKSPACE\",
  \"term\": \"Agent Flow\",
  \"definition\": \"A visual no-code workflow built in the Agent Builder that chains together 9 node types (LLM instruction, API call, web scraping, code execution, etc.) to automate complex multi-step AI tasks.\",
  \"aliases\": [\"Visual Flow\", \"Agent Workflow\"],
  \"examples\": [\"An agent flow chains an LLM summarization node with an API call to post results to Slack\"],
  \"relatedTerms\": [\"Agent Builder\", \"Node\", \"Workspace\"]
}" > /dev/null
echo "  Agent Flow"

echo ""
echo "  Total: 9 glossary terms created"
echo ""

# =============================================================================
# 7. INGEST GOVERNANCE SNAPSHOT
# =============================================================================
echo "─── Ingesting Governance Snapshot ───"

# Capability mapping to official taxonomy stacks (18 stacks + 1 external):
#   CAP-001: User & Workspace Governance          → prima.control_tower.backend
#   CAP-002: LLM Model Registry                   → prima.control_tower.backend
#   CAP-003: Guardrail Policy Management           → prima.control_tower.backend
#   CAP-004: Tool Provider Management              → prima.control_tower.backend
#   CAP-005: Usage Analytics Ingestion             → prima.control_tower.backend
#   CAP-006: Admin Dashboard                       → prima.control_tower.frontend
#   CAP-007: Self-Service Portal                   → prima.control_tower.frontend
#   CAP-008: AI Chat Orchestration                 → prima.engine.aiox
#   CAP-009: MCP Tool Gateway                      → prima.engine.aiox
#   CAP-010: RAG Context Injection                 → prima.engine.aiox
#   CAP-011: LLM Provider Routing                  → prima.engine.litellm
#   CAP-012: PII Detection & Anonymization         → prima.engine.presidio
#   CAP-013: Async Task Execution                  → prima.engine.worker
#   CAP-014: Web API Server                        → prima.web.server
#   CAP-015: Agent Flow Engine                     → prima.web.server
#   CAP-016: Embeddable Chat Widgets               → prima.web.server
#   CAP-017: Workspace Chat UI                     → prima.web.web-frontend
#   CAP-018: Agent Builder UI                      → prima.web.web-frontend
#   CAP-019: Data Connector UI                     → prima.web.web-frontend
#   CAP-020: Document Ingestion Pipeline           → prima.web.collector
#   CAP-021: Data Connector Extensions             → prima.web.collector
#   CAP-022: Document & Vector Storage             → prima.web.storage
#   CAP-023: Platform Documentation                → prima.atlas.docsite
#   CAP-024: CI/CD Bootstrap                       → prima.cicd.bootstrap
#   CAP-025: DNS & Certificate Management          → prima.foundation.dns
#   CAP-026: API Gateway Routing                   → prima.foundation.kong
#   CAP-027: Shared Database Service               → prima.foundation.postgres
#   CAP-028: Cache & Message Broker                → prima.foundation.redis
#   CAP-029: Service Mesh Networking               → prima.foundation.istio
#   CAP-030: Agent Skill Distribution              → prima-delivery-hub

post "$API/governance" '{
  "version": "3.1.0",
  "project": "prima-platform",
  "generated": "2026-02-18T18:00:00Z",
  "capabilities": {
    "CAP-001": {
      "id": "CAP-001",
      "title": "User & Workspace Governance",
      "category": "governance",
      "tag": "CAP-001",
      "status": "stable",
      "taxonomyNode": "prima.control_tower.backend"
    },
    "CAP-002": {
      "id": "CAP-002",
      "title": "LLM Model Registry",
      "category": "governance",
      "tag": "CAP-002",
      "status": "stable",
      "taxonomyNode": "prima.control_tower.backend"
    },
    "CAP-003": {
      "id": "CAP-003",
      "title": "Guardrail Policy Management",
      "category": "governance",
      "tag": "CAP-003",
      "status": "stable",
      "taxonomyNode": "prima.control_tower.backend"
    },
    "CAP-004": {
      "id": "CAP-004",
      "title": "Tool Provider Management",
      "category": "governance",
      "tag": "CAP-004",
      "status": "stable",
      "taxonomyNode": "prima.control_tower.backend"
    },
    "CAP-005": {
      "id": "CAP-005",
      "title": "Usage Analytics Ingestion",
      "category": "observability",
      "tag": "CAP-005",
      "status": "stable",
      "taxonomyNode": "prima.control_tower.backend"
    },
    "CAP-006": {
      "id": "CAP-006",
      "title": "Admin Dashboard",
      "category": "ui",
      "tag": "CAP-006",
      "status": "stable",
      "taxonomyNode": "prima.control_tower.frontend"
    },
    "CAP-007": {
      "id": "CAP-007",
      "title": "Self-Service Portal",
      "category": "ui",
      "tag": "CAP-007",
      "status": "stable",
      "taxonomyNode": "prima.control_tower.frontend"
    },
    "CAP-008": {
      "id": "CAP-008",
      "title": "AI Chat Orchestration",
      "category": "ai",
      "tag": "CAP-008",
      "status": "stable",
      "taxonomyNode": "prima.engine.aiox"
    },
    "CAP-009": {
      "id": "CAP-009",
      "title": "MCP Tool Gateway",
      "category": "ai",
      "tag": "CAP-009",
      "status": "stable",
      "taxonomyNode": "prima.engine.aiox"
    },
    "CAP-010": {
      "id": "CAP-010",
      "title": "RAG Context Injection",
      "category": "ai",
      "tag": "CAP-010",
      "status": "stable",
      "taxonomyNode": "prima.engine.aiox"
    },
    "CAP-011": {
      "id": "CAP-011",
      "title": "LLM Provider Routing",
      "category": "ai",
      "tag": "CAP-011",
      "status": "stable",
      "taxonomyNode": "prima.engine.litellm"
    },
    "CAP-012": {
      "id": "CAP-012",
      "title": "PII Detection & Anonymization",
      "category": "safety",
      "tag": "CAP-012",
      "status": "stable",
      "taxonomyNode": "prima.engine.presidio"
    },
    "CAP-013": {
      "id": "CAP-013",
      "title": "Async Task Execution",
      "category": "engine",
      "tag": "CAP-013",
      "status": "stable",
      "taxonomyNode": "prima.engine.worker"
    },
    "CAP-014": {
      "id": "CAP-014",
      "title": "Web API Server",
      "category": "backend",
      "tag": "CAP-014",
      "status": "stable",
      "taxonomyNode": "prima.web.server"
    },
    "CAP-015": {
      "id": "CAP-015",
      "title": "Agent Flow Engine",
      "category": "ai",
      "tag": "CAP-015",
      "status": "stable",
      "taxonomyNode": "prima.web.server"
    },
    "CAP-016": {
      "id": "CAP-016",
      "title": "Embeddable Chat Widgets",
      "category": "collaboration",
      "tag": "CAP-016",
      "status": "stable",
      "taxonomyNode": "prima.web.server"
    },
    "CAP-017": {
      "id": "CAP-017",
      "title": "Workspace Chat UI",
      "category": "collaboration",
      "tag": "CAP-017",
      "status": "stable",
      "taxonomyNode": "prima.web.web-frontend"
    },
    "CAP-018": {
      "id": "CAP-018",
      "title": "Agent Builder UI",
      "category": "collaboration",
      "tag": "CAP-018",
      "status": "stable",
      "taxonomyNode": "prima.web.web-frontend"
    },
    "CAP-019": {
      "id": "CAP-019",
      "title": "Data Connector UI",
      "category": "collaboration",
      "tag": "CAP-019",
      "status": "stable",
      "taxonomyNode": "prima.web.web-frontend"
    },
    "CAP-020": {
      "id": "CAP-020",
      "title": "Document Ingestion Pipeline",
      "category": "knowledge",
      "tag": "CAP-020",
      "status": "stable",
      "taxonomyNode": "prima.web.collector"
    },
    "CAP-021": {
      "id": "CAP-021",
      "title": "Data Connector Extensions",
      "category": "knowledge",
      "tag": "CAP-021",
      "status": "stable",
      "taxonomyNode": "prima.web.collector"
    },
    "CAP-022": {
      "id": "CAP-022",
      "title": "Document & Vector Storage",
      "category": "knowledge",
      "tag": "CAP-022",
      "status": "stable",
      "taxonomyNode": "prima.web.storage"
    },
    "CAP-023": {
      "id": "CAP-023",
      "title": "Platform Documentation",
      "category": "docs",
      "tag": "CAP-023",
      "status": "stable",
      "taxonomyNode": "prima.atlas.docsite"
    },
    "CAP-024": {
      "id": "CAP-024",
      "title": "CI/CD Bootstrap",
      "category": "cicd",
      "tag": "CAP-024",
      "status": "stable",
      "taxonomyNode": "prima.cicd.bootstrap"
    },
    "CAP-025": {
      "id": "CAP-025",
      "title": "DNS & Certificate Management",
      "category": "infrastructure",
      "tag": "CAP-025",
      "status": "stable",
      "taxonomyNode": "prima.foundation.dns"
    },
    "CAP-026": {
      "id": "CAP-026",
      "title": "API Gateway Routing",
      "category": "infrastructure",
      "tag": "CAP-026",
      "status": "stable",
      "taxonomyNode": "prima.foundation.kong"
    },
    "CAP-027": {
      "id": "CAP-027",
      "title": "Shared Database Service",
      "category": "infrastructure",
      "tag": "CAP-027",
      "status": "stable",
      "taxonomyNode": "prima.foundation.postgres"
    },
    "CAP-028": {
      "id": "CAP-028",
      "title": "Cache & Message Broker",
      "category": "infrastructure",
      "tag": "CAP-028",
      "status": "stable",
      "taxonomyNode": "prima.foundation.redis"
    },
    "CAP-029": {
      "id": "CAP-029",
      "title": "Service Mesh Networking",
      "category": "infrastructure",
      "tag": "CAP-029",
      "status": "stable",
      "taxonomyNode": "prima.foundation.istio"
    },
    "CAP-030": {
      "id": "CAP-030",
      "title": "Agent Skill Distribution",
      "category": "delivery",
      "tag": "CAP-030",
      "status": "stable",
      "taxonomyNode": "prima-delivery-hub"
    }
  },
  "personas": {
    "PER-001": {
      "id": "PER-001",
      "name": "Platform Admin",
      "type": "human",
      "archetype": "IT administrator responsible for managing users, teams, workspaces, LLM models, guardrail policies, tool providers, and monitoring platform usage via Control Tower",
      "typicalCapabilities": ["CAP-001", "CAP-002", "CAP-003", "CAP-005", "CAP-006"],
      "tag": "PER-001"
    },
    "PER-002": {
      "id": "PER-002",
      "name": "Knowledge Worker",
      "type": "human",
      "archetype": "Government analyst or enterprise user who chats with AI assistants, uploads documents for RAG, uses agent workflows, and imports data from connectors",
      "typicalCapabilities": ["CAP-017", "CAP-018", "CAP-019", "CAP-020"],
      "tag": "PER-002"
    },
    "PER-003": {
      "id": "PER-003",
      "name": "Workspace Manager",
      "type": "human",
      "archetype": "Team lead who configures workspace settings, manages knowledge bases, curates agent skills, configures MCP tool providers, and controls team member access",
      "typicalCapabilities": ["CAP-007", "CAP-017", "CAP-020", "CAP-004"],
      "tag": "PER-003"
    },
    "PER-004": {
      "id": "PER-004",
      "name": "AiOx Service",
      "type": "system",
      "archetype": "The AI orchestration engine service principal that authenticates to Control Tower to resolve model credentials, invoke MCP tools, inject RAG context, and report usage telemetry",
      "typicalCapabilities": ["CAP-008", "CAP-009", "CAP-010", "CAP-012"],
      "tag": "PER-004"
    },
    "PER-005": {
      "id": "PER-005",
      "name": "Developer",
      "type": "human",
      "archetype": "Software developer who uses Prima Code CLI, installs agent skills from Delivery Hub, builds and publishes agent flows, and integrates via OpenAI-compatible API",
      "typicalCapabilities": ["CAP-030", "CAP-014", "CAP-018"],
      "tag": "PER-005"
    }
  },
  "userStories": {
    "US-001": {
      "id": "US-001",
      "title": "Register a new LLM provider model with guardrails and assign to workspace",
      "persona": "PER-001",
      "capabilities": ["CAP-002", "CAP-003", "CAP-006", "CAP-011"],
      "status": "complete"
    },
    "US-002": {
      "id": "US-002",
      "title": "Chat with AI about uploaded documents using RAG context",
      "persona": "PER-002",
      "capabilities": ["CAP-017", "CAP-010", "CAP-008", "CAP-020"],
      "status": "complete"
    },
    "US-003": {
      "id": "US-003",
      "title": "Review usage analytics to identify high-cost workspaces and set budgets",
      "persona": "PER-001",
      "capabilities": ["CAP-005", "CAP-006"],
      "status": "complete"
    },
    "US-004": {
      "id": "US-004",
      "title": "Upload knowledge base documents and configure workspace RAG settings",
      "persona": "PER-003",
      "capabilities": ["CAP-020", "CAP-022", "CAP-017"],
      "status": "complete"
    },
    "US-005": {
      "id": "US-005",
      "title": "Build a visual agent flow chaining LLM calls with API calls",
      "persona": "PER-002",
      "capabilities": ["CAP-018", "CAP-015", "CAP-008"],
      "status": "implementing"
    },
    "US-006": {
      "id": "US-006",
      "title": "Install agent skills from Delivery Hub into workspace",
      "persona": "PER-005",
      "capabilities": ["CAP-030", "CAP-017"],
      "status": "implementing"
    },
    "US-007": {
      "id": "US-007",
      "title": "Configure workspace MCP tool providers for team use",
      "persona": "PER-003",
      "capabilities": ["CAP-004", "CAP-009", "CAP-007"],
      "status": "complete"
    },
    "US-008": {
      "id": "US-008",
      "title": "Embed a chat widget on an external website for customer support",
      "persona": "PER-003",
      "capabilities": ["CAP-016", "CAP-014"],
      "status": "complete"
    },
    "US-009": {
      "id": "US-009",
      "title": "Ingest a GitHub repository as a workspace knowledge base",
      "persona": "PER-002",
      "capabilities": ["CAP-021", "CAP-020", "CAP-022"],
      "status": "complete"
    },
    "US-010": {
      "id": "US-010",
      "title": "Monitor LLM provider costs and configure fallback routing",
      "persona": "PER-001",
      "capabilities": ["CAP-011", "CAP-005", "CAP-006"],
      "status": "complete"
    },
    "US-011": {
      "id": "US-011",
      "title": "Provision users via SCIM from Azure AD identity provider",
      "persona": "PER-001",
      "capabilities": ["CAP-001", "CAP-006"],
      "status": "complete"
    },
    "US-012": {
      "id": "US-012",
      "title": "Use slash commands and prompt presets in workspace chat",
      "persona": "PER-002",
      "capabilities": ["CAP-017", "CAP-014"],
      "status": "complete"
    },
    "US-013": {
      "id": "US-013",
      "title": "Build and publish a reusable agent skill to Delivery Hub",
      "persona": "PER-005",
      "capabilities": ["CAP-030", "CAP-018", "CAP-015"],
      "status": "implementing"
    },
    "US-014": {
      "id": "US-014",
      "title": "Detect and redact PII in LLM responses via guardrail enforcement",
      "persona": "PER-004",
      "capabilities": ["CAP-012", "CAP-008", "CAP-003"],
      "status": "complete"
    },
    "US-015": {
      "id": "US-015",
      "title": "Configure TTS/STT for accessibility in workspace chat",
      "persona": "PER-003",
      "capabilities": ["CAP-017", "CAP-014"],
      "status": "implementing"
    },
    "US-016": {
      "id": "US-016",
      "title": "Use the OpenAI-compatible API to integrate Prima with external tools",
      "persona": "PER-005",
      "capabilities": ["CAP-014", "CAP-008"],
      "status": "complete"
    },
    "US-017": {
      "id": "US-017",
      "title": "Import Confluence documentation as workspace knowledge base",
      "persona": "PER-002",
      "capabilities": ["CAP-021", "CAP-019", "CAP-022"],
      "status": "complete"
    },
    "US-018": {
      "id": "US-018",
      "title": "Review and manage guardrail violations across all workspaces",
      "persona": "PER-001",
      "capabilities": ["CAP-003", "CAP-012", "CAP-005", "CAP-006"],
      "status": "complete"
    }
  },
  "roadItems": {
    "ROAD-001": {
      "id": "ROAD-001",
      "title": "MCP tool integration across all client apps",
      "status": "in-progress",
      "phase": 1,
      "priority": "critical"
    },
    "ROAD-002": {
      "id": "ROAD-002",
      "title": "FedRAMP control plane / data plane separation",
      "status": "in-progress",
      "phase": 2,
      "priority": "critical"
    },
    "ROAD-003": {
      "id": "ROAD-003",
      "title": "Community hub for agent skill sharing",
      "status": "planned",
      "phase": 3,
      "priority": "medium"
    }
  },
  "stats": {
    "totalCapabilities": 30,
    "totalPersonas": 5,
    "totalStories": 18,
    "totalRoadItems": 3,
    "integrityStatus": "valid",
    "roadsByStatus": {
      "in-progress": 2,
      "planned": 1
    }
  },
  "byCapability": {
    "CAP-001": { "stories": ["US-011"], "roads": [] },
    "CAP-002": { "stories": ["US-001"], "roads": [] },
    "CAP-003": { "stories": ["US-001", "US-014", "US-018"], "roads": ["ROAD-002"] },
    "CAP-004": { "stories": ["US-007"], "roads": ["ROAD-001"] },
    "CAP-005": { "stories": ["US-003", "US-010", "US-018"], "roads": [] },
    "CAP-006": { "stories": ["US-001", "US-003", "US-010", "US-011", "US-018"], "roads": [] },
    "CAP-007": { "stories": ["US-007"], "roads": [] },
    "CAP-008": { "stories": ["US-002", "US-005", "US-014", "US-016"], "roads": ["ROAD-001"] },
    "CAP-009": { "stories": ["US-007"], "roads": ["ROAD-001"] },
    "CAP-010": { "stories": ["US-002"], "roads": [] },
    "CAP-011": { "stories": ["US-001", "US-010"], "roads": [] },
    "CAP-012": { "stories": ["US-014", "US-018"], "roads": ["ROAD-002"] },
    "CAP-013": { "stories": [], "roads": [] },
    "CAP-014": { "stories": ["US-008", "US-012", "US-015", "US-016"], "roads": [] },
    "CAP-015": { "stories": ["US-005", "US-013"], "roads": [] },
    "CAP-016": { "stories": ["US-008"], "roads": [] },
    "CAP-017": { "stories": ["US-002", "US-004", "US-006", "US-012", "US-015"], "roads": [] },
    "CAP-018": { "stories": ["US-005", "US-013"], "roads": [] },
    "CAP-019": { "stories": ["US-017"], "roads": [] },
    "CAP-020": { "stories": ["US-002", "US-004", "US-009"], "roads": [] },
    "CAP-021": { "stories": ["US-009", "US-017"], "roads": [] },
    "CAP-022": { "stories": ["US-004", "US-009", "US-017"], "roads": [] },
    "CAP-023": { "stories": [], "roads": [] },
    "CAP-024": { "stories": [], "roads": [] },
    "CAP-025": { "stories": [], "roads": [] },
    "CAP-026": { "stories": [], "roads": [] },
    "CAP-027": { "stories": [], "roads": [] },
    "CAP-028": { "stories": [], "roads": [] },
    "CAP-029": { "stories": [], "roads": [] },
    "CAP-030": { "stories": ["US-006", "US-013"], "roads": ["ROAD-003"] }
  },
  "byPersona": {
    "PER-001": { "stories": ["US-001", "US-003", "US-010", "US-011", "US-018"], "capabilities": ["CAP-001", "CAP-002", "CAP-003", "CAP-005", "CAP-006"] },
    "PER-002": { "stories": ["US-002", "US-005", "US-009", "US-012", "US-017"], "capabilities": ["CAP-017", "CAP-018", "CAP-019", "CAP-020"] },
    "PER-003": { "stories": ["US-004", "US-007", "US-008", "US-015"], "capabilities": ["CAP-007", "CAP-017", "CAP-020", "CAP-004"] },
    "PER-004": { "stories": ["US-014"], "capabilities": ["CAP-008", "CAP-009", "CAP-010", "CAP-012"] },
    "PER-005": { "stories": ["US-006", "US-013", "US-016"], "capabilities": ["CAP-030", "CAP-014", "CAP-018"] }
  }
}' > /dev/null
echo "  Governance snapshot ingested (30 capabilities, 5 personas, 18 user stories, 3 road items)"

echo ""

# =============================================================================
# SUMMARY
# =============================================================================
echo "═══════════════════════════════════════════════════════════════"
echo "  SEED COMPLETE (Official Taxonomy)"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  Domain Model ID: $MODEL_ID"
echo ""
echo "  Created:"
echo "    - 10 bounded contexts (8 internal, 1 external-system)"
echo "    - 14 domain events with cap-to-cap cross-stack mappings"
echo "    -  2 workflows spanning 5-7 contexts each"
echo "    -  5 aggregates with commands and invariants"
echo "    -  9 glossary terms"
echo "    -  1 governance snapshot (30 capabilities, 5 personas, 18 user stories)"
echo ""
echo "  Official Taxonomy (from kata CLI, foundry excluded):"
echo "    prima [system]"
echo "    ├── atlas         → docsite"
echo "    ├── cicd          → bootstrap"
echo "    ├── control_tower → backend, frontend"
echo "    ├── engine        → aiox, litellm, presidio, worker"
echo "    ├── foundation    → dns, istio, kong, postgres, redis"
echo "    └── web           → collector, web-frontend, server, storage"
echo "    prima-delivery-hub [external system]"
echo ""
echo "  Capabilities per stack:"
echo "    control_tower.backend  (5): CAP-001..005"
echo "    control_tower.frontend (2): CAP-006..007"
echo "    engine.aiox            (3): CAP-008..010"
echo "    engine.litellm         (1): CAP-011"
echo "    engine.presidio        (1): CAP-012"
echo "    engine.worker          (1): CAP-013"
echo "    web.server             (3): CAP-014..016"
echo "    web.web-frontend       (3): CAP-017..019"
echo "    web.collector          (2): CAP-020..021"
echo "    web.storage            (1): CAP-022"
echo "    atlas.docsite          (1): CAP-023"
echo "    cicd.bootstrap         (1): CAP-024"
echo "    foundation.*           (5): CAP-025..029"
echo "    prima-delivery-hub     (1): CAP-030"
echo ""
echo "  View the landscape at:"
echo "    http://localhost:8090/design/business-domain/landscape"
echo ""
