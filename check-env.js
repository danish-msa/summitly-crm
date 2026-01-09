// Quick script to check if DATABASE_URL is being read
// Run: node check-env.js

require('dotenv').config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('❌ DATABASE_URL is NOT set in .env.local');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('DATABASE')));
} else {
  // Parse URL to show database name (without exposing password)
  try {
    const url = new URL(dbUrl);
    const dbName = url.pathname.replace('/', '');
    console.log('✅ DATABASE_URL is set');
    console.log('Database name:', dbName);
    console.log('Host:', url.hostname);
    console.log('Port:', url.port);
    
    if (dbName !== 'summitly-crm') {
      console.log('⚠️  WARNING: Database name is "' + dbName + '" but should be "summitly-crm"');
    }
  } catch (e) {
    console.log('❌ DATABASE_URL format is invalid:', e.message);
  }
}
