# Build browser assets once on the builder's native architecture.
FROM --platform=$BUILDPLATFORM node:24-bookworm-slim AS client-builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY shared/package*.json ./shared/
RUN cd shared && npm ci --omit=dev --no-audit --no-fund
COPY client/package*.json client/mjml-package-lock.json ./client/
COPY client/mjml ./client/mjml
COPY client/build-mjml.sh ./client/
RUN cd client && sh build-mjml.sh && npm ci --no-audit --no-fund
COPY client ./client
COPY shared ./shared
COPY locales ./locales
RUN cd client && npm run build

# Compile native production dependencies for the target architecture.
FROM node:24-bookworm-slim AS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/
COPY zone-mta/package*.json ./zone-mta/
RUN cd server && npm ci --omit=dev --no-audit --no-fund
RUN cd shared && npm ci --omit=dev --no-audit --no-fund
RUN cd zone-mta && npm ci --omit=dev --no-audit --no-fund

FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash pwgen netcat-openbsd imagemagick ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY server ./server
COPY shared ./shared
COPY zone-mta ./zone-mta
COPY locales ./locales
COPY client/static ./client/static
COPY --from=client-builder /app/client/dist ./client/dist
COPY --from=dependencies /app/server/node_modules ./server/node_modules
COPY --from=dependencies /app/shared/node_modules ./shared/node_modules
COPY --from=dependencies /app/zone-mta/node_modules ./zone-mta/node_modules
COPY docker-entrypoint.sh ./
RUN mkdir -p server/files && chown -R node:node /app
USER node
EXPOSE 3000 3003 3004
HEALTHCHECK --interval=10s --timeout=5s --start-period=120s --retries=6 \
    CMD node -e 'Promise.all([process.env.PORT_TRUSTED || 3000,process.env.PORT_SANDBOX || 3003,process.env.PORT_PUBLIC || 3004].map(port => fetch(`http://127.0.0.1:${port}/health`).then(r => {if (!r.ok) throw Error(r.status)}))).catch(() => process.exit(1))'
ENTRYPOINT ["bash", "/app/docker-entrypoint.sh"]
