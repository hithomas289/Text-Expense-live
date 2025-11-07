const path = require('path');
const FileUtils = require('../utils/fileUtils');
const ImageCompressionService = require('./ImageCompressionService');
const S3Service = require('./S3Service');

class MediaService {
  constructor(whatsAppService) {
    this.whatsAppService = whatsAppService;

    // Handle both development and production environments
    // Production (Docker/Railway): /app/uploads
    // Development: ./uploads relative to project root
    this.uploadsDir = process.env.NODE_ENV === 'production'
      ? '/app/uploads'
      : path.join(__dirname, '../../uploads');


    this.compressionService = new ImageCompressionService();
    this.s3Service = new S3Service();

    // Start automatic cleanup
    this.startCleanupSchedule();
  }

  async initialize() {
    await FileUtils.ensureDir(this.uploadsDir);

    // Initialize S3 lifecycle policies if S3 is configured
    try {
      const s3Health = await this.s3Service.healthCheck();
      if (s3Health.configured && s3Health.status === 'healthy') {
        await this.s3Service.setLifecyclePolicy();
      }
    } catch (error) {
      console.warn('⚠️ Failed to initialize S3 lifecycle policies:', error.message);
    }
  }

  // Start scheduled file cleanup to prevent disk space issues
  startCleanupSchedule() {
    // Clean up old files every 6 hours
    setInterval(async () => {
      try {
        const deletedCount = await this.cleanupOldFiles(1); // Files older than 1 day
      } catch (error) {
        console.error('❌ File cleanup failed:', error);
      }
    }, 6 * 60 * 60 * 1000); // Every 6 hours
  }

  async downloadAndSaveMedia(message, phoneNumber) {
    try {
      let mediaId;
      let originalFilename = '';
      
      // Extract media ID based on message type
      if (message.type === 'image') {
        mediaId = message.image?.id;
        originalFilename = 'image'; // Will get proper extension added later
      } else if (message.type === 'document') {
        mediaId = message.document?.id;
        originalFilename = message.document?.filename || 'document';
      } else {
        throw new Error(`Unsupported message type: ${message.type}`);
      }

      if (!mediaId) {
        throw new Error('Media ID not found in message');
      }

      // Download media from WhatsApp
      const mediaData = await this.whatsAppService.downloadMedia(mediaId);
      
      // Validate file size (max 20MB)
      if (!FileUtils.isValidFileSize(mediaData.size, 20)) {
        throw new Error('File size exceeds 20MB limit. Please use a smaller image or document.');
      }

      // Validate file type for images
      if (message.type === 'image' && !FileUtils.isValidImageType(mediaData.mimeType)) {
        throw new Error(`Unsupported image type: ${mediaData.mimeType}`);
      }

      // Generate unique filename
      const fileExtension = FileUtils.getExtensionFromMimeType(mediaData.mimeType);
      const uniqueFilename = FileUtils.generateUniqueFileName(
        originalFilename, 
        fileExtension
      );

      // Create user-specific directory using properly formatted phone number
      const PhoneNumberService = require('./PhoneNumberService');
      const phoneService = new PhoneNumberService();
      const phoneData = phoneService.parsePhoneNumber(phoneNumber);
      
      // Use E.164 format without + for directory name (e.g., 919603216152)
      const dirName = phoneData.formatted.replace(/\+/g, '');
      const userDir = path.join(this.uploadsDir, dirName);
      await FileUtils.ensureDir(userDir);

      // Save file locally first (as backup and for processing)
      const filePath = path.join(userDir, uniqueFilename);
      await FileUtils.saveStreamToFile(mediaData.stream, filePath);

      const fileStats = await FileUtils.getFileStats(filePath);

      // Skip S3 upload during initial processing - will upload later when expense is saved

      return {
        filePath,
        filename: uniqueFilename,
        originalFilename,
        mimeType: mediaData.mimeType,
        size: fileStats.size,
        sizeFormatted: FileUtils.formatFileSize(fileStats.size),
        mediaId,
        downloadedAt: new Date(),
        s3Data: null // No S3 upload yet - will happen when expense is saved
      };

    } catch (error) {
      console.error('Error downloading media:', error);
      throw new Error(`Failed to download media: ${error.message}`);
    }
  }

