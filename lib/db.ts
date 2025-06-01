// lib/db.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Client as LineClient, Message } from '@line/bot-sdk'

// ──────────────────────────────────────────────────────────────
// Supabase クライアントをエクスポート
//  - process.env.SUPABASE_URL および process.env.SUPABASE_SERVICE_ROLE_KEY が正しく設定されていること
// ──────────────────────────────────────────────────────────────
export const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ──────────────────────────────────────────────────────────────
// LINE Bot SDK クライアントをエクスポート
//  - process.env.LINE_CHANNEL_ACCESS_TOKEN が正しく設定されていること
// ──────────────────────────────────────────────────────────────
export const lineClient = new LineClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
})

/**
 * 回答を保存（同じ user_id & item_id の場合は upsert で更新）
 */
export async function saveAnswer(
  userId: string,
  data: { question: number; answer: number }
) {
  // ★ここで保存直前のデータ内容をログ出力
  console.log('[SAVE_ANSWER]', { userId, ...data })

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
 * Postback 後のアンケート完了通知：短いサンクスメッセージを送るラッパー
 */
export async function notifySurveyCompleted(userId: string) {
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
