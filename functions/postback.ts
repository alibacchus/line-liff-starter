// functions/postback.ts
import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { Client, validateSignature, WebhookEvent } from '@line/bot-sdk';
import { getUserLanguage, updateLanguage, saveAnswer } from '../lib/db';

const client = new Client({
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});

export async function handler(
  event: HandlerEvent,
  context: HandlerContext
) {
  // ————————————
  // ① 署名検証
  //  LINEプラットフォームが送ってくる署名をヘッダーから取得
  const signature =
    (event.headers['x-line-signature'] as string) ||
    (event.headers['X-Line-Signature'] as string);
  if (!signature) {
    console.error('Missing X-Line-Signature header');
    return { statusCode: 401, body: 'Invalid signature' };
  }
  //  本文（raw body）＋チャンネルシークレット＋取得した署名 で検証
  if (
    !validateSignature(
      event.body!,                           // リクエストボディの生文字列
      process.env.LINE_CHANNEL_SECRET!,      // チャンネルシークレット
      signature                               // ヘッダーの署名
    )
  ) {
    return { statusCode: 401, body: 'Invalid signature' };
  }

  // ————————————
  // ② イベントループ
  const body = JSON.parse(event.body!);
  for (const ev of body.events as WebhookEvent[]) {
    try {
      const userId = ev.source.userId!;
      // ここに postback / message ハンドリングの既存ロジックを続けてください…
      // 例: if(ev.type==='postback' && ev.postback.data==='lang=ja'){…}
    } catch (err) {
      console.error(err);
    }
  }

  return { statusCode: 200, body: 'OK' };
}
