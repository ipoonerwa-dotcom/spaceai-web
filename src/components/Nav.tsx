import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import WalletButton from "./WalletButton";
import LangToggle from "./LangToggle";
import { useI18n } from "../lib/i18n";

const LINKS = [
  { href: "#vision", key: "nav.vision" },
  { href: "#modules", key: "nav.modules" },
  { href: "#economy", key: "nav.economy" },
  { href: "#roadmap", key: "nav.roadmap" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { t } = useI18n();
  const onLanding = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav className={`nav ${scrolled || open ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <img src="/brand/logo.jpg" alt="SPACEAI" />
          <span>SPACEAI</span>
        </Link>

        <div className="nav-links">
          {onLanding ? (
            LINKS.map((l) => <a key={l.href} href={l.href}>{t(l.key)}</a>)
          ) : (
            <>
              <Link to="/">{t("nav.home")}</Link>
              <Link to="/app">{t("nav.bank")}</Link>
            </>
          )}
        </div>

        <div className="nav-right">
          <LangToggle />
          <Link to="/app" className="btn btn-ghost btn-sm nav-cta">{t("nav.enter")}</Link>
          <WalletButton />
          <button className={`burger ${open ? "on" : ""}`} aria-label="menu" onClick={() => setOpen((v) => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`drawer ${open ? "open" : ""}`}>
        {onLanding
          ? LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{t(l.key)}</a>)
          : <Link to="/">{t("nav.home")}</Link>}
        <Link to="/app">{t("nav.enterFull")}</Link>
      </div>
    </nav>
  );
}
