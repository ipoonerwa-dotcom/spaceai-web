import { useEffect, useRef, useState } from "react";
import { useI18n, LANGS } from "../lib/i18n";

export default function LangToggle() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const cur = LANGS.find((l) => l.code === lang)!;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="lang-btn" onClick={() => setOpen((v) => !v)} aria-label="language">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
        </svg>
        {cur.short}
      </button>
      {open && (
        <div className="lang-menu">
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={`lang-item ${l.code === lang ? "on" : ""}`}
              onClick={() => { setLang(l.code); setOpen(false); }}
            >
              {l.label}
              {l.code === lang && <span style={{ marginLeft: "auto" }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
