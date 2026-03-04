"use client";
import { useState } from "react";
import { useContract } from "@/hooks/useContract";
import { requestAccess } from "@stellar/freighter-api";

interface TaskCardProps {
    taskId: number;
    employer: string;
    worker: string;
    amount: number;
    status: number; // 0: Open, 1: InReview, 2: Completed
    evidenceHash?: string;
}

export default function TaskCard({ taskId, employer, worker, amount, status, evidenceHash: initialEvidenceHash }: TaskCardProps) {
    const { submitTask, approveTask } = useContract();
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [evidenceHash, setEvidenceHash] = useState(initialEvidenceHash || "");
    const [loading, setLoading] = useState(false);

    // İşçi kanıt yüklüyor
    const handleSubmitWork = async () => {
        if (!evidenceFile && !evidenceHash) {
            alert("Lütfen bir dosya seçin veya IPFS Hash girin!");
            return;
        }
        setLoading(true);
        try {
            const { address, error } = await requestAccess();
            if (error || !address) throw new Error("Cüzdan bağlanamadı.");

            if (address !== worker) {
                alert("Sadece bu göreve atanan işçi kanıt yükleyebilir!");
                setLoading(false);
                return;
            }

            let finalHash = evidenceHash;

            // Eğer dosya seçildiyse önce IPFS'e yükle
            if (evidenceFile) {
                // Dinamik import kullanımı, component ilk yüklendiğinde hataya düşmemek için
                const { uploadToPinata } = await import('@/utils/pinata');
                try {
                    finalHash = await uploadToPinata(evidenceFile);
                } catch (e) {
                    alert("IPFS yüklemesi başarısız oldu. Lütfen JWT tokeninizi kontrol edin.");
                    setLoading(false);
                    return;
                }
            }

            await submitTask(taskId, finalHash, address);
            alert("Kanıt başarıyla yüklendi!");
        } catch (err: any) {
            console.error(err);
            alert("Kanıt yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // İşveren onaylıyor
    const handleApprove = async () => {
        setLoading(true);
        try {
            const { address, error } = await requestAccess();
            if (error || !address) throw new Error("Cüzdan bağlanamadı.");

            if (address !== employer) {
                alert("Sadece görevi oluşturan işveren onaylayabilir!");
                setLoading(false);
                return;
            }

            await approveTask(taskId, address);
            alert("Görev onaylandı ve ödeme yapıldı!");
        } catch (err: any) {
            console.error(err);
            alert("Onaylanırken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-4 shadow-md w-full">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                <h3 className="text-xl font-bold text-white">Görev #{taskId}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 0 ? "bg-blue-500/20 text-blue-400" :
                    status === 1 ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-green-500/20 text-green-400"
                    }`}>
                    {status === 0 ? "Açık (Open)" : status === 1 ? "İncelemede (In Review)" : "Tamamlandı (Completed)"}
                </span>
            </div>

            <div className="space-y-2 text-sm text-gray-400 mb-6">
                <p><strong className="text-gray-300">İşveren:</strong> {employer.slice(0, 6)}...{employer.slice(-4)}</p>
                <p><strong className="text-gray-300">İşçi:</strong> {worker.slice(0, 6)}...{worker.slice(-4)}</p>
                <p><strong className="text-gray-300">Ödül:</strong> <span className="text-green-400 font-bold">{amount} XLM</span></p>
            </div>

            {status === 0 && (
                <div className="flex flex-col gap-3 border-t border-gray-700 pt-4">
                    <input
                        type="file"
                        onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                        className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                    <span className="text-gray-500 text-xs text-center">- VEYA -</span>
                    <input
                        type="text"
                        placeholder="Mevcut IPFS CID veya Manuel Link..."
                        value={evidenceHash}
                        onChange={(e) => setEvidenceHash(e.target.value)}
                        className="bg-gray-800 p-2 rounded-lg text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={handleSubmitWork}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? "İşleniyor..." : "Kanıtı Yükle (Submit Work)"}
                    </button>
                </div>
            )}

            {status === 1 && (
                <div className="flex flex-col gap-3 border-t border-gray-700 pt-4">
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? "İşleniyor..." : "İşi Onayla ve Öde (Approve)"}
                    </button>
                </div>
            )}
        </div>
    );
}
