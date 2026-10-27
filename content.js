(function() {
  // Lấy cấu hình
  let currentRate = 1.0;
  let currentVoiceName = '';
  let isEnabled = true; 
  let isDataLoaded = false; // <--- THÊM BIẾN NÀY ĐỂ CHẶN LỖI

  chrome.storage.sync.get({ rate: 1.0, voiceName: '', isEnabled: true }, (data) => {
    currentRate = data.rate;
    currentVoiceName = data.voiceName;
    isEnabled = data.isEnabled;
    isDataLoaded = true; // Đã tải xong cấu hình
    
    if (!isEnabled) {
      window.speechSynthesis.cancel();
      hideStopButton();
    }
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.rate) currentRate = changes.rate.newValue;
    if (changes.voiceName) currentVoiceName = changes.voiceName.newValue;
    if (changes.isEnabled) {
      isEnabled = changes.isEnabled.newValue;
      if (!isEnabled) {
        window.speechSynthesis.cancel();
        hideStopButton();
      }
    }
  });

  // ==================== XỬ LÝ ĐỌC ====================
  let speakSession = 0;
  let isWarmedUp = false;

  function getSelectedVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    if (currentVoiceName) {
      const found = voices.find(v => v.name === currentVoiceName);
      if (found) return found;
    }
    return voices.find(v => v.lang.startsWith('vi')) || null;
  }

  function speakText(text) {
    if (!isEnabled) return; // Chốt chặn an toàn

    const mySession = ++speakSession;
    window.speechSynthesis.cancel(); 
    hideStopButton();

    let retries = 0;
    function waitForVoiceAndSpeak() {
      const voice = getSelectedVoice();
      if (voice || retries > 10) {
        showStopButton();
        doSpeak(voice);
      } else {
        retries++;
        setTimeout(waitForVoiceAndSpeak, 100);
      }
    }

    function doSpeak(voice) {
      if (mySession !== speakSession || !isEnabled) return;

      let finalText = text;
      if (!isWarmedUp) finalText = "Vâng, " + finalText;

      const utterance = new SpeechSynthesisUtterance(finalText);
      utterance.rate = currentRate;
      
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang; 
      } else {
        utterance.lang = 'vi-VN';
      }

      utterance.onend = () => {
        if (mySession !== speakSession) return;
        isWarmedUp = true; 
        hideStopButton();
      };

      utterance.onerror = (e) => {
        if (e.error === 'interrupted') return;
        console.error('Lỗi đọc:', e.error);
        hideStopButton();
      };

      window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => {
      if (mySession !== speakSession) return;
      waitForVoiceAndSpeak();
    }, 100);
  }

  // ==================== NÚT DỪNG ====================
  let stopBtn = null;
  function showStopButton() {
    if (!stopBtn) {
      stopBtn = document.createElement('button');
      stopBtn.id = 'fb-reader-stop';
      stopBtn.textContent = '⏹ Dừng đọc';
      stopBtn.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;
        padding: 8px 14px; background: #d93025; color: white;
        border: none; border-radius: 6px; cursor: pointer; font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-weight: bold;
      `;
      stopBtn.addEventListener('click', stopSpeaking);
      document.body.appendChild(stopBtn);
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
  document.addEventListener('mouseup', (event) => {
    // CHỐT CHẶN 1: Nếu chưa tải xong dữ liệu hoặc đang Tắt -> Không làm gì cả
      console.log("Trạng thái:", { isDataLoaded, isEnabled }); 
	if (!isDataLoaded || !isEnabled) return; 

    if (event.target.id === 'fb-reader-btn' || event.target.id === 'fb-reader-stop') return;

    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;

    const oldBtn = document.getElementById('fb-reader-btn');
    if (oldBtn) oldBtn.remove();

    const btn = document.createElement('button');
    btn.id = 'fb-reader-btn';
    btn.textContent = '🔊 Đọc';
    btn.style.cssText = `
      position: fixed; left: ${event.clientX}px; top: ${event.clientY + 15}px; 
      z-index: 2147483647; padding: 4px 12px; background: #1a73e8; color: white;
      border: none; border-radius: 4px; cursor: pointer; font-size: 13px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-weight: bold;
    `;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      speakText(selectedText);
      btn.remove();
    });

    document.body.appendChild(btn);
    setTimeout(() => { if (btn.parentNode) btn.remove(); }, 3000);
  });
})();