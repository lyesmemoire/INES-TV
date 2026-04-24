#!/bin/sh
set -e

# --- Wait for Postgres to be ready ---
until nc -z postgres 5432; do
  echo "[StreamPerf] Waiting for Database (PostgreSQL) to be ready..."
  sleep 2
done
echo "[StreamPerf] Database is UP!"

# --- Wait for Redis to be ready (optional but good) ---
until nc -z redis 6379; do
  echo "[StreamPerf] Waiting for Cache (Redis) to be ready..."
  sleep 1
done
echo "[StreamPerf] Cache is UP!"

# --- Run Prisma Migrations ---
echo "[StreamPerf] Synchronizing Database Schema..."
npx prisma migrate deploy

# --- Start the App ---
echo "[StreamPerf] Launching App in Production mode..."
exec tsx server.ts
