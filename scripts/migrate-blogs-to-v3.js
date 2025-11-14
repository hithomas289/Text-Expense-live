#!/usr/bin/env node
/**
 * Migrate blogs to V3 format (efficiency improvements)
 * - Remove fields now in defaults
 * - Convert RELATED_POSTS HTML to relatedPosts array
 */

const fs = require('fs');
const path = require('path');

// Blogs to migrate (ones with RELATED_POSTS HTML)
const blogsToMigrate = [
  'how-to-track-expenses',
  'how-to-organize-receipts',
  'how-to-organize-receipts-for-taxes',
  'how-to-organize-receipts-small-business'
];

// Fields that are now in defaults (should be removed unless overridden)
const defaultFields = [
  'AUTHOR_NAME',
  'AUTHOR_INITIALS',
  'OG_IMAGE',
  'TWITTER_IMAGE',
  'GA_MEASUREMENT_ID',
  'FEATURED_IMAGE'
];

// Manual mapping of RELATED_POSTS HTML to relatedPosts arrays
const relatedPostsMappings = {
  'how-to-track-expenses': [
    {
      slug: 'how-to-track-business-expenses',
      title: 'How to Track Business Expenses (The Simple Way)',
      excerpt: 'Business expenses eating up your time? Track them in 30 seconds. No spreadsheets needed.'
    },
    {
      slug: 'how-to-organize-receipts',
      title: 'How to Organize Receipts: A Simple System That Actually Works',
      excerpt: 'Stop wasting 12+ hours yearly on receipt chaos. Learn the 30-second system that works.'
    },
    {
      slug: 'how-to-organize-receipts-for-taxes',
      title: 'How to Organize Receipts for Taxes (And Actually Find Them When You Need Them)',
      excerpt: 'Don\'t let lost receipts cost you thousands in tax deductions. Simple system for tax season.'
    }
  ],
  'how-to-organize-receipts': [
    {
      slug: 'how-to-track-expenses',
      title: 'How to Track Expenses (Without Spreadsheets or Stress)',
      excerpt: 'Spending hours on expense tracking? Learn the 30-second system that eliminates manual data entry.'
    },
    {
      slug: 'how-to-organize-receipts-for-taxes',
      title: 'How to Organize Receipts for Taxes (And Actually Find Them When You Need Them)',
      excerpt: 'Don\'t let lost receipts cost you thousands in tax deductions. Simple system takes 30 seconds per receipt.'
    },
    {
      slug: 'how-to-organize-receipts-small-business',
      title: 'How to Organize Receipts for Small Business (Without Losing Your Mind)',
      excerpt: 'Small business receipts piling up? Learn a system that saves thousands in tax deductions.'
    }
  ],
  'how-to-organize-receipts-for-taxes': [
    {
      slug: 'how-to-organize-receipts-small-business',
      title: 'How to Organize Receipts for Small Business (Without Losing Your Mind)',
      excerpt: 'Small business receipts piling up? Learn the system that saves thousands in tax deductions.'
    },
    {
      slug: 'how-to-organize-receipts',
      title: 'How to Organize Receipts: A Simple System That Actually Works',
      excerpt: 'Stop wasting 12+ hours yearly on receipt chaos. Learn the simple system that works for everyone.'
    }
  ],
  'how-to-organize-receipts-small-business': [
    {
      slug: 'how-to-track-business-expenses',
      title: 'How to Track Business Expenses (The Simple Way)',
      excerpt: 'Business expenses eating up your time? Track them in 30 seconds. No spreadsheets needed.'
    },
    {
      slug: 'how-to-track-expenses',
      title: 'How to Track Expenses (Without Spreadsheets or Stress)',
      excerpt: 'Spending hours on expense tracking? Learn the 30-second system for personal and business expenses.'
    },
    {
      slug: 'how-to-organize-receipts-for-taxes',
      title: 'How to Organize Receipts for Taxes (And Actually Find Them When You Need Them)',
      excerpt: 'Don\'t let lost receipts cost you thousands in tax deductions. Simple system takes 30 seconds per receipt.'
    }
  ]
};

console.log(`🔄 Migrating ${blogsToMigrate.length} blogs to V3 format...\n`);

blogsToMigrate.forEach(slug => {
  const filePath = path.join(__dirname, '../frontend/data/blog', `${slug}.json`);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Skipping ${slug} - file not found`);
    return;
  }

  try {
    let blogData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const oldSize = JSON.stringify(blogData).length;

    // Remove default fields if they match defaults
    defaultFields.forEach(field => {
      if (field === 'AUTHOR_NAME' && blogData[field] === 'TextExpense Team') delete blogData[field];
      if (field === 'AUTHOR_INITIALS' && blogData[field] === 'TE') delete blogData[field];
      if (field === 'OG_IMAGE' && blogData[field] === 'https://textexpense.com/te-logo.png') delete blogData[field];
      if (field === 'TWITTER_IMAGE' && blogData[field] === 'https://textexpense.com/te-logo.png') delete blogData[field];
      if (field === 'GA_MEASUREMENT_ID' && blogData[field] === 'G-HMSDHWE3BS') delete blogData[field];
      if (field === 'FEATURED_IMAGE' && blogData[field] === '') delete blogData[field];
    });

    // Replace RELATED_POSTS HTML with relatedPosts array
    if (blogData.RELATED_POSTS && relatedPostsMappings[slug]) {
      delete blogData.RELATED_POSTS;
      blogData.relatedPosts = relatedPostsMappings[slug];
    }

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(blogData, null, 2), 'utf-8');

    const newSize = JSON.stringify(blogData).length;
    const saved = oldSize - newSize;
    const savedPercent = ((saved / oldSize) * 100).toFixed(1);

    console.log(`✅ ${slug}`);
    console.log(`   Size: ${oldSize} → ${newSize} bytes (saved ${saved} bytes / ${savedPercent}%)`);
    console.log('');

  } catch (error) {
    console.error(`❌ Error migrating ${slug}:`, error.message);
  }
});

console.log('🎉 Migration complete!');
console.log('');
console.log('Next: Regenerate all blogs with:');
blogsToMigrate.forEach(slug => {
  console.log(`  node scripts/generate-blog.js ${slug}`);
});
