export type Category = "serif" | "minimal" | "luxury" | "script" | "monogram" | "custom";
export type Layout =
  | "stacked" | "single" | "frame" | "script" | "monogram" | "hanger"
  | "signature" | "divider" | "geometric" | "circle" | "arch" | "crest";
export type TextCase = "upper" | "title";
export type Align = "center" | "left" | "right";

export interface LogoSpec {
  id: string;
  num: number;
  name: string;
  category: Category;
  family: string;
  weight: number;
  italic: boolean;
  textCase: TextCase;
  letterSpacing: number; // em
  fontScale: number; // 0.6 - 1.4
  align: Align;
  layout: Layout;
  primary: string;
  secondary: string;
  background: string;
  transparent: boolean;
  tags: { elegant: number; modern: number; classic: number; luxury: number };
}

export const BRAND = "Clothing Gallery";

export const FONTS: Record<string, { weights: number[]; italic: boolean; kind: "Serif" | "Sans Serif" | "Script" }> = {
  "Playfair Display": { weights: [400, 500, 600, 700, 800, 900], italic: true, kind: "Serif" },
  "Cormorant Garamond": { weights: [300, 400, 500, 600, 700], italic: true, kind: "Serif" },
  Cinzel: { weights: [400, 500, 600, 700, 800, 900], italic: false, kind: "Serif" },
  "Bodoni Moda": { weights: [400, 500, 600, 700, 800, 900], italic: true, kind: "Serif" },
  "Libre Baskerville": { weights: [400, 500, 600, 700], italic: true, kind: "Serif" },
  "DM Serif Display": { weights: [400], italic: true, kind: "Serif" },
  Lora: { weights: [400, 500, 600, 700], italic: true, kind: "Serif" },
  Prata: { weights: [400], italic: false, kind: "Serif" },
  Montserrat: { weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true, kind: "Sans Serif" },
  Poppins: { weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true, kind: "Sans Serif" },
  Raleway: { weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true, kind: "Sans Serif" },
  "Josefin Sans": { weights: [100, 200, 300, 400, 500, 600, 700], italic: true, kind: "Sans Serif" },
  "Great Vibes": { weights: [400], italic: false, kind: "Script" },
  Allura: { weights: [400], italic: false, kind: "Script" },
  "Dancing Script": { weights: [400, 500, 600, 700], italic: false, kind: "Script" },
  Marcellus: { weights: [400], italic: false, kind: "Serif" },
  "Tenor Sans": { weights: [400], italic: false, kind: "Sans Serif" },
  "Abril Fatface": { weights: [400], italic: false, kind: "Serif" },
  "EB Garamond": { weights: [400, 500, 600, 700, 800], italic: true, kind: "Serif" },
  Outfit: { weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: false, kind: "Sans Serif" },
};

const WEIGHT_NAMES: Record<number, string> = {
  100: "Thin", 200: "Extra Light", 300: "Light", 400: "Regular", 500: "Medium",
  600: "Semi Bold", 700: "Bold", 800: "Extra Bold", 900: "Black",
};
export function styleLabel(weight: number, italic: boolean) {
  const w = WEIGHT_NAMES[weight] ?? String(weight);
  if (italic) return weight === 400 ? "Italic" : `${w} Italic`;
  return w;
}

export const COLOR_NAMES: Record<string, string> = {
  "#5D0096": "Royal Purple", "#D31710": "Red-Orange", "#FFFFFF": "Pure White", "#000000": "Jet Black",
  "#D4AF37": "Luxury Gold", "#E8B4B8": "Rose Pink", "#C084FC": "Lavender", "#800020": "Burgundy",
  "#A67C52": "Champagne Brown", "#F5E6D3": "Soft Beige", "#B76E79": "Rose Gold", "#1B2A4A": "Navy",
  "#046307": "Emerald Green", "#4E2A1E": "Chocolate Brown", "#36454F": "Charcoal", "#C0C0C0": "Silver",
  "#3B0066": "Deep Purple", "#F7E7CE": "Champagne", "#FAF7F2": "Ivory",
};

