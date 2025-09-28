import { killPort } from '@nx/node/utils';
import { TestHelpers } from './test-helpers';
/* eslint-disable */

module.exports = async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  
  console.log('Cleaning up test database...');
  await TestHelpers.cleanDatabase();
  await TestHelpers.disconnect();
  
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await killPort(port);
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
