#!/usr/bin/env bash
HOST_URL=${NGROK_URL:-"http://localhost:8888"}

#
# test_loop_verbose.sh — Q1〜Q15 の postback 送信＆レスポンス確認スクリプト

# 事前に読み込んでおくこと
#   export $(grep -v '^#' .env | xargs)
#   export NGROK_URL='https://5aa2-202-171-224-108.ngrok-free.app'
#   export LINE_CHANNEL_SECRET=（.env から読み込んでください）

for i in $(seq 1 15); do
  BODY="{\"events\":[{\"type\":\"postback\",\"replyToken\":\"TEST\",\"source\":{\"userId\":\"TEST_USER\"},\"postback\":{\"data\":\"q${i}=3\"}}]}"

  # HMAC-SHA256 → Base64 署名
  SIGNATURE=$(printf '%s' "$BODY" \
    | openssl dgst -binary -sha256 -hmac "$LINE_CHANNEL_SECRET" \
    | base64)

  # ここで必ず署名を出力！
  echo "🔑 Q${i} signature: $SIGNATURE"

  echo "---- Q${i} ----"
  curl -i -X POST "${HOST_URL}/.netlify/functions/postback" \
    -H "Content-Type: application/json" \
    -H "X-Line-Signature: ${SIGNATURE}" \
    -d "$BODY"

  echo; echo
done

