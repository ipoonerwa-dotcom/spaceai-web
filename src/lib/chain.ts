import { createConfig, fallback, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// SPACEAI lives on BNB Smart Chain (56).
// Several endpoints behind a fallback: users on restricted networks (mainland China in
// particular) can find any single RPC slow or unreachable, and one dead endpoint should not
// take the whole console down. viem walks the list in order until one answers.
const RPCS = [
  "https://bsc-dataseed.bnbchain.org",
  "https://bsc-dataseed1.defibit.io",
  "https://bsc-dataseed1.ninicoin.io",
  "https://bsc-dataseed2.bnbchain.org",
  "https://binance.llamarpc.com",
];

export const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [injected()],
  transports: {
    [bsc.id]: fallback(
      RPCS.map((url) => http(url, { timeout: 8_000, retryCount: 1 })),
      { rank: false }
    ),
  },
  ssr: false,
});

export const CHAIN_ID = bsc.id;
