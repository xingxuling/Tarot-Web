const fs = require('fs');
const path = require('path');

// Load test environment variables
const testEnvPath = path.join(__dirname, '..', '.env.test');
const envContent = fs.readFileSync(testEnvPath, 'utf8');

// Parse and set environment variables
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  }
});

// Verify all required environment variables are loaded
const requiredVars = [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_APP_ENV',
  'ADMOB_PUBLISHER_ID',
  'ADMOB_APP_ID',
  'ADMOB_BANNER_ID',
  'ADMOB_REWARDED_ID'
];

console.log('Test environment variables loaded:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
  console.log(`${varName}:`, value);
});
