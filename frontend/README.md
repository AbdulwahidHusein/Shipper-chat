# Shipper Frontend

Frontend for Shipper chat application built with Next.js 16, React 19, and TypeScript.

## Features

- ✅ Google OAuth Authentication
- ✅ Clean, centralized API client
- ✅ Protected routes
- ✅ Real-time chat UI (ready for WebSocket integration)
- ✅ Contact Info modal with Media/Links/Docs tabs
- ✅ Professional, scalable architecture

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Architecture

### API Client (`lib/api-client.ts`)

Centralized API communication layer:
- Automatic cookie handling (credentials: 'include')
- Standardized error handling
- Type-safe responses
- Easy to extend for new endpoints

### Authentication (`contexts/AuthContext.tsx`)

Clean auth state management:
- `useAuth()` hook for accessing user data
- Automatic auth checking on mount
- Login/logout functions
- Protected route wrapper

### Protected Routes

Use `<ProtectedRoute>` component to protect pages:

```tsx
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

## API Integration

### Using the API Client

```typescript
import { authApi, userApi } from '@/lib/api-client';

// Get current user
const response = await authApi.getCurrentUser();
if (response.success) {
  const user = response.data;
}

// Update profile
const updateResponse = await userApi.updateProfile({
  name: 'New Name',
});
```

## Authentication Flow

1. User clicks "Sign in with Google" → Redirects to backend OAuth
2. Backend handles Google OAuth → Sets JWT cookie
3. Backend redirects to frontend with `?auth=success`
4. Frontend refreshes user data → User is authenticated
5. All API calls automatically include JWT cookie

## Project Structure

```
frontend/
├── app/                    # Next.js app router
│   ├── login/             # Login page
│   └── chat/              # Chat page (protected)
├── components/
│   ├── auth/             # Auth components
│   ├── chat/             # Chat components
│   ├── modals/           # Modal components
│   └── ui/               # Reusable UI components
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Auth state management
├── lib/
│   ├── api-client.ts     # Centralized API client
│   └── design-tokens.ts # Design system tokens
└── types/                # TypeScript types
```

## Tech Stack

- **Framework**: Next.js 16.1.1
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4 + Design Tokens
- **State**: React Context API
- **API**: Fetch API with centralized client
