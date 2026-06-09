#!/bin/sh
set -e
: "${DOMAIN:?DOMAIN must be set}"
: "${LETSENCRYPT_EMAIL:?LETSENCRYPT_EMAIL must be set}"

CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

# Give nginx a moment to bind :80 and serve /.well-known/acme-challenge/.
sleep 5

is_real_cert() {
    [ -s "$CERT" ] && openssl x509 -in "$CERT" -noout -issuer 2>/dev/null \
        | grep -qi "let's encrypt"
}

if ! is_real_cert; then
    echo "[certbot] No real cert for $DOMAIN — requesting one"
    # Remove the self-signed placeholder so certbot starts fresh.
    rm -rf "/etc/letsencrypt/live/$DOMAIN" \
           "/etc/letsencrypt/archive/$DOMAIN" \
           "/etc/letsencrypt/renewal/$DOMAIN.conf"
    certbot certonly \
        --webroot -w /var/www/certbot \
        --email "$LETSENCRYPT_EMAIL" \
        -d "$DOMAIN" \
        --rsa-key-size 4096 \
        --agree-tos --no-eff-email --non-interactive
fi

echo "[certbot] Entering renewal loop (every 12h)"
trap exit TERM
while :; do
    sleep 12h & wait $!
    certbot renew --webroot -w /var/www/certbot --quiet
done
