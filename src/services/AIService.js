const OpenAI = require('openai');
const config = require('../config/config');

class AIService {
  constructor() {
    if (config.app.testingMode) {
      this.openai = null;
      this.testingMode = true;
    } else if (config.openai.enabled && config.openai.apiKey) {
      this.openai = new OpenAI({
        apiKey: config.openai.apiKey
      });
      this.testingMode = false;
    } else {
      console.warn('⚠️ OpenAI API key not configured. AI-powered extraction disabled.');
      this.openai = null;
      this.testingMode = false;
    }
  }

  async extractReceiptData(ocrText, metadata = {}) {
    if (this.testingMode) {
      const { getRandomMockReceipt } = require('../config/mockData');
      return getRandomMockReceipt();
    }
    
    if (!this.openai) {
      console.error('❌ OpenAI not configured! Check OPENAI_API_KEY environment variable');
      return this.basicExtraction(ocrText);
    }

    if (!ocrText || ocrText.trim().length < 10) {
      return this.basicExtraction(ocrText);
    }

    try {
      const { systemPrompt, userPrompt } = this.buildExtractionPrompt(ocrText, metadata);
      
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

      // Log raw AI response for debugging
      console.log('🤖 RAW AI RESPONSE:', result);

      const parsedResult = this.parseAIResponse(result, ocrText, metadata);

      // Log parsed miscellaneous value
      console.log('💰 PARSED miscellaneous value:', parsedResult.data?.miscellaneous);

      return parsedResult;

    } catch (error) {
      console.error('AI extraction failed:', error.message);
      console.error('Error details:', error);

      // Check if this is a service failure (API issues, network, quota)
      if (this.isAIServiceFailure(error)) {
        return {
          success: false,
          errorType: 'service_failure',
          method: 'openai_extraction',
          confidence: 0,
          error: 'AI processing service temporarily unavailable',
          data: null
        };
      }

      // For other errors (parsing, format issues), use basic extraction
      return this.basicExtraction(ocrText);
    }
  }

