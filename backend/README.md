# Shipper Backend

Backend server for Shipper chat application with Google OAuth authentication.

## Tech Stack

- Node.js 20+ with TypeScript
- Express.js
- PostgreSQL (Neon)
- Prisma ORM
- Passport.js (Google OAuth)
- JWT authentication
- Socket.io (for future real-time features)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `COOKIE_SECRET` - Secret key for cookies

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3001`

## API Endpoints

### Authentication

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout (requires auth)
- `POST /api/auth/refresh` - Refresh JWT token (requires auth)

### Users

- `GET /api/users/:userId` - Get user profile (requires auth)
- `PATCH /api/users/me` - Update own profile (requires auth)

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

## Neon PostgreSQL Setup

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env` as `DATABASE_URL`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
