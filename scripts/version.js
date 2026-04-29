const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Netlify provides COMMIT_REF, locally fall back to git
const sha = (process.env.COMMIT_REF || execSync('git rev-parse HEAD 2>/dev/null || echo "dev"').toString().trim()).slice(0, 7);

// Prefer a git tag if on an exact tag
let version = sha;
try {
  const tag = execSync('git describe --tags --exact-match 2>/dev/null').toString().trim();
  if (tag) version = tag;
} catch {}

fs.writeFileSync(path.join(__dirname, '..', 'version.js'), `window.SL_VERSION='${version}';`);
console.log('Version:', version);
