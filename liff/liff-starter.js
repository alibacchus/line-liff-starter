'use strict';

(async () => {
  try {
    await liff.init({ liffId: LIFF_ID });

    const app = document.getElementById('app');
    if (!liff.isInClient()) {
      app.innerHTML = `
        <button id="btn-login">EmTrip AI コンシェルジュを開く</button>
      `;
      document.getElementById('btn-login').addEventListener('click', () =>
        liff.login()
      );
      return;
    }

    app.innerHTML = `
      <div id="chat-container">
        <h1>EmTrip AI コンシェルジュ</h1>
        <div id="chat"></div>
        <input id="input" placeholder="スコア（例：4）を入力…" />
        <button id="send">送信</button>
      </div>
    `;

    document.getElementById('send').addEventListener('click', async () => {
      const text = document.getElementById('input').value;
      if (!text) return;

      // ---- ここが修正ポイント ----
      // サンプルとして質問番号Q1固定、入力値をscoreとして送る
      // 実装時はUIで質問番号も動的に取れるようにしてください
      const questionNo = 1; // ← 現状はデモ用にQ1固定
      const answerScore = text; // ユーザー入力値をそのまま送信（数値以外の場合は要バリデーション）

      const payload = {
        events: [
          {
            type: 'postback',
            source: { userId: liff.getContext().userId, type: 'user' },
            postback: { data: `answer=Q${questionNo}:${answerScore}` }
          }
        ]
      };

      // デバッグ用に送信内容をコンソールに表示
      console.log('送信payload:', payload);

      await fetch('/.netlify/functions/postback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const chat = document.getElementById('chat');
      chat.innerHTML += `<div class="me">${text}</div>`;
      document.getElementById('input').value = '';
    });
  } catch (err) {
    console.error(err);
    document.getElementById('app').innerText =
      '初期化エラー…コンソールを確認';
  }
})();
