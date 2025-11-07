// Mock data for testing WhatsApp bot flow
const mockReceiptData = [
  {
    id: 1,
    merchant: "Olive Garden Restaurant",
    date: "2025-01-15",
    totalAmount: 49.71,
    subtotal: 45.60,
    tax: 4.11,
    tip: 3.20,
    miscellaneous: 2.80,
    currency: "USD",
    billNumber: "#ABC123",
    invoiceNumber: "INV-001",
    serialNumber: "OG-2025-001",
    items: [
      { name: "Chicken Alfredo", price: 18.99 },
      { name: "Caesar Salad", price: 12.99 },
      { name: "Breadsticks", price: 5.99 },
      { name: "Soft Drink", price: 2.99 }
    ],
    paymentMethod: "credit",
    category: null,
    confidence: 0.92,
    ocrText: "OLIVE GARDEN RESTAURANT\n123 Main Street\nNew York, NY 10001\n\nReceipt #ABC123\nDate: 01/15/2025 7:30 PM\n\nChicken Alfredo    $18.99\nCaesar Salad       $12.99\nBreadsticks        $5.99\nSoft Drink         $2.99\n\nSubtotal:          $45.60\nTax:               $4.11\nTip:               $3.20\nMisc:              $2.80\nTotal:             $49.71\n\nPayment: Credit Card\nThank you for dining with us!"
  },
  {
    id: 2,
    merchant: "Reliance Retail Limited",
    date: "2022-12-06",
    totalAmount: 470.82,
    subtotal: 399.00,
    tax: 71.82,
    tip: 0,
    miscellaneous: 0,
    currency: "INR",
    billNumber: "A9R23R9995191355",
    invoiceNumber: "A9R23R9995191355",
    serialNumber: null,
    items: [
      { name: "Mobile Recharge", price: 399.00 }
    ],
    paymentMethod: "credit",
    category: null,
    confidence: 0.87,
    ocrText: "Reliance Retail Limited\n8th Floor, Eldeco corporate Chamber - II, Plot No. TC-58V\nAND TC C-59V, Phase-I, Vibhuti Khand, Gomti Nagar,\nLucknow Lucknow Uttar Pradesh 226010\n\nInvoice No : A9R23R9995191355 Invoice/Payment Date & Time : 06 Dec,2022 21:04:32\nJio Number : 1317960249 Customer Address : muzaffarnagar, gali no - 17, Subhash nagar,\nmuzaffarnagar, Uttar Pradesh, 251002\n\nTotal Taxable Amount | 399.00\nCGST 9% | 35.91\nSGST 9% | 35.91\nTotal Amount(X) | 470.82\n\nMode of Payment : Credit Card\nFour Hundred Seventy Rupees Eighty Two Paisa Only\n\nPAN No : AABCR1718E GST No : 09AABCR1718E1ZN"
  },
  {
    id: 3,
    merchant: "Starbucks Coffee",
    date: "2025-01-20",
    totalAmount: 12.45,
    subtotal: 11.50,
    tax: 0.95,
    tip: 2.00,
    miscellaneous: 0,
    currency: "USD",
    billNumber: "#SB789",
    invoiceNumber: null,
    serialNumber: "SB-2025-789",
    items: [
      { name: "Grande Latte", price: 5.25 },
      { name: "Blueberry Muffin", price: 3.25 },
      { name: "Extra Shot", price: 0.75 }
    ],
    paymentMethod: "card",
    category: null,
    confidence: 0.95,
    ocrText: "STARBUCKS COFFEE\n456 Coffee Lane\nSeattle, WA 98101\n\nStore #789\nDate: 01/20/2025 8:15 AM\n\nGrande Latte       $5.25\nBlueberry Muffin   $3.25\nExtra Shot         $0.75\n\nSubtotal:          $11.50\nTax:               $0.95\nTip:               $2.00\nTotal:             $12.45\n\nCard Payment\nThank you!"
  }
];

// Mock OCR responses
const mockOcrResponse = {
  success: true,
  method: 'google_vision_mock',
  confidence: 0.92,
  text: mockReceiptData[0].ocrText,
  metadata: {
    imageSize: { width: 1080, height: 1920 },
    processingTime: 1.2
  }
};

// Mock AI response
const mockAiResponse = {
  success: true,
  method: 'openai_mock',
  confidence: 0.92,
  data: {
    merchant: mockReceiptData[0].merchant,
    date: mockReceiptData[0].date,
    totalAmount: mockReceiptData[0].totalAmount,
    subtotal: mockReceiptData[0].subtotal,
    tax: mockReceiptData[0].tax,
    tip: mockReceiptData[0].tip,
    miscellaneous: mockReceiptData[0].miscellaneous,
    currency: mockReceiptData[0].currency,
    billNumber: mockReceiptData[0].billNumber,
    invoiceNumber: mockReceiptData[0].invoiceNumber,
    serialNumber: mockReceiptData[0].serialNumber,
    items: mockReceiptData[0].items,
    paymentMethod: mockReceiptData[0].paymentMethod,
    category: mockReceiptData[0].category,
    originalText: mockReceiptData[0].ocrText
  }
};

// Function to get random mock receipt data
function getRandomMockReceipt() {
  const randomIndex = Math.floor(Math.random() * mockReceiptData.length);
  const receipt = mockReceiptData[randomIndex];
  
  return {
    success: true,
    method: 'ai_extraction_mock',
    confidence: receipt.confidence,
    data: {
      merchant: receipt.merchant,
      date: receipt.date,
      totalAmount: receipt.totalAmount,
      subtotal: receipt.subtotal,
      tax: receipt.tax,
      tip: receipt.tip,
      miscellaneous: receipt.miscellaneous,
      currency: receipt.currency,
      billNumber: receipt.billNumber,
      invoiceNumber: receipt.invoiceNumber,
      serialNumber: receipt.serialNumber,
      items: receipt.items,
      paymentMethod: receipt.paymentMethod,
      category: receipt.category,
      originalText: receipt.ocrText
    }
  };
}

// Function to get mock OCR response (full processing simulation)
function getMockOcrResponse() {
  const mockAiResult = getRandomMockReceipt();
  
  return {
    success: true,
    method: 'mock_testing',
    confidence: mockAiResult.confidence,
    text: mockAiResult.data.originalText,
    metadata: {
      imageSize: { width: 1080, height: 1920 },
      processingTime: 1.2
    },
    // Include the full processed data structure that OCR service creates
    aiExtraction: mockAiResult,
    receiptData: {
      merchantName: mockAiResult.data.merchant,
      date: mockAiResult.data.date,
      totalAmount: mockAiResult.data.totalAmount,
      taxAmount: mockAiResult.data.tax,
      subtotal: mockAiResult.data.subtotal,
      currency: mockAiResult.data.currency,
      category: null,
      billNumber: mockAiResult.data.billNumber,
      items: mockAiResult.data.items,
      paymentMethod: mockAiResult.data.paymentMethod
    },
    enhancedExtraction: true,
    overallConfidence: mockAiResult.confidence
  };
}

module.exports = {
  mockReceiptData,
  mockOcrResponse,
  mockAiResponse,
  getRandomMockReceipt,
  getMockOcrResponse
};