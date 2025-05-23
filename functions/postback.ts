// functions/postback.ts

import { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { saveAnswer, getAnswerCount, finishSurveyAndReply } from '../lib/db'

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    // 1️⃣ リクエストボディをパース
    const body = JSON.parse(event.body || '{}')

    let userId: string
    let data: { question: string; answer: number }

    // 2️⃣ LINE Webhook イベントの場合
    if (Array.isArray(body.events) && body.events.length > 0) {
      const ev = body.events[0]
      if (ev.type !== 'postback' || !ev.source?.userId || !ev.postback?.data) {
        return { statusCode: 400, body: 'Invalid event' }
      }
      userId = ev.source.userId
      // postback.data は "q1=3" のような文字列
      const [question, answerStr] = ev.postback.data.split('=')
      const answer = parseInt(answerStr, 10)
      if (isNaN(answer)) {
        return { statusCode: 400, body: 'Invalid answer value' }
      }
      data = { question, answer }

    // 3️⃣ 直接 JSON で { userId, question, answer } が来る場合のフォールバック
    } else if (
      typeof body.userId === 'string' &&
      typeof body.question === 'string' &&
      typeof body.answer === 'number'
    ) {
      userId = body.userId
      data = { question: body.question, answer: body.answer }

    } else {
      return { statusCode: 400, body: 'Bad Request' }
    }

    // 4️⃣ 回答を保存
    await saveAnswer(userId, data)
    console.log(`📝 Saved answer for ${userId}:`, data)

    // 5️⃣ 現在の回答件数を取得してログ出力
    const count = await getAnswerCount(userId)
    console.log(`📝 Current answerCount for ${userId}:`, count)

    // 6️⃣ 15件到達で完了処理
    if (count === 15) {
      console.log('✅ All 15 answers received. Calling finishSurveyAndReply…')
      await finishSurveyAndReply(userId)
    }

    // 7️⃣ 正常レスポンス
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
