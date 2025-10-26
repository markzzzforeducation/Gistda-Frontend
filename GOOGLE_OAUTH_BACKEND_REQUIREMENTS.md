# Google OAuth Backend Implementation Requirements

## Overview

This document outlines the backend implementation requirements for Google OAuth integration in the Kanban Board application.

## Required API Endpoints

### 1. Google OAuth Initiation

**Endpoint:** `POST /api/auth/google/initiate`
**Purpose:** Start Google OAuth flow and return authorization URL

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "authUrl": "https://accounts.google.com/oauth/authorize?client_id=...&redirect_uri=...&scope=...&response_type=code&state=..."
}
```

### 2. Google OAuth Callback

**Endpoint:** `POST /api/auth/google/callback`
**Purpose:** Handle Google OAuth callback and exchange code for user info

**Request Body:**

```json
{
  "code": "authorization_code_from_google"
}
```

**Response:**

```json
{
  "token": "jwt_token_for_authenticated_user",
  "user": {
    "id": "user_id",
    "name": "User Full Name",
    "email": "user@example.com"
  }
}
```

### 3. Google OAuth Direct Login (Alternative)

**Endpoint:** `POST /api/auth/google`
**Purpose:** Direct Google OAuth login (if using popup/redirect approach)

**Request Body:**

```json
{
  "idToken": "google_id_token"
}
```

**Response:**

```json
{
  "token": "jwt_token_for_authenticated_user",
  "user": {
    "id": "user_id",
    "name": "User Full Name",
    "email": "user@example.com"
  }
}
```

## Backend Implementation Details

### Required Dependencies

```bash
npm install google-auth-library
# or
npm install @google-cloud/oauth2
```

### Environment Variables

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
JWT_SECRET=your_jwt_secret
```

### Google OAuth Configuration

1. **Google Cloud Console Setup:**

   - Create a new project or use existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - **IMPORTANT: ตั้งค่า Redirect URIs ให้ถูกต้อง:**
     - `http://localhost:5173/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)

2. **OAuth Scopes Required:**
   - `openid`
   - `email`
   - `profile`

### Implementation Steps

#### Step 1: Install Dependencies

```bash
npm install google-auth-library
```

#### Step 2: Create Google OAuth Service

```javascript
// services/googleAuth.js
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function getGoogleUserInfo(code) {
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
  };
}

module.exports = { getGoogleUserInfo, client };
```

#### Step 3: Implement API Endpoints

```javascript
// routes/auth.js
const { getGoogleUserInfo, client } = require("../services/googleAuth");
const jwt = require("jsonwebtoken");

// Initiate Google OAuth
app.post("/api/auth/google/initiate", (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    state: "random_state_string", // for security
  });

  res.json({ authUrl });
});

// Handle Google OAuth callback
app.post("/api/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.body;
    const userInfo = await getGoogleUserInfo(code);

    // Check if user exists in database
    let user = await User.findOne({ email: userInfo.email });

    if (!user) {
      // Create new user
      user = await User.create({
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        provider: "google",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).json({ error: "Google authentication failed" });
  }
});
```

### Database Schema Updates

#### User Model Updates

```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: { type: String, unique: true },
  password: String, // optional for OAuth users
  provider: { type: String, enum: ["local", "google"], default: "local" },
  googleId: String, // Google user ID
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

### Security Considerations

1. **State Parameter:** Use random state parameter in OAuth flow to prevent CSRF attacks
2. **Token Validation:** Always validate Google ID tokens on the server side
3. **User Creation:** Handle both new user creation and existing user login
4. **Error Handling:** Proper error handling for OAuth failures
5. **Rate Limiting:** Implement rate limiting on OAuth endpoints

### Testing

#### Test Cases

1. **New User Registration via Google:**

   - User clicks "Continue with Google"
   - Completes Google OAuth flow
   - New user account created
   - JWT token returned

2. **Existing User Login via Google:**

   - User clicks "Continue with Google"
   - Completes Google OAuth flow
   - Existing user found by email
   - JWT token returned

3. **Error Handling:**
   - Invalid authorization code
   - Google API errors
   - Network failures

### Frontend Integration Notes

The frontend is already configured to:

- Display Google OAuth button
- Handle OAuth flow initiation
- Process OAuth callback
- Store JWT token
- Redirect to main application

### Development vs Production

#### Development

- Use `http://localhost:3000` for redirect URIs
- Use development Google OAuth credentials
- Enable less strict security for testing

#### Production

- Use HTTPS for all redirect URIs
- Use production Google OAuth credentials
- Implement proper error logging
- Add monitoring for OAuth success/failure rates

## Next Steps

1. Set up Google Cloud Console project
2. Configure OAuth 2.0 credentials
3. Implement backend endpoints
4. Test OAuth flow end-to-end
5. Deploy to production with proper security measures

## Support

For questions about this implementation, refer to:

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Auth Library Documentation](https://github.com/googleapis/google-auth-library-nodejs)
- [JWT Documentation](https://jwt.io/)
