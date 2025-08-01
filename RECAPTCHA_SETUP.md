# reCAPTCHA Enterprise Setup

This document explains how to set up and use Google reCAPTCHA Enterprise in the Next.js 15 app.

## Current Status

⚠️ **IMPORTANT**: The backend API currently doesn't support the `X-Recaptcha-Token` header in CORS preflight requests. This causes CORS errors when trying to use reCAPTCHA.

**Current Implementation**: 
- For authenticated users: Server-side fetch (no reCAPTCHA needed)
- For non-authenticated users: Client-side fetch without reCAPTCHA (temporary solution)

## Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_enterprise_site_key_here
```

## How It Works

### For Authenticated Users
- Categories are fetched server-side using the existing `fetchCategories()` function
- No reCAPTCHA verification is required
- Uses normal authentication headers

### For Non-Authenticated Users (Current)
- Categories are fetched client-side using `CategoriesSimple` component
- **No reCAPTCHA verification** (temporary until backend supports it)
- Falls back to normal fetch requests

### For Non-Authenticated Users (Future - when backend supports reCAPTCHA)
- Categories are fetched client-side using `CategoriesWithRecaptcha` component
- reCAPTCHA Enterprise token is automatically included in requests
- If reCAPTCHA fails, users see an error message with retry option

## Components

### RecaptchaProvider
- Wraps the entire app and provides reCAPTCHA context
- Only loads reCAPTCHA scripts for non-authenticated users
- Provides `executeRecaptcha()` function for token generation

### CategoriesWithRecaptcha (Future)
- Client component that handles categories fetching with reCAPTCHA
- Shows loading states, error states, and retry functionality
- Automatically retries with new reCAPTCHA tokens

### CategoriesSimple (Current)
- Client component that handles categories fetching without reCAPTCHA
- Temporary solution until backend supports reCAPTCHA headers
- Shows loading states, error states, and retry functionality

## Error Handling

The implementation handles several error scenarios:

1. **Rate Limited (429)**: Shows "Muitas tentativas" message
2. **Network Errors**: Shows generic error with retry button
3. **CORS Errors**: Currently handled by falling back to simple fetch
4. **Loading States**: Shows skeleton while data loads

## Backend Requirements

To enable reCAPTCHA support, the backend needs to:

1. **Add CORS headers** to allow `X-Recaptcha-Token` header:
   ```
   Access-Control-Allow-Headers: X-Recaptcha-Token
   ```

2. **Validate reCAPTCHA tokens** for non-authenticated requests:
   - Check for `X-Recaptcha-Token` header
   - Validate using Google reCAPTCHA Enterprise API
   - Return appropriate error responses (e.g., 429 for rate limiting)

3. **Allow requests without reCAPTCHA** for authenticated users

## Switching to reCAPTCHA

Once the backend supports reCAPTCHA headers, update the home page:

```typescript
// In src/app/(app)/(logged-in-out)/(home)/page.tsx
// Change this line:
<CategoriesSimple initialCategories={categories} />

// To this:
<CategoriesWithRecaptcha initialCategories={categories} />
```

## Usage in Other Components

To use reCAPTCHA in other API calls for non-authenticated users (when backend supports it):

```typescript
import { useRecaptcha } from '@/providers/recaptcha-provider'
import { clientRecaptchaFetch } from '@/lib/recaptcha-fetch'

function MyComponent() {
  const { executeRecaptcha } = useRecaptcha()
  
  const fetchData = async () => {
    const response = await clientRecaptchaFetch(
      '/api/endpoint',
      { method: 'GET' },
      executeRecaptcha
    )
    // Handle response
  }
}
```

## Security Considerations

- reCAPTCHA tokens are only generated for non-authenticated users
- Server-side validation is required on the backend
- Tokens have a short lifespan and should be validated immediately
- CSP headers allow Google reCAPTCHA domains

## Troubleshooting

### CORS Error: "Request header field x-recaptcha-token is not allowed"
- **Cause**: Backend doesn't include `X-Recaptcha-Token` in `Access-Control-Allow-Headers`
- **Solution**: Update backend CORS configuration to allow this header
- **Workaround**: Use `CategoriesSimple` component (current implementation)

### reCAPTCHA not loading
- Check that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set correctly
- Verify that user is not authenticated (reCAPTCHA only loads for non-authenticated users)
- Check browser console for script loading errors 