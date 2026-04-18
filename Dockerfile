# Base stage for pruning
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.4.1 turbo
WORKDIR /app

# Prune stage: extract only necessary files for the 'web' app
FROM base AS pruner
COPY . .
RUN turbo prune web --docker

# Installer stage: install dependencies
FROM base AS installer
WORKDIR /app

# First copy pruned lockfile and package.json to install dependencies
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build stage: copy source and build
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Add build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY
ENV NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=$NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY

# Prisma setup: need the schema to generate the client
# The schema should be in apps/web/prisma/schema.prisma
RUN pnpm turbo build --filter=web

# Runner stage: final lean image
FROM node:20-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

EXPOSE 8080

CMD ["node", "apps/web/server.js"]

