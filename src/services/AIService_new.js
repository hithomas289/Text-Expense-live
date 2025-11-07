const OpenAI = require('openai');
const config = require('../config/config');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  async extractReceiptData(ocrText, metadata) {
    try {
      if (!ocrText || ocrText.trim().length < 10) {
        return this.basicExtraction(ocrText);
      }

      console.log(`\n=== AI EXTRACTION ===`);
      console.log(`OCR Service Method: ${metadata?.method || 'unknown'}`);
      
      // Optimize OCR text first
      const optimizedText = this.optimizeOCRForAI(ocrText);
      console.log(`OCR Text Length: ${ocrText.length} characters`);
      console.log(`OCR Text Preview: "${ocrText.substring(0, 200)}..."`); 
      console.log(`Model: ${config.openai.model}`);
      
      const { systemPrompt, userPrompt } = this.buildExtractionPrompt(optimizedText, metadata);
      
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: config.openai.maxTokens,
        temperature: 0.1
      });

      const result = completion.choices[0].message.content;
      console.log(`AI Response Length: ${result.length} characters`);
      console.log(`AI Response Preview: "${result.substring(0, 300)}"`);
      
      return this.parseAIResponse(result, ocrText, metadata);

    } catch (error) {
      console.error('AI extraction failed:', error.message);
      return this.basicExtraction(ocrText);
    }
  }

  buildExtractionPrompt(ocrText, metadata) {
    const systemPrompt = `You are an AI model that extracts structured receipt data from OCR text. You must always return ONLY a valid JSON object with the specified fields. Do not output explanations, text, or code blocks — output the JSON object only.

---

Extraction Rules:
1. Fields (must always appear, use null if missing/uncertain):
   - invoiceNumber (from fields like "Invoice No", "Bill No", "Receipt No", "Order No", "Inv No")
   - date (Date when the bill got generated YYYY-MM-DD format)
   - merchant (name of the restaurant, cafe, hotel, store, or company)
   - subtotal (float or null)
   - tax (float or null)
   - tip (float, default 0 if not present)
   - Miscellaneous charges 
   - totalAmount (float or null)
   - confidence (float between 0.0 and 1.0)
   - currency (ISO code like INR, USD, EUR, GBP, etc.)

2. Intelligent Mapping:
   - Treat "Bill No.", "Receipt No.", "Order No.", etc. as valid invoiceNumber if invoice-specific ID is not clearly labeled.
   - Extract merchant name from the first meaningful business name at the top (ignore headings like "TAX INVOICE", "RECEIPT", etc.).
   - Tip defaults to 0 unless explicitly present.
   - Miscellaneous charges (e.g., round-off, delivery, service fees) are not separately returned, but must be considered in totalAmount validation.

3. Validation:
   - Ensure subtotal + tax + tip ≈ totalAmount . If mismatch, set uncertain fields to null and reduce confidence.
   - Tax for Indian receipts = sum of CGST + SGST + IGST.
   - For other countries, combine values labeled as TAX, VAT, GST, HST, or Sales Tax.
   - Detect currency from symbols or keywords in context. If unclear, set to null (do NOT guess).

4. Error Handling:
   - If input is not an invoice or receipt → all key fields = null, confidence = 0.1.
   - If OCR text is garbled or unreadable → set uncertain fields to null, confidence ≤ 0.2.

---

Output Format:
- Strictly one valid JSON object.
- No code fences, no extra text, no markdown formatting.`;

    const userPrompt = `Extract detailed receipt data from the following OCR text and return ONLY a valid JSON object:

${ocrText}`;

    return { systemPrompt, userPrompt };
  }

  optimizeOCRForAI(ocrText) {
    const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const essential = [];
    
    // Patterns to SKIP (remove these to save tokens)
    const skipPatterns = [
      /all disputes.*mumbai/i,
      /tax is not payable/i,
      /declaration.*correct/i,
      /registered office.*mumbai/i,
      /cin:|www\./i,
      /telecommunication services.*limited/i,
      /platform services.*limited/i,
      /dale:|reason:|location:/i,
      /^\([^)]*\)$/, // (Original for Recipient)
      /court house.*mumbai/i,
      /dhobi talao/i,
      /thank you.*visit again/i, // Thank you messages
      /your feedback.*improve/i, // Feedback messages
      /please scan.*feedback/i, // QR code messages
    ];
    
    // Keep essential receipt parsing patterns
    const keepPatterns = [
      /retail|limited|restaurant|cafe|store|shop|mart|pvt|ltd|qua|hotel|bar|bistro|kitchen/i,
      /invoice.*no|bill.*no|receipt.*no/i,
      /date.*time|payment.*date/i,
      /total.*amount|amount.*total|grand.*total/i,
      /subtotal|taxable.*amount|sub.*total/i,
      /cgst|sgst|igst|tax.*\d/i,
      /payment|mode.*payment|credit|debit|cash|upi/i,
      /\d+\.\d{2}/, // Decimal amounts
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/, // Dates
      /rupees.*paisa|dollars.*cents/i,
      /gstn?|pan.*no/i,
      /cashier|biller|token.*no/i, // Staff and service info
    ];
    
    lines.forEach((line, index) => {
      // Only skip very specific unwanted lines
      if (skipPatterns.some(pattern => pattern.test(line))) {
        return;
      }
      
      // Keep everything else - be very conservative with removal
      essential.push(line);
    });
    
    return essential.join('\n');
  }

  parseAIResponse(aiResponse, originalText, metadata = {}) {
    try {
      let jsonStr = aiResponse.trim();
      
      console.log(`\n=== PARSING AI RESPONSE ===`);
      console.log(`Raw response: "${jsonStr.substring(0, 500)}"`);
      
      // Clean up common AI response formatting
      if (jsonStr.includes('```json')) {
        const match = jsonStr.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonStr = match[1].trim();
        }
      }
      
      if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```/g, '').trim();
      }
      
      // Remove any text before the JSON
      const jsonStart = jsonStr.indexOf('{');
      const jsonEnd = jsonStr.lastIndexOf('}') + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonStr = jsonStr.substring(jsonStart, jsonEnd);
      }
      
      console.log(`Cleaned JSON: "${jsonStr}"`);
      
      const parsed = JSON.parse(jsonStr);
      
      // Create standardized response
      const result = {
        success: true,
        method: 'ai_extraction',
        confidence: parsed.confidence || 0.5,
        data: {
          merchant: this.sanitizeString(parsed.merchant),
          date: this.normalizeDate(parsed.date),
          totalAmount: this.sanitizeNumber(parsed.totalAmount),
          subtotal: this.sanitizeNumber(parsed.subtotal),
          tax: this.sanitizeNumber(parsed.tax),
          tip: this.sanitizeNumber(parsed.tip) || 0,
          currency: this.detectCurrency(originalText, this.sanitizeString(parsed.currency), metadata.userCurrency),
          category: this.sanitizeString(parsed.category) || 'other',
          paymentMethod: this.sanitizeString(parsed.paymentMethod) || 'unknown',
          items: Array.isArray(parsed.items) ? parsed.items : [],
          miscellaneous: this.sanitizeNumber(parsed.miscellaneous) || 0,
          billNumber: this.sanitizeString(parsed.billNumber),
          invoiceNumber: this.sanitizeString(parsed.invoiceNumber),
          serialNumber: this.sanitizeString(parsed.serialNumber),
          originalText: originalText
        }
      };
      
      console.log('Normalized result:', JSON.stringify(result.data, null, 2));
      console.log(`=== END PARSING ===\n`);
      
      return result;

    } catch (error) {
      console.error('Failed to parse AI response:', error.message);
      return this.basicExtraction(originalText);
    }
  }

  basicExtraction(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Enhanced pattern matching for better OCR handling
    const totalMatch = text.match(/(?:total|amount|sum|balance|due)[:\s]*[$₹€£]?(\d+\.?\d*)/i);
    
    // Better date pattern - looks for "Date:" prefix and various formats
    const dateMatch = text.match(/(?:date|dt)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i) || 
                     text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    
    // Better merchant matching - avoid feedback text patterns
    const merchantMatch = lines.find(line => 
      line.length > 3 && 
      line.length < 50 && 
      !line.match(/\d+[\/\-]\d+/) &&
      !line.includes('$') &&
      !line.toLowerCase().includes('feedback') &&
      !line.toLowerCase().includes('improve') &&
      !line.toLowerCase().includes('please')
    );

    return {
      success: true,
      method: 'basic_extraction',
      confidence: 0.3,
      data: {
        merchant: merchantMatch || null,
        date: this.normalizeDate(dateMatch?.[1]),
        totalAmount: totalMatch ? parseFloat(totalMatch[1]) : null,
        currency: 'INR',
        items: [],
        tax: null,
        subtotal: null,
        tip: 0,
        category: 'other',
        paymentMethod: 'unknown',
        miscellaneous: 0,
        billNumber: null,
        invoiceNumber: null,
        serialNumber: null,
        originalText: text
      }
    };
  }

  sanitizeString(value) {
    if (!value || typeof value !== 'string') return null;
    return value.trim() || null;
  }

  sanitizeNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  normalizeDate(dateStr) {
    if (!dateStr) return null;
    
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // Handle various date formats
      const patterns = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
        /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
      ];
      
      for (const pattern of patterns) {
        const match = dateStr.match(pattern);
        if (match) {
          let [, part1, part2, part3] = match;
          
          // Convert 2-digit year to 4-digit
          if (part3.length === 2) {
            part3 = parseInt(part3) > 50 ? `19${part3}` : `20${part3}`;
          }
          
          let year, month, day;
          
          if (part1.length === 4) {
            // YYYY-MM-DD format
            year = parseInt(part1);
            month = parseInt(part2);
            day = parseInt(part3);
          } else {
            // DD/MM/YY or MM/DD/YY format
            year = parseInt(part3);
            
            // Assume DD/MM format for non-US receipts (most common globally)
            day = parseInt(part1);
            month = parseInt(part2);
            
            // Basic validation - if day > 12, switch interpretation
            if (day > 12) {
              month = parseInt(part1);
              day = parseInt(part2);
            }
          }
          
          // Validate date components
          if (year >= 1900 && year <= currentYear + 1 && 
              month >= 1 && month <= 12 && 
              day >= 1 && day <= 31) {
            
            // Format as YYYY-MM-DD
            const formattedMonth = month.toString().padStart(2, '0');
            const formattedDay = day.toString().padStart(2, '0');
            
            // Use UTC to avoid timezone issues
            const dateObj = new Date(Date.UTC(year, month - 1, day));
            if (!isNaN(dateObj.getTime())) {
              return `${year}-${formattedMonth}-${formattedDay}`;
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Date normalization error:', error);
      return null;
    }
  }

  getExtractionStats() {
    return {
      totalExtractions: this.totalExtractions || 0,
      successfulExtractions: this.successfulExtractions || 0,
      averageConfidence: this.averageConfidence || 0,
      lastExtraction: this.lastExtraction || null
    };
  }
}

module.exports = AIService;