#!/bin/sh
# Busca os IPs atuais do Cloudflare e injeta no nginx.conf antes de subir

set -e

CF_IPS_V4="https://www.cloudflare.com/ips-v4"
CF_IPS_V6="https://www.cloudflare.com/ips-v6"
OUTPUT="/etc/nginx/cloudflare_ips.conf"

echo "# Gerado automaticamente — IPs do Cloudflare" > "$OUTPUT"
echo "# $(date -u)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

wget -qO- "$CF_IPS_V4" | while read -r ip; do
  echo "set_real_ip_from $ip;" >> "$OUTPUT"
done

wget -qO- "$CF_IPS_V6" | while read -r ip; do
  echo "set_real_ip_from $ip;" >> "$OUTPUT"
done

echo "real_ip_header CF-Connecting-IP;" >> "$OUTPUT"

echo "Cloudflare IPs atualizados ($(grep -c set_real_ip_from "$OUTPUT") ranges)"

exec nginx -g "daemon off;"
