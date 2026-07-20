# ROSTR Agent — Multi-stage Docker build
# Minimal production image with CLI + API server

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 py3-pip python3-dev gcc musl-dev

# Backend builder
FROM base AS backend
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY . .

# Frontend assets
FROM base AS frontend
WORKDIR /app/public
RUN apk add --no-cache git
RUN echo "ROSTR Agent UI" > index.html

# Runtime
FROM base AS runtime
WORKDIR /app

# Copy Node deps
COPY --from=backend /app/node_modules ./node_modules
COPY --from=backend /app/*.js ./
COPY --from=backend /app/package.json ./

# Copy Python CLI
COPY setup-rostr.sh ./
COPY rostr/ ./rostr/

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run
CMD ["node", "api-server.js"]

EXPOSE 3000
