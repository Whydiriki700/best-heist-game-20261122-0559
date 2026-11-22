import { CONFIG } from './config.js';
import { moveWithCollision } from './world.js';

export function createThief(x = 95, y = 98) {
  return { x, y, r: CONFIG.thiefRadius, loot: 0, coins: CONFIG.coinCount, smokes: CONFIG.smokeCount, hasVault: false, sneaking: false };
}
export function updateThief(thief, input, dt, world) {
  const a = input.axis();
  thief.sneaking = input.sneaking();
  const speed = thief.sneaking ? CONFIG.thiefSneakSpeed : CONFIG.thiefSpeed;
  if (a.moving) moveWithCollision(thief, a.x * speed * dt, a.y * speed * dt, thief.r, world);
  // pick up loot
  for (const l of world.loots) {
    if (!l.taken && Math.hypot(l.x - thief.x, l.y - thief.y) < 26) { l.taken = true; thief.loot += l.value; }
  }
  const v = world.vault;
  if (!v.opened && thief.x > v.x - 20 && thief.x < v.x + v.w + 20 && thief.y > v.y - 20 && thief.y < v.y + v.h + 20) {
    v.opened = true; thief.hasVault = true; thief.loot += v.value;
  }
}
export function hearingRadius(thief) { return thief.sneaking ? CONFIG.hearingSneak : CONFIG.hearingNormal; }
