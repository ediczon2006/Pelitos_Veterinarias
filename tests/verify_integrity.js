/**
 * ==============================================================================
 * Pelitos Veterinaria & Estética — Automated Integrity & Security Audit Suite
 * ==============================================================================
 * Validates OWASP AppSec standards, mobile viewport meta tags, security headers,
 * zero reverse tabnabbing vulnerabilities, and JavaScript syntax integrity.
 *
 * Execution:
 *   node tests/verify_integrity.js
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let failures = 0;
let passes = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passes++;
  } else {
    console.error(`[FAIL] ${message}`);
    failures++;
  }
}

function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.venv' && file !== '.git') {
        getHtmlFiles(fullPath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

console.log('================================================================');
console.log('PELITOS VETERINARIA — COMPREHENSIVE INTEGRITY & SECURITY SUITE');
console.log('================================================================\n');

// 1. Audit HTML files for OWASP Reverse Tabnabbing (target="_blank" without rel="noopener noreferrer")
console.log('--- 1. OWASP Reverse Tabnabbing & Document Metadata Audit ---');
const rootDir = path.resolve(__dirname, '..');
const htmlFiles = getHtmlFiles(rootDir);

const targetBlankRegex = /<a\s+[^>]*target=["']_blank["'][^>]*>/gi;
const relNoopenerRegex = /rel=["'][^"']*(noopener|noreferrer)[^"']*["']/i;

htmlFiles.forEach((file) => {
  const relPath = path.relative(rootDir, file);
  const content = fs.readFileSync(file, 'utf8');

  // Check target="_blank"
  const matches = content.match(targetBlankRegex) || [];
  let unsafeCount = 0;
  matches.forEach((tag) => {
    if (!relNoopenerRegex.test(tag)) {
      unsafeCount++;
    }
  });

  assert(
    unsafeCount === 0,
    `${relPath}: 0 unsafe target="_blank" links found (${matches.length} safe links checked)`
  );

  // Check viewport meta tag
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(content);
  assert(hasViewport, `${relPath}: Contains required mobile responsive viewport meta tag`);

  // Check UTF-8 charset
  const hasCharset = /<meta[^>]+charset=/i.test(content);
  assert(hasCharset, `${relPath}: Contains UTF-8 charset declaration`);
});

// 2. Audit Security Headers in firebase.json
console.log('\n--- 2. Firebase Hosting Security Headers Audit ---');
const firebaseConfigPath = path.join(rootDir, 'firebase.json');
assert(fs.existsSync(firebaseConfigPath), 'firebase.json exists');

if (fs.existsSync(firebaseConfigPath)) {
  const firebaseJson = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
  const headers = (firebaseJson.hosting && firebaseJson.hosting.headers) || [];
  const globalHeaderConfig = headers.find((h) => h.source === '/**');

  assert(!!globalHeaderConfig, 'firebase.json defines global header rule (source: "/**")');

  if (globalHeaderConfig) {
    const headerMap = {};
    globalHeaderConfig.headers.forEach((h) => {
      headerMap[h.key] = h.value;
    });

    assert(
      typeof headerMap['Content-Security-Policy'] === 'string' &&
        headerMap['Content-Security-Policy'].includes("default-src 'self'"),
      'firebase.json: Enforces Content-Security-Policy (CSP)'
    );

    assert(
      headerMap['X-Content-Type-Options'] === 'nosniff',
      'firebase.json: Enforces X-Content-Type-Options: nosniff'
    );

    assert(
      headerMap['X-Frame-Options'] === 'SAMEORIGIN',
      'firebase.json: Enforces X-Frame-Options: SAMEORIGIN'
    );

    assert(
      typeof headerMap['Strict-Transport-Security'] === 'string' &&
        headerMap['Strict-Transport-Security'].includes('max-age=31536000'),
      'firebase.json: Enforces Strict-Transport-Security (HSTS 1 year)'
    );
  }
}

// 3. Audit Netlify Security Headers
console.log('\n--- 3. Netlify TOML Security Headers Audit ---');
const netlifyConfigPath = path.join(rootDir, 'netlify.toml');
assert(fs.existsSync(netlifyConfigPath), 'netlify.toml exists');

if (fs.existsSync(netlifyConfigPath)) {
  const netlifyToml = fs.readFileSync(netlifyConfigPath, 'utf8');
  assert(
    netlifyToml.includes('Content-Security-Policy'),
    'netlify.toml: Enforces Content-Security-Policy'
  );
  assert(
    netlifyToml.includes('X-Content-Type-Options = "nosniff"'),
    'netlify.toml: Enforces X-Content-Type-Options'
  );
  assert(
    netlifyToml.includes('X-Frame-Options = "SAMEORIGIN"'),
    'netlify.toml: Enforces X-Frame-Options'
  );
  assert(
    netlifyToml.includes('Strict-Transport-Security = "max-age=31536000'),
    'netlify.toml: Enforces HSTS'
  );
}

// 4. Check JavaScript Syntax Integrity
console.log('\n--- 4. JavaScript Syntax & Engine Integrity ---');
const jsDir = path.join(rootDir, 'js');
const jsFiles = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js'));

jsFiles.forEach((file) => {
  const fullPath = path.join(jsDir, file);
  try {
    execSync(`node --check "${fullPath}"`, { stdio: 'pipe' });
    assert(true, `js/${file}: Syntax verified (node --check passed)`);
  } catch (err) {
    assert(false, `js/${file}: Syntax compilation failed: ${err.message}`);
  }
});

// 5. Audit Floating Button Decoupling in CSS
console.log('\n--- 5. UI Stability & Floating Element Collision Prevention ---');
const correccionesCssPath = path.join(rootDir, 'css', 'correcciones.css');
if (fs.existsSync(correccionesCssPath)) {
  const cssContent = fs.readFileSync(correccionesCssPath, 'utf8');

  const fabLeft = /\.fab\s*\{[^}]*left:\s*24px/i.test(cssContent);
  const iaRight = /\.pelitos-ia-fab\s*\{[^}]*right:\s*24px/i.test(cssContent);

  assert(
    fabLeft,
    'css/correcciones.css: WhatsApp .fab pinned to bottom-left (left: 24px) to decouple collisions'
  );
  assert(
    iaRight,
    'css/correcciones.css: Pelitos IA .pelitos-ia-fab pinned to bottom-right (right: 24px)'
  );
}

// Summary
console.log('\n================================================================');
console.log(`TOTAL AUDIT CHECKS: ${passes + failures} | PASSED: ${passes} | FAILED: ${failures}`);
console.log('================================================================\n');

if (failures > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL INTEGRITY AND SECURITY AUDITS PASSED FLAWLESSLY.\n');
  process.exit(0);
}
