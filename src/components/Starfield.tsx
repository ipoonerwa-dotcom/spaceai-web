import { useEffect, useRef } from "react";

/** Drifting starfield with occasional shooting stars — the "deep space" bed. */
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Star = { x: number; y: number; z: number; r: number; tw: number };
    type Shot = { x: number; y: number; vx: number; vy: number; life: number };
    let stars: Star[] = [];
    let shots: Shot[] = [];

    const resize = () => {
      // clientWidth can still be 0 on the first effect pass (styles not applied yet);
      // fall back to the viewport so the canvas never ends up sized 0x0 and invisible.
      w = canvas.clientWidth || window.innerWidth || 0;
      h = canvas.clientHeight || window.innerHeight || 0;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(200, Math.floor((w * h) / 7000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.25 + 0.35,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    // re-measure once layout has settled, in case the first pass read 0
    const settle = setTimeout(resize, 120);
    window.addEventListener("resize", resize);

    const COLORS = ["255,255,255", "167,139,250", "34,211,238"];

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.tw += 0.015 * s.z;
        s.y += 0.045 * s.z; // slow drift downward
        if (s.y > h + 2) {
          s.y = -2;
          s.x = Math.random() * w;
        }
        const alpha = (0.35 + Math.sin(s.tw) * 0.3) * s.z;
        const c = COLORS[s.r > 1.3 ? 1 : s.r > 1.1 ? 2 : 0];
        ctx.fillStyle = `rgba(${c},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (shots.length < 2 && Math.random() < 0.004) {
        shots.push({ x: Math.random() * w * 0.7, y: Math.random() * h * 0.35, vx: 5 + Math.random() * 3, vy: 2 + Math.random() * 1.4, life: 1 });
      }
      shots = shots.filter((s) => s.life > 0);
      for (const s of shots) {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.012;
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 11, s.y - s.vy * 11);
        g.addColorStop(0, `rgba(190,220,255,${(s.life * 0.85).toFixed(3)})`);
        g.addColorStop(1, "rgba(190,220,255,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 11, s.y - s.vy * 11);
        ctx.stroke();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: -1, pointerEvents: "none" }}
      aria-hidden
    />
  );
}
