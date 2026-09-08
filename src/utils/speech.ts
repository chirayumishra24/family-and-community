let isSpeaking = false;
const listeners = new Set<(speaking: boolean) => void>();

function notifyListeners() {
  listeners.forEach(cb => cb(isSpeaking));
}

export function subscribeSpeech(cb: (speaking: boolean) => void) {
  listeners.add(cb);
  cb(isSpeaking);
  return () => {
    listeners.delete(cb);
  };
}

export function speakText(text: string, lang = 'en-US') {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  // If already speaking the same thing or active, cancel it
  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[^\w\s.,?!'-]/gi, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = lang;
  utterance.rate = 0.95; // slightly slower for Grade 6 clarity
  utterance.pitch = 1.05;

  utterance.onstart = () => {
    isSpeaking = true;
    notifyListeners();
  };

  utterance.onend = () => {
    isSpeaking = false;
    notifyListeners();
  };

  utterance.onerror = () => {
    isSpeaking = false;
    notifyListeners();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  notifyListeners();
}

export function toggleSpeech(text: string, lang = 'en-US') {
  if (isSpeaking) {
    stopSpeech();
  } else {
    speakText(text, lang);
  }
}
