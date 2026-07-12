# Use official Node.js image with Alpine for smaller size
FROM node:22-alpine AS deps
RUN sed -i 's/dl-cdn.alpinelinux.org/<your-mirror-domain>/g' /etc/apk/repositories \
    && apk update \
    && apk add --no-cache libc6-compat

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
CMD ["npm","run","start"]
