"use client";
import { useState, useEffect } from "react";
import { useContract } from "@/hooks/useContract";
import { requestAccess } from "@stellar/freighter-api";

interface TaskCardProps {
    taskId: number;
    employer: string;
    descriptionCid: string;
    worker: string | undefined | null; // Boş olabilir (Stellar SDK None için ne dönerse ona göre tip)
    amount: number;
    status: number; // 0: Open, 1: InProgress, 2: InReview, 3: Completed
    evidenceHash?: string;
    onRefresh: () => void;
}

export default function TaskCard({ taskId, employer, descriptionCid, worker, amount, status, evidenceHash: initialEvidenceHash, onRefresh }: TaskCardProps) {
    const { acceptTask, submitTask, approveTask, rejectTask } = useContract();
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [evidenceHash, setEvidenceHash] = useState(initialEvidenceHash || "");
    const [loading, setLoading] = useState(false);

    // IPFS'ten Çekilecek JSON Metadata
    const [taskMeta, setTaskMeta] = useState<{ title: string; description: string } | null>(null);

    // İlk yüklendiğinde IPFS verisini (Title, Description) Pinata Gateway üzerinden çek
    useEffect(() => {
        const fetchMeta = async () => {
            if (!descriptionCid || !descriptionCid.startsWith("ipfs://")) return;
            const hash = descriptionCid.replace("ipfs://", "");
            try {
                // Pinata public gateway veya IPFS gateway kullanarak JSON dökümanını okuyoruz
                const res = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
                const data = await res.json();
                setTaskMeta(data);
            } catch (error) {
                console.error("IPFS Meta çekilemedi:", error);
            }
        };
        fetchMeta();
    }, [descriptionCid]);

    // İşçi Görevi Üzerine Alıyor (Marketplace Accept)
    const handleAcceptTask = async () => {
        setLoading(true);
        try {
            const { address, error } = await requestAccess();
            if (error || !address) throw new Error("Cüzdan bağlanamadı.");

            if (address === employer) {
                alert("Kendi oluşturduğunuz görevi alamazsınız!");
                setLoading(false);
                return;
            }

            await acceptTask(taskId, address);
            alert("Görev başarıyla üzerinize alındı!");
            onRefresh();
        } catch (err: any) {
            console.error(err);
            alert("Görev alınırken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // İşçi Kanıt Yüklüyor (InProgress => InReview)
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

            if (evidenceFile) {
                const { uploadToPinata } = await import('@/utils/pinata');
                try {
                    finalHash = await uploadToPinata(evidenceFile);
                } catch (e) {
                    alert("IPFS yüklemesi başarısız oldu.");
                    setLoading(false);
                    return;
                }
            }

            await submitTask(taskId, finalHash, address);
            alert("Kanıt başarıyla yüklendi!");
            onRefresh();
        } catch (err: any) {
            console.error(err);
            alert("Kanıt yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // İşveren Onaylıyor (InReview => Completed)
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
            alert("Görev onaylandı!");
            onRefresh();
        } catch (err: any) {
            console.error(err);
            alert("Onaylanırken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // İşveren Reddediyor (InReview => InProgress)
    const handleReject = async () => {
        setLoading(true);
        try {
            const { address, error } = await requestAccess();
            if (error || !address) throw new Error("Cüzdan bağlanamadı.");

            if (address !== employer) {
                alert("Sadece görevi oluşturan işveren reddedebilir!");
                setLoading(false);
                return;
            }

            const confirmReject = window.confirm("Bu kanıtı reddetmek istediğinizden emin misiniz? İşçiden tekrar kanıt istenecektir.");
            if (!confirmReject) {
                setLoading(false);
                return;
            }

            await rejectTask(taskId, address);
            alert("Görev reddedildi ve Yapılıyor (In Progress) aşamasına geri gönderildi.");
            onRefresh();
        } catch (err: any) {
            console.error(err);
            alert("Reddedilirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md w-full">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                <h3 className="text-xl font-bold text-white">
                    #{taskId} - {taskMeta ? taskMeta.title : "Yükleniyor..."}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 0 ? "bg-blue-500/20 text-blue-400" :
                        status === 1 ? "bg-purple-500/20 text-purple-400" :
                            status === 2 ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-green-500/20 text-green-400"
                    }`}>
                    {status === 0 ? "Açık (Open)" :
                        status === 1 ? "Yapılıyor (In Progress)" :
                            status === 2 ? "İncelemede (In Review)" :
                                "Tamamlandı (Completed)"}
                </span>
            </div>

            <div className="mb-4 text-gray-300 text-sm italic">
                {taskMeta ? taskMeta.description : "Detaylar çekiliyor..."}
            </div>

            <div className="space-y-2 text-sm text-gray-400 mb-6 bg-gray-950 p-4 rounded-lg">
                <p><strong className="text-gray-300">İşveren:</strong> {employer.slice(0, 6)}...{employer.slice(-4)}</p>
                <p><strong className="text-gray-300">İşçi:</strong> {worker ? `${worker.slice(0, 6)}...${worker.slice(-4)}` : "Henüz Atanmadı"}</p>
                <p><strong className="text-gray-300">Ödül:</strong> <span className="text-green-400 font-bold text-lg">{amount} XLM</span></p>
            </div>

            {/* STATUS 0: OPEN (Görevi Al बटonu) */}
            {status === 0 && (
                <div className="flex flex-col gap-3 border-t border-gray-700 pt-4">
                    <button
                        onClick={handleAcceptTask}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? "İşleniyor..." : "Görevi Al (Accept Task)"}
                    </button>
                </div>
            )}

            {/* STATUS 1: IN PROGRESS (Kanıt Yükle Formu) */}
            {status === 1 && (
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

            {/* STATUS 2: IN REVIEW (Kanıtı Görüntüle ve Onayla/Reddet Butonları) */}
            {status === 2 && (
                <div className="flex flex-col gap-3 border-t border-gray-700 pt-4">

                    {evidenceHash && (
                        <a
                            href={evidenceHash.startsWith("ipfs://") ? `https://gateway.pinata.cloud/ipfs/${evidenceHash.replace("ipfs://", "")}` : evidenceHash}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center text-blue-400 hover:text-blue-300 underline text-sm mb-2 p-3 bg-gray-800 rounded-lg flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            İşçinin Yüklediği Kanıtı Görüntüle
                        </a>
                    )}

                    <div className="flex gap-4 mt-2">
                        <button
                            onClick={handleReject}
                            disabled={loading}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 border border-red-500"
                        >
                            {loading ? "..." : "İşi Reddet ✖"}
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 border border-green-500"
                        >
                            {loading ? "İşleniyor..." : "İşi Onayla ✔"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
