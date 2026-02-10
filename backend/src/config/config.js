const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://appuser:Hamp9map@opportunityhub.ose8qtj.mongodb.net/?appName=OpportunityHub',
  jwtSecret: process.env.JWT_SECRET || '3e43a009947615e66cd5113a64f9851ff85bb6b1aa0ec9628d177521f4215490',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // M-Pesa/Payment Configuration
  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    businessShortCode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.MPESA_CALLBACK_URL,
    apiUrl: process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke'
  },
  
  // File Upload Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  
  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@attachmentsystem.com'
  },
  
  // Application Fee
  applicationFee: 350,
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development'
};
