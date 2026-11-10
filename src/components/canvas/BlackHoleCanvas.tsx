import { useEffect, useRef, type MutableRefObject } from "react";

/** Timeline values the intro writes every frame; the renderer reads them without React renders. */
export type DiveState = {
  /** 0 -> 1 across the long approach from deep space */
  approach: number;
  /** 0 -> 1 across the final plunge through the event horizon */
  plunge: number;
};

/** Design-system colour roles the scene is painted with. Edit them in styles.css. */
const COLOR_TOKENS = {
  uHot: "--color-white",
  uWarm: "--brand-muted",
  uMid: "--brand-primary",
  uCool: "--brand-secondary",
  uStar: "--color-white",
  uSpace: "--color-black",
  uFlame: "--warning",
  uEmber: "--danger",
} as const;

/** Starting render budget (4K class). Quality steps down if frames run long, and up toward 8K when the GPU has headroom. */
const START_PIXELS = 3840 * 2160;
/** Ceiling for fast GPUs: native 8K. */
const MAX_PIXELS = 7680 * 4320;
const MIN_SCALE = 0.45;

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uApproach;
uniform float uPlunge;
uniform vec3 uHot;
uniform vec3 uWarm;
uniform vec3 uMid;
uniform vec3 uCool;
uniform vec3 uStar;
uniform vec3 uSpace;
uniform vec3 uFlame;
uniform vec3 uEmber;
uniform float uDirect;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec3 hash33(vec3 p) {
  return vec3(hash13(p), hash13(p + 19.19), hash13(p + 47.71));
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x),
        mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x),
        mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 5; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return s;
}
float ridged(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * (1.0 - abs(vnoise(p) * 2.0 - 1.0));
    p = p * 2.1 + 3.7;
    a *= 0.5;
  }
  return s;
}

vec3 starfield(vec3 d) {
  vec3 c = vec3(0.0);
  for (int k = 0; k < 3; k++) {
    float n = k == 0 ? 70.0 : (k == 1 ? 150.0 : 310.0);
    float r = k == 0 ? 0.2 : (k == 1 ? 0.17 : 0.15);
    vec3 p = d * n;
    vec3 id = floor(p);
    vec3 h = hash33(id + float(k) * 13.0);
    float present = step(0.9 + 0.02 * float(k), hash13(id + 7.7 + float(k)));
    float dist = length(p - (id + 0.2 + 0.6 * h));
    float glow = smoothstep(r, 0.0, dist);
    vec3 tint = mix(uStar, mix(uWarm, uCool, h.y), 0.45 * h.z);
    c += present * glow * glow * (0.5 + 2.2 * h.x) * tint;
  }
  float band = exp(-pow(d.y * 2.4 + 0.3 * sin(d.x * 3.0 + 1.0), 2.0) * 3.5);
  float cloud = fbm(d * 3.2 + 4.0);
  c += uMid * band * cloud * cloud * 0.4;
  return c;
}

float fbm3(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 3; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return s;
}

// volumetric nebula: warped clouds, glowing filaments and dark dust lanes
vec3 nebula(vec3 d) {
  vec3 p = d * 2.1;
  vec3 w = vec3(fbm3(p + 1.7), fbm3(p + 8.3), fbm3(p + 4.1));
  float n1 = fbm(p * 1.1 + w * 1.7);
  float n2 = fbm(p * 2.5 + w * 2.3 + 5.0);
  float dust = smoothstep(0.38, 0.78, fbm3(p * 3.1 + w * 1.3 + 20.0));
  float hue = smoothstep(0.35, 0.65, fbm3(p * 0.7 + 3.0 + w * 0.8));
  float band = 0.3 + 0.7 * exp(-pow(d.y * 1.6 + 0.35 * sin(d.x * 2.2 + 0.6), 2.0) * 1.6);
  vec3 cool = mix(uMid, uCool, smoothstep(0.3, 0.85, n1));
  vec3 warm = mix(mix(uMid, uEmber, 0.6), uWarm, smoothstep(0.35, 0.9, n1));
  vec3 c = mix(cool, warm, hue) * pow(n1, 2.3) * 1.6;
  c += mix(uWarm, uHot, smoothstep(0.4, 0.95, n2)) * pow(n2, 3.2) * 0.9;
  c += mix(uEmber, uFlame, 0.4) * pow(max(n2 - 0.52, 0.0), 2.0) * 1.0 * hue;
  return c * band * (1.0 - 0.8 * dust) * 0.7;
}

vec3 sky(vec3 d) {
  return starfield(d) + nebula(d);
}

