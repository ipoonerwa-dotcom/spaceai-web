import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useSearchParams } from "react-router-dom";
import { WalletModal } from "../components/WalletButton";
import { useI18n } from "../lib/i18n";
import { BANK_ABI, BANK_ADDRESS, ERC20_ABI, TOKEN_ADDRESS, TERMS, TOKEN_SYMBOL, maturityMultiple, PANCAKE_BUY_URL } from "../lib/contracts";
import { fromWei, usd, compact, toWei, countdown, shortAddr } from "../lib/format";

type Tab = "stake" | "positions" | "invite" | "team";

const ZERO = "0x0000000000000000000000000000000000000000";

/** wagmi results are `unknown | undefined`; these keep the call sites readable. */
const asBig = (v: unknown): bigint => (typeof v === "bigint" ? v : 0n);
const asStr = (v: unknown): string => (typeof v === "string" ? v : ZERO);
const asBool = (v: unknown): boolean => v === true;

export default function Console() {
  const { address, isConnected } = useAccount();
  const { t } = useI18n();
  const [params] = useSearchParams();
  const deployed = !!BANK_ADDRESS;

  // The team panel is intentionally not advertised in the tab bar; distributors reach it
  // with /app?tab=team so the referral tooling still works without putting the structure
  // in front of every visitor.
  const teamDeepLink = params.get("tab") === "team";
  const [tab, setTab] = useState<Tab>(teamDeepLink ? "team" : "stake");
  const [walletOpen, setWalletOpen] = useState(false);

  // First invite link wins. Once a referrer is captured it is never overwritten by a later
  // link, so someone who opens A's link and then B's still belongs to A — the relationship is
  // effectively settled the moment the first link is opened, and only written on-chain when
  // they stake.
  const refParam = params.get("ref");
  const [storedRef, setStoredRef] = useState<string | null>(
    () => (typeof localStorage !== "undefined" ? localStorage.getItem("spaceai_ref") : null)
  );
  useEffect(() => {
    if (!refParam || !/^0x[a-fA-F0-9]{40}$/.test(refParam)) return;
    const existing = localStorage.getItem("spaceai_ref");
    if (existing) return; // already claimed by whoever got here first
    localStorage.setItem("spaceai_ref", refParam);
    setStoredRef(refParam);
  }, [refParam]);

  if (!deployed) return <NotDeployed />;

  return (
    <div className="app-shell">
      <div className="wrap">
        <div className="kicker">{t("a.kicker")}</div>
        <h1 className="h-section" style={{ marginBottom: 26 }}>{t("a.title")}</h1>

        {!isConnected ? (
          <div className="card" style={{ textAlign: "center", padding: "56px 26px" }}>
            <div style={{ fontSize: 46, marginBottom: 14 }}>🛰️</div>
            <h3 style={{ fontSize: 21, fontWeight: 700, marginBottom: 8 }}>{t("a.connectTitle")}</h3>
            <p style={{ color: "var(--text-2)", fontSize: 14, maxWidth: 420, margin: "0 auto 22px" }}>{t("a.connectSub")}</p>
            <button className="btn btn-primary" onClick={() => setWalletOpen(true)}>{t("w.connect")}</button>
          </div>
        ) : (
          <>
            <div className="tabs">
              <button className={`tab ${tab === "stake" ? "on" : ""}`} onClick={() => setTab("stake")}>{t("a.tabStake")}</button>
              <button className={`tab ${tab === "positions" ? "on" : ""}`} onClick={() => setTab("positions")}>{t("a.tabPos")}</button>
              <button className={`tab ${tab === "invite" ? "on" : ""}`} onClick={() => setTab("invite")}>{t("a.tabRef")}</button>
              {teamDeepLink && (
                <button className={`tab ${tab === "team" ? "on" : ""}`} onClick={() => setTab("team")}>Team</button>
              )}
            </div>
            {tab === "stake" && <StakeTab address={address!} storedRef={storedRef} />}
            {tab === "positions" && <PositionsTab address={address!} />}
            {tab === "invite" && <InviteTab address={address!} />}
            {tab === "team" && <TeamTab address={address!} />}
          </>
        )}
      </div>
      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}
    </div>
  );
}

/* ---------------------------------------------------------------- */

