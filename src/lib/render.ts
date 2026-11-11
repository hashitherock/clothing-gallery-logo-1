import type { LogoSpec } from "./logos";

export const EXPORT_SIZE = 1080;
const C = 540;

function fontStr(s: LogoSpec, size: number, family = s.family, weight = s.weight, italic = s.italic) {
  return `${italic ? "italic " : ""}${weight} ${size}px "${family}"`;
}

export async function ensureFonts(s: LogoSpec) {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([
    document.fonts.load(fontStr(s, 100), "Clothing GalleryCG"),
    document.fonts.load(`400 100px "Montserrat"`, "BOUTIQUE"),
    document.fonts.load(`500 100px "Montserrat"`, "BOUTIQUE"),
  ]).catch(() => undefined);
}

function width(ctx: CanvasRenderingContext2D, text: string, spacing: number) {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width;
  return w + spacing * Math.max(0, [...text].length - 1);
}

/** Draws text with manual letter spacing. x is the anchor for the given alignment. */
function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: CanvasTextAlign = "center") {
  const chars = [...text];
  if (spacing === 0) { ctx.textAlign = align; ctx.fillText(text, x, y); return; }
  const w = width(ctx, text, spacing);
  let cx = align === "center" ? x - w / 2 : align === "right" || align === "end" ? x - w : x;
  ctx.textAlign = "left";
  for (const ch of chars) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + spacing; }
}

/** Largest font size <= start where text fits maxW. */
function fit(ctx: CanvasRenderingContext2D, s: LogoSpec, text: string, start: number, maxW: number, ls = s.letterSpacing, family?: string, weight?: number, italic?: boolean) {
  let size = start;
  while (size > 10) {
    ctx.font = fontStr(s, size, family, weight, italic);
    if (width(ctx, text, size * ls) <= maxW) break;
    size -= 2;
  }
  ctx.font = fontStr(s, size, family, weight, italic);
  return size;
}

function tagline(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, size = 26, align: CanvasTextAlign = "center") {
  ctx.fillStyle = color;
  ctx.font = `500 ${size}px "Montserrat"`;
  spaced(ctx, text, x, y, size * 0.45, align);
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, w = 3) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, fill = true) {
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath();
  if (fill) { ctx.fillStyle = color; ctx.fill(); } else { ctx.strokeStyle = color; ctx.stroke(); }
}

