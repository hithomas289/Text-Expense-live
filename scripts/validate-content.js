#!/usr/bin/env node
/**
 * Content Validation Script
 *
 * Usage: node scripts/validate-content.js <type> <slug>
 * Example: node scripts/validate-content.js page freelance-expense-tracker
 * Example: node scripts/validate-content.js blog receipt-management-tips
 *
 * Validates generated HTML for common issues:
 * - Hardcoded colors (should use CSS variables)
 * - Em units (should use rem)
 * - Wrong CTA URLs
 * - Unreplaced placeholders
 * - Nested sections (in content area)
 */

const fs = require('fs');
const path = require('path');

const type = process.argv[2]; // 'page' or 'blog'
const slug = process.argv[3];

if (!type || !slug) {
  console.error('Usage: node scripts/validate-content.js <type> <slug>');
  console.error('Example: node scripts/validate-content.js page freelance-expense-tracker');
  console.error('Example: node scripts/validate-content.js blog receipt-management-tips');
  process.exit(1);
}

if (type !== 'page' && type !== 'blog') {
  console.error('❌ Error: Type must be "page" or "blog"');
  process.exit(1);
}

// Determine file path
const htmlPath = type === 'page'
  ? path.join(__dirname, `../frontend/pages/${slug}.html`)
  : path.join(__dirname, `../frontend/blog/${slug}.html`);

if (!fs.existsSync(htmlPath)) {
  console.error(`❌ Error: File not found: ${htmlPath}`);
  process.exit(1);
}

console.log(`🔍 Validating ${type}: ${slug}`);
console.log(`📄 File: ${htmlPath}\n`);

const html = fs.readFileSync(htmlPath, 'utf-8');

let errorCount = 0;
let warningCount = 0;

// Check 1: Unreplaced placeholders
console.log('1️⃣  Checking for unreplaced placeholders...');
const placeholders = html.match(/\{\{[A-Z_]+\}\}/g);
if (placeholders && placeholders.length > 0) {
  console.error(`   ❌ FAIL: Found ${placeholders.length} unreplaced placeholder(s):`);
  const uniquePlaceholders = [...new Set(placeholders)];
  uniquePlaceholders.forEach(p => console.error(`      - ${p}`));
  errorCount++;
} else {
  console.log('   ✅ PASS: No unreplaced placeholders');
}

// Check 2: Hardcoded colors (outside <style> block)
console.log('\n2️⃣  Checking for hardcoded colors...');
// Remove <style> blocks first
const htmlWithoutStyle = html.replace(/<style>[\s\S]*?<\/style>/gi, '');
const hardcodedColors = htmlWithoutStyle.match(/(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})/g);
if (hardcodedColors && hardcodedColors.length > 0) {
  console.error(`   ❌ FAIL: Found ${hardcodedColors.length} hardcoded color(s):`);
  const uniqueColors = [...new Set(hardcodedColors)];
  uniqueColors.forEach(c => console.error(`      - ${c} (use CSS variables instead)`));
  errorCount++;
} else {
  console.log('   ✅ PASS: No hardcoded colors (all use CSS variables)');
}

// Check 3: Em units (should use rem)
console.log('\n3️⃣  Checking for em units...');
const emUnits = htmlWithoutStyle.match(/font-size:\s*[\d.]+em(?!d)/gi);
if (emUnits && emUnits.length > 0) {
  console.error(`   ❌ FAIL: Found ${emUnits.length} em unit(s):`);
  emUnits.slice(0, 5).forEach(e => console.error(`      - ${e} (use rem instead)`));
  if (emUnits.length > 5) {
    console.error(`      ... and ${emUnits.length - 5} more`);
  }
  errorCount++;
} else {
  console.log('   ✅ PASS: No em units (all use rem)');
}

