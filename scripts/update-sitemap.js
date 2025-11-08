#!/usr/bin/env node

/**
 * Sitemap Generator
 * Auto-generates sitemap.xml from frontend files
 */

const fs = require('fs');
const path = require('path');

class SitemapGenerator {
  constructor(baseUrl = 'https://textexpense.com') {
    this.baseUrl = baseUrl;
    this.frontendDir = path.join(__dirname, '../frontend');
    this.sitemapPath = path.join(this.frontendDir, 'sitemap.xml');
    this.urls = [];
  }

  /**
   * Scan directories for HTML files
   */
  scanDirectory(dir, urlPrefix = '') {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    files.forEach(file => {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        // Skip templates directory
        if (file.name === 'templates') return;

        // Recursively scan subdirectories
        this.scanDirectory(filePath, `${urlPrefix}/${file.name}`);
      } else if (file.isFile() && file.name.endsWith('.html')) {
        // Get file stats
        const stats = fs.statSync(filePath);
        const lastmod = stats.mtime.toISOString().split('T')[0];

        // Determine URL and priority
        let url, priority, changefreq;

        if (file.name === 'index.html' && urlPrefix === '') {
          // Main homepage
          url = this.baseUrl + '/';
          priority = 1.0;
          changefreq = 'weekly';
        } else if (file.name === 'index.html') {
          // Blog index or other section index
          url = this.baseUrl + urlPrefix + '/';
          priority = 0.9;
          changefreq = 'weekly';
        } else if (file.name === 'privacy.html' || file.name === 'terms.html') {
          // Legal pages
          url = this.baseUrl + '/' + file.name.replace('.html', '');
          priority = 0.3;
          changefreq = 'yearly';
        } else {
          // Blog posts or landing pages
          const slug = file.name.replace('.html', '');
          url = this.baseUrl + urlPrefix + '/' + slug;

          if (urlPrefix.includes('/blog')) {
            priority = 0.8;
            changefreq = 'monthly';
          } else {
            priority = 0.7;
            changefreq = 'monthly';
          }
        }

        this.urls.push({ url, lastmod, priority, changefreq });
      }
    });
  }

  /**
   * Generate XML sitemap
   */
  generateXML() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Sort URLs by priority (highest first)
    this.urls.sort((a, b) => b.priority - a.priority);

    this.urls.forEach(entry => {
      xml += '  <url>\n';
      xml += `    <loc>${entry.url}</loc>\n`;
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>\n';

    return xml;
  }

  /**
   * Generate and save sitemap
   */
  generate() {
    try {
      console.log('🗺️  Generating sitemap.xml...\n');

      // Scan frontend directory
      this.scanDirectory(this.frontendDir);

      console.log(`📊 Found ${this.urls.length} pages:\n`);

      // Print URLs
      this.urls.forEach(entry => {
        console.log(`   ${entry.url} (priority: ${entry.priority})`);
      });

      // Generate XML
      const xml = this.generateXML();

      // Write to file
      fs.writeFileSync(this.sitemapPath, xml, 'utf8');

      console.log(`\n✅ Sitemap saved to: ${this.sitemapPath}`);
      console.log(`📦 Size: ${Buffer.byteLength(xml, 'utf8')} bytes`);
      console.log(`🔗 Submit to Google: https://www.google.com/ping?sitemap=${this.baseUrl}/sitemap.xml\n`);

      return { success: true, urlCount: this.urls.length, filePath: this.sitemapPath };

    } catch (error) {
      console.error(`❌ Error generating sitemap: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a single URL to existing sitemap
   */
  addUrl(url, options = {}) {
    const {
      lastmod = new Date().toISOString().split('T')[0],
      changefreq = 'monthly',
      priority = 0.8
    } = options;

    // Check if sitemap exists
    if (!fs.existsSync(this.sitemapPath)) {
      console.warn('⚠️  Sitemap does not exist. Run generate() first.');
      return this.generate();
    }

    // Read existing sitemap
    let xml = fs.readFileSync(this.sitemapPath, 'utf8');

    // Check if URL already exists
    if (xml.includes(`<loc>${url}</loc>`)) {
      console.log(`ℹ️  URL already exists in sitemap: ${url}`);
      return { success: true, action: 'skipped' };
    }

    // Insert new URL before closing </urlset>
    const newEntry = `  <url>\n` +
      `    <loc>${url}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>${changefreq}</changefreq>\n` +
      `    <priority>${priority.toFixed(1)}</priority>\n` +
      `  </url>\n`;

    xml = xml.replace('</urlset>', newEntry + '</urlset>');

    // Write back
    fs.writeFileSync(this.sitemapPath, xml, 'utf8');

    console.log(`✅ Added to sitemap: ${url}`);

    return { success: true, action: 'added' };
  }
}

// CLI Usage
if (require.main === module) {
  const generator = new SitemapGenerator();
  const result = generator.generate();
  process.exit(result.success ? 0 : 1);
}

module.exports = SitemapGenerator;
