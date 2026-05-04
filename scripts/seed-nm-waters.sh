#!/usr/bin/env bash
# =============================================================================
# New Mexico Water Rights Administration (OSE/WATERS) — Demo Seed Script
# =============================================================================
# Seeds a complete Business Landscape demo based on the New Mexico
# Office of the State Engineer (OSE) and the WATERS database system
# for water rights administration under the Prior Appropriation doctrine.
#
# Domain covers: water rights permitting, adjudication, administration,
# measurement, dam safety, acequia governance, interstate compact compliance,
# well permitting, water transfers, and enforcement.
#
# Usage:
#   ./scripts/seed-nm-waters.sh [API_BASE_URL]
#
# Default API_BASE_URL: http://localhost:3001/api/v1
# =============================================================================

set -euo pipefail

API="${1:-http://localhost:3001/api/v1}"
echo "=== New Mexico Water Rights Administration (OSE/WATERS) — Seed Script ==="
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

MODEL_RESP=$(post "$API/taxonomy/domain-models" '{
  "name": "New Mexico Water Rights Administration",
  "description": "The New Mexico Office of the State Engineer (OSE) administers all surface and groundwater resources under the Prior Appropriation doctrine (first in time, first in right). The WATERS database is the system of record for ~180,000 water right files spanning permitting, adjudication, enforcement, interstate compact compliance, dam safety, and acequia governance across 34 declared stream systems."
}')
MODEL_ID=$(extract_id "$MODEL_RESP")
echo "  Domain Model: $MODEL_ID"
echo ""

# =============================================================================
# 1b. INGEST TAXONOMY SNAPSHOT (Systems / Subsystems / Stacks)
# =============================================================================
echo "─── Ingesting Taxonomy Snapshot ───"

