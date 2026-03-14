#!/usr/bin/env node
/**
 * Governance Linter
 * Validates that all documentation follows the governance state machine rules
 * 
 * Usage:
 *   ./scripts/governance-linter.js ROAD-005
 *   ./scripts/governance-linter.js --all-roads
 *   ./scripts/governance-linter.js --changelog
 *   ./scripts/governance-linter.js --adrs
 *   ./scripts/governance-linter.js --ci
 *   ./scripts/governance-linter.js --format=json ROAD-005
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

// Configuration - use __dirname for paths since script is in docs/scripts/
const DOCS_DIR = path.join(__dirname, '..');
const VALID_ROAD_STATUSES = [
  'proposed',
  'adr_validated',
  'bdd_pending',
  'bdd_complete',
  'implementing',
  'nfr_validating',
  'nfr_blocked',
  'complete'
];

const VALID_ADR_STATUSES = ['proposed', 'accepted', 'deprecated', 'superseded'];
const VALID_NFR_TYPES = ['performance', 'security', 'accessibility'];

const VALID_CAPABILITY_IDS = [
  'CAP-001', 'CAP-002', 'CAP-003', 'CAP-004',
  'CAP-005', 'CAP-006', 'CAP-007', 'CAP-008'
];

const VALID_USER_STORY_IDS = [
  'US-001', 'US-002', 'US-004'
];

const VALID_USE_CASE_IDS = [
  'UC-001', 'UC-002', 'UC-003', 'UC-010', 'UC-011',
  'UC-012', 'UC-013', 'UC-014', 'UC-020', 'UC-021'
];

const VALID_USER_TYPE_IDS = [
  'UT-001', 'UT-002', 'UT-003', 'UT-004', 'UT-005'
];

const VALID_USER_TYPE_TYPES = ['human', 'bot', 'system', 'external_api'];
const VALID_USER_TYPE_STATUSES = ['draft', 'approved', 'deprecated'];
const VALID_USER_TYPE_ARCHETYPES = ['creator', 'operator', 'administrator', 'consumer', 'integrator'];

const STATE_MACHINE_TRANSITIONS = {
  'proposed': ['adr_validated'],
  'adr_validated': ['bdd_pending'],
  'bdd_pending': ['bdd_complete'],
  'bdd_complete': ['implementing'],
  'implementing': ['nfr_validating'],
  'nfr_validating': ['complete'],
  'complete': []
};

// ── Universal Contribution Lifecycle ───────────────────────────────────────
const VALID_CONTRIBUTION_STATUSES = [
  'draft', 'proposed', 'rejected', 'accepted', 'deprecated', 'superseded'
];

const CONTRIBUTION_TRANSITIONS = {
  'draft':      ['proposed'],
  'proposed':   ['accepted', 'rejected', 'draft'],
  'rejected':   ['draft'],
  'accepted':   ['deprecated', 'superseded'],
  'deprecated': ['draft'],
  'superseded': []   // terminal state
};

// Results tracking
const results = {
  errors: [],
  warnings: [],
  passed: [],
  total: 0
};

// Parse command line arguments
const args = process.argv.slice(2);
const format = args.includes('--format=json') ? 'json' : 'human';
const ci = args.includes('--ci');
const allRoads = args.includes('--all-roads');
const checkChanges = args.includes('--changes');
const checkAdrs = args.includes('--adrs');
const targetRoad = args.find(arg => arg.startsWith('ROAD-'));
const targetCapability = args.find(arg => arg.startsWith('CAP-'));
const targetUserStory = args.find(arg => arg.startsWith('US-'));
const targetUserType = args.find(arg => arg.startsWith('UT-'));
const checkCapabilities = args.includes('--capabilities');
const checkUserStories = args.includes('--user-stories');
const checkUserTypes = args.includes('--user-types');

/**
 * Extract front matter from markdown content
 */
function extractFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  try {
    return yaml.load(match[1]);
  } catch (e) {
    return { error: e.message };
  }
}

/**
 * Validate the universal contribution block in frontmatter.
 * Returns { errors, warnings } arrays.
 * If no contribution block is present, returns empty arrays (optional for now).
 */
function validateContributionBlock(filePath, frontMatter) {
  const errors = [];
  const warnings = [];

  const contrib = frontMatter.contribution;
  if (!contrib) {
    errors.push('Missing required field: contribution (universal contribution lifecycle block)');
    return { errors, warnings };
  }

  // Validate status
  if (contrib.status && !VALID_CONTRIBUTION_STATUSES.includes(contrib.status)) {
    errors.push(`Invalid contribution.status: ${contrib.status} (expected: ${VALID_CONTRIBUTION_STATUSES.join(', ')})`);
  }

  // Validate version
  if (contrib.version !== undefined) {
    if (!Number.isInteger(contrib.version) || contrib.version < 1) {
      errors.push(`contribution.version must be a positive integer, got: ${contrib.version}`);
    }
  }

  // Validate supersedes/superseded_by format (ITEM-ID@vN)
  const versionRefPattern = /^[A-Z]+-\d+@v\d+$/;
  if (contrib.supersedes && !versionRefPattern.test(contrib.supersedes)) {
    errors.push(`Invalid contribution.supersedes format: ${contrib.supersedes} (expected ITEM-ID@vN)`);
  }
  if (contrib.superseded_by && !versionRefPattern.test(contrib.superseded_by)) {
    errors.push(`Invalid contribution.superseded_by format: ${contrib.superseded_by} (expected ITEM-ID@vN)`);
  }

  // Validate timestamps are ISO-8601 date strings
  const dateFields = ['submitted_at', 'reviewed_at', 'created_at', 'updated_at'];
  for (const field of dateFields) {
    if (contrib[field] && isNaN(Date.parse(contrib[field]))) {
      errors.push(`contribution.${field} must be a valid ISO-8601 date, got: ${contrib[field]}`);
    }
  }

  // Validate submitted_by is present when status is proposed or later
  if (contrib.status === 'proposed' && !contrib.submitted_by) {
    warnings.push('contribution.submitted_by should be set when status is proposed');
  }
  if (contrib.status === 'proposed' && !contrib.submitted_at) {
    warnings.push('contribution.submitted_at should be set when status is proposed');
  }

  // Validate reviewed_by is present when status is accepted or rejected
  if ((contrib.status === 'accepted' || contrib.status === 'rejected') && !contrib.reviewed_by) {
    warnings.push('contribution.reviewed_by should be set when status is accepted or rejected');
  }
  if ((contrib.status === 'accepted' || contrib.status === 'rejected') && !contrib.reviewed_at) {
    warnings.push('contribution.reviewed_at should be set when status is accepted or rejected');
  }

  // Validate review_feedback is present on rejection
  if (contrib.status === 'rejected' && !contrib.review_feedback) {
    warnings.push('contribution.review_feedback should explain the rejection reason');
  }

  // Validate superseded state has superseded_by
  if (contrib.status === 'superseded' && !contrib.superseded_by) {
    errors.push('contribution.superseded_by is required when status is superseded');
  }

  // Validate type-specific status is only meaningful when contribution is accepted
  if (contrib.status && contrib.status !== 'accepted' && frontMatter.status) {
    warnings.push(`Type-specific status (${frontMatter.status}) is only meaningful when contribution.status is accepted (currently: ${contrib.status})`);
  }

  return { errors, warnings };
}

