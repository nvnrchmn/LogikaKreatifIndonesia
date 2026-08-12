#!/usr/bin/env bash
# Smoke test: login API + admin pages served (SPA index) return 200.
# Usage: BASE=http://127.0.0.1:11000 EMAIL=admin@logikraf.id PASS=admin123 tests/smoke.sh
set -euo pipefail

BASE="${BASE:-http://127.0.0.1:11000}"
EMAIL="${EMAIL:-admin@logikraf.id}"
PASS="${PASS:-admin123}"
fail=0

echo "== login"
token=$(curl -sS -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
[ -n "$token" ] || { echo "FAIL login: no token"; exit 1; }
echo "ok token=${token:0:12}..."

check() { # check <label> <url> [curl args...]
  local label=$1 url=$2; shift 2
  local code
  code=$(curl -sS -o /dev/null -w '%{http_code}' "$@" "$url")
  if [ "$code" = "200" ]; then echo "ok   $label ($code)"; else echo "FAIL $label ($code)"; fail=1; fi
}

echo "== api CRUD read"
for r in services packages portfolios blog leads orders invoices clients tickets testimonials transactions order-tasks reports; do
  check "GET /api/$r" "$BASE/api/$r" -H "Authorization: Bearer $token"
done

echo "== new modules"
check "GET /api/reports/finance" "$BASE/api/reports/finance" -H "Authorization: Bearer $token"
check "GET /sitemap.xml" "$BASE/sitemap.xml"
check "POST /api/payment/xendit/invoice (no key -> 400)" "$BASE/api/payment/xendit/invoice" -X POST -H "Content-Type: application/json" -d '{"external_id":"t1","amount":100000,"payer_email":"a@b.com","description":"test"}' || true
code=$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$BASE/api/payment/xendit/invoice" -H "Content-Type: application/json" -d '{"external_id":"t1","amount":100000,"payer_email":"a@b.com","description":"test"}')
[ "$code" = "400" ] && echo "ok   xendit no-key guard ($code)" || { echo "FAIL xendit guard ($code)"; fail=1; }

echo "== admin pages"
for p in login dashboard services packages portfolios blog leads orders invoices clients tickets testimonials settings transactions time-tracking reports payment-hub; do
  check "GET /admin/$p" "$BASE/admin/$p"
done

echo "== invoice CRUD roundtrip"
num="SMOKE-$(date +%s)"
created=$(curl -sS -X POST "$BASE/api/invoices" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" -d "{\"number\":\"$num\",\"amount\":1000,\"status\":\"draft\"}")
id=$(echo "$created" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ -n "$id" ]; then
  echo "ok   create invoice id=$id"
  check "GET /api/invoices/$id/pdf" "$BASE/api/invoices/$id/pdf" -H "Authorization: Bearer $token"
  code=$(curl -sS -o /dev/null -w '%{http_code}' -X DELETE "$BASE/api/invoices/$id" -H "Authorization: Bearer $token")
  { [ "$code" = "200" ] || [ "$code" = "204" ]; } && echo "ok   delete invoice ($code)" || { echo "FAIL delete ($code)"; fail=1; }
else
  echo "FAIL create invoice: $created"; fail=1
fi

exit $fail
