const fs = require('fs').promises;
const path = require('path');
const { ExpenseV2, SavedReceipt, Session } = require('../models/database/indexV2');

class FileCleanupManager {
  constructor() {
    this.cleanupInterval = null;
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.maxFileAge = 24 * 60 * 60 * 1000; // 24 hours - hard limit for all files
    this.orphanFileAge = 60 * 60 * 1000; // 60 minutes for orphaned files (matches user messaging)
  }

  // Start automatic cleanup task
  startCleanupTask() {
    // Run cleanup every 4 hours
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.cleanupOrphanedFiles();
        await this.cleanupOldTempFiles();
      } catch (error) {
        console.error('❌ File cleanup task error:', error);
      }
    }, 4 * 60 * 60 * 1000);

    console.log('🧹 File cleanup task started (runs every 4 hours)');
  }

  // Stop cleanup task
  stopCleanupTask() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🛑 File cleanup task stopped');
    }
  }

  // Clean up files that aren't referenced in database
  async cleanupOrphanedFiles() {
    try {
      console.log('🔍 Starting orphaned file cleanup...');
      let deletedCount = 0;

      // Get all files in uploads directory
      const files = await this.getAllUploadedFiles();
      console.log(`📁 Found ${files.length} files in uploads directory`);

      for (const file of files) {
        try {
          const isOrphaned = await this.isFileOrphaned(file.path, file.name);
          const isOld = (Date.now() - file.mtime) > this.orphanFileAge;

          // Delete if file is orphaned and older than 60 minutes
          if (isOrphaned && isOld) {
            await fs.unlink(file.path);
            console.log(`🗑️ Deleted orphaned file: ${file.name} (${this.formatAge(file.mtime)})`);
            deletedCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing file ${file.name}:`, error);
        }
      }

      console.log(`✅ Orphaned file cleanup completed: ${deletedCount} files deleted`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Orphaned file cleanup failed:', error);
      return 0;
    }
  }

  // Clean up temporary files older than 24 hours
  async cleanupOldTempFiles() {
    try {
      console.log('🔍 Starting old temp file cleanup...');
      let deletedCount = 0;

      const files = await this.getAllUploadedFiles();
      const cutoffTime = Date.now() - this.maxFileAge;

      for (const file of files) {
        try {
          // Delete files older than 24 hours regardless of database status
          if (file.mtime < cutoffTime) {
            await fs.unlink(file.path);
            console.log(`🗑️ Deleted old file: ${file.name} (${this.formatAge(file.mtime)})`);
            deletedCount++;
          }
        } catch (error) {
          console.error(`❌ Error deleting old file ${file.name}:`, error);
        }
      }

      console.log(`✅ Old temp file cleanup completed: ${deletedCount} files deleted`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Old temp file cleanup failed:', error);
      return 0;
    }
  }

  // Check if file is referenced in database
  async isFileOrphaned(filePath, fileName) {
    try {
      // Check if file is referenced in expenses
      const expenseRef = await ExpenseV2.findOne({
        where: {
          $or: [
            { originalFilename: fileName },
            { filePath: filePath },
            { filePath: { $like: `%${fileName}%` } }
          ]
        }
      });

      if (expenseRef) return false;

      // Check if file is referenced in saved receipts
      const savedReceiptRef = await SavedReceipt.findOne({
        where: {
          $or: [
            { originalFilename: fileName },
            { filePath: filePath },
            { filePath: { $like: `%${fileName}%` } }
          ]
        }
      });

      if (savedReceiptRef) return false;

      // Check if file is in any active session (pending receipt)
      const { Op } = require('sequelize');
      const sessionRef = await Session.findOne({
        where: {
          [Op.or]: [
            { currentReceipt: { [Op.ne]: null } },
            { 'metadata.currentReceipt': { [Op.ne]: null } }
          ]
        }
      });

      // Check if this specific file is referenced in any session
      if (sessionRef) {
        const sessions = await Session.findAll({
          where: {
            [Op.or]: [
              { currentReceipt: { [Op.ne]: null } },
              { 'metadata.currentReceipt': { [Op.ne]: null } }
            ]
          }
        });

        for (const session of sessions) {
          const receipt = session.currentReceipt || session.metadata?.currentReceipt;
          if (receipt && (receipt.filePath === filePath || receipt.filePath?.includes(fileName))) {
            return false; // File is actively being processed
          }
        }
      }

      return true; // File is orphaned
    } catch (error) {
      console.error(`❌ Error checking file references for ${fileName}:`, error);
      return false; // Don't delete if we can't verify
    }
  }

  // Get all files in uploads directory with metadata
  async getAllUploadedFiles() {
    try {
      const files = [];

      // Check if uploads directory exists
      try {
        await fs.access(this.uploadsDir);
      } catch {
        console.log('📁 Uploads directory does not exist, creating...');
        await fs.mkdir(this.uploadsDir, { recursive: true });
        return files;
      }

      const items = await fs.readdir(this.uploadsDir);

      for (const item of items) {
        const itemPath = path.join(this.uploadsDir, item);
        try {
          const stats = await fs.stat(itemPath);

          if (stats.isFile()) {
            files.push({
              name: item,
              path: itemPath,
              size: stats.size,
              mtime: stats.mtime.getTime(),
              age: Date.now() - stats.mtime.getTime()
            });
          }
        } catch (error) {
          console.error(`❌ Error getting stats for ${item}:`, error);
        }
      }

      return files;
    } catch (error) {
      console.error('❌ Error reading uploads directory:', error);
      return [];
    }
  }

  // Schedule cleanup for a specific file
  async scheduleFileCleanup(filePath, delayMinutes = 60) {
    setTimeout(async () => {
      try {
        // Check if file still exists and is not referenced
        if (await this.fileExists(filePath)) {
          const fileName = path.basename(filePath);
          const isOrphaned = await this.isFileOrphaned(filePath, fileName);

          if (isOrphaned) {
            await fs.unlink(filePath);
            console.log(`🗑️ Scheduled cleanup: deleted ${fileName}`);
          }
        }
      } catch (error) {
        console.error(`❌ Scheduled cleanup failed for ${filePath}:`, error);
      }
    }, delayMinutes * 60 * 1000);
  }

  // Check if file exists
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // Format file age for display
  formatAge(timestamp) {
    const ageMs = Date.now() - timestamp;
    const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
    const ageMinutes = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60));

    if (ageHours > 0) {
      return `${ageHours}h ${ageMinutes}m old`;
    } else {
      return `${ageMinutes}m old`;
    }
  }

  // Manual cleanup trigger for admin/debugging
  async runManualCleanup() {
    console.log('🧹 Starting manual file cleanup...');

    const orphanedCount = await this.cleanupOrphanedFiles();
    const oldFilesCount = await this.cleanupOldTempFiles();

    console.log(`✅ Manual cleanup completed: ${orphanedCount + oldFilesCount} files deleted`);
    return { orphanedCount, oldFilesCount };
  }

  // Get cleanup stats for monitoring
  async getCleanupStats() {
    try {
      const files = await this.getAllUploadedFiles();
      const cutoffTime = Date.now() - this.orphanFileAge;

      let orphanedCount = 0;
      let oldCount = 0;
      let totalSize = 0;

      for (const file of files) {
        totalSize += file.size;

        if (file.mtime < cutoffTime) {
          const isOrphaned = await this.isFileOrphaned(file.path, file.name);
          if (isOrphaned) orphanedCount++;
        }

        if (file.mtime < (Date.now() - this.maxFileAge)) {
          oldCount++;
        }
      }

      return {
        totalFiles: files.length,
        totalSize: Math.round(totalSize / 1024 / 1024 * 100) / 100, // MB
        orphanedFiles: orphanedCount,
        oldFiles: oldCount,
        uploadsDir: this.uploadsDir
      };
    } catch (error) {
      console.error('❌ Error getting cleanup stats:', error);
      return null;
    }
  }
}

module.exports = FileCleanupManager;