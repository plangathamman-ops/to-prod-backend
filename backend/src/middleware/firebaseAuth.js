const admin = require('firebase-admin');

// Verify Firebase ID Token
exports.verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    try {
      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.firebaseUser = decodedToken;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Firebase token'
      });
    }
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in Firebase authentication'
    });
  }
};

module.exports = exports;
