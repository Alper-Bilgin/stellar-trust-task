"use client";
import { useState, useEffect, useCallback } from "react";
import WalletConnect from "@/components/WalletConnect";
import TaskCard from "@/components/TaskCard";
import { useContract } from "@/hooks/useContract";
import { requestAccess } from "@stellar/freighter-api";
import { uploadJSONToPinata } from "@/utils/pinata";

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
    try {
      const { address, error } = await requestAccess();
      if (error || !address) {
        alert("Lütfen önce cüzdanınızı bağlayın!");
        setLoading(false);
        return;
      }

      // 1. JSON Data'yı IPFS'e yükle
      const jsonObj = { title, description };
      const descriptionCid = await uploadJSONToPinata(jsonObj);

      // 2. IPFS CID'si ile Kontratı çağır
      await createTask(address, descriptionCid, Number(amount));

      alert("Görev Market'e eklendi!");
      setTitle("");
      setDescription("");
      setAmount("");

      await fetchAllTasks();
    } catch (error) {
      console.error(error);
      alert("Görev oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-10">
      <WalletConnect />

      <main className="max-w-4xl mx-auto p-8 mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Create Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Yeni Profil Görevi Oluştur</h2>

          <form onSubmit={handleCreateTask} className="bg-gray-900 flex flex-col p-6 rounded-xl border border-gray-800 shadow-lg gap-4">

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Görev Başlığı</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: Logo Tasarımı"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Görev Detayları / Şartlar</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="Görevin neleri içermesi gerektiğini yazın..."
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Ödül (XLM)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="bg-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: 50"
                min="1"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              {loading ? "Oluşturuluyor..." : "Markete Ekle"}
            </button>
          </form>
        </div>

        {/* Right Side: Task Board */}
        <div>
          <h2 className="text-2xl border-b border-gray-800 pb-2 font-bold mb-6">Açık Görevler (Market)</h2>
          <div className="flex flex-col gap-4">
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-sm">Henüz sistemde bir görev yok.</p>
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
