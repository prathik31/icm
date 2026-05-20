#!/usr/bin/env bash
set -e

if [ -f /app/.env ]; then
  export $(cat /app/.env | xargs)
fi

exec uvicorn agent.main:app --host 0.0.0.0 --port 8000
