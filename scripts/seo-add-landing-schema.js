#!/usr/bin/env node
/**
 * SEO Fix: Add SoftwareApplication schema to all landing pages
 *
 * Inserts JSON-LD structured data after the Google Analytics script
 * in each landing page HTML file.
 *
 * Usage: node scripts/seo-add-landing-schema.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const LANDING_DIR = path.join(__dirname, '../frontend/landing');

const dryRun = process.argv.includes('--dry-run');

const SCHEMA_MARKUP = `
  <!-- SoftwareApplication Schema for SEO -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TextExpense",
    "description": "Receipt management and expense tracking via WhatsApp. Send receipt photos and get organized Excel reports.",
    "url": "https://textexpense.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free plan available"
    }
  }
  </script>
`;

function main() {
    const htmlFiles = fs.readdirSync(LANDING_DIR)
        .filter(f => f.endsWith('.html'));

    console.log(`Found ${htmlFiles.length} landing page HTML files`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let alreadyHasSchemaCount = 0;

    for (const filename of htmlFiles) {
        const filePath = path.join(LANDING_DIR, filename);

        try {
            let content = fs.readFileSync(filePath, 'utf8');

            // Check if schema already exists
            if (content.includes('application/ld+json')) {
                alreadyHasSchemaCount++;
                continue;
            }

            // Find insertion point: after </script> that closes the GA config
            // Look for: gtag('config', 'G-HMSDHWE3BS');
            //           </script>
            const insertionPattern = /gtag\('config', 'G-HMSDHWE3BS'\);\s*<\/script>/;
            const match = content.match(insertionPattern);

            if (!match) {
                // Try alternate pattern - just after first </script> in head
                const altPattern = /<\/script>\s*\n\s*<style>/;
                const altMatch = content.match(altPattern);

                if (altMatch) {
                    content = content.replace(altPattern, '</script>' + SCHEMA_MARKUP + '\n\n  <style>');
                } else {
                    console.warn(`Could not find insertion point in ${filename}`);
                    skippedCount++;
                    continue;
                }
            } else {
                // Insert schema after the GA script
                content = content.replace(
                    insertionPattern,
                    "gtag('config', 'G-HMSDHWE3BS');\n  </script>" + SCHEMA_MARKUP
                );
            }

            if (!dryRun) {
                fs.writeFileSync(filePath, content);
            }

            updatedCount++;

        } catch (err) {
            console.error(`Error processing ${filename}:`, err.message);
            errorCount++;
        }
    }

    console.log('\n=== Summary ===');
    console.log(`Updated: ${updatedCount}`);
    console.log(`Already has schema: ${alreadyHasSchemaCount}`);
    console.log(`Skipped (no insertion point): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

    if (dryRun) {
        console.log('\n(Dry run - no files were modified)');
    }
}

main();
