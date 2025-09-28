import { normalizeAngle, toDegrees, toRadians } from "@/lib/astrology/math";
import { daysSinceJ2000 } from "@/lib/astrology/time";

export const PLANETS = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
] as const;

export type PlanetName = (typeof PLANETS)[number];

const ELEMENTS: Record<Exclude<PlanetName, "Sun" | "Moon"> | "Earth", {
  N: [number, number];
  i: [number, number];
  w: [number, number];
  a: [number, number];
  e: [number, number];
  M: [number, number];
}> = {
  Mercury: {
    N: [48.3313, 3.24587e-5],
    i: [7.0047, 5.00e-8],
    w: [29.1241, 1.01444e-5],
    a: [0.387098, 0],
    e: [0.205635, 5.59e-10],
    M: [168.6562, 4.0923344368],
  },
  Venus: {
    N: [76.6799, 2.46590e-5],
    i: [3.3946, 2.75e-8],
    w: [54.8910, 1.38374e-5],
    a: [0.723330, 0],
    e: [0.006773, -1.302e-9],
    M: [48.0052, 1.6021302244],
  },
  Earth: {
    N: [0.0, 0.0],
    i: [0.0, 0.0],
    w: [282.9404, 4.70935e-5],
    a: [1.000000, 0],
    e: [0.016709, -1.151e-9],
    M: [356.0470, 0.9856002585],
  },
  Mars: {
    N: [49.5574, 2.11081e-5],
    i: [1.8497, -1.78e-8],
    w: [286.5016, 2.92961e-5],
    a: [1.523688, 0],
    e: [0.093405, 2.516e-9],
    M: [18.6021, 0.5240207766],
  },
  Jupiter: {
    N: [100.4542, 2.76854e-5],
    i: [1.3030, -1.557e-7],
    w: [273.8777, 1.64505e-5],
    a: [5.20256, 0],
    e: [0.048498, 4.469e-9],
    M: [19.8950, 0.0830853001],
  },
  Saturn: {
    N: [113.6634, 2.38980e-5],
    i: [2.4886, -1.081e-7],
    w: [339.3939, 2.97661e-5],
    a: [9.55475, 0],
    e: [0.055546, -9.499e-9],
    M: [316.9670, 0.0334442282],
  },
};

export type PlanetPosition = {
  longitude: number;
  latitude: number;
  distance: number;
  retrograde?: boolean;
};

function computeHeliocentricPosition(planet: keyof typeof ELEMENTS, d: number) {
  const elements = ELEMENTS[planet];
  const N = toRadians(elements.N[0] + elements.N[1] * d);
  const i = toRadians(elements.i[0] + elements.i[1] * d);
  const w = toRadians(elements.w[0] + elements.w[1] * d);
  const a = elements.a[0] + elements.a[1] * d;
  const e = elements.e[0] + elements.e[1] * d;
  const M = toRadians(normalizeAngle(elements.M[0] + elements.M[1] * d));

  let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
  for (let index = 0; index < 5; index += 1) {
    const delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-6) break;
  }

  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);

  const xh = r * (Math.cos(N) * Math.cos(v + w) - Math.sin(N) * Math.sin(v + w) * Math.cos(i));
  const yh = r * (Math.sin(N) * Math.cos(v + w) + Math.cos(N) * Math.sin(v + w) * Math.cos(i));
  const zh = r * (Math.sin(v + w) * Math.sin(i));

  return { xh, yh, zh, r, v };
}

function toLongitudeLatitude(x: number, y: number, z: number) {
  const longitude = normalizeAngle(toDegrees(Math.atan2(y, x)));
  const hyp = Math.sqrt(x * x + y * y);
  const latitude = toDegrees(Math.atan2(z, hyp));
  return { longitude, latitude };
}

function computeSunLongitude(date: Date): PlanetPosition {
  const d = daysSinceJ2000(date);
  const earth = computeHeliocentricPosition("Earth", d);
  const longitude = normalizeAngle(toDegrees(Math.atan2(earth.yh, earth.xh)) + 180);
  return { longitude, latitude: -toDegrees(Math.atan2(earth.zh, Math.sqrt(earth.xh ** 2 + earth.yh ** 2))), distance: earth.r };
}

function computeMoonLongitude(date: Date): PlanetPosition {
  const d = daysSinceJ2000(date);
  const L0 = normalizeAngle(218.316 + 13.176396 * d);
  const Mmoon = toRadians(normalizeAngle(134.963 + 13.064993 * d));
  const D = toRadians(normalizeAngle(297.850 + 12.190749 * d));
  const F = toRadians(normalizeAngle(93.272 + 13.229350 * d));

  let longitude =
    L0 +
    6.289 * Math.sin(Mmoon) +
    1.274 * Math.sin(2 * D - Mmoon) +
    0.658 * Math.sin(2 * D) +
    0.214 * Math.sin(2 * Mmoon) +
    0.11 * Math.sin(D) +
    0.208 * Math.sin(2 * F);

  longitude = normalizeAngle(longitude);

  const latitude =
    5.128 * Math.sin(F) +
    0.28 * Math.sin(Mmoon + F) +
    0.277 * Math.sin(Mmoon - F) +
    0.173 * Math.sin(2 * D - F);

  return {
    longitude,
    latitude,
    distance: 60.36298,
  };
}

function computePlanetLongitude(planet: Exclude<PlanetName, "Sun" | "Moon">, date: Date): PlanetPosition {
  const d = daysSinceJ2000(date);
  const heliocentric = computeHeliocentricPosition(planet, d);
  const earth = computeHeliocentricPosition("Earth", d);

  const xg = heliocentric.xh - earth.xh;
  const yg = heliocentric.yh - earth.yh;
  const zg = heliocentric.zh - earth.zh;

  const { longitude, latitude } = toLongitudeLatitude(xg, yg, zg);
  const distance = Math.sqrt(xg * xg + yg * yg + zg * zg);

  const previousDay = computeHeliocentricPosition(planet, d - 1);
  const prevEarth = computeHeliocentricPosition("Earth", d - 1);
  const px = previousDay.xh - prevEarth.xh;
  const py = previousDay.yh - prevEarth.yh;
  const prevLongitude = normalizeAngle(toDegrees(Math.atan2(py, px)));
  const retrograde = normalizeAngle(longitude - prevLongitude) > 180;

  return { longitude, latitude, distance, retrograde };
}

export function computePlanetPositions(date: Date): Record<PlanetName, PlanetPosition> {
  return {
    Sun: computeSunLongitude(date),
    Moon: computeMoonLongitude(date),
    Mercury: computePlanetLongitude("Mercury", date),
    Venus: computePlanetLongitude("Venus", date),
    Mars: computePlanetLongitude("Mars", date),
    Jupiter: computePlanetLongitude("Jupiter", date),
    Saturn: computePlanetLongitude("Saturn", date),
  };
}
