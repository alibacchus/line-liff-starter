#!/usr/bin/env bash

# --- config ---
# ngrok を使う場合はタブ②で export NGROK_URL="https://xxxxx.ngrok-free.app"
# なければローカルの Functions サーバを叩く
BASE_URL="${NGROK_URL:-http://localhost:8888}"
ENDPOINT="${BASE_URL}/.netlify/functions/postback"

USER_ID="Uc1234567890abcdefgh"           # テスト用固定 userId
SIGN_SECRET="$LINE_CHANNEL_SECRET"      # タブ②で export 済み前提
QUESTIONS=(Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8 Q9 Q10 Q11 Q12 Q13 Q14 Q15)

# --- loop ---
for Q in "${QUESTIONS[@]}"; do
  # 1) ペイロード組み立て
  PAYLOAD=$(cat <<EOF
{
  "events":[
    {
      "type":"postback",
      "postback": { "data":"answer=${Q}:3" },
      "source":   { "userId":"${USER_ID}", "type":"user" }
    }
  ]
}
EOF
)

  # 2) 署名生成
  SIG=$(echo -n "${PAYLOAD}" \
    | openssl dgst -sha256 -hmac "${SIGN_SECRET}" -binary \
    | base64)

  echo "🔑 ${Q} signature: ${SIG}"
  echo "---- ${Q} ----"

  # 3) POST 実行（-i で HTTP ステータスも出力）
  curl -i -X POST "${ENDPOINT}" \
    -H "Content-Type: application/json" \
    -H "X-Line-Signature: ${SIG}" \
    -d "${PAYLOAD}"

  echo; echo
done
