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
const nodeVersion = readFileSync('.nvmrc', 'utf8').trim();

if (nodeVersion !== '24.21.0' || packageJson.engines?.node !== '24.21.0') {
  console.error('Node.js must remain pinned to 24.21.0 in .nvmrc and package.json');
  process.exit(1);
}

if (packageJson.packageManager !== 'pnpm@11.28.0') {
  console.error('packageManager must remain pinned to pnpm@11.28.0');
  process.exit(1);
}

console.log('Trailbook workspace baseline is valid.');
