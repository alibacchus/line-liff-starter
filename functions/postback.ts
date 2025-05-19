import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { Client, middleware, WebhookEvent } from '@line/bot-sdk';
import { getUserLanguage, updateLanguage, saveAnswer } from '../lib/db';

const client = new Client({
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});

export async function handler(
  event: HandlerEvent,
  context: HandlerContext
) {
  // 署名検証
  if (
    !middleware.validateSignature(
      event.body!,
      process.env.LINE_CHANNEL_SECRET!
    )
  ) {
    return { statusCode: 401, body: 'Invalid signature' };
  }

  const body = JSON.parse(event.body!);
  for (const ev of body.events as WebhookEvent[]) {
    try {
      const userId = ev.source.userId!;

      // ──────────────────────────────────────
      // Postback イベント：言語選択／同意フロー／質問開始
      // ──────────────────────────────────────
      if (ev.type === 'postback') {
        let data = ev.postback.data;

        // ① 言語選択
        if (data.startsWith('lang=')) {
          const lang = data.split('=')[1];
          await updateLanguage(userId, lang);
          await client.replyMessage(ev.replyToken, {
            type: 'text',
            text: `言語を「${lang}」に設定しました。\n次に利用規約への同意をお願いします。`,
            quickReply: {
              items: [
                {
                  type: 'action',
                  action: { type: 'postback', label: 'はい', data: 'consent=yes' },
                },
                {
                  type: 'action',
                  action: { type: 'postback', label: 'いいえ', data: 'consent=no' },
                },
              ],
            },
          });
          continue;
        }

        // ② 規約同意
        if (data === 'consent=yes') {
          await client.replyMessage(ev.replyToken, {
            type: 'text',
            text: 'ありがとうございます！質問を開始します。',
            quickReply: {
              items: [
                {
                  type: 'action',
                  action: { type: 'postback', label: '質問スタート', data: 'survey=start' },
                },
              ],
            },
          });
          continue;
        }
        if (data === 'consent=no') {
          await client.replyMessage(ev.replyToken, {
            type: 'text',
            text: '同意がないと先へ進めません。',
            quickReply: {
              items: [
                {
                  type: 'action',
                  action: { type: 'postback', label: '再開する', data: 'action=restart' },
                },
              ],
            },
          });
          continue;
        }

        // ③ 再開
        if (data === 'action=restart') {
          data = 'survey=start';
        }

        // ④ 質問開始ポストバック
        if (data === 'survey=start') {
          // 質問ループの最初（Q1）を開始する
          await client.replyMessage(ev.replyToken, {
            type: 'text',
            text: '【質問1/15】 最初の質問です…',
            quickReply: {
              items: [
                { type: 'action', action: { type: 'postback', label: '1', data: 'q1=1' } },
                { type: 'action', action: { type: 'postback', label: '2', data: 'q1=2' } },
                { type: 'action', action: { type: 'postback', label: '3', data: 'q1=3' } },
                { type: 'action', action: { type: 'postback', label: '4', data: 'q1=4' } },
                { type: 'action', action: { type: 'postback', label: '5', data: 'q1=5' } },
              ],
            },
          });
          continue;
        }
      }

      // ──────────────────────────────────────
      // 既存：テキスト受信時の処理
      // ──────────────────────────────────────
      if (ev.type === 'message' && ev.message.type === 'text') {
        const lang = (await getUserLanguage(userId)) || 'ja';
        await saveAnswer(userId, 'last_message', 1);
        await client.replyMessage(ev.replyToken, {
          type: 'text',
          text: `(${lang}) 受け取りました: ${ev.message.text}`,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  return { statusCode: 200, body: 'OK' };
}
