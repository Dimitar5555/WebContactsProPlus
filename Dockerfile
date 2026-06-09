# --- build stage ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Build tools for any native module (better-sqlite3, sharp) that needs to compile
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# SvelteKit resolves `$env/static/private` at build time, so JWT_SECRET must be
# present during `npm run build`. Compose passes it via build args from .env.
ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

# --- runtime stage ---
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Build artifacts live at /app; cwd is /data so cwd-rooted writes
# (app.db, photos/) land in the mounted volume.
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/build /app/build

WORKDIR /data
EXPOSE 3000
CMD ["node", "/app/build/index.js"]
