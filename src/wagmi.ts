import { passkeyConnector } from '@zerodev/wallet'
import { sepolia, mainnet } from 'viem/chains';
import { http, createConfig } from 'wagmi'
import {injected, metaMask, walletConnect, safe} from "@wagmi/connectors";

const PROJECT_ID = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || '';

export const config = createConfig({
    chains: [mainnet, sepolia], // Pass your required chains as an array
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        // For each of your required chains, add an entry to `transports` with
        // a key of the chain's `id` and a value of `http()`
    },
    connectors: [
        injected(),
        metaMask({dappMetadata: {name: PROJECT_ID}, infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY }),
        safe(),
        passkeyConnector(PROJECT_ID, sepolia, "v3", "localhost"),
    ],
});