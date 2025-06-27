# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (runs with turbopack)
- **Build**: `npm run build` 
- **Production server**: `npm start`
- **Linting**: `npm run lint` (Next.js ESLint)
- **Code formatting**: Use Biome (`@biomejs/biome`) - configuration in `biome.json`

## Architecture Overview

This is a **Next.js 15 citizen portal** for accessing public services, built with the App Router pattern and targeting a Brazilian government audience.

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS with mobile-first approach
- **UI Components**: Shadcn UI + Radix UI primitives
- **Authentication**: JWT-based with Keycloak integration via custom middleware
- **API Generation**: Orval generates API clients from OpenAPI spec (`openapi.yaml`)
- **State Management**: Server Components prioritized, minimal client state
- **Deployment**: Containerized with Docker, Kubernetes configs in `k8s/`

### Authentication Flow
- Uses Keycloak OAuth2 with JWT tokens stored in httpOnly cookies
- Middleware (`src/middleware.ts`) handles route protection and token validation
- Public routes defined with conditional redirect behavior
- JWT expiration automatically redirects to external auth provider

### Key Architectural Patterns

**API Layer**: 
- Generated clients in `src/http/` from OpenAPI spec using Orval
- Custom fetch wrapper (`custom-fetch.ts`) handles auth headers and response types
- Server-side API calls preferred over client-side

**Route Structure**:
- `(private)` group: Protected routes requiring authentication
- `(public)` group: Open access routes (sign-in, privacy policy, etc.)
- Nested layouts for different sections (services, user-profile, wallet)

**Component Organization**:
- `src/components/ui/`: Base UI primitives (Shadcn/Radix)
- `src/components/ui/custom/`: Custom composed components
- Page-specific components in respective app directories

**State & Data**:
- Favor React Server Components (RSC) and Next.js built-in data fetching
- Minimize client components (`'use client'`) - only for Web APIs and interactivity
- Use server actions in `src/actions/` for mutations

### Development Guidelines (from .cursor/rules/frontend.mdc)

**Code Style**:
- Functional programming patterns, avoid classes
- TypeScript interfaces over types
- Use Zod for schema validation
- Descriptive variable names with auxiliary verbs (isLoading, hasError)
- Directory naming: lowercase with dashes

**Performance**:
- Limit client components usage
- Wrap client components in Suspense with fallback
- Dynamic loading for non-critical components
- Optimize images (WebP, size data, lazy loading)

**Security & Deployment**:
- CSP headers configured in middleware with nonce support
- Container deployment with standalone Next.js output
- Environment variables for external service configuration
- No test framework currently configured (only node_modules tests found)

### Key Files to Understand
- `src/middleware.ts`: Authentication, CSP, and routing logic
- `custom-fetch.ts`: API client configuration with auth
- `orval.config.ts`: API code generation setup
- `src/app/layout.tsx`: Global layout with analytics and theming
- `biome.json`: Code formatting and linting rules