/**
 * Validate a contribution state transition
 */
function validateContributionTransition(filePath, frontMatter, previousContributionStatus) {
  const errors = [];

  if (!previousContributionStatus) return { errors };

  const currentStatus = frontMatter.contribution?.status;
  if (!currentStatus) return { errors };

  const validNextStates = CONTRIBUTION_TRANSITIONS[previousContributionStatus] || [];

  if (currentStatus !== previousContributionStatus && !validNextStates.includes(currentStatus)) {
    errors.push(`Invalid contribution state transition: ${previousContributionStatus} → ${currentStatus}`);
  }

  return { errors };
}

/**
 * Validate ROAD item front matter
 */
function validateRoadFrontMatter(filePath, frontMatter) {
  const errors = [];
  const warnings = [];
  
  // Required fields
  if (!frontMatter.id) errors.push('Missing required field: id');
  if (!frontMatter.title) errors.push('Missing required field: title');
  if (!frontMatter.status) errors.push('Missing required field: status');
  if (!frontMatter.governance) errors.push('Missing required field: governance');
  
  // Validate ID format
  if (frontMatter.id && !frontMatter.id.match(/^ROAD-\d+$/)) {
    errors.push(`Invalid id format: ${frontMatter.id} (expected ROAD-XXX)`);
  }
  
  // Validate status
  if (frontMatter.status && !VALID_ROAD_STATUSES.includes(frontMatter.status)) {
    errors.push(`Invalid status: ${frontMatter.status}`);
  }
  
  // Validate governance structure
  if (frontMatter.governance) {
    // ADR validation
    if (frontMatter.governance.adrs) {
      if (frontMatter.governance.adrs.validated === undefined) {
        warnings.push('governance.adrs.validated not specified');
      }
      if (frontMatter.governance.adrs.validated && !frontMatter.governance.adrs.validated_by) {
        warnings.push('governance.adrs.validated is true but validated_by is missing');
      }
    } else {
      errors.push('Missing governance.adrs section');
    }
    
    // BDD validation
    if (frontMatter.governance.bdd) {
      if (frontMatter.status !== 'proposed' && frontMatter.status !== 'adr_validated') {
        if (!frontMatter.governance.bdd.id) {
          errors.push('BDD id required when status is bdd_pending or later');
        }
        if (frontMatter.status !== 'bdd_pending' && !frontMatter.governance.bdd.status) {
          errors.push('BDD status required when status is bdd_complete or later');
        }
      }
    } else if (frontMatter.status !== 'proposed' && frontMatter.status !== 'adr_validated') {
      errors.push('Missing governance.bdd section required for this status');
    }
    
    // NFR validation
    if (frontMatter.governance.nfrs) {
      if (!Array.isArray(frontMatter.governance.nfrs.applicable)) {
        errors.push('governance.nfrs.applicable must be an array');
      }
      if (frontMatter.status === 'nfr_validating' || frontMatter.status === 'complete') {
        if (!frontMatter.governance.nfrs.results) {
          errors.push('governance.nfrs.results required when status is nfr_validating or complete');
        }
        if (frontMatter.status === 'complete' && frontMatter.governance.nfrs.status !== 'pass') {
          errors.push('All NFRs must pass before status can be complete');
        }
      }
    } else if (frontMatter.status === 'nfr_validating' || frontMatter.status === 'complete') {
      errors.push('Missing governance.nfrs section required for this status');
    }
    
    // NEW: Validate capabilities or NFRs present (Requirement: at least one capability OR non-compliant NFR)
    const hasCapabilities = frontMatter.governance.capabilities &&
      Array.isArray(frontMatter.governance.capabilities) &&
      frontMatter.governance.capabilities.length > 0;
    
    const hasApplicableNFRs = frontMatter.governance.nfrs &&
      Array.isArray(frontMatter.governance.nfrs.applicable) &&
      frontMatter.governance.nfrs.applicable.length > 0;
    
    const hasFailingNFRs = frontMatter.governance.nfrs &&
      frontMatter.governance.nfrs.status === 'fail';
    
    if (!hasCapabilities && !hasApplicableNFRs && !hasFailingNFRs) {
      errors.push('ROAD item must have at least one capability OR non-compliant NFR');
    }
    
    // Validate capability references
    if (hasCapabilities) {
      for (const cap of frontMatter.governance.capabilities) {
        if (!cap.match(/^CAP-\d+$/)) {
          errors.push(`Invalid capability reference: ${cap}`);
        }
        // Check capability file exists
        const capFile = findCapabilityFile(cap);
        if (!capFile) {
          errors.push(`Referenced capability file not found: ${cap}`);
        }
      }
    }
  }
  
  return { errors, warnings };
}

