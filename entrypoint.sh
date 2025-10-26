#!/bin/sh
echo "Injecting runtime environment variables..."

echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" > .env.local
echo "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}" >> .env.local
echo "NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}" >> .env.local

echo "Starting Next.js server..."
exec node server.js
