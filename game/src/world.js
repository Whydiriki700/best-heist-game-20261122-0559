export function createWorld() {
  const walls = [
    { x: 40, y: 40, w: 1200, h: 18 }, { x: 40, y: 662, w: 1200, h: 18 },
    { x: 40, y: 40, w: 18, h: 640 }, { x: 1222, y: 40, w: 18, h: 640 },
    { x: 300, y: 40, w: 18, h: 210 }, { x: 620, y: 120, w: 18, h: 260 },
    { x: 900, y: 40, w: 18, h: 230 }, { x: 300, y: 470, w: 18, h: 210 },
    { x: 620, y: 470, w: 260, h: 18 }, { x: 950, y: 420, w: 18, h: 260 },
    { x: 120, y: 330, w: 180, h: 18 }, { x: 700, y: 250, w: 200, h: 18 },
  ];
  const covers = [
    { x: 170, y: 150, w: 72, h: 52, label: 'Statue' }, { x: 430, y: 190, w: 84, h: 54, label: 'Case' },
    { x: 760, y: 130, w: 72, h: 52, label: 'Pillar' }, { x: 1020, y: 180, w: 84, h: 54, label: 'Case' },
    { x: 200, y: 520, w: 84, h: 54, label: 'Bench' }, { x: 470, y: 540, w: 72, h: 52, label: 'Statue' },
    { x: 760, y: 540, w: 84, h: 54, label: 'Case' }, { x: 1050, y: 520, w: 72, h: 52, label: 'Pillar' },
    { x: 480, y: 330, w: 64, h: 64, label: 'Globe' },
  ];
  const loots = [
    { x: 210, y: 110, value: 80, taken: false, name: 'Gem' }, { x: 500, y: 120, value: 60, taken: false, name: 'Coin Pile' },
    { x: 830, y: 330, value: 90, taken: false, name: 'Crown' }, { x: 1080, y: 110, value: 70, taken: false, name: 'Vase' },
    { x: 150, y: 610, value: 60, taken: false, name: 'Ring' }, { x: 560, y: 620, value: 85, taken: false, name: 'Pearl' },
    { x: 1100, y: 620, value: 75, taken: false, name: 'Idol' },
  ];
  return {
    walls, covers, loots,
    vault: { x: 1060, y: 330, w: 64, h: 64, opened: false, value: 500 },
    van: { x: 62, y: 580, w: 86, h: 56 },
    ventEntry: { x: 1160, y: 70, w: 44, h: 30 },
    doorEntry: { x: 62, y: 80, w: 60, h: 36 },
  };
}
export function rectsBlock(x, y, r, rects) {
  for (const w of rects) {
    if (x + r > w.x && x - r < w.x + w.w && y + r > w.y && y - r < w.y + w.h) return true;
  }
  return false;
}
export function moveWithCollision(pos, dx, dy, r, world) {
  const solids = [...world.walls, ...world.covers];
  const nx = pos.x + dx;
  if (!rectsBlock(nx, pos.y, r, solids)) pos.x = nx;
  const ny = pos.y + dy;
  if (!rectsBlock(pos.x, ny, r, solids)) pos.y = ny;
  pos.x = Math.max(24, Math.min(1256, pos.x));
  pos.y = Math.max(24, Math.min(696, pos.y));
}
function segHitsRect(x1, y1, x2, y2, rc) {
  // sample along segment for simple robust occlusion
  const steps = 24;
  for (let i = 1; i < steps; i++) {
    const t = i / steps, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
    if (x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h) return true;
  }
  return false;
}
export function lineOfSightBlocked(x1, y1, x2, y2, world) {
  const solids = [...world.walls, ...world.covers];
  return solids.some((rc) => segHitsRect(x1, y1, x2, y2, rc));
}
export function pointInRect(x, y, rc, pad = 0) {
  return x >= rc.x - pad && x <= rc.x + rc.w + pad && y >= rc.y - pad && y <= rc.y + rc.h + pad;
}
