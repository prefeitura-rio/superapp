# 🔄 Refresh Token Strategy

This document explains how the automatic token refresh strategy works in the citizen portal middleware.

## 🎯 Overview

The middleware automatically handles expired access tokens by attempting to refresh them using stored refresh tokens. This provides a seamless user experience by avoiding unnecessary re-authentication when tokens expire.

## 🏗️ Architecture

### Files Structure
```
src/lib/
├── jwt-utils.ts           # JWT expiration checking
├── token-refresh.ts       # Token refresh API calls
├── middleware-helpers.ts  # Middleware helper functions
└── index.ts              # Clean exports
```

### Key Components

1. **`isJwtExpired()`** - Checks if JWT token is expired
2. **`refreshAccessToken()`** - Makes API call to refresh tokens
3. **`handleExpiredToken()`** - Orchestrates the refresh process
4. **Middleware** - Integrates everything together

## 🔄 How It Works

### 1. Token Expiration Detection
```typescript
// Middleware checks every request for expired tokens
if (isJwtExpired(authToken.value)) {
  return await handleExpiredToken(/* params */)
}
```

### 2. Automatic Refresh Attempt
When a token is expired, the middleware:
1. Extracts the refresh token from cookies
2. Makes a POST request to Keycloak's token endpoint
3. Attempts to get new access and refresh tokens

### 3. Token Refresh API Call
```typescript
POST ${NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
refresh_token=${storedRefreshToken}
client_id=${CLIENT_ID}
client_secret=${CLIENT_SECRET}
```

### 4. Response Handling
- **Success**: New tokens are set in cookies, request continues
- **Failure**: User is redirected to session expired page

## 📱 User Experience Flow

### ✅ Successful Refresh
```
User Request → Token Expired → Auto Refresh → New Tokens → Continue
```

### ❌ Failed Refresh
```
User Request → Token Expired → Refresh Failed → Redirect to /sessao-expirada
```

## 🚪 When Users Get Logged Out

Users are automatically logged out in the following scenarios:

### 1. **Refresh Token Expired**
- Refresh token has reached its maximum lifetime
- Keycloak returns an error during refresh attempt
- User is redirected to `/sessao-expirada`

### 2. **Refresh Token Invalid/Revoked**
- Refresh token was revoked by admin
- Token format is corrupted
- User is redirected to `/sessao-expirada`

### 3. **Network/Server Errors**
- Keycloak service is unavailable
- Network connectivity issues
- User is redirected to `/sessao-expirada`

### 4. **No Refresh Token Available**
- User's session was completely cleared
- Cookies were deleted
- User is redirected to authentication page

## 🔐 Security Features

### Token Storage
- **Access Token**: `httpOnly` cookie, path: `/`
- **Refresh Token**: `httpOnly` cookie, path: `/`
- Both tokens are secure and not accessible via JavaScript

### Automatic Cleanup
- Failed refresh attempts immediately redirect to logout
- No partial authentication states
- Consistent user experience

## ⚙️ Configuration

### Environment Variables Required
```bash
NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL=https://auth.example.com
NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID=your_client_id
IDENTIDADE_CARIOCA_CLIENT_SECRET=your_client_secret
```

### Keycloak Endpoint
- **Token URL**: `${BASE_URL}/token`
- **Grant Type**: `refresh_token`
- **Method**: `POST`

## 🧪 Testing Scenarios

### Test Case 1: Valid Refresh Token
1. Set expired access token
2. Set valid refresh token
3. Make request to protected route
4. **Expected**: Token refreshed, request continues

### Test Case 2: Expired Refresh Token
1. Set expired access token
2. Set expired refresh token
3. Make request to protected route
4. **Expected**: Redirect to `/sessao-expirada`

### Test Case 3: No Refresh Token
1. Set expired access token
2. No refresh token
3. Make request to protected route
4. **Expected**: Redirect to `/sessao-expirada`

## 📊 Benefits

1. **Seamless UX**: Users don't see authentication interruptions
2. **Reduced Friction**: No manual re-login for expired sessions
3. **Security**: Automatic token rotation
4. **Performance**: No unnecessary redirects for valid refresh tokens

## 🚨 Limitations

1. **Refresh Token Lifetime**: Depends on Keycloak configuration
2. **Network Dependency**: Requires Keycloak service availability
3. **Single Request**: Only works for the current request

## 🔍 Debugging

### Common Issues
1. **Environment Variables**: Check all required env vars are set
2. **Keycloak Service**: Verify service is running and accessible
3. **Token Format**: Ensure tokens are valid JWT format
4. **CORS**: Check if middleware can reach Keycloak

### Logs
- Failed refresh attempts are handled gracefully
- No sensitive information is logged
- Redirects provide clear user feedback

## 📚 Related Files

- **Middleware**: `src/middleware.ts`
- **JWT Utils**: `src/lib/jwt-utils.ts`
- **Token Refresh**: `src/lib/token-refresh.ts`
- **Middleware Helpers**: `src/lib/middleware-helpers.ts`
- **Constants**: `src/constants/url.ts`