  buildExtractionPrompt(ocrText, metadata) {
    // Include user's default currency as context hint for the AI (works for ANY currency)
    const userCurrencyHint = metadata.userCurrency
      ? `\n\nUSER CONTEXT: This user's default currency is ${metadata.userCurrency}. If currency symbols are unclear, ambiguous, or not present in the receipt, use ${metadata.userCurrency} as the currency.`
      : '';

    const systemPrompt = `You are a precise financial document extraction model.
Your task is to extract structured data from OCR text of invoices, receipts, or bills.${userCurrencyHint}

Follow these rules exactly:

1. OUTPUT FORMAT
- Return ONE valid JSON object only.
- Include every field listed below.
- Use numeric types for all amounts.
- Use null if any field is missing, uncertain, or invalid.
- Do not include explanatory text, comments, or examples.

2. FIELDS (must always appear)
{
  "invoiceNumber": string | null,
  "date": string | null (format YYYY-MM-DD),
  "merchant": string | null,
  "subtotal": float | null,
  "tax": float | null,
  "miscellaneous": float (default 0),
  "totalAmount": float | null,
  "confidence": float (0.0–1.0),
  "currency": string | null (ISO code)
}

3. TAX AND CHARGE CLASSIFICATION RULES
- Government taxes ONLY (CGST, SGST, IGST, UTGST, VAT, GST, CESS, Sales Tax, Service Tax, HST, PST, Excise Tax, Consumption Tax, QST, RST etc.) go into tax.
- Merchant or operational fees such as (Service fees: Service Charge, Gratuity, Tip, Cover Charge, Delivery: Delivery Fee, Shipping, Freight, Courier Charge, Packaging: Packing Charge, Container Fee, Bag Charge, Box Fee, Platform fees: Convenience Fee, Processing Fee, Platform Fee, Online Fee, Restaurant: Table Charge, Corkage Fee, Split Plate Fee, Handling: Handling Charge, Restocking Fee, Setup Fee) go into miscellaneous.
- Never mix these categories.

4. FIELD MAPPING AND DETECTION
- invoiceNumber: Look for labels containing variations of ("Invoice" (Invoice No/Number/Num/ID/#), "Serial" (Serial No/Number/SN), "Bill" (Bill No/Number/Billing#), "Receipt" (Receipt No/Number/Num), "Reference" (Ref No/Number/Reference#), "Transaction" (Transaction No/ID/TXN), "Document" (Doc No/Number/Document#), "Voucher" (Voucher No/Number), "Ticket" (Ticket No/Number/ID)), Common abbreviations: "Inv", "Rcpt", "Txn", "Doc", "Ref", May include prefixes/suffixes with special characters (#, -, /, :), May include alphanumeric combinations (ABC-123, 2024/001, INV00123)

- date: Extract ONLY what is present on the receipt. Do NOT hallucinate or guess missing components.
  * CRITICAL: If partial date is present, return it in appropriate format - do NOT return null
  * If full date present (DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD): convert to YYYY-MM-DD
  * If only month and date (10/19, Oct 19, October 19, 19/10): MUST return as "Oct-19" format (month name abbreviation + dash + day)
  * If only month and year (10/2023, Oct 2023, October 2023): MUST return as "Oct-2023" format (month name abbreviation + dash + year)
  * If only date and year (19/2023): MUST return as "19-2023" format (day + dash + year)
  * Examples: "October 19" → "Oct-19", "Oct 2023" → "Oct-2023", "19/2023" → "19-2023"
  * ONLY set null if NO date information exists at all on the receipt
  * NEVER assume or infer the current year if year is not present on receipt
  * NEVER guess missing components - always use partial formats for partial dates
- merchant: extract the first meaningful business name at the top; ignore headers like "TAX INVOICE", "RECEIPT", "CASH MEMO". Prefer lines with business indicators such as "Cafe", "Restaurant", "Ltd", "Enterprises", "Store", "Hotel".
- currency: infer from context or symbols:
  ₹, Rs, INR → INR
  $, USD → USD (default if only "$" shown)
  €, EUR → EUR
  £, GBP → GBP
  If multiple currency symbols appear, choose the one on the total amount line.
  If unclear, set currency = null.
- tip: explicitly read; if absent, default to 0.
- Never guess values.

5. MULTIPLE TAX HANDLING
- If multiple tax components exist (e.g., CGST, SGST, VAT, GST, Sales Tax, etc.), sum all into a single numeric tax value.
- Do not return separate tax lines.


6. VALIDATION AND CALCULATIONS
- Validate that subtotal + tax + tip + miscellaneous ≈ totalAmount (±1 tolerance).
- If subtotal is missing but total and other components are known, compute:
  subtotal = totalAmount − (tax + tip + miscellaneous)
- If totals do not reconcile, leave uncertain fields as "unknown" and lower confidence.

7. CONFIDENCE SCORING
- Assign confidence between 0.0 and 1.0 based on clarity and field completeness:
  * ≥0.9 if all fields clear and consistent
  * 0.5–0.8 if partially extracted
  * ≤0.3 if text unclear, incomplete, or non-invoice
  * 0.1 if text not invoice-related

8. SPECIAL HANDLING
- If the text is unrelated to receipts or invoices, set all fields to "unknown" and confidence = 0.1.
- If OCR text is garbled or corrupted, use "unknown" appropriately and confidence ≤0.2.

9. OUTPUT INSTRUCTION
- Return strictly one JSON object, no code fences, no extra commentary.`;

    const userPrompt = `Extract detailed receipt data from the following OCR text and return ONLY a valid JSON object.

IMPORTANT REMINDER:
- Packing charges, delivery fees, service charges → miscellaneous field (NOT tax)
- Only CGST, SGST, VAT, GST, Sales Tax → tax field
- Formula: subtotal + tax + tip + miscellaneous = totalAmount

OCR TEXT:
${ocrText}`;

    return { systemPrompt, userPrompt };
  }

