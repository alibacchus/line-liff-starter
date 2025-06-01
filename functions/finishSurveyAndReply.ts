// functions/finishSurveyAndReply.ts
import { Handler } from '@netlify/functions'
import { supabase, lineClient } from '../lib/db'
import { createCanvas } from 'canvas'
import Chart from 'chart.js/auto'
import personaList from '../lib/persona.json'

const traitMeta = [
  { key: 'extraversion', labelKey: 'trait.extraversion' },
  { key: 'agreeableness', labelKey: 'trait.agreeableness' },
  { key: 'conscientiousness', labelKey: 'trait.conscientiousness' },
  { key: 'emotionality', labelKey: 'trait.emotionality' },
  { key: 'creativity', labelKey: 'trait.creativity' }
]

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')
    const userId = body.userId as string
    const lang = body.lang as string

    // trait スコア取得
    const { data: scores, error: scoreError } = await supabase
      .rpc('calc_scores', { user_id: userId })
    if (scoreError || !scores) {
      console.error('Error fetching scores:', scoreError)
      return { statusCode: 500, body: 'Error fetching trait scores' }
    }

    // personaから説明文生成
    const descriptions = traitMeta.map(({ key }) => {
      const score = (scores as any)[key] as number
      const persona = personaList.find(
        (p: any) => p.trait === key && score >= p.min && score <= p.max
      )!
      return `[${key}] ${persona.name} (${score}点)\n${persona.description}`
    }).join('\n\n')

    await lineClient.pushMessage(userId, {
      type: 'text',
      text: descriptions
    })

    // 全回答取得（idを含めて取得！ここ重要）
    const { data: allResponses, error: respError } = await supabase
      .from('responses')
      .select('id, question_id, answer')
      .eq('user_id', userId)
      .order('answered_at', { ascending: false })

    if (respError || !allResponses || allResponses.length === 0) {
      console.error('Error fetching responses:', respError)
      return { statusCode: 500, body: 'Error fetching user responses' }
    }

    // OpenAI要約
    const openaiPrompt = `
以下はユーザのQ&Aペアです。200字以内で要約してください。
${allResponses.map((r: any) => `Q${r.question_id}: ${r.answer}`).join('\n')}
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
      return { statusCode: 500, body: 'Error generating summary' }
    }
    const completionJson = await completion.json()
    console.log('[DEBUG] OpenAI completionJson:', JSON.stringify(completionJson, null, 2))
    const summaryText = (completionJson.choices[0].message.content as string).slice(0, 200)
    console.log('[DEBUG] summaryText:', summaryText)

    // ここからがid特定update（最新idのみ）
    const latestId = allResponses[0].id
    const { data: updateResult, error: updateError } = await supabase
      .from('responses')
      .update({ summary: summaryText })
      .eq('id', latestId)

    console.log('[DEBUG] updateResult:', updateResult)
    console.log('[ERROR] updateError:', updateError)
    console.log('[OK] Summary updated for user:', userId, '| latestId:', latestId, '| summary:', summaryText)

    if (updateError) {
      console.error('[ERROR] Error saving summary:', updateError)
      return { statusCode: 500, body: 'Error saving summary' }
    }

    // traitスコア再取得
    const { data: scores2 } = await supabase
      .rpc('calc_scores', { user_id: userId })
    const labels = traitMeta.map(({ key }) => key)
    const dataValues = traitMeta.map(({ key }) =>
      (scores2 as any)[key] as number
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
