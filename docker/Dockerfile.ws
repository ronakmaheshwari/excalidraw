FROM node:20-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY ./package.json ./
COPY ./pnpm-lock.yaml ./
COPY ./pnpm-workspace.yaml ./
COPY ./turbo.json ./
COPY ./packages ./packages
COPY ./apps/ws-backend ./apps/ws-backend

RUN pnpm install
RUN npm run generate:db
RUN pnpm turbo build --filter=ws-backend...

EXPOSE 3002
CMD ["npm","run","start:ws"]