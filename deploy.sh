#!/bin/bash
set -e

BASE="/var/up/custherds/custherds"

echo "==============================="
echo " CUSTHERDS DEPLOY"
echo "==============================="

echo "[1/5] Pull latest code..."
cd "$BASE"
git pull origin main

echo "[2/5] Install root dependencies..."
npm install --legacy-peer-deps

echo "[3/5] Install & build frontpublic..."
npm install --prefix frontpublic --legacy-peer-deps
npm run build --prefix frontpublic

echo "[4/5] Install & build nextfront backoffice..."
npm install --prefix "nextfront backoffice" --legacy-peer-deps
npm run build --prefix "nextfront backoffice"

echo "[5/5] Restart service..."
systemctl restart custherds

echo ""
echo "✅ Deploy selesai!"
systemctl status custherds --no-pager
