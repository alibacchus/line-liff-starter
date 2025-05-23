// functions/postback.ts

import { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { saveAnswer, getAnswerCount, finishSurveyAndReply } from '../lib/db'
import querystring from 'querystring'

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    // 1) POST ボディを JSON としてパース
    const body = JSON.parse(event.body || '{}')
    const evt = body.events?.[0]
    if (!evt) throw new Error('events が存在しません')

    // 2) userId を取得
    const userId = evt.source?.userId
    if (!userId) throw new Error('userId が見つかりません')

    // 3) postback.data をパースして question / answer を取り出す
    const raw = evt.postback?.data  // 例: "answer=Q1:3"
    console.log('🔍 raw postback.data ->', raw)

    if (typeof raw !== 'string') {
      throw new Error('postback.data が文字列ではありません')
    }

    const parsed = querystring.parse(raw)
    console.log('🔍 parsed querystring ->', parsed)

    const pair = parsed.answer as string | undefined
    if (!pair) {
      throw new Error('データのキーが answer ではありません')
    }

    const [question, answerStr] = pair.split(':')
    console.log('🔍 extracted question,answerStr ->', question, answerStr)

    const answer = Number(answerStr)
    if (!question || Number.isNaN(answer)) {
      throw new Error(`質問または回答のフォーマット不正: ${pair}`)
    }

    // 4) 回答を保存
    await saveAnswer(userId, { question, answer })
    console.log(`📝 Saved answer for ${userId}: { question: '${question}', answer: ${answer} }`)

    // 5) 回答件数を取得して完了判定
    const answerCount = await getAnswerCount(userId)
    console.log(`📝 Current answerCount for ${userId}:`, answerCount)

    if (answerCount === 15) {
      console.log('✅ All 15 answers received. Calling finishSurveyAndReply…')
      await finishSurveyAndReply(userId)
    }

    // 6) 正常レスポンス
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