export function drawLogo(ctx: CanvasRenderingContext2D, s: LogoSpec, px: number) {
  const k = px / EXPORT_SIZE;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.clearRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
  if (!s.transparent) { ctx.fillStyle = s.background; ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE); }
  ctx.textBaseline = "alphabetic";

  const up = s.textCase === "upper";
  const w1 = up ? "CLOTHING" : "Clothing";
  const w2 = up ? "GALLERY" : "Gallery";
  const full = `${w1} ${w2}`;
  const fs = s.fontScale;
  const align: CanvasTextAlign = s.align;
  const ax = s.align === "left" ? 190 : s.align === "right" ? 890 : C;
  const P = s.primary, S = s.secondary;

  switch (s.layout) {
    case "stacked": {
      ctx.fillStyle = P;
      const a = fit(ctx, s, w1, 150 * fs, 680);
      spaced(ctx, w1, ax, 520, a * s.letterSpacing, align);
      line(ctx, C - 140, 565, C + 140, 565, S, 3);
      diamond(ctx, C, 565, 9, S);
      ctx.fillStyle = S === s.background ? P : S;
      const b = fit(ctx, s, w2, a * 0.62, 560, s.letterSpacing + 0.35);
      spaced(ctx, w2, ax, 565 + b * 1.15, b * (s.letterSpacing + 0.35), align);
      break;
    }
    case "single": {
      ctx.fillStyle = P;
      let size = fit(ctx, s, full, 96 * fs, 760);
      if (size < 62 * fs) {
        size = fit(ctx, s, w1, 110 * fs, 720);
        spaced(ctx, w1, ax, 515, size * s.letterSpacing, align);
        spaced(ctx, w2, ax, 515 + size * 1.2, size * s.letterSpacing, align);
        line(ctx, C - 50, 515 + size * 1.2 + 55, C + 50, 515 + size * 1.2 + 55, S, 4);
      } else {
        spaced(ctx, full, ax, 560, size * s.letterSpacing, align);
        line(ctx, C - 60, 615, C + 60, 615, S, 4);
        tagline(ctx, "WOMEN'S FASHION", ax, 680, S, 22, align);
      }
      break;
    }
    case "frame": {
      ctx.strokeStyle = S; ctx.lineWidth = 4; ctx.strokeRect(220, 340, 640, 400);
      ctx.lineWidth = 1.5; ctx.strokeRect(238, 358, 604, 364);
      ctx.fillStyle = P;
      const a = fit(ctx, s, w1, 104 * fs, 540);
      spaced(ctx, w1, ax, 525, a * s.letterSpacing, align);
      const b = fit(ctx, s, w2, a * 0.75, 460, s.letterSpacing + 0.25);
      spaced(ctx, w2, ax, 525 + b * 1.35, b * (s.letterSpacing + 0.25), align);
      tagline(ctx, "BOUTIQUE", C, 790, S, 22);
      break;
    }
    case "script": {
      ctx.fillStyle = P;
      const a = fit(ctx, s, w1, 200 * fs, 700, 0);
      ctx.textAlign = align; ctx.fillText(w1, ax - (s.align === "center" ? 60 : 0), 500);
      ctx.fillText(w2, ax + (s.align === "center" ? 70 : 0), 500 + a * 0.85);
      tagline(ctx, "WOMEN'S FASHION BOUTIQUE", C, 500 + a * 0.85 + 90, S === s.background ? P : S, 22);
      break;
    }
    case "monogram": {
      ctx.strokeStyle = S; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(C, 410, 160, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(C, 410, 145, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = P;
      ctx.font = fontStr(s, 170 * fs); ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CG", C, 418);
      ctx.textBaseline = "alphabetic";
      const b = fit(ctx, s, full, 52 * fs, 720);
      spaced(ctx, full, ax, 690, b * s.letterSpacing, align);
      line(ctx, C - 40, 735, C + 40, 735, S, 2);
      break;
    }
    case "hanger": {
      ctx.strokeStyle = S; ctx.lineWidth = 6; ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(C, 270, 26, Math.PI, Math.PI * 2.35);
      ctx.moveTo(C, 300); ctx.lineTo(C, 320); ctx.lineTo(C + 190, 420); ctx.lineTo(C - 190, 420); ctx.lineTo(C, 320);
      ctx.stroke();
      ctx.fillStyle = P;
      const a = fit(ctx, s, w1, 110 * fs, 700);
      spaced(ctx, w1, ax, 560, a * s.letterSpacing, align);
      const b = fit(ctx, s, w2, a * 0.8, 600);
      spaced(ctx, w2, ax, 560 + b * 1.3, b * s.letterSpacing, align);
      tagline(ctx, "FASHION BOUTIQUE", C, 560 + b * 1.3 + 75, S, 20);
      break;
    }
    case "signature": {
      ctx.fillStyle = P;
      const a = fit(ctx, s, full, 160 * fs, 780, 0);
      ctx.textAlign = align; ctx.fillText(full, ax, 540);
      ctx.strokeStyle = S; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(250, 540 + a * 0.35);
      ctx.bezierCurveTo(450, 540 + a * 0.6, 700, 540 + a * 0.2, 850, 540 + a * 0.3); ctx.stroke();
      tagline(ctx, "FASHION BOUTIQUE", C, 540 + a * 0.35 + 90, S, 22);
      break;
    }
    case "divider": {
      ctx.fillStyle = P;
      const a = fit(ctx, s, w1, 130 * fs, 700);
      spaced(ctx, w1, ax, 490, a * s.letterSpacing, align);
      line(ctx, C - 230, 545, C - 30, 545, S, 2); line(ctx, C + 30, 545, C + 230, 545, S, 2);
      diamond(ctx, C, 545, 12, S, false); diamond(ctx, C, 545, 5, S);
      ctx.fillStyle = P;
      ctx.font = fontStr(s, a);
      spaced(ctx, w2, ax, 545 + a * 1.05, a * s.letterSpacing, align);
      break;
    }
    case "geometric": {
      ctx.lineWidth = 3; diamond(ctx, C, C, 300, S, false);
      ctx.lineWidth = 1.5; diamond(ctx, C, C, 275, S, false);
      ctx.fillStyle = P;
      const a = fit(ctx, s, w1, 88 * fs, 420);
      spaced(ctx, w1, C, 535, a * s.letterSpacing);
      spaced(ctx, w2, C, 535 + a * 1.2, a * s.letterSpacing);
      diamond(ctx, C, 400, 10, S);
      break;
    }
    case "circle": {
      ctx.strokeStyle = S; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(C, C, 330, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(C, C, 305, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = P;
      const a = fit(ctx, s, w1, 96 * fs, 480);
      spaced(ctx, w1, C, 530, a * s.letterSpacing);
      spaced(ctx, w2, C, 530 + a * 1.15, a * s.letterSpacing);
      diamond(ctx, C, 400, 9, S); diamond(ctx, C - 300, C, 7, S); diamond(ctx, C + 300, C, 7, S);
      tagline(ctx, "BOUTIQUE", C, 530 + a * 1.15 + 80, S === s.background ? P : S, 20);
      break;
    }
    case "arch": {
      ctx.strokeStyle = S; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(280, 790); ctx.lineTo(280, 520); ctx.arc(C, 520, 260, Math.PI, 0); ctx.lineTo(800, 790); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(300, 790); ctx.lineTo(300, 520); ctx.arc(C, 520, 240, Math.PI, 0); ctx.lineTo(780, 790); ctx.stroke();
      line(ctx, 240, 790, 840, 790, S, 3);
      ctx.fillStyle = P;
      const a = fit(ctx, s, w1, 110 * fs, 440);
      spaced(ctx, w1, C, 560, a * s.letterSpacing);
      spaced(ctx, w2, C, 560 + a * 1.1, a * s.letterSpacing);
      diamond(ctx, C, 360, 10, S);
      break;
    }
    case "crest": {
      ctx.lineWidth = 3; diamond(ctx, C, 380, 120, S, false);
      ctx.lineWidth = 1; diamond(ctx, C, 380, 104, S, false);
      ctx.fillStyle = P; ctx.font = fontStr(s, 92 * fs); ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CG", C, 386); ctx.textBaseline = "alphabetic";
      const a = fit(ctx, s, w1, 84 * fs, 700);
      spaced(ctx, w1, ax, 620, a * s.letterSpacing, align);
      spaced(ctx, w2, ax, 620 + a * 1.2, a * s.letterSpacing, align);
      line(ctx, C - 200, 620 + a * 1.2 + 50, C + 200, 620 + a * 1.2 + 50, S, 1.5);
      tagline(ctx, "MAISON DE MODE", C, 620 + a * 1.2 + 100, S, 20);
      break;
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export async function downloadLogo(s: LogoSpec, filename: string) {
  await ensureFonts(s);
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_SIZE; canvas.height = EXPORT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  drawLogo(ctx, s, EXPORT_SIZE);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
