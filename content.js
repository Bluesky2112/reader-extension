(function() {
  // Hàm lấy cấu hình mới nhất từ bộ nhớ (giải quyết lỗi kẹt trạng thái Tắt/Bật)
  async function getConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ rate: 1.0, voiceName: '', isEnabled: true }, (data) => {
        resolve(data);
      });
    });
  }

  // ==================== XỬ LÝ ĐỌC ====================
  let speakSession = 0;

  function getSelectedVoice(voiceName) {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    if (voiceName) {
      const found = voices.find(v => v.name === voiceName);
      if (found) return found;
    }
    return voices.find(v => v.lang.startsWith('vi')) || null;
  }

  function speakText(text, rate, voiceName) {
    const mySession = ++speakSession;
    
    // Dọn dẹp engine cũ
    window.speechSynthesis.cancel(); 
    hideStopButton();
    showStopButton();

    const voice = getSelectedVoice(voiceName);
    
    // Luôn thêm từ đệm "Vâng, " để đánh thức engine và chống mất chữ đầu
    const finalText = "Vâng, " + text; 

    const utterance = new SpeechSynthesisUtterance(finalText);
    utterance.rate = rate;
    
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang; 
    } else {
      utterance.lang = 'vi-VN';
    }

    utterance.onend = () => {
      if (mySession !== speakSession) return;
      hideStopButton();
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      hideStopButton();
    };

    // Gọi trực tiếp không qua setTimeout để tránh bị Chrome chặn
    window.speechSynthesis.speak(utterance);
  }

  // ==================== NÚT DỪNG ====================
  let stopBtn = null;
  function showStopButton() {
    if (!stopBtn) {
      stopBtn = document.createElement('button');
      stopBtn.id = 'fb-reader-stop';
      stopBtn.textContent = '⏹ Dừng đọc';
      stopBtn.style.cssText = `
        position: fixed !important; bottom: 20px !important; right: 20px !important; 
        z-index: 2147483647 !important; display: block !important;
        padding: 8px 14px !important; background: #d93025 !important; color: white !important;
        border: none !important; border-radius: 6px !important; cursor: pointer !important; 
        font-size: 14px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important; font-weight: bold !important;
      `;
      stopBtn.addEventListener('click', stopSpeaking);
      document.documentElement.appendChild(stopBtn); 
    }
  }

  function hideStopButton() {
    if (stopBtn) { stopBtn.remove(); stopBtn = null; }
  }

  function stopSpeaking() {
    speakSession++; 
    window.speechSynthesis.cancel();
    hideStopButton();
  }

  // ==================== GIAO DIỆN BÔI ĐEN ====================
  document.addEventListener('mouseup', async (event) => {
    // Lấy cấu hình mới nhất ngay lúc click (chống lỗi kẹt trạng thái)
    const config = await getConfig();
    
    if (!config.isEnabled) return; 
    if (event.target.id === 'fb-reader-btn' || event.target.id === 'fb-reader-stop') return;

    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;

    const oldBtn = document.getElementById('fb-reader-btn');
    if (oldBtn) oldBtn.remove();

    const btn = document.createElement('button');
    btn.id = 'fb-reader-btn';
    btn.textContent = '🔊 Đọc';
    btn.style.cssText = `
      position: fixed !important; left: ${event.clientX}px !important; top: ${event.clientY + 15}px !important; 
      z-index: 2147483647 !important; display: block !important;
      padding: 4px 12px !important; background: #1a73e8 !important; color: white !important;
      border: none !important; border-radius: 4px !important; cursor: pointer !important; 
      font-size: 13px !important; box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important; font-weight: bold !important;
    `;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Gọi hàm đọc với cấu hình mới nhất
      speakText(selectedText, config.rate, config.voiceName);
      btn.remove();
    });

    document.documentElement.appendChild(btn);

    setTimeout(() => { if (btn.parentNode) btn.remove(); }, 3000);
  });

  // ==================== CHỐNG LỖI SPA (Giao diện tự dựng lại) ====================
  // Theo dõi nếu DeepSeek/Facebook xóa mất nút hoặc giật lag
  const observer = new MutationObserver(() => {
    // Nếu đang đọc mà cái nút Dừng bị trang web xóa mất, ta phải dọn dẹp engine
    if (stopBtn && !document.getElementById('fb-reader-stop')) {
      stopBtn = null;
      window.speechSynthesis.cancel();
    }
  });
  
  // Kích hoạt theo dõi toàn bộ trang
  observer.observe(document.documentElement, { childList: true, subtree: true });

})();