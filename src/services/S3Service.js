const AWS = require('aws-sdk');
const path = require('path');
const crypto = require('crypto');

class S3Service {
  constructor() {
    // Initialize AWS S3 with environment variables
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      signatureVersion: 'v4'
    });
    
    this.bucketName = process.env.S3_BUCKET_NAME || 'textexpense';
    
    // Security configuration
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'];
    
    
    // Validate configuration on startup
    this.validateConfiguration();
  }

  /*
   * Validate AWS configuration
   */
  validateConfiguration() {
    const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME'];
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      this.isConfigured = false;
      return;
    }
    
    this.isConfigured = true;
  }

  /*
   * Check if S3 is properly configured
   * @returns {boolean}
   */
  isS3Configured() {
    return this.isConfigured;
  }

  /*
   * Validate file security
   * @param {string} filename - Original filename
   * @param {string} mimeType - File MIME type
   * @param {number} fileSize - File size in bytes
   * @returns {object} Validation result
   */
  validateFile(filename, mimeType, fileSize) {
    const errors = [];
    
    // File size validation
    if (fileSize > this.maxFileSize) {
      errors.push(`File size ${Math.round(fileSize / 1024 / 1024)}MB exceeds limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }
    
    // MIME type validation
    if (!this.allowedMimeTypes.includes(mimeType)) {
      errors.push(`File type ${mimeType} not allowed`);
    }
    
    // Extension validation
    const ext = path.extname(filename).toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      errors.push(`File extension ${ext} not allowed`);
    }
    
    // Filename security (prevent path traversal)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      errors.push('Invalid filename - contains unsafe characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /*
   * Generate secure S3 key for file storage
   * @param {string} phoneNumber - User's phone number
   * @param {string} originalFilename - Original filename
   * @param {string} folderType - 'Expense_Process' or 'Expense_Vault'
   * @returns {string} S3 key
   */
  generateS3Key(phoneNumber, originalFilename, folderType = 'Expense_Process') {
    // Use formatted phone number (without +)
    const PhoneNumberService = require('./PhoneNumberService');
    const phoneService = new PhoneNumberService();
    const phoneData = phoneService.parsePhoneNumber(phoneNumber);
    const cleanPhoneNumber = phoneData.formatted.replace(/\+/g, '');

    // Generate timestamp
    const timestamp = new Date().toISOString()
      .slice(0, 19)
      .replace(/:/g, '-')
      .replace('T', '_');

    // Sanitize filename
    const sanitizedFilename = this.sanitizeFilename(originalFilename);

    // Generate unique suffix to prevent collisions
    const uniqueSuffix = crypto.randomBytes(4).toString('hex');

    return `receipts/${cleanPhoneNumber}/${folderType}/${timestamp}_${uniqueSuffix}_${sanitizedFilename}`;
  }

  /*
   * Sanitize filename for safe storage
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .toLowerCase();
  }

  /*
   * Upload file to S3 with security measures
   * @param {string} phoneNumber - User's phone number
   * @param {Buffer} fileBuffer - File data
   * @param {string} originalFilename - Original filename
   * @param {string} mimeType - File MIME type
   * @param {string} folderType - 'Expense_Process' or 'Expense_Vault'
   * @returns {Promise<object>} Upload result
   */
  async uploadReceiptFile(phoneNumber, fileBuffer, originalFilename, mimeType, folderType = 'Expense_Process') {
    try {
      
      // Check if S3 is configured
      if (!this.isS3Configured()) {
        throw new Error('S3 not configured - check environment variables');
      }
      
      // Validate file security
      const validation = this.validateFile(originalFilename, mimeType, fileBuffer.length);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Generate secure S3 key
      const s3Key = this.generateS3Key(phoneNumber, originalFilename, folderType);
      
      // Prepare upload parameters with security settings
      const uploadParams = {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: mimeType,
        Metadata: {
          'original-filename': originalFilename,
          'user-phone': phoneNumber.replace(/\+/g, ''), // Remove + for metadata
          'upload-timestamp': new Date().toISOString(),
          'file-size': fileBuffer.length.toString()
        },
        ServerSideEncryption: 'AES256', // Server-side encryption
        StorageClass: 'STANDARD', // Use standard storage
        ACL: 'private' // Ensure file is private
      };
      
      // Perform upload with retry logic
      const result = await this.uploadWithRetry(uploadParams, 3);
      
      
      // Generate pre-signed download URL immediately after upload
      const downloadUrl = await this.generateDownloadUrl(s3Key, originalFilename);
      
      return {
        success: true,
        s3Key: s3Key,
        s3Bucket: this.bucketName,
        originalFilename: originalFilename,
        fileSize: fileBuffer.length,
        mimeType: mimeType,
        location: result.Location,
        etag: result.ETag,
        url: downloadUrl,  // Include the actual download URL
        publicUrl: result.Location  // AWS public location (if bucket is public)
      };
      
    } catch (error) {
      console.error(`❌ S3 upload failed for ${phoneNumber}:`, error);
      return {
        success: false,
        error: error.message,
        originalFilename: originalFilename
      };
    }
  }

  /*
   * Upload with retry mechanism
   * @param {object} uploadParams - S3 upload parameters
   * @param {number} retries - Number of retries
   * @returns {Promise<object>} Upload result
   */
  async uploadWithRetry(uploadParams, retries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        
        const result = await this.s3.upload(uploadParams).promise();
        return result;
        
      } catch (error) {
        lastError = error;
        
        if (attempt < retries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /*
   * Generate pre-signed URL for secure file access
   * @param {string} s3Key - S3 object key
   * @param {number} expiresIn - URL expiration in seconds (default 1 hour)
   * @param {string} responseContentDisposition - Content disposition header
   * @returns {Promise<string>} Pre-signed URL
   */
  async generatePresignedUrl(s3Key, expiresIn = 3600, responseContentDisposition = null) {
    try {
      if (!this.isS3Configured()) {
        throw new Error('S3 not configured');
      }

      // Validate expiry time - AWS S3 SigV4 limit is 7 days (604,800 seconds)
      const maxExpiry = 7 * 24 * 60 * 60; // 7 days = 604,800 seconds
      if (expiresIn > maxExpiry) {
        expiresIn = maxExpiry;
      }


      const params = {
        Bucket: this.bucketName,
        Key: s3Key,
        Expires: expiresIn,
        ResponseContentDisposition: responseContentDisposition
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);


      return url;
      
    } catch (error) {
      console.error(`❌ Failed to generate pre-signed URL for ${s3Key}:`, error);
      throw error;
    }
  }

  /*
   * Generate pre-signed URL for receipt downloads (used in expenses table)
   * @param {string} s3Key - S3 object key
   * @param {string} originalFilename - Original filename for download
   * @param {number} expiresIn - URL expiration in seconds (default 7 days - AWS maximum)
   * @returns {Promise<string>} Pre-signed URL with proper filename
   */
  async generateDownloadUrl(s3Key, originalFilename, expiresIn = 604800) {
    const disposition = `attachment; filename="${originalFilename}"`;
    return await this.generatePresignedUrl(s3Key, expiresIn, disposition);
  }

  /*
   * Generate long-lived download URL for Excel reports (3 months expiration)
   * @param {string} s3Key - S3 object key
   * @param {string} originalFilename - Original filename for download
   * @returns {Promise<string>} Pre-signed URL with 3-month expiration
   */
  async generateExcelReportUrl(s3Key, originalFilename) {
    const sevenDays = 7 * 24 * 60 * 60; // 7 days in seconds = 604,800 seconds (AWS limit)
    const disposition = `attachment; filename="${originalFilename}"`;
    return await this.generatePresignedUrl(s3Key, sevenDays, disposition);
  }

  /*
   * Generate iOS-compatible proxy URL for Excel hyperlinks
   * Uses server proxy endpoint instead of direct S3 URLs for iOS Numbers compatibility
   * @param {string} s3Key - S3 object key
   * @returns {string} Proxy URL that works on both iOS Numbers and Android Excel
   */
  generateProxyUrl(s3Key) {
    if (!s3Key) {
      return null;
    }

    // Encode S3 key as base64 for URL safety
    const encodedKey = Buffer.from(s3Key).toString('base64');

    // Use environment variable for base URL
    const baseUrl = process.env.BASE_URL || 'https://web-production-0178dc.up.railway.app';

    return `${baseUrl}/receipt-download/${encodedKey}`;
  }

  /*
   * Delete file from S3
   * @param {string} s3Key - S3 object key to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(s3Key) {
    try {
      if (!this.isS3Configured()) {
        return false;
      }
      
      const params = {
        Bucket: this.bucketName,
        Key: s3Key
      };
      
      await this.s3.deleteObject(params).promise();
      
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to delete S3 file ${s3Key}:`, error);
      return false;
    }
  }

  /*
   * Check if file exists in S3
   * @param {string} s3Key - S3 object key
   * @returns {Promise<boolean>} File exists status
   */
  async fileExists(s3Key) {
    try {
      if (!this.isS3Configured()) {
        return false;
      }
      
      const params = {
        Bucket: this.bucketName,
        Key: s3Key
      };
      
      await this.s3.headObject(params).promise();
      return true;
      
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /*
   * Get file metadata from S3
   * @param {string} s3Key - S3 object key
   * @returns {Promise<object>} File metadata
   */
  async getFileMetadata(s3Key) {
    try {
      if (!this.isS3Configured()) {
        throw new Error('S3 not configured');
      }
      
      const params = {
        Bucket: this.bucketName,
        Key: s3Key
      };
      
      const result = await this.s3.headObject(params).promise();
      
      return {
        size: result.ContentLength,
        lastModified: result.LastModified,
        contentType: result.ContentType,
        etag: result.ETag,
        metadata: result.Metadata
      };
      
    } catch (error) {
      console.error(`❌ Failed to get metadata for ${s3Key}:`, error);
      throw error;
    }
  }

  /*
   * Set lifecycle policy for automatic cleanup (3 months)
   * @returns {Promise<boolean>} Success status
   */
  async setLifecyclePolicy() {
    try {
      if (!this.isS3Configured()) {
        return false;
      }
      
      const params = {
        Bucket: this.bucketName,
        LifecycleConfiguration: {
          Rules: [
            {
              ID: 'ReceiptCleanup',
              Status: 'Enabled',
              Filter: {
                Prefix: 'receipts/'
              },
              Transitions: [
                {
                  Days: 90, // 3 months
                  StorageClass: 'GLACIER'
                }
              ],
              Expiration: {
                Days: 1095 // 3 years (after 3 months in Glacier)
              }
            }
          ]
        }
      };
      
      await this.s3.putBucketLifecycleConfiguration(params).promise();
      return true;
      
    } catch (error) {
      console.error('❌ Failed to set S3 lifecycle policy:', error);
      return false;
    }
  }

  /*
   * Health check for S3 service
   * @returns {Promise<object>} Health status
   */
  async healthCheck() {
    try {
      if (!this.isS3Configured()) {
        return {
          status: 'warning',
          message: 'S3 not configured - using local storage',
          configured: false
        };
      }
      
      // Test S3 connection
      await this.s3.headBucket({ Bucket: this.bucketName }).promise();
      
      return {
        status: 'healthy',
        message: 'S3 connection successful',
        bucket: this.bucketName,
        configured: true
      };
      
    } catch (error) {
      return {
        status: 'error',
        message: `S3 connection failed: ${error.message}`,
        configured: true,
        error: error.code
      };
    }
  }
}

module.exports = S3Service;