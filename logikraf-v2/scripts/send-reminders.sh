#!/bin/bash
# Daily invoice reminder run for logikraf.id.
# Ages overdue invoices first, then sends reminders whose cadence falls due today.
# Installed as a system cron; safe to re-run (a once-per-day guard prevents
# emailing the same client twice).
set -u

LOG=/var/log/logikraf-reminders.log
API=http://127.0.0.1:8081/api
ENV_FILE=/www/wwwroot/logikraf.id/logikraf-v2/.env

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

ADMIN_EMAIL=$(grep -E '^REMINDER_ADMIN_EMAIL=' "$ENV_FILE" 2>/dev/null | cut -d= -f2-)
ADMIN_PASS=$(grep -E '^REMINDER_ADMIN_PASSWORD=' "$ENV_FILE" 2>/dev/null | cut -d= -f2-)

if [ -z "${ADMIN_EMAIL:-}" ] || [ -z "${ADMIN_PASS:-}" ]; then
  log "ERROR: REMINDER_ADMIN_EMAIL / REMINDER_ADMIN_PASSWORD tidak ada di .env"
  exit 1
fi

TOKEN=$(curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin).get("token",""))' 2>/dev/null)

if [ -z "$TOKEN" ]; then
  log "ERROR: login gagal, tidak dapat token"
  exit 1
fi
H="Authorization: Bearer $TOKEN"

curl -s -X POST "$API/invoices/refresh-status" -H "$H" > /dev/null
RESULT=$(curl -s -X POST "$API/invoices/send-reminders" -H "$H")

SUMMARY=$(echo "$RESULT" | python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
    print("dicek=%s terkirim=%s dilewati=%s gagal=%s" % (
        d.get("checked", 0), d.get("sent", 0), d.get("skipped", 0), d.get("failed", 0)))
except Exception as e:
    print("gagal membaca respons: %s" % e)
' 2>/dev/null)

log "$SUMMARY"

# Surface individual failures so a broken mailbox does not fail silently.
echo "$RESULT" | python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
    for r in d.get("details", []):
        if r.get("result") == "failed":
            print("  FAILED %s: %s" % (r.get("invoice"), r.get("detail")))
except Exception:
    pass
' 2>/dev/null >> "$LOG"