  /*
   * Compress image after OCR processing to save storage space
   * @param {Object} mediaInfo - Media info from downloadAndSaveMedia
   * @returns {Object} Compression result with paths
   */
  async compressImageAfterOCR(mediaInfo) {
    try {
      // Only compress images (not PDFs or documents)
      const isImage = mediaInfo.mimeType?.startsWith('image/');
      if (!isImage) {
        return {
          success: false,
          reason: 'not_image',
          originalPath: mediaInfo.filePath,
          compressedPath: null
        };
      }

      // Check if compression is beneficial (skip very small files)
      const shouldCompress = await this.compressionService.shouldCompress(mediaInfo.filePath, 0.2);
      if (!shouldCompress) {
        return {
          success: false,
          reason: 'too_small',
          originalPath: mediaInfo.filePath,
          compressedPath: null
        };
      }

      // Generate compressed filename
      const compressedFilename = this.compressionService.getCompressedFilename(mediaInfo.filename);
      const compressedPath = path.join(path.dirname(mediaInfo.filePath), compressedFilename);

      // Compress the image
      const compressionResult = await this.compressionService.compressImage(
        mediaInfo.filePath,
        compressedPath
      );

      if (compressionResult.success) {
        // Optionally delete original to save space (after a delay to ensure OCR is complete)
        setTimeout(async () => {
          try {
            await this.compressionService.cleanupOriginal(mediaInfo.filePath);
          } catch (error) {
            console.error('Failed to cleanup original file:', error);
          }
        }, 30000); // Wait 30 seconds before cleanup

        return {
          success: true,
          originalPath: mediaInfo.filePath,
          compressedPath: compressedPath,
          compressedFilename: compressedFilename,
          originalSizeMB: compressionResult.originalSizeMB,
          compressedSizeMB: compressionResult.compressedSizeMB,
          spaceSavedPercent: compressionResult.spaceSavedPercent,
          compressionRatio: compressionResult.compressionRatio
        };
      } else {
        console.error('❌ Compression failed:', compressionResult.error);
        return {
          success: false,
          reason: 'compression_failed',
          error: compressionResult.error,
          originalPath: mediaInfo.filePath,
          compressedPath: null
        };
      }

    } catch (error) {
      console.error('Image compression error:', error);
      return {
        success: false,
        reason: 'error',
        error: error.message,
        originalPath: mediaInfo?.filePath,
        compressedPath: null
      };
    }
  }

  async cleanupOldFiles(maxAgeDays = 7) {
    try {
      const fs = require('fs').promises;
      const userDirs = await fs.readdir(this.uploadsDir);

      let totalDeleted = 0;

      for (const userDir of userDirs) {
        const userDirPath = path.join(this.uploadsDir, userDir);
        const stats = await FileUtils.getFileStats(userDirPath);

        if (stats && stats.isDirectory) {
          const deleted = await FileUtils.cleanOldFiles(userDirPath, maxAgeDays);
          totalDeleted += deleted;
        }
      }

      return totalDeleted;
    } catch (error) {
      console.error('Error during cleanup:', error);
      return 0;
    }
  }

