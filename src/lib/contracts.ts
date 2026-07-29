import bankAbiJson from "./bankAbi.json";

/** SPACEAI token (BSC mainnet). */
export const TOKEN_ADDRESS = "0x70206b263AF3b714d3455eC2c6f790cd82D9AAAA" as const;

/**
 * SpaceAIBank on BSC mainnet, verified on BscScan.
 * The address is public (it is baked into the client bundle either way), so it ships as the
 * default — that way a forgotten env var on the host can't silently leave the console stuck
 * in "coming soon". VITE_BANK_ADDRESS still overrides it for staging/testing.
 */
export const BANK_ADDRESS = (import.meta.env.VITE_BANK_ADDRESS ||
  "0x9AEC8B131141a74c973Fb9972a6A99D7e29270F6") as `0x${string}`;

export const PANCAKE_BUY_URL = `https://pancakeswap.finance/swap?outputCurrency=${TOKEN_ADDRESS}`;
export const EXPLORER = "https://bscscan.com";
export const TOKEN_DECIMALS = 18;
export const TOKEN_SYMBOL = "SPACEAI";

export const BANK_ABI = bankAbiJson;

export const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "o", type: "address" }, { name: "s", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "s", type: "address" }, { name: "v", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const;

/** Staking terms mirrored from the contract defaults (rateForTerm). */
export const TERMS = [
  { days: 90, dailyBps: 100, label: "90 天", rate: "1.0%" },
  { days: 180, dailyBps: 150, label: "180 天", rate: "1.5%" },
  { days: 360, dailyBps: 200, label: "360 天", rate: "2.0%" },
] as const;

/** Compound multiple at maturity: (1 + r)^days */
export function maturityMultiple(dailyBps: number, days: number): number {
  return Math.pow(1 + dailyBps / 10000, days);
}
