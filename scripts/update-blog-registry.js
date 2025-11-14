#!/usr/bin/env node
/**
 * Blog Registry Update Script for TextExpense Frontend
 *
 * Usage: node scripts/update-blog-registry.js [blog-slug]
 * Example: node scripts/update-blog-registry.js receipt-management-tips-small-business
 *
 * This script updates the blog registry (frontend/data/blog-registry.json)
 * with metadata from a blog post's JSON data file.
 *
 * Can be run:
 * 1. Automatically after generate-blog.js
 * 2. Manually to update/add blog posts to registry
 */

const fs = require('fs');
const path = require('path');

// Get slug from command line argument
const slug = process.argv[2];

if (!slug) {
  console.error('❌ Error: Blog slug is required');
  console.error('');
  console.error('Usage: node scripts/update-blog-registry.js [blog-slug]');
  console.error('Example: node scripts/update-blog-registry.js receipt-management-tips-small-business');
  console.error('');
  process.exit(1);
}

// Load registry
const registryPath = path.join(__dirname, '../frontend/data/blog-registry.json');
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

// Load blog data
const dataPath = path.join(__dirname, '../frontend/data/blog', `${slug}.json`);
if (!fs.existsSync(dataPath)) {
  console.error(`❌ Error: Blog data not found: ${dataPath}`);
  process.exit(1);
}

let blogData;
try {
  blogData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
} catch (error) {
  console.error('❌ Error: Failed to parse blog data JSON');
  console.error(error.message);
  process.exit(1);
}

// Check if blog already exists in registry
const existingIndex = registry.posts.findIndex(p => p.slug === slug);
const isUpdate = existingIndex !== -1;

// Extract title from TITLE or ARTICLE_TITLE field
const title = blogData.ARTICLE_TITLE || blogData.TITLE.split('|')[0].trim();

// Parse category from blog data
const category = blogData.category || 'general';

// Parse tags from TAGS or KEYWORDS field
let tags = [];
if (blogData.TAGS) {
  tags = Array.isArray(blogData.TAGS) ? blogData.TAGS : blogData.TAGS.split(',').map(t => t.trim());
} else if (blogData.KEYWORDS) {
  tags = blogData.KEYWORDS.split(',').map(t => t.trim()).slice(0, 5); // First 5 keywords
}

// Create or update entry
const now = new Date().toISOString().split('T')[0];
const entry = {
  slug: slug,
  title: title,
  category: category,
  url: `/blog/${slug}`,
  author: blogData.AUTHOR_NAME || 'TextExpense Team',
  publishDate: blogData.publishDate || now,
  lastModified: now,
  readingTime: blogData.READING_TIME || '5',
  excerpt: (blogData.META_DESCRIPTION || '').substring(0, 160),
  tags: tags,
  status: blogData.status || 'published',
  templateVersion: blogData.templateVersion || 'v1'
};

// Update or add entry
if (isUpdate) {
  console.log(`📝 Updating existing blog entry: ${slug}`);
  // Preserve original publish date on updates
  entry.publishDate = registry.posts[existingIndex].publishDate;
  registry.posts[existingIndex] = entry;
} else {
  console.log(`➕ Adding new blog entry: ${slug}`);
  registry.posts.push(entry);
}

// Update category counts
registry.categories = {};
registry.posts.forEach(post => {
  if (!registry.categories[post.category]) {
    registry.categories[post.category] = 0;
  }
  registry.categories[post.category]++;
});

// Update metadata
registry.totalPosts = registry.posts.length;
registry.lastUpdated = new Date().toISOString();

// Sort posts by publish date (newest first)
registry.posts.sort((a, b) => b.publishDate.localeCompare(a.publishDate));

// Write updated registry
try {
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
  console.log('✅ Blog registry updated successfully');
  console.log('');
  console.log('📊 Registry Stats:');
  console.log(`  Total Posts: ${registry.totalPosts}`);
  console.log(`  Categories:`);
  Object.entries(registry.categories).forEach(([cat, count]) => {
    console.log(`    - ${cat}: ${count}`);
  });
  console.log('');
  console.log('📄 Entry Details:');
  console.log(`  Slug: ${entry.slug}`);
  console.log(`  Title: ${entry.title}`);
  console.log(`  Author: ${entry.author}`);
  console.log(`  Category: ${entry.category}`);
  console.log(`  URL: ${entry.url}`);
  console.log(`  Published: ${entry.publishDate}`);
  console.log(`  Modified: ${entry.lastModified}`);
  console.log(`  Reading Time: ${entry.readingTime} min`);
  console.log(`  Status: ${entry.status}`);
} catch (error) {
  console.error('❌ Error: Failed to write registry');
  console.error(error.message);
  process.exit(1);
}
