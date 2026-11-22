import { CONFIG } from './config.js';
import { lineOfSightBlocked } from './world.js';

export function createGuards() {
  return [
    { x: 380, y: 260, angle: 0, wp: [[380, 260], [560, 260], [560, 420], [380, 420]], wpi: 0, alert: 0, distract: null, distractT: 0 },
    { x: 1020, y: 280, angle: Math.PI, wp: [[1020, 280], [1020, 480], [760, 480], [760, 300]], wpi: 0, alert: 0, distract: null, distractT: 0 },
    { x: 700, y: 600, angle: -Math.PI / 2, wp: [[700, 600], [420, 600], [420, 520], [880, 520]], wpi: 0, alert: 0, distract: null, distractT: 0 },
  ];
}
export function guardSeesThief(guard, thief, world, smoke) {
  if (smoke.active && smoke.t > 0) return false;
  const dx = thief.x - guard.x, dy = thief.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > CONFIG.guardViewDist) return false;
  let diff = Math.atan2(dy, dx) - guard.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) > CONFIG.guardViewAngle) return false;
  return !lineOfSightBlocked(guard.x, guard.y, thief.x, thief.y, world);
}
export function updateGuards(guards, dt, thief) {
  for (const g of guards) {
    let target;
    if (g.distract && g.distractT > 0) {
      g.distractT -= dt;
      target = g.distract;
      if (Math.hypot(target.x - g.x, target.y - g.y) < 14) { g.distractT = Math.min(g.distractT, 0.6); continue; }
    } else {
      target = { x: g.wp[g.wpi][0], y: g.wp[g.wpi][1] };
      if (Math.hypot(target.x - g.x, target.y - g.y) < 10) { g.wpi = (g.wpi + 1) % g.wp.length; continue; }
    }
    const speed = g.alert > 0.5 ? CONFIG.guardAlertSpeed : CONFIG.guardSpeed;
    const dx = target.x - g.x, dy = target.y - g.y, d = Math.hypot(dx, dy) || 1;
    g.angle = Math.atan2(dy, dx);
    g.x += (dx / d) * speed * dt;
    g.y += (dy / d) * speed * dt;
  }
}
export function guardHearsThief(guard, thief) {
  const radius = thief.sneaking ? 26 : 86;
  return Math.hypot(guard.x - thief.x, guard.y - thief.y) < radius;
}
export function distractNearestGuard(guards, point) {
  let best = null, bd = 1e9;
  for (const g of guards) { const d = Math.hypot(g.x - point.x, g.y - point.y); if (d < bd) { bd = d; best = g; } }
  if (best && bd < 340) { best.distract = { x: point.x, y: point.y }; best.distractT = 3.2; return true; }
  return false;
}
