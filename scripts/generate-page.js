#!/usr/bin/env node
/**
 * Universal Page Generator for TextExpense Frontend
 *
 * Usage: node scripts/generate-page.js [page-slug]
 * Example: node scripts/generate-page.js freelance-expense-tracker
 *
 * This script:
 * 1. Loads page data from frontend/data/pages/[slug].json
 * 2. Loads the landing template
 * 3. Replaces all {{PLACEHOLDER}} values with data
 * 4. Writes the generated HTML to frontend/pages/[slug].html
 * 5. Auto-updates the pages registry
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get slug from command line argument
const slug = process.argv[2];

if (!slug) {
  console.error('❌ Error: Page slug is required');
  console.error('');
  console.error('Usage: node scripts/generate-page.js [page-slug]');
  console.error('Example: node scripts/generate-page.js freelance-expense-tracker');
  console.error('');
  process.exit(1);
}

// Validate slug format (lowercase, hyphens only)
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error('❌ Error: Invalid slug format');
  console.error('Slug must contain only lowercase letters, numbers, and hyphens');
  console.error(`Got: ${slug}`);
  process.exit(1);
}

// Load page data
const dataPath = path.join(__dirname, '../frontend/data/pages', `${slug}.json`);
if (!fs.existsSync(dataPath)) {
  console.error(`❌ Error: Data file not found`);
  console.error(`Expected: ${dataPath}`);
  console.error('');
  console.error('Please create the JSON data file first.');
  console.error('See frontend/data/pages/ for examples.');
  process.exit(1);
}

console.log(`📖 Reading data from: ${dataPath}`);
let pageData;
try {
  pageData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
} catch (error) {
  console.error('❌ Error: Failed to parse JSON data file');
  console.error(error.message);
  process.exit(1);
}

// Validate required fields
const requiredFields = ['TITLE', 'META_DESCRIPTION', 'HERO_TITLE', 'MAIN_CONTENT', 'CTA_URL'];
const missingFields = requiredFields.filter(field => !pageData[field]);
if (missingFields.length > 0) {
  console.error('❌ Error: Missing required fields in JSON data:');
  missingFields.forEach(field => console.error(`  - ${field}`));
  process.exit(1);
}

// Load template
const templatePath = path.join(__dirname, '../frontend/templates/landing-template.html');
if (!fs.existsSync(templatePath)) {
  console.error(`❌ Error: Template not found: ${templatePath}`);
  process.exit(1);
}

console.log(`📄 Loading template: ${templatePath}`);
const template = fs.readFileSync(templatePath, 'utf-8');

// Replace placeholders
console.log('🔄 Replacing placeholders...');
let html = template;
let replacementCount = 0;

for (const [key, value] of Object.entries(pageData)) {
  const placeholder = `{{${key}}}`;
  if (html.includes(placeholder)) {
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = (html.match(regex) || []).length;
    html = html.replace(regex, value);
    replacementCount += matches;
    console.log(`  ✓ ${key}: ${matches} replacement(s)`);
  }
}

console.log(`✅ Replaced ${replacementCount} placeholder(s)`);

// Check for unreplaced placeholders
const unreplacedPlaceholders = html.match(/\{\{[A-Z_]+\}\}/g);
if (unreplacedPlaceholders) {
  console.warn('⚠️  Warning: Found unreplaced placeholders:');
  const uniquePlaceholders = [...new Set(unreplacedPlaceholders)];
  uniquePlaceholders.forEach(p => console.warn(`  - ${p}`));
  console.warn('These will appear as-is in the generated page.');
}

// Write output
const outputPath = path.join(__dirname, '../frontend/pages', `${slug}.html`);
fs.writeFileSync(outputPath, html, 'utf-8');

const sizeKB = (html.length / 1024).toFixed(2);
console.log('');
console.log('✅ Page generated successfully!');
console.log(`📄 File: frontend/pages/${slug}.html`);
console.log(`📊 Size: ${sizeKB} KB`);
console.log(`🔗 URL: /pages/${slug}`);

// Auto-update registry
console.log('');
console.log('📋 Updating pages registry...');
try {
  execSync(`node "${path.join(__dirname, 'update-registry.js')}" "${slug}"`, {
    stdio: 'inherit'
  });
} catch (error) {
  console.warn('⚠️  Warning: Failed to update registry automatically');
  console.warn('Please run: node scripts/update-registry.js manually');
}

console.log('');
console.log('🎉 Done! Next steps:');
console.log('1. Validate the generated page in a browser');
console.log('2. Check mobile responsiveness');
console.log('3. Verify all CTAs link to WhatsApp');
console.log('4. Commit and push to deploy');