/**
 * Validate state machine transitions
 */
function validateStateMachine(filePath, frontMatter, previousState) {
  const errors = [];
  
  if (!previousState) return { errors }; // No previous state to validate against
  
  const currentStatus = frontMatter.status;
  const validNextStates = STATE_MACHINE_TRANSITIONS[previousState] || [];
  
  if (currentStatus !== previousState && !validNextStates.includes(currentStatus)) {
    errors.push(`Invalid state transition: ${previousState} → ${currentStatus}`);
  }
  
  // Check gate requirements
  if (currentStatus === 'bdd_pending' || currentStatus === 'bdd_complete' || 
      currentStatus === 'implementing' || currentStatus === 'nfr_validating' || 
      currentStatus === 'complete') {
    if (!frontMatter.governance?.adrs?.validated) {
      errors.push(`ADR validation required before ${currentStatus}`);
    }
  }
  
  if ((currentStatus === 'implementing' || currentStatus === 'nfr_validating' || 
       currentStatus === 'complete') && frontMatter.governance?.bdd?.status !== 'approved') {
    errors.push('BDD approval required before implementing');
  }
  
  if (currentStatus === 'complete') {
    if (frontMatter.governance?.nfrs?.status !== 'pass') {
      errors.push('All NFRs must pass before complete');
    }
    
    // Check all applicable NFRs have passed
    const applicableNfrs = frontMatter.governance?.nfrs?.applicable || [];
    const nfrResults = frontMatter.governance?.nfrs?.results || {};
    
    for (const nfrId of applicableNfrs) {
      if (!nfrResults[nfrId] || nfrResults[nfrId].status !== 'pass') {
        errors.push(`NFR ${nfrId} must pass before complete`);
      }
    }
  }
  
  return { errors };
}

/**
 * Validate CHANGE entry front matter
 */
function validateChangeFrontMatter(filePath, frontMatter) {
  const errors = [];
  const warnings = [];
  
  // Required fields
  if (!frontMatter.id) errors.push('Missing required field: id');
  if (!frontMatter.road_id) errors.push('Missing required field: road_id');
  if (!frontMatter.status) errors.push('Missing required field: status');
  
  // Validate ID format
  if (frontMatter.id && !frontMatter.id.match(/^CHANGE-\d+$/)) {
    errors.push(`Invalid id format: ${frontMatter.id} (expected CHANGE-XXX)`);
  }
  
  // Validate road_id format
  if (frontMatter.road_id && !frontMatter.road_id.match(/^ROAD-\d+$/)) {
    errors.push(`Invalid road_id format: ${frontMatter.road_id}`);
  }
  
  // Check if referenced ROAD exists and is complete
  if (frontMatter.road_id) {
    const roadFile = findRoadFile(frontMatter.road_id);
    if (!roadFile) {
      errors.push(`Referenced ROAD item not found: ${frontMatter.road_id}`);
    } else {
      const roadContent = fs.readFileSync(roadFile, 'utf8');
      const roadFm = extractFrontMatter(roadContent);
      if (roadFm && roadFm.status !== 'complete') {
        errors.push(`Referenced ROAD item is not complete: ${frontMatter.road_id} (status: ${roadFm.status})`);
      }
    }
  }
  
  // Validate signatures for published changes
  if (frontMatter.status === 'published') {
    if (!frontMatter.signatures || !Array.isArray(frontMatter.signatures)) {
      errors.push('Published CHANGE entries must have signatures array');
    } else {
      const requiredAgents = [
        '@arch-inspector',
        '@bdd-writer',
        '@bdd-runner',
        '@code-writer',
        '@performance-agent',
        '@security-agent',
        '@a11y-agent'
      ];
      
      for (const agent of requiredAgents) {
        const signature = frontMatter.signatures.find(s => s.agent === agent);
        if (!signature) {
          errors.push(`Missing signature from ${agent}`);
        } else if (signature.status !== 'approved') {
          errors.push(`${agent} signature status must be 'approved'`);
        }
      }
    }
  }
  
  return { errors, warnings };
}

/**
 * Validate ADR file front matter
 */
function validateAdrFrontMatter(filePath, frontMatter) {
  const errors = [];
  const warnings = [];
  
  // Required fields
  if (!frontMatter.id) errors.push('Missing required field: id');
  if (!frontMatter.title) errors.push('Missing required field: title');
  if (!frontMatter.status) errors.push('Missing required field: status');
  if (!frontMatter.category) errors.push('Missing required field: category');
  
  // Validate ID format
  if (frontMatter.id && !frontMatter.id.match(/^ADR-\d+$/)) {
    errors.push(`Invalid id format: ${frontMatter.id} (expected ADR-XXX)`);
  }
  
  // Validate status
  if (frontMatter.status && !VALID_ADR_STATUSES.includes(frontMatter.status)) {
    errors.push(`Invalid status: ${frontMatter.status}`);
  }
  
  return { errors, warnings };
}

/**
 * Validate NFR file front matter
 */
function validateNfrFrontMatter(filePath, frontMatter) {
  const errors = [];
  const warnings = [];
  
  // Required fields
  if (!frontMatter.id) errors.push('Missing required field: id');
  if (!frontMatter.type) errors.push('Missing required field: type');
  
  // Validate ID format
  if (frontMatter.id && !frontMatter.id.match(/^NFR-[A-Z]+-\d+$/)) {
    errors.push(`Invalid id format: ${frontMatter.id} (expected NFR-TYPE-XXX)`);
  }
  
  // Validate type
  if (frontMatter.type && !VALID_NFR_TYPES.includes(frontMatter.type)) {
    errors.push(`Invalid type: ${frontMatter.type}`);
  }
  
  return { errors, warnings };
}

