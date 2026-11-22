import { CONFIG } from './config.js';
import { lineOfSightBlocked } from './world.js';

export function createCameras() {
  return [
    { x: 640, y: 64, base: Math.PI / 2, sweep: 0.8, speed: 0.55, phase: 0 },
    { x: 1180, y: 360, base: Math.PI, sweep: 0.7, speed: 0.45, phase: 2 },
    { x: 80, y: 360, base: 0, sweep: 0.7, speed: 0.5, phase: 4 },
  ];
}
export function updateCameras(cameras, time) {
  for (const c of cameras) c.angle = c.base + Math.sin(time * c.speed + c.phase) * c.sweep;
}
export function cameraSeesThief(cam, thief, world, smoke) {
  if (smoke.active && smoke.t > 0) return false;
  const dx = thief.x - cam.x, dy = thief.y - cam.y;
  if (Math.hypot(dx, dy) > CONFIG.cameraViewDist) return false;
  let diff = Math.atan2(dy, dx) - cam.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) > CONFIG.cameraViewAngle) return false;
  return !lineOfSightBlocked(cam.x, cam.y, thief.x, thief.y, world);
}
