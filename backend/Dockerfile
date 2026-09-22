FROM node:24-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:24-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:24-alpine AS development
COPY ./package.json package-lock.json /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
CMD ["npm", "run", "dev", "--", "--host"]

FROM node:24-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
# The Prisma client is generated into src/generated/prisma (not node_modules), so it
# has to be produced here. generate never connects, so a placeholder is enough.
RUN DATABASE_URL="postgresql://placeholder" npm run prisma:generate
RUN ["npm", "run", "build"]

FROM node:24-alpine AS production
COPY ./package.json package-lock.json /app/
COPY ./prisma /app/prisma
COPY ./prisma.config.ts /app/
COPY --from=build-env /app/dist /app/dist
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
CMD ["npm", "run", "start:prod"]
