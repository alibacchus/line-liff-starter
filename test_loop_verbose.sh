#!/usr/bin/env bash
# --- config ---
ENDPOINT="http://localhost:8888/.netlify/functions/postback"
USER_ID="Uc1234567890abcdefgh"   # ★固定でOK
SIGN_SECRET="$LINE_CHANNEL_SECRET"  # ローカル .env から export 済み前提
QUESTIONS=(Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8 Q9 Q10 Q11 Q12 Q13 Q14 Q15)

# --- loop ---
for Q in "${QUESTIONS[@]}"; do
  PAYLOAD=$(cat <<EOF
{
  "events":[
    {
      "type":"postback",
      "postback":{
        "data":"answer=${Q}:3"
      },
      "source":{
        "userId":"${USER_ID}",
        "type":"user"
      }
    }
  ]
}
EOF
)
  SIG=$(echo -n "${PAYLOAD}" | openssl dgst -sha256 -hmac "${SIGN_SECRET}" -binary | base64)
  echo "🔑 ${Q} signature: ${SIG}"
  curl -s -X POST -H "Content-Type: application/json" -H "X-Line-Signature: ${SIG}" -d "${PAYLOAD}" "${ENDPOINT}" | jq .
done
