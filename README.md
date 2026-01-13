# Shipper Chat

Real-time chat application with WebSocket messaging, Google OAuth authentication, and AI chat assistance.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Socket.io Client
- **Backend**: Node.js, Express, TypeScript, Socket.io, Prisma, PostgreSQL
- **AI**: Google Gemini
- **Deployment**: Docker, Google Cloud Run

## Features

- Real-time messaging via WebSocket
- Google OAuth authentication with JWT
- Online/offline user status
- AI chat assistant (Google Gemini)
- Message search and filtering
- Archive and unread management
- File uploads and link detection
- Mobile responsive with swipe gestures

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Google OAuth credentials
- Google Gemini API key (optional, for AI chat)
- Cloudinary account (optional, for file uploads)

### Backend

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/shipper"
   JWT_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   FRONTEND_URL="http://localhost:3000"
   GEMINI_API_KEY="your-gemini-api-key"
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

3. Setup database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. Start server:
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:3001`

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:3000`

## Deployment

### Docker

**Backend:**
```bash
cd backend
docker build -t shipper-backend .
docker run -p 3001:3001 --env-file .env shipper-backend
```

**Frontend:**
```bash
cd frontend
docker build -t shipper-frontend .
docker run -p 3000:3000 shipper-frontend
```

### Google Cloud Run

**Backend:**
```bash
cd backend
gcloud builds submit --config cloudbuild.yml
```

**Frontend:**
```bash
cd frontend
gcloud builds submit --config cloudbuild.yml
```

Set environment variables in Cloud Run console for both services.

## Environment Variables

**Backend (.env):**
- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_SECRET` - JWT signing secret (required)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (required)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (required)
- `FRONTEND_URL` - Frontend URL for CORS (required)
- `GEMINI_API_KEY` - Google Gemini API key (optional)
- `CLOUDINARY_*` - Cloudinary credentials (optional)

**Frontend (.env.local):**
- `NEXT_PUBLIC_API_URL` - Backend API URL (required)

## Project Structure

```
Shipper/
├── backend/          # Express API server
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   └── cloudbuild.yml
├── frontend/         # Next.js application
│   ├── app/
│   ├── components/
│   ├── Dockerfile
│   └── cloudbuild.yml
└── README.md
```

## Scripts

**Backend:**
- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm run start` - Production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run migrations

**Frontend:**
- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm run start` - Production server
