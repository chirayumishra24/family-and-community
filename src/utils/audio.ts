type SoundType = 'click' | 'start' | 'correct' | 'incorrect' | 'token' | 'building' | 'celebration' | 'tick' | 'buzzer';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playChord(freqs: number[], duration: number, type: OscillatorType = 'sine') {
  freqs.forEach(f => playTone(f, duration, type, 0.08));
}

export function playSound(sound: SoundType, enabled: boolean) {
  if (!enabled) return;
  switch (sound) {
    case 'click': playTone(800, 0.08, 'square', 0.06); break;
    case 'start': playChord([523, 659, 784], 0.4); break;
    case 'correct': playChord([523, 659, 784, 1047], 0.5); break;
    case 'incorrect': playTone(220, 0.3, 'triangle', 0.1); break;
    case 'token': playTone(1200, 0.15, 'sine', 0.1); setTimeout(() => playTone(1600, 0.15, 'sine', 0.08), 100); break;
    case 'building': playChord([440, 554, 659], 0.6); break;
    case 'tick': playTone(1000, 0.04, 'triangle', 0.08); break;
    case 'buzzer':
      playTone(180, 0.25, 'sawtooth', 0.15);
      setTimeout(() => playTone(150, 0.35, 'sawtooth', 0.18), 150);
      break;
    case 'celebration':
      [0, 150, 300, 450, 600].forEach((delay, i) =>
        setTimeout(() => playChord([523 + i * 50, 659 + i * 50, 784 + i * 50], 0.4), delay)
      );
      break;
  }
}
