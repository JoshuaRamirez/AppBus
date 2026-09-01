#!/usr/bin/env node
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || process.env.DRY_RUN === '1';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

try {
  const publishCmd = dryRun ? 'npm publish --dry-run' : 'npm publish';
  console.log(`\nExecuting: ${publishCmd}\n`);
  run(publishCmd);
} catch (err) {
  process.exitCode = err.status || 1;
}
