const path = require('path');
const admin = require('firebase-admin');

let serviceAccount;
try {
  // Expect serviceAccountKey.json to be placed at backend/src/config/serviceAccountKey.json
  serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
} catch (err) {
  console.warn('Firebase service account not found at src/config/serviceAccountKey.json.\n' +
    'If you intend to use Firebase Admin, place the downloaded JSON there.');
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Initialize with default credentials if available (e.g., GOOGLE_APPLICATION_CREDENTIALS env)
    try {
      admin.initializeApp();
    } catch (e) {
      // ignore; app may be initialized elsewhere or credentials not provided
    }
  }
}

module.exports = admin;
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure you have FIREBASE_SERVICE_ACCOUNT_JSON environment variable
// Or place your serviceAccountKey.json in the config directory

let firebaseApp;

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_JSON 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : require('./serviceAccountKey.json');

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
  });

  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error.message);
  console.error('Make sure you have configured Firebase credentials');
}

module.exports = firebaseApp;
