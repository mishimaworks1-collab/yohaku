(function () {
  'use strict';

  // バックエンドAPIのURL
  const API_URL = '/api/chat';

  // 会話履歴
  let conversationHistory = [];

  // チャットUIのHTML
  const chatHTML = `
    <div id="yohaku-chat-widget">
      <button id="yohaku-chat-toggle" aria-label="チャットを開く">
        <svg id="yohaku-chat-icon-open" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg id="yohaku-chat-icon-close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div id="yohaku-chat-window" style="display:none;">
        <div id="yohaku-chat-header">
          <div id="yohaku-chat-header-info">
            <div id="yohaku-chat-avatar">Y</div>
            <div>
              <div id="yohaku-chat-title">YOHAKU サポート</div>
              <div id="yohaku-chat-subtitle">AIアシスタント</div>
            </div>
          </div>
        </div>

        <div id="yohaku-chat-messages">
          <div class="yohaku-message yohaku-bot-message">
            <div class="yohaku-message-bubble">
              こんにちは！YOHAKUのAIアシスタントです。<br>
              チェックイン・サウナの使い方・設備など、ご不明な点はお気軽にどうぞ🌿
            </div>
          </div>
        </div>

        <div id="yohaku-chat-quick-replies">
          <button class="yohaku-quick-reply" data-text="チェックインの方法を教えてください">チェックイン方法</button>
          <button class="yohaku-quick-reply" data-text="サウナの使い方を教えてください">サウナの使い方</button>
          <button class="yohaku-quick-reply" data-text="Wi-FiのパスワードとSSIDを教えてください">Wi-Fi情報</button>
          <button class="yohaku-quick-reply" data-text="チェックアウトの手順を教えてください">チェックアウト</button>
        </div>

        <div id="yohaku-chat-input-area">
          <textarea
            id="yohaku-chat-input"
            placeholder="メッセージを入力..."
            rows="1"
            maxlength="500"
          ></textarea>
          <button id="yohaku-chat-send" aria-label="送信">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // スタイル
  const chatStyles = `
    #yohaku-chat-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: 'Yu Mincho', 'Hiragino Mincho ProN', serif;
    }

    #yohaku-chat-toggle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #c5b98f;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      transition: background 0.2s, transform 0.2s;
      color: #fff;
    }

    #yohaku-chat-toggle:hover {
      background: #b0a47a;
      transform: scale(1.06);
    }

    #yohaku-chat-toggle svg {
      width: 26px;
      height: 26px;
    }

    #yohaku-chat-window {
      position: absolute;
      bottom: 68px;
      right: 0;
      width: 340px;
      max-height: 540px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: yohakuChatOpen 0.22s ease;
    }

    @keyframes yohakuChatOpen {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    #yohaku-chat-header {
      background: #c5b98f;
      padding: 14px 16px;
      color: #fff;
    }

    #yohaku-chat-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #yohaku-chat-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: bold;
      flex-shrink: 0;
    }

    #yohaku-chat-title {
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 1px;
    }

    #yohaku-chat-subtitle {
      font-size: 0.72rem;
      opacity: 0.85;
      margin-top: 1px;
    }

    #yohaku-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #fafaf8;
    }

    .yohaku-message {
      display: flex;
      max-width: 85%;
    }

    .yohaku-bot-message {
      align-self: flex-start;
    }

    .yohaku-user-message {
      align-self: flex-end;
    }

    .yohaku-message-bubble {
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 0.82rem;
      line-height: 1.65;
      color: #333;
    }

    .yohaku-bot-message .yohaku-message-bubble {
      background: #fff;
      border: 1px solid #e8e4d8;
      border-bottom-left-radius: 4px;
    }

    .yohaku-user-message .yohaku-message-bubble {
      background: #c5b98f;
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    .yohaku-typing {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 10px 14px;
      background: #fff;
      border: 1px solid #e8e4d8;
      border-radius: 14px;
      border-bottom-left-radius: 4px;
    }

    .yohaku-typing span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #c5b98f;
      animation: yohakuTyping 1.2s infinite;
    }

    .yohaku-typing span:nth-child(2) { animation-delay: 0.2s; }
    .yohaku-typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes yohakuTyping {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    #yohaku-chat-quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px 12px;
      background: #fafaf8;
      border-top: 1px solid #f0ede4;
    }

    .yohaku-quick-reply {
      padding: 5px 10px;
      border: 1px solid #c5b98f;
      border-radius: 20px;
      background: #fff;
      color: #8a7a55;
      font-size: 0.72rem;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s, color 0.15s;
      letter-spacing: 0.5px;
    }

    .yohaku-quick-reply:hover {
      background: #c5b98f;
      color: #fff;
    }

    #yohaku-chat-input-area {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      padding: 10px 12px;
      border-top: 1px solid #f0ede4;
      background: #fff;
    }

    #yohaku-chat-input {
      flex: 1;
      border: 1px solid #e0dbd0;
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 0.82rem;
      font-family: inherit;
      resize: none;
      outline: none;
      color: #333;
      background: #fafaf8;
      line-height: 1.5;
      max-height: 100px;
      overflow-y: auto;
    }

    #yohaku-chat-input:focus {
      border-color: #c5b98f;
    }

    #yohaku-chat-send {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #c5b98f;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      transition: background 0.15s;
      flex-shrink: 0;
    }

    #yohaku-chat-send:hover {
      background: #b0a47a;
    }

    #yohaku-chat-send:disabled {
      background: #d9d4c5;
      cursor: not-allowed;
    }

    #yohaku-chat-send svg {
      width: 18px;
      height: 18px;
    }

    @media (max-width: 400px) {
      #yohaku-chat-window {
        width: calc(100vw - 32px);
        right: -8px;
      }
    }
  `;

  function init() {
    // スタイル挿入
    const styleEl = document.createElement('style');
    styleEl.textContent = chatStyles;
    document.head.appendChild(styleEl);

    // HTML挿入
    const wrapper = document.createElement('div');
    wrapper.innerHTML = chatHTML;
    document.body.appendChild(wrapper.firstElementChild);

    // 要素の取得
    const toggle = document.getElementById('yohaku-chat-toggle');
    const window_ = document.getElementById('yohaku-chat-window');
    const iconOpen = document.getElementById('yohaku-chat-icon-open');
    const iconClose = document.getElementById('yohaku-chat-icon-close');
    const messagesEl = document.getElementById('yohaku-chat-messages');
    const inputEl = document.getElementById('yohaku-chat-input');
    const sendBtn = document.getElementById('yohaku-chat-send');
    const quickReplies = document.querySelectorAll('.yohaku-quick-reply');

    let isOpen = false;

    // チャット開閉
    toggle.addEventListener('click', function () {
      isOpen = !isOpen;
      window_.style.display = isOpen ? 'flex' : 'none';
      iconOpen.style.display = isOpen ? 'none' : 'block';
      iconClose.style.display = isOpen ? 'block' : 'none';
      if (isOpen) {
        inputEl.focus();
        scrollToBottom(messagesEl);
      }
    });

    // クイックリプライ
    quickReplies.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const text = btn.getAttribute('data-text');
        sendMessage(text, messagesEl, inputEl, sendBtn);
      });
    });

    // 送信ボタン
    sendBtn.addEventListener('click', function () {
      const text = inputEl.value.trim();
      if (text) sendMessage(text, messagesEl, inputEl, sendBtn);
    });

    // Enterキー送信（Shift+Enterで改行）
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = inputEl.value.trim();
        if (text) sendMessage(text, messagesEl, inputEl, sendBtn);
      }
    });

    // テキストエリアの自動リサイズ
    inputEl.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
  }

  function addMessage(text, role, messagesEl) {
    const msgEl = document.createElement('div');
    msgEl.className = 'yohaku-message ' + (role === 'user' ? 'yohaku-user-message' : 'yohaku-bot-message');

    const bubble = document.createElement('div');
    bubble.className = 'yohaku-message-bubble';
    bubble.innerHTML = text.replace(/\n/g, '<br>');

    msgEl.appendChild(bubble);
    messagesEl.appendChild(msgEl);
    scrollToBottom(messagesEl);
    return bubble;
  }

  function addTypingIndicator(messagesEl) {
    const typingEl = document.createElement('div');
    typingEl.className = 'yohaku-message yohaku-bot-message';
    typingEl.id = 'yohaku-typing-indicator';
    typingEl.innerHTML = '<div class="yohaku-typing"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(typingEl);
    scrollToBottom(messagesEl);
    return typingEl;
  }

  function scrollToBottom(el) {
    el.scrollTop = el.scrollHeight;
  }

  async function sendMessage(text, messagesEl, inputEl, sendBtn) {
    if (!text.trim()) return;

    // ユーザーメッセージ表示
    addMessage(text, 'user', messagesEl);
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;

    // クイックリプライを非表示に
    const quickRepliesEl = document.getElementById('yohaku-chat-quick-replies');
    if (quickRepliesEl) quickRepliesEl.style.display = 'none';

    // 会話履歴に追加
    conversationHistory.push({ role: 'user', content: text });

    // タイピングインジケーター
    const typingEl = addTypingIndicator(messagesEl);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.ok) throw new Error('Network error');

      // タイピングインジケーターを除去してボットメッセージを追加
      typingEl.remove();
      const botBubble = addMessage('', 'bot', messagesEl);

      // JSONレスポンス処理
      const data = await response.json();
      const botText = data.error || data.text || '';
      botBubble.innerHTML = botText.replace(/\n/g, '<br>');
      scrollToBottom(messagesEl);

      // 会話履歴にアシスタントの返答を追加
      if (botText) {
        conversationHistory.push({ role: 'assistant', content: botText });
      }

      // 会話履歴が長くなりすぎないよう直近10往復に制限
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
      }

    } catch (error) {
      typingEl.remove();
      addMessage('申し訳ありません、接続エラーが発生しました。\n公式LINE（https://lin.ee/VVGbdrP）またはお電話（050-1807-4256）でお問い合わせください。', 'bot', messagesEl);
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  // DOM読み込み後に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
