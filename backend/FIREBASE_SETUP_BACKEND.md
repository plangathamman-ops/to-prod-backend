# Backend Firebase Setup Guide

This guide covers the backend changes made to support Firebase authentication.

## Overview of Backend Changes

Your backend now verifies Firebase tokens and syncs users with MongoDB.

## What Changed

### 1. User Model (`src/models/User.js`)

**New Field**: `firebaseUid`
```javascript
firebaseUid: {
  type: String,
  unique: true,
  sparse: true,
  index: true
}
```

**Modified Field**: `password` is now optional
```javascript
password: {
  type: String,
  required: false, // Changed from true
  minlength: 6,
  select: false
}
```

**Why**: Firebase users don't have passwords stored in your database (Firebase handles it).

### 2. Firebase Config (`src/config/firebase.js`)

Initializes Firebase Admin SDK:
```javascript
const admin = require('firebase-admin');
const serviceAccountKey = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});
```

### 3. Firebase Auth Middleware (`src/middleware/firebaseAuth.js`)

Verifies Firebase ID tokens:
```javascript
exports.verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  req.firebaseUser = decodedToken;
  next();
};
```

### 4. New Auth Endpoints

Added two new endpoints to `src/routes/auth.js`:

#### POST `/api/auth/firebase-register`
```
Request:
{
  firebaseToken: "JWT from Firebase",
  email: "user@example.com",
  uid: "firebase-uid-123",
  firstName: "John",
  lastName: "Doe",
  phoneNumber: "254712345678"
}

Process:
1. Verify Firebase token
2. Check if user exists
3. Create user in MongoDB
4. Generate session JWT
5. Return JWT + user data
```

#### POST `/api/auth/firebase-login`
```
Request:
{
  firebaseToken: "JWT from Firebase",
  email: "user@example.com",
  uid: "firebase-uid-123"
}

Process:
1. Verify Firebase token
2. Find or create user in MongoDB
3. Link Firebase UID if new
4. Generate session JWT
5. Return JWT + user data
```

## Setup Steps

### Step 1: Get Firebase Service Account Key

1. Firebase Console → **Project Settings** (⚙️ icon)
2. Go to **Service Accounts** tab
3. Click **"Generate New Private Key"**
4. JSON file downloads automatically

### Step 2: Add Key to Backend

**Option A: File-based (Development)**
```bash
# Save the downloaded JSON as:
backend/src/config/serviceAccountKey.json

# Add to .gitignore:
echo "src/config/serviceAccountKey.json" >> backend/.gitignore
```

**Option B: Environment Variable (Production)**
```bash
# Convert JSON to string and set env var:
export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

The `src/config/firebase.js` handles both methods automatically.

### Step 3: Install Firebase Admin SDK

Already added to `package.json`. Just install:
```bash
cd backend
npm install
```

### Step 4: Update .env

Add to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d

# Firebase (if using file method, this is optional)
# FIREBASE_SERVICE_ACCOUNT_JSON=...
```

### Step 5: Test Backend

```bash
npm run dev
```

Should start without errors. Check logs for:
```
✓ Firebase Admin SDK initialized successfully
✓ Server running on port 5000
```

## Testing the Backend

### Manual Test with cURL

#### Test Firebase Registration
```bash
# First, get a Firebase token from frontend
# Then use it in this request:

curl -X POST http://localhost:5000/api/auth/firebase-register \
  -H "Content-Type: application/json" \
  -d '{
    "firebaseToken": "eyJhbGci...",
    "email": "test@example.com",
    "uid": "firebase-uid-123",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "254712345678"
  }'

# Response:
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": "mongodb-id",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

#### Test Firebase Login
```bash
curl -X POST http://localhost:5000/api/auth/firebase-login \
  -H "Content-Type: application/json" \
  -d '{
    "firebaseToken": "eyJhbGci...",
    "email": "test@example.com",
    "uid": "firebase-uid-123"
  }'
