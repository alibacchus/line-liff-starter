// functions/postback.ts

import { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { saveAnswer, getAnswerCount, finishSurveyAndReply } from '../lib/db'
import querystring from 'querystring'

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    const body = JSON.parse(event.body || '{}')
    const evt  = body.events?.[0]
    if (!evt) throw new Error('events が存在しません')

    const userId = evt.source?.userId
    if (!userId) throw new Error('userId が見つかりません')

    const raw = evt.postback?.data
    console.log('🔍 raw postback.data ->', raw)
    if (typeof raw !== 'string') throw new Error('postback.data が文字列ではありません')

    const parsed = querystring.parse(raw)
    console.log('🔍 parsed querystring ->', parsed)

    const pair = parsed.answer as string | undefined
    if (!pair) throw new Error('データのキーが answer ではありません')

    let [questionKey, answerStr] = pair.split(':')
    console.log('🔍 extracted questionKey,answerStr ->', questionKey, answerStr)

    // --- ここを追加 ---
    // "Q1" → "1" にして数値化
    const questionNum = questionKey.startsWith('Q')
      ? Number(questionKey.slice(1))
      : Number(questionKey)
    if (Number.isNaN(questionNum)) {
      throw new Error(`質問キーの数値変換に失敗: ${questionKey}`)
    }

    const answer = Number(answerStr)
    if (Number.isNaN(answer)) {
      throw new Error(`回答値の数値変換に失敗: ${answerStr}`)
    }
    // --- ここまで ---

    // 4) 回答を保存
    //    saveAnswer(userId, { question, answer })
    //    の部分を questionNum を渡すように
    await saveAnswer(userId, { question: questionNum, answer })
    console.log(`📝 Saved answer for ${userId}: { question: ${questionNum}, answer: ${answer} }`)

    const answerCount = await getAnswerCount(userId)
    console.log(`📝 Current answerCount for ${userId}:`, answerCount)

    if (answerCount === 15) {
      console.log('✅ All 15 answers received. Calling finishSurveyAndReply…')
      await finishSurveyAndReply(userId)
    }

    return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) }
  } catch (e: any) {
    console.error('🚨 Handler error:', e)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    }
  }
}
