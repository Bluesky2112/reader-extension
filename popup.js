const voiceSelect = document.getElementById('voiceSelect');
const slider = document.getElementById('rate');
const valLabel = document.getElementById('val');
const enableToggle = document.getElementById('enableToggle');

// 1. Xử lý Công tắc Bật/Tắt
chrome.storage.sync.get({ isEnabled: true }, (data) => {
  enableToggle.checked = data.isEnabled;
});

enableToggle.addEventListener('change', () => {
  chrome.storage.sync.set({ isEnabled: enableToggle.checked });
});

// 2. Đổ danh sách giọng đọc
function loadVoices() {
  let voices = speechSynthesis.getVoices();
  voices.sort((a, b) => {
    const aIsVi = a.lang.startsWith('vi');
    const bIsVi = b.lang.startsWith('vi');
    if (aIsVi && !bIsVi) return -1;
    if (!aIsVi && bIsVi) return 1;
    return 0;
  });

  voiceSelect.innerHTML = '';
  voices.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });

  chrome.storage.sync.get({ voiceName: '' }, (data) => {
    if (data.voiceName) voiceSelect.value = data.voiceName;
  });
}

speechSynthesis.onvoiceschanged = loadVoices;
setTimeout(loadVoices, 100);

voiceSelect.addEventListener('change', () => {
  chrome.storage.sync.set({ voiceName: voiceSelect.value });
});

// 3. Xử lý tốc độ đọc
chrome.storage.sync.get({ rate: 1.0 }, (data) => {
  slider.value = data.rate;
  valLabel.textContent = data.rate.toFixed(1);
});

slider.addEventListener('input', () => {
  const rate = parseFloat(slider.value);
  valLabel.textContent = rate.toFixed(1);
  chrome.storage.sync.set({ rate });
});