// Check 4: CTA URLs
console.log('\n4️⃣  Checking CTA URLs...');
const correctCTA = 'https://wa.me/17654792054?text=hi';
const ctaUrls = html.match(/https:\/\/wa\.me\/[^\s"')]+/gi);
if (ctaUrls) {
  const wrongCTAs = ctaUrls.filter(url => url !== correctCTA);
  if (wrongCTAs.length > 0) {
    console.error(`   ❌ FAIL: Found ${wrongCTAs.length} incorrect CTA URL(s):`);
    const uniqueWrong = [...new Set(wrongCTAs)];
    uniqueWrong.forEach(url => console.error(`      - ${url}`));
    console.error(`      Expected: ${correctCTA}`);
    errorCount++;
  } else {
    console.log(`   ✅ PASS: All ${ctaUrls.length} CTA URLs correct`);
  }
} else {
  console.warn('   ⚠️  WARNING: No CTA URLs found');
  warningCount++;
}

// Check 5: Nested sections (in content area)
console.log('\n5️⃣  Checking for nested sections...');
// Extract content between <!-- CONTENT PLACEHOLDER --> and footer
const contentMatch = html.match(/<!-- CONTENT PLACEHOLDER[\s\S]*?<section class="footer-cta">/i);
if (contentMatch) {
  const contentArea = contentMatch[0];
  const nestedSections = contentArea.match(/<section[^>]*>/gi);
  if (nestedSections && nestedSections.length > 1) {
    // More than 1 means nested (the wrapping section + nested ones)
    console.error(`   ❌ FAIL: Found ${nestedSections.length - 1} nested section(s) in content`);
    console.error('      Use <div> instead of <section> in MAIN_CONTENT');
    errorCount++;
  } else {
    console.log('   ✅ PASS: No nested sections');
  }
} else {
  console.log('   ℹ️  INFO: Could not parse content area for section check');
}

// Check 6: File size
console.log('\n6️⃣  Checking file size...');
const sizeKB = (html.length / 1024).toFixed(2);
const expectedMin = type === 'page' ? 20 : 20;
const expectedMax = type === 'page' ? 35 : 30;
if (parseFloat(sizeKB) < expectedMin) {
  console.warn(`   ⚠️  WARNING: File size ${sizeKB} KB is smaller than expected (${expectedMin}-${expectedMax} KB)`);
  warningCount++;
} else if (parseFloat(sizeKB) > expectedMax) {
  console.warn(`   ⚠️  WARNING: File size ${sizeKB} KB is larger than expected (${expectedMin}-${expectedMax} KB)`);
  warningCount++;
} else {
  console.log(`   ✅ PASS: File size ${sizeKB} KB is within expected range (${expectedMin}-${expectedMax} KB)`);
}

// Check 7: Required meta tags
console.log('\n7️⃣  Checking required meta tags...');
const requiredTags = [
  '<title>',
  '<meta name="description"',
  '<meta property="og:title"',
  '<meta property="og:description"',
  '<link rel="canonical"'
];
const missingTags = requiredTags.filter(tag => !html.includes(tag));
if (missingTags.length > 0) {
  console.error(`   ❌ FAIL: Missing ${missingTags.length} required meta tag(s):`);
  missingTags.forEach(tag => console.error(`      - ${tag}`));
  errorCount++;
} else {
  console.log('   ✅ PASS: All required meta tags present');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(60));

if (errorCount === 0 && warningCount === 0) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\nYour content is ready to commit! 🚀');
  process.exit(0);
} else {
  if (errorCount > 0) {
    console.error(`\n❌ ERRORS: ${errorCount}`);
  }
  if (warningCount > 0) {
    console.warn(`⚠️  WARNINGS: ${warningCount}`);
  }

  console.log('\n📋 Next Steps:');
  if (errorCount > 0) {
    console.log('1. Fix all errors listed above');
    console.log('2. Regenerate the content if needed');
    console.log('3. Run this validator again');
  }
  if (warningCount > 0) {
    console.log('- Review warnings (may be acceptable)');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}
