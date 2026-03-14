#!/usr/bin/env node
/**
 * User Type Coverage Report
 * Generates report showing user story coverage by user type
 *
 * Usage:
 *   ./scripts/user-type-coverage-report.js
 *   ./scripts/user-type-coverage-report.js --format=json
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');

// Use __dirname for paths since script is in docs/scripts/
const DOCS_DIR = path.join(__dirname, '..');

// Parse arguments
const args = process.argv.slice(2);
const format = args.includes('--format=json') ? 'json' : 'human';

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
 * Load all user types
 */
function loadUserTypes() {
  const userTypes = [];
  const userTypesDir = path.join(DOCS_DIR, 'user-types');
  
  // Gracefully handle missing directory
  if (!fs.existsSync(userTypesDir)) {
    return userTypes;
  }
  
  const files = glob.sync(path.join(userTypesDir, 'UT-*.md'));

  for (const file of files) {
    if (path.basename(file) === 'index.md') continue;

    const content = fs.readFileSync(file, 'utf8');
    const fm = extractFrontMatter(content);

    if (fm && fm.id) {
      userTypes.push({
        id: fm.id,
        name: fm.name || fm.id,
        tag: fm.tag || `@${fm.id}`,
        type: fm.type || 'unknown',
        archetype: fm.archetype || 'unknown',
        status: fm.status || 'draft',
        description: fm.description || '',
        typical_capabilities: fm.typical_capabilities || [],
        related_stories: fm.related_stories || [],
        related_user_types: fm.related_user_types || []
      });
    }
  }

  return userTypes;
}

/**
 * Load all user stories
 */
function loadUserStories() {
  const stories = [];
  const storiesDir = path.join(DOCS_DIR, 'user-stories');
  
  // Gracefully handle missing directory
  if (!fs.existsSync(storiesDir)) {
    return stories;
  }
  
  const files = glob.sync(path.join(storiesDir, 'US-*.md'));

  for (const file of files) {
    if (path.basename(file) === 'index.md') continue;

    const content = fs.readFileSync(file, 'utf8');
    const fm = extractFrontMatter(content);

    if (fm && fm.id) {
      stories.push({
        id: fm.id,
        title: fm.title || fm.id,
        userType: fm.user_type || null,
        capabilities: fm.capabilities || [],
        use_cases: fm.use_cases || [],
        status: fm.status || 'unknown'
      });
    }
  }

  return stories;
}

/**
 * Generate coverage report
 */
function generateReport() {
  const userTypes = loadUserTypes();
  const stories = loadUserStories();

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalUserTypes: userTypes.length,
      totalStories: stories.length,
      storiesWithUserType: 0,
      storiesWithoutUserType: 0,
      coveragePercent: 0
    },
    userTypes: {}
  };

  // Initialize user type tracking
  for (const userType of userTypes) {
    report.userTypes[userType.id] = {
      name: userType.name,
      tag: userType.tag,
      type: userType.type,
      archetype: userType.archetype,
      status: userType.status,
      storyCount: 0,
      stories: [],
      capabilities: userType.typical_capabilities,
      covered: false
    };
  }

  // Map stories to user types
  for (const story of stories) {
    if (story.userType && report.userTypes[story.userType]) {
      report.userTypes[story.userType].storyCount++;
      report.userTypes[story.userType].stories.push({
        id: story.id,
        title: story.title,
        status: story.status
      });
      report.userTypes[story.userType].covered = true;
      report.summary.storiesWithUserType++;
    } else {
      report.summary.storiesWithoutUserType++;
    }
  }

  // Calculate coverage
  const coveredCount = Object.values(report.userTypes)
    .filter(p => p.covered).length;
  report.summary.coveragePercent = userTypes.length > 0
    ? Math.round((coveredCount / userTypes.length) * 100)
    : 0;

  return report;
}

/**
 * Output in human-readable format
 */
function outputHuman(report) {
  console.log('👥 User Type Coverage Report');
  console.log('═══════════════════════════════════════════\n');

  console.log(`Generated: ${report.generatedAt}`);
  console.log(`Coverage: ${report.summary.coveragePercent}% (${Object.values(report.userTypes).filter(p => p.covered).length}/${report.summary.totalUserTypes} user types have stories)\n`);

  console.log('Summary:');
  console.log(`  Total User Types: ${report.summary.totalUserTypes}`);
  console.log(`  Total Stories: ${report.summary.totalStories}`);
  console.log(`  Stories with User Type: ${report.summary.storiesWithUserType}`);
  console.log(`  Stories without User Type: ${report.summary.storiesWithoutUserType}\n`);

  console.log('User Type Coverage:');
  console.log('───────────────────────────────────────────\n');

  for (const [userTypeId, userTypeData] of Object.entries(report.userTypes)) {
    const status = userTypeData.covered ? '✅' : '❌';
    const stories = userTypeData.storyCount > 0
      ? `${userTypeData.storyCount} stories`
      : 'No story coverage';

    console.log(`${status} ${userTypeId}: ${userTypeData.name}`);
    console.log(`   Tag: ${userTypeData.tag}`);
    console.log(`   Type: ${userTypeData.type} | Archetype: ${userTypeData.archetype}`);
    console.log(`   Status: ${userTypeData.status}`);
    console.log(`   Stories: ${stories}`);

    if (userTypeData.stories.length > 0) {
      console.log('   Story Details:');
      for (const story of userTypeData.stories) {
        console.log(`     - ${story.id}: ${story.title}`);
      }
    }

    if (userTypeData.capabilities.length > 0) {
      console.log(`   Capabilities: ${userTypeData.capabilities.join(', ')}`);
    }

    console.log('');
  }

  // Uncovered user types
  const uncovered = Object.entries(report.userTypes)
    .filter(([_, p]) => !p.covered)
    .map(([id, _]) => id);

  if (uncovered.length > 0) {
    console.log('❌ User Types without Story Coverage:');
    console.log('───────────────────────────────────────────');
    for (const userTypeId of uncovered) {
      const p = report.userTypes[userTypeId];
      console.log(`  ${userTypeId}: ${p.name} (${p.status})`);
    }
    console.log('');
  }

  // Stories without user types
  if (report.summary.storiesWithoutUserType > 0) {
    console.log('⚠️  Stories without User Type Assignment:');
    console.log('───────────────────────────────────────────');
    const stories = loadUserStories().filter(s => !s.userType);
    for (const story of stories) {
      console.log(`  ${story.id}: ${story.title}`);
    }
    console.log('');
  }
}

/**
 * Main
 */
function main() {
  const report = generateReport();

  // Check if we have any data to report on
  if (report.summary.totalUserTypes === 0 && report.summary.totalStories === 0) {
    console.log('📊 User Type Coverage Report');
    console.log('═══════════════════════════════════════════\n');
    console.log('ℹ️  No user types or user stories found');
    console.log('   Add user-types/ and user-stories/ directories when ready\n');
    process.exit(0);
  }

  if (format === 'json') {
    console.log(JSON.stringify(report, null, 2));
  } else {
    outputHuman(report);
  }

  // Exit with error if any user type has no coverage
  const uncoveredCount = Object.values(report.userTypes)
    .filter(p => !p.covered).length;

  if (uncoveredCount > 0 || report.summary.storiesWithoutUserType > 0) {
    process.exit(1);
  }

  process.exit(0);
}

main();