function rgb(hex: string) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
export function colorName(hex: string) {
  const up = hex.toUpperCase();
  if (COLOR_NAMES[up]) return COLOR_NAMES[up];
  const [r, g, b] = rgb(up);
  let best = "Custom", bd = Infinity;
  for (const [k, n] of Object.entries(COLOR_NAMES)) {
    const [r2, g2, b2] = rgb(k);
    const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (d < bd) { bd = d; best = n; }
  }
  return `Custom (near ${best})`;
}

/** Colors actually used in a logo, deduplicated, in order of prominence. */
export function logoColors(s: LogoSpec) {
  const list = [s.primary, s.secondary, ...(s.transparent ? [] : [s.background])].map((c) => c.toUpperCase());
  return [...new Set(list)].map((hex) => ({ hex, name: colorName(hex) }));
}

export const CATEGORY_LABELS: Record<Category, string> = {
  serif: "Elegant Serif", minimal: "Modern Minimal", luxury: "Luxury Boutique",
  script: "Script & Signature", monogram: "Monogram", custom: "Custom Logo",
};

export const LAYOUT_LABELS: Record<Layout, string> = {
  stacked: "Stacked Wordmark", single: "Single Line", frame: "Framed Boutique", script: "Script Flow",
  monogram: "Monogram Ring", hanger: "Hanger Mark", signature: "Signature Swash", divider: "Ornament Divider",
  geometric: "Geometric Diamond", circle: "Circular Emblem", arch: "Couture Arch", crest: "Fashion House Crest",
};

type Seed = Omit<LogoSpec, "id" | "num" | "fontScale" | "align" | "transparent"> & Partial<LogoSpec>;
const t = (elegant: number, modern: number, classic: number, luxury: number) => ({ elegant, modern, classic, luxury });

