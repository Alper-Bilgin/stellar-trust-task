import { Client, networks } from "trust_task";
import { signTransaction } from "@stellar/freighter-api";

export const useContract = () => {
    const createTask = async (employer: string, worker: string, amount: number) => {
        try {
            const client = new Client({
                ...networks.testnet,
                rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org",
            });

            // Call the bindings method
            const tx = await client.create_task(
                {
                    employer,
                    worker,
                    amount: BigInt(amount * 10_000_000), // Sabit birim (Stroops) çevrimi
                },
                // !!!! Eklenen kısım burası !!!!
                {
                    publicKey: employer // İşlemi kim imzalayacaksa onun adresini buraya vermeliyiz
                }
            );

            // Sign and send with Freighter
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

    return { createTask, submitTask, approveTask };
};