// ringed gas giant hanging in the upper right: returns rgb in xyz, coverage in w
vec4 planetScreen(vec2 uv, float aspect, float ease) {
  vec2 centre = vec2(aspect * 0.34, 0.27 + 0.01 * sin(uTime * 0.2));
  float radius = 0.092 * (1.0 + 0.3 * ease);
  vec2 pl = (uv - centre) / radius;
  float pr = length(pl);
  if (pr > 3.2) return vec4(0.0);
  float tilt = 0.42;
  vec2 rp = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt)) * pl;
  float rr = length(vec2(rp.x, rp.y / 0.27));
  float stripe = 0.3 + 0.7 * vnoise(vec3(rr * 42.0, 1.0, 2.0)) * (0.55 + 0.45 * vnoise(vec3(rr * 11.0, 3.0, 4.0)));
  stripe *= smoothstep(0.015, 0.06, abs(rr - 2.05)) * smoothstep(0.0, 0.03, abs(rr - 1.78));
  float ringMask = smoothstep(1.5, 1.58, rr) * smoothstep(2.5, 2.38, rr) * (0.45 + 0.55 * stripe);
  vec3 L = normalize(vec3(-0.75, -0.35, 0.55));
  vec3 ringCol = mix(uWarm, uHot, 0.4) * (0.4 + 0.6 * smoothstep(1.2, -1.4, rp.x));

  float nz = sqrt(max(1.0 - pr * pr, 0.0));
  vec3 n = vec3(pl, nz);
  float diff = max(dot(n, L), 0.0);
  vec2 sp = vec2(pl.x / max(nz, 0.25), rp.y);
  float swirl = fbm(vec3(sp.x * 2.4 + uTime * 0.02, sp.y * 9.0, 4.0));
  float lat = rp.y * 7.0 + swirl * 1.4;
  float bandT = 0.5 + 0.5 * sin(lat * 3.1) * (0.6 + 0.4 * sin(lat * 1.3 + 1.0));
  float storm = smoothstep(0.24, 0.0, length((pl - vec2(-0.25, -0.32)) * vec2(1.0, 2.2)));
  vec3 alb = mix(mix(uMid, uCool, 0.5), mix(uWarm, uHot, 0.45), bandT * 0.75);
  alb = mix(alb, mix(uEmber, uFlame, 0.5), storm * 0.35);
  alb *= 0.85 + 0.3 * fbm3(vec3(sp * 18.0, 7.0));
  vec3 planetCol = alb * (0.05 + diff * 1.7) + uCool * pow(1.0 - nz, 3.0) * 0.9 * (0.3 + diff);
  float planetMask = smoothstep(1.0, 0.97, pr);

  vec3 c = vec3(0.0);
  float cover = 0.0;
  float glow = exp(-max(pr - 1.0, 0.0) * 9.0) * 0.4 * step(1.0, pr);
  c += uCool * glow;
  cover = max(cover, glow);
  float back = ringMask * 0.9 * step(0.0, rp.y);
  c = mix(c, ringCol, back);
  cover = max(cover, back);
  c = mix(c, planetCol, planetMask);
  cover = max(cover, planetMask);
  float front = ringMask * 0.9 * step(rp.y, 0.0);
  c = mix(c, ringCol, front);
  cover = max(cover, front);
  return vec4(c, cover);
}

// fire palette from the tokens: ember black -> deep red -> red -> dark orange -> orange -> yellow -> white
vec3 fireRamp(float x) {
  vec3 darkOrange = mix(uEmber, uFlame, 0.38) * 0.85;
  vec3 orange = mix(uEmber, uFlame, 0.62);
  vec3 c = mix(vec3(0.0), uEmber * 0.22, smoothstep(0.0, 0.12, x));
  c = mix(c, uEmber, smoothstep(0.1, 0.3, x));
  c = mix(c, darkOrange, smoothstep(0.28, 0.5, x));
  c = mix(c, orange, smoothstep(0.48, 0.72, x));
  c = mix(c, uFlame, smoothstep(0.7, 1.05, x));
  return mix(c, uHot, smoothstep(1.2, 2.2, x));
}

