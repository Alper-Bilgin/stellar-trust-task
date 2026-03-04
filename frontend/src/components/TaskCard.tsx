"use client";
import { useState, useEffect } from "react";
import { useContract } from "@/hooks/useContract";
import { requestAccess } from "@stellar/freighter-api";
import toast from "react-hot-toast";
import {
    Clock,
    CheckCircle2,
    XCircle,
    PlayCircle,
    UploadCloud,
    Link as LinkIcon,
    Wallet,
    User,
    Coins,
    Image as ImageIcon
} from "lucide-react";

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
        const loadingToast = toast.loading("Görev alınıyor...");
        try {
            const { address, error } = await requestAccess();
            if (error || !address) {
                toast.dismiss(loadingToast);
                toast.error("Cüzdan bağlanamadı.");
                return;
            }

            if (address === employer) {
                toast.error("Kendi oluşturduğunuz görevi alamazsınız!", { id: loadingToast });
                return;
            }

            await acceptTask(taskId, address);
            toast.success("Görev başarıyla üzerinize alındı!", { id: loadingToast, icon: '🚀' });
            onRefresh();
        } catch (err: any) {
            console.error(err);
            toast.error("Görev alınırken bir hata oluştu.", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    // İşçi Kanıt Yüklüyor (InProgress => InReview)
    const handleSubmitWork = async () => {
        if (!evidenceFile && !evidenceHash) {
            toast.error("Lütfen bir dosya seçin veya IPFS Hash/Link girin!");
            return;
        }
        setLoading(true);
        const loadingToast = toast.loading("Kanıt yükleniyor...");
        try {
            const { address, error } = await requestAccess();
            if (error || !address) {
                toast.dismiss(loadingToast);
                toast.error("Cüzdan bağlanamadı.");
                return;
            }

            if (address !== worker) {
                toast.error("Sadece bu göreve atanan işçi kanıt yükleyebilir!", { id: loadingToast });
                return;
            }

            let finalHash = evidenceHash;

            if (evidenceFile) {
                toast.loading("Dosya IPFS'e yükleniyor...", { id: loadingToast });
                const { uploadToPinata } = await import('@/utils/pinata');
                try {
                    finalHash = await uploadToPinata(evidenceFile);
                } catch (e) {
                    toast.error("IPFS yüklemesi başarısız oldu.", { id: loadingToast });
                    return;
                }
            }

            toast.loading("Blockchain'e işleniyor...", { id: loadingToast });
            await submitTask(taskId, finalHash, address);
            toast.success("Kanıt başarıyla yüklendi ve onaya gönderildi!", { id: loadingToast });
            onRefresh();
        } catch (err: any) {
            console.error(err);
            toast.error("Kanıt yüklenirken bir hata oluştu.", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    // İşveren Onaylıyor (InReview => Completed)
    const handleApprove = async () => {
        setLoading(true);
        const loadingToast = toast.loading("Ödeme onaylanıyor...");
        try {
            const { address, error } = await requestAccess();
            if (error || !address) {
                toast.dismiss(loadingToast);
                toast.error("Cüzdan bağlanamadı.");
                return;
            }

            if (address !== employer) {
                toast.error("Sadece görevi oluşturan işveren onaylayabilir!", { id: loadingToast });
                return;
            }

            toast.loading("Fonlar işçiye aktarılıyor...", { id: loadingToast });
            await approveTask(taskId, address);
            toast.success("Görev onaylandı ve ödeme yapıldı! 🎉", { id: loadingToast });
            onRefresh();
        } catch (err: any) {
            console.error(err);
            toast.error("Onaylanırken bir hata oluştu.", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    // İşveren Reddediyor (InReview => InProgress)
    const handleReject = async () => {
        const confirmReject = window.confirm("Bu kanıtı reddetmek istediğinizden emin misiniz? İşçiden tekrar kanıt istenecektir.");
        if (!confirmReject) return;

        setLoading(true);
        const loadingToast = toast.loading("Görev reddediliyor...");
        try {
            const { address, error } = await requestAccess();
            if (error || !address) {
                toast.dismiss(loadingToast);
                toast.error("Cüzdan bağlanamadı.");
                return;
            }

            if (address !== employer) {
                toast.error("Sadece görevi oluşturan işveren reddedebilir!", { id: loadingToast });
                return;
            }

            toast.loading("Kanıt siliniyor ve görev geri açılıyor...", { id: loadingToast });
            await rejectTask(taskId, address);
            toast.success("Görev reddedildi ve işçiye geri gönderildi.", { id: loadingToast });
            onRefresh();
        } catch (err: any) {
            console.error(err);
            toast.error("Reddedilirken bir hata oluştu.", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = () => {
        switch (status) {
            case 0: return { icon: PlayCircle, color: "text-sky-500", bg: "bg-sky-500/10 border-sky-500/20", text: "Açık (Open)" };
            case 1: return { icon: Clock, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", text: "Yapılıyor (In Progress)" };
            case 2: return { icon: UploadCloud, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", text: "İncelemede (In Review)" };
            case 3: return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", text: "Tamamlandı (Completed)" };
            default: return { icon: Clock, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20", text: "Bilinmiyor" };
        }
    };

    const StatusIcon = getStatusConfig().icon;

    return (
        <div className={`glass-panel rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/5 hover:-translate-y-1 relative overflow-hidden ${status === 3 ? 'opacity-80' : ''}`}>

            {/* Status Colored Line Indicator */}
            <div className={`absolute top-0 left-0 w-1 h-full ${status === 0 ? "bg-sky-500" :
                status === 1 ? "bg-indigo-500" :
                    status === 2 ? "bg-amber-400" :
                        "bg-emerald-500"
                }`}></div>

            <div className="flex justify-between items-start mb-4 ml-2">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-lg shadow-inner">
                        #{taskId}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                        {taskMeta ? taskMeta.title : (
                            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                        )}
                    </h3>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusConfig().bg}`}>
                    <StatusIcon className={`w-4 h-4 ${getStatusConfig().color}`} />
                    <span className={`text-xs font-bold ${getStatusConfig().color}`}>
                        {getStatusConfig().text}
                    </span>
                </div>
            </div>

            <div className="mb-6 ml-2 text-slate-600 dark:text-slate-300 text-sm leading-relaxed min-h-[40px]">
                {taskMeta ? taskMeta.description : (
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ml-2">
                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <Wallet className="w-5 h-5 text-indigo-500" />
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">İşveren</span>
                        <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {employer.slice(0, 5)}...{employer.slice(-4)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <User className={`w-5 h-5 ${worker ? 'text-sky-500' : 'text-slate-400'}`} />
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">İşçi</span>
                        <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {worker ? `${worker.slice(0, 5)}...${worker.slice(-4)}` : "Henüz Atanmadı"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 mb-6 ml-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full">
                    <Coins className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-500 uppercase tracking-wider">Ödül</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-2xl tracking-tight">
                        {amount} XLM
                    </span>
                </div>
            </div>

            {/* ACTION AREAS */}
            <div className="ml-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                {/* STATUS 0: OPEN */}
                {status === 0 && (
                    <button
                        onClick={handleAcceptTask}
                        disabled={loading}
                        className="w-full relative overflow-hidden group bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <User className="w-5 h-5" />
                        <span>{loading ? "İşleniyor..." : "Görevi Al (Accept Task)"}</span>
                    </button>
                )}

                {/* STATUS 1: IN PROGRESS */}
                {status === 1 && (
                    <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <UploadCloud className="w-5 h-5 text-indigo-500" />
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">Kanıt Yükle</h4>
                        </div>

                        <div className="relative group cursor-pointer">
                            <input
                                type="file"
                                onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-colors bg-white dark:bg-slate-900/50">
                                {evidenceFile ? (
                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center gap-2">
                                        <ImageIcon className="w-4 h-4" /> {evidenceFile.name}
                                    </span>
                                ) : (
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">Resim/Dosya seçmek için tıklayın veya sürükleyin</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Veya Link Girin</span>
                            <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
                        </div>

                        <div className="flex relative items-center">
                            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3" />
                            <input
                                type="text"
                                placeholder="IPFS CID veya harici bir link..."
                                value={evidenceHash}
                                onChange={(e) => setEvidenceHash(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900/80 p-3 pl-10 rounded-xl text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <button
                            onClick={handleSubmitWork}
                            disabled={loading || (!evidenceFile && !evidenceHash)}
                            className="w-full mt-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white dark:text-slate-900 font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? "Yükleniyor..." : "Kanıtı Gönder (Submit Work)"}
                        </button>
                    </div>
                )}

                {/* STATUS 2: IN REVIEW */}
                {status === 2 && (
                    <div className="flex flex-col gap-5">
                        {evidenceHash && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-amber-500" /> Kanıt Dosyası
                                </h4>

                                <div className="rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 aspect-video relative flex items-center justify-center group">
                                    <img
                                        src={evidenceHash.startsWith("ipfs://") ? `https://gateway.pinata.cloud/ipfs/${evidenceHash.replace("ipfs://", "")}` : evidenceHash}
                                        alt="Evidence Preview"
                                        className="object-contain w-full h-full"
                                        onError={(e) => {
                                            // Render text link fallback if image fails to load
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.classList.add('p-6');
                                            const fallback = document.createElement('div');
                                            fallback.innerHTML = `<span class="text-sm text-slate-500 block mb-2">Resim önizlemesi yüklenemedi.</span>`;
                                            e.currentTarget.parentElement?.appendChild(fallback);
                                        }}
                                    />
                                    {/* Overlay for clicking */}
                                    <a
                                        href={evidenceHash.startsWith("ipfs://") ? `https://gateway.pinata.cloud/ipfs/${evidenceHash.replace("ipfs://", "")}` : evidenceHash}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                                    >
                                        <span className="bg-white text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-xl">
                                            <LinkIcon className="w-4 h-4" /> Yeni Sekmede Aç
                                        </span>
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleReject}
                                disabled={loading}
                                className="flex-1 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl transition-all border border-red-200 dark:border-red-500/30 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                {loading ? "..." : <><XCircle className="w-5 h-5" /> Reddet</>}
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={loading}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                {loading ? "..." : <><CheckCircle2 className="w-5 h-5" /> İşi Onayla</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* STATUS 3: COMPLETED */}
                {status === 3 && (
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-center">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Bu görev başarıyla tamamlandı ve ödendi.
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
