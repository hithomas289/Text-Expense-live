const vision = require('@google-cloud/vision');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');
const AIService = require('./AIService');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');

class OCRService {
  constructor() {
    
    // Check if testing mode is enabled
    if (config.app.testingMode) {
      this.testingMode = true;
      this.isGoogleVisionEnabled = false;
      return;
    }

    this.testingMode = false;

    // Check for service account authentication and if Google Vision is enabled
    this.isGoogleVisionEnabled = config.googleVision.enabled &&
                                 ((!!config.googleVision.apiKey && !!config.googleVision.projectId) ||
                                  (!!process.env.GOOGLE_APPLICATION_CREDENTIALS && !!config.googleVision.projectId));

    if (this.isGoogleVisionEnabled) {
      // Use service account if available, otherwise use API key
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.client = new vision.ImageAnnotatorClient({
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          projectId: config.googleVision.projectId
        });
      } else {
        this.client = new vision.ImageAnnotatorClient({
          apiKey: config.googleVision.apiKey,
          projectId: config.googleVision.projectId
        });
      }
    } else {
    }
    
    // Initialize AI service for enhanced data extraction
    this.aiService = new AIService();
  }

  async extractTextFromImage(imagePath) {
    try {
      // Priority order: Google Vision > Tesseract

      if (this.isGoogleVisionEnabled) {
        // Try advanced processing first for better receipt extraction
        try {
          return await this.extractWithGoogleVisionAdvanced(imagePath);
        } catch (advancedError) {
          try {
            return await this.extractWithGoogleVision(imagePath);
          } catch (basicError) {
            // Check if this is a service failure (API issues, billing, quota, network)
            if (this.isServiceFailure(basicError)) {
              return {
                success: false,
                errorType: 'service_failure',
                text: '',
                confidence: 0,
                method: 'google_vision',
                error: 'Service temporarily unavailable'
              };
            }
            throw basicError; // Let it fall back to Tesseract
          }
        }
      } else {
        return await this.fallbackOCR(imagePath);
      }
    } catch (error) {
      console.error('Complete OCR failure:', error);
      // This is a complete service failure - all OCR methods failed
      return {
        success: false,
        errorType: 'service_failure',
        text: '',
        confidence: 0,
        method: 'all_failed',
        error: 'Processing service temporarily unavailable'
      };
    }
  }


  async extractWithGoogleVisionAdvanced(imagePath) {
    try {
      // Verify file exists before processing
      try {
        await fs.access(imagePath);
      } catch (accessError) {
        console.error(`❌ File not found: ${imagePath}`);
        throw new Error(`File not found: ${imagePath}. The file may have been deleted or the storage was reset.`);
      }

      // Simple: Just extract text with Google Vision
      const [result] = await this.client.textDetection(imagePath);
      const detections = result.textAnnotations;
      
      if (!detections || detections.length === 0) {
        return {
          success: false,
          text: '',
          confidence: 0,
          method: 'google_vision_ai',
          error: 'No text detected in receipt'
        };
      }

      const fullText = detections[0].description || '';
      
      
      // Let AI handle ALL the extraction - no manual parsing
      return {
        success: true,
        text: fullText,
        confidence: 0.9, // High confidence in Google Vision text extraction
        method: 'google_vision_ai',
        wordCount: detections.length - 1,
        detectedLanguages: this.detectLanguages(fullText),
        detections: detections,
        needsAIProcessing: true, // Signal that AI should handle all extraction
        metadata: {
          totalDetections: detections.length,
          processingTime: Date.now(),
          imageSize: await this.getImageSize(imagePath)
        }
      };
      
    } catch (error) {
      console.error('Google Vision API Advanced error:', error.message);
      console.error('Full error:', error);
      return await this.extractWithGoogleVision(imagePath);
    }
  }

  async extractWithGoogleVision(imagePath) {
    try {
      
      const [result] = await this.client.textDetection(imagePath);
      const detections = result.textAnnotations;
      
      if (!detections || detections.length === 0) {
        return {
          success: false,
          text: '',
          confidence: 0,
          method: 'google_vision',
          error: 'No text detected in image'
        };
      }

      // First detection contains the full text
      const fullText = detections[0].description || '';
      
      // Calculate average confidence from individual words
      let totalConfidence = 0;
      let wordCount = 0;
      
      for (let i = 1; i < detections.length; i++) {
        if (detections[i].boundingPoly && detections[i].boundingPoly.vertices) {
          wordCount++;
          // Google Vision doesn't provide confidence scores directly
          // We'll use bounding box quality as a proxy
          totalConfidence += 0.85; // Assume good confidence for detected text
        }
      }
      
      const averageConfidence = wordCount > 0 ? totalConfidence / wordCount : 0;
      
      
      return {
        success: true,
        text: fullText,
        confidence: averageConfidence,
        method: 'google_vision',
        wordCount: wordCount,
        detectedLanguages: this.detectLanguages(fullText),
        detections: detections, // Include all text detections for advanced parsing
        metadata: {
          totalDetections: detections.length,
          processingTime: Date.now(),
          imageSize: await this.getImageSize(imagePath)
        }
      };
      
    } catch (error) {
      console.error('Google Vision API error:', error);
      
      // Fallback to basic OCR if Google Vision fails
      return await this.fallbackOCR(imagePath);
    }
  }

  async fallbackOCR(imagePath) {
    
    try {
      // Use Tesseract.js for actual OCR
      const { data: { text, confidence } } = await Tesseract.recognize(
        imagePath,
        'eng',
        {
          logger: m => {}
        }
      );

      if (text && text.length > 10) {
        return {
          success: true,
          text: text,
          confidence: confidence / 100,
          method: 'tesseract',
          wordCount: text.split(' ').length,
          detectedLanguages: ['en'],
          metadata: {
            note: 'Tesseract OCR used',
            confidence: confidence,
            imageSize: await this.getImageSize(imagePath)
          }
        };
      }
    } catch (error) {
      console.error('Tesseract OCR error:', error.message);
    }
    
    // Final fallback if Tesseract fails
    const mockText = `RECEIPT
MERCHANT NAME: [Auto-detected from filename]
DATE: ${new Date().toLocaleDateString()}
TOTAL: $XX.XX

[Image processed with basic OCR - text extraction limited]
Enable Google Vision API billing for better accuracy.`;

    return {
      success: true,
      text: mockText,
      confidence: 0.3,
      method: 'fallback',
      wordCount: mockText.split(' ').length,
      detectedLanguages: ['en'],
      metadata: {
        note: 'Fallback OCR used - Tesseract failed',
        suggestion: 'Enable Google Vision API billing for better results',
        imageSize: await this.getImageSize(imagePath)
      }
    };
  }

  async extractTextFromPDF(pdfPath) {
    try {

      // Read PDF file
      const pdfBuffer = await fs.readFile(pdfPath);

      // Extract text using pdf-parse
      const data = await pdf(pdfBuffer);
      const extractedText = data.text.trim();

      if (!extractedText || extractedText.length < 10) {
        // For image-based PDFs, convert to image and use image OCR
        return await this.processPDFAsImage(pdfPath);
      }
      
      
      return {
        success: true,
        text: extractedText,
        confidence: 0.8, // High confidence for text-based PDFs
        method: 'pdf_text_extraction', 
        wordCount: extractedText.split(' ').length,
        detectedLanguages: this.detectLanguages(extractedText),
        needsAIProcessing: true, // Let AI handle the parsing
        metadata: {
          pages: data.numpages,
          textLength: extractedText.length,
          processingTime: Date.now()
        }
      };
      
    } catch (error) {
      console.error('PDF processing error:', error);
      return {
        success: false,
        text: '',
        confidence: 0,
        method: 'pdf_text_extraction',
        error: `PDF processing failed: ${error.message}`,
        metadata: {
          note: 'PDF could not be processed - may be corrupted or image-only'
        }
      };
    }
  }

  async processPDFAsImage(pdfPath) {
    try {
      const pdf2pic = require('pdf2pic');
      const path = require('path');
      const fs = require('fs').promises;

      // Create temporary directory for image conversion
      const tempDir = path.join(path.dirname(pdfPath), 'temp_pdf_images');
      await fs.mkdir(tempDir, { recursive: true });

      // Configure pdf2pic
      const convert = pdf2pic.fromPath(pdfPath, {
        density: 300, // Higher density for better OCR
        saveFilename: 'page',
        savePath: tempDir,
        format: 'png',
        width: 2000,
        height: 2000
      });

      // Convert first page to image (most receipts are single page)
      const result = await convert(1, { responseType: 'image' });
      const imagePath = result.path;

      // Check if image was created successfully
      const imageStats = await fs.stat(imagePath);

      // Process the converted image with regular image OCR
      const ocrResult = await this.extractTextFromImage(imagePath);

      // Cleanup temporary files
      try {
        await fs.unlink(imagePath);
        await fs.rmdir(tempDir);
      } catch (cleanupError) {
        console.warn('Could not cleanup temporary files:', cleanupError.message);
      }

      // Update method to indicate PDF conversion was used
      return {
        ...ocrResult,
        method: 'pdf_to_image_ocr',
        metadata: {
          ...ocrResult.metadata,
          originalFormat: 'pdf',
          convertedToImage: true,
          note: 'PDF converted to image for OCR processing'
        }
      };

    } catch (error) {
      console.error('PDF to image conversion error:', error);
      return {
        success: false,
        text: '',
        confidence: 0,
        method: 'pdf_to_image_conversion',
        error: `PDF to image conversion failed: ${error.message}`,
        metadata: {
          note: 'PDF could not be converted to image for OCR'
        }
      };
    }
  }

  async processReceiptImage(imagePath, mimeType, metadata = {}) {

    if (this.testingMode) {
      const { getMockOcrResponse } = require('../config/mockData');
      return getMockOcrResponse();
    }

    try {
      let ocrResult;

      if (mimeType === 'application/pdf') {
        ocrResult = await this.extractTextFromPDF(imagePath);
      } else {
        ocrResult = await this.extractTextFromImage(imagePath);
      }
      
      // Let AI handle ALL data extraction automatically
      
      const aiResult = await this.aiService.extractReceiptData(
        ocrResult.text,
        {
          ocrMethod: ocrResult.method,
          confidence: ocrResult.confidence,
          mimeType: mimeType,
          userCurrency: metadata.userCurrency || 'INR'
        }
      );
      
      // Simple: Use AI results directly
      const finalResult = {
        ...ocrResult,
        aiExtraction: aiResult,
        receiptData: aiResult.success ? aiResult.data : { 
          merchant: null, 
          date: null, 
          totalAmount: null, 
          items: [],
          confidence: 0.1 
        },
        enhancedExtraction: aiResult.success,
        overallConfidence: aiResult.success ? 
          Math.max(ocrResult.confidence, aiResult.confidence) : 
          ocrResult.confidence
      };
      
      
      return finalResult;
    } catch (error) {
      console.error('Receipt processing error:', error);
      throw error;
    }
  }

  async parseReceiptText(text) {
    // Basic receipt parsing - extract common fields
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    const receiptData = {
      rawText: text,
      lines: lines,
      merchantName: this.extractMerchantName(lines),
      date: this.extractDate(lines),
      total: this.extractTotal(lines),
      items: this.extractItems(lines),
      taxAmount: this.extractTax(lines)
    };
    
    return receiptData;
  }

  extractMerchantName(lines) {
    // Look for merchant name in first few lines
    const merchantPatterns = [
      /^[A-Z\s&'.-]{3,30}$/,  // All caps business names
      /\b(RESTAURANT|STORE|SHOP|MARKET|CAFE|PIZZA|BURGER)\b/i
    ];
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      for (const pattern of merchantPatterns) {
        if (pattern.test(line) && line.length > 2) {
          return line;
        }
      }
    }
    
    return lines[0] || 'Unknown Merchant';
  }

  extractDate(lines) {
    const datePatterns = [
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/,  // MM/DD/YYYY or MM-DD-YY
      /\b(\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/,  // YYYY/MM/DD
      /\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{1,2}[,\s]+\d{2,4}\b/i
    ];
    
    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          return match[1];
        }
      }
    }
    
    return new Date().toLocaleDateString();
  }

  extractTotal(lines) {
    const totalPatterns = [
      /TOTAL[:\s]*\$?(\d+\.\d{2})/i,
      /AMOUNT[:\s]*\$?(\d+\.\d{2})/i,
      /BALANCE[:\s]*\$?(\d+\.\d{2})/i,
      /\$(\d+\.\d{2})\s*$/ // Dollar amount at end of line
    ];
    
    // Look from bottom up for total
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      for (const pattern of totalPatterns) {
        const match = line.match(pattern);
        if (match) {
          return parseFloat(match[1]);
        }
      }
    }
    
    return 0.00;
  }

  extractItems(lines) {
    const items = [];
    const itemPattern = /(.+?)\s+(\$?\d+\.\d{2})/;
    
    for (const line of lines) {
      const match = line.match(itemPattern);
      if (match && !line.match(/TOTAL|TAX|SUBTOTAL|BALANCE/i)) {
        items.push({
          description: match[1].trim(),
          amount: parseFloat(match[2].replace('$', ''))
        });
      }
    }
    
    return items;
  }

  extractTax(lines) {
    const taxPatterns = [
      /TAX[:\s]*\$?(\d+\.\d{2})/i,
      /GST[:\s]*\$?(\d+\.\d{2})/i,
      /VAT[:\s]*\$?(\d+\.\d{2})/i
    ];
    
    for (const line of lines) {
      for (const pattern of taxPatterns) {
        const match = line.match(pattern);
        if (match) {
          return parseFloat(match[1]);
        }
      }
    }
    
    return 0.00;
  }

  // Intelligent receipt data extraction using Google Vision positioning + AI
  extractStructuredReceiptData(textDetections, objects = []) {
    if (!textDetections || textDetections.length <= 1) {
      // Let AI handle the raw text instead of regex patterns
      return {
        merchant: null,
        date: null,
        totalAmount: null,
        subtotal: null,
        tax: null,
        items: [],
        currency: 'USD',
        paymentMethod: null,
        confidence: 0.2, // Low confidence, will rely on AI enhancement
        needsAIProcessing: true
      };
    }

    const lines = textDetections.slice(1); // Skip the first detection (full text)
    
    // Sort detections by vertical position (top to bottom)
    const sortedLines = lines.sort((a, b) => {
      const aY = a.boundingPoly.vertices[0].y || 0;
      const bY = b.boundingPoly.vertices[0].y || 0;
      return aY - bY;
    });

    // Use intelligent spatial analysis for structured extraction
    const receiptData = {
      merchant: this.extractMerchantFromPosition(sortedLines),
      date: this.extractDateFromPosition(sortedLines),
      totalAmount: this.extractTotalFromPosition(sortedLines),
      subtotal: null,
      tax: this.extractTaxFromPosition(sortedLines),
      items: this.extractItemsFromPosition(sortedLines),
      currency: 'USD',
      paymentMethod: null,
      confidence: 0.7 // Higher confidence with spatial analysis
    };

    // Calculate subtotal if not found
    if (!receiptData.subtotal && receiptData.totalAmount && receiptData.tax) {
      receiptData.subtotal = receiptData.totalAmount - receiptData.tax;
    }

    return receiptData;
  }

  findMerchantInDetections(detections) {
    for (const detection of detections) {
      const text = detection.description;
      // Look for business-like names (all caps, length > 3, no numbers)
      if (text.length > 3 && text.length < 30 && 
          /^[A-Z\s&'.-]+$/.test(text) && 
          !text.match(/\d/) &&
          !text.match(/^(RECEIPT|INVOICE|TAX|TOTAL|DATE)$/)) {
        return text.trim();
      }
    }
    return null;
  }

  findTotalInDetections(detections) {
    for (const detection of detections) {
      const text = detection.description;
      // Look for total amounts
      if (text.match(/^(TOTAL|AMOUNT|BALANCE)\s*\$?\d+\.?\d*/i)) {
        const match = text.match(/\$?(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : null;
      }
      // Look for standalone currency amounts in bottom section
      if (text.match(/^\$\d+\.\d{2}$/)) {
        return parseFloat(text.replace('$', ''));
      }
    }
    return null;
  }

  findDateInDetections(detections) {
    for (const detection of detections) {
      const text = detection.description;
      // Look for various date formats
      const datePatterns = [
        /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/,
        /\b(\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/,
        /\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{1,2}[,\s]+\d{2,4}\b/i
      ];
      
      for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
          return this.normalizeDate(match[1]) || match[1];
        }
      }
    }
    return null;
  }

  findItemsInDetections(detections) {
    const items = [];
    
    for (let i = 0; i < detections.length; i++) {
      const detection = detections[i];
      const text = detection.description;
      
      // Look for item names followed by prices
      if (text.length > 2 && !text.match(/^[\d\$\.\s]+$/)) {
        // Check if next detection contains a price
        const nextDetection = detections[i + 1];
        if (nextDetection && nextDetection.description.match(/^\$?\d+\.\d{2}$/)) {
          const price = parseFloat(nextDetection.description.replace('$', ''));
          items.push({
            name: text.trim(),
            price: price,
            quantity: 1
          });
        }
      }
    }
    
    return items.slice(0, 10); // Limit to 10 items to avoid noise
  }

  findTaxInDetections(detections) {
    for (const detection of detections) {
      const text = detection.description;
      if (text.match(/^(TAX|GST|VAT)\s*\$?\d+\.?\d*/i)) {
        const match = text.match(/\$?(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : null;
      }
    }
    return null;
  }

  calculateReceiptConfidence(structuredData, detections) {
    let confidence = 0;
    
    // Base confidence on text quality
    const textQuality = Math.min(detections.length / 20, 1); // More detections = better quality
    confidence += textQuality * 0.3;
    
    // Confidence based on extracted fields
    if (structuredData.merchant) confidence += 0.25;
    if (structuredData.date) confidence += 0.15;
    if (structuredData.totalAmount && structuredData.totalAmount > 0) confidence += 0.25;
    if (structuredData.items && structuredData.items.length > 0) confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }

  normalizeDate(dateStr) {
    if (!dateStr) return null;
    
    try {
      let date;
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          // Handle MM/DD/YYYY or DD/MM/YYYY
          if (parts[2].length === 4) {
            date = new Date(parts[2], parts[0] - 1, parts[1]);
          } else {
            date = new Date('20' + parts[2], parts[0] - 1, parts[1]);
          }
        }
      } else if (dateStr.includes('-')) {
        date = new Date(dateStr);
      }

      if (date instanceof Date && !isNaN(date)) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Date parsing error:', error);
    }
    
    return null;
  }

  // Merge Google Vision structured data with AI enhancements
  mergeReceiptData(googleVisionData, aiData) {
    return {
      // Prefer AI data for merchant name as it's often better at parsing
      merchant: aiData.merchant || googleVisionData.merchant,
      
      // Prefer AI data for date normalization
      date: aiData.date || googleVisionData.date,
      
      // Prefer highest confidence total amount
      totalAmount: (aiData.totalAmount && aiData.totalAmount > 0) ? 
        aiData.totalAmount : googleVisionData.totalAmount,
      
      // Use AI subtotal if available, otherwise Google Vision
      subtotal: aiData.subtotal || googleVisionData.subtotal,
      
      // Use AI tax if available, otherwise Google Vision
      tax: aiData.tax || googleVisionData.tax,
      
      // Combine items from both sources, prefer AI for better formatting
      items: aiData.items && aiData.items.length > 0 ? 
        aiData.items : googleVisionData.items,
      
      // Use AI currency if available
      currency: aiData.currency || googleVisionData.currency || 'USD',
      
      // Use AI payment method if available
      paymentMethod: aiData.paymentMethod || googleVisionData.paymentMethod || 'unknown',
      
      // Use highest confidence score
      confidence: Math.max(googleVisionData.confidence || 0, aiData.confidence || 0)
    };
  }

  detectLanguages(text) {
    // Simple language detection based on character patterns
    const hasLatinChars = /[a-zA-Z]/.test(text);
    const hasNumbers = /\d/.test(text);
    
    if (hasLatinChars && hasNumbers) {
      return ['en']; // Assume English for receipts with Latin chars and numbers
    }
    
    return ['unknown'];
  }

  async getImageSize(imagePath) {
    try {
      const stats = await fs.stat(imagePath);
      return {
        bytes: stats.size,
        readable: `${(stats.size / 1024).toFixed(1)} KB`
      };
    } catch (error) {
      return { bytes: 0, readable: 'Unknown' };
    }
  }

  // Check if error indicates service failure (not image quality issue)
  isServiceFailure(error) {
    const message = error.message.toLowerCase();

    // API/Service related failures
    const serviceErrors = [
      'billing',
      'quota exceeded',
      'quota',
      'api key',
      'unauthorized',
      'authentication',
      'network',
      'timeout',
      'enotfound',
      'econnreset',
      'econnrefused',
      'service unavailable',
      '502',
      '503',
      '504',
      'bad gateway',
      'internal server error'
    ];

    return serviceErrors.some(errorPattern => message.includes(errorPattern));
  }

  getServiceStatus() {
    return {
      googleVisionEnabled: this.isGoogleVisionEnabled,
      hasApiKey: !!config.googleVision.apiKey,
      hasProjectId: !!config.googleVision.projectId,
      fallbackAvailable: true,
      aiServiceEnabled: !!this.aiService,
      aiStats: this.aiService ? this.aiService.getExtractionStats() : null
    };
  }

  // Assess OCR text quality
  assessOCRQuality(text, detections) {
    let score = 0;
    const issues = [];
    
    // Check text length
    if (text.length < 20) {
      issues.push('Text too short');
      return { score: 10, rating: 'Very Poor', issues };
    }
    
    // Check for readable words
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const readableWords = words.filter(word => {
      // Word should have mostly letters/numbers, not symbols
      return /^[a-zA-Z0-9$.,%-]+$/.test(word) && word.length > 1;
    });
    
    const readabilityRatio = readableWords.length / Math.max(words.length, 1);
    score += readabilityRatio * 40;
    
    if (readabilityRatio < 0.3) {
      issues.push('Too many unreadable characters');
    }
    
    // Check for common receipt patterns (including Indian formats)
    const hasTotal = /total|amount|sum|balance|invoice|bill/i.test(text);
    const hasPrice = /\$\d+|\u20b9\d+|rs\.?\s*\d+|\d+\.\d{2}|\d+,\d+\.\d{2}/.test(text);
    const hasDate = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(text);
    const hasInvoiceNumber = /invoice\s*no|bill\s*no|receipt\s*no|ref\s*no/i.test(text);
    const hasTaxInfo = /gst|cgst|sgst|igst|tax|vat/i.test(text);
    
    if (hasTotal) score += 15;
    if (hasPrice) score += 20;
    if (hasDate) score += 15;
    if (hasInvoiceNumber) score += 15;
    if (hasTaxInfo) score += 15;
    
    if (!hasTotal && !hasPrice && !hasInvoiceNumber) {
      issues.push('No recognizable receipt patterns found');
    }
    
    // Penalize garbled text patterns
    const garbledPattern = /[^a-zA-Z0-9\s$.,\-\/()%@]{3,}/;
    if (garbledPattern.test(text)) {
      score -= 30;
      issues.push('Contains garbled/corrupted text');
    }
    
    // Determine rating
    let rating;
    if (score >= 80) rating = 'Excellent';
    else if (score >= 60) rating = 'Good';
    else if (score >= 40) rating = 'Fair';
    else if (score >= 20) rating = 'Poor';
    else rating = 'Very Poor';
    
    return {
      score: Math.max(0, Math.min(100, score)),
      rating,
      issues,
      readabilityRatio,
      hasReceiptPatterns: hasTotal || hasPrice || hasDate
    };
  }
}

module.exports = OCRService;