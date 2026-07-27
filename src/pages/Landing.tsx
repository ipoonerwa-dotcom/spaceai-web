import { Link } from "react-router-dom";
import { useReveal } from "../lib/useReveal";
import { useI18n } from "../lib/i18n";
import { TERMS, maturityMultiple, PANCAKE_BUY_URL, TOKEN_ADDRESS, EXPLORER } from "../lib/contracts";

const MODULE_KEYS = ["1", "2", "3", "4", "5"] as const;
const MODULE_TAGS = ["GSA", "CPA", "TLK", "ORC", "TRV"] as const;
const GUARDS = ["1", "2", "3", "4"] as const;
const PHASES = ["1", "2", "3", "4"] as const;

export default function Landing() {
  const { t, lang } = useI18n();
  useReveal([lang]);

  const marquee = ["m.1", "m.2", "m.3", "m.4", "m.5", "m.6"].map((k) => t(k));

  return (
    <>
      {/* ============ HERO ============ */}
      <header className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <span className="chip" style={{ marginBottom: 26 }}>
                <span className="dot" />
                {t("h.chip")}
              </span>
              <h1 className="h-display">
                {t("h.title1")}
                <br />
                <span className="grad-text">{t("h.title2")}</span>
              </h1>
              <p className="hero-sub">{t("h.sub")}</p>
              <div className="hero-cta">
                <Link to="/app" className="btn btn-primary">
                  {t("h.cta1")}
                  <span style={{ fontSize: 17, lineHeight: 1 }}>→</span>
                </Link>
                <a href="#modules" className="btn btn-ghost">{t("h.cta2")}</a>
              </div>
              <p className="hero-note">{t("h.note")}</p>
            </div>

            <div className="hero-art">
              <div className="orbit orbit-1" />
              <div className="orbit orbit-2" />
              <img src="/brand/logo.jpg" alt="SPACEAI" />
            </div>
          </div>
        </div>
      </header>

      <div className="marquee">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} style={{ display: "flex", gap: 42 }}>
              {marquee.map((m, j) => <span key={j}>◆ {m}</span>)}
            </span>
          ))}
        </div>
      </div>

      {/* ============ VISION ============ */}
      <section className="section" id="vision">
        <div className="wrap">
          <div className="kicker reveal">{t("v.kicker")}</div>
          <h2 className="h-section reveal">
            {t("v.title1")}<span className="grad-text">{t("v.title2")}</span>
          </h2>
          <p className="lead reveal reveal-d1" style={{ marginBottom: 46 }}>{t("v.lead")}</p>

          <div className="grid grid-4">
            {["1", "2", "3", "4"].map((n, i) => (
              <div key={n} className={`card card-hover card-lit reveal reveal-d${i + 1}`}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{t(`v.c${n}t`)}</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>{t(`v.c${n}d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MODULES ============ */}
      <section
        className="section"
        id="modules"
        style={{ background: "linear-gradient(180deg, transparent, rgba(10,7,32,0.55) 18%, rgba(10,7,32,0.55) 82%, transparent)" }}
      >
        <div className="wrap">
          <div className="kicker reveal">{t("mo.kicker")}</div>
          <h2 className="h-section reveal">
            {t("mo.title1")}<span className="grad-text">{t("mo.title2")}</span>
          </h2>
          <p className="lead reveal reveal-d1" style={{ marginBottom: 46 }}>{t("mo.lead")}</p>

          <div className="grid grid-3">
            {MODULE_KEYS.map((n, i) => (
              <div key={n} className={`card card-hover card-lit mod reveal reveal-d${(i % 3) + 1}`}>
                <span className="mod-tag">{MODULE_TAGS[i]}</span>
                <h3>{t(`mo.${n}t`)}</h3>
                <p>{t(`mo.${n}d`)}</p>
                <ul>
                  {["p1", "p2", "p3"].map((p) => <li key={p}>{t(`mo.${n}${p}`)}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ECONOMY ============ */}
      <section className="section" id="economy">
        <div className="wrap">
          <div className="kicker reveal">{t("e.kicker")}</div>
          <h2 className="h-section reveal">
            {t("e.title1")}<span className="grad-text">{t("e.title2")}</span>
          </h2>
          <p className="lead reveal reveal-d1" style={{ marginBottom: 40 }}>{t("e.lead")}</p>

          <div className="grid grid-3 reveal" style={{ marginBottom: 40 }}>
            {TERMS.map((term) => (
              <div key={term.days} className="card card-hover card-lit" style={{ textAlign: "center" }}>
                <div className="mini" style={{ letterSpacing: "0.18em" }}>TERM</div>
                <div style={{ fontSize: 42, fontWeight: 800, fontFamily: "var(--mono)", margin: "8px 0 2px" }}>{term.days}</div>
                <div style={{ fontSize: 13, color: "var(--text-3)" }}>{t("e.term")}</div>
                <div className="divider" />
                <div style={{ fontSize: 28, fontWeight: 800 }} className="grad-text">{term.rate}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 4 }}>{t("e.daily")}</div>
              </div>
            ))}
          </div>

          <div className="card reveal reveal-d1">
            <div className="kicker" style={{ marginBottom: 12 }}>{t("e.oracleTitle")}</div>
            <p style={{ fontSize: 13.8, color: "var(--text-2)", marginBottom: 18, lineHeight: 1.75, maxWidth: 760 }}>
              {t("e.oracleLead")}
            </p>
            <div className="grid grid-2" style={{ gap: "0 40px" }}>
              {GUARDS.map((g) => (
                <div className="kv" key={g}>
                  <span>{t(`e.g${g}k`)}</span>
                  <b style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", textAlign: "right" }}>{t(`e.g${g}v`)}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ ROADMAP ============ */}
      <section
        className="section"
        id="roadmap"
        style={{ background: "linear-gradient(180deg, transparent, rgba(10,7,32,0.55) 18%, rgba(10,7,32,0.55) 82%, transparent)" }}
      >
        <div className="wrap">
          <div className="kicker reveal">{t("r.kicker")}</div>
          <h2 className="h-section reveal">
            {t("r.title1")}<span className="grad-text">{t("r.title2")}</span>
          </h2>
          <p className="lead reveal reveal-d1" style={{ marginBottom: 44 }}>{t("r.lead")}</p>

          <div className="steps">
            {PHASES.map((p, i) => (
              <div key={p} className={`card card-hover card-lit reveal reveal-d${i + 1}`}>
                <div className="step-idx">PHASE 0{p}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{t(`r.p${p}t`)}</h3>
                <p style={{ fontSize: 13.6, color: "var(--text-2)", lineHeight: 1.72 }}>{t(`r.p${p}d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="section" style={{ textAlign: "center" }}>
        <div className="wrap">
          <div className="kicker reveal" style={{ justifyContent: "center" }}>LAUNCH</div>
          <h2 className="h-display reveal" style={{ fontSize: "clamp(30px, 4.6vw, 54px)", marginBottom: 20 }}>
            {t("c.title1")}<span className="grad-text">{t("c.title2")}</span>
          </h2>
          <p className="lead reveal reveal-d1" style={{ margin: "0 auto 36px" }}>{t("c.lead")}</p>
          <div className="hero-cta reveal reveal-d2" style={{ justifyContent: "center" }}>
            <Link to="/app" className="btn btn-primary" style={{ padding: "16px 38px", fontSize: 16 }}>
              {t("h.cta1")} →
            </Link>
            <a href={PANCAKE_BUY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: "16px 30px" }}>
              {t("c.buy")}
            </a>
          </div>
          <p className="mini reveal reveal-d3" style={{ marginTop: 24, wordBreak: "break-all" }}>
            {t("c.contract")} ·{" "}
            <a href={`${EXPLORER}/token/${TOKEN_ADDRESS}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--violet-2)" }}>
              {TOKEN_ADDRESS}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}

// maturityMultiple stays available for the console; not shown on the landing page.
void maturityMultiple;
