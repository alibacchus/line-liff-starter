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

export async function saveAnswer(
  userId: string,
  data: { question: number; answer: number }
) {
  const { error } = await supabase
    .from('responses')
    .insert({
      user_id: userId,
      item_id: data.question,
      score: data.answer,         // ← ここを “score” に
    })
  if (error) {
    console.error('🚨 Supabase insert error:', error)
    throw error
  }
}

export async function getAnswerCount(userId: string) {
  const { data, error } = await supabase
    .from('responses')
    .select('item_id', { count: 'exact' })
    .eq('user_id', userId)
  if (error) {
    console.error('🚨 Supabase count error:', error)
    throw error
  }
  return data!.length
}

export async function finishSurveyAndReply(userId: string) {
  const messages: Message[] = [
    { type: 'text', text: '🎉 すべての回答を受け付けました！ありがとうございました！' }
  ]
  try {
    await client.pushMessage(userId, messages)
  } catch (err: any) {
    console.error('🚨 LINE push error status:', err.statusCode, err.statusMessage)
    console.error('🚨 LINE push error response.data:', JSON.stringify(err.response?.data, null, 2))
    throw err
  }
}