/**
 * Find ROAD file by ID
 */
function findRoadFile(roadId) {
  const files = glob.sync(path.join(DOCS_DIR, '**/*.md'));
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const fm = extractFrontMatter(content);
    if (fm && fm.id === roadId) {
      return file;
    }
  }
  return null;
}

/**
 * Find CAP-XXX capability file
 */
function findCapabilityFile(capId) {
  const files = glob.sync(path.join(DOCS_DIR, 'capabilities/*.md'));
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const fm = extractFrontMatter(content);
    if (fm && fm.id === capId) {
      return file;
    }
  }
  return null;
}

/**
 * Find US-XXX user story file
 */
function findUserStoryFile(usId) {
  const files = glob.sync(path.join(DOCS_DIR, 'user-stories/*.md'));
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const fm = extractFrontMatter(content);
    if (fm && fm.id === usId) {
      return file;
    }
  }
  return null;
}

/**
 * Validate CAP-XXX capability file front matter
 */
function validateCapabilityFrontMatter(filePath, frontMatter) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!frontMatter.id) errors.push('Missing required field: id');
  if (!frontMatter.title) errors.push('Missing required field: title');
  if (!frontMatter.category) errors.push('Missing required field: category');
  if (!frontMatter.tag) errors.push('Missing required field: tag');

  // Validate ID format
  if (frontMatter.id && !frontMatter.id.match(/^CAP-\d+$/)) {
    errors.push(`Invalid id format: ${frontMatter.id} (expected CAP-XXX)`);
  }

  // Validate tag format
  if (frontMatter.tag && !frontMatter.tag.match(/^@CAP-\d+$/)) {
    errors.push(`Invalid tag format: ${frontMatter.tag} (expected @CAP-XXX)`);
  }

  // Validate category
  const validCategories = ['Security', 'Observability', 'Communication', 'Business'];
  if (frontMatter.category && !validCategories.includes(frontMatter.category)) {
    warnings.push(`Unusual category: ${frontMatter.category}`);
  }

  return { errors, warnings };
}

/**
 * Find UT-XXX user type file
 */
function findUserTypeFile(userTypeId) {
  const files = glob.sync(path.join(DOCS_DIR, 'user-types/UT-*.md'));
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const fm = extractFrontMatter(content);
    if (fm && fm.id === userTypeId) {
      return file;
    }
  }
  return null;
}

/**
 * Validate UT-XXX user type file front matter
 */
function validateUserTypeFrontMatter(filePath, frontMatter) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!frontMatter.id) errors.push('Missing required field: id');
  if (!frontMatter.name) errors.push('Missing required field: name');
  if (!frontMatter.tag) errors.push('Missing required field: tag');
  if (!frontMatter.type) errors.push('Missing required field: type');
  if (!frontMatter.status) errors.push('Missing required field: status');
  if (!frontMatter.archetype) errors.push('Missing required field: archetype');

  // Validate ID format
  if (frontMatter.id && !frontMatter.id.match(/^UT-\d+$/)) {
    errors.push(`Invalid id format: ${frontMatter.id} (expected UT-XXX)`);
  }

  // Validate tag format
  if (frontMatter.tag && !frontMatter.tag.match(/^@UT-\d+$/)) {
    errors.push(`Invalid tag format: ${frontMatter.tag} (expected @UT-XXX)`);
  }

  // Validate type
  if (frontMatter.type && !VALID_USER_TYPE_TYPES.includes(frontMatter.type)) {
    errors.push(`Invalid type: ${frontMatter.type} (expected: ${VALID_USER_TYPE_TYPES.join(', ')})`);
  }

  // Validate status
  if (frontMatter.status && !VALID_USER_TYPE_STATUSES.includes(frontMatter.status)) {
    errors.push(`Invalid status: ${frontMatter.status} (expected: ${VALID_USER_TYPE_STATUSES.join(', ')})`);
  }

  // Validate archetype
  if (frontMatter.archetype && !VALID_USER_TYPE_ARCHETYPES.includes(frontMatter.archetype)) {
    errors.push(`Invalid archetype: ${frontMatter.archetype} (expected: ${VALID_USER_TYPE_ARCHETYPES.join(', ')})`);
  }

  // Validate typical_capabilities if present
  if (frontMatter.typical_capabilities) {
    if (!Array.isArray(frontMatter.typical_capabilities)) {
      errors.push('typical_capabilities must be an array');
    } else {
      for (const cap of frontMatter.typical_capabilities) {
        if (!cap.match(/^CAP-\d+$/)) {
          errors.push(`Invalid capability reference: ${cap}`);
        }
      }
    }
  }

  // Validate related_stories if present
  if (frontMatter.related_stories) {
    if (!Array.isArray(frontMatter.related_stories)) {
      errors.push('related_stories must be an array');
    } else {
      for (const story of frontMatter.related_stories) {
        const storyStr = String(story);
        if (!storyStr.match(/^US-\d+$/)) {
          errors.push(`Invalid story reference: ${storyStr}`);
        }
      }
    }
  }

  // Validate related_user_types if present
  if (frontMatter.related_user_types) {
    if (!Array.isArray(frontMatter.related_user_types)) {
      errors.push('related_user_types must be an array');
    } else {
      for (const userType of frontMatter.related_user_types) {
        const userTypeStr = String(userType);
        if (!userTypeStr.match(/^UT-\d+$/)) {
          errors.push(`Invalid user type reference: ${userTypeStr}`);
        }
      }
    }
  }

  return { errors, warnings };
}

/**
 * Validate US-XXX user story file front matter
 */
