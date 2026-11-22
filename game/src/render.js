import { CONFIG, COLORS } from './config.js';

function cone(ctx, x, y, angle, dist, half, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y);
  ctx.arc(x, y, dist, angle - half, angle + half); ctx.closePath(); ctx.fill();
}
export function drawGame(ctx, state) {
  const { world, thief, guards, cameras, alarm, smoke, mode } = state;
  ctx.fillStyle = COLORS.floor; ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = COLORS.floorAlt;
  for (let x = 0; x < 1280; x += 64) for (let y = 0; y < 720; y += 64) if ((x + y) % 128 === 0) ctx.fillRect(x, y, 64, 64);
  // entries
  ctx.fillStyle = '#2a7a4a'; ctx.fillRect(world.doorEntry.x, world.doorEntry.y, world.doorEntry.w, world.doorEntry.h);
  ctx.fillStyle = '#fff'; ctx.font = '11px sans-serif'; ctx.fillText('MAIN DOOR', world.doorEntry.x + 2, world.doorEntry.y + 22);
  ctx.fillStyle = '#557'; ctx.fillRect(world.ventEntry.x, world.ventEntry.y, world.ventEntry.w, world.ventEntry.h);
  ctx.fillStyle = '#fff'; ctx.fillText('VENT', world.ventEntry.x + 8, world.ventEntry.y + 20);
  // van exit
  ctx.fillStyle = COLORS.van; ctx.fillRect(world.van.x, world.van.y, world.van.w, world.van.h);
  ctx.fillStyle = '#062033'; ctx.fillRect(world.van.x + 8, world.van.y + 10, 26, 18);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('GETAWAY VAN', world.van.x + 2, world.van.y - 6);
  // covers
  for (const c of world.covers) { ctx.fillStyle = COLORS.cover; ctx.fillRect(c.x, c.y, c.w, c.h); ctx.fillStyle = '#cfe0ff'; ctx.font = '10px sans-serif'; ctx.fillText(c.label, c.x + 6, c.y + 18); }
  // walls
  ctx.fillStyle = COLORS.wall; for (const w of world.walls) ctx.fillRect(w.x, w.y, w.w, w.h);
  // loot
  for (const l of world.loots) if (!l.taken) { ctx.fillStyle = COLORS.gold; ctx.beginPath(); ctx.arc(l.x, l.y, 10, 0, 7); ctx.fill(); ctx.fillStyle = '#442d00'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('$', l.x - 3, l.y + 4); }
  // vault
  const v = world.vault;
  ctx.fillStyle = v.opened ? '#666' : COLORS.vault; ctx.fillRect(v.x, v.y, v.w, v.h);
  ctx.fillStyle = '#221a00'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('VAULT', v.x + 12, v.y + 28); ctx.fillText('$500', v.x + 14, v.y + 44);
  // camera cones then cameras
  for (const c of cameras) cone(ctx, c.x, c.y, c.angle, CONFIG.cameraViewDist, CONFIG.cameraViewAngle, 'rgba(199,146,255,0.22)');
  for (const c of cameras) { ctx.fillStyle = COLORS.camera; ctx.beginPath(); ctx.arc(c.x, c.y, 10, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.fillText('CAM', c.x - 10, c.y + 3); }
  // guard cones then guards
  for (const g of guards) cone(ctx, g.x, g.y, g.angle, CONFIG.guardViewDist, CONFIG.guardViewAngle, g.alert > 0.4 ? 'rgba(255,60,60,0.32)' : 'rgba(255,210,80,0.22)');
  for (const g of guards) { ctx.fillStyle = COLORS.guard; ctx.beginPath(); ctx.arc(g.x, g.y, 14, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('G', g.x - 4, g.y + 4); }
  // smoke
  if (smoke.active && smoke.t > 0) { ctx.fillStyle = 'rgba(220,230,255,0.55)'; ctx.beginPath(); ctx.arc(thief.x, thief.y, 90, 0, 7); ctx.fill(); }
  // thief hearing ring when sneaking indicator
  ctx.strokeStyle = thief.sneaking ? 'rgba(55,224,139,0.5)' : 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.arc(thief.x, thief.y, thief.sneaking ? 26 : 40, 0, 7); ctx.stroke();
  ctx.fillStyle = COLORS.thief; ctx.beginPath(); ctx.arc(thief.x, thief.y, 13, 0, 7); ctx.fill();
  ctx.fillStyle = '#04240f'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('T', thief.x - 4, thief.y + 4);
  // HUD
  ctx.fillStyle = 'rgba(5,8,16,0.88)'; ctx.fillRect(0, 0, 1280, 44);
  ctx.fillStyle = COLORS.text; ctx.font = 'bold 15px sans-serif';
  ctx.fillText('VAULTBREAK: Museum of Night', 14, 27);
  ctx.fillText('Loot: $' + thief.loot, 430, 27);
  ctx.fillText('Coins: ' + thief.coins + '  Smoke: ' + thief.smokes, 560, 27);
  ctx.fillText(thief.sneaking ? 'SNEAKING' : 'WALKING', 760, 27);
  ctx.fillStyle = '#fff'; ctx.fillText('ALARM', 920, 27);
  ctx.fillStyle = '#333'; ctx.fillRect(990, 12, 220, 18);
  ctx.fillStyle = alarm.level > 70 ? '#ff3333' : alarm.level > 35 ? '#ffaa00' : '#33cc66';
  ctx.fillRect(990, 12, 220 * alarm.level / 100, 18);
  ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.fillText(Math.round(alarm.level) + '%', 1216, 27);
  if (mode === 'title') overlay(ctx, 'VAULTBREAK', 'Museum of Night', 'WASD / Arrows move - Shift sneak - Click throw coin - E smoke bomb', 'Press Enter to start - Reach the VAN after looting the VAULT');
  if (mode === 'caught') overlay(ctx, 'CAUGHT!', 'The alarm filled and guards closed in.', 'Score - Loot: $' + thief.loot, 'Press Enter to try again');
  if (mode === 'escaped') overlay(ctx, 'CLEAN GETAWAY!', 'You escaped in the van.', 'Final Score: $' + thief.loot + (thief.hasVault ? ' + VAULT BONUS' : ''), 'Press Enter to play again');
}
function overlay(ctx, a, b, c, d) {
  ctx.fillStyle = 'rgba(0,0,0,0.62)'; ctx.fillRect(240, 200, 800, 300);
  ctx.fillStyle = '#ffd34d'; ctx.font = 'bold 52px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(a, 640, 285);
  ctx.fillStyle = '#fff'; ctx.font = '22px sans-serif'; ctx.fillText(b, 640, 330);
  ctx.font = '16px sans-serif'; ctx.fillText(c, 640, 385); ctx.fillText(d, 640, 420); ctx.textAlign = 'left';
}
