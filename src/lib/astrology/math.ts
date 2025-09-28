const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export function toRadians(degrees: number): number {
  return degrees * DEG2RAD;
}

export function toDegrees(radians: number): number {
  return radians * RAD2DEG;
}

export function normalizeAngle(degrees: number): number {
  let result = degrees % 360;
  if (result < 0) {
    result += 360;
  }
  return result;
}

export function normalizeHours(hours: number): number {
  let result = hours % 24;
  if (result < 0) {
    result += 24;
  }
  return result;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
