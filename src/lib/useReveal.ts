import { useEffect } from "react";

/**
 * Reveals `.reveal` elements as they enter the viewport.
 * IntersectionObserver first, with a scroll/rect fallback — some embedded
 * webviews never fire IO, and without the fallback the whole page stays blank.
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.in)"));
    if (els.length === 0) return;
    const pending = new Set(els);
    let io: IntersectionObserver | null = null;

    const show = (el: HTMLElement) => {
      el.classList.add("in");
      pending.delete(el);
      io?.unobserve(el);
      if (pending.size === 0) cleanup();
    };

    const check = () => {
      const h = window.innerHeight || document.documentElement.clientHeight;
      for (const el of Array.from(pending)) {
        const r = el.getBoundingClientRect();
        if (r.top < h * 0.92 && r.bottom > 0) show(el);
      }
    };

    const cleanup = () => {
      io?.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      document.removeEventListener("visibilitychange", check);
      clearTimeout(t1);
      clearTimeout(t2);
    };

    // Embedded webviews / prerenderers run with visibilityState="hidden": rAF and
    // IntersectionObserver never fire and the page cannot scroll, so a reveal-on-scroll
    // effect would leave every section stuck at opacity 0 — a permanently blank page.
    // When we detect that, skip the animation entirely and just show the content.
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    try {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && show(e.target as HTMLElement)),
        { threshold: 0.1 }
      );
      els.forEach((el) => io!.observe(el));
    } catch {
      // IO unsupported — rect fallback carries it
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    document.addEventListener("visibilitychange", check);
    const t1 = setTimeout(check, 60);
    const t2 = setTimeout(check, 600);

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