// fireballs: molten heads with a bow shock, layered flame (yellow core, dark-orange body, red bloom)
void meteors(vec2 uv, int first, float sizeMul, float speedMul, float zoom, inout vec3 col) {
  for (int i = 0; i < 3; i++) {
    float id = float(first + i);
    float r0 = hash12(vec2(id, 1.3));
    float r1 = hash12(vec2(id, 5.7));
    float period = (4.4 + 3.2 * r0) / speedMul;
    float tm = uTime / period + r1 * 7.0;
    float cyc = floor(tm);
    float ph = fract(tm);
    float cr = hash12(vec2(id * 3.1, cyc));
    float cr2 = hash12(vec2(id * 1.7, cyc + 11.0));
    float cr3 = hash12(vec2(id * 9.3, cyc + 23.0));
    float ang = 3.5 + (cr3 - 0.5) * 0.6;
    vec2 dir = vec2(cos(ang), sin(ang));
    vec2 nrm = vec2(-dir.y, dir.x);

    // as the camera pushes in, the fireballs fly toward the lens and swell
    float grow = mix(0.45, 1.6, ph * ph) * zoom;
    vec2 head = vec2(0.2 + 0.95 * cr, 0.55 + 0.32 * cr2) + dir * ph * 2.4;
    float rh = (0.010 + 0.011 * cr2) * sizeMul * grow;
    float env = smoothstep(0.0, 0.06, ph) * smoothstep(1.0, 0.88, ph);
    vec2 rel = uv - head;
    float along = dot(rel, dir);
    float across = dot(rel, nrm);
    float trailLen = rh * (20.0 + 10.0 * cr);
    if (abs(across) > rh * 12.0 || along < -trailLen * 1.15 || along > rh * 4.0) continue;

    float flick = 0.85 + 0.3 * vnoise(vec3(uTime * 9.0, id, cyc));
    float s = max(-along, 0.0) / trailLen;
    float hd = length(rel) / rh;

    // flame coordinates stream backward and curl more as the gas cools
    float scroll = uTime * 4.2 * speedMul;
    vec3 wq = vec3(across / rh * 0.35, along / rh * 0.18 + scroll * 0.6, id * 7.1 + cyc);
    float curl = (fbm3(wq) - 0.5) * (0.4 + 2.6 * s);
    float ax = across / rh + curl * 2.2;
    float wid = 0.95 + 3.0 * pow(s, 0.75);
    float an = ax / wid;
    float behind = smoothstep(0.6, -0.4, along / rh);
    vec3 fq = vec3(ax * 0.55, along / rh * 0.32 + scroll, id * 3.3 + cyc);
    float body = fbm(fq);
    float lick = fbm(fq * 2.3 + vec3(4.0, 1.0, 7.0));
    float shape = exp(-an * an * 1.6) * pow(clamp(1.0 - s, 0.0, 1.0), 1.1) * behind;

    // dense flame near the head, breaking into separate licking tongues toward the tail
    float dens = clamp(shape * 1.35 + (body - 0.5) * (0.7 + 0.9 * s) + (lick - 0.5) * 0.45 - s * 0.45, 0.0, 1.0);
    dens *= smoothstep(0.0, 0.2, shape);
    float coreT = exp(-s * 8.0) * exp(-an * an * 6.0) * behind;
    float temp = dens * (0.92 - 0.72 * s) + coreT * 1.2;
    vec3 fire = fireRamp(temp * flick) * pow(dens, 1.25) * 2.3 + fireRamp(1.5) * coreT * 2.4;

    // broad red bloom wrapped around the whole fireball
    float halo = exp(-pow(across / (rh * (2.2 + 4.0 * s)), 2.0)) * exp(-s * 2.2) * behind;
    fire += mix(uEmber, uEmber * 0.4, s) * halo * 0.6 * flick;
    fire += mix(uEmber, uFlame, 0.4) * exp(-hd * 0.75) * 0.5 * flick;
    col += fire * env;

    // embers shed from the flame, cooling from yellow to red as they fall behind
    vec2 spq = vec2(along / rh * 0.3 + scroll * 0.8, ax * 0.7);
    vec2 cell = floor(spq);
    float srnd = hash12(cell + id * 13.0);
    vec2 soff = (vec2(hash12(cell + 3.3), hash12(cell + 8.8)) - 0.5) * 0.55;
    float spark = step(0.92, srnd) * smoothstep(0.18, 0.0, length((fract(spq) - 0.5 - soff) * vec2(0.5, 1.0)));
    spark *= step(abs(an), 3.0) * step(s, 1.1) * behind;
    col += fireRamp(1.1 - s * 0.8) * spark * 3.0 * env;

    // molten rock head with a white-hot bow shock on its leading face
    float rockN = fbm(vec3(rel / rh * 1.5 + id * 3.0, 0.7));
    float edgeR = 1.0 + 0.28 * (rockN - 0.5) * 2.0;
    float front = dot(rel / max(length(rel), 1e-5), dir);
    float shock = exp(-pow((hd - 1.15) * 3.2, 2.0)) * smoothstep(-0.2, 0.9, front);
    col += fireRamp(1.9) * shock * 2.2 * env;
    float headMask = smoothstep(edgeR, edgeR - 0.14, hd);
    if (headMask > 0.001) {
      vec3 n = normalize(vec3(rel / rh, sqrt(max(1.0 - hd * hd, 0.05))));
      float lava = pow(1.0 - abs(fbm(vec3(rel / rh * 2.7 + id * 5.0, uTime * 0.5)) * 2.0 - 1.0), 6.0);
      float face = max(dot(n.xy, dir), 0.0);
      vec3 rock = mix(uSpace, mix(uCool, uEmber, 0.35), 0.2) * (0.35 + 0.8 * rockN);
      vec3 hot = fireRamp(0.5 + 1.2 * lava + 1.5 * face) * (0.7 * lava + 2.4 * face * face);
      col = mix(col, rock + hot * 2.2, headMask * env);
    }
  }
}

// ---- moon: bowls with raised rims, layered with rocky ridged noise
float craters(vec3 p) {
  float h = 0.0;
  for (int k = 0; k < 3; k++) {
    float s = k == 0 ? 2.3 : (k == 1 ? 5.2 : 11.5);
    float chance = k == 0 ? 0.6 : (k == 1 ? 0.45 : 0.32);
    float amp = k == 0 ? 1.0 : (k == 1 ? 0.55 : 0.28);
    vec3 q = p * s;
    vec3 id = floor(q);
    float acc = 0.0;
    for (int i = -1; i <= 1; i++) {
      for (int j = -1; j <= 1; j++) {
        for (int l = -1; l <= 1; l++) {
          vec3 cell = id + vec3(float(i), float(j), float(l));
          float on = step(chance, hash13(cell + 9.9 + float(k)));
          vec3 c = cell + 0.15 + 0.7 * hash33(cell + float(k) * 5.0);
          float r = 0.16 + 0.34 * pow(hash13(cell + 3.3), 1.6);
          float d = length(q - c) / r;
          float bowl = -0.9 * smoothstep(1.0, 0.55, d);
          float rim = exp(-pow((d - 1.0) * 4.5, 2.0)) * 0.38;
          float ejecta = exp(-max(d - 1.0, 0.0) * 3.0) * step(1.0, d) * 0.07;
          acc += on * (bowl + rim + ejecta);
        }
      }
    }
    h += acc * amp;
  }
  return h;
}
float moonHeight(vec3 u) {
  return craters(u) * 0.55 + ridged(u * 5.5) * 0.32 + fbm3(u * 34.0) * 0.12;
}

