/** 1e18-scaled bigint -> number (safe for display sizes). */
export function fromWei(v: bigint | undefined, dp = 18): number {
  if (v === undefined) return 0;
  return Number(v) / 10 ** dp;
}

export function usd(n: number, dp = 2): string {
  if (!isFinite(n)) return "$0";
  if (n !== 0 && Math.abs(n) < 0.01) return "<$0.01";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export function num(n: number, dp = 2): string {
  if (!isFinite(n)) return "0";
  return n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export function compact(n: number): string {
  if (!isFinite(n)) return "0";
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
  if (a >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (a >= 1e3) return (n / 1e3).toFixed(1).replace(/\.?0+$/, "") + "K";
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function shortAddr(a?: string): string {
  return a ? a.slice(0, 6) + "…" + a.slice(-4) : "";
}

/** Human decimal string -> 1e18 bigint, without floating point drift. */
export function toWei(input: string, dp = 18): bigint {
  const s = (input || "0").trim();
  if (!s || isNaN(Number(s))) return 0n;
  const neg = s.startsWith("-");
  const [i, f = ""] = (neg ? s.slice(1) : s).split(".");
  const frac = (f + "0".repeat(dp)).slice(0, dp);
  const v = BigInt(i || "0") * 10n ** BigInt(dp) + BigInt(frac || "0");
  return neg ? -v : v;
}

/** Seconds -> "12d 04h 31m" */
export function countdown(secs: number): string {
  if (secs <= 0) return "已到期";
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (d > 0) return `${d}天 ${String(h).padStart(2, "0")}时 ${String(m).padStart(2, "0")}分`;
  const s = Math.floor(secs % 60);
  return `${String(h).padStart(2, "0")}时 ${String(m).padStart(2, "0")}分 ${String(s).padStart(2, "0")}秒`;
}
