# syntax=docker/dockerfile:1

# Development image for the Vite + React frontend.
#
# Written as a multi-stage build with a single `development` stage for now.
# A `production` stage (npm run build -> serve dist/ via nginx) can be added
# below later without touching this one. docker-compose-dev.yaml selects this
# stage via `target: development`.
FROM node:24-alpine AS development

WORKDIR /app

# Copy ONLY the manifests first, then install
COPY package*.json ./
RUN npm ci

# Copy the rest of the source. In dev this is shadowed by the bind mount from
# docker-compose-dev.yaml for live edits, but copying it here keeps the
# image runnable on its own, e.g. `docker run` without compose.
COPY . .

EXPOSE 5173

# Vite dev server with HMR. --host binds 0.0.0.0 so it's reachable from outside
# the container (by default Vite only listens on localhost, i.e. inside it).
CMD ["npm", "run", "dev", "--", "--host"]
