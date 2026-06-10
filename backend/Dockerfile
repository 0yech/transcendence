# syntax=docker/dockerfile:1

# Development image for the NestJS backend.
#
# Written as a multi-stage build with a single `development` stage for now.
# A `production` stage (npm run build -> node dist/main on a slim image) can be
# added below later without touching this one. docker-compose-dev.yaml selects
# this stage via `target: development`.
FROM node:24-alpine AS development

WORKDIR /app

# Copy ONLY the manifests first, then install
COPY package*.json ./
RUN npm ci

# Copy the rest of the source. In dev this is shadowed by the bind mount from
# docker-compose-dev.yaml for live edits, but copying it here keeps the
# image runnable on its own, e.g. `docker run` without compose.
COPY . .

EXPOSE 3000

# nest watch mode: recompiles and restarts when files under /app change.
CMD ["npm", "run", "start:dev"]
