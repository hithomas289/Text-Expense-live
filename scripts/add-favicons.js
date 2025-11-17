const fs = require('fs');
const path = require('path');

const faviconHTML = `
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/te-logo.png">
  <link rel="apple-touch-icon" href="/te-logo.png">`;

function addFavicon(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has favicon
    if (content.includes('favicon') || content.includes('rel="icon"')) {
      console.log(`  Already has favicon: ${filePath}`);
      return false;
    }

    // Find the title tag and add favicon after it
    const titlePattern = /(<title>.*?<\/title>)/i;

    if (titlePattern.test(content)) {
      content = content.replace(titlePattern, `$1${faviconHTML}`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Added favicon: ${filePath}`);
      return true;
    } else {
      console.log(`⚠ No title tag found: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  let count = 0;

  files.forEach(file => {
    if (file.endsWith('.html')) {
      const filePath = path.join(directory, file);
      if (addFavicon(filePath)) {
        count++;
      }
    }
  });

  return count;
}

// Main execution
console.log('Adding favicons to landing pages and blog posts...\n');

console.log('Processing landing pages...');
const landingCount = processDirectory('./frontend/landing');
console.log(`Added to ${landingCount} landing pages\n`);

console.log('Processing blog posts...');
const blogFiles = fs.readdirSync('./frontend/blog').filter(f => f.endsWith('.html'));
let blogCount = 0;
blogFiles.forEach(file => {
  const filePath = path.join('./frontend/blog', file);
  if (addFavicon(filePath)) {
    blogCount++;
  }
});
console.log(`Added to ${blogCount} blog posts\n`);

console.log(`\n✓ Total files updated: ${landingCount + blogCount}`);
