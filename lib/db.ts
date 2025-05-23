// lib/db.ts
import { createClient } from '@supabase/supabase-js'
import { Client as LineClient, Message } from '@line/bot-sdk'

// Supabase クライアント（Service Role Key でフル権限）
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// LINE Bot SDK クライアント
const lineClient = new LineClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
})

/**
 * 回答を保存する
 */
export async function saveAnswer(
  userId: string,
  data: { question: number; answer: number }
) {
  const { error } = await supabase
    .from('responses')
    .insert({
      user_id: userId,
      item_id: data.question,
      value: data.answer,
    })
  if (error) {
    console.error('🚨 Supabase insert error:', error)
    throw error
  }
}

/**
 * これまでの回答件数を取得する
 */
export async function getAnswerCount(userId: string): Promise<number> {
  const { data, error, count } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (error) {
    console.error('🚨 Supabase count error:', error)
    throw error
  }
  return count || 0
}

/**
 * アンケート完了後に「ありがとう」メッセージを送る
 */
export async function finishSurveyAndReply(userId: string) {
  const messages: Message[] = [
    {
      type: 'text',
      text: '🎉 すべての回答を受け付けました！ありがとうございました！',
    },
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
