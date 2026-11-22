export function createAudio() {
  let ctx = null;
  function tone(freq, dur, type = 'sine', gain = 0.06) {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
    } catch {}
  }
  return {
    coin() { tone(880, 0.12, 'square', 0.05); },
    pickup() { tone(660, 0.1); setTimeout(() => tone(990, 0.12), 60); },
    alarmTick() { tone(220, 0.08, 'sawtooth', 0.04); },
    smoke() { tone(180, 0.3, 'sine', 0.07); },
    win() { tone(523, 0.15); setTimeout(() => tone(784, 0.2), 120); },
    caught() { tone(140, 0.4, 'sawtooth', 0.08); },
  };
}
