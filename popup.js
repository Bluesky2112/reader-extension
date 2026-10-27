const voiceSelect = document.getElementById('voiceSelect');
const slider = document.getElementById('rate');
const valLabel = document.getElementById('val');

// 1. Đổ danh sách giọng đọc
function loadVoices() {
  let voices = speechSynthesis.getVoices();
  // Ưu tiên lọc giọng tiếng Việt lên đầu
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

  // Khôi phục giọng đã lưu
  chrome.storage.sync.get({ voiceName: '' }, (data) => {
    if (data.voiceName) voiceSelect.value = data.voiceName;
  });
}

// Trình duyệt tải giọng bất đồng bộ
speechSynthesis.onvoiceschanged = loadVoices;
setTimeout(loadVoices, 100); // Fallback

// 2. Xử lý sự kiện
voiceSelect.addEventListener('change', () => {
  chrome.storage.sync.set({ voiceName: voiceSelect.value });
});

chrome.storage.sync.get({ rate: 1.0 }, (data) => {
  slider.value = data.rate;
  valLabel.textContent = data.rate.toFixed(1);
});

slider.addEventListener('input', () => {
  const rate = parseFloat(slider.value);
  valLabel.textContent = rate.toFixed(1);
  chrome.storage.sync.set({ rate });
});