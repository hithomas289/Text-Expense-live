const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileUtils {
  // Ensure directory exists
  static async ensureDir(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
      } else {
        throw error;
      }
    }
  }

  // Generate unique filename
  static generateUniqueFileName(originalName, extension) {
    const uuid = uuidv4();
    const timestamp = Date.now();
    const sanitizedName = originalName ? 
      originalName.replace(/[^a-zA-Z0-9.-]/g, '_') : 'file';
    
    return `${timestamp}_${uuid}_${sanitizedName}${extension || ''}`;
  }

  // Get file extension from mime type
  static getExtensionFromMimeType(mimeType) {
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
      'text/plain': '.txt',
      'application/json': '.json'
    };
    
    return mimeToExt[mimeType] || '';
  }

  // Save stream to file
  static async saveStreamToFile(stream, filePath) {
    return new Promise((resolve, reject) => {
      const writeStream = require('fs').createWriteStream(filePath);
      
      stream.pipe(writeStream);
      
      writeStream.on('finish', () => {
        console.log(`File saved successfully: ${filePath}`);
        resolve(filePath);
      });
      
      writeStream.on('error', (error) => {
        console.error(`Error saving file: ${error.message}`);
        reject(error);
      });
    });
  }

  // Get file stats
  static async getFileStats(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      console.error(`Error getting file stats: ${error.message}`);
      return null;
    }
  }

  // Delete file
  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`File deleted: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Error deleting file: ${error.message}`);
      return false;
    }
  }

  // Sanitize JSON data for PostgreSQL JSONB (remove null bytes)
  static sanitizeForJsonb(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      // Remove null bytes (\u0000) which PostgreSQL JSONB cannot handle
      return obj.replace(/\u0000/g, '');
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeForJsonb(item));
    }

    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeForJsonb(value);
      }
      return sanitized;
    }

    return obj;
  }

  // Read file as buffer
  static async readFileAsBuffer(filePath) {
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      console.error(`Error reading file: ${error.message}`);
      throw error;
    }
  }

  // Clean old files (older than specified days)
  static async cleanOldFiles(directoryPath, maxAgeDays = 7) {
    try {
      const files = await fs.readdir(directoryPath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const stats = await this.getFileStats(filePath);
        
        if (stats && stats.isFile && stats.created < cutoffDate) {
          const deleted = await this.deleteFile(filePath);
          if (deleted) deletedCount++;
        }
      }
      
      console.log(`Cleaned ${deletedCount} old files from ${directoryPath}`);
      return deletedCount;
    } catch (error) {
      console.error(`Error cleaning old files: ${error.message}`);
      return 0;
    }
  }

  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate file type
  static isValidImageType(mimeType) {
    const validTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];
    
    return validTypes.includes(mimeType);
  }

  // Validate file size
  static isValidFileSize(sizeBytes, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return sizeBytes <= maxSizeBytes;
  }
}

module.exports = FileUtils;