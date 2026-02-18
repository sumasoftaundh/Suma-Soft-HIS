#!/bin/bash
# Frappe/ERPNext GCP VM Startup Script
# Targeted for Ubuntu 22.04 LTS or 24.04 LTS

# --- CONFIGURATION (REPLACE THESE) ---
# Replace with your actual git repo URL (https or ssh)
# If private, use: https://<username>:<token>@github.com/username/repo.git
GIT_REPO_URL="https://source.developers.google.com/p/sumatoolkitservice/r/frappe_codebase" 
SITE_NAME="frappe.gcp.internal"
DB_HOST="34.123.230.127"
DB_PASS="PKkzuWbdnqzGWXqtQmS61AFWka7EucXw" # From your config
# -------------------------------------

set -eo pipefail
LOG_FILE="/var/log/frappe-startup.log"
exec > >(tee -a ${LOG_FILE}) 2>&1

echo "--- Starting Frappe Setup Script ---"

# 1. Install System Dependencies
echo "--- Installing dependencies ---"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y git python3-dev python3-pip python3-venv redis-server mariadb-client-10.6 libmariadb-dev-compat libmariadb-dev xvfb libfontconfig wkhtmltopdf curl cron build-essential software-properties-common nginx supervisor

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
npm install -g yarn

# 2. Create User
if ! id -u frappe > /dev/null 2>&1; then
    echo "--- Creating frappe user ---"
    useradd -m -s /bin/bash frappe
    usermod -aG sudo frappe
    echo "frappe ALL=(ALL) NOPASSWD:ALL" | tee /etc/sudoers.d/frappe
fi

# 3. Setup Bench & Repo
echo "--- Setting up Bench ---"
mkdir -p /home/frappe/frappe-bench
chown -R frappe:frappe /home/frappe/frappe-bench
cd /home/frappe

if [ "$GIT_REPO_URL" == "YOUR_GIT_REPO_URL_HERE" ]; then
    echo "ERROR: You must update the GIT_REPO_URL in the script!"
    echo "Please edit this script and set your repository URL."
    # For now, we will not exit to allow debugging, but cloning will fail
fi

# Configure git to use Google Cloud credentials
sudo -u frappe git config --global credential.helper gcloud.sh

if [ ! -d "/home/frappe/frappe-bench/.git" ]; then
    echo "--- Cloning Repo ---"
    # Clone configured repo as the bench
    sudo -u frappe git clone "$GIT_REPO_URL" frappe-bench
fi

cd frappe-bench

# 4. Install Apps
echo "--- Installing App Dependencies ---"
# Install bench CLI
sudo -u frappe pip3 install frappe-bench

# Install Python Env
sudo -u frappe python3 -m venv env
sudo -u frappe ./env/bin/pip install -U pip wheel setuptools

# Install Apps (Editable)
if [ -d "apps/frappe" ]; then sudo -u frappe ./env/bin/pip install -e apps/frappe; fi
if [ -d "apps/erpnext" ]; then sudo -u frappe ./env/bin/pip install -e apps/erpnext; fi
if [ -d "apps/healthcare" ]; then sudo -u frappe ./env/bin/pip install -e apps/healthcare; fi

# Install JS Deps
sudo -u frappe yarn install

# 5. Site Config
echo "--- Configuring Site ---"
cat > common_site_config.json <<EOF
{
 "db_host": "${DB_HOST}",
 "db_port": 3306,
 "db_user": "root",
 "db_password": "${DB_PASS}",
 "redis_cache": "redis://127.0.0.1:6379",
 "redis_queue": "redis://127.0.0.1:6379",
 "redis_socketio": "redis://127.0.0.1:6379",
 "webserver_port": 80,
 "background_workers": 1,
 "restart_supervisor_on_update": true,
 "restart_systemd_on_update": true,
 "serve_default_site": true,
 "default_site": "${SITE_NAME}"
}
EOF
chown frappe:frappe common_site_config.json

# 6. Production Setup
echo "--- Setting up Production ---"
sudo -u frappe ./env/bin/bench setup requirements
sudo ./env/bin/bench setup production frappe

# Link supervisor and nginx
ln -sf /home/frappe/frappe-bench/config/supervisor.conf /etc/supervisor/conf.d/frappe-bench.conf
ln -sf /home/frappe/frappe-bench/config/nginx.conf /etc/nginx/conf.d/frappe-bench.conf

# Restart services
service supervisor reload
service nginx reload

echo "--- Setup Complete! ---"
echo "Access your site at http://$(curl -s ifconfig.me)"