const SEEDS: Seed[] = [
  { name: "Elegant Luxury Serif Wordmark", category: "serif", family: "Playfair Display", weight: 700, italic: false, textCase: "upper", letterSpacing: 0.08, layout: "stacked", primary: "#5D0096", secondary: "#D4AF37", background: "#FFFFFF", tags: t(9, 4, 8, 9) },
  { name: "Modern Minimalist Wordmark", category: "minimal", family: "Montserrat", weight: 300, italic: false, textCase: "upper", letterSpacing: 0.35, layout: "single", primary: "#000000", secondary: "#D31710", background: "#FFFFFF", tags: t(5, 10, 3, 5) },
  { name: "Premium Fashion Boutique Logo", category: "luxury", family: "Cinzel", weight: 600, italic: false, textCase: "upper", letterSpacing: 0.12, layout: "frame", primary: "#5D0096", secondary: "#D31710", background: "#FFFFFF", tags: t(8, 4, 8, 9) },
  { name: "Classic Editorial Typography", category: "serif", family: "Bodoni Moda", weight: 700, italic: false, textCase: "upper", letterSpacing: 0.04, layout: "stacked", primary: "#000000", secondary: "#D4AF37", background: "#FFFFFF", tags: t(8, 5, 10, 8) },
  { name: "Elegant Script Typography", category: "script", family: "Great Vibes", weight: 400, italic: false, textCase: "title", letterSpacing: 0, layout: "script", primary: "#5D0096", secondary: "#E8B4B8", background: "#FFFFFF", tags: t(10, 3, 7, 8) },
  { name: "High-End Designer Style", category: "luxury", family: "Tenor Sans", weight: 400, italic: false, textCase: "upper", letterSpacing: 0.3, layout: "single", primary: "#B76E79", secondary: "#FFFFFF", background: "#000000", tags: t(8, 9, 4, 10) },
  { name: "Modern Sans Serif Logo", category: "minimal", family: "Poppins", weight: 600, italic: false, textCase: "upper", letterSpacing: 0.06, layout: "stacked", primary: "#FFFFFF", secondary: "#FFFFFF", background: "#D31710", tags: t(4, 10, 2, 5) },
  { name: "Sophisticated Italic Serif Logo", category: "serif", family: "Cormorant Garamond", weight: 600, italic: true, textCase: "title", letterSpacing: 0.02, layout: "divider", primary: "#800020", secondary: "#A67C52", background: "#FFFFFF", tags: t(10, 4, 9, 8) },
  { name: "Minimal Monogram + Wordmark", category: "monogram", family: "DM Serif Display", weight: 400, italic: false, textCase: "upper", letterSpacing: 0.25, layout: "monogram", primary: "#FFFFFF", secondary: "#D4AF37", background: "#3B0066", tags: t(8, 7, 6, 9) },
  { name: "Fashion Hanger Typography Logo", category: "luxury", family: "Josefin Sans", weight: 300, italic: false, textCase: "upper", letterSpacing: 0.28, layout: "hanger", primary: "#1B2A4A", secondary: "#D4AF37", background: "#FFFFFF", tags: t(6, 8, 5, 7) },
  { name: "Boutique Signature Logo", category: "script", family: "Allura", weight: 400, italic: false, textCase: "title", letterSpacing: 0, layout: "signature", primary: "#5D0096", secondary: "#D31710", background: "#FFFFFF", tags: t(9, 5, 6, 7) },
  { name: "Luxury Editorial Logo", category: "luxury", family: "Prata", weight: 400, italic: false, textCase: "upper", letterSpacing: 0.14, layout: "frame", primary: "#D4AF37", secondary: "#D4AF37", background: "#046307", tags: t(8, 4, 8, 10) },
  { name: "Geometric Fashion Logo", category: "minimal", family: "Outfit", weight: 500, italic: false, textCase: "upper", letterSpacing: 0.2, layout: "geometric", primary: "#3B0066", secondary: "#C084FC", background: "#FFFFFF", tags: t(5, 10, 3, 6) },
  { name: "Feminine Elegant Typography", category: "serif", family: "Lora", weight: 500, italic: true, textCase: "title", letterSpacing: 0.01, layout: "arch", primary: "#5D0096", secondary: "#E8B4B8", background: "#F5E6D3", tags: t(9, 5, 7, 7) },
  { name: "Contemporary Premium Wordmark", category: "minimal", family: "Raleway", weight: 200, italic: false, textCase: "upper", letterSpacing: 0.4, layout: "single", primary: "#36454F", secondary: "#F7E7CE", background: "#FFFFFF", tags: t(6, 9, 4, 7) },
  { name: "Artistic Calligraphy Logo", category: "script", family: "Dancing Script", weight: 700, italic: false, textCase: "title", letterSpacing: 0, layout: "script", primary: "#4E2A1E", secondary: "#A67C52", background: "#F5E6D3", tags: t(8, 4, 6, 6) },
  { name: "Minimal Circular Emblem", category: "monogram", family: "Marcellus", weight: 400, italic: false, textCase: "upper", letterSpacing: 0.18, layout: "circle", primary: "#5D0096", secondary: "#C0C0C0", background: "#FFFFFF", tags: t(7, 7, 7, 8) },
  { name: "Modern Luxury Branding", category: "luxury", family: "Abril Fatface", weight: 400, italic: false, textCase: "upper", letterSpacing: 0.03, layout: "stacked", primary: "#D31710", secondary: "#3B0066", background: "#FFFFFF", tags: t(6, 8, 5, 9) },
  { name: "Classic Boutique Typography", category: "serif", family: "Libre Baskerville", weight: 700, italic: false, textCase: "upper", letterSpacing: 0.1, layout: "divider", primary: "#800020", secondary: "#D4AF37", background: "#FAF7F2", tags: t(8, 3, 10, 8) },
  { name: "Exclusive Fashion House Wordmark", category: "monogram", family: "EB Garamond", weight: 500, italic: false, textCase: "upper", letterSpacing: 0.22, layout: "crest", primary: "#D4AF37", secondary: "#D4AF37", background: "#000000", tags: t(9, 5, 9, 10) },
];

