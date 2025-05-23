// functions/postback.ts
import { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { saveAnswer, getAnswerCount, finishSurveyAndReply } from '../lib/db'

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    // ──────────────────────────────
    // 1. body のパース
    // ──────────────────────────────
    const contentType =
      event.headers['content-type'] ||
      event.headers['Content-Type'] ||
      ''
    let userId: string
    let question: number
    let answer: number

    if (contentType.includes('application/json')) {
      // JSON の場合
      const parsed = JSON.parse(event.body || '{}')
      userId = parsed.userId
      question = parsed.data?.question
      answer = parsed.data?.answer
    } else {
      // x-www-form-urlencoded の場合 (test_loop_verbose.sh や LINE postback でこちらになる)
      const params = new URLSearchParams(event.body || '')
      userId = params.get('userId') || ''
      question = Number(params.get('question'))
      answer = Number(params.get('answer'))
    }

    if (!userId) {
      throw new Error('userId が見つかりません')
    }
    if (typeof question !== 'number' || isNaN(question)) {
      throw new Error('question が不正です')
    }
    if (typeof answer !== 'number' || isNaN(answer)) {
      throw new Error('answer が不正です')
    }

    // ──────────────────────────────
    // 2. responses テーブルに書き込む
    //    （lib/db.ts で item_id←question, score←answer にマッピング済み）
    // ──────────────────────────────
    await saveAnswer(userId, { question, answer })
    console.log(`📝 Saved answer for ${userId}:`, { question, answer })

    // ──────────────────────────────
    // 3. 件数を取得して完了判定
    // ──────────────────────────────
    const answerCount = await getAnswerCount(userId)
    console.log(`📝 Current answerCount for ${userId}:`, answerCount)

    if (answerCount === 15) {
      console.log(
        '✅ All 15 answers received. Calling finishSurveyAndReply…'
      )
      await finishSurveyAndReply(userId)
    }

    // ──────────────────────────────
    // 4. 正常レスポンス
    // ──────────────────────────────
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
