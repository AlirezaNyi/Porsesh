# ==============================================================
# Stage 1 — deps: install all dependencies
# ==============================================================
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
# Schema is not present in this stage; prisma generate runs in the builder stage
RUN npm ci --ignore-scripts

# ==============================================================
# Stage 2 — builder: compile the application
# ==============================================================
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
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
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
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
COPY --from=builder /app/node_modules/prisma           ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma          ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma          ./node_modules/.prisma

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

# Apply pending DB migrations then start the standalone Node.js server
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js migrate deploy && exec node server.js"]
