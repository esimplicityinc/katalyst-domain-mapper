#!/usr/bin/env bash
# =============================================================================
# Durham Water Management — Demo Seed Script
# =============================================================================
# Seeds a complete Business Landscape demo based on Durham NC's
# Department of Water Management.
#
# Usage:
#   ./scripts/seed-durham-water.sh [API_BASE_URL]
#
# Default API_BASE_URL: http://localhost:3001/api/v1
# =============================================================================

set -euo pipefail

API="${1:-http://localhost:3001/api/v1}"
echo "=== Durham Water Management — Seed Script ==="
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
  "name": "Durham Water Management",
  "description": "City of Durham NC Department of Water Management — manages water supply, treatment, distribution, sewer collection, billing, and regulatory compliance for 95,000+ connections across 1,400 miles of water lines."
}')
MODEL_ID=$(extract_id "$MODEL_RESP")
echo "  Domain Model: $MODEL_ID"
echo ""

# =============================================================================
# 1b. INGEST TAXONOMY SNAPSHOT (Systems / Subsystems / Stacks)
# =============================================================================
echo "─── Ingesting Taxonomy Snapshot ───"

post "$API/taxonomy" '{
  "project": "durham-water-management",
  "version": "1.0.0",
  "generated": "2026-02-18T12:00:00Z",
  "documents": [
    {
      "taxonomyNodeType": "system",
      "metadata": { "name": "durham-water", "labels": { "sector": "municipal", "state": "nc" } },
      "spec": {
        "description": "City of Durham Department of Water Management — water supply, treatment, distribution, sewer collection, billing, and regulatory compliance",
        "parents": { "node": null },
        "owners": ["water-management-dept"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "treatment-division", "labels": { "division": "water-supply" } },
      "spec": {
        "description": "Brown and Williams water treatment plants (64 MGD combined capacity)",
        "parents": { "node": "durham-water" },
        "owners": ["water-supply-treatment-division"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "distribution-maintenance", "labels": { "division": "distribution" } },
      "spec": {
        "description": "1,400 miles of water lines, meter reading, storage tanks",
        "parents": { "node": "durham-water" },
        "owners": ["distribution-system-maintenance"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["treatment-division"] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "billing-services", "labels": { "division": "billing" } },
      "spec": {
        "description": "95,000+ customer accounts, tiered water rates, payment processing",
        "parents": { "node": "durham-water" },
        "owners": ["customer-billing-services"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["distribution-maintenance"] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "sewer-collection-maint", "labels": { "division": "sewer" } },
      "spec": {
        "description": "Sanitary sewer lines, 47 lift stations, SSO detection and response",
        "parents": { "node": "durham-water" },
        "owners": ["sewer-collection-maintenance"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "compliance-lab", "labels": { "division": "compliance" } },
      "spec": {
        "description": "Water quality lab, lead/copper testing, PFAS monitoring, EPA/NC DEQ reporting",
        "parents": { "node": "durham-water" },
        "owners": ["compliance-services-division"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["treatment-division", "distribution-maintenance"] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "capital-engineering", "labels": { "division": "engineering" } },
      "spec": {
        "description": "Capital improvement project engineering and management",
        "parents": { "node": "durham-water" },
        "owners": ["utility-engineering-division"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "field-operations", "labels": { "division": "operations" } },
      "spec": {
        "description": "24/7/365 dispatch center, field crew coordination, emergency response",
        "parents": { "node": "durham-water" },
        "owners": ["operations-dispatch-center"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["distribution-maintenance", "sewer-collection-maint"] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "scada-system", "labels": { "technology": "scada" } },
      "spec": {
        "description": "SCADA system for treatment plant process control and monitoring",
        "parents": { "node": "treatment-division" },
        "owners": ["water-supply-treatment-division"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "amr-infrastructure", "labels": { "technology": "amr" } },
      "spec": {
        "description": "Automated Meter Reading drive-by collection infrastructure",
        "parents": { "node": "distribution-maintenance" },
        "owners": ["distribution-system-maintenance"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "customer-portal-stack", "labels": { "technology": "civicplus" } },
      "spec": {
        "description": "CivicPlus self-service web portal for bill pay and service requests",
        "parents": { "node": "billing-services" },
        "owners": ["technology-solutions"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["infosend-gateway"] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "billing-engine", "labels": { "technology": "erp" } },
      "spec": {
        "description": "Core billing calculation engine — tiered rates, adjustments, account management",
        "parents": { "node": "billing-services" },
        "owners": ["customer-billing-services"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["infosend-gateway"] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "dispatch-system", "labels": { "technology": "cad" } },
      "spec": {
        "description": "Computer-aided dispatch system for 24/7 field crew coordination",
        "parents": { "node": "field-operations" },
        "owners": ["operations-dispatch-center"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "lims-system", "labels": { "technology": "lims" } },
      "spec": {
        "description": "Laboratory Information Management System for water quality sample tracking and analysis",
        "parents": { "node": "compliance-lab" },
        "owners": ["compliance-services-division"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "project-mgmt-system", "labels": { "technology": "pms" } },
      "spec": {
        "description": "Capital project management and tracking system for infrastructure improvements",
        "parents": { "node": "capital-engineering" },
        "owners": ["utility-engineering-division"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "lift-station-scada", "labels": { "technology": "scada" } },
      "spec": {
        "description": "SCADA monitoring for 47 lift stations — overflow detection, pump status, and alarm management",
        "parents": { "node": "sewer-collection-maint" },
        "owners": ["sewer-collection-maintenance"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "system",
      "metadata": { "name": "epa-portal", "labels": { "sector": "federal", "external": "true" } },
      "spec": {
        "description": "EPA electronic reporting system for regulatory compliance submissions (SDWA, CWA, LCRR, PFAS)",
        "parents": { "node": null },
        "owners": ["epa-external"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "system",
      "metadata": { "name": "infosend-gateway", "labels": { "sector": "vendor", "external": "true" } },
      "spec": {
        "description": "InfoSend payment processing gateway — online bill pay, AutoPay, ACH, credit card (replaced Paymentus Nov 2025)",
        "parents": { "node": null },
        "owners": ["infosend-vendor"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    }
  ],
  "environments": [
    {
      "name": "prod",
      "description": "Production environment",
      "spec": {
        "parents": { "environment": null },
        "promotionTargets": [],
        "templateReplacements": { "domain": "water.durhamnc.gov" }
      }
    }
  ],
  "capabilities": [
    {
      "name": "water-operations",
      "description": "Top-level capability grouping all Durham Water Management operational capabilities across field, compliance, customer, and infrastructure domains",
      "categories": ["operations"],
      "dependsOnCapabilities": [],
      "parentCapability": null,
      "tag": null
    },
    {
      "name": "field-operations-cap",
      "description": "Capabilities supporting 24/7/365 field crew operations including emergency dispatch and sewer overflow response",
      "categories": ["operations", "emergency"],
      "dependsOnCapabilities": [],
      "parentCapability": "water-operations",
      "tag": null
    },
    {
      "name": "compliance-services-cap",
      "description": "Capabilities supporting regulatory compliance including water quality monitoring and EPA/NC DEQ reporting",
      "categories": ["compliance"],
      "dependsOnCapabilities": [],
      "parentCapability": "water-operations",
      "tag": null
    },
    {
      "name": "customer-services-cap",
      "description": "Capabilities enabling customer interactions including billing, self-service, and account management",
      "categories": ["customer-service", "billing"],
      "dependsOnCapabilities": [],
      "parentCapability": "water-operations",
      "tag": null
    },
    {
      "name": "infrastructure-management-cap",
      "description": "Capabilities supporting physical infrastructure including AMR meter reading and capital project management",
      "categories": ["infrastructure", "engineering"],
      "dependsOnCapabilities": [],
      "parentCapability": "water-operations",
      "tag": null
    },
    {
      "name": "water-quality-monitoring",
      "description": "Real-time and periodic water quality parameter monitoring",
      "categories": ["compliance", "operations"],
      "dependsOnCapabilities": [],
      "parentCapability": "compliance-services-cap",
      "tag": "CAP-005"
    },
    {
      "name": "automated-meter-reading",
      "description": "Drive-by AMR data collection from customer meters",
      "categories": ["infrastructure", "billing"],
      "dependsOnCapabilities": [],
      "parentCapability": "infrastructure-management-cap",
      "tag": "CAP-006"
    },
    {
      "name": "bill-generation",
      "description": "Calculate tiered water/sewer bills from meter readings",
      "categories": ["billing"],
      "dependsOnCapabilities": ["automated-meter-reading"],
      "parentCapability": "customer-services-cap",
      "tag": "CAP-001"
    },
    {
      "name": "sso-detection",
      "description": "Detect and report sanitary sewer overflows",
      "categories": ["compliance", "emergency"],
      "dependsOnCapabilities": [],
      "parentCapability": "field-operations-cap",
      "tag": "CAP-011"
    },
    {
      "name": "emergency-dispatch",
      "description": "24/7/365 field crew dispatching for emergencies",
      "categories": ["operations", "emergency"],
      "dependsOnCapabilities": [],
      "parentCapability": "field-operations-cap",
      "tag": "CAP-004"
    },
    {
      "name": "online-self-service",
      "description": "Customer portal for bill pay, service requests, and account management",
      "categories": ["customer-service"],
      "dependsOnCapabilities": [],
      "parentCapability": "customer-services-cap",
      "tag": "CAP-002"
    },
    {
      "name": "regulatory-reporting",
      "description": "EPA/NC DEQ compliance report generation and submission",
      "categories": ["compliance"],
      "dependsOnCapabilities": ["water-quality-monitoring"],
      "parentCapability": "compliance-services-cap",
      "tag": "CAP-007"
    },
    {
      "name": "capital-project-mgmt",
      "description": "Infrastructure improvement project tracking and engineering",
      "categories": ["engineering"],
      "dependsOnCapabilities": [],
      "parentCapability": "infrastructure-management-cap",
      "tag": "CAP-008"
    }
  ],
  "capabilityRels": [
    { "name": "compliance-supports-wq-monitoring", "node": "compliance-lab", "relationshipType": "supports", "capabilities": ["water-quality-monitoring", "regulatory-reporting"] },
    { "name": "distribution-implements-amr", "node": "distribution-maintenance", "relationshipType": "implements", "capabilities": ["automated-meter-reading"] },
    { "name": "billing-implements-bill-gen", "node": "billing-services", "relationshipType": "implements", "capabilities": ["bill-generation"] },
    { "name": "sewer-supports-sso-detection", "node": "sewer-collection-maint", "relationshipType": "supports", "capabilities": ["sso-detection"] },
    { "name": "treatment-enables-wq-monitoring", "node": "treatment-division", "relationshipType": "enables", "capabilities": ["water-quality-monitoring"] },
    { "name": "field-ops-implements-dispatch", "node": "field-operations", "relationshipType": "implements", "capabilities": ["emergency-dispatch"] },
    { "name": "portal-implements-self-service", "node": "customer-portal-stack", "relationshipType": "implements", "capabilities": ["online-self-service"] },
    { "name": "capital-implements-project-mgmt", "node": "capital-engineering", "relationshipType": "implements", "capabilities": ["capital-project-mgmt"] }
  ],
  "actions": [],
  "stages": [],
  "tools": []
}' > /dev/null
echo "  Taxonomy snapshot ingested (3 systems, 7 subsystems, 7 stacks, 13 capabilities [3-level hierarchy], 8 capabilityRels)"
echo ""

# =============================================================================
# 2. CREATE BOUNDED CONTEXTS (10 total)
# =============================================================================
echo "─── Creating Bounded Contexts ───"

# --- Core Domain ---

CTX_BILLING_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "customer-billing",
  "title": "Customer Billing Services",
  "description": "Account management, billing cycles, tiered water rates, payment processing, disconnection/reconnection, and financial assistance programs (CAFFE).",
  "responsibility": "Manages 95,000+ customer accounts, generates monthly bills based on meter readings, processes payments, enforces collections policy, and handles adjustment requests.",
  "teamOwnership": "Customer Billing Services Division",
  "status": "active",
  "subdomainType": "core",
  "contextType": "internal",
  "taxonomyNode": "durham-water.billing-services"
}')
CTX_BILLING=$(extract_id "$CTX_BILLING_RESP")
echo "  customer-billing: $CTX_BILLING"

CTX_TREATMENT_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "water-treatment",
  "title": "Water Supply & Treatment",
  "description": "Operates Brown and Williams water treatment plants (combined 64 MGD capacity). Manages Lake Michie and Little River reservoirs, coagulation/flocculation/sedimentation processes, filtration, and chemical addition.",
  "responsibility": "Treat raw water from reservoirs to meet EPA drinking water standards. Manage chemical dosing (chloramines, orthophosphate, sodium hydroxide, fluoride). Monitor and adjust treatment processes daily.",
  "teamOwnership": "Water Supply & Treatment Division",
  "status": "active",
  "subdomainType": "core",
  "contextType": "internal",
  "taxonomyNode": "durham-water.treatment-division"
}')
CTX_TREATMENT=$(extract_id "$CTX_TREATMENT_RESP")
echo "  water-treatment: $CTX_TREATMENT"

CTX_DISTRIBUTION_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "distribution-maintenance",
  "title": "Water Distribution Maintenance",
  "description": "Maintains 1,400 miles of water lines, manages water main break repairs, conducts planned flushing programs, oversees Automated Meter Reading (AMR) infrastructure, and manages water storage tanks/towers.",
  "responsibility": "Ensure continuous water delivery through the distribution system. Respond to water main breaks, manage meter reading operations, conduct preventive flushing, and maintain pressure across all zones.",
  "teamOwnership": "Water Distribution System Maintenance",
  "status": "active",
  "subdomainType": "core",
  "contextType": "internal",
  "taxonomyNode": "durham-water.distribution-maintenance"
}')
CTX_DISTRIBUTION=$(extract_id "$CTX_DISTRIBUTION_RESP")
echo "  distribution-maintenance: $CTX_DISTRIBUTION"

CTX_DISPATCH_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "field-dispatch",
  "title": "Field Crew Dispatch",
  "description": "Coordinates emergency and scheduled field crew dispatching for water main breaks, sewer overflows, meter issues, and service disconnections/reconnections. Operates 24/7/365.",
  "responsibility": "Receive service requests and emergency reports, prioritize and assign field crews, track work order status, coordinate with distribution and sewer maintenance teams.",
  "teamOwnership": "Operations Dispatch Center",
  "status": "active",
  "subdomainType": "core",
  "contextType": "human-process",
  "taxonomyNode": "durham-water.field-operations"
}')
CTX_DISPATCH=$(extract_id "$CTX_DISPATCH_RESP")
echo "  field-dispatch: $CTX_DISPATCH"

# --- Supporting Domain ---

CTX_SEWER_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "sewer-collection",
  "title": "Sewer Collection System",
  "description": "Maintains sanitary sewer lines, 47 lift stations, manages sewer overflow detection and response, and conducts sewer system evaluation surveys (SSES).",
  "responsibility": "Prevent sanitary sewer overflows (SSOs), maintain lift stations, conduct inspections and cleaning, respond to sewer emergencies, and manage FOG (fats/oils/grease) prevention.",
  "teamOwnership": "Sewer Collection System Maintenance",
  "status": "active",
  "subdomainType": "supporting",
  "contextType": "internal",
  "taxonomyNode": "durham-water.sewer-collection-maint"
}')
CTX_SEWER=$(extract_id "$CTX_SEWER_RESP")
echo "  sewer-collection: $CTX_SEWER"

CTX_COMPLIANCE_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "compliance-testing",
  "title": "Compliance & Laboratory Services",
  "description": "Operates water quality laboratory, conducts lead/copper testing (required every 3 years), monitors PFAS contaminants, manages industrial waste control program, and ensures EPA/NC DEQ regulatory compliance.",
  "responsibility": "Collect and analyze water quality samples across the distribution system, generate compliance reports, flag threshold exceedances, manage laboratory operations, and conduct industrial pretreatment inspections.",
  "teamOwnership": "Compliance Services Division",
  "status": "active",
  "subdomainType": "supporting",
  "contextType": "internal",
  "taxonomyNode": "durham-water.compliance-lab"
}')
CTX_COMPLIANCE=$(extract_id "$CTX_COMPLIANCE_RESP")
echo "  compliance-testing: $CTX_COMPLIANCE"

CTX_CAPITAL_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "capital-projects",
  "title": "Capital Improvement Engineering",
  "description": "Plans and manages capital improvement projects: waterline replacements (American Tobacco District, East Durham, NC-54), sewer improvements (Forest Hills, Southeast Farrington), lift station consolidation, and dam safety improvements.",
  "responsibility": "Engineer and oversee infrastructure improvement projects, manage contractor relationships, conduct project scoping and budgeting, ensure capital facilities fee collection, and coordinate with distribution/sewer teams on project handoffs.",
  "teamOwnership": "Utility Engineering Division",
  "status": "active",
  "subdomainType": "supporting",
  "contextType": "internal",
  "taxonomyNode": "durham-water.capital-engineering"
}')
CTX_CAPITAL=$(extract_id "$CTX_CAPITAL_RESP")
echo "  capital-projects: $CTX_CAPITAL"

# --- Generic Domain ---

CTX_PORTAL_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "customer-portal",
  "title": "Online Customer Portal",
  "description": "Self-service web portal (CivicPlus + InfoSend) enabling customers to pay bills, start/stop service, report problems, view water quality reports, and manage account settings.",
  "responsibility": "Provide 24/7 self-service access for customers. Route service requests to appropriate internal systems. Display billing history and usage data. Integrate with InfoSend payment gateway.",
  "teamOwnership": "Technology Solutions / Water Management",
  "status": "active",
  "subdomainType": "generic",
  "contextType": "internal",
  "taxonomyNode": "durham-water.billing-services.customer-portal-stack"
}')
CTX_PORTAL=$(extract_id "$CTX_PORTAL_RESP")
echo "  customer-portal: $CTX_PORTAL"

CTX_EPA_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "epa-reporting",
  "title": "EPA Regulatory Reporting",
  "description": "External system for submitting federal regulatory compliance reports — lead/copper rule (LCRR), PFAS drinking water standards, WaterSense program, Unregulated Contaminant Monitoring Rule (UCMR5).",
  "responsibility": "Receive and process compliance submissions from Durham Water Management. Validate data against federal standards. Issue compliance determinations and enforcement actions.",
  "teamOwnership": "U.S. Environmental Protection Agency",
  "status": "active",
  "subdomainType": "generic",
  "contextType": "external-system",
  "taxonomyNode": "epa-portal"
}')
CTX_EPA=$(extract_id "$CTX_EPA_RESP")
echo "  epa-reporting: $CTX_EPA"

CTX_PAYMENT_RESP=$(post "$API/domain-models/$MODEL_ID/contexts" '{
  "slug": "payment-gateway",
  "title": "InfoSend Payment Gateway",
  "description": "Third-party payment processing system (InfoSend, replacing Paymentus as of November 2025). Handles online bill pay, AutoPay, ACH transfers, and credit card processing.",
  "responsibility": "Process customer payments via multiple channels (web, phone, ACH, credit card). Manage AutoPay enrollment. Transmit payment confirmations to Customer Billing. Store billing history.",
  "teamOwnership": "InfoSend Inc. (External Vendor)",
  "status": "active",
  "subdomainType": "generic",
  "contextType": "external-system",
  "taxonomyNode": "infosend-gateway"
}')
CTX_PAYMENT=$(extract_id "$CTX_PAYMENT_RESP")
echo "  payment-gateway: $CTX_PAYMENT"

echo ""
echo "  Total: 10 bounded contexts created"
echo ""

# =============================================================================
# 3. CREATE DOMAIN EVENTS (15 events)
# =============================================================================
echo "─── Creating Domain Events ───"

# Event 1: Meter reading recorded (distribution → billing, compliance)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_DISTRIBUTION\",
  \"slug\": \"meter-reading-recorded\",
  \"title\": \"Meter Reading Recorded\",
  \"description\": \"An automated or manual meter reading has been captured for a customer connection. Triggers billing calculation and may flag anomalies for leak detection.\",
  \"payload\": [
    {\"field\": \"meterId\", \"type\": \"string\"},
    {\"field\": \"accountNumber\", \"type\": \"string\"},
    {\"field\": \"readingValue\", \"type\": \"number\"},
    {\"field\": \"readingType\", \"type\": \"string\", \"enum\": [\"AMR\", \"manual\", \"estimated\"]},
    {\"field\": \"readingDate\", \"type\": \"string\", \"format\": \"ISO8601\"}
  ],
  \"consumedBy\": [\"customer-billing\", \"compliance-testing\"],
  \"sourceCapabilityId\": \"CAP-006\",
  \"targetCapabilityIds\": [\"CAP-001\", \"CAP-005\"],
  \"triggers\": [\"AMR transmission cycle\", \"Manual meter read route completed\"],
  \"sideEffects\": [\"Bill calculation queued\", \"Anomaly detection check initiated\"]
}" > /dev/null
echo "  meter-reading-recorded"

# Event 2: Bill generated (billing → portal, payment gateway)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_BILLING\",
  \"slug\": \"bill-generated\",
  \"title\": \"Bill Generated\",
  \"description\": \"Monthly utility bill calculated and generated based on meter reading, tiered water rates, sewer charges, and any adjustments. Ready for delivery.\",
  \"payload\": [
    {\"field\": \"billId\", \"type\": \"string\"},
    {\"field\": \"accountNumber\", \"type\": \"string\"},
    {\"field\": \"billingPeriod\", \"type\": \"object\"},
    {\"field\": \"totalAmount\", \"type\": \"number\"},
    {\"field\": \"waterUsageGallons\", \"type\": \"number\"},
    {\"field\": \"tierBreakdown\", \"type\": \"array\"},
    {\"field\": \"dueDate\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"customer-portal\", \"payment-gateway\"],
  \"sourceCapabilityId\": \"CAP-001\",
  \"targetCapabilityIds\": [\"CAP-002\", \"CAP-009\"],
  \"triggers\": [\"Meter Reading Recorded\"],
  \"sideEffects\": [\"Bill mailed to customer\", \"Available in customer portal\", \"AutoPay scheduled if enrolled\"]
}" > /dev/null
echo "  bill-generated"

# Event 3: Payment received (payment gateway → billing)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_PAYMENT\",
  \"slug\": \"payment-received\",
  \"title\": \"Payment Received\",
  \"description\": \"Customer payment processed successfully through InfoSend portal (web, phone, ACH, or credit card).\",
  \"payload\": [
    {\"field\": \"paymentId\", \"type\": \"string\"},
    {\"field\": \"accountNumber\", \"type\": \"string\"},
    {\"field\": \"amount\", \"type\": \"number\"},
    {\"field\": \"method\", \"type\": \"string\", \"enum\": [\"ACH\", \"credit_card\", \"check\", \"cash\"]},
    {\"field\": \"processedAt\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"customer-billing\"],
  \"sourceCapabilityId\": \"CAP-009\",
  \"targetCapabilityIds\": [\"CAP-001\"],
  \"triggers\": [\"Customer initiates payment\"],
  \"sideEffects\": [\"Account balance updated\", \"Payment confirmation sent\"]
}" > /dev/null
echo "  payment-received"

# Event 4: Payment overdue (billing → dispatch, portal)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_BILLING\",
  \"slug\": \"payment-overdue\",
  \"title\": \"Payment Overdue\",
  \"description\": \"Bill not paid within 21 days of billing date. 1% late charge applied. After 30 days, disconnect notice issued.\",
  \"payload\": [
    {\"field\": \"accountNumber\", \"type\": \"string\"},
    {\"field\": \"amountDue\", \"type\": \"number\"},
    {\"field\": \"daysOverdue\", \"type\": \"integer\"},
    {\"field\": \"disconnectDate\", \"type\": \"string\"},
    {\"field\": \"lateCharge\", \"type\": \"number\"}
  ],
  \"consumedBy\": [\"field-dispatch\", \"customer-portal\"],
  \"sourceCapabilityId\": \"CAP-001\",
  \"targetCapabilityIds\": [\"CAP-004\", \"CAP-003\"],
  \"triggers\": [\"21-day payment window expired\"],
  \"sideEffects\": [\"Late charge applied\", \"Disconnect notice mailed\", \"Disconnect work order created\"]
}" > /dev/null
echo "  payment-overdue"

# Event 5: Service disconnected (dispatch → billing, portal)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_DISPATCH\",
  \"slug\": \"service-disconnected\",
  \"title\": \"Service Disconnected\",
  \"description\": \"Field crew has physically disconnected water service at the meter due to non-payment. Penalty charge added.\",
  \"payload\": [
    {\"field\": \"workOrderId\", \"type\": \"string\"},
    {\"field\": \"accountNumber\", \"type\": \"string\"},
    {\"field\": \"disconnectedAt\", \"type\": \"string\"},
    {\"field\": \"crewId\", \"type\": \"string\"},
    {\"field\": \"penaltyAmount\", \"type\": \"number\"}
  ],
  \"consumedBy\": [\"customer-billing\", \"customer-portal\"],
  \"sourceCapabilityId\": \"CAP-004\",
  \"targetCapabilityIds\": [\"CAP-001\", \"CAP-002\"],
  \"triggers\": [\"Payment Overdue — disconnect date reached\"],
  \"sideEffects\": [\"Account status changed to disconnected\", \"Penalty charge applied\"]
}" > /dev/null
echo "  service-disconnected"

# Event 6: Water main break reported (portal → dispatch, distribution)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_PORTAL\",
  \"slug\": \"water-main-break-reported\",
  \"title\": \"Water Main Break Reported\",
  \"description\": \"Customer or field crew reports a water main break through the online portal, phone (919-560-4344), or Durham One Call.\",
  \"payload\": [
    {\"field\": \"reportId\", \"type\": \"string\"},
    {\"field\": \"reportedBy\", \"type\": \"string\"},
    {\"field\": \"location\", \"type\": \"object\"},
    {\"field\": \"severity\", \"type\": \"string\", \"enum\": [\"minor_leak\", \"moderate_break\", \"major_emergency\"]},
    {\"field\": \"description\", \"type\": \"string\"},
    {\"field\": \"reportedAt\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"field-dispatch\", \"distribution-maintenance\"],
  \"sourceCapabilityId\": \"CAP-003\",
  \"targetCapabilityIds\": [\"CAP-004\", \"CAP-006\"],
  \"triggers\": [\"Customer submits service request\", \"Field crew visual observation\"],
  \"sideEffects\": [\"Emergency work order created\", \"Dispatch notified\"]
}" > /dev/null
echo "  water-main-break-reported"

# Event 7: Emergency repair dispatched (dispatch → distribution, sewer)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_DISPATCH\",
  \"slug\": \"emergency-repair-dispatched\",
  \"title\": \"Emergency Repair Dispatched\",
  \"description\": \"Field crew assigned and dispatched to an emergency repair location (water main break, sewer overflow, or lift station failure).\",
  \"payload\": [
    {\"field\": \"workOrderId\", \"type\": \"string\"},
    {\"field\": \"crewId\", \"type\": \"string\"},
    {\"field\": \"emergencyType\", \"type\": \"string\"},
    {\"field\": \"location\", \"type\": \"object\"},
    {\"field\": \"dispatchedAt\", \"type\": \"string\"},
    {\"field\": \"estimatedArrival\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"distribution-maintenance\", \"sewer-collection\"],
  \"sourceCapabilityId\": \"CAP-004\",
  \"targetCapabilityIds\": [\"CAP-006\"],
  \"triggers\": [\"Water Main Break Reported\", \"Sewer Overflow Detected\"],
  \"sideEffects\": [\"Crew GPS tracking activated\", \"Affected area notified\"]
}" > /dev/null
echo "  emergency-repair-dispatched"

# Event 8: Repair completed (distribution → billing, compliance)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_DISTRIBUTION\",
  \"slug\": \"repair-completed\",
  \"title\": \"Repair Completed\",
  \"description\": \"Field crew has completed infrastructure repair. Area flushed and water quality cleared. Service restored.\",
  \"payload\": [
    {\"field\": \"workOrderId\", \"type\": \"string\"},
    {\"field\": \"repairType\", \"type\": \"string\"},
    {\"field\": \"materialsUsed\", \"type\": \"array\"},
    {\"field\": \"completedAt\", \"type\": \"string\"},
    {\"field\": \"waterLossEstimateGallons\", \"type\": \"number\"},
    {\"field\": \"flushingCompleted\", \"type\": \"boolean\"}
  ],
  \"consumedBy\": [\"customer-billing\", \"compliance-testing\"],
  \"sourceCapabilityId\": \"CAP-006\",
  \"targetCapabilityIds\": [\"CAP-001\", \"CAP-005\"],
  \"triggers\": [\"Emergency Repair Dispatched\"],
  \"sideEffects\": [\"Affected customers notified of restoration\", \"Water loss recorded for compliance\"]
}" > /dev/null
echo "  repair-completed"

# Event 9: Water quality sample collected (compliance → treatment)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_COMPLIANCE\",
  \"slug\": \"water-quality-sample-collected\",
  \"title\": \"Water Quality Sample Collected\",
  \"description\": \"Lab technician has collected a water quality sample from a distribution system location or treatment plant for analysis (lead/copper, PFAS, chloramine residual, etc.).\",
  \"payload\": [
    {\"field\": \"sampleId\", \"type\": \"string\"},
    {\"field\": \"sampleType\", \"type\": \"string\", \"enum\": [\"routine\", \"compliance\", \"complaint\", \"post_repair\"]},
    {\"field\": \"location\", \"type\": \"object\"},
    {\"field\": \"parameters\", \"type\": \"array\"},
    {\"field\": \"collectedAt\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"water-treatment\"],
  \"sourceCapabilityId\": \"CAP-005\",
  \"targetCapabilityIds\": [\"CAP-010\"],
  \"triggers\": [\"Scheduled sampling route\", \"Post-repair verification\", \"Customer complaint\"],
  \"sideEffects\": [\"Lab analysis queued\"]
}" > /dev/null
echo "  water-quality-sample-collected"

# Event 10: Contaminant threshold exceeded (compliance → EPA + UNKNOWN)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_COMPLIANCE\",
  \"slug\": \"contaminant-threshold-exceeded\",
  \"title\": \"Contaminant Threshold Exceeded\",
  \"description\": \"Water quality analysis has detected a contaminant level above EPA maximum contaminant level (MCL) or action level. Triggers mandatory reporting and public notification.\",
  \"payload\": [
    {\"field\": \"sampleId\", \"type\": \"string\"},
    {\"field\": \"contaminant\", \"type\": \"string\"},
    {\"field\": \"measuredLevel\", \"type\": \"number\"},
    {\"field\": \"threshold\", \"type\": \"number\"},
    {\"field\": \"unit\", \"type\": \"string\"},
    {\"field\": \"exceedanceRatio\", \"type\": \"number\"}
  ],
  \"consumedBy\": [\"epa-reporting\", \"emergency-notification-system\"],
  \"sourceCapabilityId\": \"CAP-005\",
  \"targetCapabilityIds\": [\"CAP-007\"],
  \"triggers\": [\"Lab analysis completed with exceedance\"],
  \"sideEffects\": [\"Public health advisory triggered\", \"Treatment process adjustment initiated\"]
}" > /dev/null
echo "  contaminant-threshold-exceeded (→ UNKNOWN: emergency-notification-system)"

# Event 11: PFAS test result published (compliance → EPA + UNKNOWN nc-deq)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_COMPLIANCE\",
  \"slug\": \"pfas-test-result-published\",
  \"title\": \"PFAS Test Result Published\",
  \"description\": \"Per- and polyfluoroalkyl substances (PFAS) test results finalized and published. Durham tests for PFOA, PFOS, and other PFAS compounds per new EPA standards (effective 2024).\",
  \"payload\": [
    {\"field\": \"testBatchId\", \"type\": \"string\"},
    {\"field\": \"pfasCompounds\", \"type\": \"array\"},
    {\"field\": \"sourceWater\", \"type\": \"string\"},
    {\"field\": \"treatmentPlant\", \"type\": \"string\"},
    {\"field\": \"publishedAt\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"epa-reporting\", \"nc-deq-system\"],
  \"sourceCapabilityId\": \"CAP-005\",
  \"targetCapabilityIds\": [\"CAP-007\"],
  \"triggers\": [\"Quarterly PFAS monitoring cycle completed\"],
  \"sideEffects\": [\"Public PFAS dashboard updated\", \"Treatment upgrade project informed\"]
}" > /dev/null
echo "  pfas-test-result-published (→ UNKNOWN: nc-deq-system)"

# Event 12: Sewer overflow detected (sewer → dispatch, EPA, UNKNOWN nc-deq)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_SEWER\",
  \"slug\": \"sewer-overflow-detected\",
  \"title\": \"Sewer Overflow Detected\",
  \"description\": \"Sanitary sewer overflow (SSO) detected — untreated wastewater has bypassed the collection system. Requires immediate response and mandatory regulatory reporting (e.g., Eno Creek Lift Station 5.8M gallon incident).\",
  \"payload\": [
    {\"field\": \"overflowId\", \"type\": \"string\"},
    {\"field\": \"location\", \"type\": \"object\"},
    {\"field\": \"estimatedVolumeGallons\", \"type\": \"number\"},
    {\"field\": \"cause\", \"type\": \"string\"},
    {\"field\": \"receivingWaterBody\", \"type\": \"string\"},
    {\"field\": \"isActive\", \"type\": \"boolean\"}
  ],
  \"consumedBy\": [\"field-dispatch\", \"epa-reporting\", \"nc-deq-system\"],
  \"sourceCapabilityId\": \"CAP-011\",
  \"targetCapabilityIds\": [\"CAP-004\", \"CAP-007\"],
  \"triggers\": [\"Lift station failure\", \"Line blockage detected\", \"Flooding event\"],
  \"sideEffects\": [\"Emergency response activated\", \"Public notification issued\", \"Environmental impact assessment initiated\"]
}" > /dev/null
echo "  sewer-overflow-detected (→ UNKNOWN: nc-deq-system)"

# Event 13: Capital project approved (capital → distribution, sewer)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_CAPITAL\",
  \"slug\": \"capital-project-approved\",
  \"title\": \"Capital Project Approved\",
  \"description\": \"A capital improvement project has been approved and funded — waterline replacement, sewer improvement, lift station upgrade, or dam safety project.\",
  \"payload\": [
    {\"field\": \"projectId\", \"type\": \"string\"},
    {\"field\": \"projectName\", \"type\": \"string\"},
    {\"field\": \"projectType\", \"type\": \"string\"},
    {\"field\": \"budget\", \"type\": \"number\"},
    {\"field\": \"affectedArea\", \"type\": \"string\"},
    {\"field\": \"estimatedStartDate\", \"type\": \"string\"},
    {\"field\": \"estimatedCompletionDate\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"distribution-maintenance\", \"sewer-collection\"],
  \"sourceCapabilityId\": \"CAP-008\",
  \"targetCapabilityIds\": [\"CAP-006\"],
  \"triggers\": [\"City Council budget approval\", \"Engineering assessment completed\"],
  \"sideEffects\": [\"Contractor procurement initiated\", \"Public meeting scheduled\", \"Affected residents notified\"]
}" > /dev/null
echo "  capital-project-approved"

# Event 14: Service line inventory updated (distribution → compliance, EPA)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_DISTRIBUTION\",
  \"slug\": \"service-line-inventory-updated\",
  \"title\": \"Service Line Inventory Updated\",
  \"description\": \"Lead and Copper Rule Revision (LCRR) service line material inventory updated. Customers earn a 30 dollar bill credit for verifying their service line material.\",
  \"payload\": [
    {\"field\": \"inventoryRecordId\", \"type\": \"string\"},
    {\"field\": \"serviceLineId\", \"type\": \"string\"},
    {\"field\": \"material\", \"type\": \"string\", \"enum\": [\"copper\", \"lead\", \"galvanized\", \"plastic\", \"unknown\"]},
    {\"field\": \"verificationMethod\", \"type\": \"string\"},
    {\"field\": \"verifiedBy\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"compliance-testing\", \"epa-reporting\"],
  \"sourceCapabilityId\": \"CAP-006\",
  \"targetCapabilityIds\": [\"CAP-005\", \"CAP-007\"],
  \"triggers\": [\"Customer self-verification submitted\", \"Field crew inspection completed\"],
  \"sideEffects\": [\"Bill credit issued if customer-verified\", \"LCRR inventory database updated\"]
}" > /dev/null
echo "  service-line-inventory-updated"

# Event 15: Customer service requested (portal → billing, dispatch)
post "$API/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_PORTAL\",
  \"slug\": \"customer-service-requested\",
  \"title\": \"Customer Service Requested\",
  \"description\": \"Customer has submitted a service request through the online portal or Durham One Call (919-560-1200) — start/stop service, billing inquiry, adjustment request, or general question.\",
  \"payload\": [
    {\"field\": \"requestId\", \"type\": \"string\"},
    {\"field\": \"requestType\", \"type\": \"string\", \"enum\": [\"start_service\", \"stop_service\", \"billing_inquiry\", \"adjustment_request\", \"leak_report\", \"quality_complaint\"]},
    {\"field\": \"accountNumber\", \"type\": \"string\"},
    {\"field\": \"description\", \"type\": \"string\"},
    {\"field\": \"submittedAt\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"customer-billing\", \"field-dispatch\"],
  \"sourceCapabilityId\": \"CAP-002\",
  \"targetCapabilityIds\": [\"CAP-001\", \"CAP-004\"],
  \"triggers\": [\"Customer submits online form\", \"Customer calls Durham One Call\"],
  \"sideEffects\": [\"Request routed to appropriate team\", \"Acknowledgment sent to customer\"]
}" > /dev/null
echo "  customer-service-requested"

echo ""
echo "  Total: 15 domain events created"
echo "  Unresolvable slugs: emergency-notification-system, nc-deq-system (will appear as inferred unknown systems)"
echo ""

# =============================================================================
# 4. CREATE WORKFLOWS (3 workflows)
# =============================================================================
echo "─── Creating Workflows ───"

# Workflow 1: Water Main Break Response
post "$API/domain-models/$MODEL_ID/workflows" "{
  \"slug\": \"water-main-break-response\",
  \"title\": \"Water Main Break Response\",
  \"description\": \"End-to-end lifecycle from citizen reporting a water main break through emergency dispatch, repair, flushing, quality verification, and customer notification.\",
  \"contextIds\": [\"$CTX_PORTAL\", \"$CTX_DISPATCH\", \"$CTX_DISTRIBUTION\", \"$CTX_COMPLIANCE\", \"$CTX_BILLING\"],
  \"states\": [
    {\"name\": \"Reported\", \"type\": \"initial\"},
    {\"name\": \"Triaged\", \"type\": \"intermediate\"},
    {\"name\": \"Crew Dispatched\", \"type\": \"intermediate\"},
    {\"name\": \"Repairing\", \"type\": \"intermediate\"},
    {\"name\": \"Flushing\", \"type\": \"intermediate\"},
    {\"name\": \"Quality Verified\", \"type\": \"intermediate\"},
    {\"name\": \"Resolved\", \"type\": \"terminal\"},
    {\"name\": \"Escalated\", \"type\": \"intermediate\", \"isError\": true}
  ],
  \"transitions\": [
    {\"from\": \"Reported\", \"to\": \"Triaged\", \"label\": \"Dispatch reviews report\"},
    {\"from\": \"Triaged\", \"to\": \"Crew Dispatched\", \"label\": \"Crew assigned\"},
    {\"from\": \"Triaged\", \"to\": \"Escalated\", \"label\": \"Major emergency declared\"},
    {\"from\": \"Crew Dispatched\", \"to\": \"Repairing\", \"label\": \"Crew arrives on site\"},
    {\"from\": \"Repairing\", \"to\": \"Flushing\", \"label\": \"Repair complete, begin flushing\"},
    {\"from\": \"Flushing\", \"to\": \"Quality Verified\", \"label\": \"Lab clears water quality\"},
    {\"from\": \"Quality Verified\", \"to\": \"Resolved\", \"label\": \"Service restored, customers notified\"},
    {\"from\": \"Escalated\", \"to\": \"Crew Dispatched\", \"label\": \"Additional resources mobilized\"}
  ]
}" > /dev/null
echo "  water-main-break-response (5 contexts)"

# Workflow 2: Monthly Billing Cycle
post "$API/domain-models/$MODEL_ID/workflows" "{
  \"slug\": \"monthly-billing-cycle\",
  \"title\": \"Monthly Billing Cycle\",
  \"description\": \"End-to-end monthly billing process from automated meter reading through bill generation, delivery, payment processing, and collections enforcement.\",
  \"contextIds\": [\"$CTX_DISTRIBUTION\", \"$CTX_BILLING\", \"$CTX_PAYMENT\", \"$CTX_PORTAL\", \"$CTX_DISPATCH\"],
  \"states\": [
    {\"name\": \"Meter Read\", \"type\": \"initial\"},
    {\"name\": \"Bill Calculated\", \"type\": \"intermediate\"},
    {\"name\": \"Bill Delivered\", \"type\": \"intermediate\"},
    {\"name\": \"Payment Pending\", \"type\": \"intermediate\"},
    {\"name\": \"Paid\", \"type\": \"terminal\"},
    {\"name\": \"Overdue\", \"type\": \"intermediate\", \"isError\": true},
    {\"name\": \"Disconnect Notice\", \"type\": \"intermediate\", \"isError\": true},
    {\"name\": \"Disconnected\", \"type\": \"terminal\", \"isError\": true}
  ],
  \"transitions\": [
    {\"from\": \"Meter Read\", \"to\": \"Bill Calculated\", \"label\": \"Apply tiered rates\"},
    {\"from\": \"Bill Calculated\", \"to\": \"Bill Delivered\", \"label\": \"Mail + portal notification\"},
    {\"from\": \"Bill Delivered\", \"to\": \"Payment Pending\", \"label\": \"Awaiting payment\"},
    {\"from\": \"Payment Pending\", \"to\": \"Paid\", \"label\": \"Payment received via InfoSend\"},
    {\"from\": \"Payment Pending\", \"to\": \"Overdue\", \"label\": \"21 days elapsed, 1% late charge\"},
    {\"from\": \"Overdue\", \"to\": \"Paid\", \"label\": \"Late payment received\"},
    {\"from\": \"Overdue\", \"to\": \"Disconnect Notice\", \"label\": \"30 days elapsed\"},
    {\"from\": \"Disconnect Notice\", \"to\": \"Paid\", \"label\": \"Payment before disconnect date\"},
    {\"from\": \"Disconnect Notice\", \"to\": \"Disconnected\", \"label\": \"Field crew disconnects service\"}
  ]
}" > /dev/null
echo "  monthly-billing-cycle (5 contexts)"

# Workflow 3: Compliance Reporting Cycle
post "$API/domain-models/$MODEL_ID/workflows" "{
  \"slug\": \"compliance-reporting-cycle\",
  \"title\": \"Compliance Reporting Cycle\",
  \"description\": \"Periodic water quality compliance cycle from sample collection through lab analysis, report generation, and submission to EPA/NC DEQ.\",
  \"contextIds\": [\"$CTX_COMPLIANCE\", \"$CTX_TREATMENT\", \"$CTX_EPA\"],
  \"states\": [
    {\"name\": \"Sample Collected\", \"type\": \"initial\"},
    {\"name\": \"Lab Analysis\", \"type\": \"intermediate\"},
    {\"name\": \"Results Reviewed\", \"type\": \"intermediate\"},
    {\"name\": \"Report Drafted\", \"type\": \"intermediate\"},
    {\"name\": \"Submitted to EPA\", \"type\": \"intermediate\"},
    {\"name\": \"Acknowledged\", \"type\": \"terminal\"},
    {\"name\": \"Exceedance Flagged\", \"type\": \"intermediate\", \"isError\": true},
    {\"name\": \"Corrective Action\", \"type\": \"intermediate\", \"isError\": true}
  ],
  \"transitions\": [
    {\"from\": \"Sample Collected\", \"to\": \"Lab Analysis\", \"label\": \"Sample arrives at lab\"},
    {\"from\": \"Lab Analysis\", \"to\": \"Results Reviewed\", \"label\": \"Analysis complete — within limits\"},
    {\"from\": \"Lab Analysis\", \"to\": \"Exceedance Flagged\", \"label\": \"Contaminant above MCL\"},
    {\"from\": \"Exceedance Flagged\", \"to\": \"Corrective Action\", \"label\": \"Treatment adjustment initiated\"},
    {\"from\": \"Corrective Action\", \"to\": \"Results Reviewed\", \"label\": \"Re-sample confirms compliance\"},
    {\"from\": \"Results Reviewed\", \"to\": \"Report Drafted\", \"label\": \"Compliance officer reviews\"},
    {\"from\": \"Report Drafted\", \"to\": \"Submitted to EPA\", \"label\": \"Electronic submission\"},
    {\"from\": \"Submitted to EPA\", \"to\": \"Acknowledged\", \"label\": \"EPA confirms receipt\"}
  ]
}" > /dev/null
echo "  compliance-reporting-cycle (3 contexts)"

echo ""
echo "  Total: 3 workflows created"
echo ""

# =============================================================================
# 5. CREATE AGGREGATES (5 aggregates)
# =============================================================================
echo "─── Creating Aggregates ───"

post "$API/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_BILLING\",
  \"slug\": \"customer-account\",
  \"title\": \"Customer Account\",
  \"rootEntity\": \"Account\",
  \"entities\": [\"Account\", \"BillingHistory\", \"PaymentRecord\"],
  \"valueObjects\": [\"AccountNumber\", \"BillingAddress\", \"TierRate\", \"BillAmount\"],
  \"events\": [\"bill-generated\", \"payment-received\", \"payment-overdue\"],
  \"commands\": [\"GenerateBill\", \"ProcessPayment\", \"ApplyAdjustment\", \"InitiateDisconnection\"],
  \"invariants\": [
    {\"rule\": \"Account must have valid 12-digit account number\", \"severity\": \"critical\"},
    {\"rule\": \"Bill amount cannot be negative\", \"severity\": \"critical\"},
    {\"rule\": \"Tiered rates applied in ascending order of usage\", \"severity\": \"high\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  customer-account (Customer Billing)"

post "$API/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_DISTRIBUTION\",
  \"slug\": \"water-meter\",
  \"title\": \"Water Meter\",
  \"rootEntity\": \"Meter\",
  \"entities\": [\"Meter\", \"MeterReading\", \"ServiceLine\"],
  \"valueObjects\": [\"MeterSerialNumber\", \"GPSCoordinate\", \"ReadingValue\", \"LineMaterial\"],
  \"events\": [\"meter-reading-recorded\", \"service-line-inventory-updated\"],
  \"commands\": [\"RecordReading\", \"FlagAnomaly\", \"UpdateServiceLineMaterial\"],
  \"invariants\": [
    {\"rule\": \"Meter readings must be monotonically increasing\", \"severity\": \"high\"},
    {\"rule\": \"Service line material must be one of: copper, lead, galvanized, plastic, unknown\", \"severity\": \"critical\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  water-meter (Distribution Maintenance)"

post "$API/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_DISPATCH\",
  \"slug\": \"work-order\",
  \"title\": \"Work Order\",
  \"rootEntity\": \"WorkOrder\",
  \"entities\": [\"WorkOrder\", \"CrewAssignment\", \"MaterialsLog\"],
  \"valueObjects\": [\"WorkOrderNumber\", \"Priority\", \"Location\", \"EstimatedDuration\"],
  \"events\": [\"emergency-repair-dispatched\", \"service-disconnected\", \"repair-completed\"],
  \"commands\": [\"CreateWorkOrder\", \"AssignCrew\", \"UpdateStatus\", \"CloseWorkOrder\"],
  \"invariants\": [
    {\"rule\": \"Emergency work orders must be assigned within 30 minutes\", \"severity\": \"critical\"},
    {\"rule\": \"Work order cannot be closed without completion notes\", \"severity\": \"high\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  work-order (Field Dispatch)"

post "$API/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_COMPLIANCE\",
  \"slug\": \"water-sample\",
  \"title\": \"Water Sample\",
  \"rootEntity\": \"Sample\",
  \"entities\": [\"Sample\", \"LabResult\", \"ComplianceReport\"],
  \"valueObjects\": [\"SampleId\", \"ContaminantLevel\", \"MCLThreshold\", \"AnalysisMethod\"],
  \"events\": [\"water-quality-sample-collected\", \"contaminant-threshold-exceeded\", \"pfas-test-result-published\"],
  \"commands\": [\"CollectSample\", \"RecordLabResult\", \"FlagExceedance\", \"GenerateComplianceReport\"],
  \"invariants\": [
    {\"rule\": \"Sample must have chain-of-custody documentation\", \"severity\": \"critical\"},
    {\"rule\": \"PFAS results must include all 6 regulated compounds\", \"severity\": \"critical\"},
    {\"rule\": \"Exceedance notification must be issued within 24 hours\", \"severity\": \"critical\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  water-sample (Compliance & Lab)"

post "$API/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_CAPITAL\",
  \"slug\": \"capital-project\",
  \"title\": \"Capital Project\",
  \"rootEntity\": \"Project\",
  \"entities\": [\"Project\", \"Milestone\", \"ContractorAssignment\", \"BudgetAllocation\"],
  \"valueObjects\": [\"ProjectId\", \"Budget\", \"Timeline\", \"AffectedArea\"],
  \"events\": [\"capital-project-approved\"],
  \"commands\": [\"ProposeProject\", \"ApproveProject\", \"AwardContract\", \"UpdateMilestone\", \"CloseProject\"],
  \"invariants\": [
    {\"rule\": \"Project budget cannot exceed approved capital facilities fee allocation\", \"severity\": \"critical\"},
    {\"rule\": \"Public meeting required before construction begins\", \"severity\": \"high\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  capital-project (Capital Improvement)"

echo ""
echo "  Total: 5 aggregates created"
echo ""

# =============================================================================
# 6. CREATE VALUE OBJECTS (4 value objects)
# =============================================================================
echo "─── Creating Value Objects ───"

post "$API/domain-models/$MODEL_ID/value-objects" "{
  \"contextId\": \"$CTX_BILLING\",
  \"slug\": \"bill-amount\",
  \"title\": \"Bill Amount\",
  \"description\": \"Immutable representation of a water/sewer utility bill amount with tiered rate breakdown.\",
  \"properties\": [
    {\"name\": \"waterCharges\", \"type\": \"Money\"},
    {\"name\": \"sewerCharges\", \"type\": \"Money\"},
    {\"name\": \"stormwaterFee\", \"type\": \"Money\"},
    {\"name\": \"tierBreakdown\", \"type\": \"TierRate[]\"},
    {\"name\": \"totalAmount\", \"type\": \"Money\"}
  ],
  \"validationRules\": [\"Total must equal sum of all charges\", \"All amounts must be non-negative\"],
  \"immutable\": true
}" > /dev/null
echo "  bill-amount"

post "$API/domain-models/$MODEL_ID/value-objects" "{
  \"contextId\": \"$CTX_DISTRIBUTION\",
  \"slug\": \"meter-reading\",
  \"title\": \"Meter Reading\",
  \"description\": \"Immutable snapshot of a water meter reading at a point in time.\",
  \"properties\": [
    {\"name\": \"value\", \"type\": \"number\"},
    {\"name\": \"unit\", \"type\": \"gallons\"},
    {\"name\": \"readingType\", \"type\": \"AMR | manual | estimated\"},
    {\"name\": \"timestamp\", \"type\": \"ISO8601\"}
  ],
  \"validationRules\": [\"Value must be non-negative\", \"Must be greater than or equal to previous reading\"],
  \"immutable\": true
}" > /dev/null
echo "  meter-reading"

post "$API/domain-models/$MODEL_ID/value-objects" "{
  \"contextId\": \"$CTX_COMPLIANCE\",
  \"slug\": \"contaminant-result\",
  \"title\": \"Contaminant Result\",
  \"description\": \"Immutable lab result for a specific contaminant measurement against its regulatory threshold.\",
  \"properties\": [
    {\"name\": \"contaminant\", \"type\": \"string\"},
    {\"name\": \"measuredLevel\", \"type\": \"number\"},
    {\"name\": \"unit\", \"type\": \"string (ppb, ppt, mg/L)\"},
    {\"name\": \"mcl\", \"type\": \"number\"},
    {\"name\": \"exceedsThreshold\", \"type\": \"boolean\"}
  ],
  \"validationRules\": [\"Measured level must be non-negative\", \"MCL must be a positive number\"],
  \"immutable\": true
}" > /dev/null
echo "  contaminant-result"

post "$API/domain-models/$MODEL_ID/value-objects" "{
  \"contextId\": \"$CTX_DISPATCH\",
  \"slug\": \"service-location\",
  \"title\": \"Service Location\",
  \"description\": \"Immutable geographic location for a service address or infrastructure point.\",
  \"properties\": [
    {\"name\": \"address\", \"type\": \"string\"},
    {\"name\": \"latitude\", \"type\": \"number\"},
    {\"name\": \"longitude\", \"type\": \"number\"},
    {\"name\": \"zone\", \"type\": \"string\"},
    {\"name\": \"nearestHydrant\", \"type\": \"string\"}
  ],
  \"validationRules\": [\"Latitude must be between -90 and 90\", \"Longitude must be between -180 and 180\"],
  \"immutable\": true
}" > /dev/null
echo "  service-location"

echo ""
echo "  Total: 4 value objects created"
echo ""

# =============================================================================
# 7. CREATE GLOSSARY TERMS (10 terms)
# =============================================================================
echo "─── Creating Glossary Terms ───"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_COMPLIANCE\",
  \"term\": \"PFAS\",
  \"definition\": \"Per- and polyfluoroalkyl substances — a group of manufactured chemicals used since the 1940s. EPA set new drinking water standards in 2024 for PFOA (4 ppt), PFOS (4 ppt), and other PFAS compounds.\",
  \"aliases\": [\"Forever Chemicals\", \"PFOA\", \"PFOS\"],
  \"examples\": [\"Durham Water tests quarterly for 6 regulated PFAS compounds\"],
  \"relatedTerms\": [\"MCL\", \"Contaminant\"],
  \"source\": \"EPA PFAS Drinking Water Standards (2024)\"
}" > /dev/null
echo "  PFAS"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_COMPLIANCE\",
  \"term\": \"MCL\",
  \"definition\": \"Maximum Contaminant Level — the highest level of a contaminant allowed in drinking water, set by the EPA. MCLs are enforceable standards.\",
  \"aliases\": [\"Maximum Contaminant Level\"],
  \"examples\": [\"Lead action level is 15 ppb\", \"PFOA MCL is 4 parts per trillion\"],
  \"relatedTerms\": [\"PFAS\", \"Contaminant Threshold Exceeded\"]
}" > /dev/null
echo "  MCL"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_DISTRIBUTION\",
  \"term\": \"AMR\",
  \"definition\": \"Automated Meter Reading — electronic system that automatically collects water consumption data from meters by driving past meter locations, replacing manual reads.\",
  \"aliases\": [\"Automated Meter Reading\", \"Smart Meter\"],
  \"examples\": [\"AMR readers collect data daily across all Durham meter routes\"],
  \"relatedTerms\": [\"Meter Reading\", \"Anomaly Detection\"]
}" > /dev/null
echo "  AMR"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_DISTRIBUTION\",
  \"term\": \"Flushing\",
  \"definition\": \"The controlled release of water through fire hydrants to remove sediment, restore disinfectant residual, and improve water quality in distribution system pipes.\",
  \"aliases\": [\"Hydrant Flushing\", \"System Flushing\"],
  \"examples\": [\"Post-repair flushing clears debris before service restoration\", \"Annual planned flushing addresses dead-end pipe sediment\"],
  \"relatedTerms\": [\"Water Main Break\", \"Water Quality\"]
}" > /dev/null
echo "  Flushing"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_SEWER\",
  \"term\": \"SSO\",
  \"definition\": \"Sanitary Sewer Overflow — any discharge of untreated wastewater from the sanitary sewer system before it reaches the wastewater treatment facility. Must be reported to regulators.\",
  \"aliases\": [\"Sanitary Sewer Overflow\", \"Sewer Overflow\"],
  \"examples\": [\"The Eno Creek Lift Station failure caused a 5.8 million gallon SSO into Eno River\"],
  \"relatedTerms\": [\"Lift Station\", \"Sewer Collection\"]
}" > /dev/null
echo "  SSO"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_SEWER\",
  \"term\": \"FOG\",
  \"definition\": \"Fats, Oils, and Grease — substances that accumulate in sewer lines and cause blockages and overflows. Durham provides free Fat Trapper kits to residents.\",
  \"aliases\": [\"Fats Oils Grease\", \"Grease\"],
  \"examples\": [\"FOG buildup caused 23% of sewer blockages in FY2025\"],
  \"relatedTerms\": [\"SSO\", \"Sewer Collection\"]
}" > /dev/null
echo "  FOG"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_BILLING\",
  \"term\": \"Tiered Water Rate\",
  \"definition\": \"Durham's conservation-based pricing structure where the per-gallon cost increases as usage rises through defined tiers, encouraging water conservation.\",
  \"aliases\": [\"Conservation Rate\", \"Block Rate\"],
  \"examples\": [\"Tier 1 (0-4 CCF): lowest rate\", \"Tier 4 (16+ CCF): highest rate\"],
  \"relatedTerms\": [\"Bill Amount\", \"Water Conservation\"]
}" > /dev/null
echo "  Tiered Water Rate"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_TREATMENT\",
  \"term\": \"Coagulation\",
  \"definition\": \"The first step in water treatment where positively-charged chemical coagulants are added to attract and bind suspended particles (sediment, organic matter) in raw water.\",
  \"aliases\": [\"Chemical Coagulation\"],
  \"examples\": [\"Coagulants neutralize the negative charge on suspended particles\"],
  \"relatedTerms\": [\"Flocculation\", \"Sedimentation\", \"Filtration\"]
}" > /dev/null
echo "  Coagulation"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_DISTRIBUTION\",
  \"term\": \"LCRR\",
  \"definition\": \"Lead and Copper Rule Revision — EPA regulation requiring water utilities to inventory service line materials, replace lead lines, and notify customers with lead or unknown service lines annually.\",
  \"aliases\": [\"Lead and Copper Rule\", \"Lead Safe\"],
  \"examples\": [\"Durham offers 30 dollar bill credit for customers who verify their service line material\"],
  \"relatedTerms\": [\"MCL\", \"Service Line Inventory\"]
}" > /dev/null
echo "  LCRR"

post "$API/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_CAPITAL\",
  \"term\": \"Capital Facilities Fee\",
  \"definition\": \"One-time fee charged to new development connections to fund water and sewer infrastructure improvements required to serve growth.\",
  \"aliases\": [\"System Development Fee\", \"Impact Fee\"],
  \"examples\": [\"Fee varies by meter size and connection type\"],
  \"relatedTerms\": [\"Capital Project\", \"Utility Engineering\"]
}" > /dev/null
echo "  Capital Facilities Fee"

echo ""
echo "  Total: 10 glossary terms created"
echo ""

# =============================================================================
# 8. INGEST GOVERNANCE SNAPSHOT
# =============================================================================
echo "─── Ingesting Governance Snapshot ───"

post "$API/governance" '{
  "version": "1.0.0",
  "project": "durham-water-management",
  "generated": "2026-02-18T12:00:00Z",
  "capabilities": {
    "CAP-001": {
      "id": "CAP-001",
      "title": "Online Bill Payment",
      "category": "customer-self-service",
      "tag": "CAP-001",
      "status": "stable",
      "taxonomyNode": "durham-water.billing-services.billing-engine"
    },
    "CAP-002": {
      "id": "CAP-002",
      "title": "Service Start/Stop",
      "category": "customer-self-service",
      "tag": "CAP-002",
      "status": "stable",
      "taxonomyNode": "durham-water.billing-services.customer-portal-stack"
    },
    "CAP-003": {
      "id": "CAP-003",
      "title": "Problem Reporting",
      "category": "customer-self-service",
      "tag": "CAP-003",
      "status": "stable",
      "taxonomyNode": "durham-water.billing-services.customer-portal-stack"
    },
    "CAP-004": {
      "id": "CAP-004",
      "title": "Field Dispatch & Tracking",
      "category": "operations",
      "tag": "CAP-004",
      "status": "stable",
      "taxonomyNode": "durham-water.field-operations.dispatch-system"
    },
    "CAP-005": {
      "id": "CAP-005",
      "title": "Water Quality Monitoring",
      "category": "compliance",
      "tag": "CAP-005",
      "status": "stable",
      "taxonomyNode": "durham-water.compliance-lab.lims-system"
    },
    "CAP-006": {
      "id": "CAP-006",
      "title": "Automated Meter Reading",
      "category": "infrastructure",
      "tag": "CAP-006",
      "status": "stable",
      "taxonomyNode": "durham-water.distribution-maintenance.amr-infrastructure"
    },
    "CAP-007": {
      "id": "CAP-007",
      "title": "Regulatory Report Submission",
      "category": "compliance",
      "tag": "CAP-007",
      "status": "stable",
      "taxonomyNode": "epa-portal"
    },
    "CAP-008": {
      "id": "CAP-008",
      "title": "Capital Project Tracking",
      "category": "engineering",
      "tag": "CAP-008",
      "status": "planned",
      "taxonomyNode": "durham-water.capital-engineering.project-mgmt-system"
    },
    "CAP-009": {
      "id": "CAP-009",
      "title": "Payment Processing",
      "category": "external-vendor",
      "tag": "CAP-009",
      "status": "stable",
      "taxonomyNode": "infosend-gateway"
    },
    "CAP-010": {
      "id": "CAP-010",
      "title": "Water Treatment Process Control",
      "category": "operations",
      "tag": "CAP-010",
      "status": "stable",
      "taxonomyNode": "durham-water.treatment-division.scada-system"
    },
    "CAP-011": {
      "id": "CAP-011",
      "title": "Sewer Overflow Detection",
      "category": "compliance",
      "tag": "CAP-011",
      "status": "stable",
      "taxonomyNode": "durham-water.sewer-collection-maint.lift-station-scada"
    }
  },
  "personas": {
    "PER-001": {
      "id": "PER-001",
      "name": "Durham Resident",
      "type": "human",
      "archetype": "End customer who receives water/sewer service and pays monthly utility bills",
      "typicalCapabilities": ["CAP-001", "CAP-002", "CAP-003"],
      "tag": "PER-001"
    },
    "PER-002": {
      "id": "PER-002",
      "name": "Field Crew Supervisor",
      "type": "human",
      "archetype": "Experienced water/sewer maintenance professional who leads repair crews and manages emergency response",
      "typicalCapabilities": ["CAP-004", "CAP-011"],
      "tag": "PER-002"
    },
    "PER-003": {
      "id": "PER-003",
      "name": "Lab Technician",
      "type": "human",
      "archetype": "Water quality specialist who collects samples, runs laboratory analyses, and flags regulatory exceedances",
      "typicalCapabilities": ["CAP-005", "CAP-007"],
      "tag": "PER-003"
    },
    "PER-004": {
      "id": "PER-004",
      "name": "Billing Agent",
      "type": "human",
      "archetype": "Customer service representative who handles billing inquiries, payment processing, adjustments, and financial assistance programs",
      "typicalCapabilities": ["CAP-001"],
      "tag": "PER-004"
    },
    "PER-005": {
      "id": "PER-005",
      "name": "Automated Meter Reader",
      "type": "system",
      "archetype": "AMR device mounted on city vehicles that wirelessly reads water meters while driving past customer locations",
      "typicalCapabilities": ["CAP-006"],
      "tag": "PER-005"
    },
    "PER-006": {
      "id": "PER-006",
      "name": "Plant Operator",
      "type": "human",
      "archetype": "Licensed water treatment plant operator monitoring SCADA systems, adjusting chemical dosing, and managing treatment processes",
      "typicalCapabilities": ["CAP-010", "CAP-005"],
      "tag": "PER-006"
    }
  },
  "userStories": {
    "US-001": {
      "id": "US-001",
      "title": "Pay my water bill online",
      "persona": "PER-001",
      "capabilities": ["CAP-001"],
      "status": "complete"
    },
    "US-002": {
      "id": "US-002",
      "title": "Report a water main break from my phone",
      "persona": "PER-001",
      "capabilities": ["CAP-003"],
      "status": "complete"
    },
    "US-003": {
      "id": "US-003",
      "title": "Dispatch crew to emergency water main break",
      "persona": "PER-002",
      "capabilities": ["CAP-004"],
      "status": "complete"
    },
    "US-004": {
      "id": "US-004",
      "title": "Submit quarterly PFAS results to EPA",
      "persona": "PER-003",
      "capabilities": ["CAP-005", "CAP-007"],
      "status": "implementing"
    },
    "US-005": {
      "id": "US-005",
      "title": "Review customer account for billing adjustment",
      "persona": "PER-004",
      "capabilities": ["CAP-001"],
      "status": "complete"
    },
    "US-006": {
      "id": "US-006",
      "title": "Detect water leak from abnormal meter reading pattern",
      "persona": "PER-005",
      "capabilities": ["CAP-006"],
      "status": "implementing"
    },
    "US-007": {
      "id": "US-007",
      "title": "Monitor treatment plant SCADA alarms and adjust chemical dosing",
      "persona": "PER-006",
      "capabilities": ["CAP-010"],
      "status": "complete"
    },
    "US-008": {
      "id": "US-008",
      "title": "Respond to lift station overflow alarm within 30 minutes",
      "persona": "PER-002",
      "capabilities": ["CAP-011", "CAP-004"],
      "status": "complete"
    }
  },
  "roadItems": {
    "ROAD-001": {
      "id": "ROAD-001",
      "title": "Migrate from Paymentus to InfoSend payment gateway",
      "status": "done",
      "phase": 1,
      "priority": "critical"
    },
    "ROAD-002": {
      "id": "ROAD-002",
      "title": "Implement PFAS treatment upgrade at Brown WTP",
      "status": "in-progress",
      "phase": 2,
      "priority": "critical"
    },
    "ROAD-003": {
      "id": "ROAD-003",
      "title": "Complete LCRR service line inventory for all 95,000 connections",
      "status": "in-progress",
      "phase": 2,
      "priority": "high"
    },
    "ROAD-004": {
      "id": "ROAD-004",
      "title": "Deploy AMR leak detection analytics",
      "status": "planned",
      "phase": 3,
      "priority": "medium"
    }
  },
  "stats": {
    "totalCapabilities": 11,
    "totalPersonas": 6,
    "totalStories": 8,
    "totalRoadItems": 4,
    "integrityStatus": "valid",
    "roadsByStatus": {
      "done": 1,
      "in-progress": 2,
      "planned": 1
    }
  },
  "byCapability": {
    "CAP-001": { "stories": ["US-001", "US-005"], "roads": ["ROAD-001"] },
    "CAP-002": { "stories": [], "roads": [] },
    "CAP-003": { "stories": ["US-002"], "roads": [] },
    "CAP-004": { "stories": ["US-003"], "roads": [] },
    "CAP-005": { "stories": ["US-004"], "roads": ["ROAD-002"] },
    "CAP-006": { "stories": ["US-006"], "roads": ["ROAD-004"] },
    "CAP-007": { "stories": ["US-004"], "roads": [] },
    "CAP-008": { "stories": [], "roads": [] },
    "CAP-009": { "stories": [], "roads": ["ROAD-001"] },
    "CAP-010": { "stories": ["US-007"], "roads": ["ROAD-002"] },
    "CAP-011": { "stories": ["US-008"], "roads": [] }
  },
  "byPersona": {
    "PER-001": { "stories": ["US-001", "US-002"], "capabilities": ["CAP-001", "CAP-002", "CAP-003"] },
    "PER-002": { "stories": ["US-003", "US-008"], "capabilities": ["CAP-004", "CAP-011"] },
    "PER-003": { "stories": ["US-004"], "capabilities": ["CAP-005", "CAP-007"] },
    "PER-004": { "stories": ["US-005"], "capabilities": ["CAP-001"] },
    "PER-005": { "stories": ["US-006"], "capabilities": ["CAP-006"] },
    "PER-006": { "stories": ["US-007"], "capabilities": ["CAP-010", "CAP-005"] }
  }
}' > /dev/null
echo "  Governance snapshot ingested (9 capabilities, 5 personas, 6 user stories, 4 road items)"

echo ""

# =============================================================================
# SUMMARY
# =============================================================================
echo "═══════════════════════════════════════════════════════════════"
echo "  SEED COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  Domain Model ID: $MODEL_ID"
echo ""
echo "  Created:"
echo "    - 10 bounded contexts (4 internal, 2 external-system, 1 human-process)"
echo "    -  3 subdomain types (4 core, 3 supporting, 3 generic)"
echo "    - 15 domain events (with cross-context flows)"
echo "    -  2 inferred unknown systems (emergency-notification-system, nc-deq-system)"
echo "    -  3 workflows spanning 3-5 contexts each"
echo "    -  5 aggregates with commands, invariants, and events"
echo "    -  4 value objects (immutable)"
echo "    - 10 glossary terms (PFAS, MCL, AMR, SSO, FOG, etc.)"
echo "    -  1 governance snapshot (9 capabilities, 5 personas, 6 user stories)"
echo ""
echo "  Landscape patterns exercised:"
echo "    - Internal → Internal event flows"
echo "    - Internal → External-system event flows"
echo "    - External → Internal event flows"
echo "    - Internal → Human-process event flows"
echo "    - Internal → Unknown/Inferred system flows"
echo "    - Multi-consumer fan-out events"
echo "    - Workflow flow lines across 3-5 contexts"
echo "    - Persona → Capability → User Story linkages"
echo "    - Error states in workflows"
echo ""
echo "  View the landscape at:"
echo "    http://localhost:3002/design/business-domain/landscape"
echo ""
echo "  Model ID for direct API access:"
echo "    curl $API/landscape/$MODEL_ID"
echo ""
