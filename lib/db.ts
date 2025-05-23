// lib/db.ts
import { createClient } from '@supabase/supabase-js'
import { Client as LineClient, Message } from '@line/bot-sdk'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const client = new LineClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
})

export async function finishSurveyAndReply(userId: string) {
  // ありがとうメッセージ
  const messages: Message[] = [
    {
      type: 'text',
      text: '🎉 すべての回答を受け付けました！ありがとうございました！',
    },
  ]

  try {
    await client.pushMessage(userId, messages)
  } catch (err: any) {
    console.error('🚨 LINE push error status:', err.statusCode, err.statusMessage)
    console.error(
      '🚨 LINE push error response.data:',
      JSON.stringify(err.response?.data, null, 2)
    )
    throw err
  }
}
