import { Link } from "react-router-dom";
import { TOKEN_ADDRESS, EXPLORER, PANCAKE_BUY_URL } from "../lib/contracts";
import { useI18n } from "../lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
              <img src="/brand/logo.jpg" alt="SPACEAI" style={{ width: 36, height: 36, borderRadius: 10 }} />
              <span style={{ fontWeight: 800, fontSize: 17 }}>SPACEAI</span>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.75, maxWidth: 380 }}>
              {t("f.tagline")}
            </p>
            <p className="mini" style={{ marginTop: 16, wordBreak: "break-all" }}>
              {t("c.contract")} · {TOKEN_ADDRESS}
            </p>
          </div>

          <div>
            <h4>{t("f.protocol")}</h4>
            <a href="#vision">{t("nav.vision")}</a>
            <a href="#modules">{t("nav.modules")}</a>
            <a href="#economy">{t("nav.economy")}</a>
            <Link to="/app">{t("nav.bank")}</Link>
          </div>

          <div>
            <h4>{t("f.onchain")}</h4>
            <a href={`${EXPLORER}/token/${TOKEN_ADDRESS}`} target="_blank" rel="noopener noreferrer">BscScan</a>
            <a href={PANCAKE_BUY_URL} target="_blank" rel="noopener noreferrer">PancakeSwap</a>
            <a href={`https://dexscreener.com/bsc/${TOKEN_ADDRESS}`} target="_blank" rel="noopener noreferrer">DexScreener</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SPACEAI · {t("f.rights")}</span>
          <span>{t("f.risk")}</span>
        </div>
      </div>
    </footer>
  );
}
