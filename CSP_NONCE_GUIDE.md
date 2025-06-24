# CSP Nonce Implementation Guide

## Current Implementation

Your app now uses a nonce-based Content Security Policy for enhanced security. Here's how it works:

### 1. Nonce Generation (middleware.ts)
- A unique nonce is generated for each request
- The nonce is passed through the `x-nonce` header
- CSP headers are set with this nonce for scripts and styles

### 2. Script Handling
- All `<Script>` components in layout.tsx receive the nonce
- External analytics scripts (Google Analytics, Hotjar) are allowed via nonce
- Next.js hydration scripts are allowed using SHA-256 hashes

### 3. Style Handling
- Styles with nonces are allowed
- Known third-party library styles are allowed using SHA-256 hashes
- Libraries like react-hot-toast and vaul that inject styles dynamically are handled via hashes

## Handling CSP Violations

When you see CSP violations in the console, follow these steps:

### For Script Violations:
1. Look for the SHA-256 hash in the error message
2. Add it to the `scriptHashes` array in middleware.ts
3. Example: `'sha256-HASH_HERE'`

### For Style Violations:
1. Look for the SHA-256 hash in the error message
2. Add it to the `styleHashes` array in middleware.ts
3. Example: `'sha256-HASH_HERE'`

### For Font Violations:
- Data URLs are already allowed for fonts
- If you need external fonts, add the domain to `font-src`

### For Connection Violations:
- Add the domain to `connect-src` in the CSP header

## Best Practices

1. **Always use Script component with nonce** for inline scripts
2. **Use style tags with nonce** for custom styles
3. **Collect and add hashes** for third-party libraries that don't support nonces
4. **Test thoroughly** in both development and production modes

## Known Limitations

1. Some third-party libraries don't support nonces
2. Next.js generates some inline scripts that need hash allowlisting
3. Dynamic style injection from libraries requires hash allowlisting

## Future Improvements

Consider using:
- A CSP report-uri to automatically collect violations
- A build-time script to extract and update hashes automatically
- Server-side style collection for better nonce support 