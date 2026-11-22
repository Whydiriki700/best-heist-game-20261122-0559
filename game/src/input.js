export function createInput(canvas) {
  const keys = new Set();
  const clicks = [];
  let smokePressed = false;
  window.addEventListener('keydown', (e) => {
    keys.add(e.code);
    if (e.code === 'KeyE') smokePressed = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    clicks.push({ x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) });
  });
  return {
    keys, clicks,
    axis() {
      let x = 0, y = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
      if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
      const len = Math.hypot(x, y) || 1;
      return { x: x / len, y: y / len, moving: x !== 0 || y !== 0 };
    },
    sneaking() { return keys.has('ShiftLeft') || keys.has('ShiftRight'); },
    takeSmoke() { const v = smokePressed; smokePressed = false; return v; },
    startPressed() { return keys.has('Enter') || keys.has('Space'); },
  };
}
