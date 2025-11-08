#!/usr/bin/env node

/**
 * Content Validation Framework
 * Tests generated HTML for SEO, accessibility, and quality standards
 */

const fs = require('fs');
const path = require('path');

class ContentValidator {
  constructor(filePath) {
    this.filePath = filePath;
    this.html = '';
    this.errors = [];
    this.warnings = [];
    this.passed = 0;
    this.failed = 0;
  }

  async validate() {
    try {
      this.html = fs.readFileSync(this.filePath, 'utf8');

      console.log(`\n🔍 Validating: ${path.basename(this.filePath)}\n`);

      // Run all validation checks
      this.checkPlaceholders();
      this.checkHTMLValidity();
      this.checkSEOTags();
      this.checkHeadingHierarchy();
      this.checkImages();
      this.checkLinks();
      this.checkMobileViewport();
      this.checkStructuredData();
      this.checkAccessibility();

      // Print results
      this.printResults();

      return this.errors.length === 0;
    } catch (error) {
      console.error(`❌ Error reading file: ${error.message}`);
      return false;
    }
  }

  checkPlaceholders() {
    const placeholderRegex = /\{\{([A-Z_]+)\}\}/g;
    const matches = this.html.match(placeholderRegex);

    if (matches && matches.length > 0) {
      this.errors.push(`Found ${matches.length} unreplaced placeholders: ${matches.join(', ')}`);
      this.failed++;
    } else {
      this.passed++;
    }
  }

  checkHTMLValidity() {
    const checks = [
      { test: this.html.includes('<!DOCTYPE html>'), message: 'DOCTYPE declaration' },
      { test: this.html.includes('<html'), message: 'HTML tag' },
      { test: this.html.includes('</html>'), message: 'Closing HTML tag' },
      { test: this.html.includes('<head>'), message: 'Head tag' },
      { test: this.html.includes('</head>'), message: 'Closing head tag' },
      { test: this.html.includes('<body>'), message: 'Body tag' },
      { test: this.html.includes('</body>'), message: 'Closing body tag' },
    ];

    checks.forEach(check => {
      if (!check.test) {
        this.errors.push(`Missing ${check.message}`);
        this.failed++;
      } else {
        this.passed++;
      }
    });
  }

  checkSEOTags() {
    const seoChecks = [
      { regex: /<title>([^<]{10,70})<\/title>/, name: 'Title tag (10-70 chars)' },
      { regex: /<meta name="description" content="([^"]{50,160})"/, name: 'Meta description (50-160 chars)' },
      { regex: /<meta name="keywords" content="([^"]+)"/, name: 'Keywords meta tag' },
      { regex: /<meta property="og:title" content="([^"]+)"/, name: 'OG title' },
      { regex: /<meta property="og:description" content="([^"]+)"/, name: 'OG description' },
      { regex: /<meta property="og:image" content="([^"]+)"/, name: 'OG image' },
      { regex: /<meta name="twitter:card" content="([^"]+)"/, name: 'Twitter card' },
      { regex: /<link rel="canonical" href="([^"]+)"/, name: 'Canonical URL' },
    ];

    seoChecks.forEach(check => {
      if (!check.regex.test(this.html)) {
        this.errors.push(`Missing or invalid ${check.name}`);
        this.failed++;
      } else {
        this.passed++;
      }
    });
  }

  checkHeadingHierarchy() {
    const h1Count = (this.html.match(/<h1[^>]*>/g) || []).length;

    if (h1Count === 0) {
      this.errors.push('Missing H1 tag');
      this.failed++;
    } else if (h1Count > 1) {
      this.errors.push(`Multiple H1 tags found (${h1Count})`);
      this.failed++;
    } else {
      this.passed++;
    }

    // Check if H2 comes before H1 (bad hierarchy)
    const h1Index = this.html.indexOf('<h1');
    const h2Index = this.html.indexOf('<h2');

    if (h2Index > -1 && h2Index < h1Index) {
      this.warnings.push('H2 appears before H1 (poor heading hierarchy)');
    }
  }

  checkImages() {
    const imgRegex = /<img[^>]*>/g;
    const images = this.html.match(imgRegex) || [];

    let imagesWithoutAlt = 0;
    images.forEach(img => {
      if (!img.includes('alt=')) {
        imagesWithoutAlt++;
      }
    });

    if (imagesWithoutAlt > 0) {
      this.errors.push(`${imagesWithoutAlt} images missing alt text`);
      this.failed++;
    } else if (images.length > 0) {
      this.passed++;
    }
  }

  checkLinks() {
    const linkRegex = /<a\s+href="([^"]+)"/g;
    const links = [...this.html.matchAll(linkRegex)];

    let brokenLinks = 0;
    links.forEach(match => {
      const href = match[1];
      if (href === '#' || href === '') {
        brokenLinks++;
      }
    });

    if (brokenLinks > 0) {
      this.warnings.push(`${brokenLinks} placeholder/empty links found`);
    } else if (links.length > 0) {
      this.passed++;
    }
  }

  checkMobileViewport() {
    if (!this.html.includes('<meta name="viewport"')) {
      this.errors.push('Missing viewport meta tag for mobile responsiveness');
      this.failed++;
    } else {
      this.passed++;
    }
  }

  checkStructuredData() {
    if (!this.html.includes('application/ld+json')) {
      this.warnings.push('No structured data (JSON-LD) found');
    } else {
      // Try to parse JSON-LD
      const jsonLdMatch = this.html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      if (jsonLdMatch) {
        try {
          JSON.parse(jsonLdMatch[1]);
          this.passed++;
        } catch (e) {
          this.errors.push('Invalid JSON-LD structured data');
          this.failed++;
        }
      }
    }
  }

  checkAccessibility() {
    const checks = [
      { test: this.html.includes('lang='), message: 'HTML lang attribute' },
      { test: this.html.includes('charset='), message: 'Character encoding' },
    ];

    checks.forEach(check => {
      if (!check.test) {
        this.warnings.push(`Missing ${check.message}`);
      } else {
        this.passed++;
      }
    });
  }

  printResults() {
    console.log('─'.repeat(60));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log('─'.repeat(60));

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`   • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    if (this.errors.length === 0) {
      console.log('\n🎉 All validation checks passed!\n');
    } else {
      console.log('\n⚠️  Validation failed - please fix errors before deploying.\n');
    }
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node test-content.js <file-path>');
    console.log('Example: node test-content.js frontend/blog/my-post.html');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const validator = new ContentValidator(filePath);
  validator.validate().then(passed => {
    process.exit(passed ? 0 : 1);
  });
}

module.exports = ContentValidator;
