// functions/finishSurveyAndReply.ts
import { Handler } from '@netlify/functions'
import { supabase, lineClient } from '../lib/db'
import { createCanvas } from 'canvas'
import Chart from 'chart.js/auto'
import personaList from '../lib/persona.json'

// traitMetaはDB/SQL関数の返すカラムに合わせて統一
const traitMeta = [
  { key: 'extraversion', labelKey: 'trait.extraversion' },
  { key: 'agreeableness', labelKey: 'trait.agreeableness' },
  { key: 'conscientiousness', labelKey: 'trait.conscientiousness' },
  { key: 'neuroticism', labelKey: 'trait.neuroticism' }, // emotionality→neuroticism
  { key: 'openness', labelKey: 'trait.openness' }         // creativity→openness
]

export const handler: Handler = async (event) => {
  console.log("[DEBUG] finishSurveyAndReply called")
  try {
    const body = JSON.parse(event.body || '{}')
    const userId = body.userId as string
    const lang = body.lang as string
    console.log('[DEBUG] userId:', userId, '| lang:', lang)

    // trait スコア取得
    const { data: scores, error: scoreError } = await supabase
      .rpc('calc_scores', { p_user_id: userId })
    console.log('[DEBUG] calc_scores:', scores, scoreError)
    if (scoreError || !scores) {
      console.error('Error fetching trait scores:', scoreError)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error fetching trait scores', detail: scoreError })
      }
    }

    // persona説明文生成
    const descriptions = traitMeta.map(({ key }) => {
      const score = scores[0][key] as number
      const persona = personaList.find(
        (p: any) => p.trait === key && score >= p.min && score <= p.max
      )
      if (persona) {
        return `[${key}] ${persona.name} (${score}点)\n${persona.description}`
      }
      return `[${key}] スコア: ${score}点`
    }).join('\n\n')

    // 送信テキスト長が長すぎる場合の対策（LINEは1000バイト以内厳守）
    const textForLine = Buffer.byteLength(descriptions, 'utf-8') > 900
      ? descriptions.slice(0, 880) + '…'
      : descriptions

    await lineClient.pushMessage(userId, {
      type: 'text',
      text: textForLine
    })

    // 全回答取得（id必須！）カラム名修正
    const { data: allResponses, error: respError } = await supabase
      .from('responses')
      .select('id, item_id, score')
      .eq('user_id', userId)
      .order('answered_at', { ascending: false })

    console.log('[DEBUG] allResponses:', allResponses, respError)
    if (respError || !allResponses || allResponses.length === 0) {
      console.error('Error fetching responses:', respError)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error fetching user responses', detail: respError })
      }
    }

    // OpenAI要約
    const openaiPrompt = `
以下はユーザのQ&Aペアです。200字以内で要約してください。
${allResponses.map((r: any) => `Q${r.item_id}: ${r.score}`).join('\n')}
`
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'ユーザの回答を要約してください。' },
          { role: 'user', content: openaiPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    })
    if (!completion.ok) {
      const errBody = await completion.text()
      console.error('OpenAI API error:', errBody)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error generating summary', detail: errBody })
      }
    }
    const completionJson = await completion.json()
    console.log('[DEBUG] OpenAI completionJson:', JSON.stringify(completionJson, null, 2))
    const summaryText = (completionJson.choices[0].message.content as string).slice(0, 200)
    console.log('[DEBUG] summaryText:', summaryText)

    // id特定update（最新idのみ）
    const latestId = allResponses[0].id
    const { data: updateResult, error: updateError } = await supabase
      .from('responses')
      .update({ summary: summaryText })
      .eq('id', latestId)
    console.log('[DEBUG] updateResult:', updateResult)
    console.log('[ERROR] updateError:', updateError)
    if (updateError) {
      console.error('[ERROR] Error saving summary:', updateError)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error saving summary', detail: updateError })
      }
    }
    console.log('[OK] Summary updated for user:', userId, '| latestId:', latestId, '| summary:', summaryText)

    // traitスコア再取得
    const { data: scores2 } = await supabase
      .rpc('calc_scores', { p_user_id: userId })
    const labels = traitMeta.map(({ key }) => key)
    const dataValues = traitMeta.map(({ key }) =>
      (scores2[0][key]) as number
    )

    // レーダーチャート生成
    const canvas = createCanvas(600, 600)
    new Chart(canvas, {
      type: 'radar',
      data: {
        labels,
        datasets: [{ label: 'Your Traits', data: dataValues, fill: true }]
      },
      options: {
        scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } }
      }
    })
    const pngBuffer = canvas.toBuffer('image/png')
    const base64 = pngBuffer.toString('base64')

    await lineClient.pushMessage(userId, {
      type: 'image',
      originalContentUrl: `data:image/png;base64,${base64}`,
      previewImageUrl: `data:image/png;base64,${base64}`
    })

    return { statusCode: 200, body: 'ok' }
  } catch (err: any) {
    console.error('🚨 finishSurveyAndReply error:', err)
    return {
      statusCode: err.statusCode || 500,
      body: err.message || 'Internal Server Error'
    }
  }
}