function validateUserStoryFrontMatter(filePath, frontMatter) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!frontMatter.id) errors.push('Missing required field: id');
  if (!frontMatter.title) errors.push('Missing required field: title');
  if (!frontMatter.user_type) errors.push('Missing required field: user_type');
  if (!frontMatter.status) errors.push('Missing required field: status');
  if (!frontMatter.capabilities) errors.push('Missing required field: capabilities');

  // Validate ID format
  if (frontMatter.id && !frontMatter.id.match(/^US-\d+$/)) {
    errors.push(`Invalid id format: ${frontMatter.id} (expected US-XXX)`);
  }

  // Validate user_type reference
  if (frontMatter.user_type) {
    if (!frontMatter.user_type.match(/^UT-\d+$/)) {
      errors.push(`Invalid user_type format: ${frontMatter.user_type} (expected UT-XXX)`);
    } else if (!VALID_USER_TYPE_IDS.includes(frontMatter.user_type)) {
      errors.push(`Unknown user_type: ${frontMatter.user_type}`);
    } else {
      // Check user type file exists and is not deprecated
      const userTypeFile = findUserTypeFile(frontMatter.user_type);
      if (!userTypeFile) {
        errors.push(`Referenced user type file not found: ${frontMatter.user_type}`);
      } else {
        const userTypeContent = fs.readFileSync(userTypeFile, 'utf8');
        const userTypeFm = extractFrontMatter(userTypeContent);
        if (userTypeFm && userTypeFm.status === 'deprecated') {
          warnings.push(`Referenced user type is deprecated: ${frontMatter.user_type}`);
        }
      }
    }
  }

  // Validate capabilities array
  if (frontMatter.capabilities) {
    if (!Array.isArray(frontMatter.capabilities)) {
      errors.push('capabilities must be an array');
    } else {
      for (const cap of frontMatter.capabilities) {
        if (!cap.match(/^CAP-\d+$/)) {
          errors.push(`Invalid capability reference: ${cap}`);
        } else if (!VALID_CAPABILITY_IDS.includes(cap)) {
          errors.push(`Unknown capability: ${cap}`);
        }
      }
    }
  }

  // Validate use_cases if present
  if (frontMatter.use_cases) {
    if (!Array.isArray(frontMatter.use_cases)) {
      errors.push('use_cases must be an array');
    } else {
      for (const uc of frontMatter.use_cases) {
        if (!uc.match(/^UC-\d+$/)) {
          errors.push(`Invalid use case reference: ${uc}`);
        }
      }
    }
  }

  return { errors, warnings };
}

/**
 * Lint a single ROAD item
 */
function lintRoadItem(roadId) {
  const roadFile = findRoadFile(roadId);
  
  if (!roadFile) {
    results.errors.push({
      file: null,
      roadId,
      message: `ROAD item not found: ${roadId}`
    });
    return;
  }
  
  const content = fs.readFileSync(roadFile, 'utf8');
  const frontMatter = extractFrontMatter(content);
  
  if (!frontMatter) {
    results.errors.push({
      file: roadFile,
      roadId,
      message: 'No front matter found'
    });
    return;
  }
  
  if (frontMatter.error) {
    results.errors.push({
      file: roadFile,
      roadId,
      message: `Invalid YAML: ${frontMatter.error}`
    });
    return;
  }
  
  results.total++;
  
  // Validate front matter
  const fmValidation = validateRoadFrontMatter(roadFile, frontMatter);
  
  // Validate universal contribution block
  const contribValidation = validateContributionBlock(roadFile, frontMatter);
  fmValidation.errors.push(...contribValidation.errors);
  fmValidation.warnings.push(...contribValidation.warnings);
  
  for (const error of fmValidation.errors) {
    results.errors.push({
      file: roadFile,
      roadId,
      message: error,
      severity: 'error'
    });
  }
  
  for (const warning of fmValidation.warnings) {
    results.warnings.push({
      file: roadFile,
      roadId,
      message: warning,
      severity: 'warning'
    });
  }
  
  // Validate state machine (we'd need to track previous state from git history)
  // For now, just validate current state gates
  const stateValidation = validateStateMachine(roadFile, frontMatter, null);
  
  for (const error of stateValidation.errors) {
    results.errors.push({
      file: roadFile,
      roadId,
      message: error,
      severity: 'error'
    });
  }
  
  if (fmValidation.errors.length === 0 && stateValidation.errors.length === 0) {
    results.passed.push({
      file: roadFile,
      roadId,
      message: 'All validations passed'
    });
  }
}

/**
 * Lint all ROAD items
 */
