// lib/lineUtils.ts

import { Client, TextMessage, QuickReply, MessageAPIResponseBase } from '@line/bot-sdk'

// ボットクライアントを初期化
const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
})

/**
 * テキストメッセージを replyToken で返す
 */
export function createTextReply(
  replyToken: string,
  message: TextMessage | { text: string; quickReply?: QuickReply }
): Promise<MessageAPIResponseBase> {
  return client.replyMessage(replyToken, message)
}

/**
 * QuickReply ボタンのデータを作るヘルパー
 * @param options ['q1=1','q1=2',…] のような postback data の配列
 */
export function createQuickReply(options: string[]): QuickReply {
  return {
    items: options.map((data) => ({
      type: 'action',
      action: {
        type: 'postback',
        label: data,
        data,
      },
    })),
  }
}
