const fs = require('fs');
const path = require('path');

function removeHeaderQRCodes(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern to find QR codes inside <nav> or </nav> blocks
    // We need to remove QR code containers that appear between <nav> and </nav>
    const navPattern = /(<nav[\s\S]*?)(      <div class="qr-code-container">[\s\S]*?<\/div>)([\s\S]*?<\/nav>)/g;

    const headerPattern = /(<header[\s\S]*?)(      <div class="qr-code-container">[\s\S]*?<\/div>)([\s\S]*?<\/header>)/g;

    // Remove QR codes from nav
    const newContent1 = content.replace(navPattern, '$1$3');
    if (newContent1 !== content) {
      content = newContent1;
      modified = true;
    }

    // Remove QR codes from header (but outside nav)
    const newContent2 = content.replace(headerPattern, '$1$3');
    if (newContent2 !== content) {
      content = newContent2;
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Cleaned: ${filePath}`);
      return true;
    } else {
      console.log(`  No header QR found: ${filePath}`);
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
      if (removeHeaderQRCodes(filePath)) {
        count++;
      }
    }
  });

  return count;
}

// Main execution
console.log('Removing QR codes from headers/navigation...\n');

console.log('Processing /pages/...');
const pagesCount = processDirectory('./frontend/pages');
console.log(`Cleaned ${pagesCount} pages\n`);

console.log('Processing /landing/...');
const landingCount = processDirectory('./frontend/landing');
console.log(`Cleaned ${landingCount} landing pages\n`);

console.log('Processing /blog/...');
const blogFiles = fs.readdirSync('./frontend/blog').filter(f => f.endsWith('.html'));
let blogCount = 0;
blogFiles.forEach(file => {
  const filePath = path.join('./frontend/blog', file);
  if (removeHeaderQRCodes(filePath)) {
    blogCount++;
  }
});
console.log(`Cleaned ${blogCount} blog posts\n`);

console.log(`\n✓ Total files cleaned: ${pagesCount + landingCount + blogCount}`);
