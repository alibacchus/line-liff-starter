// lib/finishSurveyAndReply.ts
import { Client } from '@line/bot-sdk'
import { supabase } from './db'
import { questions } from './questions'
import { createTextReply, createQuickReply } from './lineUtils'

// LINE Bot クライアント初期化
const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
})

export default async function finishSurveyAndReply(userId: string) {
  try {
    // Supabase から回答を取得
    const { data: responses, error } = await supabase
      .from('responses')
      .select('question, answer')
      .eq('user_id', userId)

    if (error) {
      console.error('[finishSurveyAndReply] Supabase エラー:', error)
      return
    }
    // responses が空あるいは件数不足なら処理しない
    if (!responses || responses.length < questions.length) {
      console.warn(
        `[finishSurveyAndReply] 回答数不足 (${responses?.length || 0}/${questions.length})、スキップ`
      )
      return
    }

    // responses は必ず配列 guaranteed なので map が使える
    const personalityScores = responses.map((r) => {
      // ここに質問ごとの集計ロジックを入れる
      return { trait: r.question, score: parseInt(r.answer, 10) }
    })

    // 例：集計結果を文字列化して送信
    const reply = createTextReply(
      `アンケート回答ありがとうございました！\n集計結果はこちら：\n${JSON.stringify(personalityScores, null, 2)}`
    )
    await client.pushMessage(userId, reply)
  } catch (err) {
    console.error('[finishSurveyAndReply] 予期せぬエラー:', err)
  }
}
