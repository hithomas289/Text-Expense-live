const config = {
  // WhatsApp API Configuration
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
    botNumber: process.env.WHATSAPP_BOT_NUMBER,
    apiVersion: 'v18.0'
  },

  // Google Cloud Vision API
  googleVision: {
    apiKey: process.env.GOOGLE_VISION_API_KEY || '',
    projectId: process.env.GOOGLE_PROJECT_ID || '',
    serviceAccountPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    enabled: process.env.GOOGLE_VISION_ENABLED === 'true'
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o-mini',
    maxTokens: 1000,
    enabled: process.env.OPENAI_ENABLED === 'true'
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://localhost:5432/textexpense',
    options: {
      // Connection pool settings
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    }
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // File Storage Configuration
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local', // 'local' or 'aws'
    localPath: process.env.NODE_ENV === 'production' ? '/app/uploads' : './uploads',
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || '',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  },

  // Application Settings
  app: {
    trialReceiptLimit: parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5,
    proReceiptLimit: parseInt(process.env.PRO_RECEIPT_LIMIT) || 25,
    fileExpirationDays: 7,
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 10,
    testingMode: process.env.TESTING_MODE === 'true' || false
  }
};

// Validation for required environment variables
function validateConfig() {
  const required = [
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    'WEBHOOK_VERIFY_TOKEN'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', missing.join(', '));
    console.warn('Some features may not work properly. Set these in Railway environment.');
    // Don't exit - let the app start anyway for migration purposes
  } else {
    console.log('✅ All required environment variables are set');
  }
}

// Validate config on load
validateConfig();

module.exports = config;