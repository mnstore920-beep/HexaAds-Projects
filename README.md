# HexaAds

HexaAds is a Next.js marketing dashboard prototype focused on authentication, Google Ads connectivity, and a SaaS-style product experience for campaign reporting workflows. The repository currently contains the main application shell, MongoDB-backed user auth, email verification and password reset flows, and Google Ads OAuth/account authorization logic.

## Overview

The implementation in this repository is a frontend-first Next.js application built with TypeScript and Tailwind CSS. It includes:

- user signup, login, email verification, and password reset flows
- Google OAuth sign-in for users
- Google Ads OAuth authorization and connection management
- a dashboard shell with product pages for data sources, reports, templates, analytics, and settings
- MongoDB-backed storage for users and OAuth state/connection records
- email delivery via Resend for verification and reset emails

This is an operational codebase with UI pages and working backend routes, but several product areas remain UI placeholders or partially implemented workflows rather than fully finished analytics systems.

## Tech Stack

The project uses the versions declared in the root package manifest and frontend app configuration:

- Next.js: 16.3.2
- React: 19.2.8
- TypeScript: ^5
- Tailwind CSS: 3.4.19
- MongoDB Node.js driver: 6.21.0
- NextAuth: 4.24.15
- bcryptjs: 3.0.3
- Resend: 6.22.1
- ESLint: 9.39.5 with Next.js lint config

## Architecture

The repository is structured as a Next.js app with the primary implementation under `frontend/` and supporting design assets under `Figma-references/`.

```text
HexaAds/
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── analytics/
│   │   ├── reports/
│   │   ├── templates/
│   │   ├── settings/
│   │   └── ...
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── app/layout.tsx
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next-env.d.ts
├── Figma-references/
├── backend/
├── eslint.config.mjs
├── package.json
├── package-lock.json
└── README.md
```

### Frontend responsibilities

- `frontend/app/`: route-level pages and API endpoints
- `frontend/components/`: reusable UI blocks, dashboard shell, user menu, Google Ads account list
- `frontend/lib/`: authentication, MongoDB, Google Ads OAuth, token encryption, and token-refresh logic
- `frontend/public/`: static assets such as product images and brand assets

### Runtime flow

```text
User
  ↓
Next.js frontend pages
  ↓
Next.js API routes
  ↓
MongoDB (users, OAuth state, Google Ads connection records)
  ↓
Google Ads API / Resend / Google OAuth endpoints
```

## Application Routes and Pages

The following routes are present in the frontend app and are implemented as actual pages or shells:

### Authentication

- `/login`
- `/signup`
- `/forgot-password`
- `/verify-code`
- `/verify-email`

These flows are backed by MongoDB and email delivery via Resend.

### Dashboard and product screens

- `/dashboard`
- `/dashboard/data-sources`
- `/analytics`
- `/reports`
- `/report-builder`
- `/templates`
- `/clients`
- `/connections`
- `/alerts`
- `/ai-analyst`
- `/settings`

### API routes

- `/api/auth/[...nextauth]`
- `/api/auth/signup`
- `/api/auth/forgot-password`
- `/api/auth/verify-code`
- `/api/auth/verify-email`
- `/api/google-ads/connect`
- `/api/google-ads/callback`
- `/api/google-ads/status`
- `/api/google-ads/accounts`

### Current product-page reality

Some product pages are implemented as polished empty-state or shell screens rather than live business functionality. For example:

- analytics pages show actionable empty states until a Google Ads data source is connected
- reports and templates pages present product UI and templates, but there is no evidence of a production report-generation backend in the repository
- alerts, clients, and AI analyst pages exist as navigation targets and UI placeholders

These pages should be treated as product scaffolding or early-stage UI rather than fully working backend-driven features unless more implementation is added.

## Authentication

HexaAds uses NextAuth with a JWT session strategy.

### Credentials authentication

The credentials flow is implemented in `frontend/lib/auth.ts` and uses:

- `CredentialsProvider`
- password lookup in the `users` collection
- `bcryptjs` for password comparison
- an email verification gate before credentials login is allowed

### Google authentication

The app also registers a `GoogleProvider` for NextAuth. In the sign-in callback, the app:

- normalizes the email address
- looks up the matching user in MongoDB
- creates the user record if it does not exist
- marks `emailVerified` as true for Google-based logins
- updates profile fields if needed

### Email verification and password reset

The app implements:

- signup with secure token generation and hashed verification tokens
- verification email delivery via Resend
- verification endpoint that validates the token and expiry date
- forgot-password email with a six-digit reset code and expiry handling
- reset-code verification and password update with `bcryptjs`

### Session handling

The auth configuration uses:

- `session.strategy = "jwt"`
- pages configured as sign-in and error route `/login`
- redirect logic that sends authenticated users to `/dashboard/data-sources` by default

## Google Ads Integration

The Google Ads flow is implemented as a real OAuth-based connection flow.

### OAuth flow

The code path is:

1. User visits `/api/google-ads/connect`
2. The route validates the authenticated session
3. A random OAuth state is generated and stored in MongoDB along with a PKCE verifier and a return path
4. The app redirects the user to Google’s OAuth authorization endpoint
5. The callback endpoint validates the state cookie and the hashed state stored in MongoDB
6. The authorization code is exchanged for tokens
7. The access token and refresh token are encrypted before being stored
8. The app checks that the granted scopes include the required Google Ads scope
9. The connection is persisted and the user is redirected back to the configured return URL

### Google Ads-specific security and checks

The implementation includes several actual protections:

