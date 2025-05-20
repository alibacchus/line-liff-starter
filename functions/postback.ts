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
  // ① 署名検証
  if (
    !validateSignature(
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
      // …（残りの postback / message ロジックはそのまま）…
    } catch (err) {
      console.error(err);
    }
  }
  return { statusCode: 200, body: 'OK' };
}