  // Legacy method - keeping for backwards compatibility but updating to use new structure
  buildLegacyPrompt(ocrText, metadata) {
    return `Extract receipt data from OCR text. Return ONLY valid JSON.

OCR TEXT:
${ocrText}

EXTRACT:
- merchant: Business name
- date: "DD MMM YYYY" format (e.g., "19 Oct 2023") or "DD MMM" if no year (e.g., "19 Oct")
- totalAmount: Final amount (number only)
- subtotal: Pre-tax amount
- tax: Tax amount (sum CGST+SGST+IGST for India)
- currency: INR, USD, EUR, GBP
- billNumber: Invoice/receipt number
- paymentMethod: cash, card, credit, debit, upi
- items: [{name, price}] if visible
- confidence: 0.0-1.0

RULES:
- Focus on numbers and key patterns
- For dates: handle DD/MM/YY and MM/DD/YY
- MULTIPLE TAXES: Always sum ALL tax components into single 'tax' value
  Examples: CGST ₹50 + SGST ₹50 = tax: 100, VAT $10 + Service Tax $5 = tax: 15
- PACKING/DELIVERY/ROUND-OFF CHARGES: These are NOT taxes, put them in 'miscellaneous'
  Examples: "Packing Charge ₹7" = miscellaneous: 7, "Delivery Fee $5" = miscellaneous: 5, "Round off ₹0.70" = miscellaneous: 0.70
- Ignore legal text, addresses, disclaimers
- If not a receipt (feedback/survey), set confidence to 0.1

Required JSON format:
{
  "merchant": "Business Name Here",
  "date": "2024-01-15",
  "totalAmount": 25.67,
  "subtotal": 22.50,
  "tax": 2.17,
  "tip": 1.00,
  "miscellaneous": 0.00,
  "currency": "INR",
  "billNumber": "#12345",
  "invoiceNumber": "INV-456",
  "serialNumber": "RCP789",
  "items": [
    {"name": "Item 1", "price": 12.50},
    {"name": "Item 2", "price": 10.00}
  ],
  "paymentMethod": "card",
  "category": "business_meal",
  "confidence": 0.85
}

FIELD RULES:
- merchant: Extract business/store name (usually first few lines)
- date: Use "DD MMM YYYY" format (e.g., "19 Oct 2023", "25 Dec 2024"). If year is missing, use "DD MMM" format only (e.g., "19 Oct", "25 Dec"). Use 3-letter month abbreviations. Do NOT add or assume any year.
- totalAmount: Final amount paid (NUMBER only, no currency symbols like $, ₹, €)
- subtotal: Amount before tax (extract from "Total Taxable Amount" or similar fields)
- tax: Tax amount (CRITICAL: ONLY government taxes - CGST+SGST+IGST, VAT, GST, Sales Tax)
- tip: Tip amount if present (0 if not found)
- miscellaneous: Non-tax fees like Packing Charge, Delivery Fee, Service Charge, Handling Fee, Round off (0 if not found)
- currency: Detect currency from symbols (₹=INR, $=USD, €=EUR, £=GBP) or context
- billNumber/invoiceNumber/serialNumber: Receipt identifier if present
- items: Individual line items with prices (empty array if unclear)
- paymentMethod: "cash", "card", "credit", "debit", or "unknown"
- confidence: 0.0-1.0 based on text clarity and field extraction success

CRITICAL CALCULATION RULES:
- *VERIFY MATH*: Subtotal + Tax + Tip + Miscellaneous = Total Amount
- *MULTIPLE TAX SUMMING*: ALWAYS sum ALL tax components into single 'tax' field
  • India: CGST + SGST + IGST + CESS = tax total
  • International: VAT + Service Tax + Additional Tax = tax total
  • Generic: Tax 1 + Tax 2 + Tax 3 = tax total
- *TAX vs MISCELLANEOUS*:
  • TAX ONLY: CGST, SGST, IGST, CESS, VAT, GST, Sales Tax, Service Tax (government-mandated taxes)
  • MISCELLANEOUS: Packing Charge, Packaging Fee, Delivery Charge, Delivery Fee, Handling Charge, Container Charge, Service Charge, Round off, Rounding (non-tax fees)
  • If labeled "Packing Charge", "Delivery Fee", or "Round off" → miscellaneous (NOT tax)
- *DOUBLE-CHECK TOTALS*: Ensure calculations are accurate
- *CURRENCY CONSISTENCY*: All amounts should be in same currency

DATA QUALITY RULES:
- Use null for any field you cannot determine with reasonable confidence
- If date looks incorrect (like 1925), use null instead
- If merchant name is garbled/unclear, use null instead
- If OCR text is poor quality/garbled, set confidence to 0.2 or lower

COUNTRY DETECTION:
- Identify country from currency symbols, tax patterns, business formats
- Look for: ₹/INR (India), $/USD (US), £/GBP (UK), €/EUR (Europe)
- Tax patterns: CGST/SGST (India), VAT (UK), Sales Tax (US)

Better to return null than incorrect information`;
  }

