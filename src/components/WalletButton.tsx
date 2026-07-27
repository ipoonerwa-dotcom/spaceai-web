import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { shortAddr } from "../lib/format";
import { CHAIN_ID } from "../lib/chain";
import { useI18n } from "../lib/i18n";

export function WalletModal({ onClose }: { onClose: () => void }) {
  const { connectors, connect, isPending, error } = useConnect();
  const { t } = useI18n();

  // EIP-6963 surfaces every installed wallet; collapse duplicates by name
  const seen = new Set<string>();
  const list = connectors.filter((c) => (seen.has(c.name) ? false : (seen.add(c.name), true)));

  return (
    <div className="mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{t("w.title")}</h3>
        <p style={{ color: "var(--text-2)", fontSize: 13.5, marginBottom: 6 }}>{t("w.sub")}</p>
        <p className="mini" style={{ marginBottom: 20 }}>{t("w.network")}</p>

        {list.map((c) => (
          <button key={c.uid} className="wallet-opt" disabled={isPending} onClick={() => connect({ connector: c }, { onSuccess: onClose })}>
            {c.icon ? <img src={c.icon} alt="" width={26} height={26} style={{ borderRadius: 8 }} /> : <span style={{ fontSize: 21 }}>🛰️</span>}
            {c.name === "Injected" ? t("w.browser") : c.name}
            <span className="sub">{isPending ? t("w.connecting") : t("w.doConnect")}</span>
          </button>
        ))}

        {list.length === 0 && <p className="notice warn">{t("w.none")}</p>}
        {error && (
          <p className="notice bad" style={{ marginTop: 10 }}>
            {/rejected|denied/i.test(error.message) ? t("w.cancelled") : error.message.slice(0, 130)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  if (isConnected && address) {
    if (chainId !== CHAIN_ID) {
      return (
        <button className="btn btn-primary btn-sm" onClick={() => switchChain({ chainId: CHAIN_ID })}>
          {t("w.switch")}
        </button>
      );
    }
    return (
      <div style={{ position: "relative" }}>
        <button className="addr-pill" onClick={() => setMenu((v) => !v)}>
          <span className="dot" />
          {shortAddr(address)}
        </button>
        {menu && (
          <div
            style={{
              position: "absolute", right: 0, top: "calc(100% + 10px)", minWidth: 190, zIndex: 250,
              background: "var(--card-solid)", border: "1px solid var(--line-2)", borderRadius: 14,
              padding: 7, boxShadow: "var(--shadow-2)",
            }}
          >
            <button
              className="tab" style={{ width: "100%", textAlign: "left" }}
              onClick={() => { navigator.clipboard?.writeText(address).catch(() => {}); setMenu(false); }}
            >
              {t("w.copy")}
            </button>
            <button
              className="tab" style={{ width: "100%", textAlign: "left", color: "var(--down)" }}
              onClick={() => { setMenu(false); disconnect(); }}
            >
              {t("w.disconnect")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>{t("w.connect")}</button>
      {open && <WalletModal onClose={() => setOpen(false)} />}
    </>
  );
}
