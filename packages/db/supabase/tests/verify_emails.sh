#!/usr/bin/env bash
# Phase 4.3 verification: localized OTP emails.
#
# Signs up one user per locale against the local stack and checks that Mailpit
# received a 6-digit code email whose copy matches the requested language.
# Run from packages/db: bash supabase/tests/verify_emails.sh
set -euo pipefail

API="http://127.0.0.1:54321"
MAILPIT="http://127.0.0.1:54324"
ANON_KEY="${ANON_KEY:-$(curl -s "$API/auth/v1/settings" >/dev/null 2>&1 && echo "${SUPABASE_ANON_KEY:-}")}"
ANON_KEY="${ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0}"

declare -A MARKER=(
  [en-GB]="Your verification code"
  [pt-PT]="O teu código de verificação"
  [pt-BR]="Seu código de verificação"
  [es]="Tu código de verificación"
  [fr]="Votre code de vérification"
  [de]="Dein Bestätigungscode"
  [it]="Il tuo codice di verifica"
)

fail=0
for locale in "${!MARKER[@]}"; do
  email="verify-$(echo "$locale" | tr 'A-Z' 'a-z' | tr -d ' ')-$(date +%s%N)@nutribio.test"
  curl -s -X POST "$API/auth/v1/signup" \
    -H "apikey: $ANON_KEY" -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"Nutribio123\",\"data\":{\"locale\":\"$locale\"}}" >/dev/null

  body=$(curl -s "$MAILPIT/api/v1/search?query=to:$email" | python3 -c "
import json,sys
d=json.load(sys.stdin)
msgs=d.get('messages') or []
print(json.dumps({'count': len(msgs), 'subject': msgs[0]['Subject'] if msgs else '', 'id': msgs[0]['ID'] if msgs else ''}))
")
  count=$(echo "$body" | python3 -c "import json,sys; print(json.load(sys.stdin)['count'])")
  subject=$(echo "$body" | python3 -c "import json,sys; print(json.load(sys.stdin)['subject'])")
  id=$(echo "$body" | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")

  if [ "$count" -eq 0 ]; then
    echo "FAIL $locale — no email received for $email"
    fail=1
    continue
  fi

  html=$(curl -s "$MAILPIT/api/v1/message/$id" | python3 -c "import json,sys; print(json.load(sys.stdin).get('HTML',''))")
  if echo "$html" | grep -qF "${MARKER[$locale]}"; then
    marker_ok="body ok"
  else
    marker_ok="BODY MISSING '${MARKER[$locale]}'"
    fail=1
  fi
  if echo "$html" | grep -qE '>[0-9]{6}<'; then
    otp_ok="otp ok"
  else
    otp_ok="OTP MISSING"
    fail=1
  fi
  printf '%-6s %s | %s | %s | subject: %s\n' "$locale" "$marker_ok" "$otp_ok" "$count msg" "$subject"
done

exit "$fail"
