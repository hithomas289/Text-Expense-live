const { Sequelize } = require('sequelize');
const config = require('./config');

// Create Sequelize instance
const dialect = config.database.url.startsWith('sqlite:') ? 'sqlite' : 'postgres';

const baseDialectOptions = dialect === 'postgres' ? {
  ssl: process.env.NODE_ENV === 'production' ? {
    require: true,
    rejectUnauthorized: false
  } : false,
  // Increase connection timeout for Railway database
  connectTimeout: 60000, // 60 seconds
  socketTimeout: 60000   // 60 seconds
} : {
  timeout: 10000 // 10 seconds for SQLite
};

const sequelize = new Sequelize(config.database.url, {
  dialect,
  dialectOptions: baseDialectOptions,
  pool: dialect === 'sqlite' ? undefined : {
    max: config.database.options.max,
    min: 0,
    acquire: config.database.options.connectionTimeoutMillis,
    idle: config.database.options.idleTimeoutMillis
  },
  logging: false
});

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
}

// Handle database migrations for SQLite
async function runMigrations() {
  if (dialect === 'sqlite') {
    try {
      // Check if new columns exist and add them if missing
      const QueryInterface = sequelize.getQueryInterface();

      const receiptTableInfo = await sequelize.query(
        "PRAGMA table_info(receipts);",
        { type: sequelize.QueryTypes.SELECT }
      );

      const existingColumns = receiptTableInfo.map(col => col.name);

      // List of new columns to add
      const newColumns = [
        { name: 'originalFilename', type: 'TEXT' },
        { name: 'originalFileUrl', type: 'TEXT' },
        { name: 'fileType', type: 'TEXT' },
        { name: 'fileSize', type: 'INTEGER' },
        { name: 'serialNumber', type: 'TEXT' },
        { name: 'billNumber', type: 'TEXT' },
        { name: 'invoiceNumber', type: 'TEXT' },
        { name: 'miscellaneous', type: 'DECIMAL(10,2)' }
      ];

      // Add missing columns
      for (const column of newColumns) {
        if (!existingColumns.includes(column.name)) {
          await sequelize.query(
            `ALTER TABLE receipts ADD COLUMN ${column.name} ${column.type};`
          );
          console.log(`✅ Added column ${column.name} to receipts table`);
        }
      }

    } catch (error) {
      console.error('Migration warning (continuing):', error.message);
      // Continue even if migration fails - the app should handle missing columns gracefully
    }
  } else if (dialect === 'postgres') {
    try {
      // PostgreSQL migrations
      console.log('🔧 Running PostgreSQL migrations...');

      // Migration: Convert expenseDate from DATE to VARCHAR(50) for partial dates
      const { migrateExpenseDateToString } = require('../migrations/migrate-expensedate');
      await migrateExpenseDateToString();

    } catch (error) {
      console.error('PostgreSQL migration warning (continuing):', error.message);
      // Continue even if migration fails
    }
  }
}

// Initialize database (create tables if they don't exist)
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Import V2 models to ensure they're registered (avoiding legacy conflicts)
    const models = require('../models/database/indexV2');
    console.log('📦 V2 Models loaded:', Object.keys(models));
    
    // Sync all models with force: false to create tables if they don't exist
    await sequelize.sync({ force: false, alter: false });
    
    // Run migrations for existing tables
    await runMigrations();
    
    console.log('✅ Database synchronized successfully.');
    console.log('📊 Tables created/verified');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error.message);
    console.error('Error details:', error);
    throw error;
  }
}

// Close database connection
async function closeConnection() {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
}

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase,
  closeConnection
};