vec3 moonShade(vec3 P, vec3 M, vec3 dc, float lightAmt) {
  vec3 N = normalize(P - M);
  float ang = uTime * 0.025;
  mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec3 tx = normalize(cross(N, vec3(0.0, 1.0, 0.0)));
  vec3 ty = cross(N, tx);
  vec3 u = N;
  u.xz = rot * u.xz;
  vec3 txo = tx;
  txo.xz = rot * txo.xz;
  vec3 tyo = ty;
  tyo.xz = rot * tyo.xz;
  float eps = 0.008;
  float h0 = moonHeight(u);
  float hx = moonHeight(normalize(u + txo * eps));
  float hy = moonHeight(normalize(u + tyo * eps));
  vec2 grad = vec2(hx - h0, hy - h0) / eps;
  vec3 Nn = normalize(N - (tx * grad.x + ty * grad.y) * 0.05);

  // the only light is the black hole, off to the right and behind the moon
  vec3 L = normalize(vec3(0.5, 0.1, 0.85));
  vec3 lightCol = mix(uWarm, uHot, 0.65);
  // grey regolith with darker basaltic plains and fine grain
  float maria = smoothstep(0.42, 0.62, fbm3(u * 1.7 + 2.0));
  float grain = vnoise(u * 120.0);
  vec3 albedo = mix(mix(uSpace, uHot, 0.45), uCool, 0.12) * mix(1.0, 0.56, maria) * (0.85 + 0.25 * grain) * (0.82 + 0.22 * h0);
  float diff = max(dot(Nn, L), 0.0);
  float limb = pow(1.0 - max(dot(N, -dc), 0.0), 3.0);
  float facing = smoothstep(-0.15, 0.55, dot(N, L));
  vec3 c = albedo * lightCol * diff * 3.2 * lightAmt;
  c += lightCol * limb * facing * 1.7 * lightAmt;
  c += albedo * uCool * 0.03 * lightAmt;
  return c;
}

