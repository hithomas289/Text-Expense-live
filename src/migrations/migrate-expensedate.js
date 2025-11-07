const { sequelize } = require('../config/database');

async function migrateExpenseDateToString() {
  try {
    console.log('🔧 Checking if expenseDate migration is needed...');

    // Check current column type
    const [columnInfo] = await sequelize.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = 'expenses' AND column_name = 'expenseDate';
    `);

    if (columnInfo.length === 0) {
      console.log('⚠️ expenseDate column not found, skipping migration');
      return;
    }

    const currentType = columnInfo[0].data_type;
    console.log(`📊 Current expenseDate type: ${currentType}`);

    if (currentType === 'date') {
      console.log('🔧 Running migration: Converting expenseDate from DATE to VARCHAR(50)...');

      await sequelize.query(`
        ALTER TABLE expenses
        ALTER COLUMN "expenseDate" TYPE VARCHAR(50)
        USING CAST("expenseDate" AS VARCHAR(50));
      `);

      console.log('✅ Migration completed: expenseDate is now VARCHAR(50)');
      console.log('📝 This allows storing partial dates like "Oct 19", "Oct 2023"');
    } else if (currentType === 'character varying') {
      console.log('✅ Migration not needed: expenseDate is already VARCHAR');
    } else {
      console.log(`⚠️ Unexpected type: ${currentType}`);
    }

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    // Don't throw - let the app continue even if migration fails
  }
}

module.exports = { migrateExpenseDateToString };
