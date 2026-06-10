#!/bin/sh
set -e
: "${DOMAIN:?DOMAIN must be set}"

LIVE_DIR="/etc/letsencrypt/live/$DOMAIN"
CERT="$LIVE_DIR/fullchain.pem"
KEY="$LIVE_DIR/privkey.pem"

# Self-signed placeholder so nginx can start before certbot has issued the real
# cert. certbot will replace it once it succeeds; the watcher below reloads.
if [ ! -s "$CERT" ] || [ ! -s "$KEY" ]; then
    echo "[nginx-init] Generating 1-day self-signed placeholder for $DOMAIN"
    mkdir -p "$LIVE_DIR"
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "$KEY" -out "$CERT" -subj "/CN=$DOMAIN" 2>/dev/null
fi

# Render config from template (substitute only ${DOMAIN}; nginx vars pass through).
envsubst '$DOMAIN' < /etc/nginx/templates/app.conf.template \
    > /etc/nginx/conf.d/default.conf

# Background watcher: reload nginx when certbot replaces the cert.
(
    LAST=""
    while true; do
        sleep 60
        CURRENT=$(stat -c %Y "$CERT" 2>/dev/null || echo "")
        if [ -n "$CURRENT" ] && [ -n "$LAST" ] && [ "$CURRENT" != "$LAST" ]; then
            echo "[nginx-init] Cert changed — reloading nginx"
            nginx -s reload || true
        fi
        LAST="$CURRENT"
    done
) &

exec "$@"
