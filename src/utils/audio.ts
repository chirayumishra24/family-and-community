class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio fallback silent
    }
  }

  playCorrect() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch (e) {}
  }

  playWrong() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  }

  playConstruct() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      // Rhythmic construction beat: hammer strike + wood resonance
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + i * 0.12;
        osc.type = 'square';
        osc.frequency.setValueAtTime(450 + i * 40, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.09);
      }
    } catch (e) {}
  }

  playBuildingComplete() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      // Bright completion chime arpeggio
      const chords = [440, 554.37, 659.25, 880, 1108.73];
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + idx * 0.06;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch (e) {}
  }

  playHint() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1320, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }

  playEvent() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const fanfare = [392, 523.25, 659.25, 783.99, 1046.5];
      fanfare.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + i * 0.1;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.6);
      });
    } catch (e) {}
  }
}

export const soundManager = new SoundSynthesizer();

export const playSound = (soundType: string, isEnabled: boolean = true) => {
  if (!isEnabled) return;
  if (soundType === 'correct' || soundType === 'success') soundManager.playCorrect();
  else if (soundType === 'error' || soundType === 'wrong') soundManager.playWrong();
  else if (soundType === 'event') soundManager.playEvent();
  else soundManager.playClick();
};
