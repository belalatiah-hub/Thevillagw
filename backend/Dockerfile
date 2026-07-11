# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Install deps (with dev deps for the build)
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npx prisma generate && npm run build

# ─── Runtime stage ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Only production deps in the final image
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Run as the built-in non-root node user
USER node
EXPOSE 3000

# Apply pending migrations, then boot the API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
