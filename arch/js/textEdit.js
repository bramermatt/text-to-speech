
    const voiceSelect = document.getElementById('voiceSelect');
    const playIcon = document.getElementById('playIcon');
    const textInput = document.getElementById('textInput');
    const fontSelect = document.getElementById('fontSelect');
    const counter = document.getElementById('counter');
    const zoomSelect = document.getElementById('zoomSelect');
    const docNameInput = document.getElementById('docName');
    const pageWrapper = document.getElementById('pageWrapper');
    const historyList = document.getElementById('historyList');
    const historyPanel = document.getElementById('historyPanel');

    let voices = [];
    let isPlaying = false;
    let currentUtterance = null;

    function populateVoices() {
      voices = speechSynthesis.getVoices();
      voiceSelect.innerHTML = '';
      voices.forEach((voice, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
      });
    }

    function toggleSpeech() {
      if (!isPlaying) {
        const text = textInput.value.trim();
        if (!text) return;

        speechSynthesis.cancel();
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.voice = voices[voiceSelect.value];
        currentUtterance.rate = 1;
        currentUtterance.onend = () => {
          isPlaying = false;
          updatePlayButton();
        };
        speechSynthesis.speak(currentUtterance);
        isPlaying = true;
        updatePlayButton();
      } else {
        speechSynthesis.cancel();
        isPlaying = false;
        updatePlayButton();
      }
    }

    function updatePlayButton() {
      playIcon.className = isPlaying ? 'fas fa-stop' : 'fas fa-play';
    }

    function updateCounter() {
      const text = textInput.value.trim();
      const wordCount = text ? text.split(/\s+/).length : 0;
      const charCount = text.length;
      counter.textContent = `${wordCount} words | ${charCount} chars`;
      docNameInput.value = text.length > 0 ? text.substring(0, 25) : 'Untitled document';
      saveToHistory(text);
    }

    function openFileMenu() {
      document.getElementById('fileMenuModal').classList.remove('hidden');
    }

    function closeFileMenu() {
      document.getElementById('fileMenuModal').classList.add('hidden');
    }

    function downloadFile() {
      const text = textInput.value;
      const blob = new Blob([text], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${docNameInput.value}.txt`;
      link.click();
    }

    function downloadPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.text(textInput.value, 10, 10);
      doc.save(`${docNameInput.value}.pdf`);
    }

    function toggleHistory() {
      historyPanel.classList.toggle('hidden');
    }

    function saveToHistory(text) {
      const timestamp = new Date().toLocaleTimeString();
      localStorage.setItem('docContent', text);
      let history = JSON.parse(localStorage.getItem('docHistory') || '[]');
      history.push({ time: timestamp, text });
      if (history.length > 20) history.shift();
      localStorage.setItem('docHistory', JSON.stringify(history));
      renderHistory();
    }

    function renderHistory() {
      const history = JSON.parse(localStorage.getItem('docHistory') || '[]');
      historyList.innerHTML = '';
      history.reverse().forEach((item, i) => {
        const li = document.createElement('li');
        li.className = 'cursor-pointer text-blue-600 hover:underline';
        li.textContent = `${item.time} - ${item.text.substring(0, 20)}...`;
        li.onclick = () => {
          textInput.value = item.text;
          updateCounter();
        };
        historyList.appendChild(li);
      });
    }

    // Init
    textInput.addEventListener('input', updateCounter);
    fontSelect.addEventListener('change', (e) => {
      textInput.style.fontFamily = e.target.value;
    });
    zoomSelect.addEventListener('change', (e) => {
      pageWrapper.style.transform = `scale(${e.target.value})`;
    });

    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoices;
    }

    // Load previous text
    const savedText = localStorage.getItem('docContent');
    if (savedText) {
      textInput.value = savedText;
      updateCounter();
    }
    renderHistory();