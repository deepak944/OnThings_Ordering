#!/bin/sh
set -eu

echo "Open links:"

if [ -n "${PUBLIC_FRONTEND_URL:-}" ]; then
  echo "  Frontend: ${PUBLIC_FRONTEND_URL}"
fi

if [ -n "${PUBLIC_API_URL:-}" ]; then
  echo "  API: ${PUBLIC_API_URL}"
fi

if [ -n "${PUBLIC_HEALTH_URL:-}" ]; then
  echo "  Health: ${PUBLIC_HEALTH_URL}"
fi
