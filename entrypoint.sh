#!/bin/sh
echo "🚀 Starting VinaAcademy Frontend Container..."

# Validate required environment variables
if [ -z "$NEXT_PUBLIC_API_URL" ] \
|| [ -z "$NEXT_PUBLIC_SITE_URL" ] \
|| [ -z "$NEXT_PUBLIC_WS_URL" ] \
|| [ -z "$NEXT_PUBLIC_AI_URL" ]; then
  echo "❌ Error: Missing required environment variables"
  echo "Please ensure the following are set:"
  echo "  - NEXT_PUBLIC_API_URL"
  echo "  - NEXT_PUBLIC_SITE_URL"
  echo "  - NEXT_PUBLIC_WS_URL"
  echo "  - NEXT_PUBLIC_AI_URL"
  exit 1
fi

# Inject runtime environment variables
echo ""
node /app/scripts/inject-env.js

if [ $? -ne 0 ]; then
  echo "❌ Failed to inject environment variables"
  exit 1
fi

echo ""
echo "🌐 Starting Next.js server on port ${PORT:-3000}..."
exec node server.js