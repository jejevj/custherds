#!/bin/bash
set -e

BASE="/var/up/custherds/custherds"

echo "==============================="
echo " CUSTHERDS DEPLOY"
echo "==============================="

# ── 1. Pull ────────────────────────────────────────────────
echo "[1/6] Pull latest code..."
cd "$BASE"
git pull origin main

# ── 2. Install dependencies ────────────────────────────────
echo "[2/6] Install dependencies..."
npm install --legacy-peer-deps
npm install --prefix frontpublic --legacy-peer-deps
npm install --prefix "nextfront backoffice" --legacy-peer-deps

# ── 3. Build frontpublic (Vite/Vue → dist/) ────────────────
echo "[3/6] Build frontpublic..."
npm run build --prefix frontpublic

# ── 4. Build backoffice (Next.js → .next/) ─────────────────
echo "[4/6] Build nextfront backoffice..."
npm run build --prefix "nextfront backoffice"

# ── 5. Setup Nginx config (skip jika sudah ada) ────────────
echo "[5/6] Setup Nginx config..."

NGINX_CONF_BACKOFFICE="/etc/nginx/conf.d/custherds-backoffice.conf"
NGINX_CONF_PUBLIC="/etc/nginx/conf.d/custherds-public.conf"

if [ ! -f "$NGINX_CONF_BACKOFFICE" ]; then
  echo "  → Membuat $NGINX_CONF_BACKOFFICE"
  cat > "$NGINX_CONF_BACKOFFICE" <<'EOF'
server {
    listen 80;
    server_name partners-custherds.ourtestcloud.my.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
else
  echo "  → $NGINX_CONF_BACKOFFICE sudah ada, skip."
fi

if [ ! -f "$NGINX_CONF_PUBLIC" ]; then
  echo "  → Membuat $NGINX_CONF_PUBLIC"
  cat > "$NGINX_CONF_PUBLIC" <<'EOF'
server {
    listen 80;
    server_name custherds.ourtestcloud.my.id;

    root /var/up/custherds/custherds/frontpublic/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
else
  echo "  → $NGINX_CONF_PUBLIC sudah ada, skip."
fi

nginx -t && systemctl reload nginx
echo "  → Nginx reloaded."

# ── 6. Restart services ────────────────────────────────────
echo "[6/6] Restart services..."
systemctl restart custherds
systemctl status custherds --no-pager

echo ""
echo "✅ Deploy selesai!"
echo "   Backoffice : https://partners-custherds.ourtestcloud.my.id"
echo "   Public     : https://custherds.ourtestcloud.my.id"
echo "   API        : http://127.0.0.1:8000"
