// functions/postback.ts
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import { saveAnswer, getAnswerCount, notifySurveyCompleted } from '../lib/db'

// リクエストの型定義（最小限）
interface PostbackEvent {
  type: 'postback'
  source: {
    userId: string
    type: string
  }
  postback: {
    data: string
  }
}

interface LineWebhookBody {
  events: PostbackEvent[]
}

// アンケートの総質問数
const TOTAL_QUESTIONS = 15

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // 1) JSON をパース
    const body = JSON.parse(event.body || '{}') as LineWebhookBody
    if (!body.events?.length) {
      return { statusCode: 400, body: 'No events' }
    }

    // 2) 最初の postback イベントを取り出し
    const ev = body.events[0]
    if (ev.type !== 'postback') {
      return { statusCode: 200, body: 'Ignored non-postback' }
    }

    const raw = ev.postback.data
    const userId = ev.source.userId

    // 3) data フォーマットを判別して question と score に分解
    let questionKey: string
    let score: number

    if (raw.startsWith('answer=')) {
      // 本番フォーマット例: "answer=Q1:3"
      const payload = raw.replace(/^answer=/, '') // "Q1:3"
      const [q, s] = payload.split(':')
      questionKey = q
      score = Number(s)
    } else if (/^q\d+=\d+$/.test(raw)) {
      // テストスクリプトフォーマット例: "q1=3"
      const [qRaw, sRaw] = raw.split('=')      // ["q1","3"]
      questionKey = qRaw.toUpperCase()         // "Q1"
      score = Number(sRaw)
    } else {
      return { statusCode: 400, body: `Unsupported postback data: ${raw}` }
    }

    // 4) DB に upsert 保存
    await saveAnswer(
      userId,
      { question: Number(questionKey.replace(/^Q/, '')), answer: score }
    )

    // 5) 全質問回答数を取得し、15問回答済みであればサンクス通知を送信
    const count = await getAnswerCount(userId)
    if (count === TOTAL_QUESTIONS) {
      await notifySurveyCompleted(userId)
    }

    return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) }
  } catch (err: any) {
    console.error('🚨 Handler error:', err)
    return {
      statusCode: err.statusCode || 500,
      body: err.message || 'Internal Server Error',
    }
  }
}
