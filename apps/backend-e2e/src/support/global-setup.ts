import { waitForPortOpen } from '@nx/node/utils';
import { TestHelpers } from './test-helpers';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up e2e tests...\n');

  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  
  // Wait for the backend server to be ready
  console.log(`Waiting for server at ${host}:${port}...`);
  await waitForPortOpen(port, { host });
  
  // Clean the database before running tests
  console.log('Cleaning test database...');
  await TestHelpers.cleanDatabase();
  
  console.log('E2E test setup completed!\n');

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down e2e tests...\n';
};
