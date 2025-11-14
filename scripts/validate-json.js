#!/usr/bin/env node
/**
 * JSON Data Validation Script
 *
 * Usage: node scripts/validate-json.js <type> <slug>
 * Example: node scripts/validate-json.js page freelance-expense-tracker
 * Example: node scripts/validate-json.js blog receipt-management-tips
 *
 * Validates JSON data file before generation:
 * - Required fields present
 * - CTA URL format correct
 * - Category valid
 * - No hardcoded colors in content
 * - No em units in content
 * - No nested sections in content
 */

const fs = require('fs');
const path = require('path');

const type = process.argv[2]; // 'page' or 'blog'
const slug = process.argv[3];

if (!type || !slug) {
  console.error('Usage: node scripts/validate-json.js <type> <slug>');
  console.error('Example: node scripts/validate-json.js page freelance-expense-tracker');
  console.error('Example: node scripts/validate-json.js blog receipt-management-tips');
  process.exit(1);
}

if (type !== 'page' && type !== 'blog') {
  console.error('❌ Error: Type must be "page" or "blog"');
  process.exit(1);
}

// Determine file path
const jsonPath = type === 'page'
  ? path.join(__dirname, `../frontend/data/pages/${slug}.json`)
  : path.join(__dirname, `../frontend/data/blog/${slug}.json`);

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ Error: File not found: ${jsonPath}`);
  process.exit(1);
}

console.log(`🔍 Validating ${type} JSON: ${slug}`);
console.log(`📄 File: ${jsonPath}\n`);

let data;
try {
  data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
} catch (error) {
  console.error('❌ FAIL: Invalid JSON syntax');
  console.error(error.message);
  process.exit(1);
}

let errorCount = 0;
let warningCount = 0;

// Define required fields
const requiredFieldsPage = ['TITLE', 'META_DESCRIPTION', 'HERO_TITLE', 'MAIN_CONTENT', 'CTA_URL'];
const requiredFieldsBlog = ['TITLE', 'META_DESCRIPTION', 'ARTICLE_TITLE', 'ARTICLE_CONTENT', 'AUTHOR_NAME', 'PUBLISH_DATE', 'CTA_URL'];
const requiredFields = type === 'page' ? requiredFieldsPage : requiredFieldsBlog;

// Define valid categories
const validCategoriesPage = ['freelancer', 'receipt-scanner', 'receipt-management', 'text-sms', 'consultant', 'general'];

// Check 1: Required fields
console.log('1️⃣  Checking required fields...');
const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
if (missingFields.length > 0) {
  console.error(`   ❌ FAIL: Missing ${missingFields.length} required field(s):`);
  missingFields.forEach(field => console.error(`      - ${field}`));
  errorCount++;
} else {
  console.log(`   ✅ PASS: All ${requiredFields.length} required fields present`);
}

// Check 2: CTA URL format
console.log('\n2️⃣  Checking CTA URL format...');
const correctCTA = 'https://wa.me/17654792054?text=hi';
if (data.CTA_URL !== correctCTA) {
  console.error('   ❌ FAIL: Incorrect CTA URL');
  console.error(`      Got:      ${data.CTA_URL}`);
  console.error(`      Expected: ${correctCTA}`);
  errorCount++;
} else {
  console.log('   ✅ PASS: CTA URL correct');
}

// Check 3: Category (for pages only)
if (type === 'page') {
  console.log('\n3️⃣  Checking category...');
  if (data.category && !validCategoriesPage.includes(data.category)) {
    console.warn('   ⚠️  WARNING: Category not in standard list');
    console.warn(`      Got: ${data.category}`);
    console.warn(`      Valid: ${validCategoriesPage.join(', ')}`);
    warningCount++;
  } else if (data.category) {
    console.log(`   ✅ PASS: Category "${data.category}" is valid`);
  } else {
    console.warn('   ⚠️  WARNING: No category specified (will default to "general")');
    warningCount++;
  }
}

// Check 4: Slug matches filename
console.log('\n4️⃣  Checking slug matches filename...');
if (data.slug && data.slug !== slug) {
  console.error('   ❌ FAIL: Slug mismatch');
  console.error(`      Filename: ${slug}`);
  console.error(`      Slug in JSON: ${data.slug}`);
  errorCount++;
} else if (data.slug) {
  console.log('   ✅ PASS: Slug matches filename');
} else {
  console.warn('   ⚠️  WARNING: No slug field in JSON');
  warningCount++;
}

// Check 5: Content field checks (hardcoded colors, em units, nested sections)
console.log('\n5️⃣  Checking content for common issues...');
const contentField = type === 'page' ? data.MAIN_CONTENT : data.ARTICLE_CONTENT;

if (contentField) {
  // Check for hardcoded colors
  const hardcodedColors = contentField.match(/(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})/g);
  if (hardcodedColors && hardcodedColors.length > 0) {
    console.error(`   ❌ FAIL: Found ${hardcodedColors.length} hardcoded color(s) in content:`);
    const uniqueColors = [...new Set(hardcodedColors)];
    uniqueColors.forEach(c => console.error(`      - ${c} (use var(--primary) etc.)`));
    errorCount++;
  } else {
    console.log('   ✅ PASS: No hardcoded colors in content');
  }

  // Check for em units
  const emUnits = contentField.match(/font-size:\s*[\d.]+em(?!d)/gi);
  if (emUnits && emUnits.length > 0) {
    console.error(`   ❌ FAIL: Found ${emUnits.length} em unit(s) in content:`);
    emUnits.slice(0, 3).forEach(e => console.error(`      - ${e} (use rem instead)`));
    if (emUnits.length > 3) {
      console.error(`      ... and ${emUnits.length - 3} more`);
    }
    errorCount++;
  } else {
    console.log('   ✅ PASS: No em units in content');
  }

  // Check for nested sections
  const sectionMatches = contentField.match(/<section[^>]*>/gi);
  if (sectionMatches && sectionMatches.length > 0) {
    console.error(`   ❌ FAIL: Found ${sectionMatches.length} <section> tag(s) in content`);
    console.error('      Use <div> instead - template already wraps content in <section>');
    errorCount++;
  } else {
    console.log('   ✅ PASS: No nested sections in content');
  }
} else {
  console.warn('   ⚠️  WARNING: Content field is empty or missing');
  warningCount++;
}

// Check 6: Footer CTA URLs (if present)
if (data.FOOTER_CTA_URL || data.FOOTER_CTA_TEXT) {
  console.log('\n6️⃣  Checking footer CTA...');
  if (data.FOOTER_CTA_URL && data.FOOTER_CTA_URL !== correctCTA) {
    console.error('   ❌ FAIL: Incorrect footer CTA URL');
    console.error(`      Got:      ${data.FOOTER_CTA_URL}`);
    console.error(`      Expected: ${correctCTA}`);
    errorCount++;
  } else {
    console.log('   ✅ PASS: Footer CTA URL correct');
  }
}

// Check 7: Blog-specific checks
if (type === 'blog') {
  console.log('\n7️⃣  Checking blog-specific fields...');

  // Author name should not be empty
  if (!data.AUTHOR_NAME || data.AUTHOR_NAME.trim() === '') {
    console.error('   ❌ FAIL: AUTHOR_NAME is required for blog posts');
    errorCount++;
  }

  // Reading time should be a number
  if (data.READING_TIME && isNaN(parseInt(data.READING_TIME))) {
    console.warn('   ⚠️  WARNING: READING_TIME should be a number (minutes)');
    warningCount++;
  }

  // Publish date format check
  if (data.publishDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.publishDate)) {
    console.warn('   ⚠️  WARNING: publishDate should be in YYYY-MM-DD format');
    console.warn(`      Got: ${data.publishDate}`);
    warningCount++;
  }

  if (errorCount === 0 && warningCount === 0) {
    console.log('   ✅ PASS: All blog-specific fields valid');
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(60));

if (errorCount === 0 && warningCount === 0) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\nYour JSON is ready for generation! 🚀');
  console.log(`\nNext step: node scripts/generate-${type}.js ${slug}`);
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
    console.log('1. Fix all errors in your JSON file');
    console.log('2. Run this validator again');
    console.log('3. Generate content once validation passes');
  }
  if (warningCount > 0) {
    console.log('- Review warnings (may be acceptable)');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}
