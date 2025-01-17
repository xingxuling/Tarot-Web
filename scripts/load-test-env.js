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

console.log('Test environment variables loaded:');
console.log('ADMOB_PUBLISHER_ID:', process.env.ADMOB_PUBLISHER_ID);
console.log('ADMOB_APP_ID:', process.env.ADMOB_APP_ID);
console.log('ADMOB_BANNER_ID:', process.env.ADMOB_BANNER_ID);
console.log('ADMOB_REWARDED_ID:', process.env.ADMOB_REWARDED_ID);
