const fs = require('fs');
const path = require('path');

// QR code CSS to add
const qrCodeCSS = `
    .qr-code-container {
      margin-top: 30px;
      text-align: center;
    }

    .qr-code-container p {
      font-size: 14px;
      color: var(--gray);
      margin-bottom: 15px;
    }

    .qr-code-container img {
      width: 200px;
      height: 200px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      background: white;
      padding: 10px;
    }
`;

// QR code HTML to add after CTA buttons
const qrCodeHTML = `
      <div class="qr-code-container">
        <p>Or scan to start:</p>
        <img src="/qrcode.png" alt="WhatsApp QR Code - Start tracking receipts instantly">
      </div>`;

function addQRCodeToFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Skip if already has QR code
    if (content.includes('qr-code-container')) {
      console.log(`Skipped (already has QR): ${filePath}`);
      return;
    }

    // Add CSS before @media queries
    if (!content.includes('.qr-code-container')) {
      // Find the last occurrence of @media
      const mediaIndex = content.lastIndexOf('@media');
      if (mediaIndex !== -1) {
        // Insert CSS before @media
        content = content.slice(0, mediaIndex) + qrCodeCSS + '\n' + content.slice(mediaIndex);
        modified = true;
      }
    }

    // Find all WhatsApp CTA links and add QR code after them
    // Pattern: <a href="https://wa.me/...">...</a>
    const ctaPattern = /(<a\s+href="https:\/\/wa\.me\/[^"]+"\s+class="[^"]*cta[^"]*"[^>]*>[^<]+<\/a>)/gi;

    let match;
    let newContent = content;
    let addedCount = 0;

    // Use replace to add QR code after each CTA link
    newContent = newContent.replace(ctaPattern, (match) => {
      addedCount++;
      return match + qrCodeHTML;
    });

    if (addedCount > 0) {
      content = newContent;
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath} (${addedCount} QR codes added)`);
    } else {
      console.log(`⚠ No changes: ${filePath}`);
    }

  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(directory, pattern = '*.html') {
  const files = fs.readdirSync(directory);
  let count = 0;

  files.forEach(file => {
    if (file.endsWith('.html')) {
      const filePath = path.join(directory, file);
      addQRCodeToFile(filePath);
      count++;
    }
  });

  return count;
}

// Main execution
console.log('Starting QR code addition...\n');

console.log('Processing landing pages...');
const landingCount = processDirectory('./frontend/landing');
console.log(`\nProcessed ${landingCount} landing pages\n`);

console.log('Processing core pages...');
const pagesCount = processDirectory('./frontend/pages');
console.log(`\nProcessed ${pagesCount} core pages\n`);

console.log('Processing blog posts...');
const blogFiles = fs.readdirSync('./frontend/blog').filter(f => f.endsWith('.html'));
let blogCount = 0;
blogFiles.forEach(file => {
  const filePath = path.join('./frontend/blog', file);
  addQRCodeToFile(filePath);
  blogCount++;
});
console.log(`\nProcessed ${blogCount} blog posts\n`);

console.log(`\n✓ Complete! Total files processed: ${landingCount + pagesCount + blogCount}`);
