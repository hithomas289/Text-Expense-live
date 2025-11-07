const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class ImageCompressionService {
  constructor() {
    this.maxWidth = 1920;
    this.maxHeight = 1920;
    this.jpegQuality = 75;
    this.targetCompressionRatio = 0.15; // 85% reduction (keep 15% of original)
  }

  /*
   * Compress image after OCR processing
   * @param {string} originalPath - Path to original high-quality image
   * @param {string} outputPath - Path for compressed image
   * @returns {Object} Compression result
   */
  async compressImage(originalPath, outputPath) {
    try {
      console.log(`Compressing image: ${originalPath}`);
      
      // Get original file stats
      const originalStats = await fs.stat(originalPath);
      const originalSizeMB = originalStats.size / (1024 * 1024);
      
      console.log(`Original size: ${originalSizeMB.toFixed(2)}MB`);

      // Process image with Sharp
      const compressedBuffer = await sharp(originalPath)
        .resize(this.maxWidth, this.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: this.jpegQuality,
          progressive: true
        })
        .toBuffer();

      // Write compressed image
      await fs.writeFile(outputPath, compressedBuffer);
      
      // Get compressed file stats
      const compressedStats = await fs.stat(outputPath);
      const compressedSizeMB = compressedStats.size / (1024 * 1024);
      const compressionRatio = compressedSizeMB / originalSizeMB;
      const savings = ((originalSizeMB - compressedSizeMB) / originalSizeMB) * 100;

      console.log(`Compressed size: ${compressedSizeMB.toFixed(2)}MB`);
      console.log(`Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
      console.log(`Space saved: ${savings.toFixed(1)}%`);

      return {
        success: true,
        originalPath,
        compressedPath: outputPath,
        originalSizeMB,
        compressedSizeMB,
        compressionRatio,
        spaceSavedPercent: savings,
        compressionMethod: 'sharp_jpeg'
      };

    } catch (error) {
      console.error('Image compression failed:', error);
      return {
        success: false,
        error: error.message,
        originalPath,
        outputPath
      };
    }
  }

  /*
   * Get compressed filename for given original filename
   */
  getCompressedFilename(originalFilename) {
    const ext = path.extname(originalFilename);
    const basename = path.basename(originalFilename, ext);
    return `${basename}_compressed.jpg`; // Always use .jpg for compressed
  }

  /*
   * Clean up original file after compression (optional)
   */
  async cleanupOriginal(originalPath) {
    try {
      await fs.unlink(originalPath);
      console.log(`Original file deleted: ${originalPath}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete original file:', error);
      return { success: false, error: error.message };
    }
  }

  /*
   * Batch compress multiple images
   */
  async batchCompress(imageFiles, outputDir) {
    const results = [];
    
    for (const imageFile of imageFiles) {
      const compressedFilename = this.getCompressedFilename(path.basename(imageFile));
      const outputPath = path.join(outputDir, compressedFilename);
      
      const result = await this.compressImage(imageFile, outputPath);
      results.push({
        original: imageFile,
        compressed: outputPath,
        ...result
      });
    }
    
    return results;
  }

  /*
   * Check if compression is beneficial (skip if already small)
   */
  async shouldCompress(filePath, minSizeMB = 0.5) {
    try {
      const stats = await fs.stat(filePath);
      const sizeMB = stats.size / (1024 * 1024);
      return sizeMB > minSizeMB;
    } catch (error) {
      return false;
    }
  }

  /*
   * Get image dimensions and metadata
   */
  async getImageInfo(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      const stats = await fs.stat(filePath);
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        sizeMB: stats.size / (1024 * 1024),
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha
      };
    } catch (error) {
      return null;
    }
  }
}

module.exports = ImageCompressionService;