// lib/db.ts

import { createClient } from '@supabase/supabase-js'
import { Client } from '@line/bot-sdk'

// Supabase クライアントの初期化
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// LINE SDK クライアントの初期化
const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!
})

// 回答を保存
export async function saveAnswer(
  userId: string,
  data: { question: number; answer: number }
) {
  const { error } = await supabase
    .from('responses')
    .insert({
      user_id: userId,
      item_id: data.question,
      score:   data.answer
    })
  if (error) {
    console.error('🚨 Supabase insert error:', error)
    throw error
  }
}

// 回答件数を取得
export async function getAnswerCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('responses')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)

  if (error) {
    console.error('🚨 Supabase count error:', error)
    throw error
  }
  return data!.length
}

// アンケート完了後にメッセージを送信
export async function finishSurveyAndReply(userId: string) {
  const messages = [
    {
      type: 'text',
      text: '🎉 すべての回答を受け付けました！ありがとうございました！'
    }
  ]

  try {
    await client.pushMessage(userId, messages)
  } catch (err: any) {
    // エラー詳細を整形して出力
    console.error(
      '🚨 LINE push error data:',
      err.response?.data
        ? JSON.stringify(err.response.data, null, 2)
        : err.toString()
    )
    throw err
  }
}
