// functions/postback.ts
import { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { saveAnswer, getAnswerCount, finishSurveyAndReply } from '../lib/db'

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    // リクエストボディから userId と data を取得
    const { userId, data } = JSON.parse(event.body || '{}')

    // ① 回答を保存
    await saveAnswer(userId, data)
    console.log(`📝 Saved answer for ${userId}:`, data)

    // ② 現在の保存件数を取得してログ出力
    const answerCount = await getAnswerCount(userId)
    console.log(`📝 Current answerCount for ${userId}:`, answerCount)

    // ③ 件数が 15 のときだけ完了処理を実行
    if (answerCount === 15) {
      console.log('✅ All 15 answers received. Calling finishSurveyAndReply…')
      await finishSurveyAndReply(userId)
    }

    // 正常レスポンスを返す
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'ok' }),
    }
  } catch (e: any) {
    // 例外時も必ずレスポンスを返して CLI のクラッシュを防ぐ
    console.error('🚨 Handler error:', e)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    }
  }
}
