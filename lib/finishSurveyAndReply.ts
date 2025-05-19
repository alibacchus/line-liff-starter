// lib/finishSurveyAndReply.ts

/**
 * アンケート完了後の集計→チャート生成→要約送信を行う
 * ※ 現在は仮実装（ログ出力のみ）。後ほど本実装を追加します。
 */
export async function finishSurveyAndReply(userId: string, lang: string): Promise<void> {
  console.log(`▶ finishSurveyAndReply called for user=${userId}, lang=${lang}`);
  // TODO: calcScores, createRadarChart, gptSummary を呼び出して
  // lineClient.pushMessage(...) まで実装する
}
