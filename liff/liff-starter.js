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
        <input id="input" placeholder="メッセージ入力…" />
        <button id="send">送信</button>
      </div>
    `;

    document.getElementById('send').addEventListener('click', async () => {
      const text = document.getElementById('input').value;
      if (!text) return;
      await fetch('/.netlify/functions/postback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: [
            {
              type: 'message',
              message: { type: 'text', text },
              replyToken: 'dummy',
              source: { userId: liff.getContext().userId },
            },
          ],
        }),
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
