'use client';
import * as React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {config} from '@/wagmi';
import { WagmiProvider } from 'wagmi'

const queryClient = new QueryClient();

export function Providers({children}: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>

    );
}
