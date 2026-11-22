import { createInput } from './input.js';
import { createWorld, pointInRect } from './world.js';
import { createGuards, updateGuards, guardSeesThief, guardHearsThief, distractNearestGuard } from './guards.js';
import { createCameras, updateCameras, cameraSeesThief } from './cameras.js';
import { createThief, updateThief } from './thief.js';
import { createAlarm, updateAlarm } from './alarm.js';
import { createAudio } from './audio.js';
import { drawGame } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const audio = createAudio();
const params = new URLSearchParams(location.search);
const shot = Number(params.get('shot') || 0);

let world, thief, guards, cameras, alarm, smoke, mode, time;
function reset(startX = 95, startY = 98) {
  world = createWorld(); thief = createThief(startX, startY);
  guards = createGuards(); cameras = createCameras();
  alarm = createAlarm(); smoke = { active: false, t: 0 }; mode = 'title'; time = 0;
  if (shot) setupShot();
}
function setupShot() {
  mode = 'playing';
  if (shot === 1) { thief.x = 640; thief.y = 380; thief.loot = 140; alarm.level = 30; guards[0].x = 420; guards[0].y = 300; guards[0].angle = 0.4; guards[1].x = 900; guards[1].y = 380; guards[1].angle = Math.PI; cameras[0].angle = Math.PI / 2; }
  if (shot === 2) { thief.x = 505; thief.y = 395; thief.sneaking = true; thief.loot = 200; alarm.level = 8; guards[0].x = 560; guards[0].y = 300; guards[0].angle = Math.PI / 2; cameras[0].angle = Math.PI / 2; }
  if (shot === 3) { thief.x = 640; thief.y = 360; thief.loot = 320; alarm.level = 85; guards[0].x = 500; guards[0].y = 340; guards[0].angle = 0; guards[0].alert = 1; guards[1].x = 820; guards[1].y = 360; guards[1].angle = Math.PI; guards[1].alert = 1; cameras[0].angle = Math.PI / 2; }
  if (shot === 4) { thief.x = 150; thief.y = 600; thief.loot = 1020; thief.hasVault = true; world.vault.opened = true; alarm.level = 50; guards[0].x = 500; guards[0].y = 300; guards[0].angle = 0.5; cameras[0].angle = Math.PI / 2; }
}
reset();
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000); last = now;
  if (!shot) {
    if (mode === 'title' && input.startPressed()) mode = 'playing';
    else if ((mode === 'caught' || mode === 'escaped') && input.startPressed()) { reset(); mode = 'playing'; }
    if (mode === 'playing') step(dt);
  } else {
    // deterministic angles for screenshots
    updateCameras(cameras, shot === 2 ? 1.2 : 0.6);
    if (shot === 1) cameras[0].angle = Math.PI / 2;
  }
  drawGame(ctx, { world, thief, guards, cameras, alarm, smoke, mode });
  requestAnimationFrame(loop);
}
function step(dt) {
  time += dt;
  const prevLoot = thief.loot;
  updateThief(thief, input, dt, world);
  if (thief.loot > prevLoot) audio.pickup();
  while (input.clicks.length) {
    const c = input.clicks.shift();
    if (thief.coins > 0) { thief.coins--; if (distractNearestGuard(guards, c)) audio.coin(); }
  }
  if (input.takeSmoke() && thief.smokes > 0 && !smoke.active) { thief.smokes--; smoke = { active: true, t: 4.5 }; audio.smoke(); }
  if (smoke.active) { smoke.t -= dt; if (smoke.t <= 0) smoke.active = false; }
  updateGuards(guards, dt, thief);
  updateCameras(cameras, time);
  alarm.seenByGuard = guards.some((g) => { const s = guardSeesThief(g, thief, world, smoke); const h = guardHearsThief(g, thief) && !thief.sneaking; if (h && !g.distract) { g.distract = { x: thief.x, y: thief.y }; g.distractT = 1.1; } if (s) g.alert = 1; else g.alert = Math.max(0, g.alert - dt * 0.4); return s; });
  alarm.seenByCamera = cameras.some((c) => cameraSeesThief(c, thief, world, smoke));
  if (updateAlarm(alarm, dt)) { mode = 'caught'; audio.caught(); return; }
  if (pointInRect(thief.x, thief.y, world.van, 6) && thief.loot > 0) { mode = 'escaped'; audio.win(); }
}
requestAnimationFrame(loop);
