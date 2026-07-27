import { createConfig, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// SPACEAI lives on BNB Smart Chain (56).
export const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [injected()],
  transports: { [bsc.id]: http("https://bsc-dataseed.bnbchain.org") },
  ssr: false,
});

export const CHAIN_ID = bsc.id;
