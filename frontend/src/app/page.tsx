"use client";
import { useState, useEffect, useCallback } from "react";
import WalletConnect from "@/components/WalletConnect";
import TaskCard from "@/components/TaskCard";
import { useContract } from "@/hooks/useContract";
import { requestAccess } from "@stellar/freighter-api";
import { uploadJSONToPinata } from "@/utils/pinata";
import toast from "react-hot-toast";

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);

  const { createTask, getTask, getTaskCount } = useContract();

  const fetchAllTasks = useCallback(async () => {
    try {
      const count = await getTaskCount();
      const loadedTasks = [];

      // Loop and fetch all tasks (1-indexed based on our contract logic)
      for (let i = 1; i <= count; i++) {
        const data = await getTask(i);
        if (data) {
          loadedTasks.push({
            taskId: i,
            employer: data.employer,
            description_cid: data.description_cid,
            worker: data.worker,
            amount: Number(data.amount) / 10_000_000,
            status: data.status,
            evidenceHash: data.evidence_hash
          });
        }
      }

      // Show newest tasks first
      setTasks(loadedTasks.reverse());
    } catch (error) {
      console.log("Görevler çekilemedi:", error);
    }
  }, [getTask, getTaskCount]);

  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !amount) return;

    setLoading(true);
    const loadingToast = toast.loading("Görev yükleniyor...");

    try {
      const { address, error } = await requestAccess();
      if (error || !address) {
        toast.dismiss(loadingToast);
        toast.error("Lütfen önce cüzdanınızı bağlayın!");
        setLoading(false);
        return;
      }

      // 1. JSON Data'yı IPFS'e yükle
      const jsonObj = { title, description };
      const descriptionCid = await uploadJSONToPinata(jsonObj);

      // 2. IPFS CID'si ile Kontratı çağır
      await createTask(address, descriptionCid, Number(amount));

      toast.success("Görev başarıyla Market'e eklendi!", { id: loadingToast });
      setTitle("");
      setDescription("");
      setAmount("");

      await fetchAllTasks();
    } catch (error) {
      console.error(error);
      toast.error("Görev oluşturulurken bir hata oluştu.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 pb-20">
      <WalletConnect />

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10">

        {/* Left Side: Create Form */}
        <div className="lg:sticky lg:top-32 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-gradient-to-b from-sky-400 to-indigo-500 rounded-full"></div>
            <h2 className="text-2xl font-bold">Yeni Görev İlanı</h2>
          </div>

          <form onSubmit={handleCreateTask} className="glass-panel p-8 rounded-3xl flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Görev Başlığı</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-3 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner"
                placeholder="Örn: Logo Tasarımı"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Görev Detayları / Şartlar</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-3 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-sky-500/50 min-h-[120px] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner"
                placeholder="Görevin neleri içermesi gerektiğini yazın..."
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Ödül (XLM)</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-3 pr-14 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner font-bold text-lg"
                  placeholder="0.00"
                  min="1"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-emerald-500">XLM</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full relative overflow-hidden group bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
            >
              <span className="relative z-10">{loading ? "Blockchain'e İşleniyor..." : "Markete Ekle"}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Task Board */}
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></div>
            <h2 className="text-2xl font-bold">Açık Görevler (Market)</h2>
            <div className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-500 ml-auto border border-slate-300 dark:border-slate-700">
              {tasks.length} Görev Bulundu
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {tasks.length === 0 ? (
              <div className="glass-panel p-10 rounded-3xl flex flex-col items-center justify-center text-center opacity-70">
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-lg font-bold mb-1">Pazar Yeri Boş</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">İlk görevi yayınlayan siz olun, yetenekli uzmanlarla buluşun.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  taskId={task.taskId}
                  employer={task.employer}
                  worker={task.worker}
                  descriptionCid={task.description_cid}
                  amount={task.amount}
                  status={task.status}
                  evidenceHash={task.evidenceHash}
                  onRefresh={fetchAllTasks}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
