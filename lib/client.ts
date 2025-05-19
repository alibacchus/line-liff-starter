// lib/client.ts
import { Client } from '@line/bot-sdk';
import { getUserLanguage } from './db';
import { finishSurveyAndReply } from './finishSurveyAndReply';

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};
export const client = new Client(config);

/**
 * 安全に replyMessage を呼び出すラッパー
 */
export async function safeReply(replyToken: string, message: any) {
  try {
    return await client.replyMessage(replyToken, message);
  } catch (e) {
    console.error('safeReply error:', e);
  }
}

/**
 * 完了後のスコア集計・チャート・GPT要約を呼び出す
 * ※ postback.ts からはこの関数を直接 import しています
 */
export { finishSurveyAndReply };

/**
 * ユーザーの言語設定を取得
 * ※ db.ts の getUserLanguage を呼び出す想定
 */
export async function getUserLang(userId: string): Promise<string> {
  try {
    const lang = await getUserLanguage(userId);
    return lang || 'ja';
  } catch (e) {
    console.error('getUserLang error:', e);
    return 'ja';
  }
}