  parseAIResponse(aiResponse, originalText, metadata = {}) {
    try {
      let jsonStr = aiResponse.trim();
      
      // Clean up common AI response formatting
      if (jsonStr.includes('```json')) {
        const match = jsonStr.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonStr = match[1];
        }
      }
      
      // Remove any text before first { and after last }
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(jsonStr);
      
      // Validate and normalize the response
      const result = {
        success: true,
        method: 'ai_extraction',
        confidence: parsed.confidence || 0.7,
        data: {
          merchant: this.sanitizeString(parsed.merchant),
          merchantName: this.sanitizeString(parsed.merchant), // Alias
          date: this.normalizeDate(parsed.date),
          totalAmount: this.normalizeAmount(parsed.totalAmount),
          currency: this.detectCurrency(originalText, parsed.currency, metadata.userCurrency),
          items: Array.isArray(parsed.items) ? parsed.items.slice(0, 20) : [],
          tax: this.normalizeAmount(parsed.tax),
          taxAmount: this.normalizeAmount(parsed.tax), // Alias
          subtotal: this.normalizeAmount(parsed.subtotal),
          tip: this.normalizeAmount(parsed.tip),
          tipAmount: this.normalizeAmount(parsed.tip), // Alias
          miscellaneous: this.normalizeAmount(parsed.miscellaneous) || 0,
          paymentMethod: parsed.paymentMethod || 'unknown',
          billNumber: this.sanitizeString(parsed.billNumber),
          invoiceNumber: this.sanitizeString(parsed.invoiceNumber),
          serialNumber: this.sanitizeString(parsed.serialNumber),
          originalText: originalText
        }
      };
      
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
        paymentMethod: 'unknown',
        originalText: text
      }
    };
  }

  // Check if error indicates AI service failure (not data quality issue)
  isAIServiceFailure(error) {
    const message = error.message.toLowerCase();
    const code = error.code || error.type || '';

    // OpenAI API/Service related failures
    const serviceErrors = [
      'rate limit',
      'quota exceeded',
      'insufficient_quota',
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
      'internal server error',
      'server_error',
      'service_unavailable'
    ];

    // Check both message and error code/type
    return serviceErrors.some(errorPattern =>
      message.includes(errorPattern) || code.includes(errorPattern)
    );
  }

  // Utility methods
  sanitizeString(str) {
    if (!str || typeof str !== 'string') return null;
    const trimmed = str.trim();
    return trimmed || null;
  }

  normalizeDate(dateStr) {
    if (!dateStr) return null;

    try {
      const monthAbbreviations = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };

      // Handle "Oct-19" format (month-day) - NEW FORMAT from AI
      const monthDayPattern = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-(\d{1,2})$/i;
      const monthDayMatch = dateStr.trim().match(monthDayPattern);

      if (monthDayMatch) {
        const month = monthAbbreviations[monthDayMatch[1].toLowerCase()];
        const day = monthDayMatch[2].padStart(2, '0');
        // Return partial date in readable format: "Oct 19" instead of null
        return `${monthDayMatch[1]} ${day}`;
      }

      // Handle "Oct-2023" format (month-year) - NEW FORMAT from AI
      const monthYearPattern = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-(\d{4})$/i;
      const monthYearMatch = dateStr.trim().match(monthYearPattern);

      if (monthYearMatch) {
        // Return partial date in readable format: "Oct 2023" instead of null
        return `${monthYearMatch[1]} ${monthYearMatch[2]}`;
      }

      // Handle "19-2023" format (day-year) - NEW FORMAT from AI
      const dayYearPattern = /^(\d{1,2})-(\d{4})$/;
      const dayYearMatch = dateStr.trim().match(dayYearPattern);

      if (dayYearMatch) {
        // Return partial date in readable format: "19, 2023" instead of null
        return `${dayYearMatch[1]}, ${dayYearMatch[2]}`;
      }

      // Handle "DD MMM YYYY" or "DD MMM" format (e.g., "19 Oct 2023" or "19 Oct")
      const monthAbbrPattern = /^(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?$/i;
      const monthAbbrMatch = dateStr.trim().match(monthAbbrPattern);

      if (monthAbbrMatch) {
        const day = monthAbbrMatch[1].padStart(2, '0');
        const month = monthAbbreviations[monthAbbrMatch[2].toLowerCase()];

        if (monthAbbrMatch[3]) {
          // Full date with year: "19 Oct 2023" -> "2023-10-19"
          const year = monthAbbrMatch[3];
          return `${year}-${month}-${day}`;
        } else {
          // Partial date without year: "19 Oct" -> return as is
          return dateStr.trim();
        }
      }

      // If already in YYYY-MM-DD format, validate and return
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const date = new Date(dateStr + 'T00:00:00Z');
        if (!isNaN(date.getTime())) {
          return dateStr; // Already in correct format
        }
      }

      const today = new Date();
      const currentYear = today.getFullYear();
      
      // Handle various date formats including time
      const patterns = [
        /(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})(?:\s+\d{1,2}:\d{2})?/,  // DD/MM/YYYY with optional time
        /(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})(?:\s+\d{1,2}:\d{2})?/,   // YYYY-MM-DD with optional time
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\s+\d{1,2}:\d{2}/     // Specifically for date+time format
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

  normalizeAmount(amount) {
    if (amount === null || amount === undefined || amount === '') return null;
    if (typeof amount === 'number') return isNaN(amount) ? null : Math.max(0, amount);
    if (typeof amount === 'string') {
      const parsed = parseFloat(amount.replace(/[^\d.]/g, ''));
      return isNaN(parsed) ? null : Math.max(0, parsed);
    }
    return null;
  }


  detectCurrency(text, parsedCurrency, userCurrency = null) {
    // PRIORITY 1: Detect from explicit currency symbols/text in receipt (most reliable)
    if (text.includes('₹') || /\brs\.?\s*\d+/i.test(text) || /rupee/i.test(text) || /\binr\b/i.test(text)) {
      console.log(`✅ Detected INR from currency symbol/text in receipt`);
      return 'INR';
    }
    if (/\bhkd\b/i.test(text) || /hk\$/i.test(text) || /hong\s*kong/i.test(text)) {
      console.log(`✅ Detected HKD from currency symbol/text in receipt`);
      return 'HKD';
    }
    // Treat plain '$' as USD unless another dollar variant is explicitly present
    if (/\busd\b/i.test(text) || (/\$/i.test(text) && !/(hk\$|s\$|a\$|c\$|mx\$|nz\$)/i.test(text))) {
      console.log(`✅ Detected USD from currency symbol/text in receipt`);
      return 'USD';
    }
    if (text.includes('£') || /\bgbp\b/i.test(text) || /pound/i.test(text)) {
      console.log(`✅ Detected GBP from currency symbol/text in receipt`);
      return 'GBP';
    }
    if (text.includes('€') || /\beur\b/i.test(text) || /euro/i.test(text)) {
      console.log(`✅ Detected EUR from currency symbol/text in receipt`);
      return 'EUR';
    }
    if (/\bsgd\b/i.test(text) || /singapore/i.test(text)) {
      console.log(`✅ Detected SGD from currency symbol/text in receipt`);
      return 'SGD';
    }
    if (/\baud\b/i.test(text) || /australian/i.test(text)) {
      console.log(`✅ Detected AUD from currency symbol/text in receipt`);
      return 'AUD';
    }
    if (/\baed\b/i.test(text) || /dirham/i.test(text)) {
      console.log(`✅ Detected AED from currency symbol/text in receipt`);
      return 'AED';
    }
    if (/\bjpy\b/i.test(text) || /¥/i.test(text) || /yen/i.test(text)) {
      console.log(`✅ Detected JPY from currency symbol/text in receipt`);
      return 'JPY';
    }

    // PRIORITY 2: Indian tax identifiers (CGST/SGST/IGST) strongly indicate INR
    if (/cgst|sgst|igst|gstin/i.test(text)) {
      console.log(`✅ Detected INR from Indian tax identifiers (CGST/SGST/IGST)`);
      return 'INR';
    }

    // PRIORITY 3: If AI detected a valid currency, trust it (but lower priority than text detection)
    if (parsedCurrency && ['INR', 'USD', 'EUR', 'GBP', 'HKD', 'SGD', 'AUD', 'CAD', 'AED', 'JPY', 'CNY'].includes(parsedCurrency)) {
      console.log(`⚠️ Using AI-detected currency as fallback: ${parsedCurrency}`);
      return parsedCurrency;
    }

    // PRIORITY 4: If no currency found in receipt, use user's default currency
    if (userCurrency) {
      console.log(`⚠️ No currency detected in receipt, using user's default currency: ${userCurrency}`);
      return userCurrency;
    }

    // LAST RESORT: Default to INR (most common fallback for system)
    console.log(`⚠️ No currency detected anywhere and no user default, defaulting to INR`);
    return 'INR';
  }
  

  // Enhanced extraction for specific receipt types
  async extractRestaurantReceipt(ocrText, metadata = {}) {
    if (!this.openai) return this.basicExtraction(ocrText);

    const restaurantPrompt = `This is a restaurant receipt. Extract detailed information and return ONLY valid JSON:

Receipt Text:
${ocrText}

Focus on:
- Individual menu items with prices
- Tax and tip amounts
- Payment method details
- Restaurant name and location
- Server information if available

Return format:
{
  "merchant": "Restaurant Name",
  "date": "YYYY-MM-DD",
  "totalAmount": 45.67,
  "items": [{"name": "Item", "price": 12.99, "quantity": 1}],
  "tax": 3.65,
  "tip": 8.00,
  "subtotal": 34.02,
  "paymentMethod": "card",
  "server": "Server Name",
  "tableNumber": "5",
  "confidence": 0.9
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: restaurantPrompt }],
        max_tokens: config.openai.maxTokens,
        temperature: 0.1
      });

      return this.parseAIResponse(completion.choices[0].message.content, ocrText);
    } catch (error) {
      console.error('Restaurant extraction failed:', error);
      return this.basicExtraction(ocrText);
    }
  }

  // Get extraction stats
  getExtractionStats() {
    return {
      aiEnabled: !!this.openai,
      model: config.openai.model,
      maxTokens: config.openai.maxTokens,
      totalExtractions: this.totalExtractions || 0,
      successfulExtractions: this.successfulExtractions || 0,
      averageConfidence: this.averageConfidence || 0,
      lastExtraction: this.lastExtraction || null
    };
  }
}

module.exports = AIService;