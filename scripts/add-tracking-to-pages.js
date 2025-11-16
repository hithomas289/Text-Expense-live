const fs = require('fs');
const path = require('path');

// The conversion tracking script to add
const trackingScript = `
  <!-- WhatsApp Conversion Tracking -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');

      whatsappLinks.forEach(function(link, index) {
        link.addEventListener('click', function(e) {
          let buttonText = this.textContent.trim();
          let buttonLocation = 'unknown';

          // Detect button location based on parent sections
          if (this.closest('.hero')) {
            buttonLocation = 'hero';
          } else if (this.closest('.final-cta-section')) {
            buttonLocation = 'footer_cta';
          } else if (this.closest('footer')) {
            buttonLocation = 'footer';
          } else if (this.closest('.article-cta')) {
            buttonLocation = 'article_cta';
          } else if (this.closest('.scenarios-section')) {
            buttonLocation = 'scenarios';
          } else if (this.closest('.benefits-section')) {
            buttonLocation = 'benefits';
          }

          // Send GA4 event
          if (typeof gtag !== 'undefined') {
            gtag('event', 'whatsapp_click', {
              'button_location': buttonLocation,
              'button_text': buttonText,
              'page_url': window.location.href,
              'page_type': document.querySelector('meta[property="og:type"]')?.getAttribute('content') || 'unknown'
            });
          }
        });
      });
    });
  </script>`;

// Function to process a single file
function addTrackingToFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if tracking already exists
    if (content.includes('whatsapp_click')) {
      console.log(`⏭️  Skipping ${filePath} - tracking already exists`);
      return false;
    }

    // Fix GA4 ID if it's wrong (G-VEMBHFSE8 -> G-HMSDHWE3BS)
    if (content.includes('G-VEMBHFSE8')) {
      content = content.replace(/G-VEMBHFSE8/g, 'G-HMSDHWE3BS');
      console.log(`🔧 Fixed GA4 ID in ${filePath}`);
    }

    // Insert tracking script before </body>
    if (content.includes('</body>')) {
      content = content.replace('</body>', `${trackingScript}\n</body>`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Added tracking to ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  No </body> tag found in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process pages directory
console.log('🚀 Adding conversion tracking to /pages/...\n');

const pagesDir = './frontend/pages';
const files = fs.readdirSync(pagesDir);
let successCount = 0;

files.forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(pagesDir, file);
    const result = addTrackingToFile(filePath);
    if (result === true) successCount++;
  }
});

console.log(`\n✅ Done! Updated ${successCount} pages`);
