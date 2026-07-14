# 🏛️ SuperApp - PrefRio 🇺🇸

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [How to Run the Project](#how-to-run-the-project)
- [Authentication System](#authentication-system)
- [Orval - API Generation](#orval---api-generation)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)

## Overview

This is a **Next.js 15** project built with:

- **Framework**: Next.js 15.4.6 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.5
- **Authentication**: Keycloak (Identidade Carioca)
- **HTTP Clients API Generation**: Orval
- **UI Components**: Radix UI + shadcn/ui
- **Validation**: Zod + React Hook Form
- **Node Version**: 23.7.0

## Prerequisites

Before starting, make sure you have installed:

- **Node.js**: version 23.7.0 (recommended to use nvm)
- **npm**: version compatible with Node 23.7.0
- **Git**: for version control

### Installing the correct Node.js version

```bash
# If you use nvm (recommended)
nvm install 23.7.0
nvm use 23.7.0

# Verify the installed version
node --version
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone git@github.com:prefeitura-rio/superapp.git
cd superapp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file at the project root with the following variables and their respective values:

```env
# Keycloak / Identidade Carioca
NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL=
NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID=superapp
NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI=
IDENTIDADE_CARIOCA_CLIENT_SECRET=

# API URLs
NEXT_PUBLIC_BASE_API_URL=
BASE_API_URL_APP_BUSCA_SEARCH=
BASE_API_URL_SUBPAV_OSA_API=
BASE_API_URL_RMI=
COURSES_BASE_API_URL=

# Gov.br
NEXT_PUBLIC_GOVBR_BASE_URL=

# Analytics and Tracking
NEXT_PUBLIC_HOTJAR_ID=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=G

# Google Maps
GOOGLE_MAPS_API_KEY=

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=

# Internal API Keys
API_KEY_SUBPAV_OSA_SMS=

# Environment
NODE_ENV=development
```

## How to Run the Project

### Development Mode

To start the development server with Turbopack:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Mode

To build and run in production mode:

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Lint

To run code checks:

```bash
npm run lint
```

## Authentication System

The application uses **Keycloak** (Identidade Carioca) for authentication via OAuth 2.0 / OpenID Connect.

### Authentication Flow

#### 1. **Login Initiation**

The user is redirected to Keycloak (Identidade Carioca) when trying to access protected routes:

#### 2. **Callback after Login**

After successful authentication, Keycloak redirects to:

```
/api/auth/callback/keycloak
```

**What happens:**

- Receives the `code` from the authorization code flow
- Exchanges the `code` for tokens (access_token and refresh_token) at the Keycloak `/token` endpoint
- Stores the tokens in httpOnly cookies:
  - `access_token`: used to authenticate API requests
  - `refresh_token`: used to renew the access_token when it expires

#### 3. **Route Protection Middleware**

**File**: [`src/middleware.ts`](../../src/middleware.ts)

The middleware protects routes and manages authentication state:

**Public Routes:**

- `/` (home)
- `/busca/*`
- `/servicos/*`
- `/ouvidoria/*`
- `/sessao-expirada`
- `/politicas-de-uso-de-cookies`

**Protected Routes:**

- `/carteira` (digital wallets)
- `/meu-perfil` (user data)
- Any route not listed as public

**Middleware Features:**

1. **Token Verification**: Checks if the `access_token` exists in cookies
2. **Expiration Validation**: Uses `isJwtExpired()` to verify if the JWT token has expired
3. **Automatic Refresh**: If the token has expired, attempts to renew it using the `refresh_token`
4. **Redirection**: Redirects unauthenticated users to login routes

#### 4. **Token Renewal**

When the `access_token` expires, the system:

- Uses the `refresh_token` to obtain a new `access_token`
- Makes a POST request to the Keycloak `/token` endpoint
- Updates the cookies with the new tokens

#### 5. **Logout**

Logout process:

1. Retrieves the `refresh_token` from cookies
2. Makes a request to the Keycloak `/logout` endpoint
3. Clears the authentication cookies (access_token and refresh_token)

### Using Tokens in API Requests

The `customFetch` automatically adds the authentication token to all requests:

### Security

- **httpOnly Cookies**: Tokens are not accessible via JavaScript (protects against XSS)
- **CSP Headers**: Content Security Policy configured in middleware
- **Token Expiration**: Automatic validation of token expiration
- **Refresh Token Flow**: Token renewal without interrupting user experience

## Orval - API Generation

**Orval** is a tool that automatically generates TypeScript code to consume REST APIs from an OpenAPI specification.

### What is Orval?

Orval reads an OpenAPI file (JSON/YAML) and generates:

- **TypeScript Types**: Interfaces and types based on API schemas
- **Request Functions**: Hooks and ready-to-use functions for making HTTP calls
- **Validation**: Type-safe requests and responses

### Orval Configuration

**File**: [`orval.config.ts`](../../orval.config.ts)

```typescript
import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/app-rmi/refs/heads/staging/docs/openapi-v3.json',
    output: {
      target: './src/http/api.ts', // Main generated file
      schemas: './src/http/models', // Folder with generated types/models
      mode: 'tags-split', // Separates endpoints by tags
      client: 'fetch', // Uses fetch API
      biome: true, // Formats with Biome
      httpClient: 'fetch',
      clean: true, // Cleans old files before generating
      override: {
        mutator: {
          path: './custom-fetch.ts', // Uses custom fetch
          name: 'customFetch',
        },
      },
    },
  },
})
```

### How Orval works in this project

1. **Data Source (Input)**:

   - OpenAPI spec URL: `https://raw.githubusercontent.com/prefeitura-rio/app-rmi/refs/heads/staging/docs/openapi-v3.json`
   - Orval downloads this file automatically

2. **Output**:

   - **`src/http/api.ts`**: Main file with functions for making requests
   - **`src/http/models/`**: Folder with all TypeScript types/interfaces

3. **Mode: tags-split**:

   - Separates endpoints into multiple files based on OpenAPI tags
   - Organization: `src/http/admin/`, `src/http/citizen/`, `src/http/avatars/`, etc.

4. **Custom Fetch Mutator**:
   - Uses [`custom-fetch.ts`](../../custom-fetch.ts) for all requests
   - Automatically adds:
     - Authentication token (Bearer token)
     - Correct base URL
     - Necessary headers
     - Handling of different content-types (JSON, PDF, etc.)

### How to Run Orval

#### Generate/Regenerate APIs

```bash
npx orval
```

This command will:

1. Download the OpenAPI file from the configured URL
2. Clean the `src/http/` folder (except custom files)
3. Generate new TypeScript files with:
   - Types and interfaces in `src/http/models/`
   - API functions organized by tags in subfolders

#### When to run Orval?

Execute `npx orval` when:

- The backend API adds new endpoints
- The backend API modifies existing schemas
- You clone the repository for the first time
- You need to update types to reflect API changes

### Structure Generated by Orval

```
src/http/
├── admin/          # Endpoints
├── avatars/        #
├── beta-groups/    #
├── beta-whitelist/ #
├── citizen/        #
├── config/         #
├── health/         #
├── metrics/        #
├── phone/          #
├── validation/     #
└── models/         # All TypeScript types (schemas)
```

It's important to **not modify** automatically generated files.

### Usage Example

After Orval generates the files, you can import and use the functions:

```typescript
import { getCitizenProfile } from '@/http/citizen'

// The function already has:
// - Correct request/response types
// - Automatic authentication (via custom-fetch)
// - Configured base URL
const profile = await getCitizenProfile()
```

### Custom Fetch

The [`custom-fetch.ts`](../../custom-fetch.ts) intercepts all requests generated by Orval and:

### Benefits of Orval

✅ **Type Safety**: Automatic TypeScript types ensure compile-time safety
✅ **Synchronization**: Code always synchronized with the API specification
✅ **Productivity**: No need to manually write types and API functions
✅ **Maintainability**: API changes are easily reflected by running a command
✅ **DX (Developer Experience)**: Autocomplete and validation in the editor

## Project Structure

```
superapp/
├── .github/              # GitHub workflows and configurations
├── .next/                # Next.js build (generated)
├── docs/                 # Additional documentation
├── k8s/                  # Kubernetes configurations
├── node_modules/         # Dependencies (generated)
├── public/               # Static assets
├── src/
│   ├── actions/          # Next.js server actions
│   ├── app/              # Next.js App Router
│   │   ├── (app)/        # Application route group
│   │   ├── (private)/    # Private/authenticated routes
│   │   ├── api/          # API routes
│   │   │   └── auth/     # Authentication endpoints
│   │   ├── components/   # Page-specific components
│   │   ├── globals.css   # Global styles
│   │   └── layout.tsx    # Root layout
│   ├── assets/           # Images and assets
│   ├── components/       # Reusable React components
│   ├── constants/        # Application constants
│   ├── env/              # Environment variable validation
│   ├── helpers/          # Helper functions
│   ├── hooks/            # Custom React hooks
│   ├── http/             # APIs generated by Orval
│   ├── http-courses/     # APIs generated by Orval
│   ├── lib/              # Libraries and utilities
│   │   ├── jwt-utils.ts      # JWT utilities
│   │   ├── token-refresh.ts  # Token refresh logic
│   │   └── middleware-helpers.ts
│   ├── middleware.ts     # Next.js middleware
│   ├── mocks/            # Test mocks
│   ├── providers/        # Context providers
│   └── types/            # Shared TypeScript types
├── .env                  # Environment variables
├── .nvmrc                # Node.js version
├── biome.json            # Biome configuration (linter/formatter)
├── components.json       # shadcn/ui configuration
├── custom-fetch.ts       # Custom fetch for Orval
├── custom-fetch-course.ts
├── Dockerfile            # Docker for production
├── next.config.ts        # Next.js configuration
├── orval.config.ts       # Orval configuration
├── package.json          # Dependencies and scripts
├── postcss.config.mjs    # PostCSS configuration
├── README.md             # Standard README
├── tsconfig.json         # TypeScript configuration
└── doc.md                # This documentation
```

## Available Scripts

| Script    | Command         | Description                              |
| --------- | --------------- | ---------------------------------------- |
| **dev**   | `npm run dev`   | Starts development server with Turbopack |
| **build** | `npm run build` | Creates production build                 |
| **start** | `npm start`     | Starts production server                 |
| **lint**  | `npm run lint`  | Runs linter                              |
| **orval** | `npx orval`     | Generates TypeScript code from API       |

## Docker

The project includes a `Dockerfile` for deployment. To build the image:

```bash
# Build the image
docker build -t superapp .

# Run container
docker run -p 3000:3000 superapp
```

## Main Technologies

### Frontend

- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Static typing
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible and unstyled components
- **shadcn/ui**: Component library

### Authentication and Security

- **Keycloak**: OAuth 2.0 / OIDC authentication server
- **jwt-decode**: JWT decoding on frontend
- **CSP**: Configured Content Security Policy

### Forms and Validation

- **React Hook Form**: Form management
- **Zod**: Schema validation
- **libphonenumber-js**: Phone validation

### APIs and HTTP

- **Orval**: Code generation from OpenAPI
- **Fetch API**: Native HTTP client

### Analytics and Monitoring

- **Google Analytics**: User tracking
- **Google Tag Manager**: Tag management
- **Hotjar**: Behavior analysis

### Others

- **date-fns**: Date manipulation
- **Swiper**: Carousels and sliders
- **canvas-confetti**: Confetti animations
- **react-hot-toast / sonner**: Toast notifications

## Contributing

1. Create a branch for your feature: `git checkout -b feat/ck-999999/my-feature`
2. Commit your changes: `git commit -m 'feat(courses-page): add my-courses list'`
3. Push to the branch: `git push origin feat/ck-999999/my-feature`
4. Open a Pull Request

---

> 📅 Last updated: October 2025