// tiny astronaut silhouette, rim-lit from the right
float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}
float astronaut(vec2 p) {
  float d = length(p - vec2(0.0, 0.62)) - 0.2;
  d = min(d, sdCapsule(p, vec2(0.0, 0.4), vec2(0.0, -0.18), 0.22));
  d = min(d, sdCapsule(p, vec2(-0.2, 0.3), vec2(-0.3, -0.1), 0.17));
  d = min(d, sdCapsule(p, vec2(0.12, 0.28), vec2(0.62, 0.52), 0.07));
  d = min(d, sdCapsule(p, vec2(0.04, -0.18), vec2(0.36, -0.52), 0.09));
  d = min(d, sdCapsule(p, vec2(-0.06, -0.18), vec2(-0.14, -0.62), 0.09));
  return d;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  // ---- timeline: the hole drifts out from behind the moon, then we plunge in
  float a = uApproach;
  float ease = a * a * (3.0 - 2.0 * a);
  float q = uPlunge;
  float reveal = smoothstep(0.0, 0.42, a);
  float zoom = 1.0 + 0.7 * ease + 1.6 * q * q;
  float warp = smoothstep(0.0, 1.0, q) + smoothstep(0.55, 1.0, a) * 0.18;

  // glitch tear before the cut
  float g = smoothstep(0.6, 0.88, q) * (1.0 - smoothstep(0.94, 1.0, q));
  float band = floor(gl_FragCoord.y / (uRes.y * 0.045));
  float bandRnd = hash12(vec2(band, floor(uTime * 14.0)));
  uv.x += step(0.7, bandRnd) * (hash12(vec2(band, 7.0)) - 0.5) * 0.55 * g;

  float dist = mix(22.0, 14.0, ease);
  dist = mix(dist, 1.02, pow(q, 1.8));
  float tilt = mix(0.075, 0.15, ease) + q * q * 0.95;
  float roll = 0.03 * sin(uTime * 0.3) + q * q * 2.2;
  float focal = mix(1.5, 1.2, ease) - q * 0.45;

  float cr = cos(roll);
  float sr = sin(roll);
  uv = mat2(cr, -sr, sr, cr) * uv;

  vec3 pos = vec3(0.0, dist * sin(tilt), -dist * cos(tilt));
  vec3 fwd = normalize(-pos);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  vec3 vel = normalize(fwd * focal + right * uv.x + up * uv.y);

  // ---- foreground moon, fixed to the camera and sliding away to reveal the hole
  float slide = smoothstep(0.02, 0.8, a);
  vec3 M = vec3(mix(-1.65, -3.05, slide) - q * q * 5.0, mix(-0.1, -0.22, slide), 3.4);
  float R = 2.05;
  vec3 dc = normalize(vec3(uv, focal));
  float moonDist = length(M);
  float edge = asin(R / moonDist) - acos(clamp(dot(dc, M / moonDist), -1.0, 1.0));
  float cov = smoothstep(-1.5 / uRes.y, 1.5 / uRes.y, edge);

  vec3 col = vec3(0.0);
  if (cov < 0.999) {
    // ---- integrate the light ray through Schwarzschild curvature (r_s = 1)
    vec3 p = pos;
    float h2 = dot(cross(p, vel), cross(p, vel));
    float b0 = sqrt(h2);
    float acc = 0.0;
    bool captured = false;
    float spin = uTime * (1.0 + 2.5 * q);

    for (int i = 0; i < 120; i++) {
      float r = length(p);
      if (r < 1.0) { captured = true; break; }
      if (r > 70.0 && i > 4) break;
      float dt = clamp(0.055 * (r - 0.7), 0.012, 1.7);

      vec3 prev = p;
      vec3 accel = -1.5 * h2 * p / pow(r, 5.0);
      vel = normalize(vel + accel * dt);
      p += vel * dt;

      if (prev.y * p.y < 0.0 && acc < 0.995) {
        float t = prev.y / (prev.y - p.y);
        vec3 hit = mix(prev, p, t);
        float rr = length(hit.xz);
        if (rr > 2.3 && rr < 9.5) {
          float ang = atan(hit.z, hit.x);
          float omega = 3.2 / pow(rr, 1.5);
          float phi = ang - spin * omega;
          vec3 flow = vec3(cos(phi), sin(phi), 0.0) * rr * 0.7 + vec3(0.0, 0.0, rr * 2.6);
          float n = fbm(flow);
          float fine = vnoise(vec3(cos(phi) * rr * 5.0, sin(phi) * rr * 5.0, rr * 16.0));
          float body = smoothstep(2.3, 2.9, rr) * (1.0 - smoothstep(5.4, 9.5, rr));
          float heat = pow(2.5 / rr, 1.55);
          vec3 vd = normalize(vec3(-hit.z, 0.0, hit.x)) * sqrt(0.5 / rr);
          float beam = pow(clamp(1.0 + 1.5 * dot(vd, -vel), 0.1, 2.8), 3.0);
          // icy ramp: blue-violet rim, pale lavender body, white-hot inner edge
          float tone = clamp((9.5 - rr) / 7.2, 0.0, 1.0);
          vec3 c = mix(uMid, uWarm, smoothstep(0.0, 0.5, tone));
          c = mix(c, uHot, smoothstep(0.35, 0.95, tone));
          float stri = vnoise(vec3(rr * 34.0, cos(phi) * 2.0, sin(phi) * 2.0));
          float stri2 = vnoise(vec3(rr * 95.0, cos(phi) * 4.0, sin(phi) * 4.0));
          float density = 0.3 + 0.6 * n + 0.2 * fine + 0.55 * stri * stri + 0.25 * stri2;
          vec3 emit = c * heat * density * beam * 4.6 * body;
          float opacity = clamp(body * (0.55 + 0.5 * n), 0.0, 0.95);
          col += (1.0 - acc) * emit;
          acc += (1.0 - acc) * opacity;
        }
      }
    }

    // the hole fades up as it clears the moon
    col *= mix(0.05, 1.0, reveal);

    if (!captured) {
      col += (1.0 - acc) * sky(normalize(vel));

      // photon ring hugging the shadow, plus a wide soft bloom
      float e = (b0 - 2.598) / 2.598;
      float eo = max(e, 0.0);
      if (e > -0.02) {
        float ring = exp(-eo * 34.0) * 1.5;
        float bloom = exp(-eo * 2.1) * 0.2 + exp(-eo * 0.7) * 0.05;
        vec3 glow = ring * mix(uWarm, uHot, 0.8) + bloom * mix(uMid, uWarm, 0.5);
        col += glow * (1.0 - 0.4 * acc) * mix(0.05, 1.0, reveal);
      }
    }

    // debris streaking past the camera, flying outward as we push in
    float rad = length(uv);
    float angle = atan(uv.y, uv.x);
    for (int s = 0; s < 2; s++) {
      float lanes = s == 0 ? 38.0 : 71.0;
      vec2 gr = vec2(
        angle * lanes / 6.2831853,
        rad * (s == 0 ? 3.2 : 5.5) - uTime * (s == 0 ? 0.45 : 0.8) * (1.0 + warp * 5.0)
      );
      vec2 cell = floor(gr);
      float rnd = hash12(cell + float(s) * 17.0);
      vec2 off = (vec2(hash12(cell + 3.1), hash12(cell + 7.7)) - 0.5) * 0.5;
      vec2 d = (fract(gr) - 0.5 - off) * vec2(1.0, 0.32 / (1.0 + warp * 2.0));
      float bit = step(0.972, rnd) * smoothstep(0.14, 0.0, length(d));
      bit *= smoothstep(0.08, 0.5, rad) * (0.6 + 0.8 * hash12(cell + 5.5)) * (captured ? 0.0 : 1.0);
      col += mix(uHot, uWarm, 0.3) * bit * 1.2;
    }

    // ringed planet in the distance
    vec4 planet = planetScreen(uv, uRes.x / uRes.y, ease);
    col = mix(col, planet.rgb, planet.a * mix(0.05, 1.0, reveal));

    // distant meteors burning past, hidden behind the moon
    meteors(uv, 0, 1.0, 1.0, zoom, col);
  }

  if (cov > 0.0) {
    float t = dot(dc, M);
    float disc = t * t - (dot(M, M) - R * R);
    float tt = t - sqrt(max(disc, 0.0));
    vec3 P = dc * tt;
    float lightAmt = mix(0.1, 1.0, reveal);
    vec3 moon = moonShade(P, M, dc, lightAmt);

    // astronaut standing on the moon's face, rim-lit from the hole's side
    vec2 moonCenter = M.xy / M.z * focal;
    vec2 ap = (uv - (moonCenter + vec2(0.46, -0.3))) / (0.03 * 3.4 / (M.z - R * 0.7));
    ap.y += 0.05 * sin(uTime * 0.5);
    float ad = astronaut(mat2(0.97, -0.24, 0.24, 0.97) * ap);
    float body = smoothstep(0.03, -0.03, ad);
    float rimLight = smoothstep(0.0, 0.25, ap.x * 0.9 + 0.1 - ad * 0.8) * smoothstep(-0.2, 0.05, ad);
    vec3 suit = uSpace + mix(uCool, uHot, 0.5) * rimLight * 0.6 * lightAmt;
    moon = mix(moon, suit, body);

    col = mix(col, moon, cov);
  }

  // close, large meteors streak across in front of the moon
  meteors(uv, 3, 1.9, 0.8, zoom, col);

  // rush of light streaks while falling in
  float sRad = length(uv);
  float lane = floor(atan(uv.y, uv.x) * 220.0);
  float rnd2 = hash12(vec2(lane, floor(uTime * 24.0 + sRad * 6.0)));
  float streak = step(0.9, rnd2) * smoothstep(0.12, 0.95, sRad) * (0.4 + hash12(vec2(lane, 3.0)));
  col += mix(uStar, uHot, 0.5) * streak * smoothstep(0.0, 1.0, q) * 0.65;

  // anamorphic flare dragged across the ring
  col += mix(uMid, uHot, 0.25) * exp(-abs(uv.y) * 22.0) * exp(-abs(uv.x) * 1.1) * 0.05 * reveal * (1.0 - cov);

  // HDR pipeline: the post passes add bloom, grade and grain
  if (uDirect < 0.5) {
    gl_FragColor = vec4(clamp(col, 0.0, 6.0e4), 1.0);
    return;
  }

  // tone map, vignette, grain
  col = 1.0 - exp(-col * 1.05);
  col = pow(col, vec3(0.92));
  col *= 1.0 - 0.5 * smoothstep(0.35, 1.25, length(gl_FragCoord.xy / uRes - 0.5) * 1.6);
  col += (hash12(gl_FragCoord.xy + uTime) - 0.5) * 0.018;

  // datamosh blocks and colour tears
  vec2 blockCell = floor(gl_FragCoord.xy / (uRes.y * 0.05));
  float blockRnd = hash12(blockCell + floor(uTime * 11.0));
  float blockPick = hash12(blockCell + 31.0);
  vec3 blockCol = blockPick < 0.33 ? uMid : (blockPick < 0.66 ? uCool : uHot);
  col = mix(col, blockCol * (0.4 + 0.6 * hash12(blockCell + 5.0)), step(1.0 - 0.3 * g, blockRnd) * 0.85);

  // bloom and fall to black
  col = mix(col, uSpace, smoothstep(0.9, 1.0, q));

  gl_FragColor = vec4(col, 1.0);
}
`;

const POST_VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/** 13-tap downsample; the first pass also keeps only the brightest light (soft knee). */
const DOWN = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uSrc;
uniform vec2 uTexel;
uniform float uPrefilter;
vec3 s(vec2 o) { return texture2D(uSrc, vUv + o * uTexel).rgb; }
void main() {
  vec3 col = s(vec2(0.0)) * 0.125;
  col += (s(vec2(-2.0, 2.0)) + s(vec2(2.0, 2.0)) + s(vec2(-2.0, -2.0)) + s(vec2(2.0, -2.0))) * 0.03125;
  col += (s(vec2(0.0, 2.0)) + s(vec2(-2.0, 0.0)) + s(vec2(2.0, 0.0)) + s(vec2(0.0, -2.0))) * 0.0625;
  col += (s(vec2(-1.0, 1.0)) + s(vec2(1.0, 1.0)) + s(vec2(-1.0, -1.0)) + s(vec2(1.0, -1.0))) * 0.125;
  if (uPrefilter > 0.5) {
    float br = max(col.r, max(col.g, col.b));
    float knee = 0.6;
    float soft = clamp(br - 1.1 + knee, 0.0, 2.0 * knee);
    soft = soft * soft / (4.0 * knee + 1e-4);
    col *= max(soft, br - 1.1) / max(br, 1e-4);
    col = min(col, vec3(60.0));
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

/** 9-tap tent upsample, blended additively into the next larger level. */
const UP = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uSrc;
uniform vec2 uTexel;
vec3 s(vec2 o) { return texture2D(uSrc, vUv + o * uTexel).rgb; }
void main() {
  vec3 col = s(vec2(0.0)) * 4.0;
  col += (s(vec2(-1.0, 0.0)) + s(vec2(1.0, 0.0)) + s(vec2(0.0, -1.0)) + s(vec2(0.0, 1.0))) * 2.0;
  col += s(vec2(-1.0, -1.0)) + s(vec2(1.0, -1.0)) + s(vec2(-1.0, 1.0)) + s(vec2(1.0, 1.0));
  gl_FragColor = vec4(col / 16.0, 1.0);
}
`;

