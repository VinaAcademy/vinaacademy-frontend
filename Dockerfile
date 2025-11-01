
FROM node:20.13.1-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi


# Stage 2: Build the application
# Use an official Node.js runtime as a parent image
FROM base AS builder
# Set the working directory
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application with valid placeholder URLs
# These will be replaced at runtime with actual values
# Using valid URL format to pass Next.js build validation
ENV NEXT_PUBLIC_API_URL=http://PLACEHOLDER_API_URL/api/v1
ENV NEXT_PUBLIC_SITE_URL=http://PLACEHOLDER_SITE_URL
ENV NEXT_PUBLIC_WS_URL=http://PLACEHOLDER_WS_URL/ws

RUN npm run build

# Stage 3: Serve the application
FROM base AS runner

WORKDIR /app

# Set environment variables for production (can be overridden at runtime)
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy runtime environment injection script
COPY --from=builder --chown=nextjs:nodejs /app/scripts/inject-env.js ./scripts/inject-env.js

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000

ENTRYPOINT ["./entrypoint.sh"]
