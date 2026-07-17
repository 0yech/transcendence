FROM node:24-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:24-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:24-alpine AS development
COPY ./package.json package-lock.json /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "dev", "--", "--host"]

FROM nginx AS production
COPY --from=build-env /app/build/client /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt \
    -subj "/C=CH/ST=Switzerland/L=Zurich/O=42 School/CN=ono.42.fr"
# nginx launched by base image