export function initialLogos(): LogoSpec[] {
  return SEEDS.map((s, i) => ({
    fontScale: 1, align: "center", transparent: false, ...s,
    id: `logo-${i + 1}`, num: i + 1,
  }));
}

export const PALETTES: [string, string, string][] = [
  ["#5D0096", "#D31710", "#FFFFFF"], ["#5D0096", "#D4AF37", "#FFFFFF"], ["#D4AF37", "#D4AF37", "#000000"],
  ["#800020", "#A67C52", "#FFFFFF"], ["#FFFFFF", "#C084FC", "#3B0066"], ["#FFFFFF", "#F5E6D3", "#D31710"],
  ["#5D0096", "#E8B4B8", "#FFFFFF"], ["#B76E79", "#B76E79", "#000000"], ["#D4AF37", "#D4AF37", "#1B2A4A"],
  ["#3B0066", "#C084FC", "#FFFFFF"], ["#D4AF37", "#F7E7CE", "#046307"], ["#4E2A1E", "#A67C52", "#F5E6D3"],
  ["#D31710", "#3B0066", "#FFFFFF"], ["#F7E7CE", "#A67C52", "#36454F"], ["#5D0096", "#C0C0C0", "#FFFFFF"],
];

const LAYOUT_CATEGORY: Record<Layout, Category> = {
  stacked: "serif", single: "minimal", frame: "luxury", script: "script", monogram: "monogram", hanger: "luxury",
  signature: "script", divider: "serif", geometric: "minimal", circle: "monogram", arch: "serif", crest: "monogram",
};

/** Creates new unique variations locally (call from event handlers only). */
export function generateVariations(existing: LogoSpec[], count: number): LogoSpec[] {
  const keys = new Set(existing.map((l) => `${l.family}|${l.layout}|${l.primary}|${l.background}`));
  const families = Object.keys(FONTS);
  const layouts = Object.keys(LAYOUT_LABELS) as Layout[];
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  const out: LogoSpec[] = [];
  let num = Math.max(0, ...existing.map((l) => l.num));
  let guard = 0;
  while (out.length < count && guard++ < 500) {
    const family = pick(families);
    const f = FONTS[family];
    const script = f.kind === "Script";
    let layout = pick(layouts);
    if (script && !["script", "signature", "circle", "arch", "frame"].includes(layout)) layout = pick(["script", "signature"] as Layout[]);
    if (!script && (layout === "script" || layout === "signature")) layout = "stacked";
    const [primary, secondary, background] = pick(PALETTES);
    const key = `${family}|${layout}|${primary}|${background}`;
    if (keys.has(key)) continue;
    keys.add(key);
    num++;
    const weight = pick(f.weights.filter((w) => w >= 300 && w <= 700).length ? f.weights.filter((w) => w >= 300 && w <= 700) : f.weights);
    out.push({
      id: `logo-${num}-${Math.random().toString(36).slice(2, 7)}`, num,
      name: `${family} ${LAYOUT_LABELS[layout]}`,
      category: script ? "script" : LAYOUT_CATEGORY[layout],
      family, weight, italic: f.italic && Math.random() < 0.3,
      textCase: script ? "title" : Math.random() < 0.75 ? "upper" : "title",
      letterSpacing: script ? 0 : pick([0.04, 0.1, 0.18, 0.28]),
      fontScale: 1, align: "center", layout, primary, secondary, background, transparent: false,
      tags: { elegant: Math.ceil(Math.random() * 10), modern: Math.ceil(Math.random() * 10), classic: Math.ceil(Math.random() * 10), luxury: Math.ceil(Math.random() * 10) },
    });
  }
  return out;
}

export function fileName(num: number) {
  return `Clothing-Gallery-Logo-${String(num).padStart(2, "0")}.png`;
}
