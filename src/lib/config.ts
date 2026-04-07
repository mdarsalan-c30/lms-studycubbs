/**
 * STUDYCUBS LMS - PRODUCTION CONFIGURATION
 * This file acts like a config.php file. 
 * Hardcoded values here will be used if Environment Variables are missing.
 */

export const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || '', 
  database: process.env.DB_NAME || 'studycubs_lms',
  port: parseInt(process.env.DB_PORT || '3306'),
};

export const siteConfig = {
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  secret: process.env.NEXTAUTH_SECRET || 'studycubs-lms-development-secret-key-2024',
};

console.log(`[Config] Initialized for host: ${dbConfig.host}`);