  async deleteUserFiles(phoneNumber) {
    try {
      // Use consistent phone number formatting
      const PhoneNumberService = require('./PhoneNumberService');
      const phoneService = new PhoneNumberService();
      const phoneData = phoneService.parsePhoneNumber(phoneNumber);
      const dirName = phoneData.formatted.replace(/\+/g, '');
      
      const userDir = path.join(this.uploadsDir, dirName);
      const fs = require('fs').promises;
      
      const files = await fs.readdir(userDir);
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(userDir, file);
        const deleted = await FileUtils.deleteFile(filePath);
        if (deleted) deletedCount++;
      }
      
      // Remove empty directory
      try {
        await fs.rmdir(userDir);
      } catch (error) {
        // Directory not empty or other error - silently continue
      }
      
      return deletedCount;
    } catch (error) {
      console.error(`Error deleting user files for ${phoneNumber}:`, error);
      return 0;
    }
  }

  getFileUrl(filePath) {
    // For local storage, return relative path from uploads
    const relativePath = path.relative(this.uploadsDir, filePath);
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  }

  /*
   * Upload file to S3 with retry and error handling
   * @param {string} phoneNumber - User's phone number
   * @param {string} filePath - Local file path
   * @param {string} originalFilename - Original filename from WhatsApp
   * @param {string} mimeType - File MIME type
   * @returns {Promise<object>} S3 upload result
   */
  async uploadToS3(phoneNumber, filePath, originalFilename, mimeType) {
    try {
      // Read file buffer
      const fs = require('fs').promises;
      const fileBuffer = await fs.readFile(filePath);
      
      // Upload to S3
      const s3Result = await this.s3Service.uploadReceiptFile(
        phoneNumber,
        fileBuffer,
        originalFilename,
        mimeType
      );
      
      if (s3Result.success) {
        // Schedule local file cleanup (60 minutes to match user messaging)
        this.scheduleLocalCleanup(filePath, 60 * 60 * 1000); // 60 minutes

        return s3Result;
      } else {
        console.warn(`⚠️ S3 upload failed: ${s3Result.error}`);
        console.warn(`⚠️ Check AWS environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME`);
        
        // Schedule retry
        this.scheduleS3Retry(phoneNumber, filePath, originalFilename, mimeType);
        
        return {
          success: false,
          error: s3Result.error,
          fallbackMode: true
        };
      }
      
    } catch (error) {
      console.error(`❌ S3 upload error for ${phoneNumber}:`, error);
      
      // Schedule retry
      this.scheduleS3Retry(phoneNumber, filePath, originalFilename, mimeType);
      
      return {
        success: false,
        error: error.message,
        fallbackMode: true
      };
    }
  }

  /*
   * Schedule S3 retry for failed uploads
   * @param {string} phoneNumber - User's phone number
   * @param {string} filePath - Local file path
   * @param {string} originalFilename - Original filename
   * @param {string} mimeType - File MIME type
   */
  scheduleS3Retry(phoneNumber, filePath, originalFilename, mimeType) {
    // Retry after 5 minutes
    setTimeout(async () => {
      try {
        const retryResult = await this.uploadToS3(phoneNumber, filePath, originalFilename, mimeType);

        if (retryResult.success) {
          // Update database record if possible
          await this.updateReceiptS3Info(phoneNumber, originalFilename, retryResult);
        } else {
          console.warn(`⚠️ S3 retry failed for ${originalFilename}`);
        }
      } catch (error) {
        console.error(`❌ S3 retry error for ${originalFilename}:`, error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /*
   * Update receipt record with S3 information
   * @param {string} phoneNumber - User's phone number
   * @param {string} originalFilename - Original filename
   * @param {object} s3Data - S3 upload result
   */
  async updateReceiptS3Info(phoneNumber, originalFilename, s3Data) {
    try {
      const { User } = require('../models/database/indexV2');
      const ExpenseV2 = require('../models/database/ExpenseV2');
      
      // Find user
      const user = await User.findByPhoneNumber(phoneNumber);
      if (!user) return;
      
      // Find expense by filename (approximate match)
      const expense = await ExpenseV2.findOne({
        where: {
          userId: user.id,
          originalDocumentUrl: originalFilename
        },
        order: [['createdAt', 'DESC']]
      });
      
      if (expense) {
        // Update ExpenseV2 with S3 URL directly
        await expense.update({
          originalDocumentUrl: s3Data.url || s3Data.s3Url
        });
      }
      
    } catch (error) {
      console.error('Error updating receipt S3 info:', error);
    }
  }

  /*
   * Schedule local file cleanup after S3 upload
   * @param {string} filePath - Local file path
   * @param {number} delay - Delay in milliseconds
   */
  scheduleLocalCleanup(filePath, delay) {
    setTimeout(async () => {
      try {
        const fs = require('fs').promises;
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`⚠️ Failed to cleanup local file ${filePath}:`, error.message);
        }
      }
    }, delay);
  }

  /*
   * Health check for storage services
   * @returns {Promise<object>} Health status
   */
  async getStorageHealth() {
    const localHealth = {
      status: 'healthy',
      type: 'local',
      path: this.uploadsDir
    };
    
    const s3Health = await this.s3Service.healthCheck();
    
    return {
      local: localHealth,
      s3: s3Health,
      primary: s3Health.configured && s3Health.status === 'healthy' ? 's3' : 'local'
    };
  }

  async validateReceiptFile(filePath, mimeType) {
    try {
      const stats = await FileUtils.getFileStats(filePath);
      
      if (!stats || !stats.isFile) {
        return { valid: false, error: 'File not found or not readable' };
      }

      // Check file size
      if (!FileUtils.isValidFileSize(stats.size, 10)) {
        return { valid: false, error: 'File size exceeds 10MB limit' };
      }

      // Check if it's a supported receipt format
      const supportedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'application/pdf'
      ];

      if (!supportedTypes.includes(mimeType)) {
        return { valid: false, error: `Unsupported file type: ${mimeType}` };
      }

      return { 
        valid: true, 
        size: stats.size,
        sizeFormatted: FileUtils.formatFileSize(stats.size),
        type: mimeType
      };

    } catch (error) {
      return { valid: false, error: `File validation error: ${error.message}` };
    }
  }
}

module.exports = MediaService;