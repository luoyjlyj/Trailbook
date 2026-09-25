import { existsSync, readFileSync } from 'node:fs';

const requiredPaths = [
  'apps/mobile',
  'apps/admin',
  'apps/api',
  'packages/contracts',
  'packages/database',
  'packages/planner',
  'packages/providers',
  'packages/ui',
  'packages/config',
];
const missing = requiredPaths.filter((path) => !existsSync(path));

if (missing.length > 0) {
  console.error(`Missing workspace directories: ${missing.join(', ')}`);
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
if (packageJson.packageManager !== 'pnpm@11.19.0') {
  console.error('packageManager must remain pinned to pnpm@11.19.0');
  process.exit(1);
}

console.log('Trailbook workspace baseline is valid.');
