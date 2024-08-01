"use client"

import {useConnect, useConnectors, useAccount, useDisconnect, useWriteContract, useReadContract} from 'wagmi'
import {useWriteContracts} from "wagmi/experimental";
import {Address, parseAbi} from "viem";
import React from "react";
import {erc20TokenABI, erc20TokenContractAddress, nftABI, nftContractAddress, nftURI} from "@/contract-info";
import {sepolia} from "viem/chains";
import {bigIntToHex} from "@ethereumjs/util";


export default function Home() {
    const [hydration, setHydration] = React.useState(false);
    const {connect, isPending, connectors} = useConnect();
    const {address, isConnected} = useAccount();
    const {disconnect} = useDisconnect();
    const {
        data,
        writeContracts,
        isPending: isBatchTxPending,
        error: errorBatchTx,
    } = useWriteContracts();

    const paymasterUrl = `https://rpc.zerodev.app/api/v2/paymaster/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`

    const {
        data: hash,
        error,
        isPending: isWritePending,
        writeContract
    } = useWriteContract();

    const { data: balance} = useReadContract({
        abi: nftABI,
        address: nftContractAddress,
        functionName: 'balanceOf',
        args: [address as Address],
        query: { enabled: !!address, initialData: BigInt(0)},
        chainId: sepolia.id,
    } as const);



    React.useEffect(() => setHydration(true), [])
    if (!hydration) return null

    return (
        <main className="min-h-screen p-24">
            {!isConnected ? (
                <div className={"flex items-start gap-4"}>
                    {
                        connectors.filter(c => c.type !== 'injected').map((connector, index) =>
                            <button
                                key={index}
                                className="px-6 py-4 bg-blue-500 text-white rounded-lg"
                                disabled={isPending}
                                onClick={() => {
                                    connect({connector: connector})
                                }}
                            >
                                {isPending ? 'Connecting...' : connector.id}
                            </button>
                        )
                    }
                </div>

            ) : (
                <div className="flex flex-col justify-start h-screen">
                    <div className={"flex flex-row align-middle items-center gap-4 mb-4"}>
                        <p>{`Smart Account Address: ${address}`}</p>
                        <button onClick={() => disconnect()} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                            Disconnect
                        </button>
                    </div>
                    <div className={"mb-4"}>Your BrenkibNFT Balance: {balance?.toString()}</div>
                    <div className={"flex justify-evenly"}>
                        <div className={"w-[50%]"}>
                            <h1 className={"min-h-[100px] text-3xl"}>Separate Tx for Approve and Mint</h1>
                            <button
                                className="mx-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                                disabled={isWritePending}
                                onClick={() => {
                                    writeContract({
                                        address: erc20TokenContractAddress,
                                        abi: erc20TokenABI,
                                        functionName: 'approve',
                                        args: [nftContractAddress, BigInt(10 * Math.pow(10, 18))],
                                        chainId: sepolia.id,
                                    })
                                }}
                            >
                                {isWritePending ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                                className="mx-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                                disabled={isWritePending}
                                onClick={() => {
                                    writeContract({
                                        address: nftContractAddress,
                                        abi: nftABI,
                                        functionName: 'safeMint',
                                        args: [address as Address, nftURI],
                                        chainId: sepolia.id,
                                    })
                                }}
                            >
                                {isWritePending ? 'Minting...' : 'Mint'}
                            </button>
                            {error && <div className="break-all text-wrap text-red-500">{error.stack}</div>}
                        </div>
                        <div className={"w-[50%]"}>
                            <h1 className={"min-h-[100px] text-3xl"}>Batched Tx for Approve and Mint</h1>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                                disabled={isBatchTxPending}
                                onClick={() => {
                                    writeContracts({
                                        contracts: [
                                            {
                                                address: erc20TokenContractAddress,
                                                abi: erc20TokenABI,
                                                functionName: "approve",
                                                args: [nftContractAddress, BigInt(10 * Math.pow(10, 18))],
                                            },
                                            {
                                                address: nftContractAddress,
                                                abi: nftABI,
                                                functionName: "safeMint",
                                                args: [address, nftURI],
                                            }
                                        ],
                                        capabilities: {
                                            paymasterService: {
                                                url: paymasterUrl
                                            },
                                            chainId: sepolia.id,
                                        },
                                        chainId: sepolia.id,
                                    })
                                }}
                            >
                                {isBatchTxPending ? 'Minting...' : 'Approve ERC20 Tokens AND Mint'}
                            </button>
                            {errorBatchTx &&
                                <div className="break-all text-wrap text-red-500">{errorBatchTx.stack}</div>}
                            {data && <p>{`UserOp Hash: ${data}`}</p>}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
