const path = require('path');
const admin = require('firebase-admin');

let serviceAccount;

// Try to load service account from environment variable first (Railway production)
if (process.env.SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
    console.log('✓ Firebase service account loaded from SERVICE_ACCOUNT_JSON env var');
  } catch (err) {
    console.error('Error parsing SERVICE_ACCOUNT_JSON:', err.message);
  }
}

// Fallback to local file (for local development)
if (!serviceAccount) {
  try {
    serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
    console.log('✓ Firebase service account loaded from serviceAccountKey.json file');
  } catch (err) {
    console.warn('⚠️  Firebase service account not found.\n' +
      'Set SERVICE_ACCOUNT_JSON env var (Railway) or place serviceAccountKey.json in src/config/');
  }
}

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✓ Firebase Admin SDK initialized successfully');
    } catch (err) {
      console.error('Error initializing Firebase:', err.message);
    }
  } else {
    console.warn('⚠️  Firebase Admin SDK not initialized (no credentials provided)');
  }
}

module.exports = admin;

module.exports = firebaseApp;
