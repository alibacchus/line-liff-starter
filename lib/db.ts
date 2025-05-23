import { createClient } from '@supabase/supabase-js'
import { Client as LineClient } from '@line/bot-sdk'

// Supabase クライアント初期化
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// LINE クライアント初期化
const lineClient = new LineClient({
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
})

/**
 * 回答を保存する（responses テーブルを使います）
 */
export async function saveAnswer(userId: string, data: any): Promise<void> {
  const { error } = await supabase
    .from('responses')
    .insert({
      user_id:     userId,
      question:    data.question,    // postback.data.question
      score:       data.answer,      // ← ここを 'score' に合わせる
      answered_at: new Date(),
    })
  if (error) throw error
}

/**
 * 指定ユーザーの回答件数を取得する
 */
export async function getAnswerCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (error) throw error
  return count || 0
}

/**
 * アンケート完了時に LINE へメッセージを送信する
 */
export async function finishSurveyAndReply(userId: string): Promise<void> {
  await lineClient.pushMessage(userId, {
    type: 'text',
    text: '🎉 すべての回答を受け付けました！ありがとうございました！',
  })
}
