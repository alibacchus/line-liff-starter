// functions/postback.ts

import { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { saveAnswer, getAnswerCount, finishSurveyAndReply } from '../lib/db'

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    // ① リクエストボディから userId と postback.data（{ question, answer }）を取得
    const { userId, data } = JSON.parse(event.body || '{}')
    //    └ data.question に質問キー (e.g. "q1")
    //    └ data.answer   に回答スコア (e.g. 3)

    // ② responses テーブルへ INSERT
    await saveAnswer(userId, data)
    console.log(`📝 Saved answer for ${userId}:`, data)

    // ③ 現在の回答件数を取得
    const answerCount = await getAnswerCount(userId)
    console.log(`📝 Current answerCount for ${userId}:`, answerCount)

    // ④ 15件目で完了メッセージを送る
    if (answerCount === 15) {
      console.log('✅ All 15 answers received. Calling finishSurveyAndReply…')
      await finishSurveyAndReply(userId)
    }

    // ⑤ 正常レスポンス
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'ok' }),
    }
  } catch (e: any) {
    // エラー時にも必ずレスポンスを返すことで CLI のクラッシュを防止
    console.error('🚨 Handler error:', e)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    }
  }
}
