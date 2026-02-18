#!/usr/bin/env bash
set -euo pipefail

# Defaults
PORT="${PORT:-8001}"
DEFAULT_SITE="${DEFAULT_SITE:-https://frappe-codebase-649857025180.asia-south1.run.app/}"
RUN_MIGRATE="${RUN_MIGRATE:-false}"
FRAPPE_ENV="${FRAPPE_ENV:-production}"

# External services (must be provided via environment in Cloud Run)
DB_TYPE="${DB_TYPE:-mariadb}"
DB_HOST="${DB_HOST:-34.123.230.127}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-frappe_site1}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-PKkzuWbdnqzGWXqtQmS61AFWka7EucXw}"
REDIS_CACHE_URL="${REDIS_CACHE_URL:-}"
REDIS_QUEUE_URL="${REDIS_QUEUE_URL:-}"
REDIS_SOCKETIO_URL="${REDIS_SOCKETIO_URL:-}"

cd /app
# If no external Redis URLs are provided, start an embedded Redis and default to localhost
if [ -z "$REDIS_CACHE_URL" ] && [ -z "$REDIS_QUEUE_URL" ] && [ -z "$REDIS_SOCKETIO_URL" ]; then
  echo "No external Redis URLs provided. Starting embedded redis-server on 127.0.0.1:6379"
  # Start redis in background with non-root friendly locations
  redis-server \
    --bind 127.0.0.1 \
    --port 6379 \
    --daemonize yes \
    --pidfile /tmp/redis.pid \
    --dir /tmp \
    --save '' \
    --appendonly no

  export REDIS_CACHE_URL="redis://127.0.0.1:6379"
  export REDIS_QUEUE_URL="redis://127.0.0.1:6379"
  export REDIS_SOCKETIO_URL="redis://127.0.0.1:6379"
fi

# Ensure log directories exist (required for database logger and other components)
echo "Creating log directories..."
mkdir -p /app/logs
mkdir -p /app/sites/logs

# Ensure sites structure
if [ ! -d "/app/sites" ]; then
  echo "ERROR: /app/sites directory not found." >&2
  exit 1
fi

# Normalize DEFAULT_SITE to a hostname (strip scheme and trailing slash)
# e.g., https://example.com/ -> example.com
SITE_NAME=$(echo "$DEFAULT_SITE" | sed -E 's#^https?://##; s#/$##')

