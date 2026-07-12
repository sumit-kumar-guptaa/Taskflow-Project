#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

if [[ ! -f ".env" ]]; then
  cp .env.example .env
  echo "Created .env from .env.example. Update it before continuing."
  exit 1
fi

set -a
source .env
set +a

if [[ -z "${DB_PASSWORD:-}" || -z "${JWT_SECRET:-}" || -z "${CORS_ORIGINS:-}" ]]; then
  echo "Missing required .env values. Set DB_PASSWORD, JWT_SECRET, and CORS_ORIGINS."
  exit 1
fi

if [[ "${DB_PASSWORD}" == "change-me" || "${JWT_SECRET}" == "change-this" ]]; then
  echo "Replace placeholder secrets in .env before deploy."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "Docker Compose is not installed."
  exit 1
fi

"${COMPOSE_CMD[@]}" --env-file .env -f docker/docker-compose.yml up -d --build
"${COMPOSE_CMD[@]}" --env-file .env -f docker/docker-compose.yml ps

echo "TaskFlow is up. Open http://<your-server-ip>:${WEB_PORT:-80}"
