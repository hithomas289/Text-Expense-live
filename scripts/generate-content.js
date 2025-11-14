#!/usr/bin/env node

/**
 * Content Generation Script
 * Generates HTML pages from templates with placeholder replacement
 */

const fs = require('fs');
const path = require('path');

class ContentGenerator {
  constructor() {
    this.templatesDir = path.join(__dirname, '../frontend/templates');
    this.outputDirs = {
      blog: path.join(__dirname, '../frontend/blog'),
      pages: path.join(__dirname, '../frontend/pages')
    };
  }

  /**
   * Generate a page from a template
   * @param {string} templateType - 'landing' or 'blog'
   * @param {object} data - Data object with placeholder values
   * @param {string} outputPath - Output file path
   */
  generate(templateType, data, outputPath) {
    try {
      // Load template
      const templateFile = templateType === 'landing'
        ? 'landing-template.html'
        : 'blog-template.html';

      const templatePath = path.join(this.templatesDir, templateFile);

      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
      }

      let html = fs.readFileSync(templatePath, 'utf8');

      console.log(`📄 Loaded template: ${templateFile}`);

      // Replace all placeholders
      let replacedCount = 0;
      for (const [key, value] of Object.entries(data)) {
        const placeholder = `{{${key}}}`;
        const count = (html.match(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

        if (count > 0) {
          html = html.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value || '');
          replacedCount += count;
          console.log(`   ✓ Replaced ${count}x ${key}`);
        }
      }

      console.log(`✅ Total replacements: ${replacedCount}`);

      // Check for remaining placeholders
      const remainingPlaceholders = html.match(/\{\{([A-Z_]+)\}\}/g);
      if (remainingPlaceholders) {
        console.warn(`⚠️  Warning: ${remainingPlaceholders.length} placeholders not replaced:`);
        remainingPlaceholders.forEach(p => console.warn(`   • ${p}`));
      }

      // Write output file
      const fullOutputPath = path.resolve(outputPath);
      const outputDir = path.dirname(fullOutputPath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(fullOutputPath, html, 'utf8');
      console.log(`💾 Saved to: ${fullOutputPath}`);

      return {
        success: true,
        filePath: fullOutputPath,
        size: Buffer.byteLength(html, 'utf8'),
        replacedCount,
        remainingPlaceholders: remainingPlaceholders ? remainingPlaceholders.length : 0
      };

    } catch (error) {
      console.error(`❌ Error generating content: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a landing page
   */
  generateLandingPage(slug, data) {
    const outputPath = path.join(this.outputDirs.pages, `${slug}.html`);
    console.log(`\n🚀 Generating landing page: ${slug}\n`);
    return this.generate('landing', data, outputPath);
  }

  /**
   * Generate a blog post
   */
  generateBlogPost(slug, data) {
    const outputPath = path.join(this.outputDirs.blog, `${slug}.html`);
    console.log(`\n📝 Generating blog post: ${slug}\n`);
    return this.generate('blog', data, outputPath);
  }

  /**
   * Helper: Calculate reading time from content
   */
  static calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Helper: Generate author initials
   */
  static getAuthorInitials(authorName) {
    return authorName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  /**
   * Helper: Generate excerpt from content
   */
  static generateExcerpt(content, maxLength = 160) {
    // Remove HTML tags
    const textOnly = content.replace(/<[^>]*>/g, '');

    if (textOnly.length <= maxLength) {
      return textOnly;
    }

    return textOnly.substring(0, maxLength).trim() + '...';
  }

  /**
   * Helper: Format date to ISO 8601
   */
  static toISODate(date) {
    return new Date(date).toISOString();
  }

  /**
   * Helper: Format date to human-readable
   */
  static toReadableDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Helper: URL encode for sharing
   */
  static urlEncode(url) {
    return encodeURIComponent(url);
  }
}

// CLI Usage
if (require.main === module) {
  const generator = new ContentGenerator();

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║        TextExpense Content Generation System              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('Usage examples:');
  console.log('  const generator = new ContentGenerator();');
  console.log('  generator.generateLandingPage("slug", dataObject);');
  console.log('  generator.generateBlogPost("slug", dataObject);');
  console.log('\nFor detailed examples, see: frontend/templates/AGENT_GUIDE.md\n');
}

module.exports = ContentGenerator;
