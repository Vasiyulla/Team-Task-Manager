import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default to SQLite unless explicitly using PostgreSQL
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const usePostgres = dbUrl && dbUrl.includes('postgresql');

// Database initialization
let sequelize;

if (usePostgres) {
  // PostgreSQL for production (Railway/Render)
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Required for many cloud Postgres providers like Railway/Neon
      },
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  });
  console.log('✓ Using PostgreSQL for production');
} else {
  // SQLite for local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../task_manager.db'),
    logging: false,
  });
  console.log('✓ Using SQLite for local development');
}

// Common configuration
sequelize.options.define = {
  timestamps: true,
  underscored: false,
};

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database authentication successful.');

    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('All models were synchronized successfully.');

    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
