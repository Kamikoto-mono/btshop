FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/config-eslint/package.json ./packages/config-eslint/package.json
COPY packages/config-ts/package.json ./packages/config-ts/package.json
RUN pnpm install --no-frozen-lockfile

FROM deps AS builder
ARG APP_NAME=web
COPY . .
RUN pnpm --filter @btshop/${APP_NAME} build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ARG APP_NAME=web
ENV APP_NAME=${APP_NAME}

COPY --from=builder /app/apps/${APP_NAME}/.next/standalone ./
COPY --from=builder /app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static
COPY --from=builder /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public
COPY --from=builder /app/apps/${APP_NAME}/assets ./apps/${APP_NAME}/assets

EXPOSE 3000

CMD ["sh", "-c", "node apps/${APP_NAME}/server.js"]
