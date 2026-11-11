import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Search, Sparkles, RotateCcw, SlidersHorizontal, X, Circle, Copy } from "lucide-react";
import { LogoCanvas } from "@/components/LogoCanvas";
import {
  CATEGORY_LABELS, COLOR_NAMES, FONTS, LAYOUT_LABELS, colorName, fileName, generateVariations,
  initialLogos, logoColors, styleLabel, type Category, type Layout, type LogoSpec,
} from "@/lib/logos";
import { downloadLogo } from "@/lib/render";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clothing Gallery — Premium Logo Collection Studio" },
      { name: "description", content: "Browse, customise and download 20+ premium typography logos for Clothing Gallery as 1080×1080 PNGs." },
      { property: "og:title", content: "Clothing Gallery — Premium Logo Collection Studio" },
      { property: "og:description", content: "Luxury fashion boutique logos with downloadable 1080×1080 Facebook profile PNGs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Studio,
});

type Tab = "all" | Category;
type Sort = "elegant" | "modern" | "classic" | "luxury" | "default";

function Studio() {
  const [logos, setLogos] = useState<LogoSpec[]>(() => initialLogos());
  const [tab, setTab] = useState<Tab>("all");
  const [font, setFont] = useState("all");
  const [color, setColor] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("default");
  const [circle, setCircle] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const usedColors = useMemo(() => {
    const m = new Map<string, string>();
    logos.forEach((l) => logoColors(l).forEach((c) => m.set(c.hex, c.name)));
    return [...m.entries()];
  }, [logos]);
  const usedFonts = useMemo(() => [...new Set(logos.map((l) => l.family))].sort(), [logos]);
  const combos = useMemo(() => new Set(logos.map((l) => `${l.primary}${l.secondary}${l.background}`)).size, [logos]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = logos.filter((l) =>
      (tab === "all" || l.category === tab) &&
      (font === "all" || l.family === font) &&
      (color === "all" || logoColors(l).some((c) => c.hex === color)) &&
      (!term || `${l.name} ${l.family} ${LAYOUT_LABELS[l.layout]} ${CATEGORY_LABELS[l.category]}`.toLowerCase().includes(term)),
    );
    if (sort !== "default") list = [...list].sort((a, b) => b.tags[sort] - a.tags[sort]);
    return list;
  }, [logos, tab, font, color, q, sort]);

  const current = logos.find((l) => l.id === editing) ?? null;
  const update = (patch: Partial<LogoSpec>) =>
    setLogos((ls) => ls.map((l) => (l.id === editing ? { ...l, ...patch } : l)));

  const download = async (l: LogoSpec) => {
    setBusy(l.id);
    try { await downloadLogo(l, fileName(l.num)); } finally { setBusy(null); }
  };

  const duplicateAsCustom = (l: LogoSpec) => {
    const num = Math.max(...logos.map((x) => x.num)) + 1;
    const copy: LogoSpec = { ...l, id: `custom-${num}`, num, name: `Custom — ${l.name}`, category: "custom" };
    setLogos((ls) => [...ls, copy]);
    setEditing(copy.id);
  };

  const reset = () => {
    setLogos(initialLogos()); setTab("all"); setFont("all"); setColor("all"); setQ(""); setSort("default"); setEditing(null);
  };

  const tabs: Tab[] = ["all", "serif", "minimal", "luxury", "script", "monogram", "custom"];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-10 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent">Women's Fashion Boutique</p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-[0.18em] text-primary md:text-6xl">CLOTHING GALLERY</h1>
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-gold" /><span className="size-2 rotate-45 bg-gold" /><span className="h-px w-12 bg-gold" />
          </div>
          <p className="mt-4 font-display text-xl italic text-muted-foreground">Premium Logo Collection Studio</p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden border-t border-border bg-border md:grid-cols-4">
          {[["Total Logos", logos.length], ["Font Families", usedFonts.length], ["Color Combinations", combos], ["Available Downloads", logos.length]].map(([k, v]) => (
            <div key={k} className="bg-card px-4 py-5 text-center">
              <div className="font-display text-3xl font-semibold text-primary">{v}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{k}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl space-y-3 px-6 py-4">
          <nav className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button key={t} className="chip" data-active={tab === t} onClick={() => setTab(t)}>
                {t === "all" ? "All Logos" : CATEGORY_LABELS[t]}
              </button>
            ))}
          </nav>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_160px_auto_auto_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input className="field pl-9" placeholder="Search logo styles…" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <select className="field" value={font} onChange={(e) => setFont(e.target.value)} aria-label="Font filter">
              <option value="all">All fonts</option>
              {usedFonts.map((f) => <option key={f}>{f}</option>)}
            </select>
            <select className="field" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Color filter">
              <option value="all">All colors</option>
              {usedColors.map(([hex, n]) => <option key={hex} value={hex}>{n} ({hex})</option>)}
            </select>
            <select className="field" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
              <option value="default">Sort: Default</option>
              <option value="elegant">Most Elegant</option>
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="luxury">Luxury</option>
            </select>
            <button className="btn-ghost" data-active={circle} onClick={() => setCircle((c) => !c)}>
              <Circle className="size-4" /> {circle ? "Square view" : "Facebook crop"}
            </button>
            <button className="btn-accent" onClick={() => setLogos((ls) => [...ls, ...generateVariations(ls, 8)])}>
              <Sparkles className="size-4" /> Generate More
            </button>
            <button className="btn-ghost" onClick={reset}><RotateCcw className="size-4" /> Reset</button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <p className="mb-5 text-sm text-muted-foreground">Showing {shown.length} of {logos.length} logos · Every download is 1080 × 1080 PNG</p>
        {shown.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">
            No logos match. {tab === "custom" && "Use “Customize” on any logo, then “Save as custom”."}
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {shown.map((l) => (
            <article key={l.id} className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card">
              <LogoCanvas spec={l} px={540} circle={circle} />
              <div className="mt-4 flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-semibold leading-tight text-foreground">{l.name}</h2>
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">#{String(l.num).padStart(2, "0")}</span>
              </div>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex gap-2"><dt className="text-muted-foreground">Font:</dt><dd className="font-medium">{l.family}</dd></div>
                <div className="flex gap-2"><dt className="text-muted-foreground">Font Style:</dt><dd className="font-medium">{styleLabel(l.weight, l.italic)}</dd></div>
                {logoColors(l).map((c, i) => (
                  <div key={c.hex} className="flex items-center gap-2">
                    <span className="size-4 shrink-0 rounded-full ring-1 ring-border" style={{ backgroundColor: c.hex }} />
                    <dd><span className="text-muted-foreground">{["Color", "Accent", "Background"][i] ?? "Color"}:</span> <span className="font-mono text-xs">{c.hex}</span> · {c.name}</dd>
                  </div>
                ))}
                {l.transparent && <div className="text-xs text-muted-foreground">Background: Transparent</div>}
              </dl>
              <div className="mt-auto flex gap-2 pt-4">
                <button className="btn-primary flex-1" disabled={busy === l.id} onClick={() => download(l)}>
                  <Download className="size-4" /> {busy === l.id ? "Preparing…" : "Download PNG"}
                </button>
                <button className="btn-ghost px-3" aria-label="Customize" onClick={() => setEditing(l.id)}>
                  <SlidersHorizontal className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {current && (
        <div className="fixed inset-0 z-40 flex justify-end bg-foreground/30" onClick={() => setEditing(null)}>
          <aside className="h-full w-full max-w-md overflow-y-auto bg-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-primary">Customize Logo</h3>
              <button className="btn-ghost px-2 py-2" aria-label="Close" onClick={() => setEditing(null)}><X className="size-4" /></button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{current.name} · changes preview instantly</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <LogoCanvas spec={current} px={540} />
              <LogoCanvas spec={current} px={540} circle />
            </div>
            <Customizer spec={current} update={update} />
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="btn-primary flex-1" onClick={() => download(current)}><Download className="size-4" /> Download PNG</button>
              {current.category !== "custom" && (
                <button className="btn-ghost" onClick={() => duplicateAsCustom(current)}><Copy className="size-4" /> Save as custom</button>
              )}
              <button className="btn-ghost" onClick={() => {
                const orig = initialLogos().find((o) => o.id === current.id);
                if (orig) update(orig);
              }}><RotateCcw className="size-4" /> Reset logo</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-10 w-12 cursor-pointer rounded border border-input bg-card" />
        <select className="field" value={COLOR_NAMES[value.toUpperCase()] ? value.toUpperCase() : ""} onChange={(e) => e.target.value && onChange(e.target.value)}>
          <option value="">{colorName(value)}</option>
          {Object.entries(COLOR_NAMES).map(([h, n]) => <option key={h} value={h}>{n} ({h})</option>)}
        </select>
      </div>
    </Field>
  );
}

function Customizer({ spec, update }: { spec: LogoSpec; update: (p: Partial<LogoSpec>) => void }) {
  const f = FONTS[spec.family] ?? FONTS["Playfair Display"]!;
  return (
    <div className="mt-6 grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Field label="Font Family">
          <select className="field" value={spec.family} onChange={(e) => {
            const nf = FONTS[e.target.value]!;
            const weight = nf.weights.includes(spec.weight) ? spec.weight : nf.weights.reduce((a, b) => Math.abs(b - spec.weight) < Math.abs(a - spec.weight) ? b : a);
            update({ family: e.target.value, weight, italic: spec.italic && nf.italic });
          }}>
            {Object.entries(FONTS).map(([n, v]) => <option key={n} value={n}>{n} — {v.kind}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Font Weight">
        <select className="field" value={spec.weight} onChange={(e) => update({ weight: Number(e.target.value) })}>
          {f.weights.map((w) => <option key={w} value={w}>{styleLabel(w, false)} ({w})</option>)}
        </select>
      </Field>
      <Field label="Style">
        <select className="field" value={spec.italic ? "i" : "n"} disabled={!f.italic} onChange={(e) => update({ italic: e.target.value === "i" })}>
          <option value="n">Normal</option>
          {f.italic && <option value="i">Italic</option>}
        </select>
      </Field>
      <Field label={`Font Size · ${Math.round(spec.fontScale * 100)}%`}>
        <input type="range" min={0.6} max={1.4} step={0.05} value={spec.fontScale} onChange={(e) => update({ fontScale: Number(e.target.value) })} className="w-full accent-primary" />
      </Field>
      <Field label={`Letter Spacing · ${spec.letterSpacing.toFixed(2)}em`}>
        <input type="range" min={0} max={0.5} step={0.01} value={spec.letterSpacing} onChange={(e) => update({ letterSpacing: Number(e.target.value) })} className="w-full accent-primary" />
      </Field>
      <Field label="Text Alignment">
        <select className="field" value={spec.align} onChange={(e) => update({ align: e.target.value as LogoSpec["align"] })}>
          <option value="center">Center</option><option value="left">Left</option><option value="right">Right</option>
        </select>
      </Field>
      <Field label="Text Case">
        <select className="field" value={spec.textCase} onChange={(e) => update({ textCase: e.target.value as LogoSpec["textCase"] })}>
          <option value="upper">UPPERCASE</option><option value="title">Title Case</option>
        </select>
      </Field>
      <div className="col-span-2">
        <Field label="Logo Layout">
          <select className="field" value={spec.layout} onChange={(e) => update({ layout: e.target.value as Layout })}>
            {Object.entries(LAYOUT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
      </div>
      <div className="col-span-2 space-y-3">
        <ColorField label="Primary Color" value={spec.primary} onChange={(v) => update({ primary: v })} />
        <ColorField label="Secondary Color" value={spec.secondary} onChange={(v) => update({ secondary: v })} />
        <ColorField label="Background Color" value={spec.background} onChange={(v) => update({ background: v })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={spec.transparent} onChange={(e) => update({ transparent: e.target.checked })} className="size-4 accent-primary" />
          Transparent background
        </label>
      </div>
    </div>
  );
}
