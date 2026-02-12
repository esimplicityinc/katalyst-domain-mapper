import { createBdd } from 'playwright-bdd';
import { test } from './fixtures.js';

const { Then } = createBdd(test);

// Custom step for accepting multiple status codes
Then('the response status should be one of:', async ({ world }, dataTable) => {
  const expectedStatuses = dataTable.raw().map((row: string[]) => parseInt(row[0], 10));
  const actualStatus = world.lastResponse?.status();
  
  if (!expectedStatuses.includes(actualStatus)) {
    throw new Error(
      `Expected status to be one of ${expectedStatuses.join(', ')}, but got ${actualStatus}`
    );
  }
});

// Custom step for waiting N seconds
Then('I wait for {int} seconds', async ({}, seconds: number) => {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
});
