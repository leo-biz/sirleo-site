const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read latest version from CHANGELOG (e.g. "## v2.0 — ...")
let changelogVersion = '';
try {
  const changelog = fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), 'utf8');
  const match = changelog.match(/^## (v[\d.]+)/m);
  if (match) changelogVersion = match[1];
} catch {}

const sha = (process.env.COMMIT_REF || execSync('git rev-parse HEAD 2>/dev/null || echo "dev"').toString().trim()).slice(0, 7);
const version = changelogVersion || sha;
fs.writeFileSync(path.join(__dirname, '..', 'version.js'), `window.SL_VERSION='${version}';`);
console.log('Version:', version);

// Write Stripe publishable key from env (never hardcoded in source)
const stripePk = process.env.STRIPE_PUBLISHABLE_KEY || '';
fs.writeFileSync(path.join(__dirname, '..', 'stripe-config.js'), `window.SL_STRIPE_PK='${stripePk}';`);
console.log('Stripe PK:', stripePk ? '✓ set' : '(not set — add STRIPE_PUBLISHABLE_KEY env var)');
