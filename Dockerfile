# Production Dockerfile for VibeRoom
FROM node:22-alpine AS builder

WORKDIR /app

# Install client dependencies and build
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client ./client
RUN cd client && npm run build

# Install backend dependencies and build
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY backend ./backend
RUN cd backend && npm run build

# Production runner
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Copy backend package and install production dependencies only
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy compiled backend and client dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 4000

CMD ["node", "backend/dist/server.js"]
