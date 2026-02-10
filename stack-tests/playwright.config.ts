import { defineConfig } from '@playwright/test';
import { defineBddProject, cucumberReporter } from 'playwright-bdd';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localEnvPath = path.resolve(__dirname, '.env');
const rootEnvPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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
