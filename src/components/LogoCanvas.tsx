import { useEffect, useRef } from "react";
import type { LogoSpec } from "@/lib/logos";
import { drawLogo, ensureFonts } from "@/lib/render";

export function LogoCanvas({ spec, px = 640, circle = false }: { spec: LogoSpec; px?: number; circle?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let alive = true;
    ensureFonts(spec).then(() => {
      const ctx = ref.current?.getContext("2d");
      if (alive && ctx) drawLogo(ctx, spec, px);
    });
    return () => { alive = false; };
  }, [spec, px]);
  return (
    <div className={`checker relative aspect-square w-full overflow-hidden ${circle ? "rounded-full ring-1 ring-border" : "rounded-lg"}`}>
      <canvas ref={ref} width={px} height={px} className="h-full w-full" aria-label={`${spec.name} logo preview`} />
    </div>
  );
}
