#!/bin/sh
set -e

# Wrap the postgres entrypoint script
docker-entrypoint.sh postgres &

POSTGRES_PID=$!

echo "Waiting for PostgreSQL..."
until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  sleep 1
done

echo "PostgreSQL is ready."

echo "DATABASE_URL=$DATABASE_URL"

echo "Generating Prisma client..."
npx prisma generate --config prisma.config.ts

echo "Syncing Prisma schema with database..."
npx prisma db push --config prisma.config.ts

echo "Starting Prisma Studio..."
npx prisma studio --config prisma.config.ts --port 5555 --browser none & # > /dev/null 2>&1 &

wait "$POSTGRES_PID"