function lintAllRoads() {
  const files = glob.sync(path.join(DOCS_DIR, 'roads/*.md'));
  
  for (const file of files) {
    // Skip template and index files
    const basename = path.basename(file);
    if (basename === 'ROAD-TEMPLATE.md' || basename === 'index.md') {
      continue;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    const frontMatter = extractFrontMatter(content);
    
    if (frontMatter && frontMatter.id && frontMatter.id.startsWith('ROAD-')) {
      lintRoadItem(frontMatter.id);
    }
  }
}

/**
 * Lint individual CHANGE files
 */
function lintChangeFiles() {
  const changesDir = path.join(DOCS_DIR, 'changes');
  
  if (!fs.existsSync(changesDir)) {
    results.errors.push({
      file: changesDir,
      message: 'docs/changes/ directory not found'
    });
    return;
  }
  
  const changeFiles = glob.sync(path.join(changesDir, 'CHANGE-*.md'));
  
  for (const file of changeFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const frontMatter = extractFrontMatter(content);
    const changeId = path.basename(file, '.md');
    
    results.total++;
    
    if (!frontMatter) {
      results.errors.push({
        file,
        changeId,
        message: 'No front matter found'
      });
      continue;
    }
    
    if (frontMatter.error) {
      results.errors.push({
        file,
        changeId,
        message: `Invalid YAML: ${frontMatter.error}`
      });
      continue;
    }
    
    // Validate required fields
    const requiredFields = ['id', 'road_id', 'title', 'date', 'version', 'status', 'categories'];
    for (const field of requiredFields) {
      if (!frontMatter[field]) {
        results.errors.push({
          file,
          changeId,
          message: `Missing required field: ${field}`
        });
      }
    }
    
    // Validate compliance section
    if (!frontMatter.compliance) {
      results.errors.push({
        file,
        changeId,
        message: 'Missing compliance section'
      });
    } else {
      const requiredCompliance = ['adr_check', 'bdd_check', 'nfr_checks'];
      for (const check of requiredCompliance) {
        if (!frontMatter.compliance[check]) {
          results.errors.push({
            file,
            changeId,
            message: `Missing compliance check: ${check}`
          });
        }
      }
    }
    
    // Check for published status - must have signatures
    if (frontMatter.status === 'published') {
      if (!frontMatter.signatures || frontMatter.signatures.length === 0) {
        results.errors.push({
          file,
          changeId,
          message: 'Published changes must have at least one signature'
        });
      }
    }
    
    results.passed.push({
      file,
      changeId,
      message: 'CHANGE file validated'
    });
  }
}

/**
 * Lint ADR files
 */
function lintAdrs() {
  const adrFiles = glob.sync(path.join(DOCS_DIR, 'adr/adr-*.md'));
  
  for (const file of adrFiles) {
    if (path.basename(file) === 'README.md') continue;
    // Skip template files
    if (path.basename(file).includes('TEMPLATE')) continue;
    
    const content = fs.readFileSync(file, 'utf8');
    const frontMatter = extractFrontMatter(content);
    
    if (!frontMatter) {
      results.errors.push({
        file,
        message: 'No front matter found'
      });
      continue;
    }
    
    if (frontMatter.error) {
      results.errors.push({
        file,
        message: `Invalid YAML: ${frontMatter.error}`
      });
      continue;
    }
    
    results.total++;
    
    const validation = validateAdrFrontMatter(file, frontMatter);
    
    // Validate universal contribution block
    const contribValidation = validateContributionBlock(file, frontMatter);
    validation.errors.push(...contribValidation.errors);
    validation.warnings.push(...contribValidation.warnings);
    
    for (const error of validation.errors) {
      results.errors.push({
        file,
        adrId: frontMatter.id,
        message: error,
        severity: 'error'
      });
    }
    
    for (const warning of validation.warnings) {
      results.warnings.push({
        file,
        adrId: frontMatter.id,
        message: warning,
        severity: 'warning'
      });
    }
    
    if (validation.errors.length === 0) {
      results.passed.push({
        file,
        adrId: frontMatter.id,
        message: 'All validations passed'
      });
    }
  }
}

/**
 * Lint all capability files
 */
function lintCapabilities() {
  const capFiles = glob.sync(path.join(DOCS_DIR, 'capabilities/CAP-*.md'));

  for (const file of capFiles) {
    if (path.basename(file) === 'index.md') continue;

    const content = fs.readFileSync(file, 'utf8');
    const frontMatter = extractFrontMatter(content);

    if (!frontMatter) {
      results.errors.push({
        file,
        message: 'No front matter found'
      });
      continue;
    }

    if (frontMatter.error) {
      results.errors.push({
        file,
        message: `Invalid YAML: ${frontMatter.error}`
      });
      continue;
    }

    results.total++;

    const validation = validateCapabilityFrontMatter(file, frontMatter);

    // Validate universal contribution block
    const contribValidation = validateContributionBlock(file, frontMatter);
    validation.errors.push(...contribValidation.errors);
    validation.warnings.push(...contribValidation.warnings);

    for (const error of validation.errors) {
      results.errors.push({
        file,
        capId: frontMatter.id,
        message: error,
        severity: 'error'
      });
    }

    for (const warning of validation.warnings) {
      results.warnings.push({
        file,
        capId: frontMatter.id,
        message: warning,
        severity: 'warning'
      });
    }

    if (validation.errors.length === 0) {
      results.passed.push({
        file,
        capId: frontMatter.id,
        message: 'All validations passed'
      });
    }
  }
}

/**
 * Lint all user story files
 */
function lintUserStories() {
  const usFiles = glob.sync(path.join(DOCS_DIR, 'user-stories/US-*.md'));

  for (const file of usFiles) {
    if (path.basename(file) === 'index.md') continue;

    const content = fs.readFileSync(file, 'utf8');
    const frontMatter = extractFrontMatter(content);

    if (!frontMatter) {
      results.errors.push({
        file,
        message: 'No front matter found'
      });
      continue;
    }

    if (frontMatter.error) {
      results.errors.push({
        file,
        message: `Invalid YAML: ${frontMatter.error}`
      });
      continue;
    }

    results.total++;

    const validation = validateUserStoryFrontMatter(file, frontMatter);

    // Validate universal contribution block
    const contribValidation = validateContributionBlock(file, frontMatter);
    validation.errors.push(...contribValidation.errors);
    validation.warnings.push(...contribValidation.warnings);

    for (const error of validation.errors) {
      results.errors.push({
        file,
        usId: frontMatter.id,
        message: error,
        severity: 'error'
      });
    }

    for (const warning of validation.warnings) {
      results.warnings.push({
        file,
        usId: frontMatter.id,
        message: warning,
        severity: 'warning'
      });
    }

    if (validation.errors.length === 0) {
      results.passed.push({
        file,
        usId: frontMatter.id,
        message: 'All validations passed'
      });
    }
  }
}

/**
 * Lint all user type files
 */
function lintUserTypes() {
  const userTypeFiles = glob.sync(path.join(DOCS_DIR, 'user-types/UT-*.md'));

  for (const file of userTypeFiles) {
    if (path.basename(file) === 'index.md') continue;

    const content = fs.readFileSync(file, 'utf8');
    const frontMatter = extractFrontMatter(content);

    if (!frontMatter) {
      results.errors.push({
        file,
        message: 'No front matter found'
      });
      continue;
    }

    if (frontMatter.error) {
      results.errors.push({
        file,
        message: `Invalid YAML: ${frontMatter.error}`
      });
      continue;
    }

    results.total++;

    const validation = validateUserTypeFrontMatter(file, frontMatter);

    // Validate universal contribution block
    const contribValidation = validateContributionBlock(file, frontMatter);
    validation.errors.push(...contribValidation.errors);
    validation.warnings.push(...contribValidation.warnings);

    for (const error of validation.errors) {
      results.errors.push({
        file,
        userTypeId: frontMatter.id,
        message: error,
        severity: 'error'
      });
    }

    for (const warning of validation.warnings) {
      results.warnings.push({
        file,
        userTypeId: frontMatter.id,
        message: warning,
        severity: 'warning'
      });
    }

    if (validation.errors.length === 0) {
      results.passed.push({
        file,
        userTypeId: frontMatter.id,
        message: 'All validations passed'
      });
    }
  }
}

/**
 * Generate user-types index.md
 */
function generateUserTypeIndex() {
  const userTypeFiles = glob.sync(path.join(DOCS_DIR, 'user-types/UT-*.md'));
  const userTypes = [];

  for (const file of userTypeFiles) {
    if (path.basename(file) === 'index.md') continue;

    const content = fs.readFileSync(file, 'utf8');
    const frontMatter = extractFrontMatter(content);

    if (frontMatter && frontMatter.id) {
      userTypes.push({
        id: frontMatter.id,
        name: frontMatter.name || 'Unknown',
        type: frontMatter.type || 'unknown',
        archetype: frontMatter.archetype || 'unknown',
        status: frontMatter.status || 'draft',
        tag: frontMatter.tag || `@${frontMatter.id}`,
        description: frontMatter.description || '',
        related_stories: frontMatter.related_stories || [],
        typical_capabilities: frontMatter.typical_capabilities || [],
        file: path.basename(file, '.md')
      });
    }
  }

  // Generate index content
  const generatedAt = new Date().toISOString().split('T')[0];
  const approvedCount = userTypes.filter(p => p.status === 'approved').length;
  const draftCount = userTypes.filter(p => p.status === 'draft').length;
  const deprecatedCount = userTypes.filter(p => p.status === 'deprecated').length;
  const totalStories = userTypes.reduce((sum, p) => sum + (p.related_stories ? p.related_stories.length : 0), 0);

  let indexContent = `---
title: User Types Overview
generated: true
generated_at: "${generatedAt}"
---

# User Types

User types represent the different user types who interact with the ClawMarket platform. Each user type has distinct goals, pain points, and behaviors that inform user story development.

## User Type Matrix

### By Type

| User Type | Name | Type | Archetype | Status | Stories |
|-----------|------|------|-----------|--------|---------|
`;

  // Sort user types by ID
  userTypes.sort((a, b) => a.id.localeCompare(b.id));

  for (const p of userTypes) {
    const storyCount = p.related_stories ? p.related_stories.length : 0;
    indexContent += `| ${p.id} | [${p.name}](./${p.file}) | ${p.type} | ${p.archetype} | ${p.status} | ${storyCount} |\n`;
  }

  indexContent += `
### By Archetype

`;

  // Group by archetype
  const byArchetype = {};
  for (const p of userTypes) {
    if (!byArchetype[p.archetype]) byArchetype[p.archetype] = [];
    byArchetype[p.archetype].push(p);
  }

  for (const [archetype, plist] of Object.entries(byArchetype)) {
    indexContent += `**${archetype.charAt(0).toUpperCase() + archetype.slice(1)}** (${plist.length})\n`;
    for (const p of plist) {
      indexContent += `- [${p.id}: ${p.name}](./${p.file})\n`;
    }
    indexContent += '\n';
  }

  indexContent += `## Summary Statistics

- **Total User Types**: ${userTypes.length}
- **Approved**: ${approvedCount}
- **Draft**: ${draftCount}
- **Deprecated**: ${deprecatedCount}
- **Total Story References**: ${totalStories}

## User Type Relationships

\`\`\`mermaid
graph TB
`;

  // Add user type nodes
  for (const p of userTypes) {
    indexContent += `    ${p.id.replace('-', '')}[${p.id}: ${p.name}]\n`;
  }

  // Add relationships
  for (const p of userTypes) {
    if (p.related_stories && p.related_stories.length > 0) {
      // Could add story relationships here if needed
    }
  }

  indexContent += `\`\`\`

## Story Coverage by User Type

`;

  for (const p of userTypes) {
    indexContent += `### ${p.id}: ${p.name}\n`;
    if (p.related_stories && p.related_stories.length > 0) {
      for (const story of p.related_stories) {
        indexContent += `- ${story}\n`;
      }
    } else {
      indexContent += '- *No stories defined*\n';
    }
    indexContent += '\n';
  }

  indexContent += `## Capability Usage by User Type

| User Type | Primary Capabilities |
|---------|---------------------|
`;

  for (const p of userTypes) {
    const caps = p.typical_capabilities ? p.typical_capabilities.join(', ') : 'None';
    indexContent += `| ${p.id} | ${caps} |\n`;
  }

  indexContent += `
## BDD Tags

Use user type tags in BDD scenarios:

\`\`\`gherkin
@UT-001 @US-001 @CAP-001
Feature: Bot Registration
  As a bot developer
  I want to register my bot
  So that I can participate in the marketplace
\`\`\`

**Available Tags:**
`;

  for (const p of userTypes) {
    indexContent += `- \`${p.tag}\` - ${p.name}\n`;
  }

  indexContent += `
## Creating New User Types

To create a new user type:

1. Create file: \`docs/user-types/UT-XXX-name.md\`
2. Use the user type front matter schema
3. Set status to \`draft\` initially
4. Define related stories and user types
5. Run governance linter to validate
6. Update status to \`approved\` when ready

### Front Matter Schema

\`\`\`yaml
---
id: UT-XXX
name: "User Type Name"
tag: "@UT-XXX"
type: human|bot|system|external_api
status: draft|approved|deprecated
archetype: creator|operator|administrator|consumer|integrator
description: "Brief description"
goals:
  - Goal 1
pain_points:
  - Pain point 1
behaviors:
  - Behavior 1
typical_capabilities:
  - CAP-XXX
technical_profile:
  skill_level: beginner|intermediate|advanced
  integration_type: web_ui|api|sdk|webhook|cli
  frequency: daily|weekly|occasional
related_stories:
  - US-XXX
related_user_types:
  - UT-XXX
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
validated_by: "@agent-name"
---
\`\`\`

## Verification

\`\`\`bash
# Lint all user types
./scripts/governance-linter.js --user-types

# Lint specific user type
./scripts/governance-linter.js UT-001

# Generate coverage report
./scripts/user-type-coverage-report.js

# Run BDD tests for user type
just bdd-tag @UT-001
\`\`\`

---

**Auto-generated**: This index is automatically maintained by the governance linter. Last updated: ${generatedAt}

**Related**: [User Stories](../user-stories/index) • [Capabilities](../capabilities/index) • [Governance Linter](../../scripts/governance-linter.js)
`;

  fs.writeFileSync(path.join(DOCS_DIR, 'user-types/index.md'), indexContent);
  console.log(`✅ Generated user-types/index.md with ${userTypes.length} user types`);
}

/**
 * Output results in human-readable format
 */
function outputHuman() {
  console.log('🔍 Governance Linter');
  console.log('═══════════════════════════════════════════\n');
  
  if (results.errors.length > 0) {
    console.log(`❌ ERRORS (${results.errors.length})`);
    console.log('───────────────────────────────────────────');
    for (const error of results.errors) {
      const file = error.file ? path.relative(process.cwd(), error.file) : 'N/A';
      const id = error.roadId || error.changeId || error.adrId || error.capId || error.usId || error.userTypeId || '';
      console.log(`\n${id ? `[${id}] ` : ''}${file}`);
      console.log(`  ${error.message}`);
    }
    console.log('');
  }
  
  if (results.warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${results.warnings.length})`);
    console.log('───────────────────────────────────────────');
    for (const warning of results.warnings) {
      const file = warning.file ? path.relative(process.cwd(), warning.file) : 'N/A';
      const id = warning.roadId || warning.changeId || warning.adrId || warning.capId || warning.usId || warning.userTypeId || '';
      console.log(`\n${id ? `[${id}] ` : ''}${file}`);
      console.log(`  ${warning.message}`);
    }
    console.log('');
  }
  
  if (results.passed.length > 0) {
    console.log(`✅ PASSED (${results.passed.length})`);
    console.log('───────────────────────────────────────────');
    for (const pass of results.passed) {
      const file = pass.file ? path.relative(process.cwd(), pass.file) : 'N/A';
      const id = pass.roadId || pass.changeId || pass.adrId || pass.capId || pass.usId || pass.userTypeId || '';
      console.log(`  ${id ? `[${id}] ` : ''}${file}`);
    }
    console.log('');
  }
  
  console.log('───────────────────────────────────────────');
  console.log(`Summary: ${results.errors.length} errors, ${results.warnings.length} warnings, ${results.passed.length} passed`);
  console.log(`Total items checked: ${results.total}\n`);
}

/**
 * Output results in JSON format
 */
function outputJson() {
  console.log(JSON.stringify({
    summary: {
      total: results.total,
      errors: results.errors.length,
      warnings: results.warnings.length,
      passed: results.passed.length
    },
    errors: results.errors,
    warnings: results.warnings,
    passed: results.passed
  }, null, 2));
}

/**
 * Main execution
 */
function main() {
  try {
    if (targetRoad) {
      lintRoadItem(targetRoad);
    } else if (targetCapability) {
      console.log(`Linting ${targetCapability}...`);
      lintCapabilities();
    } else if (targetUserStory) {
      console.log(`Linting ${targetUserStory}...`);
      lintUserStories();
    } else if (targetUserType) {
      console.log(`Linting ${targetUserType}...`);
      lintUserTypes();
    } else if (allRoads) {
      lintAllRoads();
    } else if (checkCapabilities) {
      lintCapabilities();
    } else if (checkUserStories) {
      lintUserStories();
    } else if (checkUserTypes) {
      lintUserTypes();
      generateUserTypeIndex();
    } else if (checkChanges) {
      lintChangeFiles();
    } else if (checkAdrs) {
      lintAdrs();
    } else if (ci) {
      // CI mode: check everything
      lintAllRoads();
      lintCapabilities();
      lintUserStories();
      lintUserTypes();
      lintChangeFiles();
      lintAdrs();
    } else {
      console.log('Usage:');
      console.log('  ./scripts/governance-linter.js ROAD-005');
      console.log('  ./scripts/governance-linter.js CAP-001');
      console.log('  ./scripts/governance-linter.js US-001');
      console.log('  ./scripts/governance-linter.js UT-001');
      console.log('  ./scripts/governance-linter.js --all-roads');
      console.log('  ./scripts/governance-linter.js --capabilities');
      console.log('  ./scripts/governance-linter.js --user-stories');
      console.log('  ./scripts/governance-linter.js --user-types');
      console.log('  ./scripts/governance-linter.js --changes');
      console.log('  ./scripts/governance-linter.js --adrs');
      console.log('  ./scripts/governance-linter.js --ci');
      console.log('  ./scripts/governance-linter.js --format=json ROAD-005');
      process.exit(1);
    }
    
    if (format === 'json') {
      outputJson();
    } else {
      outputHuman();
    }
    
    // Exit with error code if there are errors
    if (results.errors.length > 0) {
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Linter error:', error.message);
    process.exit(3);
  }
}

main();