/** Lens and film: chromatic fringing, bloom, filmic tone curve, vignette, grain, glitch cut. */
const COMPOSITE = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform vec2 uRes;
uniform float uTime;
uniform float uPlunge;
uniform vec3 uHot;
uniform vec3 uMid;
uniform vec3 uCool;
uniform vec3 uSpace;
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec3 filmic(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
void main() {
  vec2 dc = vUv - 0.5;
  float ca = 0.0004 + 0.006 * dot(dc, dc);
  vec3 col = vec3(
    texture2D(uScene, vUv - dc * ca).r,
    texture2D(uScene, vUv).g,
    texture2D(uScene, vUv + dc * ca).b
  );
  col += texture2D(uBloom, vUv).rgb * 0.075;
  col = filmic(col * 0.78);
  col = pow(col, vec3(0.94));
  col *= 1.0 - 0.5 * smoothstep(0.35, 1.25, length(dc) * 1.6);
  col += (hash12(gl_FragCoord.xy + fract(uTime) * 97.0) - 0.5) * 0.008;

  float q = uPlunge;
  float g = smoothstep(0.6, 0.88, q) * (1.0 - smoothstep(0.94, 1.0, q));
  vec2 blockCell = floor(gl_FragCoord.xy / (uRes.y * 0.05));
  float blockRnd = hash12(blockCell + floor(uTime * 11.0));
  float blockPick = hash12(blockCell + 31.0);
  vec3 blockCol = blockPick < 0.33 ? uMid : (blockPick < 0.66 ? uCool : uHot);
  col = mix(col, blockCol * (0.4 + 0.6 * hash12(blockCell + 5.0)), step(1.0 - 0.3 * g, blockRnd) * 0.85);
  col = mix(col, uSpace, smoothstep(0.9, 1.0, q));
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Resolve any CSS colour (hex, oklch, color-mix ...) from a design token into 0-1 sRGB components. */
function resolveToken(name: string, probe: CanvasRenderingContext2D): [number, number, number] {
  const holder = document.createElement("span");
  holder.style.color = `var(${name})`;
  holder.style.display = "none";
  document.documentElement.appendChild(holder);
  const css = getComputedStyle(holder).color;
  holder.remove();
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = css;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return null;
  const program = gl.createProgram()!;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, "aPos");
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number; ok: boolean };
const BLOOM_LEVELS = 7;

export function BlackHole({
  state,
  className,
}: {
  state: MutableRefObject<DiveState>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const options: WebGLContextAttributes = {
      antialias: false,
      alpha: false,
      depth: false,
      powerPreference: "high-performance",
    };
    // WebGL2 with float render targets gives the full HDR film pipeline; otherwise render directly
    const gl2 = canvas.getContext("webgl2", options) as WebGL2RenderingContext | null;
    const gl = (gl2 ?? canvas.getContext("webgl", options)) as WebGLRenderingContext | null;
    if (!gl) return;
    let hdr = !!gl2 && !!gl2.getExtension("EXT_color_buffer_float");

    const scene = link(gl, VERTEX, FRAGMENT);
    if (!scene) return;
    const down = hdr ? link(gl, POST_VERTEX, DOWN) : null;
    const up = hdr ? link(gl, POST_VERTEX, UP) : null;
    const composite = hdr ? link(gl, POST_VERTEX, COMPOSITE) : null;
    if (!down || !up || !composite) hdr = false;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const at = (program: WebGLProgram | null, name: string) =>
      program ? gl.getUniformLocation(program, name) : null;

    // paint every pass from the design-system tokens
    const probeCanvas = document.createElement("canvas");
    probeCanvas.width = probeCanvas.height = 1;
    const probe = probeCanvas.getContext("2d", { willReadFrequently: true })!;
    const colors = (Object.keys(COLOR_TOKENS) as (keyof typeof COLOR_TOKENS)[]).map(
      (key) => [key, resolveToken(COLOR_TOKENS[key], probe)] as const,
    );
    [scene, composite].forEach((program) => {
      if (!program) return;
      gl.useProgram(program);
      colors.forEach(([key, value]) => gl.uniform3fv(at(program, key), value));
    });
    if (composite) {
      gl.useProgram(composite);
      gl.uniform1i(at(composite, "uScene"), 0);
      gl.uniform1i(at(composite, "uBloom"), 1);
    }

    const sceneU = {
      res: at(scene, "uRes"),
      time: at(scene, "uTime"),
      approach: at(scene, "uApproach"),
      plunge: at(scene, "uPlunge"),
      direct: at(scene, "uDirect"),
    };
    const downU = { texel: at(down, "uTexel"), prefilter: at(down, "uPrefilter") };
    const upU = { texel: at(up, "uTexel") };
    const compU = {
      res: at(composite, "uRes"),
      time: at(composite, "uTime"),
      plunge: at(composite, "uPlunge"),
    };

    // ---- HDR render targets: full-res scene plus a mip chain for the bloom
    let sceneTarget: Target | null = null;
    let mips: Target[] = [];
    const createTarget = (w: number, h: number): Target => {
      const g = gl as WebGL2RenderingContext;
      const tex = g.createTexture()!;
      g.bindTexture(g.TEXTURE_2D, tex);
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA16F, w, h, 0, g.RGBA, g.HALF_FLOAT, null);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      const fbo = g.createFramebuffer()!;
      g.bindFramebuffer(g.FRAMEBUFFER, fbo);
      g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, tex, 0);
      const ok = g.checkFramebufferStatus(g.FRAMEBUFFER) === g.FRAMEBUFFER_COMPLETE;
      g.bindFramebuffer(g.FRAMEBUFFER, null);
      return { tex, fbo, w, h, ok };
    };
    const freeTargets = () => {
      [sceneTarget, ...mips].forEach((target) => {
        if (!target) return;
        gl.deleteTexture(target.tex);
        gl.deleteFramebuffer(target.fbo);
      });
      sceneTarget = null;
      mips = [];
    };
    const buildTargets = (w: number, h: number) => {
      freeTargets();
      sceneTarget = createTarget(w, h);
      let mw = w;
      let mh = h;
      for (let i = 0; i < BLOOM_LEVELS; i++) {
        mw = Math.max(1, mw >> 1);
        mh = Math.max(1, mh >> 1);
        mips.push(createTarget(mw, mh));
        if (mw <= 4 || mh <= 4) break;
      }
      if (![sceneTarget, ...mips].every((target) => target.ok)) {
        hdr = false;
        freeTargets();
      }
    };

    // start at a 4K-class budget; the governor steps down on slow GPUs and up toward 8K on fast ones
    let scale = Math.max(window.devicePixelRatio || 1, 1.5);
    let pixelBudget = START_PIXELS;
    let fast = 0;
    const fit = (force = false) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const capped = Math.min(scale, Math.sqrt(pixelBudget / (w * h)));
      const width = Math.max(2, Math.round(w * capped));
      const height = Math.max(2, Math.round(h * capped));
      if (force || canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        if (hdr) buildTargets(width, height);
      }
      canvas.dataset.pipeline = hdr ? "hdr" : "direct";
    };
    fit(true);
    const resize = () => fit();
    window.addEventListener("resize", resize);

    const drawScene = (t: number, direct: boolean, w: number, h: number) => {
      gl.useProgram(scene);
      gl.viewport(0, 0, w, h);
      gl.uniform2f(sceneU.res, w, h);
      gl.uniform1f(sceneU.time, t);
      gl.uniform1f(sceneU.approach, state.current.approach);
      gl.uniform1f(sceneU.plunge, state.current.plunge);
      gl.uniform1f(sceneU.direct, direct ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const begin = performance.now();
    let last = begin;
    let slow = 0;
    let frame = 0;
    const render = (now: number) => {
      const dt = now - last;
      last = now;
      slow = dt > 42 ? slow + 1 : Math.max(0, slow - 1);
      fast = dt < 17 ? fast + 1 : 0;
      if (slow > 12 && scale > MIN_SCALE) {
        scale = Math.max(MIN_SCALE, scale * 0.86);
        slow = 0;
        fit();
      } else if (fast > 30 && pixelBudget < MAX_PIXELS) {
        // sustained headroom: render sharper, up to native 8K
        pixelBudget = Math.min(MAX_PIXELS, pixelBudget * 1.5);
        scale = Math.min(scale * 1.3, 4);
        fast = 0;
        fit();
      }
      const t = (now - begin) / 1000;

      if (hdr && sceneTarget && mips.length && down && up && composite) {
        const target: Target = sceneTarget;
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        drawScene(t, false, target.w, target.h);

        // bloom: bright-pass and downsample...
        gl.useProgram(down);
        gl.activeTexture(gl.TEXTURE0);
        let source: Target = target;
        mips.forEach((mip, index) => {
          gl.bindFramebuffer(gl.FRAMEBUFFER, mip.fbo);
          gl.viewport(0, 0, mip.w, mip.h);
          gl.bindTexture(gl.TEXTURE_2D, source.tex);
          gl.uniform2f(downU.texel, 1 / source.w, 1 / source.h);
          gl.uniform1f(downU.prefilter, index === 0 ? 1 : 0);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          source = mip;
        });
        // ...then upsample, accumulating every level
        gl.useProgram(up);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        for (let i = mips.length - 1; i > 0; i--) {
          const smaller = mips[i];
          const larger = mips[i - 1];
          gl.bindFramebuffer(gl.FRAMEBUFFER, larger.fbo);
          gl.viewport(0, 0, larger.w, larger.h);
          gl.bindTexture(gl.TEXTURE_2D, smaller.tex);
          gl.uniform2f(upU.texel, 1 / smaller.w, 1 / smaller.h);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        gl.disable(gl.BLEND);

        // composite to screen
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(composite);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, target.tex);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, mips[0].tex);
        gl.uniform2f(compU.res, canvas.width, canvas.height);
        gl.uniform1f(compU.time, t);
        gl.uniform1f(compU.plunge, state.current.plunge);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.activeTexture(gl.TEXTURE0);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        drawScene(t, true, canvas.width, canvas.height);
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      freeTargets();
      [scene, down, up, composite].forEach((program) => program && gl.deleteProgram(program));
      gl.deleteBuffer(buffer);
    };
  }, [state]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

export { BlackHole as BlackHoleCanvas };
