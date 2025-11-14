#------------- Base Stage --------------
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Install pnpm globally (Alpine)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifest files 
COPY ./package.json pnpm-*.yaml ./turbo.json ./

# Copy dependant manifest and shared packages
COPY ./packages ./packages
COPY ./apps/ws-backend/package*.json ./apps/ws-backend/package*.json
COPY ./apps/ws-backend/tsconfig.json ./apps/ws-backend/tsconfig.json

#-------------- Dependencies Stage -------------
FROM base AS deps
RUN pnpm install

#-------------- Build Stage -------------
FROM deps AS build
RUN pnpm run generate:db
RUN pnpm turbo run build --filter=apps/ws-backend...

#-------------- PROD Stage -------------
FROM build AS prod
WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@latest --activate

# ----- Copy runtine dependencies -------
COPY  --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/ws-backend/dist ./apps/ws-backend/dist

COPY ./package*.json ./

EXPOSE 3000

RUN addgroup -S app && adduser -S user -G app
USER user
CMD [ "npm","run","start:ws" ]