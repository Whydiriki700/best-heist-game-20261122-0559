import { CONFIG } from './config.js';
export function createAlarm() { return { level: 0, seenByGuard: false, seenByCamera: false }; }
export function updateAlarm(alarm, dt) {
  let rise = 0;
  if (alarm.seenByGuard) rise += CONFIG.alarmRise;
  if (alarm.seenByCamera) rise += CONFIG.alarmCameraRise;
  if (rise > 0) alarm.level += rise * dt;
  else alarm.level -= CONFIG.alarmFall * dt;
  alarm.level = Math.max(0, Math.min(100, alarm.level));
  return alarm.level >= 100;
}