- PKCE for OAuth exchange
- state generation and hashing for single-use OAuth state validation
- timing-safe comparison for state matching
- token encryption with AES-256-GCM via `GOOGLE_ADS_TOKEN_ENCRYPTION_KEY`
- encrypted storage of access and refresh tokens in MongoDB
- automatic access-token refresh when the token is near expiry
- scope validation before storing or using a connection
- expiry enforcement for stored OAuth state records

### Google Ads account listing

The app also contains logic to:

- load the user’s Google Ads connection from MongoDB
- refresh expired access tokens
- call `customers:listAccessibleCustomers` on the Google Ads API
- return available account IDs and formatted customer IDs
- display them in the `GoogleAdsAccountsList` UI component

This is implemented and actively used in the UI.

## UI and Design

The project’s interface is strongly styled as a productized SaaS dashboard with modern pastel and indigo visual language. The design direction is consistent with the included Figma assets under `Figma-references/` and the product screens in `frontend/app/`.

Notable UI elements include:

- dashboard shell with sidebar navigation
- authentication pages for login and signup
- data source connector cards
- Google Ads account cards with copyable customer IDs
- empty-state screens for analytics and reports
- product pages for templates, reports, and dashboard workflows

The repo includes a dedicated `Figma-references/` directory containing reference images and mockups, which appear to inform the implemented product design.

## Environment Variables

The following environment variables are explicitly used by the application code and should be configured before running the app locally or deploying it.

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string
# or
MONGODB_DIRECT_URI=your_mongodb_connection_string
MONGODB_DB=hexaads

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth / Google Ads
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# legacy aliases supported by the app code
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
GOOGLE_ADS_REDIRECT_URI=http://localhost:3000/api/google-ads/callback
GOOGLE_ADS_TOKEN_ENCRYPTION_KEY=32-byte_key_or_base64url_32byte_value
GOOGLE_ADS_DEVELOPER_TOKEN=your_google_ads_developer_token
# or
GOOGLE_DEVELOPER_TOKEN=your_google_ads_developer_token

# Email delivery
RESEND_API_KEY=your_resend_api_key

# Optional app URL fallback used in some signup and verification links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> The app code confirms these variable names. Values are placeholders only; never commit real credentials.

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- MongoDB instance or connection string
- Google Cloud OAuth client for Google sign-in and Google Ads OAuth
- Google Ads developer token for the account-listing API
- Resend API key for email verification and password reset

### Install dependencies

```bash
git clone <repository-url>
cd HexaAds
npm install
```

### Run the app locally

```bash
npm run dev
```

The app is configured to run the Next.js app from the `frontend/` directory via the root script:

```json
"dev": "next dev frontend"
```

The local app is expected at:

```text
http://localhost:3000
```

## Available Commands

From the repository root:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

The root `package.json` includes a placeholder test script:

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

This means there is no real automated test suite configured at the moment.

## Testing and Validation

### Confirmed status

At the moment, the repository does not include a working automated test suite. The root package script for tests is a placeholder and exits with an error.

### Validation commands that do exist

```bash
npm run lint
```

This is the project’s current validation command, but it is not a replacement for an automated test suite.

## Security

The codebase includes several actual security measures that are implemented and worth documenting:

- password hashing with `bcryptjs`
- secure verification-token generation and hashing for email verification
- one-time reset code generation with hashing and expiry enforcement
- Google OAuth state validation and PKCE-based flow
- encrypted storage of Google Ads tokens using AES-256-GCM
- MongoDB indexes for OAuth state expiry and uniqueness
- protected routes requiring a valid session for dashboard access
- cookie settings using `httpOnly`, `sameSite`, and production-safe `secure` flags for OAuth state cookies

### Sensitive data handling

> Never commit `.env` files, API keys, OAuth secrets, database credentials, encryption keys, or other sensitive values to the repository.

## Current Status

### Implemented

- Next.js frontend and routing structure
- user authentication with credentials and Google OAuth
- MongoDB-backed user records
- email verification and password reset workflow
- Google Ads OAuth connection flow
- Google Ads customer account fetching and display
- dashboard and product shell UI with navigation and data-source actions
- design system and SaaS-style dashboard styling

### In progress / partial

- analytics functionality is mostly presented as an empty-state UI waiting for connected data sources
- report builder and reporting logic are surfaced in the UI but are not backed by a full reporting engine in this repository
- many product pages exist as polished shells rather than fully implemented back-end workflows

### Planned

The following items are reasonable roadmap topics based on the repository direction, but they are not yet implemented as confirmed features in the codebase:

- richer analytics ingestion and reporting pipelines
- managed data synchronization for additional marketing sources
- automated SQA and API test coverage
- end-to-end UI testing
- production hardening and deployment documentation

## Roadmap

A realistic roadmap for this codebase would include:

1. SQA and automated tests for auth, OAuth, and API routes
2. API and integration test coverage for MongoDB-backed flows
3. end-to-end testing for login, signup, verification, and Google Ads connection
4. deeper analytics and reporting backend implementation
5. infrastructure and deployment hardening
6. clearer production environment documentation and operations guides

## Contributors

The repository does not expose a formal contributor list in the codebase or commit metadata. The project is currently represented as a development team effort without a verified individual author list.

## License

The repository currently declares the license as:

```text
ISC
```

## Project Structure Summary

```text
HexaAds/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── ...
├── Figma-references/
├── backend/
├── package.json
├── eslint.config.mjs
├── README.md
└── .gitignore
```

## Conclusion

This repository is a functioning early-stage marketing data product with a strong UI direction, real authentication workflows, and a working Google Ads OAuth connection path. It should be understood as a product prototype and implementation scaffold rather than a fully completed analytics platform.
