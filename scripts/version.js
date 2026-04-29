const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read latest version from CHANGELOG (e.g. "## v1.7 — ...")
let changelogVersion = '';
try {
  const changelog = fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), 'utf8');
  const match = changelog.match(/^## (v[\d.]+)/m);
  if (match) changelogVersion = match[1];
} catch {}

// Fallback: git SHA from Netlify env or local git
const sha = (process.env.COMMIT_REF || execSync('git rev-parse HEAD 2>/dev/null || echo "dev"').toString().trim()).slice(0, 7);

const version = changelogVersion || sha;
fs.writeFileSync(path.join(__dirname, '..', 'version.js'), `window.SL_VERSION='${version}';`);
console.log('Version:', version);
