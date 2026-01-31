#!/usr/bin/env node
/**
 * SEO Fix: Auto-generate relatedPosts for blog posts
 *
 * For each blog post, finds 2-3 related posts in the same category
 * and updates the RELATED_POSTS field with HTML links.
 *
 * Usage: node scripts/seo-generate-related-posts.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const BLOG_DATA_DIR = path.join(__dirname, '../frontend/data/blog');
const REGISTRY_PATH = path.join(__dirname, '../frontend/data/blog-registry.json');

const dryRun = process.argv.includes('--dry-run');

function main() {
    console.log('Loading blog registry...');
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));

    // Group posts by category
    const postsByCategory = {};
    for (const post of registry.posts) {
        if (!postsByCategory[post.category]) {
            postsByCategory[post.category] = [];
        }
        postsByCategory[post.category].push(post);
    }

    console.log(`Found ${registry.posts.length} posts in ${Object.keys(postsByCategory).length} categories`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each blog JSON file
    const jsonFiles = fs.readdirSync(BLOG_DATA_DIR)
        .filter(f => f.endsWith('.json'));

    console.log(`Processing ${jsonFiles.length} blog JSON files...`);

    for (const filename of jsonFiles) {
        const slug = filename.replace('.json', '');
        const filePath = path.join(BLOG_DATA_DIR, filename);

        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const category = data.category;

            // Find posts in the same category, excluding self
            const sameCategoryPosts = (postsByCategory[category] || [])
                .filter(p => p.slug !== slug);

            if (sameCategoryPosts.length === 0) {
                // No related posts in same category - try finding any 3 posts
                const allOtherPosts = registry.posts.filter(p => p.slug !== slug);
                const randomPosts = allOtherPosts.slice(0, 3);

                if (randomPosts.length > 0) {
                    const relatedHTML = generateRelatedHTML(randomPosts);
                    data.RELATED_POSTS = relatedHTML;

                    if (!dryRun) {
                        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                    }
                    updatedCount++;
                } else {
                    skippedCount++;
                }
                continue;
            }

            // Pick 2-3 related posts (shuffle and take first 3)
            const shuffled = sameCategoryPosts.sort(() => Math.random() - 0.5);
            const relatedPosts = shuffled.slice(0, Math.min(3, shuffled.length));

            // Generate HTML for related posts
            const relatedHTML = generateRelatedHTML(relatedPosts);

            data.RELATED_POSTS = relatedHTML;

            if (!dryRun) {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            }

            updatedCount++;

        } catch (err) {
            console.error(`Error processing ${filename}:`, err.message);
            errorCount++;
        }
    }

    console.log('\n=== Summary ===');
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

    if (dryRun) {
        console.log('\n(Dry run - no files were modified)');
    }
}

function generateRelatedHTML(posts) {
    const items = posts.map(post => {
        return `<li><a href="${post.url}">${escapeHTML(post.title)}</a></li>`;
    }).join('\n        ');

    return `<ul class="related-posts-list">
        ${items}
    </ul>`;
}

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

main();
