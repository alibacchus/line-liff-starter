// functions/postback.ts
import { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { saveAnswer, getAnswerCount, finishSurveyAndReply } from '../lib/db'

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    // ── 1. ボディをパース ─────────────────────────────
    const contentType =
      event.headers['content-type'] ||
      event.headers['Content-Type'] ||
      ''

    // パース結果を格納するオブジェクト
    let payload: Record<string, string> = {}

    if (contentType.includes('application/json')) {
      // JSON の場合
      payload = JSON.parse(event.body || '{}')
    } else {
      // URL エンコード・フォームの場合
      const params = new URLSearchParams(event.body || '')
      for (const [key, value] of params.entries()) {
        payload[key] = value
      }
    }

    // ── 2. userId / question / answer を取り出し ────────────
    const userId = payload.userId
    if (!userId) {
      throw new Error('userId が見つかりません')
    }

    // 質問キーを探す（"question" があればそちらを優先。なければ q1～q15 などを探す）
    let questionKey: string
    let answerValue: string

    if ('question' in payload && 'answer' in payload) {
      questionKey = payload.question
      answerValue = payload.answer
    } else {
      const qKey = Object.keys(payload).find(k => /^q\d+$/.test(k))
      if (!qKey) {
        throw new Error('question キー(q1～q15 など)が見つかりません')
      }
      questionKey = qKey
      answerValue = payload[qKey]
    }

    // 数字に変換しておく
    const answerNum = Number(answerValue)
    if (isNaN(answerNum)) {
      throw new Error(`answer が数値ではありません: ${answerValue}`)
    }

    const data = { question: questionKey, answer: answerNum }

    // ── 3. 保存→件数取得→完了判定 ─────────────────────────
    await saveAnswer(userId, data)
    console.log(`📝 Saved answer for ${userId}:`, data)

    const count = await getAnswerCount(userId)
    console.log(`📝 Current answerCount for ${userId}:`, count)

    if (count === 15) {
      console.log('✅ All 15 answers received. Calling finishSurveyAndReply…')
      await finishSurveyAndReply(userId)
    }

    // ── 4. 正常レスポンス ─────────────────────────────────
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
