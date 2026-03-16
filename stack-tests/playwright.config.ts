import { defineConfig } from '@playwright/test';
import { defineBddProject, cucumberReporter } from 'playwright-bdd';
import { resolveWorkers } from '@esimplicity/stack-tests';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localEnvPath = path.resolve(__dirname, '.env');
const rootEnvPath = path.resolve(__dirname, '..', '.env');

// Load root .env first (shared ports: FRONTEND_PORT, API_PORT)
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}
// Then load local .env (fills in URLs not already set by process env).
// Does NOT override process env vars so callers like `just bdd-api` can
// target alternative environments (e.g. prod Docker on port 8090).
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}

// Build URLs from explicit FRONTEND_URL/API_BASE_URL or fall back to root .env ports.
// Use 127.0.0.1 (not localhost) to avoid IPv6 ::1 resolution failures with Docker.
const apiPort = process.env.API_PORT || '3001';
const frontendPort = process.env.FRONTEND_PORT || '3000';
const API_BASE_URL = process.env.API_BASE_URL || `http://127.0.0.1:${apiPort}`;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://127.0.0.1:${frontendPort}`;

const apiBdd = defineBddProject({
  name: 'api',
  features: 'features/api/**/*.feature',
  steps: 'features/steps/**/*.ts',
  tags: '@api and not @wip',
});

const uiBdd = defineBddProject({
  name: 'ui',
  features: 'features/ui/**/*.feature',
  steps: 'features/steps/**/*.ts',
  tags: '@ui and not @wip',
});

const hybridBdd = defineBddProject({
  name: 'hybrid',
  features: 'features/hybrid/**/*.feature',
  steps: 'features/steps/**/*.ts',
  tags: '@hybrid and not @wip',
});

export default defineConfig({
  reporter: [
    cucumberReporter('html', { outputFile: 'cucumber-report/index.html' }),
    cucumberReporter('json', { outputFile: 'cucumber-report/report.json' }),
  ],
  workers: resolveWorkers({ defaultWorkers: 1 }),
  projects: [
    {
      ...apiBdd,
      use: {
        baseURL: API_BASE_URL,
      },
    },
    {
      ...uiBdd,
      use: {
        baseURL: FRONTEND_URL,
      },
    },
    {
      ...hybridBdd,
      use: {
        baseURL: FRONTEND_URL,
      },
    },
  ],
  use: {
    headless: process.env.HEADLESS === 'false' ? false : true,
    trace: 'on-first-retry',
  },
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
});
