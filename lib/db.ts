// lib/db.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Client as LineClient, Message } from '@line/bot-sdk'

// Supabase の初期化
const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// LINE Bot SDK の初期化
const lineClient = new LineClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
})

/**
 * 回答を保存（同じ user_id & item_id の場合は upsert で更新）
 */
export async function saveAnswer(
  userId: string,
  data: { question: number; answer: number }
) {
  const { error } = await supabase
    .from('responses')
    .upsert(
      {
        user_id: userId,
        item_id: data.question,
        score: data.answer,
      },
      { onConflict: ['user_id', 'item_id'] }
    )

  if (error) {
    console.error('🚨 Supabase insert error:', error)
    throw error
  }
}

/**
 * これまでの回答数を取得
 */
export async function getAnswerCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('🚨 Supabase select error:', error)
    throw error
  }

  return data?.length ?? 0
}

/**
 * アンケート完了時にサンクスメッセージを送信
 */
export async function finishSurveyAndReply(userId: string) {
  const messages: Message[] = [
    { type: 'text', text: '🎉 すべての回答を受け付けました！ありがとうございました！' },
  ]

  try {
    await lineClient.pushMessage(userId, messages)
  } catch (err: any) {
    console.error('🚨 LINE push error status:', err.statusCode, err.statusMessage)
    console.error(
      '🚨 LINE push error response.data:',
      JSON.stringify(err.response?.data, null, 2)
    )
    throw err
  }
}
