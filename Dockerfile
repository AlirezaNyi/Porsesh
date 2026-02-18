# ==============================================================
# Stage 1 — deps: install all dependencies
# ==============================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ==============================================================
# Stage 2 — builder: compile the application
# ==============================================================
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client targeting linux-musl (Alpine)
RUN npx prisma generate

# next.config.mjs has output:'standalone' — build outputs to .next/standalone
RUN npm run build

# ==============================================================
# Stage 3 — runner: minimal production image
# ==============================================================
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Dedicated non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Static assets
COPY --from=builder /app/public ./public

# Standalone server bundle (ships with its own minimal node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static

# Prisma schema + CLI — merged on top of the standalone node_modules
# Required for `prisma migrate deploy` to run at container startup
COPY --from=builder /app/prisma                        ./prisma
COPY --from=builder /app/node_modules/.bin/prisma      ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma           ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma          ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma          ./node_modules/.prisma

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

# Apply pending DB migrations then start the standalone Node.js server
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && exec node server.js"]