post "$API/taxonomy/snapshots" '{
  "project": "nm-water-rights-administration",
  "version": "1.0.0",
  "generated": "2026-05-04T12:00:00Z",
  "documents": [
    {
      "taxonomyNodeType": "system",
      "metadata": { "name": "ose-waters", "labels": { "sector": "state-government", "state": "nm" } },
      "spec": {
        "description": "Office of the State Engineer — Water Administration Technical Engineering Resource System (WATERS). System of record for ~180,000 water right files, permitting, adjudication, and enforcement across New Mexico.",
        "parents": { "node": null },
        "owners": ["office-state-engineer"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "permitting-division", "labels": { "division": "water-rights" } },
      "spec": {
        "description": "Water rights application processing, permit issuance, and license management for surface water and groundwater appropriations",
        "parents": { "node": "ose-waters" },
        "owners": ["water-rights-division"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "adjudication-bureau", "labels": { "division": "adjudication" } },
      "spec": {
        "description": "Court-ordered stream system adjudication — hydrographic surveys, declarations, offers of judgment, and final decrees for all 34 declared stream systems",
        "parents": { "node": "ose-waters" },
        "owners": ["adjudication-bureau"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["permitting-division"] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "water-administration", "labels": { "division": "administration" } },
      "spec": {
        "description": "Active water rights administration — priority calls, curtailment orders, rotation schedules, and water master assignments across stream systems",
        "parents": { "node": "ose-waters" },
        "owners": ["water-administration-division"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["permitting-division", "adjudication-bureau"] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "measurement-bureau", "labels": { "division": "measurement" } },
      "spec": {
        "description": "Stream gauges, well meters, diversion point monitoring, and satellite imagery verification of irrigated acreage",
        "parents": { "node": "ose-waters" },
        "owners": ["water-use-conservation-bureau"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "dam-safety-bureau", "labels": { "division": "dam-safety" } },
      "spec": {
        "description": "Dam inspection, hazard classification, emergency action plans, and construction permits for 344 jurisdictional dams",
        "parents": { "node": "ose-waters" },
        "owners": ["dam-safety-bureau"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "acequia-program", "labels": { "division": "acequia" } },
      "spec": {
        "description": "Support for ~700 acequia associations — community ditch governance, mayordomo administration, and water sharing during drought",
        "parents": { "node": "ose-waters" },
        "owners": ["acequia-program-office"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["water-administration"] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "interstate-stream-commission", "labels": { "division": "interstate" } },
      "spec": {
        "description": "Interstate Stream Commission — Rio Grande Compact, Pecos River Compact, Colorado River Compact compliance, delivery accounting, and dispute management",
        "parents": { "node": "ose-waters" },
        "owners": ["interstate-stream-commission"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["measurement-bureau"] }
      }
    },
    {
      "taxonomyNodeType": "subsystem",
      "metadata": { "name": "enforcement-section", "labels": { "division": "enforcement" } },
      "spec": {
        "description": "Compliance monitoring, illegal diversion detection, metering violations, cease-and-desist orders, and penalty assessment",
        "parents": { "node": "ose-waters" },
        "owners": ["enforcement-section"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["measurement-bureau", "water-administration"] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "waters-database", "labels": { "technology": "database" } },
      "spec": {
        "description": "WATERS (Water Administration Technical Engineering Resource System) — the core relational database of record for all ~180,000 water right files",
        "parents": { "node": "permitting-division" },
        "owners": ["ose-it-division"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "ose-efile-portal", "labels": { "technology": "web-portal" } },
      "spec": {
        "description": "OSE eFile — online portal for water right applications, change of use requests, well permits, and document submissions",
        "parents": { "node": "permitting-division" },
        "owners": ["ose-it-division"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["waters-database"] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "gis-mapping-system", "labels": { "technology": "gis" } },
      "spec": {
        "description": "GIS mapping platform for water right point-of-diversion locations, irrigated acreage, stream systems, and dam locations",
        "parents": { "node": "measurement-bureau" },
        "owners": ["ose-gis-section"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "stream-gauge-telemetry", "labels": { "technology": "scada" } },
      "spec": {
        "description": "Real-time stream gauge telemetry and well meter data collection via satellite and cellular networks",
        "parents": { "node": "measurement-bureau" },
        "owners": ["water-use-conservation-bureau"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "satellite-imagery", "labels": { "technology": "remote-sensing" } },
      "spec": {
        "description": "Satellite imagery analysis for irrigated acreage verification and unauthorized diversion detection",
        "parents": { "node": "measurement-bureau" },
        "owners": ["water-use-conservation-bureau"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "dam-inventory-system", "labels": { "technology": "database" } },
      "spec": {
        "description": "Dam inventory database with inspection records, hazard classifications, and emergency action plans for 344 jurisdictional dams",
        "parents": { "node": "dam-safety-bureau" },
        "owners": ["dam-safety-bureau"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "stack",
      "metadata": { "name": "compact-accounting-system", "labels": { "technology": "database" } },
      "spec": {
        "description": "Interstate compact delivery credit/debit accounting system for Rio Grande, Pecos, and other compacts",
        "parents": { "node": "interstate-stream-commission" },
        "owners": ["interstate-stream-commission"],
        "environments": ["prod"],
        "dependsOn": { "nodes": ["stream-gauge-telemetry"] }
      }
    },
    {
      "taxonomyNodeType": "system",
      "metadata": { "name": "usgs-gauge-network", "labels": { "sector": "federal", "external": "true" } },
      "spec": {
        "description": "USGS National Water Information System (NWIS) — provides real-time stream flow data from federal gauge stations across New Mexico",
        "parents": { "node": null },
        "owners": ["usgs-external"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "system",
      "metadata": { "name": "usbr-project-accounting", "labels": { "sector": "federal", "external": "true" } },
      "spec": {
        "description": "Bureau of Reclamation project water accounting for federal irrigation projects (Middle Rio Grande Conservancy District, Carlsbad Irrigation District, etc.)",
        "parents": { "node": null },
        "owners": ["usbr-external"],
        "environments": ["prod"],
        "dependsOn": { "nodes": [] }
      }
    },
    {
      "taxonomyNodeType": "system",
      "metadata": { "name": "nm-courts-system", "labels": { "sector": "state-judicial", "external": "true" } },
      "spec": {
        "description": "New Mexico State District Courts — handle water rights adjudication proceedings, issue final decrees, and resolve disputes",
        "parents": { "node": null },
        "owners": ["nm-judiciary-external"],
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
        "templateReplacements": { "domain": "ose.nm.gov" }
      }
    }
  ],
  "capabilities": [
    {
      "name": "water-rights-mgmt",
      "description": "Top-level capability grouping all NM water rights administration capabilities across permitting, adjudication, enforcement, and interstate compliance",
      "categories": ["administration"],
      "dependsOnCapabilities": [],
      "parentCapability": null,
      "tag": null
    },
    {
      "name": "permitting-cap",
      "description": "Capabilities for processing new water right applications, changes of use, supplemental wells, and permit-to-license lifecycle",
      "categories": ["permitting"],
      "dependsOnCapabilities": [],
      "parentCapability": "water-rights-mgmt",
      "tag": null
    },
    {
      "name": "adjudication-cap",
      "description": "Capabilities for court-ordered stream system adjudication including hydrographic surveys, claims processing, and decree management",
      "categories": ["adjudication", "legal"],
      "dependsOnCapabilities": [],
      "parentCapability": "water-rights-mgmt",
      "tag": null
    },
    {
      "name": "administration-cap",
      "description": "Capabilities for active water rights administration including priority enforcement, curtailment, and water master operations",
      "categories": ["administration", "enforcement"],
      "dependsOnCapabilities": [],
      "parentCapability": "water-rights-mgmt",
      "tag": null
    },
    {
      "name": "measurement-cap",
      "description": "Capabilities for water measurement including stream gauges, well meters, telemetry, and satellite-based acreage verification",
      "categories": ["measurement", "technology"],
      "dependsOnCapabilities": [],
      "parentCapability": "water-rights-mgmt",
      "tag": null
    },
    {
      "name": "compact-compliance-cap",
      "description": "Capabilities for interstate compact delivery compliance, accounting, and dispute resolution",
      "categories": ["compact", "interstate"],
      "dependsOnCapabilities": [],
      "parentCapability": "water-rights-mgmt",
      "tag": null
    },
    {
      "name": "application-processing",
      "description": "Process new water right applications — validate point of diversion, place of use, beneficial use type, and requested quantity",
      "categories": ["permitting"],
      "dependsOnCapabilities": [],
      "parentCapability": "permitting-cap",
      "tag": "CAP-001"
    },
    {
      "name": "change-of-use-processing",
      "description": "Process applications to change point of diversion, place of use, purpose of use, or move water rights between locations",
      "categories": ["permitting"],
      "dependsOnCapabilities": ["application-processing"],
      "parentCapability": "permitting-cap",
      "tag": "CAP-002"
    },
    {
      "name": "hydrographic-survey",
      "description": "Conduct hydrographic surveys mapping all water rights claims in a stream system for court adjudication",
      "categories": ["adjudication"],
      "dependsOnCapabilities": [],
      "parentCapability": "adjudication-cap",
      "tag": "CAP-003"
    },
    {
      "name": "priority-enforcement",
      "description": "Administer water rights by priority date — issue priority calls, curtailment orders, and rotation schedules during shortage",
      "categories": ["administration", "enforcement"],
      "dependsOnCapabilities": ["stream-flow-monitoring"],
      "parentCapability": "administration-cap",
      "tag": "CAP-004"
    },
    {
      "name": "stream-flow-monitoring",
      "description": "Real-time stream flow and diversion monitoring via gauge telemetry and well meter networks",
      "categories": ["measurement"],
      "dependsOnCapabilities": [],
      "parentCapability": "measurement-cap",
      "tag": "CAP-005"
    },
    {
      "name": "acreage-verification",
      "description": "Satellite imagery analysis to verify irrigated acreage matches permitted place-of-use boundaries",
      "categories": ["measurement", "compliance"],
      "dependsOnCapabilities": [],
      "parentCapability": "measurement-cap",
      "tag": "CAP-006"
    },
    {
      "name": "compact-accounting",
      "description": "Calculate and track interstate compact delivery credits/debits for Rio Grande, Pecos, and other compacts",
      "categories": ["compact", "interstate"],
      "dependsOnCapabilities": ["stream-flow-monitoring"],
      "parentCapability": "compact-compliance-cap",
      "tag": "CAP-007"
    },
    {
      "name": "dam-inspection",
      "description": "Inspect and classify 344 jurisdictional dams by hazard potential, maintain emergency action plans",
      "categories": ["dam-safety"],
      "dependsOnCapabilities": [],
      "parentCapability": "water-rights-mgmt",
      "tag": "CAP-008"
    },
    {
      "name": "well-permitting",
      "description": "Process well drilling permits, collect well logs, and record pump test data and aquifer characteristics",
      "categories": ["permitting", "groundwater"],
      "dependsOnCapabilities": [],
      "parentCapability": "permitting-cap",
      "tag": "CAP-009"
    },
    {
      "name": "transfer-processing",
      "description": "Process water right transfers and leases — evaluate impairment to existing rights, manage protest periods",
      "categories": ["permitting", "transfers"],
      "dependsOnCapabilities": ["application-processing"],
      "parentCapability": "permitting-cap",
      "tag": "CAP-010"
    },
    {
      "name": "violation-enforcement",
      "description": "Detect and enforce water rights violations — illegal diversions, metering non-compliance, over-pumping",
      "categories": ["enforcement"],
      "dependsOnCapabilities": ["stream-flow-monitoring", "acreage-verification"],
      "parentCapability": "administration-cap",
      "tag": "CAP-011"
    },
    {
      "name": "public-records-access",
      "description": "Provide public access to water right files, case documents, and FOIA request processing",
      "categories": ["public-access"],
      "dependsOnCapabilities": [],
      "parentCapability": "water-rights-mgmt",
      "tag": "CAP-012"
    }
  ],
  "capabilityRels": [
    { "name": "permitting-implements-app-processing", "node": "permitting-division", "relationshipType": "implements", "capabilities": ["application-processing", "change-of-use-processing", "well-permitting", "transfer-processing"] },
    { "name": "adjudication-implements-survey", "node": "adjudication-bureau", "relationshipType": "implements", "capabilities": ["hydrographic-survey"] },
    { "name": "admin-implements-priority", "node": "water-administration", "relationshipType": "implements", "capabilities": ["priority-enforcement"] },
    { "name": "measurement-implements-monitoring", "node": "measurement-bureau", "relationshipType": "implements", "capabilities": ["stream-flow-monitoring", "acreage-verification"] },
    { "name": "isc-implements-compact", "node": "interstate-stream-commission", "relationshipType": "implements", "capabilities": ["compact-accounting"] },
    { "name": "dam-safety-implements-inspection", "node": "dam-safety-bureau", "relationshipType": "implements", "capabilities": ["dam-inspection"] },
    { "name": "enforcement-implements-violations", "node": "enforcement-section", "relationshipType": "implements", "capabilities": ["violation-enforcement"] },
    { "name": "waters-enables-permitting", "node": "waters-database", "relationshipType": "enables", "capabilities": ["application-processing", "change-of-use-processing", "public-records-access"] },
    { "name": "gis-supports-measurement", "node": "gis-mapping-system", "relationshipType": "supports", "capabilities": ["stream-flow-monitoring", "acreage-verification", "hydrographic-survey"] },
    { "name": "telemetry-enables-monitoring", "node": "stream-gauge-telemetry", "relationshipType": "enables", "capabilities": ["stream-flow-monitoring", "compact-accounting"] },
    { "name": "satellite-enables-verification", "node": "satellite-imagery", "relationshipType": "enables", "capabilities": ["acreage-verification"] },
    { "name": "efile-implements-public-access", "node": "ose-efile-portal", "relationshipType": "implements", "capabilities": ["public-records-access"] }
  ],
  "actions": [],
  "stages": [],
  "tools": [],
  "persons": [
    { "name": "elizabeth-anderson", "displayName": "Elizabeth Anderson", "email": "elizabeth.anderson@ose.nm.gov", "role": "State Engineer" },
    { "name": "miguel-sanchez", "displayName": "Miguel Sanchez", "email": "miguel.sanchez@ose.nm.gov", "role": "Deputy State Engineer" },
    { "name": "rachel-gutierrez", "displayName": "Rachel Gutierrez", "email": "rachel.gutierrez@ose.nm.gov", "role": "Water Rights Division Director" },
    { "name": "david-martinez", "displayName": "David Martinez", "email": "david.martinez@ose.nm.gov", "role": "Adjudication Bureau Chief" },
    { "name": "sarah-begay", "displayName": "Sarah Begay", "email": "sarah.begay@ose.nm.gov", "role": "Water Master, Rio Grande District" },
    { "name": "carlos-romero", "displayName": "Carlos Romero", "email": "carlos.romero@ose.nm.gov", "role": "Acequia Program Manager" },
    { "name": "jennifer-trujillo", "displayName": "Jennifer Trujillo", "email": "jennifer.trujillo@ose.nm.gov", "role": "Interstate Stream Commission Director" },
    { "name": "robert-salazar", "displayName": "Robert Salazar", "email": "robert.salazar@ose.nm.gov", "role": "Dam Safety Bureau Chief" },
    { "name": "patricia-chavez", "displayName": "Patricia Chavez", "email": "patricia.chavez@ose.nm.gov", "role": "Enforcement Section Chief" },
    { "name": "james-kowalski", "displayName": "James Kowalski", "email": "james.kowalski@ose.nm.gov", "role": "Measurement Bureau Chief" },
    { "name": "anna-lucero", "displayName": "Anna Lucero", "email": "anna.lucero@ose.nm.gov", "role": "GIS Section Lead" },
    { "name": "thomas-montoya", "displayName": "Thomas Montoya", "email": "thomas.montoya@ose.nm.gov", "role": "IT Division Director" },
    { "name": "maria-garcia", "displayName": "Maria Garcia", "email": "maria.garcia@ose.nm.gov", "role": "Public Records Officer" },
    { "name": "francisco-vigil", "displayName": "Francisco Vigil", "email": "francisco.vigil@acequias.org", "role": "Acequia Mayordomo" },
    { "name": "linda-baca", "displayName": "Linda Baca", "email": "linda.baca@ose.nm.gov", "role": "Senior Hydrographer" }
  ],
  "teams": [
    {
      "name": "ose-leadership",
      "displayName": "OSE Executive Leadership",
      "teamType": "stream-aligned",
      "description": "State Engineer and Deputy — executive oversight of all water resources administration including the Interstate Stream Commission.",
      "focusArea": "Statewide water policy and administration",
      "communicationChannels": ["#ose-leadership"],
      "ownedNodes": ["ose-waters"],
      "members": [
        { "person": "elizabeth-anderson", "role": "Lead" },
        { "person": "miguel-sanchez", "role": "Member" }
      ]
    },
    {
      "name": "water-rights-team",
      "displayName": "Water Rights Division",
      "teamType": "stream-aligned",
      "description": "Processes new water right applications, changes of use/place/point of diversion, well permits, and transfers. Manages the WATERS database.",
      "focusArea": "Water rights permitting and licensing",
      "communicationChannels": ["#water-rights"],
      "ownedNodes": ["permitting-division", "waters-database", "ose-efile-portal"],
      "members": [
        { "person": "rachel-gutierrez", "role": "Lead" },
        { "person": "thomas-montoya", "role": "Contributor" }
      ]
    },
    {
      "name": "adjudication-team",
      "displayName": "Adjudication Bureau",
      "teamType": "complicated-subsystem",
      "description": "Conducts hydrographic surveys, processes declarations, prepares offers of judgment, and supports court adjudication proceedings for 34 declared stream systems.",
      "focusArea": "Water rights adjudication and hydrographic surveys",
      "communicationChannels": ["#adjudication"],
      "ownedNodes": ["adjudication-bureau"],
      "members": [
        { "person": "david-martinez", "role": "Lead" },
        { "person": "linda-baca", "role": "Member" }
      ]
    },
    {
      "name": "water-admin-team",
      "displayName": "Water Administration Division",
      "teamType": "stream-aligned",
      "description": "Administers water rights by priority date. Water masters enforce curtailment orders and rotation schedules in their assigned stream systems.",
      "focusArea": "Active water rights administration and priority enforcement",
      "communicationChannels": ["#water-admin"],
      "ownedNodes": ["water-administration"],
      "members": [
        { "person": "sarah-begay", "role": "Lead" }
      ]
    },
    {
      "name": "measurement-team",
      "displayName": "Water Use & Conservation Bureau",
      "teamType": "stream-aligned",
      "description": "Operates stream gauge network, well metering program, and satellite imagery analysis for irrigated acreage verification.",
      "focusArea": "Water measurement, metering, and remote sensing",
      "communicationChannels": ["#measurement"],
      "ownedNodes": ["measurement-bureau", "stream-gauge-telemetry", "satellite-imagery"],
      "members": [
        { "person": "james-kowalski", "role": "Lead" },
        { "person": "anna-lucero", "role": "Member" }
      ]
    },
    {
      "name": "acequia-team",
      "displayName": "Acequia Program Office",
      "teamType": "stream-aligned",
      "description": "Supports ~700 acequia associations with governance, water sharing administration, and coordination between community ditches and state water law.",
      "focusArea": "Acequia governance and community water management",
      "communicationChannels": ["#acequia-program"],
      "ownedNodes": ["acequia-program"],
      "members": [
        { "person": "carlos-romero", "role": "Lead" },
        { "person": "francisco-vigil", "role": "Contributor" }
      ]
    },
    {
      "name": "interstate-team",
      "displayName": "Interstate Stream Commission",
      "teamType": "complicated-subsystem",
      "description": "Manages New Mexico compliance with Rio Grande Compact, Pecos River Compact, Colorado River Compact, and other interstate water agreements.",
      "focusArea": "Interstate compact compliance and delivery accounting",
      "communicationChannels": ["#interstate-compact"],
      "ownedNodes": ["interstate-stream-commission", "compact-accounting-system"],
      "members": [
        { "person": "jennifer-trujillo", "role": "Lead" }
      ]
    },
    {
      "name": "dam-safety-team",
      "displayName": "Dam Safety Bureau",
      "teamType": "stream-aligned",
      "description": "Inspects and classifies 344 jurisdictional dams. Issues construction permits, reviews emergency action plans, and enforces safety standards.",
      "focusArea": "Dam safety inspection and regulation",
      "communicationChannels": ["#dam-safety"],
      "ownedNodes": ["dam-safety-bureau", "dam-inventory-system"],
      "members": [
        { "person": "robert-salazar", "role": "Lead" }
      ]
    },
    {
      "name": "enforcement-team",
      "displayName": "Enforcement Section",
      "teamType": "stream-aligned",
      "description": "Investigates illegal diversions, metering violations, and over-pumping. Issues cease-and-desist orders and assesses penalties.",
      "focusArea": "Water rights compliance and enforcement",
      "communicationChannels": ["#enforcement"],
      "ownedNodes": ["enforcement-section"],
      "members": [
        { "person": "patricia-chavez", "role": "Lead" }
      ]
    },
    {
      "name": "gis-section",
      "displayName": "GIS & Mapping Section",
      "teamType": "platform",
      "description": "Platform team providing GIS mapping, spatial analysis, and data visualization for all OSE divisions.",
      "focusArea": "Geospatial data and mapping infrastructure",
      "communicationChannels": ["#gis-mapping"],
      "ownedNodes": ["gis-mapping-system"],
      "members": [
        { "person": "anna-lucero", "role": "Lead" }
      ]
    },
    {
      "name": "ose-it-team",
      "displayName": "IT Division",
      "teamType": "platform",
      "description": "IT platform team maintaining the WATERS database, eFile portal, telemetry systems, and all OSE technology infrastructure.",
      "focusArea": "IT infrastructure and application development",
      "communicationChannels": ["#ose-it"],
      "ownedNodes": [],
      "members": [
        { "person": "thomas-montoya", "role": "Lead" },
        { "person": "maria-garcia", "role": "Member" }
      ]
    }
  ]
}' > /dev/null
echo "  Taxonomy snapshot ingested (4 systems, 8 subsystems, 7 stacks, 18 capabilities, 12 capabilityRels, 15 persons, 11 teams)"
echo ""

# =============================================================================
# 2. CREATE BOUNDED CONTEXTS (12 total)
# =============================================================================
echo "─── Creating Bounded Contexts ───"

# --- Core Domain ---

CTX_PERMITTING_RESP=$(post "$API/taxonomy/domain-models/$MODEL_ID/contexts" '{
  "slug": "water-rights-permitting",
  "title": "Water Rights Permitting",
  "description": "New applications to appropriate water (surface and ground), permits to appropriate, changes of use/place/point of diversion, supplemental wells, and the full lifecycle from application through hearing to license.",
  "responsibility": "Process ~3,000 applications annually. Validate point of diversion, place of use, beneficial use type, and requested quantity. Conduct public notice, manage protest periods, schedule hearings before the State Engineer, issue permits, and convert to licenses upon proof of beneficial use.",
  "teamOwnership": "Water Rights Division",
  "ownerTeam": "water-rights-team",
  "status": "active",
  "subdomainType": "core",
  "contextType": "internal",
  "taxonomyNode": "ose-waters.permitting-division"
}')
CTX_PERMITTING=$(extract_id "$CTX_PERMITTING_RESP")
echo "  water-rights-permitting: $CTX_PERMITTING"

CTX_ADJUDICATION_RESP=$(post "$API/taxonomy/domain-models/$MODEL_ID/contexts" '{
  "slug": "water-rights-adjudication",
  "title": "Water Rights Adjudication",
  "description": "Court-ordered stream system adjudication determining priority dates and quantities for all claimants in a basin. Manages hydrographic surveys, declarations, offers of judgment, and final decrees across 34 declared stream systems.",
  "responsibility": "Conduct hydrographic surveys to map every water right claim. Prepare and deliver offers of judgment to claimants. Support court proceedings through expert testimony. Record final decrees in the WATERS database. Major active adjudications include Pecos River, Lower Rio Grande, and Zuni River.",
  "teamOwnership": "Adjudication Bureau",
  "ownerTeam": "adjudication-team",
  "status": "active",
  "subdomainType": "core",
  "contextType": "internal",
  "taxonomyNode": "ose-waters.adjudication-bureau"
}')
CTX_ADJUDICATION=$(extract_id "$CTX_ADJUDICATION_RESP")
echo "  water-rights-adjudication: $CTX_ADJUDICATION"

CTX_ADMINISTRATION_RESP=$(post "$API/taxonomy/domain-models/$MODEL_ID/contexts" '{
  "slug": "water-rights-administration",
  "title": "Active Water Rights Administration",
  "description": "Day-to-day administration enforcing prior appropriation: priority calls, curtailment orders, rotation schedules, and water master assignments. During drought, junior rights are curtailed to satisfy senior rights.",
  "responsibility": "Assign water masters to stream systems. Process priority calls from senior right holders. Issue curtailment orders to junior appropriators. Manage rotation schedules for acequia systems. Coordinate with measurement bureau for real-time flow data. Enforce first in time, first in right during shortage.",
  "teamOwnership": "Water Administration Division",
  "ownerTeam": "water-admin-team",
  "status": "active",
  "subdomainType": "core",
  "contextType": "internal",
  "taxonomyNode": "ose-waters.water-administration"
}')
CTX_ADMINISTRATION=$(extract_id "$CTX_ADMINISTRATION_RESP")
echo "  water-rights-administration: $CTX_ADMINISTRATION"

CTX_MEASUREMENT_RESP=$(post "$API/taxonomy/domain-models/$MODEL_ID/contexts" '{
  "slug": "water-measurement",
  "title": "Water Measurement & Metering",
  "description": "Stream gauges, well meters, diversion point monitoring via telemetry. Collects actual water use data to enforce permitted quantities. Satellite imagery analysis for irrigated acreage verification.",
  "responsibility": "Operate and maintain stream gauge network. Require and read well meters on permitted diversions. Process telemetry data for real-time flow monitoring. Conduct satellite imagery analysis to verify irrigated acreage matches permitted place of use. Generate annual water use reports per right.",
  "teamOwnership": "Water Use & Conservation Bureau",
  "ownerTeam": "measurement-team",
  "status": "active",
  "subdomainType": "core",
  "contextType": "internal",
  "taxonomyNode": "ose-waters.measurement-bureau"
}')
CTX_MEASUREMENT=$(extract_id "$CTX_MEASUREMENT_RESP")
echo "  water-measurement: $CTX_MEASUREMENT"

# --- Supporting Domain ---

CTX_DAMSAFETY_RESP=$(post "$API/taxonomy/domain-models/$MODEL_ID/contexts" '{
  "slug": "dam-safety",
  "title": "Dam Safety",
  "description": "Inspection, classification (high/significant/low hazard), emergency action plans, and permits for construction or modification of 344 jurisdictional dams and reservoirs across New Mexico.",
  "responsibility": "Conduct annual inspections of high-hazard dams and periodic inspections of others. Classify dam hazard potential based on downstream population and economic loss. Review and approve emergency action plans. Issue construction permits for new dams and modifications.",
  "teamOwnership": "Dam Safety Bureau",
  "ownerTeam": "dam-safety-team",
  "status": "active",
  "subdomainType": "supporting",
  "contextType": "internal",
  "taxonomyNode": "ose-waters.dam-safety-bureau"
}')
CTX_DAMSAFETY=$(extract_id "$CTX_DAMSAFETY_RESP")
echo "  dam-safety: $CTX_DAMSAFETY"

CTX_ACEQUIA_RESP=$(post "$API/taxonomy/domain-models/$MODEL_ID/contexts" '{
  "slug": "acequia-governance",
  "title": "Acequia & Community Ditch Governance",
  "description": "Acequia associations (approximately 700 active in NM), mayordomo water distribution administration, annual spring ditch cleaning (limpieza y saca), water sharing during drought, and commissioner elections. Legal recognition under NM statute with one farmer one vote governance.",
  "responsibility": "Register and support acequia associations. Coordinate between acequia governance (community-based, one farmer one vote) and state prior appropriation system. Administer water sharing agreements during drought. Protect acequia water rights from transfers outside the watershed. Facilitate annual limpieza and mayordomo elections.",
  "teamOwnership": "Acequia Program Office",
  "ownerTeam": "acequia-team",
  "status": "active",
  "subdomainType": "supporting",
  "contextType": "human-process",
  "taxonomyNode": "ose-waters.acequia-program"
}')
CTX_ACEQUIA=$(extract_id "$CTX_ACEQUIA_RESP")
echo "  acequia-governance: $CTX_ACEQUIA"

CTX_COMPACT_RESP=$(post "$API/taxonomy/domain-models/$MODEL_ID/contexts" '{
  "slug": "interstate-compact",
  "title": "Interstate Compact Compliance",
  "description": "Compliance with Rio Grande Compact (1938), Pecos River Compact (1948), Colorado River Compact (1922), Canadian River Compact, and others. Manages delivery obligations, compact accounting, and dispute tracking.",
  "responsibility": "Calculate annual compact delivery credits and debits. Monitor stream flow at compact delivery points. Manage augmentation programs (e.g., Pecos River augmentation well field). Represent NM in compact commission meetings. Track and respond to interstate disputes (e.g., Texas v. New Mexico on the Rio Grande).",
  "teamOwnership": "Interstate Stream Commission",
  "ownerTeam": "interstate-team",
  "status": "active",
  "subdomainType": "supporting",
  "contextType": "internal",
  "taxonomyNode": "ose-waters.interstate-stream-commission"
}')
CTX_COMPACT=$(extract_id "$CTX_COMPACT_RESP")
echo "  interstate-compact: $CTX_COMPACT"

CTX_WELLS_RESP=$(post "$API/taxonomy/domain-models/$MODEL_ID/contexts" '{
  "slug": "well-permitting",
  "title": "Well Permitting & Drilling",
  "description": "Well drilling permits, well completion logs, pump tests, aquifer characteristics, and well plugging requirements. Distinct from water rights — addresses the physical well infrastructure.",
  "responsibility": "Issue well drilling permits with GPS coordinates, proposed depth, and casing diameter. Collect well completion reports and driller logs. Record pump test data and aquifer yield. Manage abandoned well plugging requirements. Coordinate with water rights permitting for groundwater appropriation.",
  "teamOwnership": "Water Rights Division",
  "ownerTeam": "water-rights-team",
  "status": "active",
  "subdomainType": "supporting",
  "contextType": "internal",
  "taxonomyNode": "ose-waters.permitting-division"
}')
CTX_WELLS=$(extract_id "$CTX_WELLS_RESP")
echo "  well-permitting: $CTX_WELLS"

CTX_TRANSFERS_RESP=$(post "$API/taxonomy/domain-models/$MODEL_ID/contexts" '{
  "slug": "water-transfers",
  "title": "Water Rights Transfer & Markets",
  "description": "Temporary leases, permanent transfers, water banking, and offset programs for water rights. Tracks seller/buyer, manages protest periods, and requires hydrologic analysis of impairment to existing rights.",
  "responsibility": "Process transfer applications. Conduct hydrologic analysis to determine if transfer will impair existing rights. Manage 30-day public protest period. Only historically consumed quantity can be transferred — return flows cannot be sold. Coordinate with acequia program for community ditch transfers.",
  "teamOwnership": "Water Rights Division",
  "ownerTeam": "water-rights-team",
  "status": "active",
  "subdomainType": "supporting",
  "contextType": "internal",
  "taxonomyNode": "ose-waters.permitting-division"
}')
CTX_TRANSFERS=$(extract_id "$CTX_TRANSFERS_RESP")
echo "  water-transfers: $CTX_TRANSFERS"

# --- Generic Domain ---

CTX_ENFORCEMENT_RESP=$(post "$API/taxonomy/domain-models/$MODEL_ID/contexts" '{
  "slug": "enforcement",
  "title": "Compliance & Enforcement",
  "description": "Illegal diversion detection, metering violations, over-pumping enforcement, cease-and-desist orders, and penalty assessment. Works with measurement data and field inspections.",
  "responsibility": "Investigate complaints of illegal diversions and unauthorized wells. Monitor metering compliance for permitted diversions. Issue cease-and-desist orders for violations. Assess monetary penalties. Refer criminal violations to the Attorney General. Coordinate with water masters on curtailment compliance.",
  "teamOwnership": "Enforcement Section",
  "ownerTeam": "enforcement-team",
  "status": "active",
  "subdomainType": "generic",
  "contextType": "internal",
  "taxonomyNode": "ose-waters.enforcement-section"
}')
CTX_ENFORCEMENT=$(extract_id "$CTX_ENFORCEMENT_RESP")
echo "  enforcement: $CTX_ENFORCEMENT"

CTX_RECORDS_RESP=$(post "$API/taxonomy/domain-models/$MODEL_ID/contexts" '{
  "slug": "public-records",
  "title": "Public Records & FOIA",
  "description": "Document management for ~180,000 water right files, public inspection requests, certified copies, and case file imaging via the eFile portal.",
  "responsibility": "Maintain official water right files with all associated documents. Process public records requests and FOIA inquiries. Provide certified copies of water right documents. Manage digital imaging and archival of historical paper files. Operate the eFile online portal for public access.",
  "teamOwnership": "OSE IT Division / Public Records",
  "ownerTeam": "ose-it-team",
  "status": "active",
  "subdomainType": "generic",
  "contextType": "internal",
  "taxonomyNode": "ose-waters.permitting-division"
}')
CTX_RECORDS=$(extract_id "$CTX_RECORDS_RESP")
echo "  public-records: $CTX_RECORDS"

CTX_FEDERAL_RESP=$(post "$API/taxonomy/domain-models/$MODEL_ID/contexts" '{
  "slug": "external-federal",
  "title": "Federal Water Programs",
  "description": "Integration with USGS stream gauge network (NWIS), Bureau of Reclamation project accounting, Army Corps permits, and federal reserved water rights for tribal and military lands.",
  "responsibility": "Consume USGS real-time stream flow data. Reconcile Bureau of Reclamation project water accounting with state records. Coordinate on federal reserved rights for Pueblos (e.g., Aamodt, Navajo). Interface with Army Corps on flood control operations.",
  "teamOwnership": "Interstate Stream Commission / Federal Liaison",
  "status": "active",
  "subdomainType": "generic",
  "contextType": "external-system",
  "taxonomyNode": "usgs-gauge-network"
}')
CTX_FEDERAL=$(extract_id "$CTX_FEDERAL_RESP")
echo "  external-federal: $CTX_FEDERAL"

echo ""
echo "  Total: 12 bounded contexts created"
echo ""

# =============================================================================
# 3. CREATE DOMAIN EVENTS (15 events)
# =============================================================================
echo "─── Creating Domain Events ───"

# Event 1: Water right application filed
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"slug\": \"water-right-application-filed\",
  \"title\": \"Water Right Application Filed\",
  \"description\": \"A new application to appropriate water (surface or groundwater) has been filed with the OSE. Triggers review, public notice, and potential protest period.\",
  \"payload\": [
    {\"field\": \"applicationNumber\", \"type\": \"string\"},
    {\"field\": \"applicantName\", \"type\": \"string\"},
    {\"field\": \"waterSource\", \"type\": \"string\"},
    {\"field\": \"sourceType\", \"type\": \"string\", \"enum\": [\"surface\", \"groundwater\"]},
    {\"field\": \"requestedQuantity\", \"type\": \"object\"},
    {\"field\": \"beneficialUse\", \"type\": \"string\"},
    {\"field\": \"pointOfDiversion\", \"type\": \"object\"},
    {\"field\": \"filedDate\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"public-records\", \"water-rights-adjudication\"],
  \"sourceCapabilityId\": \"CAP-001\",
  \"targetCapabilityIds\": [\"CAP-012\", \"CAP-003\"],
  \"triggers\": [\"Applicant submits via eFile portal or paper\"],
  \"sideEffects\": [\"File created in WATERS database\", \"Public notice published in newspaper\", \"30-day protest period initiated\"]
}" > /dev/null
echo "  water-right-application-filed"

# Event 2: Permit granted
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"slug\": \"permit-granted\",
  \"title\": \"Permit to Appropriate Granted\",
  \"description\": \"State Engineer has approved an application and issued a permit to appropriate water. Permittee has a defined period to put water to beneficial use and prove up.\",
  \"payload\": [
    {\"field\": \"permitNumber\", \"type\": \"string\"},
    {\"field\": \"fileNumber\", \"type\": \"string\"},
    {\"field\": \"priorityDate\", \"type\": \"string\"},
    {\"field\": \"approvedQuantity\", \"type\": \"object\"},
    {\"field\": \"beneficialUse\", \"type\": \"string\"},
    {\"field\": \"proofDeadline\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"water-rights-administration\", \"water-measurement\", \"public-records\"],
  \"sourceCapabilityId\": \"CAP-001\",
  \"targetCapabilityIds\": [\"CAP-004\", \"CAP-005\", \"CAP-012\"],
  \"triggers\": [\"State Engineer signs approval after hearing or unprotested review\"],
  \"sideEffects\": [\"WATERS database updated with active permit\", \"Water master notified\", \"Metering requirement issued\"]
}" > /dev/null
echo "  permit-granted"

# Event 3: Priority call issued
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_ADMINISTRATION\",
  \"slug\": \"priority-call-issued\",
  \"title\": \"Priority Call Issued\",
  \"description\": \"A senior water right holder has made a priority call demanding that junior rights be curtailed. Water master must enforce curtailment on all rights junior to the calling right.\",
  \"payload\": [
    {\"field\": \"callId\", \"type\": \"string\"},
    {\"field\": \"callingRightFileNumber\", \"type\": \"string\"},
    {\"field\": \"callingPriorityDate\", \"type\": \"string\"},
    {\"field\": \"streamSystem\", \"type\": \"string\"},
    {\"field\": \"waterMasterDistrict\", \"type\": \"string\"},
    {\"field\": \"issuedDate\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"enforcement\", \"acequia-governance\"],
  \"sourceCapabilityId\": \"CAP-004\",
  \"targetCapabilityIds\": [\"CAP-011\"],
  \"triggers\": [\"Senior appropriator requests enforcement of priority\"],
  \"sideEffects\": [\"Curtailment orders issued to all junior rights\", \"Acequia mayordomos notified\", \"Water master dispatched\"]
}" > /dev/null
echo "  priority-call-issued"

# Event 4: Curtailment order issued
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_ADMINISTRATION\",
  \"slug\": \"curtailment-order-issued\",
  \"title\": \"Curtailment Order Issued\",
  \"description\": \"Water master has issued a curtailment order requiring specific junior right holders to cease or reduce diversions to satisfy senior rights.\",
  \"payload\": [
    {\"field\": \"orderId\", \"type\": \"string\"},
    {\"field\": \"affectedRights\", \"type\": \"array\"},
    {\"field\": \"curtailmentType\", \"type\": \"string\", \"enum\": [\"full_cessation\", \"partial_reduction\", \"rotation\"]},
    {\"field\": \"streamSystem\", \"type\": \"string\"},
    {\"field\": \"effectiveDate\", \"type\": \"string\"},
    {\"field\": \"waterMaster\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"enforcement\", \"water-measurement\"],
  \"sourceCapabilityId\": \"CAP-004\",
  \"targetCapabilityIds\": [\"CAP-011\", \"CAP-005\"],
  \"triggers\": [\"Priority Call Issued\"],
  \"sideEffects\": [\"Affected right holders notified\", \"Monitoring increased on curtailed diversions\"]
}" > /dev/null
echo "  curtailment-order-issued"

# Event 5: Adjudication claim filed
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_ADJUDICATION\",
  \"slug\": \"adjudication-claim-filed\",
  \"title\": \"Adjudication Claim Filed\",
  \"description\": \"A water rights claimant has filed a declaration in a stream system adjudication proceeding, asserting their right to appropriate water.\",
  \"payload\": [
    {\"field\": \"claimId\", \"type\": \"string\"},
    {\"field\": \"claimantName\", \"type\": \"string\"},
    {\"field\": \"streamSystem\", \"type\": \"string\"},
    {\"field\": \"claimedPriorityDate\", \"type\": \"string\"},
    {\"field\": \"claimedQuantity\", \"type\": \"object\"},
    {\"field\": \"basisOfClaim\", \"type\": \"string\", \"enum\": [\"permit\", \"declaration\", \"aboriginal\", \"treaty\", \"federal_reserved\"]}
  ],
  \"consumedBy\": [\"public-records\"],
  \"sourceCapabilityId\": \"CAP-003\",
  \"targetCapabilityIds\": [\"CAP-012\"],
  \"triggers\": [\"Court-ordered deadline for declarations in stream system\"],
  \"sideEffects\": [\"Claim entered into adjudication database\", \"Hydrographic survey team notified\"]
}" > /dev/null
echo "  adjudication-claim-filed"

# Event 6: Final decree entered
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_ADJUDICATION\",
  \"slug\": \"final-decree-entered\",
  \"title\": \"Final Decree Entered\",
  \"description\": \"Court has entered a final decree establishing the priority date, quantity, and conditions for a water right in an adjudicated stream system.\",
  \"payload\": [
    {\"field\": \"decreeId\", \"type\": \"string\"},
    {\"field\": \"fileNumber\", \"type\": \"string\"},
    {\"field\": \"adjudicatedPriorityDate\", \"type\": \"string\"},
    {\"field\": \"adjudicatedQuantity\", \"type\": \"object\"},
    {\"field\": \"conditions\", \"type\": \"array\"},
    {\"field\": \"courtCase\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"water-rights-administration\", \"water-rights-permitting\"],
  \"sourceCapabilityId\": \"CAP-003\",
  \"targetCapabilityIds\": [\"CAP-004\", \"CAP-001\"],
  \"triggers\": [\"Court signs final judgment\"],
  \"sideEffects\": [\"WATERS database updated with adjudicated right\", \"Water master priority list updated\"]
}" > /dev/null
echo "  final-decree-entered"

# Event 7: Meter reading recorded
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_MEASUREMENT\",
  \"slug\": \"meter-reading-recorded\",
  \"title\": \"Meter Reading Recorded\",
  \"description\": \"A well meter or stream diversion meter reading has been recorded, either manually by field staff or via telemetry.\",
  \"payload\": [
    {\"field\": \"meterId\", \"type\": \"string\"},
    {\"field\": \"fileNumber\", \"type\": \"string\"},
    {\"field\": \"readingValue\", \"type\": \"number\"},
    {\"field\": \"unit\", \"type\": \"string\", \"enum\": [\"acre_feet\", \"gallons\", \"cfs\"]},
    {\"field\": \"readMethod\", \"type\": \"string\", \"enum\": [\"manual\", \"telemetry\", \"satellite\"]},
    {\"field\": \"readDate\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"water-rights-administration\", \"enforcement\"],
  \"sourceCapabilityId\": \"CAP-005\",
  \"targetCapabilityIds\": [\"CAP-004\", \"CAP-011\"],
  \"triggers\": [\"Field staff reads meter\", \"Telemetry data received\"],
  \"sideEffects\": [\"Annual use total updated\", \"Over-pumping check triggered if exceeds permit\"]
}" > /dev/null
echo "  meter-reading-recorded"

# Event 8: Annual water use reported
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_MEASUREMENT\",
  \"slug\": \"annual-water-use-reported\",
  \"title\": \"Annual Water Use Reported\",
  \"description\": \"Annual water use report compiled for a water right, reconciling metered use against permitted quantity for the calendar year.\",
  \"payload\": [
    {\"field\": \"fileNumber\", \"type\": \"string\"},
    {\"field\": \"reportYear\", \"type\": \"integer\"},
    {\"field\": \"totalDiverted\", \"type\": \"object\"},
    {\"field\": \"permittedQuantity\", \"type\": \"object\"},
    {\"field\": \"complianceStatus\", \"type\": \"string\", \"enum\": [\"compliant\", \"over_use\", \"under_use\", \"forfeiture_risk\"]}
  ],
  \"consumedBy\": [\"interstate-compact\", \"enforcement\"],
  \"sourceCapabilityId\": \"CAP-005\",
  \"targetCapabilityIds\": [\"CAP-007\", \"CAP-011\"],
  \"triggers\": [\"Calendar year end data compilation\"],
  \"sideEffects\": [\"Compact accounting updated\", \"Forfeiture review triggered if 4+ years non-use\"]
}" > /dev/null
echo "  annual-water-use-reported"

# Event 9: Dam inspection completed
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_DAMSAFETY\",
  \"slug\": \"dam-inspection-completed\",
  \"title\": \"Dam Inspection Completed\",
  \"description\": \"Field inspection of a jurisdictional dam completed with hazard classification assessment and condition report.\",
  \"payload\": [
    {\"field\": \"damId\", \"type\": \"string\"},
    {\"field\": \"damName\", \"type\": \"string\"},
    {\"field\": \"hazardClassification\", \"type\": \"string\", \"enum\": [\"high\", \"significant\", \"low\"]},
    {\"field\": \"condition\", \"type\": \"string\", \"enum\": [\"satisfactory\", \"fair\", \"poor\", \"unsatisfactory\"]},
    {\"field\": \"inspectionDate\", \"type\": \"string\"},
    {\"field\": \"inspector\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"enforcement\"],
  \"sourceCapabilityId\": \"CAP-008\",
  \"targetCapabilityIds\": [\"CAP-011\"],
  \"triggers\": [\"Annual inspection schedule\", \"Complaint or incident report\"],
  \"sideEffects\": [\"Inspection report filed\", \"Corrective action order issued if deficient\"]
}" > /dev/null
echo "  dam-inspection-completed"

# Event 10: Acequia water sharing activated
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_ACEQUIA\",
  \"slug\": \"acequia-water-sharing-activated\",
  \"title\": \"Acequia Water Sharing Activated\",
  \"description\": \"During drought, an acequia association has activated its community water sharing agreement. Water distribution shifts from individual allotments to community-managed rotation under mayordomo authority.\",
  \"payload\": [
    {\"field\": \"acequiaName\", \"type\": \"string\"},
    {\"field\": \"acequiaId\", \"type\": \"string\"},
    {\"field\": \"mayordomo\", \"type\": \"string\"},
    {\"field\": \"rotationSchedule\", \"type\": \"array\"},
    {\"field\": \"triggerCondition\", \"type\": \"string\"},
    {\"field\": \"activatedDate\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"water-rights-administration\"],
  \"sourceCapabilityId\": null,
  \"targetCapabilityIds\": [\"CAP-004\"],
  \"triggers\": [\"Stream flow drops below community threshold\", \"Mayordomo declares drought sharing\"],
  \"sideEffects\": [\"Water master notified of community management\", \"Individual allotments suspended\"]
}" > /dev/null
echo "  acequia-water-sharing-activated"

# Event 11: Compact delivery default detected
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_COMPACT\",
  \"slug\": \"compact-delivery-default-detected\",
  \"title\": \"Compact Delivery Default Detected\",
  \"description\": \"New Mexico has fallen short of its interstate compact delivery obligation at a compact monitoring point. Triggers mandatory response actions.\",
  \"payload\": [
    {\"field\": \"compactName\", \"type\": \"string\"},
    {\"field\": \"deliveryPoint\", \"type\": \"string\"},
    {\"field\": \"requiredDelivery\", \"type\": \"object\"},
    {\"field\": \"actualDelivery\", \"type\": \"object\"},
    {\"field\": \"deficit\", \"type\": \"object\"},
    {\"field\": \"accountingPeriod\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"enforcement\", \"water-rights-administration\"],
  \"sourceCapabilityId\": \"CAP-007\",
  \"targetCapabilityIds\": [\"CAP-011\", \"CAP-004\"],
  \"triggers\": [\"Annual compact accounting shows deficit\"],
  \"sideEffects\": [\"Augmentation programs activated\", \"Curtailment of NM diversions considered\", \"Compact commission notified\"]
}" > /dev/null
echo "  compact-delivery-default-detected"

# Event 12: Transfer protest filed
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_TRANSFERS\",
  \"slug\": \"transfer-protest-filed\",
  \"title\": \"Water Right Transfer Protest Filed\",
  \"description\": \"An existing water right holder has filed a protest against a proposed water right transfer, alleging impairment to their existing rights.\",
  \"payload\": [
    {\"field\": \"protestId\", \"type\": \"string\"},
    {\"field\": \"transferApplicationNumber\", \"type\": \"string\"},
    {\"field\": \"protestantName\", \"type\": \"string\"},
    {\"field\": \"protestantFileNumber\", \"type\": \"string\"},
    {\"field\": \"allegedImpairment\", \"type\": \"string\"},
    {\"field\": \"filedDate\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"water-rights-permitting\"],
  \"sourceCapabilityId\": \"CAP-010\",
  \"targetCapabilityIds\": [\"CAP-001\"],
  \"triggers\": [\"Protestant files during 30-day protest period\"],
  \"sideEffects\": [\"Transfer application put on hold\", \"Hearing scheduled before State Engineer\"]
}" > /dev/null
echo "  transfer-protest-filed"

# Event 13: Violation issued
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_ENFORCEMENT\",
  \"slug\": \"violation-issued\",
  \"title\": \"Water Rights Violation Issued\",
  \"description\": \"Enforcement section has issued a violation notice for illegal diversion, metering non-compliance, over-pumping, or unauthorized well drilling.\",
  \"payload\": [
    {\"field\": \"violationId\", \"type\": \"string\"},
    {\"field\": \"fileNumber\", \"type\": \"string\"},
    {\"field\": \"violationType\", \"type\": \"string\", \"enum\": [\"illegal_diversion\", \"metering_violation\", \"over_pumping\", \"unauthorized_well\", \"curtailment_defiance\"]},
    {\"field\": \"violatorName\", \"type\": \"string\"},
    {\"field\": \"penaltyAmount\", \"type\": \"number\"},
    {\"field\": \"ceaseDesistOrdered\", \"type\": \"boolean\"}
  ],
  \"consumedBy\": [\"water-rights-administration\", \"public-records\"],
  \"sourceCapabilityId\": \"CAP-011\",
  \"targetCapabilityIds\": [\"CAP-004\", \"CAP-012\"],
  \"triggers\": [\"Field investigation confirms violation\", \"Meter reading shows over-pumping\", \"Satellite imagery shows unauthorized irrigation\"],
  \"sideEffects\": [\"Cease-and-desist order served\", \"Penalty assessed\", \"Criminal referral to AG if willful\"]
}" > /dev/null
echo "  violation-issued"

# Event 14: Well permit issued
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_WELLS\",
  \"slug\": \"well-permit-issued\",
  \"title\": \"Well Drilling Permit Issued\",
  \"description\": \"OSE has issued a permit to drill a new well at a specified location with defined construction specifications.\",
  \"payload\": [
    {\"field\": \"wellPermitNumber\", \"type\": \"string\"},
    {\"field\": \"location\", \"type\": \"object\"},
    {\"field\": \"proposedDepth\", \"type\": \"number\"},
    {\"field\": \"casingDiameter\", \"type\": \"number\"},
    {\"field\": \"associatedFileNumber\", \"type\": \"string\"},
    {\"field\": \"aquifer\", \"type\": \"string\"}
  ],
  \"consumedBy\": [\"water-measurement\"],
  \"sourceCapabilityId\": \"CAP-009\",
  \"targetCapabilityIds\": [\"CAP-005\"],
  \"triggers\": [\"Well permit application approved\"],
  \"sideEffects\": [\"Well added to metering program\", \"Driller notified of construction requirements\"]
}" > /dev/null
echo "  well-permit-issued"

# Event 15: Forfeiture review initiated
post "$API/taxonomy/domain-models/$MODEL_ID/events" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"slug\": \"forfeiture-review-initiated\",
  \"title\": \"Forfeiture Review Initiated\",
  \"description\": \"A water right has been flagged for potential forfeiture due to non-use for 4+ consecutive years per NM statute 72-5-28. Review initiated to determine if forfeiture proceedings should begin.\",
  \"payload\": [
    {\"field\": \"fileNumber\", \"type\": \"string\"},
    {\"field\": \"lastKnownUseDate\", \"type\": \"string\"},
    {\"field\": \"yearsOfNonUse\", \"type\": \"integer\"},
    {\"field\": \"rightHolderName\", \"type\": \"string\"},
    {\"field\": \"quantity\", \"type\": \"object\"}
  ],
  \"consumedBy\": [\"enforcement\", \"public-records\"],
  \"sourceCapabilityId\": \"CAP-001\",
  \"targetCapabilityIds\": [\"CAP-011\", \"CAP-012\"],
  \"triggers\": [\"Annual use report shows 4+ years of zero or de minimis use\"],
  \"sideEffects\": [\"Right holder notified of pending forfeiture\", \"Hearing scheduled if contested\"]
}" > /dev/null
echo "  forfeiture-review-initiated"

echo ""
echo "  Total: 15 domain events created"
echo ""

# =============================================================================
# 4. CREATE WORKFLOWS (4 workflows)
# =============================================================================
echo "─── Creating Workflows ───"

# Workflow 1: Water Right Application Lifecycle
post "$API/taxonomy/domain-models/$MODEL_ID/workflows" "{
  \"slug\": \"water-right-application-lifecycle\",
  \"title\": \"Water Right Application Lifecycle\",
  \"description\": \"End-to-end lifecycle from filing a new application to appropriate water through public notice, protest period, hearing, permit issuance, proof of beneficial use, and final license.\",
  \"contextIds\": [\"$CTX_PERMITTING\", \"$CTX_RECORDS\", \"$CTX_MEASUREMENT\", \"$CTX_ADMINISTRATION\"],
  \"states\": [
    {\"name\": \"Filed\", \"type\": \"initial\"},
    {\"name\": \"Under Review\", \"type\": \"intermediate\"},
    {\"name\": \"Public Notice\", \"type\": \"intermediate\"},
    {\"name\": \"Protest Period\", \"type\": \"intermediate\"},
    {\"name\": \"Protested\", \"type\": \"intermediate\", \"isError\": true},
    {\"name\": \"Hearing Scheduled\", \"type\": \"intermediate\"},
    {\"name\": \"Approved\", \"type\": \"intermediate\"},
    {\"name\": \"Denied\", \"type\": \"terminal\", \"isError\": true},
    {\"name\": \"Permit Issued\", \"type\": \"intermediate\"},
    {\"name\": \"Proof of Use Submitted\", \"type\": \"intermediate\"},
    {\"name\": \"License Granted\", \"type\": \"terminal\"}
  ],
  \"transitions\": [
    {\"from\": \"Filed\", \"to\": \"Under Review\", \"label\": \"OSE staff begins completeness review\"},
    {\"from\": \"Under Review\", \"to\": \"Public Notice\", \"label\": \"Application deemed complete, newspaper notice published\"},
    {\"from\": \"Public Notice\", \"to\": \"Protest Period\", \"label\": \"30-day protest window opens\"},
    {\"from\": \"Protest Period\", \"to\": \"Protested\", \"label\": \"Protest filed by existing right holder\"},
    {\"from\": \"Protest Period\", \"to\": \"Approved\", \"label\": \"No protests received, staff recommends approval\"},
    {\"from\": \"Protested\", \"to\": \"Hearing Scheduled\", \"label\": \"Hearing set before State Engineer\"},
    {\"from\": \"Hearing Scheduled\", \"to\": \"Approved\", \"label\": \"State Engineer approves with conditions\"},
    {\"from\": \"Hearing Scheduled\", \"to\": \"Denied\", \"label\": \"Application denied — impairment found\"},
    {\"from\": \"Approved\", \"to\": \"Permit Issued\", \"label\": \"Permit to appropriate water issued\"},
    {\"from\": \"Permit Issued\", \"to\": \"Proof of Use Submitted\", \"label\": \"Permittee puts water to beneficial use\"},
    {\"from\": \"Proof of Use Submitted\", \"to\": \"License Granted\", \"label\": \"OSE verifies beneficial use, issues license\"}
  ]
}" > /dev/null
echo "  water-right-application-lifecycle (4 contexts)"

# Workflow 2: Adjudication Claim Resolution
post "$API/taxonomy/domain-models/$MODEL_ID/workflows" "{
  \"slug\": \"adjudication-claim-resolution\",
  \"title\": \"Adjudication Claim Resolution\",
  \"description\": \"Stream system adjudication process from hydrographic survey initiation through declaration, offer of judgment, and final court decree.\",
  \"contextIds\": [\"$CTX_ADJUDICATION\", \"$CTX_PERMITTING\", \"$CTX_RECORDS\", \"$CTX_FEDERAL\"],
  \"states\": [
    {\"name\": \"Survey Initiated\", \"type\": \"initial\"},
    {\"name\": \"Declaration Filed\", \"type\": \"intermediate\"},
    {\"name\": \"Hydrographic Survey\", \"type\": \"intermediate\"},
    {\"name\": \"Offer of Judgment\", \"type\": \"intermediate\"},
    {\"name\": \"Accepted\", \"type\": \"intermediate\"},
    {\"name\": \"Contested\", \"type\": \"intermediate\", \"isError\": true},
    {\"name\": \"Court Hearing\", \"type\": \"intermediate\"},
    {\"name\": \"Final Decree\", \"type\": \"terminal\"}
  ],
  \"transitions\": [
    {\"from\": \"Survey Initiated\", \"to\": \"Declaration Filed\", \"label\": \"Court orders declarations in stream system\"},
    {\"from\": \"Declaration Filed\", \"to\": \"Hydrographic Survey\", \"label\": \"OSE surveys all claims in basin\"},
    {\"from\": \"Hydrographic Survey\", \"to\": \"Offer of Judgment\", \"label\": \"OSE prepares offer with priority date and quantity\"},
    {\"from\": \"Offer of Judgment\", \"to\": \"Accepted\", \"label\": \"Claimant accepts proposed right\"},
    {\"from\": \"Offer of Judgment\", \"to\": \"Contested\", \"label\": \"Claimant contests proposed right\"},
    {\"from\": \"Accepted\", \"to\": \"Final Decree\", \"label\": \"Court enters decree for accepted claims\"},
    {\"from\": \"Contested\", \"to\": \"Court Hearing\", \"label\": \"Case set for trial\"},
    {\"from\": \"Court Hearing\", \"to\": \"Final Decree\", \"label\": \"Court enters judgment after trial\"}
  ]
}" > /dev/null
echo "  adjudication-claim-resolution (4 contexts)"

# Workflow 3: Water Right Transfer
post "$API/taxonomy/domain-models/$MODEL_ID/workflows" "{
  \"slug\": \"water-right-transfer\",
  \"title\": \"Water Right Transfer\",
  \"description\": \"Process for transferring a water right from one owner/location/use to another, including impairment analysis, public protest period, and State Engineer determination.\",
  \"contextIds\": [\"$CTX_TRANSFERS\", \"$CTX_PERMITTING\", \"$CTX_MEASUREMENT\", \"$CTX_ACEQUIA\"],
  \"states\": [
    {\"name\": \"Application Filed\", \"type\": \"initial\"},
    {\"name\": \"OSE Review\", \"type\": \"intermediate\"},
    {\"name\": \"Public Notice\", \"type\": \"intermediate\"},
    {\"name\": \"Protest Period\", \"type\": \"intermediate\"},
    {\"name\": \"Hydrologic Analysis\", \"type\": \"intermediate\"},
    {\"name\": \"Hearing\", \"type\": \"intermediate\"},
    {\"name\": \"Approved\", \"type\": \"terminal\"},
    {\"name\": \"Denied\", \"type\": \"terminal\", \"isError\": true}
  ],
  \"transitions\": [
    {\"from\": \"Application Filed\", \"to\": \"OSE Review\", \"label\": \"Staff reviews application completeness\"},
    {\"from\": \"OSE Review\", \"to\": \"Public Notice\", \"label\": \"Notice published, 30-day protest window\"},
    {\"from\": \"Public Notice\", \"to\": \"Protest Period\", \"label\": \"Awaiting protests from existing right holders\"},
    {\"from\": \"Protest Period\", \"to\": \"Hydrologic Analysis\", \"label\": \"Protests received, impairment study needed\"},
    {\"from\": \"Protest Period\", \"to\": \"Approved\", \"label\": \"No protests, transfer approved\"},
    {\"from\": \"Hydrologic Analysis\", \"to\": \"Hearing\", \"label\": \"Analysis complete, hearing required\"},
    {\"from\": \"Hearing\", \"to\": \"Approved\", \"label\": \"State Engineer approves — no impairment found\"},
    {\"from\": \"Hearing\", \"to\": \"Denied\", \"label\": \"Transfer denied — impairment to existing rights\"}
  ]
}" > /dev/null
echo "  water-right-transfer (4 contexts)"

# Workflow 4: Acequia Seasonal Cycle
post "$API/taxonomy/domain-models/$MODEL_ID/workflows" "{
  \"slug\": \"acequia-seasonal-cycle\",
  \"title\": \"Acequia Seasonal Water Cycle\",
  \"description\": \"Annual cycle of acequia community water management from spring cleanup through irrigation season, drought sharing, and annual governance meeting.\",
  \"contextIds\": [\"$CTX_ACEQUIA\", \"$CTX_ADMINISTRATION\", \"$CTX_MEASUREMENT\"],
  \"states\": [
    {\"name\": \"Spring Cleanup (Limpieza)\", \"type\": \"initial\"},
    {\"name\": \"Headgate Opened\", \"type\": \"intermediate\"},
    {\"name\": \"Irrigation Season\", \"type\": \"intermediate\"},
    {\"name\": \"Drought Sharing Activated\", \"type\": \"intermediate\", \"isError\": true},
    {\"name\": \"Fall Closure\", \"type\": \"intermediate\"},
    {\"name\": \"Annual Meeting\", \"type\": \"terminal\"}
  ],
  \"transitions\": [
    {\"from\": \"Spring Cleanup (Limpieza)\", \"to\": \"Headgate Opened\", \"label\": \"Community ditch cleaning complete, mayordomo opens headgate\"},
    {\"from\": \"Headgate Opened\", \"to\": \"Irrigation Season\", \"label\": \"Water flowing, individual allotments active\"},
    {\"from\": \"Irrigation Season\", \"to\": \"Drought Sharing Activated\", \"label\": \"Stream flow drops below threshold, rotation begins\"},
    {\"from\": \"Drought Sharing Activated\", \"to\": \"Irrigation Season\", \"label\": \"Stream flow recovers, normal allotments resume\"},
    {\"from\": \"Irrigation Season\", \"to\": \"Fall Closure\", \"label\": \"Growing season ends, headgate closed\"},
    {\"from\": \"Drought Sharing Activated\", \"to\": \"Fall Closure\", \"label\": \"Season ends under drought conditions\"},
    {\"from\": \"Fall Closure\", \"to\": \"Annual Meeting\", \"label\": \"Commissioners and mayordomo elected for next year\"}
  ]
}" > /dev/null
echo "  acequia-seasonal-cycle (3 contexts)"

echo ""
echo "  Total: 4 workflows created"
echo ""

# =============================================================================
# 5. CREATE AGGREGATES (8 aggregates)
# =============================================================================
echo "─── Creating Aggregates ───"

post "$API/taxonomy/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"slug\": \"water-right-file\",
  \"title\": \"Water Right File\",
  \"rootEntity\": \"WaterRight\",
  \"entities\": [\"WaterRight\", \"Application\", \"Permit\", \"License\", \"Amendment\"],
  \"valueObjects\": [\"FileNumber\", \"PriorityDate\", \"WaterQuantity\", \"BeneficialUseType\", \"PointOfDiversion\", \"PlaceOfUse\"],
  \"events\": [\"water-right-application-filed\", \"permit-granted\", \"forfeiture-review-initiated\"],
  \"commands\": [\"FileApplication\", \"IssuePermit\", \"GrantLicense\", \"AmendRight\", \"InitiateForfeiture\"],
  \"invariants\": [
    {\"rule\": \"Priority date is immutable once established\", \"severity\": \"critical\"},
    {\"rule\": \"File number must be unique across all OSE records\", \"severity\": \"critical\"},
    {\"rule\": \"Permitted quantity cannot exceed application amount\", \"severity\": \"high\"},
    {\"rule\": \"Beneficial use must be a legally recognized category\", \"severity\": \"critical\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  water-right-file (Permitting)"

post "$API/taxonomy/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_ADJUDICATION\",
  \"slug\": \"adjudication-claim\",
  \"title\": \"Adjudication Claim\",
  \"rootEntity\": \"Claim\",
  \"entities\": [\"Claim\", \"Declaration\", \"OfferOfJudgment\", \"CourtProceeding\"],
  \"valueObjects\": [\"StreamSystem\", \"ClaimedQuantity\", \"ClaimBasis\"],
  \"events\": [\"adjudication-claim-filed\", \"final-decree-entered\"],
  \"commands\": [\"FileClaim\", \"ConductSurvey\", \"PrepareOffer\", \"AcceptOffer\", \"ContestOffer\"],
  \"invariants\": [
    {\"rule\": \"Claim must be within the declared stream system boundaries\", \"severity\": \"critical\"},
    {\"rule\": \"Claimed priority date must be supported by evidence of beneficial use\", \"severity\": \"high\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  adjudication-claim (Adjudication)"

post "$API/taxonomy/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_ADMINISTRATION\",
  \"slug\": \"priority-call\",
  \"title\": \"Priority Call\",
  \"rootEntity\": \"PriorityCall\",
  \"entities\": [\"PriorityCall\", \"CurtailmentOrder\", \"WaterMasterAssignment\"],
  \"valueObjects\": [\"WaterMasterDistrict\", \"PriorityDate\", \"StreamSystem\"],
  \"events\": [\"priority-call-issued\", \"curtailment-order-issued\"],
  \"commands\": [\"IssuePriorityCall\", \"IssueCurtailment\", \"AssignWaterMaster\", \"LiftCurtailment\"],
  \"invariants\": [
    {\"rule\": \"Only a right holder with a priority date senior to affected rights can initiate a call\", \"severity\": \"critical\"},
    {\"rule\": \"Curtailment must affect all junior rights in the stream system, not selectively\", \"severity\": \"critical\"},
    {\"rule\": \"Water master must be assigned to the affected district\", \"severity\": \"high\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  priority-call (Administration)"

post "$API/taxonomy/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_MEASUREMENT\",
  \"slug\": \"diversion-meter\",
  \"title\": \"Diversion Meter\",
  \"rootEntity\": \"Meter\",
  \"entities\": [\"Meter\", \"MeterReading\", \"WaterUseReport\"],
  \"valueObjects\": [\"MeterReading\", \"GPSCoordinate\", \"MeterSerialNumber\"],
  \"events\": [\"meter-reading-recorded\", \"annual-water-use-reported\"],
  \"commands\": [\"InstallMeter\", \"RecordReading\", \"CompileAnnualReport\", \"FlagOverUse\"],
  \"invariants\": [
    {\"rule\": \"Meter must be associated with a permitted point of diversion\", \"severity\": \"critical\"},
    {\"rule\": \"Readings must be monotonically increasing for totalizing meters\", \"severity\": \"high\"},
    {\"rule\": \"Annual use cannot exceed permitted quantity without triggering enforcement review\", \"severity\": \"critical\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  diversion-meter (Measurement)"

post "$API/taxonomy/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_ACEQUIA\",
  \"slug\": \"acequia-association\",
  \"title\": \"Acequia Association\",
  \"rootEntity\": \"AcequiaAssociation\",
  \"entities\": [\"AcequiaAssociation\", \"Commissioner\", \"Parciante\", \"WaterSharingAgreement\"],
  \"valueObjects\": [\"AcequiaParcel\", \"RotationSchedule\"],
  \"events\": [\"acequia-water-sharing-activated\"],
  \"commands\": [\"RegisterAssociation\", \"ElectCommissioners\", \"AppointMayordomo\", \"ActivateWaterSharing\", \"RecordLimpieza\"],
  \"invariants\": [
    {\"rule\": \"Must have exactly 3 commissioners and 1 mayordomo per NM statute\", \"severity\": \"critical\"},
    {\"rule\": \"Water cannot be transferred outside the acequia watershed\", \"severity\": \"critical\"},
    {\"rule\": \"One farmer one vote — voting not proportional to water share\", \"severity\": \"high\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  acequia-association (Acequia Governance)"

post "$API/taxonomy/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_COMPACT\",
  \"slug\": \"compact-accounting-period\",
  \"title\": \"Compact Accounting Period\",
  \"rootEntity\": \"AccountingPeriod\",
  \"entities\": [\"AccountingPeriod\", \"DeliveryRecord\", \"CreditDebit\"],
  \"valueObjects\": [\"CompactObligation\", \"DeliveryPoint\", \"WaterQuantity\"],
  \"events\": [\"compact-delivery-default-detected\"],
  \"commands\": [\"OpenAccountingPeriod\", \"RecordDelivery\", \"CalculateBalance\", \"CloseAccountingPeriod\"],
  \"invariants\": [
    {\"rule\": \"Delivery credits and debits must balance per compact formula\", \"severity\": \"critical\"},
    {\"rule\": \"Accounting period must align with compact-specified calendar\", \"severity\": \"high\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  compact-accounting-period (Interstate Compact)"

post "$API/taxonomy/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_TRANSFERS\",
  \"slug\": \"water-right-transfer\",
  \"title\": \"Water Right Transfer\",
  \"rootEntity\": \"Transfer\",
  \"entities\": [\"Transfer\", \"ImpairmentAnalysis\", \"ProtestRecord\"],
  \"valueObjects\": [\"TransferQuantity\", \"ConsumptiveUse\", \"ReturnFlow\"],
  \"events\": [\"transfer-protest-filed\"],
  \"commands\": [\"FileTransferApplication\", \"ConductImpairmentAnalysis\", \"PublishNotice\", \"ApproveTransfer\", \"DenyTransfer\"],
  \"invariants\": [
    {\"rule\": \"Only historically consumed quantity can be transferred — return flows excluded\", \"severity\": \"critical\"},
    {\"rule\": \"30-day protest period must be observed before approval\", \"severity\": \"high\"},
    {\"rule\": \"Transfer must not impair existing water rights\", \"severity\": \"critical\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  water-right-transfer (Transfers)"

post "$API/taxonomy/domain-models/$MODEL_ID/aggregates" "{
  \"contextId\": \"$CTX_ENFORCEMENT\",
  \"slug\": \"violation-case\",
  \"title\": \"Violation Case\",
  \"rootEntity\": \"ViolationCase\",
  \"entities\": [\"ViolationCase\", \"Investigation\", \"CeaseDesistOrder\", \"Penalty\"],
  \"valueObjects\": [\"ViolationType\", \"PenaltyAmount\"],
  \"events\": [\"violation-issued\"],
  \"commands\": [\"OpenInvestigation\", \"IssueViolation\", \"IssueCeaseDesist\", \"AssessPenalty\", \"ReferToAG\"],
  \"invariants\": [
    {\"rule\": \"Violation must reference a specific water right file number\", \"severity\": \"critical\"},
    {\"rule\": \"Cease-and-desist must be served before penalty assessment\", \"severity\": \"high\"},
    {\"rule\": \"Criminal referral requires willful violation finding\", \"severity\": \"critical\"}
  ],
  \"status\": \"active\"
}" > /dev/null
echo "  violation-case (Enforcement)"

echo ""
echo "  Total: 8 aggregates created"
echo ""

# =============================================================================
# 6. CREATE VALUE OBJECTS (8 value objects)
# =============================================================================
echo "─── Creating Value Objects ───"

post "$API/taxonomy/domain-models/$MODEL_ID/value-objects" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"slug\": \"point-of-diversion\",
  \"title\": \"Point of Diversion\",
  \"description\": \"Immutable geographic location where water is physically withdrawn from a surface or groundwater source.\",
  \"properties\": [
    {\"name\": \"latitude\", \"type\": \"number\"},
    {\"name\": \"longitude\", \"type\": \"number\"},
    {\"name\": \"sourceType\", \"type\": \"surface | groundwater\"},
    {\"name\": \"sourceName\", \"type\": \"string\"},
    {\"name\": \"legalDescription\", \"type\": \"TownshipRangeSection\"}
  ],
  \"validationRules\": [\"Must be within New Mexico state boundaries\", \"GPS coordinates must resolve to valid location\"],
  \"immutable\": true
}" > /dev/null
echo "  point-of-diversion"

post "$API/taxonomy/domain-models/$MODEL_ID/value-objects" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"slug\": \"water-quantity\",
  \"title\": \"Water Quantity\",
  \"description\": \"Immutable representation of a water quantity with unit and measurement period.\",
  \"properties\": [
    {\"name\": \"amount\", \"type\": \"number\"},
    {\"name\": \"unit\", \"type\": \"acre_feet | gallons_per_minute | cubic_feet_per_second\"},
    {\"name\": \"period\", \"type\": \"annual | instantaneous\"}
  ],
  \"validationRules\": [\"Amount must be positive\", \"Unit must be a recognized water measurement unit\"],
  \"immutable\": true
}" > /dev/null
echo "  water-quantity"

post "$API/taxonomy/domain-models/$MODEL_ID/value-objects" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"slug\": \"priority-date\",
  \"title\": \"Priority Date\",
  \"description\": \"Immutable date establishing the seniority of a water right under prior appropriation — first in time, first in right.\",
  \"properties\": [
    {\"name\": \"date\", \"type\": \"ISO8601\"},
    {\"name\": \"basis\", \"type\": \"permit | declaration | aboriginal | treaty | federal_reserved\"}
  ],
  \"validationRules\": [\"Date must be in the past\", \"Aboriginal and treaty rights predate all state-issued rights\"],
  \"immutable\": true
}" > /dev/null
echo "  priority-date"

post "$API/taxonomy/domain-models/$MODEL_ID/value-objects" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"slug\": \"place-of-use\",
  \"title\": \"Place of Use\",
  \"description\": \"Immutable legal description of the geographic area where appropriated water is applied to its beneficial purpose.\",
  \"properties\": [
    {\"name\": \"township\", \"type\": \"string\"},
    {\"name\": \"range\", \"type\": \"string\"},
    {\"name\": \"section\", \"type\": \"string\"},
    {\"name\": \"quarter\", \"type\": \"string\"},
    {\"name\": \"county\", \"type\": \"string\"},
    {\"name\": \"acreage\", \"type\": \"number\"}
  ],
  \"validationRules\": [\"Must be a valid NM Township/Range/Section\", \"Acreage must be positive\"],
  \"immutable\": true
}" > /dev/null
echo "  place-of-use"

post "$API/taxonomy/domain-models/$MODEL_ID/value-objects" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"slug\": \"beneficial-use-type\",
  \"title\": \"Beneficial Use Type\",
  \"description\": \"Immutable classification of the legally recognized purpose for which water is appropriated.\",
  \"properties\": [
    {\"name\": \"type\", \"type\": \"irrigation | domestic | municipal | industrial | livestock | mining | recreation | environmental\"},
    {\"name\": \"isConsumptive\", \"type\": \"boolean\"},
    {\"name\": \"description\", \"type\": \"string\"}
  ],
  \"validationRules\": [\"Must be a state-recognized beneficial use category\", \"Environmental use accepted only in limited jurisdictions\"],
  \"immutable\": true
}" > /dev/null
echo "  beneficial-use-type"

post "$API/taxonomy/domain-models/$MODEL_ID/value-objects" "{
  \"contextId\": \"$CTX_ADJUDICATION\",
  \"slug\": \"stream-system\",
  \"title\": \"Stream System\",
  \"description\": \"Immutable identifier for a hydrologic stream system subject to adjudication proceedings.\",
  \"properties\": [
    {\"name\": \"name\", \"type\": \"string\"},
    {\"name\": \"tributaryOf\", \"type\": \"string\"},
    {\"name\": \"basinCode\", \"type\": \"string\"},
    {\"name\": \"adjudicationStatus\", \"type\": \"active | completed | pending\"}
  ],
  \"validationRules\": [\"Must be one of the 34 declared stream systems in NM\"],
  \"immutable\": true
}" > /dev/null
echo "  stream-system"

post "$API/taxonomy/domain-models/$MODEL_ID/value-objects" "{
  \"contextId\": \"$CTX_COMPACT\",
  \"slug\": \"compact-obligation\",
  \"title\": \"Compact Obligation\",
  \"description\": \"Immutable representation of a specific interstate compact delivery requirement at a defined monitoring point.\",
  \"properties\": [
    {\"name\": \"compactName\", \"type\": \"string\"},
    {\"name\": \"deliveryPoint\", \"type\": \"string\"},
    {\"name\": \"requiredQuantity\", \"type\": \"WaterQuantity\"},
    {\"name\": \"formula\", \"type\": \"string\"},
    {\"name\": \"accountingPeriod\", \"type\": \"annual | 10-year-rolling\"}
  ],
  \"validationRules\": [\"Compact must be a ratified interstate agreement\", \"Formula must match compact text\"],
  \"immutable\": true
}" > /dev/null
echo "  compact-obligation"

post "$API/taxonomy/domain-models/$MODEL_ID/value-objects" "{
  \"contextId\": \"$CTX_MEASUREMENT\",
  \"slug\": \"meter-reading-vo\",
  \"title\": \"Meter Reading\",
  \"description\": \"Immutable snapshot of a water diversion meter reading at a point in time.\",
  \"properties\": [
    {\"name\": \"value\", \"type\": \"number\"},
    {\"name\": \"unit\", \"type\": \"acre_feet | gallons\"},
    {\"name\": \"readMethod\", \"type\": \"manual | telemetry | satellite\"},
    {\"name\": \"timestamp\", \"type\": \"ISO8601\"}
  ],
  \"validationRules\": [\"Value must be non-negative\", \"Must be greater than or equal to previous reading for totalizing meters\"],
  \"immutable\": true
}" > /dev/null
echo "  meter-reading-vo"

echo ""
echo "  Total: 8 value objects created"
echo ""

# =============================================================================
# 7. CREATE GLOSSARY TERMS (20 terms)
# =============================================================================
echo "─── Creating Glossary Terms ───"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"term\": \"Prior Appropriation\",
  \"definition\": \"Legal doctrine governing water rights in New Mexico: first in time, first in right. The first person to put water to beneficial use has senior rights over later appropriators. During shortage, junior rights are curtailed to satisfy senior rights.\",
  \"aliases\": [\"First in Time First in Right\", \"Colorado Doctrine\", \"Appropriation Doctrine\"],
  \"examples\": [\"An 1880 irrigation right is senior to a 1950 municipal right — in drought, the municipal right is curtailed first\"],
  \"relatedTerms\": [\"Priority Date\", \"Beneficial Use\", \"Curtailment\"],
  \"source\": \"NM Statute 72-1-2\"
}" > /dev/null
echo "  Prior Appropriation"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"term\": \"Beneficial Use\",
  \"definition\": \"A legally recognized use of water — irrigation, domestic, municipal, industrial, livestock, mining, or recreation. Water rights exist only for beneficial use; waste or speculation is not protected.\",
  \"aliases\": [\"Beneficial Purpose\"],
  \"examples\": [\"Irrigating 40 acres of alfalfa\", \"Municipal water supply for the City of Albuquerque\"],
  \"relatedTerms\": [\"Prior Appropriation\", \"Forfeiture\", \"Water Right File\"]
}" > /dev/null
echo "  Beneficial Use"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"term\": \"Priority Date\",
  \"definition\": \"The date a water right was first put to beneficial use, establishing its seniority in the prior appropriation system. Earlier dates are senior. Priority dates are immutable once established.\",
  \"aliases\": [\"Appropriation Date\", \"Seniority Date\"],
  \"examples\": [\"A right with priority date of 1885 is senior to one dated 1920\"],
  \"relatedTerms\": [\"Prior Appropriation\", \"Priority Call\", \"Curtailment\"]
}" > /dev/null
echo "  Priority Date"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"term\": \"Point of Diversion\",
  \"definition\": \"The specific geographic location where water is physically withdrawn from a surface water source (river, stream, spring) or groundwater source (well). Changes require OSE approval.\",
  \"aliases\": [\"POD\", \"Diversion Point\"],
  \"examples\": [\"A pump intake on the Rio Grande at T12N R4E S23\", \"A well at GPS coordinates 35.6870 N, 105.9378 W\"],
  \"relatedTerms\": [\"Place of Use\", \"Water Right File\"]
}" > /dev/null
echo "  Point of Diversion"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"term\": \"Place of Use\",
  \"definition\": \"The geographic area where appropriated water is applied to its beneficial purpose, described by Township/Range/Section legal description. Changes require OSE approval.\",
  \"aliases\": [\"POU\"],
  \"examples\": [\"40 acres of irrigated farmland in T22N R1E S14 NWSW\"],
  \"relatedTerms\": [\"Point of Diversion\", \"Beneficial Use\"]
}" > /dev/null
echo "  Place of Use"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_ADJUDICATION\",
  \"term\": \"Adjudication\",
  \"definition\": \"Court proceeding to determine all water rights in a stream system, resolving competing claims and establishing the priority date, quantity, and conditions for each right. NM has 34 declared stream systems under adjudication.\",
  \"aliases\": [\"Stream System Adjudication\", \"Water Rights Adjudication\"],
  \"examples\": [\"The Pecos River adjudication has been ongoing since 1956\", \"The Lower Rio Grande adjudication covers all rights from Elephant Butte to the Texas border\"],
  \"relatedTerms\": [\"Hydrographic Survey\", \"Offer of Judgment\", \"Final Decree\"]
}" > /dev/null
echo "  Adjudication"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_ADJUDICATION\",
  \"term\": \"Hydrographic Survey\",
  \"definition\": \"OSE-conducted investigation mapping all water rights claims, diversions, and uses within a stream system as part of the adjudication process. Establishes the factual basis for offers of judgment.\",
  \"aliases\": [\"Survey\"],
  \"examples\": [\"The Pecos River hydrographic survey mapped 12,000 water right claims\"],
  \"relatedTerms\": [\"Adjudication\", \"Offer of Judgment\", \"Stream System\"]
}" > /dev/null
echo "  Hydrographic Survey"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_ADMINISTRATION\",
  \"term\": \"Water Master\",
  \"definition\": \"OSE-appointed official who administers water rights in a specific stream system or district. Enforces priority calls, manages curtailment orders, and supervises rotation schedules.\",
  \"aliases\": [\"District Water Master\"],
  \"examples\": [\"The Rio Grande Water Master supervises diversions from Cochiti Dam to Elephant Butte\"],
  \"relatedTerms\": [\"Priority Call\", \"Curtailment\", \"Stream System\"]
}" > /dev/null
echo "  Water Master"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_ADMINISTRATION\",
  \"term\": \"Priority Call\",
  \"definition\": \"A demand by a senior water right holder that all junior rights in the stream system be curtailed to ensure the senior right receives its full allocation.\",
  \"aliases\": [\"Call on the River\"],
  \"examples\": [\"An 1890 irrigator makes a priority call during August drought, requiring all post-1890 rights to cease diversion\"],
  \"relatedTerms\": [\"Curtailment\", \"Prior Appropriation\", \"Water Master\"]
}" > /dev/null
echo "  Priority Call"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_ADMINISTRATION\",
  \"term\": \"Curtailment\",
  \"definition\": \"Reduction or cessation of water use by junior appropriators when water supply is insufficient to satisfy senior rights. Can be full cessation, partial reduction, or rotation schedule.\",
  \"aliases\": [\"Water Curtailment\", \"Priority Administration\"],
  \"examples\": [\"During the 2023 drought, junior Rio Grande rights were curtailed to satisfy Elephant Butte Compact delivery\"],
  \"relatedTerms\": [\"Priority Call\", \"Prior Appropriation\", \"Water Master\"]
}" > /dev/null
echo "  Curtailment"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_ACEQUIA\",
  \"term\": \"Acequia\",
  \"definition\": \"Community-operated irrigation ditch governed by elected commissioners and a mayordomo. Approximately 700 active acequias in New Mexico. Legal recognition under NM statute with one farmer one vote governance. Oldest form of European resource management in the US.\",
  \"aliases\": [\"Community Ditch\", \"Irrigation Ditch\"],
  \"examples\": [\"The Acequia Madre in Santa Fe has operated continuously since 1610\"],
  \"relatedTerms\": [\"Mayordomo\", \"Limpieza\", \"Parciante\"],
  \"source\": \"NM Statute 73-2\"
}" > /dev/null
echo "  Acequia"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_ACEQUIA\",
  \"term\": \"Mayordomo\",
  \"definition\": \"Elected official who manages day-to-day water distribution within an acequia system. Controls the headgates, allocates water among parciantes, and enforces community water sharing during drought.\",
  \"aliases\": [\"Ditch Rider\", \"Ditch Boss\"],
  \"examples\": [\"The mayordomo opens the acequia headgate each spring after the limpieza\"],
  \"relatedTerms\": [\"Acequia\", \"Parciante\", \"Limpieza\"]
}" > /dev/null
echo "  Mayordomo"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_ACEQUIA\",
  \"term\": \"Limpieza\",
  \"definition\": \"Annual spring ditch cleaning (limpieza y saca de acequia) required of all acequia members before the irrigation season begins. A centuries-old community obligation and cultural tradition.\",
  \"aliases\": [\"Spring Cleanup\", \"Saca de Acequia\"],
  \"examples\": [\"All parciantes must participate in the March limpieza or pay a fine\"],
  \"relatedTerms\": [\"Acequia\", \"Mayordomo\", \"Parciante\"]
}" > /dev/null
echo "  Limpieza"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_COMPACT\",
  \"term\": \"Compact Delivery\",
  \"definition\": \"Water quantity that New Mexico must deliver to downstream states under interstate compact agreements. Failure to deliver can result in federal litigation (e.g., Texas v. New Mexico on the Rio Grande).\",
  \"aliases\": [\"Interstate Delivery Obligation\"],
  \"examples\": [\"NM must deliver water at Elephant Butte Reservoir per the Rio Grande Compact of 1938\"],
  \"relatedTerms\": [\"Rio Grande Compact\", \"Pecos River Compact\", \"Compact Accounting\"]
}" > /dev/null
echo "  Compact Delivery"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"term\": \"Forfeiture\",
  \"definition\": \"Loss of a water right due to non-use for 4 or more consecutive years per NM statute 72-5-28. Unlike abandonment, forfeiture is statutory and does not require proof of intent to abandon.\",
  \"aliases\": [\"Water Right Forfeiture\"],
  \"examples\": [\"A right unused since 2019 may face forfeiture proceedings in 2024\"],
  \"relatedTerms\": [\"Beneficial Use\", \"Water Right File\"],
  \"source\": \"NM Statute 72-5-28\"
}" > /dev/null
echo "  Forfeiture"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_TRANSFERS\",
  \"term\": \"Impairment\",
  \"definition\": \"Harm to existing water rights caused by a new appropriation, transfer, or change of use. The OSE must deny applications that would impair existing rights. Protest-based system allows affected right holders to raise impairment claims.\",
  \"aliases\": [\"Water Right Impairment\"],
  \"examples\": [\"A proposed transfer from agricultural to municipal use was denied because it would reduce return flows that downstream irrigators depend on\"],
  \"relatedTerms\": [\"Return Flow\", \"Transfer\", \"Protest\"]
}" > /dev/null
echo "  Impairment"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_TRANSFERS\",
  \"term\": \"Return Flow\",
  \"definition\": \"Water that returns to a stream or aquifer after use. Downstream users may depend on return flows. When a water right is transferred, only the historically consumed portion can be moved — return flows cannot be sold.\",
  \"aliases\": [\"Seepage\", \"Irrigation Return\"],
  \"examples\": [\"Flood irrigation on 40 acres returns approximately 50% of diverted water to the stream via subsurface flow\"],
  \"relatedTerms\": [\"Impairment\", \"Consumptive Use\", \"Transfer\"]
}" > /dev/null
echo "  Return Flow"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_PERMITTING\",
  \"term\": \"WATERS\",
  \"definition\": \"Water Administration Technical Engineering Resource System — the OSE database of record for all ~180,000 water right files in New Mexico. Contains applications, permits, licenses, amendments, court orders, and associated documents.\",
  \"aliases\": [\"WATERS Database\", \"OSE Database\"],
  \"examples\": [\"Every water right in NM has a file number in the WATERS database\"],
  \"relatedTerms\": [\"Water Right File\", \"eFile Portal\"]
}" > /dev/null
echo "  WATERS"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_ADJUDICATION\",
  \"term\": \"Offer of Judgment\",
  \"definition\": \"OSE proposal to an adjudication claimant specifying their recognized water right — priority date, quantity, purpose, point of diversion, and conditions. Claimant may accept or contest the offer.\",
  \"aliases\": [\"OOJ\"],
  \"examples\": [\"The OSE offered 3.5 acre-feet per acre with an 1895 priority date for the disputed irrigation right\"],
  \"relatedTerms\": [\"Adjudication\", \"Final Decree\", \"Hydrographic Survey\"]
}" > /dev/null
echo "  Offer of Judgment"

post "$API/taxonomy/domain-models/$MODEL_ID/glossary" "{
  \"contextId\": \"$CTX_DAMSAFETY\",
  \"term\": \"Hazard Classification\",
  \"definition\": \"Dam hazard potential rating based on downstream consequences of failure: High (probable loss of life), Significant (economic/environmental damage), or Low (minimal impact). Determines inspection frequency.\",
  \"aliases\": [\"Dam Hazard Rating\"],
  \"examples\": [\"Elephant Butte Dam is classified as High Hazard due to downstream population\"],
  \"relatedTerms\": [\"Dam Inspection\", \"Emergency Action Plan\"]
}" > /dev/null
echo "  Hazard Classification"

echo ""
echo "  Total: 20 glossary terms created"
echo ""

# =============================================================================
# 8. INGEST GOVERNANCE SNAPSHOT
# =============================================================================
echo "─── Ingesting Governance Snapshot ───"

post "$API/taxonomy/governance" '{
  "version": "1.0.0",
  "project": "nm-water-rights-administration",
  "generated": "2026-05-04T12:00:00Z",
  "capabilities": {
    "CAP-001": {
      "id": "CAP-001",
      "title": "Water Right Application Processing",
      "description": "Process new water right applications — validate point of diversion, place of use, beneficial use type, and requested quantity",
      "category": "permitting",
      "tag": "CAP-001",
      "status": "stable",
      "taxonomyNode": "ose-waters.permitting-division.waters-database"
    },
    "CAP-002": {
      "id": "CAP-002",
      "title": "Change of Use Processing",
      "description": "Process applications to change point of diversion, place of use, or purpose of use for existing water rights",
      "category": "permitting",
      "tag": "CAP-002",
      "status": "stable",
      "taxonomyNode": "ose-waters.permitting-division"
    },
    "CAP-003": {
      "id": "CAP-003",
      "title": "Hydrographic Survey",
      "description": "Conduct hydrographic surveys mapping all water rights claims in a stream system for court adjudication",
      "category": "adjudication",
      "tag": "CAP-003",
      "status": "stable",
      "taxonomyNode": "ose-waters.adjudication-bureau"
    },
    "CAP-004": {
      "id": "CAP-004",
      "title": "Priority Administration & Curtailment",
      "description": "Administer water rights by priority date — issue priority calls, curtailment orders, and rotation schedules during shortage",
      "category": "administration",
      "tag": "CAP-004",
      "status": "stable",
      "taxonomyNode": "ose-waters.water-administration"
    },
    "CAP-005": {
      "id": "CAP-005",
      "title": "Stream Flow & Well Monitoring",
      "description": "Real-time stream flow and well meter monitoring via gauge telemetry and cellular networks",
      "category": "measurement",
      "tag": "CAP-005",
      "status": "stable",
      "taxonomyNode": "ose-waters.measurement-bureau.stream-gauge-telemetry"
    },
    "CAP-006": {
      "id": "CAP-006",
      "title": "Satellite Acreage Verification",
      "description": "Satellite imagery analysis to verify irrigated acreage matches permitted place-of-use boundaries",
      "category": "measurement",
      "tag": "CAP-006",
      "status": "planned",
      "taxonomyNode": "ose-waters.measurement-bureau.satellite-imagery"
    },
    "CAP-007": {
      "id": "CAP-007",
      "title": "Compact Delivery Accounting",
      "description": "Calculate and track interstate compact delivery credits/debits for Rio Grande, Pecos, and other compacts",
      "category": "interstate",
      "tag": "CAP-007",
      "status": "stable",
      "taxonomyNode": "ose-waters.interstate-stream-commission.compact-accounting-system"
    },
    "CAP-008": {
      "id": "CAP-008",
      "title": "Dam Safety Inspection",
      "description": "Inspect and classify 344 jurisdictional dams by hazard potential, maintain emergency action plans",
      "category": "dam-safety",
      "tag": "CAP-008",
      "status": "stable",
      "taxonomyNode": "ose-waters.dam-safety-bureau.dam-inventory-system"
    },
    "CAP-009": {
      "id": "CAP-009",
      "title": "Well Permitting",
      "description": "Process well drilling permits, collect well logs, and record pump test data and aquifer characteristics",
      "category": "permitting",
      "tag": "CAP-009",
      "status": "stable",
      "taxonomyNode": "ose-waters.permitting-division"
    },
    "CAP-010": {
      "id": "CAP-010",
      "title": "Water Right Transfer Processing",
      "description": "Process water right transfers and leases — evaluate impairment to existing rights, manage protest periods",
      "category": "permitting",
      "tag": "CAP-010",
      "status": "stable",
      "taxonomyNode": "ose-waters.permitting-division"
    },
    "CAP-011": {
      "id": "CAP-011",
      "title": "Violation Enforcement",
      "description": "Detect and enforce water rights violations — illegal diversions, metering non-compliance, over-pumping",
      "category": "enforcement",
      "tag": "CAP-011",
      "status": "stable",
      "taxonomyNode": "ose-waters.enforcement-section"
    },
    "CAP-012": {
      "id": "CAP-012",
      "title": "Public Records Access",
      "description": "Provide public access to water right files via the eFile portal, process FOIA requests, issue certified copies",
      "category": "public-access",
      "tag": "CAP-012",
      "status": "stable",
      "taxonomyNode": "ose-waters.permitting-division.ose-efile-portal"
    }
  },
  "userTypes": {
    "UT-001": {
      "id": "UT-001",
      "name": "Water Right Applicant",
      "type": "human",
      "archetype": "consumer",
      "description": "Individual, rancher, farmer, municipality, or developer applying for a new water right or change of use",
      "goals": ["Obtain permit to appropriate water for beneficial use", "Change point of diversion or place of use", "Transfer water right to new owner"],
      "painPoints": ["Complex application process with legal descriptions", "Long processing times (6-24 months)", "Protest period uncertainty"],
      "behaviors": ["Files application via eFile portal or paper", "Attends public hearings when protested", "Hires water attorney for complex applications"],
      "typicalCapabilities": ["CAP-001", "CAP-002", "CAP-010"],
      "technicalProfile": {"skillLevel": "basic", "frequency": "occasional"},
      "tag": "UT-001"
    },
    "UT-002": {
      "id": "UT-002",
      "name": "Water Master",
      "type": "human",
      "archetype": "operator",
      "description": "OSE-appointed official who administers water rights on a specific stream system, enforcing priority calls and curtailment during drought",
      "goals": ["Enforce first in time first in right during shortage", "Process priority calls within 48 hours", "Verify meter readings match permitted use"],
      "painPoints": ["Incomplete metering on older rights", "Resistance from junior right holders to curtailment", "Real-time flow data gaps"],
      "behaviors": ["Patrols stream system during irrigation season", "Issues curtailment orders to junior rights", "Coordinates with acequia mayordomos"],
      "typicalCapabilities": ["CAP-004", "CAP-005"],
      "technicalProfile": {"skillLevel": "intermediate", "frequency": "daily"},
      "tag": "UT-002"
    },
    "UT-003": {
      "id": "UT-003",
      "name": "Acequia Mayordomo",
      "type": "human",
      "archetype": "operator",
      "description": "Elected acequia official managing community water distribution, headgate operations, and drought sharing for the acequia system",
      "goals": ["Distribute water fairly among all parciantes", "Manage drought rotation without state intervention", "Maintain the acequia ditch in working condition"],
      "painPoints": ["Drought years require difficult allocation decisions", "Younger generation less engaged in maintenance", "Conflict with state prior appropriation system"],
      "behaviors": ["Opens and closes headgates seasonally", "Organizes spring limpieza", "Manages community drought rotation", "One farmer one vote governance"],
      "typicalCapabilities": ["CAP-004"],
      "technicalProfile": {"skillLevel": "basic", "frequency": "daily-seasonal"},
      "tag": "UT-003"
    },
    "UT-004": {
      "id": "UT-004",
      "name": "OSE Staff Hydrographer",
      "type": "human",
      "archetype": "operator",
      "description": "Technical specialist conducting hydrographic surveys, mapping water diversions, and preparing offers of judgment for adjudication proceedings",
      "goals": ["Complete accurate hydrographic surveys for stream systems", "Map every diversion point with GPS precision", "Prepare defensible offers of judgment for court"],
      "painPoints": ["Decades-long adjudication timelines", "Historical records are often incomplete or conflicting", "Field surveys require access to private land"],
      "behaviors": ["Conducts field surveys with GPS and flow measurement equipment", "Reviews historical records dating back to Spanish colonial era", "Testifies as expert witness in court"],
      "typicalCapabilities": ["CAP-003", "CAP-005"],
      "technicalProfile": {"skillLevel": "advanced", "frequency": "daily"},
      "tag": "UT-004"
    },
    "UT-005": {
      "id": "UT-005",
      "name": "Stream Gauge Telemetry System",
      "type": "system",
      "archetype": "integrator",
      "description": "Automated telemetry system collecting real-time stream flow data from gauge stations via satellite and cellular networks",
      "goals": ["Transmit flow readings every 15 minutes", "Detect equipment failures within 1 hour", "Maintain data quality for compact accounting"],
      "painPoints": ["Satellite communication delays in remote areas", "Equipment damage from flood events", "Power supply reliability at remote stations"],
      "behaviors": ["Collects water level and flow readings at scheduled intervals", "Transmits data to OSE servers via GOES satellite or cellular", "Alerts on anomalous readings or equipment faults"],
      "typicalCapabilities": ["CAP-005", "CAP-007"],
      "technicalProfile": {"skillLevel": "advanced", "integrationType": "device-to-system", "frequency": "continuous"},
      "tag": "UT-005"
    },
    "UT-006": {
      "id": "UT-006",
      "name": "Interstate Compact Commissioner",
      "type": "human",
      "archetype": "decision-maker",
      "description": "NM representative to interstate compact commissions (Rio Grande, Pecos, etc.) responsible for negotiating and ensuring compliance with delivery obligations",
      "goals": ["Ensure NM meets compact delivery obligations", "Avoid litigation from downstream states", "Negotiate favorable compact interpretations"],
      "painPoints": ["Climate change reducing available water supply", "Growing demand from population growth", "Federal reserved rights competing for same supply"],
      "behaviors": ["Reviews annual compact accounting reports", "Attends compact commission meetings", "Coordinates augmentation programs during shortfall"],
      "typicalCapabilities": ["CAP-007"],
      "technicalProfile": {"skillLevel": "advanced", "frequency": "monthly"},
      "tag": "UT-006"
    }
  },
  "userStories": {
    "US-001": {
      "id": "US-001",
      "title": "File a new water right application online",
      "userType": "UT-001",
      "capabilities": ["CAP-001"],
      "status": "complete",
      "acceptanceCriteria": ["Application submitted via eFile portal with all required fields", "Public notice generated for newspaper publication", "Confirmation number provided immediately"]
    },
    "US-002": {
      "id": "US-002",
      "title": "Enforce priority call on junior rights during drought",
      "userType": "UT-002",
      "capabilities": ["CAP-004", "CAP-005"],
      "status": "complete",
      "acceptanceCriteria": ["All junior rights in stream system identified and notified within 48 hours", "Curtailment order issued with affected right file numbers", "Monitoring increased on curtailed diversions"]
    },
    "US-003": {
      "id": "US-003",
      "title": "Manage acequia drought rotation schedule",
      "userType": "UT-003",
      "capabilities": ["CAP-004"],
      "status": "complete",
      "acceptanceCriteria": ["Rotation schedule published to all parciantes", "Water sharing activated by mayordomo decree", "State water master notified of community management"]
    },
    "US-004": {
      "id": "US-004",
      "title": "Complete hydrographic survey for Pecos River stream system",
      "userType": "UT-004",
      "capabilities": ["CAP-003", "CAP-005"],
      "status": "implementing",
      "acceptanceCriteria": ["All diversions mapped with GPS coordinates", "Historical use documented for each claim", "Offers of judgment prepared for court review"]
    },
    "US-005": {
      "id": "US-005",
      "title": "Transmit real-time stream flow data for compact compliance",
      "userType": "UT-005",
      "capabilities": ["CAP-005", "CAP-007"],
      "status": "complete",
      "acceptanceCriteria": ["Flow readings transmitted every 15 minutes", "Data available for compact accounting within 1 hour", "Equipment fault alerts generated within 1 hour"]
    },
    "US-006": {
      "id": "US-006",
      "title": "Review annual compact accounting and identify delivery shortfall",
      "userType": "UT-006",
      "capabilities": ["CAP-007"],
      "status": "complete",
      "acceptanceCriteria": ["Annual credit/debit balance calculated per compact formula", "Shortfall identified with deficit quantity", "Augmentation plan activated if needed"]
    },
    "US-007": {
      "id": "US-007",
      "title": "Verify irrigated acreage from satellite imagery",
      "userType": "UT-004",
      "capabilities": ["CAP-006"],
      "status": "implementing",
      "acceptanceCriteria": ["Satellite imagery analyzed for all permitted places of use", "Irrigated acreage compared against permitted boundaries", "Discrepancies flagged for enforcement review"]
    },
    "US-008": {
      "id": "US-008",
      "title": "Process a water right transfer with impairment analysis",
      "userType": "UT-001",
      "capabilities": ["CAP-010"],
      "status": "complete",
      "acceptanceCriteria": ["Transfer application filed via eFile portal", "Impairment analysis completed within 90 days", "Protest period managed with hearing if protested"]
    }
  },
  "roadItems": {
    "ROAD-001": {
      "id": "ROAD-001",
      "title": "Modernize WATERS database to cloud-based platform",
      "status": "in-progress",
      "phase": 2,
      "priority": "critical"
    },
    "ROAD-002": {
      "id": "ROAD-002",
      "title": "Deploy satellite imagery verification for all irrigated acreage",
      "status": "planned",
      "phase": 3,
      "priority": "high"
    },
    "ROAD-003": {
      "id": "ROAD-003",
      "title": "Complete Pecos River adjudication hydrographic survey",
      "status": "in-progress",
      "phase": 2,
      "priority": "critical"
    },
    "ROAD-004": {
      "id": "ROAD-004",
      "title": "Implement real-time well metering telemetry for all high-capacity wells",
      "status": "planned",
      "phase": 3,
      "priority": "high"
    },
    "ROAD-005": {
      "id": "ROAD-005",
      "title": "Develop automated compact delivery accounting dashboard",
      "status": "planned",
      "phase": 4,
      "priority": "medium"
    }
  },
  "stats": {
    "totalCapabilities": 12,
    "totalUserTypes": 6,
    "totalStories": 8,
    "totalRoadItems": 5,
    "integrityStatus": "valid",
    "roadsByStatus": {
      "in-progress": 2,
      "planned": 3
    }
  },
  "byCapability": {
    "CAP-001": { "stories": ["US-001"], "roads": ["ROAD-001"] },
    "CAP-002": { "stories": [], "roads": [] },
    "CAP-003": { "stories": ["US-004"], "roads": ["ROAD-003"] },
    "CAP-004": { "stories": ["US-002", "US-003"], "roads": [] },
    "CAP-005": { "stories": ["US-002", "US-004", "US-005"], "roads": ["ROAD-004"] },
    "CAP-006": { "stories": ["US-007"], "roads": ["ROAD-002"] },
    "CAP-007": { "stories": ["US-005", "US-006"], "roads": ["ROAD-005"] },
    "CAP-008": { "stories": [], "roads": [] },
    "CAP-009": { "stories": [], "roads": [] },
    "CAP-010": { "stories": ["US-008"], "roads": [] },
    "CAP-011": { "stories": [], "roads": [] },
    "CAP-012": { "stories": [], "roads": ["ROAD-001"] }
  },
  "byUserType": {
    "UT-001": { "stories": ["US-001", "US-008"], "capabilities": ["CAP-001", "CAP-002", "CAP-010"] },
    "UT-002": { "stories": ["US-002"], "capabilities": ["CAP-004", "CAP-005"] },
    "UT-003": { "stories": ["US-003"], "capabilities": ["CAP-004"] },
    "UT-004": { "stories": ["US-004", "US-007"], "capabilities": ["CAP-003", "CAP-005", "CAP-006"] },
    "UT-005": { "stories": ["US-005"], "capabilities": ["CAP-005", "CAP-007"] },
    "UT-006": { "stories": ["US-006"], "capabilities": ["CAP-007"] }
  }
}' > /dev/null
echo "  Governance snapshot ingested (12 capabilities, 6 user types, 8 user stories, 5 road items)"

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
echo "    - 12 bounded contexts (4 core, 5 supporting, 3 generic)"
echo "    -  4 subdomain types (internal, human-process, external-system)"
echo "    - 15 domain events (with cross-context flows)"
echo "    -  4 workflows spanning 3-4 contexts each"
echo "    -  8 aggregates with commands, invariants, and events"
echo "    -  8 value objects (immutable)"
echo "    - 20 glossary terms (Prior Appropriation, Acequia, Mayordomo, etc.)"
echo "    -  1 governance snapshot (12 capabilities, 6 user types, 8 stories, 5 road items)"
echo ""
echo "  Taxonomy:"
echo "    -  4 systems (1 primary OSE + 3 external: USGS, USBR, NM Courts)"
echo "    -  8 subsystems (divisions/bureaus)"
echo "    -  7 stacks (WATERS DB, eFile, GIS, Telemetry, Satellite, Dam Inventory, Compact Accounting)"
echo "    - 18 capabilities (12 capabilityRels)"
echo "    - 15 persons (OSE staff + acequia mayordomo)"
echo "    - 11 teams (9 stream-aligned, 2 platform, 2 complicated-subsystem)"
echo ""
echo "  Domain patterns exercised:"
echo "    - Prior Appropriation doctrine (first in time, first in right)"
echo "    - Acequia community governance (one farmer, one vote)"
echo "    - Interstate compact compliance (Rio Grande, Pecos)"
echo "    - Adjudication process (court-ordered water rights determination)"
echo "    - Water measurement and enforcement lifecycle"
echo "    - Transfer market with impairment protection"
echo ""
echo "  View the landscape at:"
echo "    http://localhost:3002/design/business-domain/landscape"
echo ""
echo "  Model ID for direct API access:"
echo "    curl $API/landscape/$MODEL_ID"
echo ""
