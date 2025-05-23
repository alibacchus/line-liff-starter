import { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { saveAnswer, getAnswerCount, finishSurveyAndReply } from '../lib/db'

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    // 1) POST ボディを JSON としてパース
    //    テストスクリプトからは { "userId": "...", "data": { question: "1", answer: "5" } } 形式で投げる想定
    const body = JSON.parse(event.body || '{}')
    const userId = body.userId
    const data   = body.data

    if (!userId) {
      throw new Error('userId が見つかりません')
    }
    if (!data?.question || !data?.answer) {
      throw new Error('data.question または data.answer が見つかりません')
    }

    // 2) 回答を保存
    await saveAnswer(userId, data)
    console.log(`📝 Saved answer for ${userId}:`, data)

    // 3) 現在の回答件数を取得
    const answerCount = await getAnswerCount(userId)
    console.log(`📝 Current answerCount for ${userId}:`, answerCount)

    // 4) 全 15 問回答済みなら完了処理
    if (answerCount === 15) {
      console.log('✅ All 15 answers received. Calling finishSurveyAndReply…')
      await finishSurveyAndReply(userId)
    }

    // 5) 正常レスポンス
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
