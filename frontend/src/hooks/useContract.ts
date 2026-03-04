import { Client, networks } from "trust_task";
import { signTransaction } from "@stellar/freighter-api";

export const useContract = () => {
    const createTask = async (employer: string, description_cid: string, amount: number) => {
        try {
            const client = new Client({
                ...networks.testnet,
                rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org",
            });

            const tx = await client.create_task(
                {
                    employer,
                    description_cid,
                    amount: BigInt(amount * 10_000_000), // Sabit birim (Stroops) çevrimi
                },
                {
                    publicKey: employer
                }
            );

            const signedTx = await tx.signAndSend({
                signTransaction: async (xdr: string) => {
                    return await signTransaction(xdr, { networkPassphrase: networks.testnet.networkPassphrase });
                }
            });

            return signedTx;
        } catch (error) {
            console.error("Görev oluşturulurken hata:", error);
            throw error;
        }
    };

    const acceptTask = async (task_id: number, workerPubKey: string) => {
        try {
            const client = new Client({
                ...networks.testnet,
                rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org",
            });

            const tx = await client.accept_task(
                { task_id, worker: workerPubKey },
                { publicKey: workerPubKey }
            );

            const signedTx = await tx.signAndSend({
                signTransaction: async (xdr: string) => {
                    return await signTransaction(xdr, { networkPassphrase: networks.testnet.networkPassphrase });
                }
            });

            return signedTx;
        } catch (error) {
            console.error("Görev alınırken hata:", error);
            throw error;
        }
    };

    const submitTask = async (task_id: number, evidence_hash: string, workerPubKey: string) => {
        try {
            const client = new Client({
                ...networks.testnet,
                rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org",
            });

            const tx = await client.submit_work(
                { task_id, evidence_hash },
                { publicKey: workerPubKey }
            );

            const signedTx = await tx.signAndSend({
                signTransaction: async (xdr: string) => {
                    return await signTransaction(xdr, { networkPassphrase: networks.testnet.networkPassphrase });
                }
            });

            return signedTx;
        } catch (error) {
            console.error("Kanıt yüklenirken hata:", error);
            throw error;
        }
    };

    const approveTask = async (task_id: number, employerPubKey: string) => {
        try {
            const client = new Client({
                ...networks.testnet,
                rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org",
            });

            const tx = await client.approve_and_pay(
                { task_id },
                { publicKey: employerPubKey }
            );

            const signedTx = await tx.signAndSend({
                signTransaction: async (xdr: string) => {
                    return await signTransaction(xdr, { networkPassphrase: networks.testnet.networkPassphrase });
                }
            });

            return signedTx;
        } catch (error) {
            console.error("Ödeme onaylanırken hata:", error);
            throw error;
        }
    };

    const getTask = async (taskId: number) => {
        try {
            const client = new Client({
                ...networks.testnet,
                rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org",
            });

            const { result } = await client.get_task({ task_id: taskId });
            return result;
        } catch (error) {
            console.log("Görev bilgisi çekilemedi ID:", taskId);
            return null;
        }
    };

    const rejectTask = async (task_id: number, employerPubKey: string) => {
        try {
            const client = new Client({
                ...networks.testnet,
                rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org",
            });

            const tx = await client.reject_work(
                { task_id },
                { publicKey: employerPubKey }
            );

            const signedTx = await tx.signAndSend({
                signTransaction: async (xdr: string) => {
                    return await signTransaction(xdr, { networkPassphrase: networks.testnet.networkPassphrase });
                }
            });

            return signedTx;
        } catch (error) {
            console.error("Görev reddedilirken hata:", error);
            throw error;
        }
    };

    const getTaskCount = async () => {
        try {
            const client = new Client({
                ...networks.testnet,
                rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org",
            });

            const { result } = await client.get_task_count();
            return Number(result);
        } catch (error) {
            console.error("Görev sayısı çekilemedi:", error);
            return 0;
        }
    };

    return { createTask, acceptTask, submitTask, approveTask, rejectTask, getTask, getTaskCount };
};
