# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set backend API URL (baked into build)
ENV NEXT_PUBLIC_API_URL=https://shipper-chat-backend-103174779702.europe-west1.run.app/api

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package*.json ./

# Install ALL dependencies (Next.js needs full node_modules)
RUN npm install

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080), (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server (npm start will use PORT from env var via package.json script)
CMD ["npm", "start"]