```

### Integration Test (Frontend + Backend)

1. Start backend: `npm run dev`
2. Start frontend: `npm run dev`
3. Go to `http://localhost:5173/register`
4. Fill form and click "Create Account"
5. Check backend console for logs
6. Check MongoDB for new user with `firebaseUid`

## Database Schema Changes

### New User Document
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  firebaseUid: "abc123xyz...", // NEW
  password: null, // Optional now
  firstName: "John",
  lastName: "Doe",
  phoneNumber: "254712345678",
  role: "student",
  isVerified: true,
  createdAt: ISODate("2024-02-12T..."),
  updatedAt: ISODate("2024-02-12T...")
}
```

## Migration: Existing Users

### Linking Old Users to Firebase

If you have existing users who register with Firebase using same email:
```javascript
// This happens automatically in firebaseLogin:
if (!user.firebaseUid) {
  user.firebaseUid = uid;
  await user.save();
}
```

Existing users can:
1. Try to register with same email → Gets "User already exists"
2. Login via Firebase with same email → Automatically linked

## Debugging

### Check Firebase Initialization
```bash
node -e "require('./src/config/firebase.js'); console.log('Firebase initialized')"
```

### Verify Service Account Key
```bash
node -e "const key = require('./src/config/serviceAccountKey.json'); console.log(key.project_id)"
```

### Monitor Token Verification
Add logging to middleware:
```javascript
exports.verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    console.log('Verifying token:', token.substring(0, 20) + '...');
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Token verified for:', decodedToken.email);
    
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    // ... rest of error handling
  }
};
```

## Common Issues

### Error: "Cannot find module 'firebase-admin'"
```bash
npm install firebase-admin
```

### Error: "serviceAccountKey.json not found"
Either:
1. Download from Firebase Console and save to `src/config/serviceAccountKey.json`
2. Or set `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable

### Error: "Invalid service account"
- Check JSON is valid: `node -e "console.log(JSON.parse(fs.readFileSync('./src/config/serviceAccountKey.json')))"`
- Check Firebase project ID matches
- Regenerate key from Firebase Console

### Error: "User already exists with this email"
- This is normal if registering twice
- Use different email for testing

### User Not Created in MongoDB
- Check MongoDB connection in logs
- Check for duplicate email in database
- Check Firebase token was verified successfully

## Security Notes

⚠️ **IMPORTANT**:

1. **Never commit serviceAccountKey.json**
   ```
   # In .gitignore:
   src/config/serviceAccountKey.json
   ```

2. **Use environment variables in production**
   ```bash
   # In Railway/production:
   export FIREBASE_SERVICE_ACCOUNT_JSON='...'
   ```

3. **Keep JWT_SECRET secure**
   - Use strong random string
   - Don't use same secret as development

4. **Validate Firebase tokens**
   - Always call `admin.auth().verifyIdToken()`
   - Never trust tokens without verification

5. **Enable Firebase Security Rules**
   - Set up Firestore rules in Firebase Console
   - Restrict access by user/role

## Next Steps

1. ✅ Download Firebase Service Account Key
2. ✅ Add key to `src/config/serviceAccountKey.json`
3. ✅ Run `npm install`
4. ✅ Start backend with `npm run dev`
5. ✅ Test with frontend
6. 🔜 Deploy to Rails/Production
   - Set `FIREBASE_SERVICE_ACCOUNT_JSON` env var
   - Test endpoints before going live

## Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/firebase-register` | None | Register with email/password or Google |
| POST | `/auth/firebase-login` | None | Login with email/password or Google |
| POST | `/auth/register` | None | Old endpoint (still works) |
| POST | `/auth/login` | None | Old endpoint (still works) |
| GET | `/auth/me` | JWT | Get current user |
| PUT | `/auth/profile` | JWT | Update user profile |

Old endpoints (`/register`, `/login`) still work for backward compatibility.

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGci...",
  "user": {
    "id": "mongodb-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "254712345678",
    "role": "student",
    "isVerified": true
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid Firebase token"
}
```

## References

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Auth Best Practices](https://firebase.google.com/docs/auth/best-practices)
- [Express.js Middleware](https://expressjs.com/en/guide/using-middleware.html)
