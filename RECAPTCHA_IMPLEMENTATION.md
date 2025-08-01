# 🔒 reCAPTCHA Enterprise Implementation Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Protected Endpoints](#protected-endpoints)
- [User Flow](#user-flow)
- [Component Wrappers](#component-wrappers)
- [Security Features](#security-features)
- [Performance Benefits](#performance-benefits)
- [Technical Implementation](#technical-implementation)
- [User Experience](#user-experience)
- [Key Benefits](#key-benefits)

---

## 🎯 Overview

The reCAPTCHA system protects all API endpoints for non-authenticated users while providing a seamless experience for authenticated users. Once verified, users can access all protected features without re-verification.

### Key Features
- **Global token management** across the entire application
- **Single verification** per session for non-authenticated users
- **Server-side caching** for improved performance
- **Route handlers** with reCAPTCHA token forwarding
- **Invisible challenges** that auto-execute when needed

---

## 🏗️ Architecture

### 1. Global Script Loading

```typescript
// src/app/layout.tsx
<Script
  id="google-recaptcha-enterprise"
  strategy="afterInteractive"
  src="https://www.google.com/recaptcha/enterprise.js?render=explicit"
/>
```

**Benefits:**
- Single script load for entire application
- No repeated loading on page navigation
- Explicit rendering for manual control
- Improved performance

### 2. Global Context Provider

```typescript
// src/providers/recaptcha-provider.tsx
export function RecaptchaProvider({ children }) {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  
  const handleSetRecaptchaToken = (token: string | null) => {
    setRecaptchaToken(token)
    if (token) setIsVerified(true)
  }
}
```

**Features:**
- Global state management
- Token persistence across sessions
- Verification status tracking
- Context sharing across components

### 3. reCAPTCHA Component

```typescript
// src/components/ui/recaptcha-enterprise.tsx
export function RecaptchaEnterprise({ 
  onTokenReceived, 
  onError, 
  action, 
  siteKey 
}) {
  // Reuses globally loaded script
  // Creates invisible reCAPTCHA widgets
  // Auto-executes when ready
  // Calls onTokenReceived with generated token
}
```

**Capabilities:**
- Reuses globally loaded script
- Creates invisible reCAPTCHA challenges
- Auto-execution when widget is ready
- Token callback to parent components

---

## 🛡️ Protected Endpoints

### Route Handlers with reCAPTCHA Support

| Endpoint | Purpose | Cache Duration | reCAPTCHA Action |
|----------|---------|----------------|------------------|
| `/api/categories` | Fetch service categories | 1 day | `fetch_categories` |
| `/api/services/category/[slug]` | Fetch services by category | 1 day | `fetch_services` |
| `/api/services/[collection]/[id]` | Fetch individual service | 1 hour | `fetch_service` |
| `/api/search` | Search functionality | 1 hour | `search` |

### Route Handler Pattern

```typescript
export async function GET(request: NextRequest) {
  const recaptchaToken = request.headers.get('X-Recaptcha-Token')
  
  const headers: HeadersInit = {}
  if (recaptchaToken) {
    headers['X-Recaptcha-Token'] = recaptchaToken
  }
  
  const response = await fetch(externalApiUrl, { headers })
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=86400' }
  })
}
```

**Features:**
- Accepts `X-Recaptcha-Token` header
- Forwards token to external APIs
- Implements server-side caching
- Graceful error handling

---

## 🔄 User Flow

### First Visit (Non-Authenticated User)

#### Step 1: Page Load
```
User visits any protected page (home, services, search, etc.)
↓
Component checks authentication status
↓
isLoggedIn = false, isVerified = false
↓
Show reCAPTCHA challenge
```

#### Step 2: reCAPTCHA Challenge
```
User sees: "Verificação de Segurança"
↓
reCAPTCHA widget auto-executes
↓
User completes challenge (if needed)
↓
Token generated and stored in global context
↓
isVerified = true, recaptchaToken = "token_here"
```

#### Step 3: Data Fetching
```
Component detects isVerified = true
↓
API call made with reCAPTCHA token
↓
Route handler forwards token to external API
↓
Data returned and displayed
```

### Subsequent Visits (Same Session)

#### Step 1: Page Load
```
User visits another protected page
↓
Component checks authentication status
↓
isLoggedIn = false, isVerified = true ✅
↓
Skip reCAPTCHA challenge
↓
Immediate API call with existing token
```

#### Step 2: Seamless Experience
```
No verification needed
↓
Data loads immediately
↓
User can navigate freely
↓
Token persists across all pages
```

### Authenticated Users

#### Step 1: Page Load
```
User visits any page
↓
Component checks authentication status
↓
isLoggedIn = true ✅
↓
Skip reCAPTCHA entirely
↓
Immediate API call without token
```

---

## 🎭 Component Wrappers

### HomeWithRecaptcha
- **Purpose**: Protects categories fetching on home page
- **Shows**: Skeleton loading instead of verification message
- **Action**: `fetch_categories`

### ServicesWithRecaptcha
- **Purpose**: Protects services page
- **Shows**: Verification challenge for non-authenticated users
- **Action**: `fetch_services`

### CategoryWithRecaptcha
- **Purpose**: Protects category-specific services
- **Shows**: Verification challenge for non-authenticated users
- **Action**: `fetch_services`

### ServiceWithRecaptcha
- **Purpose**: Protects individual service pages
- **Shows**: Verification challenge for non-authenticated users
- **Action**: `fetch_service`

### SearchWithRecaptcha
- **Purpose**: Protects search functionality
- **Shows**: Verification challenge for non-authenticated users
- **Action**: `search`

---

## 🔐 Security Features

### Token Management
- **Short-lived**: Tokens expire in minutes
- **Single-use**: Each token used for specific API calls
- **Server-validated**: External APIs validate tokens with Google
- **Context-scoped**: Only available within current session

### Protection Levels
- **Categories**: 1-day caching, reCAPTCHA required
- **Services**: 1-day caching, reCAPTCHA required
- **Individual Services**: 1-hour caching, reCAPTCHA required
- **Search**: 1-hour caching, reCAPTCHA required

### Authentication Bypass
- **Authenticated users**: Skip reCAPTCHA entirely
- **No token needed**: Direct API access for logged-in users
- **Seamless experience**: No verification delays

---

## 🚀 Performance Benefits

### Caching Strategy
- **Server-side caching**: Reduces external API calls
- **1-day categories**: Long-term caching for stable data
- **1-hour services**: Medium-term caching for dynamic data
- **Stale-while-revalidate**: Serves cached data while updating in background

### Script Loading
- **Single load**: reCAPTCHA script loads once globally
- **Reused everywhere**: No repeated script downloads
- **Faster navigation**: No script loading delays

### Token Persistence
- **Global context**: Token stored once, used everywhere
- **No re-verification**: Users don't solve challenges repeatedly
- **Seamless navigation**: Smooth experience across all pages

---

## 🔧 Technical Implementation

### Global Context Integration

```typescript
const { recaptchaToken, setRecaptchaToken, isVerified } = useRecaptcha()

useEffect(() => {
  if (isLoggedIn || isVerified) {
    // Skip reCAPTCHA, fetch data immediately
    fetchData(recaptchaToken)
  } else {
    // Show reCAPTCHA challenge
    setShowRecaptcha(true)
  }
}, [isLoggedIn, isVerified, recaptchaToken])
```

### API Call Pattern

```typescript
const handleSearch = async (query: string) => {
  const headers: HeadersInit = {}
  if (recaptchaToken) {
    headers['X-Recaptcha-Token'] = recaptchaToken
  }
  
  const response = await fetch('/api/search?q=' + query, { headers })
  // Process response...
}
```

### Challenge Persistence

```typescript
// Prevents users from closing reCAPTCHA challenge
useEffect(() => {
  const checkForModal = () => {
    const modal = document.querySelector('iframe[src*="recaptcha/enterprise/bframe"]')
    if (modal && !isProtected) {
      // Apply CSS protection
      const style = document.createElement('style')
      style.textContent = `
        *:not(iframe[src*="recaptcha/enterprise/bframe"]):not(iframe[src*="recaptcha/enterprise/bframe"] *) {
          pointer-events: none !important;
          user-select: none !important;
        }
        iframe[src*="recaptcha/enterprise/bframe"] {
          pointer-events: auto !important;
        }
        body {
          overflow: hidden !important;
        }
      `
      document.head.appendChild(style)
      
      // Add event listeners to prevent interactions
      // ... event listener implementation
    }
  }
  
  const interval = setInterval(checkForModal, 100)
  return () => clearInterval(interval)
}, [])
```

---

## 👥 User Experience

### Non-Authenticated Users
1. **First visit**: Solve reCAPTCHA challenge once
2. **Session persistence**: No re-verification needed
3. **Full access**: All features available after verification
4. **Seamless navigation**: Smooth experience across pages

### Authenticated Users
1. **No verification**: Skip reCAPTCHA entirely
2. **Immediate access**: All features available immediately
3. **No delays**: Direct API access without tokens

### Performance
1. **Fast loading**: Global script loading
2. **Efficient caching**: Server-side caching reduces API calls
3. **Token reuse**: Single verification for entire session
4. **Optimized UX**: Minimal friction for legitimate users

---

## ✅ Key Benefits

| Benefit | Description |
|---------|-------------|
| **Security** | Comprehensive protection for all API endpoints |
| **Performance** | Global script loading and server-side caching |
| **UX** | Seamless experience with token persistence |
| **Scalability** | Centralized token management |
| **Maintainability** | Consistent implementation across all pages |
| **Flexibility** | Easy to add protection to new endpoints |

---

## 📝 Environment Variables

```bash
# Required for reCAPTCHA functionality
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# Required for API calls
NEXT_PUBLIC_API_BUSCA_ROOT_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔄 Adding New Protected Endpoints

1. **Create route handler** with reCAPTCHA token support
2. **Add caching headers** for performance
3. **Create wrapper component** for the page
4. **Integrate with global context** for token management
5. **Test with both authenticated and non-authenticated users**

---

## 🐛 Troubleshooting

### Common Issues
- **Script not loading**: Check `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` environment variable
- **Token not persisting**: Verify `RecaptchaProvider` is wrapping the app
- **Challenge not showing**: Check authentication status logic
- **API errors**: Verify route handler token forwarding

### Debug Steps
1. Check browser console for reCAPTCHA errors
2. Verify environment variables are set correctly
3. Confirm global context is working
4. Test with different authentication states

---

*This implementation provides robust security while maintaining excellent user experience and performance across the entire application.* 