# Resolve SITE_NAME from sites.json mapping if exists
if [ -f "/app/sites/sites.json" ]; then
  RESOLVED_SITE=$(/venv/bin/python3 -c "
import json
try:
    with open('/app/sites/sites.json', 'r') as f:
        data = json.load(f)
    print(data.get('${SITE_NAME}', '${SITE_NAME}'))
except Exception:
    print('${SITE_NAME}')
")
  if [ ! -z "$RESOLVED_SITE" ]; then
    echo "Resolved SITE_NAME from sites.json: ${SITE_NAME} -> ${RESOLVED_SITE}"
    SITE_NAME="$RESOLVED_SITE"
  fi
fi

# FAIL-SAFE: If the resulting site directory doesn't exist, try to find *any* valid site
if [ ! -d "/app/sites/${SITE_NAME}" ]; then
    echo "WARN: Site directory '/app/sites/${SITE_NAME}' does not exist. Attempting auto-discovery..."
    FOUND_SITE=$(find /app/sites -maxdepth 2 -name "site_config.json" | head -n 1 | xargs dirname | xargs basename)
    if [ ! -z "$FOUND_SITE" ]; then
        echo "Auto-discovered valid site: ${FOUND_SITE}"
        SITE_NAME="$FOUND_SITE"
    else
        echo "ERROR: No valid site found in /app/sites/"
    fi
fi

# Write common_site_config.json if not present; otherwise, patch minimal fields
COMMON_CFG="/app/sites/common_site_config.json"
if [ ! -f "$COMMON_CFG" ]; then
  cat > "$COMMON_CFG" <<EOF
{
  "default_site": "${SITE_NAME}",
  "dns_multitenant": false,
  "serve_default_site": true,
  "webserver_port": 8001,
  "background_workers": 1,
  "web_workers": "2",
  "redis_cache": "${REDIS_CACHE_URL}",
  "redis_queue": "${REDIS_QUEUE_URL}",
  "redis_socketio": "${REDIS_SOCKETIO_URL}",
  "use_redis_auth": false
}
EOF
else
  # Update default_site to match the current environment (force sync)
  /venv/bin/python3 -c "
import json
import os
path = '${COMMON_CFG}'
site = '${SITE_NAME}'
try:
    with open(path, 'r') as f:
        data = json.load(f)
    print(f'Old default_site: {data.get(\"default_site\")}')
    data['default_site'] = site

    # Force disable dns_multitenant to avoid 404s
    data['dns_multitenant'] = False
    data['serve_default_site'] = True

    with open(path, 'w') as f:
        json.dump(data, f, indent=1)
    print(f'Updated default_site to {site} in {path}')
except Exception as e:
    print(f'Failed to update default_site: {e}')
"
fi

MISSING_DB=false
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
  MISSING_DB=true
  echo "WARN: One or more DB env vars are missing (DB_HOST/DB_NAME/DB_USER/DB_PASSWORD)." >&2
  echo "WARN: Skipping site_config.json creation and migrations. The app will start, but requests that need DB will fail until env vars are provided." >&2
fi

# Ensure site exists and has site_config.json
SITE_DIR="/app/sites/${SITE_NAME}"
SITE_CFG="${SITE_DIR}/site_config.json"
if [ ! -d "$SITE_DIR" ]; then
  echo "Creating site directory: $SITE_DIR" >&2
  mkdir -p "$SITE_DIR"
fi

if [ "$MISSING_DB" = false ]; then
  # Create site_config.json if missing (no-setup-db; assumes DB already exists and user has privileges)
  if [ ! -f "$SITE_CFG" ]; then
    cat > "$SITE_CFG" <<EOF
{
  "db_type": "${DB_TYPE}",
  "db_host": "${DB_HOST}",
  "db_port": ${DB_PORT},
  "db_name": "${DB_NAME}",
  "db_user": "${DB_USER}",
  "db_password": "${DB_PASSWORD}",
  "developer_mode": 0
}
EOF
  fi
fi

export FRAPPE_ENV
export PYTHONPATH="/app/apps:/app"

# Optionally migrate on startup (case-insensitive)
case "${RUN_MIGRATE}" in
  [Tt][Rr][Uu][Ee])
    if [ "$MISSING_DB" = false ]; then
      # Ensure site-specific log directory exists before migration
      echo "Ensuring site-specific log directories..."
      mkdir -p "/app/sites/${SITE_NAME}/logs"
      
      echo "Running migrations for ${SITE_NAME}"
      (cd /app/sites && PYTHONPATH=../apps:.. /venv/bin/python -m frappe.utils.bench_helper \
        frappe --site "$SITE_NAME" migrate)
    else
      echo "WARN: RUN_MIGRATE requested but DB env vars are missing; skipping migrations."
    fi
    ;;
  *) ;;
esac

# Force the current site selection to avoid "Not Found" errors
echo "${SITE_NAME}" > /app/sites/currentsite.txt

# Show final important config summary
echo "Starting Frappe on 0.0.0.0:${PORT} for site ${SITE_NAME}"
echo "--- DEBUG INFO ---"
ls -la /app/sites/
if [ -f "/app/sites/sites.json" ]; then
    echo "sites.json content:"
    cat /app/sites/sites.json
fi
echo "Current Site Config:"
cat "$COMMON_CFG" || echo "No common_site_config.json"
echo "------------------"
if [ "$MISSING_DB" = false ]; then
  echo "DB: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
else
  echo "DB: not configured (service will start but database-backed requests will fail)"
fi

# Start gunicorn binding to correct port
exec /venv/bin/gunicorn -c /app/gunicorn.conf.py frappe.app:application --bind 0.0.0.0:${PORT}