function NotDeployed() {
  const { t } = useI18n();
  return (
    <div className="app-shell">
      <div className="wrap" style={{ maxWidth: 700 }}>
        <div className="kicker">{t("a.kicker")}</div>
        <h1 className="h-section">{t("a.soonTitle")}</h1>
        <div className="card" style={{ marginTop: 20 }}>
          <p style={{ color: "var(--text-2)", fontSize: 14.5, lineHeight: 1.8 }}>{t("a.soonBody")}</p>
          <div className="divider" />
          <div className="kv"><span>{t("a.status")}</span><b style={{ color: "var(--amber)" }}>{t("a.statusV")}</b></div>
          <div className="kv"><span>{t("a.network")}</span><b>BNB Smart Chain</b></div>
          <div className="kv"><span>{t("a.cond")}</span><b>{t("a.condV")}</b></div>
          <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href={PANCAKE_BUY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">{t("c.buy")}</a>
            <a href="/" className="btn btn-ghost">{t("a.back")}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function StakeTab({ address, storedRef }: { address: string; storedRef: string | null }) {
  const { t } = useI18n();
  const [term, setTerm] = useState<number>(90);
  const [amount, setAmount] = useState("");
  const [refInput, setRefInput] = useState(storedRef ?? "");
  const [msg, setMsg] = useState<{ k: "ok" | "err"; t: string } | null>(null);

  const bank = { address: BANK_ADDRESS as `0x${string}`, abi: BANK_ABI as never };
  const token = { address: TOKEN_ADDRESS as `0x${string}`, abi: ERC20_ABI };

  const { data: reads, refetch } = useReadContracts({
    contracts: [
      { ...token, functionName: "balanceOf", args: [address as `0x${string}`] },
      { ...token, functionName: "allowance", args: [address as `0x${string}`, BANK_ADDRESS as `0x${string}`] },
      // the deposit is priced with stakePriceUsd (min of quote and spot), so preview with the
      // same number the contract will actually use
      { ...bank, functionName: "stakePriceUsd" },
      { ...bank, functionName: "referrerOf", args: [address as `0x${string}`] },
      { ...bank, functionName: "paused" },
    ],
  });

  const balance = asBig(reads?.[0]?.result);
  const allowance = asBig(reads?.[1]?.result);
  const price = asBig(reads?.[2]?.result);
  const boundRef = asStr(reads?.[3]?.result);
  const paused = asBool(reads?.[4]?.result);

  const amountWei = toWei(amount);
  const needsApprove = amountWei > 0n && allowance < amountWei;
  const usdValue = price > 0n ? (Number(amountWei) / 1e18) * (Number(price) / 1e18) : 0;
  const chosen = TERMS.find((x) => x.days === term)!;

  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isLoading: waiting } = useWaitForTransactionReceipt({ hash: txHash });
  const busy = isPending || waiting;

  const doApprove = async () => {
    setMsg(null);
    try {
      const h = await writeContractAsync({ ...token, functionName: "approve", args: [BANK_ADDRESS as `0x${string}`, 2n ** 256n - 1n] });
      setTxHash(h);
      setMsg({ k: "ok", t: t("a.okApprove") });
      setTimeout(() => refetch(), 4000);
    } catch (e) { setMsg({ k: "err", t: errText(e, t) }); }
  };

  const doStake = async () => {
    setMsg(null);
    if (amountWei <= 0n) return setMsg({ k: "err", t: t("a.errAmount") });
    if (amountWei > balance) return setMsg({ k: "err", t: t("a.errBalance") });
    // a captured invite link always wins over the manual field (which only appears when
    // there is no captured referrer at all); if already bound on-chain, send zero
    const candidate = storedRef || refInput;
    const ref = boundRef !== ZERO ? ZERO : (/^0x[a-fA-F0-9]{40}$/.test(candidate) ? candidate : ZERO);
    try {
      const h = await writeContractAsync({ ...bank, functionName: "stake", args: [term, amountWei, ref as `0x${string}`] });
      setTxHash(h);
      setMsg({ k: "ok", t: t("a.okStake") });
      setAmount("");
      setTimeout(() => refetch(), 5000);
    } catch (e) { setMsg({ k: "err", t: errText(e, t) }); }
  };

  return (
    <div className="grid grid-2" style={{ alignItems: "start", gap: 20 }}>
      <div className="card">
        <div className="kicker" style={{ marginBottom: 16 }}>{t("a.newPos")}</div>

        {paused && <div className="notice warn" style={{ marginBottom: 18 }}>{t("a.paused")}</div>}

        <div className="field" style={{ marginBottom: 10 }}><label>{t("a.pickTerm")}</label></div>
        <div className="term-grid" style={{ marginBottom: 20 }}>
          {TERMS.map((x) => (
            <button key={x.days} className={`term ${term === x.days ? "on" : ""}`} onClick={() => setTerm(x.days)}>
              <div className="term-days">{x.days}</div>
              <div className="term-rate">{x.rate}</div>
              <div className="term-note">{t("e.daily")}</div>
            </button>
          ))}
        </div>

        <div className="field" style={{ marginBottom: 8 }}>
          <label>{t("a.amount")} · {TOKEN_SYMBOL}</label>
          <input className="input" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--text-3)", marginBottom: 18 }}>
          <span>{t("a.balance")} {compact(fromWei(balance))}</span>
          <button style={{ color: "var(--violet-2)", fontFamily: "var(--mono)", fontSize: 12 }} onClick={() => setAmount(String(fromWei(balance)))}>
            {t("a.max")}
          </button>
        </div>

        {/* Already bound on-chain, or claimed by the first invite link -> show it locked.
            Only someone with no referrer at all gets a field to type one in. */}
        {boundRef !== ZERO ? (
          <div className="ref-locked">
            <span className="mini">{t("a.refLocked")}</span>
            <b>{shortAddr(boundRef)}</b>
            <span className="ref-note">{t("a.refOnchain")}</span>
          </div>
        ) : storedRef ? (
          <div className="ref-locked">
            <span className="mini">{t("a.refLocked")}</span>
            <b>{shortAddr(storedRef)}</b>
            <span className="ref-note">{t("a.refPending")}</span>
          </div>
        ) : (
          <div className="field" style={{ marginBottom: 18 }}>
            <label>{t("a.refInput")}</label>
            <input className="input" placeholder="0x…" value={refInput} onChange={(e) => setRefInput(e.target.value)} />
          </div>
        )}

        <div className="divider" />
        <div className="kv"><span>{t("a.lockedUsd")}</span><b>{usd(usdValue)}</b></div>
        <div className="kv"><span>{t("a.dailyRate")}</span><b>{chosen.rate}</b></div>
        <div className="kv"><span>{t("a.unlock")}</span><b>{term} {t("a.unlockV")}</b></div>

        <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
          {needsApprove ? (
            <button className="btn btn-primary btn-block" onClick={doApprove} disabled={busy}>
              {busy ? <span className="spinner" /> : null} {t("a.approve")} {TOKEN_SYMBOL}
            </button>
          ) : (
            <button className="btn btn-primary btn-block" onClick={doStake} disabled={busy || paused || amountWei <= 0n}>
              {busy ? <span className="spinner" /> : null} {t("a.confirmStake")}
            </button>
          )}
        </div>
        {msg && <div className={`notice ${msg.k === "err" ? "bad" : ""}`} style={{ marginTop: 14 }}>{msg.t}</div>}
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <div className="card">
          <div className="kicker" style={{ marginBottom: 14 }}>{t("a.gsTitle")}</div>
          <p style={{ fontSize: 13.8, color: "var(--text-2)", lineHeight: 1.8 }}>{t("a.gsBody")}</p>
          <div className="divider" />
          <div className="kv"><span>{t("a.curQuote")}</span><b>{price > 0n ? "$" + (Number(price) / 1e18).toFixed(10) : "—"}</b></div>
          <div className="kv"><span>{t("a.network")}</span><b>BNB Smart Chain</b></div>
        </div>

        <div className="card">
          <div className="kicker" style={{ marginBottom: 14 }}>{t("a.notes")}</div>
          {["a.n1", "a.n2", "a.n3"].map((k) => (
            <p key={k} style={{ fontSize: 13.2, color: "var(--text-2)", lineHeight: 1.7, paddingLeft: 16, position: "relative", marginBottom: 9 }}>
              <span style={{ position: "absolute", left: 0, top: 8, width: 5, height: 5, borderRadius: "50%", background: "var(--grad)" }} />
              {t(k)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function PositionsTab({ address }: { address: string }) {
  const { t } = useI18n();
  const bank = { address: BANK_ADDRESS as `0x${string}`, abi: BANK_ABI as never };
  const { data: lenRaw, refetch: refetchLen } = useReadContract({ ...bank, functionName: "stakesLength", args: [address as `0x${string}`] });
  const len = Number(asBig(lenRaw));
  // payouts convert USD -> tokens at payoutPriceUsd (max of quote and spot)
  const { data: price } = useReadContract({ ...bank, functionName: "payoutPriceUsd" });

  const idxs = useMemo(() => Array.from({ length: len }, (_, i) => i), [len]);
  const { data: rows, refetch } = useReadContracts({
    contracts: idxs.flatMap((i) => [
      { ...bank, functionName: "stakesOf", args: [address as `0x${string}`, BigInt(i)] },
      { ...bank, functionName: "pendingInterestUsd", args: [address as `0x${string}`, BigInt(i)] },
      { ...bank, functionName: "releasablePrincipalUsd", args: [address as `0x${string}`, BigInt(i)] },
    ]),
    query: { enabled: len > 0 },
  });

  if (len === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "50px 24px" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌌</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{t("a.noPos")}</h3>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>{t("a.noPosSub")}</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {idxs.map((i) => (
        <Position
          key={i}
          id={i}
          address={address}
          raw={rows?.[i * 3]?.result as never}
          pendingUsd={asBig(rows?.[i * 3 + 1]?.result)}
          releasableUsd={asBig(rows?.[i * 3 + 2]?.result)}
          price={asBig(price)}
          onDone={() => { refetch(); refetchLen(); }}
        />
      ))}
    </div>
  );
}

function Position({
  id, address, raw, pendingUsd, releasableUsd, price, onDone,
}: {
  id: number; address: string;
  raw: readonly [bigint, bigint, bigint, bigint, number, number, boolean] | undefined;
  pendingUsd: bigint; releasableUsd: bigint; price: bigint; onDone: () => void;
}) {
  const { t } = useI18n();
  const [partial, setPartial] = useState("");
  const [msg, setMsg] = useState<{ k: "ok" | "err"; t: string } | null>(null);
  const bank = { address: BANK_ADDRESS as `0x${string}`, abi: BANK_ABI as never };
  const { writeContractAsync, isPending } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const { isLoading: waiting } = useWaitForTransactionReceipt({ hash });
  const busy = isPending || waiting;

  // net-of-fee preview, so the amount shown is what actually lands in the wallet
  const claimTarget = partial && toWei(partial) > 0n ? toWei(partial) : pendingUsd;
  const { data: feeUsdRaw } = useReadContract({
    ...bank, functionName: "feeUsdFor", args: [address as `0x${string}`, claimTarget],
    query: { enabled: claimTarget > 0n },
  });
  const feeUsd = asBig(feeUsdRaw);

  if (!raw) return <div className="card">{t("a.loading")}</div>;

  const principalUsd = raw[0];
  const start = Number(raw[3]);
  const termDays = Number(raw[4]);
  const redeemed = raw[6];

  const matureAt = start + termDays * 86400;
  const left = matureAt - Math.floor(Date.now() / 1000);
  const matured = left <= 0;
  const toTokens = (u: bigint) => (price > 0n ? Number(u) / Number(price) : 0);

  const claim = async (amountUsd: bigint) => {
    setMsg(null);
    try {
      const h = await writeContractAsync({ ...bank, functionName: "claimInterest", args: [BigInt(id), amountUsd] });
      setHash(h);
      setMsg({ k: "ok", t: t("a.okClaim") });
      setPartial("");
      setTimeout(onDone, 5000);
    } catch (e) { setMsg({ k: "err", t: errText(e, t) }); }
  };

  const redeem = async () => {
    setMsg(null);
    try {
      const h = await writeContractAsync({ ...bank, functionName: "redeemPrincipal", args: [BigInt(id)] });
      setHash(h);
      setMsg({ k: "ok", t: t("a.okRedeem") });
      setTimeout(onDone, 5000);
    } catch (e) { setMsg({ k: "err", t: errText(e, t) }); }
  };

  return (
    <div className="card">
      <div className="pos-head">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="mod-tag">#{id + 1}</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{termDays}{t("a.posTerm")}</span>
          <span className={`badge ${matured ? "done" : "live"}`}>
            {redeemed ? t("a.stRedeemed") : matured ? t("a.stMature") : t("a.stLive")}
          </span>
        </div>
        <span className="mini">{matured ? t("a.canRedeem") : `${t("a.untilUnlock")} ${countdown(left)}`}</span>
      </div>

      <div className="grid grid-3" style={{ gap: 12, marginBottom: 16 }}>
        <Metric label={t("a.mPrincipal")} value={usd(fromWei(principalUsd))} />
        <Metric label={t("a.mInterest")} value={usd(fromWei(pendingUsd))} accent />
        <Metric label={t("a.mTokens")} value={compact(toTokens(pendingUsd > feeUsd ? pendingUsd - feeUsd : 0n))} sub={TOKEN_SYMBOL} />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn btn-primary btn-sm" disabled={busy || pendingUsd === 0n} onClick={() => claim(0n)}>
          {busy ? <span className="spinner" /> : null} {t("a.claimAll")}
        </button>
        <input
          className="input" style={{ width: 150, padding: "10px 13px", fontSize: 13.5 }}
          placeholder={t("a.partialPh")} inputMode="decimal" value={partial} onChange={(e) => setPartial(e.target.value)}
        />
        <button className="btn btn-ghost btn-sm" disabled={busy || !partial || toWei(partial) <= 0n} onClick={() => claim(toWei(partial))}>
          {t("a.claimSome")}
        </button>
        {matured && !redeemed && (
          <button className="btn btn-primary btn-sm" disabled={busy || releasableUsd === 0n} onClick={redeem} style={{ marginLeft: "auto" }}>
            {t("a.redeem")} {usd(fromWei(releasableUsd))}
          </button>
        )}
      </div>

      {msg && <div className={`notice ${msg.k === "err" ? "bad" : ""}`} style={{ marginTop: 13 }}>{msg.t}</div>}
    </div>
  );
}

function Metric({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="pos">
      <div className="mini" style={{ marginBottom: 6 }}>{label}</div>
      <div className={accent ? "grad-text" : ""} style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--mono)" }}>{value}</div>
      {sub && <div className="mini" style={{ marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- */

/**
 * Invite panel: the user's own link plus their own numbers. Deliberately shows account data
 * only — the level thresholds and differential percentages stay out of the public UI.
 */
function InviteTab({ address }: { address: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const bank = { address: BANK_ADDRESS as `0x${string}`, abi: BANK_ABI as never };

  const { data } = useReadContracts({
    contracts: [
      { ...bank, functionName: "levelOf", args: [address as `0x${string}`] },
      { ...bank, functionName: "teamVolumeUsd", args: [address as `0x${string}`] },
      { ...bank, functionName: "directCount", args: [address as `0x${string}`] },
      { ...bank, functionName: "directVolumeUsd", args: [address as `0x${string}`] },
      { ...bank, functionName: "referrerOf", args: [address as `0x${string}`] },
      { ...bank, functionName: "stakesLength", args: [address as `0x${string}`] },
    ],
  });

  const lvl = data?.[0]?.result as readonly [bigint, bigint] | undefined;
  const teamVol = asBig(data?.[1]?.result);
  const dCount = asBig(data?.[2]?.result);
  const dVol = asBig(data?.[3]?.result);
  const upline = asStr(data?.[4]?.result);
  const stakeCount = Number(asBig(data?.[5]?.result));

  // the user's own staked principal = sum of every position's locked USD
  const { data: myStakes } = useReadContracts({
    contracts: Array.from({ length: stakeCount }, (_, i) => ({
      ...bank, functionName: "stakesOf", args: [address as `0x${string}`, BigInt(i)],
    })),
    query: { enabled: stakeCount > 0 },
  });
  const myStakeUsd = (myStakes ?? []).reduce((sum, r) => {
    const row = r?.result as readonly [bigint, ...unknown[]] | undefined;
    return sum + (row ? row[0] : 0n);
  }, 0n);

  const link = `${window.location.origin}/app?ref=${address}`;

  const copy = () => {
    navigator.clipboard?.writeText(link)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })
      .catch(() => {});
  };

  const share = () => {
    // native share sheet where available (mobile / in-wallet browsers), clipboard otherwise
    const nav = navigator as Navigator & { share?: (d: { title: string; text: string; url: string }) => Promise<void> };
    if (nav.share) {
      nav.share({ title: "SPACEAI", text: t("a.refBody"), url: link }).catch(() => {});
    } else {
      copy();
    }
  };

  const lvNum = lvl ? Number(lvl[0]) : 0;
  const levelLabel = lvNum > 0 ? `${t(`lv.${lvNum}`)} · ${Number(lvl![1]) / 100}%` : t("lv.0");

  return (
    <div className="invite-grid">
      <div className="card">
        <div className="kicker" style={{ marginBottom: 14 }}>{t("a.refTitle")}</div>
        <p style={{ fontSize: 13.8, color: "var(--text-2)", lineHeight: 1.8, marginBottom: 18 }}>
          {t("a.refBody")}
        </p>
        <div className="copy-row">
          <input className="input" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          <button className="btn btn-primary btn-sm" onClick={copy}>{copied ? t("a.refCopied") : t("a.refCopy")}</button>
          <button className="btn btn-ghost btn-sm" onClick={share}>↗</button>
        </div>
      </div>

      <div className="invite-stats">
        <StatBox label={t("a.refLevel")} value={levelLabel} accent />
        <StatBox label={t("a.refTeam")} value={usd(fromWei(teamVol))} />
        <StatBox label={t("a.refDirects")} value={String(dCount)} />
        <StatBox label={t("a.refDirectVol")} value={usd(fromWei(dVol))} />
        <StatBox label={t("a.refMyStake")} value={usd(fromWei(myStakeUsd))} />
        <StatBox label={t("a.refMine")} value={upline === ZERO ? t("a.refNone") : shortAddr(upline)} small />
      </div>
    </div>
  );
}

function StatBox({ label, value, accent, small }: { label: string; value: string; accent?: boolean; small?: boolean }) {
  return (
    <div className="pos">
      <div className="mini" style={{ marginBottom: 7 }}>{label}</div>
      <div
        className={accent ? "grad-text" : ""}
        style={{ fontSize: small ? 15 : 21, fontWeight: 800, fontFamily: "var(--mono)" }}
      >
        {value}
      </div>
    </div>
  );
}

/** Reached only via /app?tab=team — kept out of the public tab bar on purpose. */
function TeamTab({ address }: { address: string }) {
  const { t } = useI18n();
  const bank = { address: BANK_ADDRESS as `0x${string}`, abi: BANK_ABI as never };
  const [copied, setCopied] = useState(false);

  const { data } = useReadContracts({
    contracts: [
      { ...bank, functionName: "levelOf", args: [address as `0x${string}`] },
      { ...bank, functionName: "teamVolumeUsd", args: [address as `0x${string}`] },
      { ...bank, functionName: "smallAreaUsd", args: [address as `0x${string}`] },
      { ...bank, functionName: "maxLegUsd", args: [address as `0x${string}`] },
      { ...bank, functionName: "referrerOf", args: [address as `0x${string}`] },
    ],
  });

  const lvl = data?.[0]?.result as readonly [bigint, bigint] | undefined;
  const teamVol = asBig(data?.[1]?.result);
  const small = asBig(data?.[2]?.result);
  const maxLeg = asBig(data?.[3]?.result);
  const myRef = asStr(data?.[4]?.result);

  const link = `${window.location.origin}/app?ref=${address}`;
  const copy = () => {
    navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }).catch(() => {});
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="stats">
        <div className="stat">
          <div className="stat-num grad-text" style={{ fontSize: 22 }}>
            {lvl && Number(lvl[0]) > 0 ? `V${lvl[0]} ${t(`lv.${Number(lvl[0])}`)}` : "—"}
          </div>
          <div className="stat-label">Level</div>
        </div>
        <div className="stat">
          <div className="stat-num">{usd(fromWei(teamVol), 0)}</div>
          <div className="stat-label">Team volume</div>
        </div>
        <div className="stat">
          <div className="stat-num">{usd(fromWei(small), 0)}</div>
          <div className="stat-label">Small area</div>
        </div>
        <div className="stat">
          <div className="stat-num">{usd(fromWei(maxLeg), 0)}</div>
          <div className="stat-label">Max leg</div>
        </div>
      </div>

      <div className="card">
        <div className="kicker" style={{ marginBottom: 14 }}>REFERRAL LINK</div>
        <div className="copy-row">
          <input className="input" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          <button className="btn btn-primary btn-sm" onClick={copy}>{copied ? "✓" : "Copy"}</button>
        </div>
        <div className="divider" />
        <div className="kv"><span>Upline</span><b>{myRef === ZERO ? "—" : shortAddr(myRef)}</b></div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function errText(e: unknown, t: (k: string) => string): string {
  const m = (e as { shortMessage?: string; message?: string })?.shortMessage || (e as Error)?.message || String(e);
  if (/rejected|denied|User denied/i.test(m)) return t("a.errCancel");
  if (/insufficient funds/i.test(m)) return t("a.errGas");
  if (/stale price/i.test(m)) return t("a.errStale");
  if (/locked/i.test(m)) return t("a.errLocked");
  if (/paused/i.test(m)) return t("a.errPaused");
  return m.slice(0, 150);
}

void maturityMultiple;
