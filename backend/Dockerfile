FROM node:22-alpine AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=5000

# node_modules from the builder keeps the Prisma CLI and tsx available for
# schema sync (db push) and the seed script
COPY package*.json ./
COPY prisma ./prisma/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Sync the PostgreSQL schema (non-destructive changes only), then start the API
CMD ["sh", "-c", "npx prisma db push --skip-generate --schema=prisma/schema.prisma && node dist/server.js"]
