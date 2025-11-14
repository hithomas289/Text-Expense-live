#!/usr/bin/env node
/**
 * Registry Update Script for TextExpense Frontend
 *
 * Usage: node scripts/update-registry.js [page-slug]
 * Example: node scripts/update-registry.js freelance-expense-tracker
 *
 * This script updates the pages registry (frontend/data/pages-registry.json)
 * with metadata from a page's JSON data file.
 *
 * Can be run:
 * 1. Automatically after generate-page.js
 * 2. Manually to update/add pages to registry
 */

const fs = require('fs');
const path = require('path');

// Get slug from command line argument
const slug = process.argv[2];

if (!slug) {
  console.error('❌ Error: Page slug is required');
  console.error('');
  console.error('Usage: node scripts/update-registry.js [page-slug]');
  console.error('Example: node scripts/update-registry.js freelance-expense-tracker');
  console.error('');
  process.exit(1);
}

// Load registry
const registryPath = path.join(__dirname, '../frontend/data/pages-registry.json');
if (!fs.existsSync(registryPath)) {
  console.error(`❌ Error: Registry not found: ${registryPath}`);
  process.exit(1);
}

let registry;
try {
  registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
} catch (error) {
  console.error('❌ Error: Failed to parse registry JSON');
  console.error(error.message);
  process.exit(1);
}

// Load page data
const dataPath = path.join(__dirname, '../frontend/data/pages', `${slug}.json`);
if (!fs.existsSync(dataPath)) {
  console.error(`❌ Error: Page data not found: ${dataPath}`);
  process.exit(1);
}

let pageData;
try {
  pageData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
} catch (error) {
  console.error('❌ Error: Failed to parse page data JSON');
  console.error(error.message);
  process.exit(1);
}

// Check if page already exists in registry
const existingIndex = registry.pages.findIndex(p => p.slug === slug);
const isUpdate = existingIndex !== -1;

// Extract title from TITLE field (remove everything after |)
const title = pageData.TITLE.split('|')[0].trim();

// Determine category from page data or infer from keywords
let category = pageData.category || 'general';
if (!pageData.category) {
  const keywords = (pageData.KEYWORDS || '').toLowerCase();
  if (keywords.includes('freelance') || keywords.includes('1099') || keywords.includes('self-employed')) {
    category = 'freelancer';
  } else if (keywords.includes('receipt scanner') || keywords.includes('scan receipt')) {
    category = 'receipt-scanner';
  } else if (keywords.includes('receipt management') || keywords.includes('receipt organization')) {
    category = 'receipt-management';
  } else if (keywords.includes('text message') || keywords.includes('sms')) {
    category = 'text-sms';
  } else if (keywords.includes('consultant') || keywords.includes('gig worker')) {
    category = 'consultant';
  }
}

// Parse keywords
const seoKeywords = pageData.KEYWORDS
  ? pageData.KEYWORDS.split(',').map(k => k.trim()).filter(k => k.length > 0)
  : [];

// Create or update entry
const now = new Date().toISOString().split('T')[0];
const entry = {
  slug: slug,
  title: title,
  category: category,
  url: `/pages/${slug}`,
  createdDate: isUpdate ? registry.pages[existingIndex].createdDate : now,
  lastModified: now,
  templateVersion: pageData.templateVersion || 'v1',
  status: pageData.status || 'published',
  seoKeywords: seoKeywords,
  targetAudience: pageData.targetAudience || 'general'
};

// Update or add entry
if (isUpdate) {
  console.log(`📝 Updating existing entry: ${slug}`);
  registry.pages[existingIndex] = entry;
} else {
  console.log(`➕ Adding new entry: ${slug}`);
  registry.pages.push(entry);
}

// Update category counts
registry.categories = {
  freelancer: 0,
  'receipt-scanner': 0,
  'receipt-management': 0,
  'text-sms': 0,
  consultant: 0,
  general: 0
};

registry.pages.forEach(page => {
  if (registry.categories.hasOwnProperty(page.category)) {
    registry.categories[page.category]++;
  } else {
    registry.categories.general++;
  }
});

// Update metadata
registry.totalPages = registry.pages.length;
registry.lastUpdated = new Date().toISOString();

// Sort pages alphabetically by slug
registry.pages.sort((a, b) => a.slug.localeCompare(b.slug));

// Write updated registry
try {
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
  console.log('✅ Registry updated successfully');
  console.log('');
  console.log('📊 Registry Stats:');
  console.log(`  Total Pages: ${registry.totalPages}`);
  console.log(`  Categories:`);
  Object.entries(registry.categories).forEach(([cat, count]) => {
    if (count > 0) {
      console.log(`    - ${cat}: ${count}`);
    }
  });
  console.log('');
  console.log('📄 Entry Details:');
  console.log(`  Slug: ${entry.slug}`);
  console.log(`  Title: ${entry.title}`);
  console.log(`  Category: ${entry.category}`);
  console.log(`  URL: ${entry.url}`);
  console.log(`  Created: ${entry.createdDate}`);
  console.log(`  Modified: ${entry.lastModified}`);
  console.log(`  Template: ${entry.templateVersion}`);
  console.log(`  Status: ${entry.status}`);
} catch (error) {
  console.error('❌ Error: Failed to write registry');
  console.error(error.message);
  process.exit(1);
}
