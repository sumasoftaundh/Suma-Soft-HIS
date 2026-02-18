# Frappe/ERPNext Web (Cloud Run) - single container (web only)
FROM python:3.10-slim as base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DEBIAN_FRONTEND=noninteractive

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    curl \
    ca-certificates \
    pkg-config \
    default-libmysqlclient-dev \
    libssl-dev \
    libffi-dev \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    redis-server \
    locales \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Node.js 18 + yarn (corepack)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get update && apt-get install -y --no-install-recommends nodejs \
    && corepack enable \
    && corepack prepare yarn@1.22.22 --activate \
    && rm -rf /var/lib/apt/lists/*

# App code
WORKDIR /app
COPY . /app

# Python deps for apps
RUN python -m venv /venv \
    && . /venv/bin/activate \
    && pip install --upgrade pip wheel setuptools \
    && pip install -e apps/frappe \
    && if [ -d apps/erpnext ]; then pip install -e apps/erpnext; fi \
    && if [ -d apps/healthcare ]; then pip install -e apps/healthcare; fi

# JS deps and build assets
RUN yarn config set network-timeout 1000000 \
    && yarn --cwd apps/frappe install \
    && if [ -f apps/erpnext/package.json ]; then yarn --cwd apps/erpnext install; fi \
    && if [ -f apps/healthcare/package.json ]; then yarn --cwd apps/healthcare install; fi \
    && cd sites \
    && PYTHONPATH=../apps:.. /venv/bin/python -m frappe.utils.bench_helper frappe build

# Create non-root user and log directories
RUN useradd -m -u 10001 -s /bin/bash appuser \
    && mkdir -p /app/logs /app/sites/logs \
    && chown -R appuser:appuser /app

# Gunicorn config and entrypoint
COPY docker/gunicorn.conf.py /app/gunicorn.conf.py
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER appuser
ENV PATH="/venv/bin:$PATH"

# Cloud Run env defaults
ENV DEFAULT_SITE="frappe-codebase-649857025180.asia-south1.run.app" \
    RUN_MIGRATE="False" \
    FRAPPE_ENV="production"

# Cloud Run uses this port dynamically
EXPOSE 8001

CMD ["/app/entrypoint.sh"]
