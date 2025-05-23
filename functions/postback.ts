// functions/postback.ts

import { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { saveAnswer, getAnswerCount, finishSurveyAndReply } from '../lib/db'

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  try {
    // 1. Webhook のボディをパース
    const body = JSON.parse(event.body || '{}')
    const lineEvent = body.events?.[0]
    if (
      !lineEvent ||
      lineEvent.type !== 'postback' ||
      !lineEvent.postback?.data
    ) {
      return { statusCode: 400, body: 'Invalid postback event' }
    }

    // 2. userId と postback.data（JSON 文字列）を取り出し
    const userId = lineEvent.source.userId
    const data = JSON.parse(lineEvent.postback.data)
    //    └ data.question に質問キー ("q1" など)
    //    └ data.answer   にスコアや回答値

    // 3. responses テーブルへ INSERT
    await saveAnswer(userId, data)
    console.log(`📝 Saved answer for ${userId}:`, data)

    // 4. 今の件数を取得
    const answerCount = await getAnswerCount(userId)
    console.log(`📝 Current answerCount for ${userId}:`, answerCount)

    // 5. 15 件揃ったら終了メッセージを送信
    if (answerCount === 15) {
      console.log(
        '✅ All 15 answers received. Calling finishSurveyAndReply…'
      )
      await finishSurveyAndReply(userId)
    }

    // 6. 正常レスポンス
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'ok' }),
    }
  } catch (e: any) {
    console.error('🚨 Handler error:', e)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    }
  }
}
