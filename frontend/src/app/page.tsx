"use client";
import { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import TaskCard from "@/components/TaskCard";
import { useContract } from "@/hooks/useContract";
import { requestAccess } from "@stellar/freighter-api";
import { useEffect, useCallback } from "react";

export default function Home() {
  const [worker, setWorker] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState<any>(null);

  const { createTask, getTask } = useContract();

  // Sabit olarak 1 numaralı görevi çekiyoruz (şimdilik)
  const fetchTask = useCallback(async () => {
    try {
      const data = await getTask(1);
      if (data) {
        setTaskData({
          taskId: 1,
          employer: data.employer,
          worker: data.worker,
          amount: Number(data.amount) / 10_000_000, // Stroops to XLM
          status: data.status,
          evidenceHash: data.evidence_hash
        });
      }
    } catch (error) {
      console.log("Görev henüz oluşturulmamış veya çekilemedi.");
    }
  }, [getTask]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker || !amount) return;

    setLoading(true);
    try {
      const { address, error } = await requestAccess();
      if (error || !address) {
        alert("Lütfen önce cüzdanınızı bağlayın!");
        setLoading(false);
        return;
      }

      await createTask(address, worker, Number(amount));

      alert("Görev başarıyla oluşturuldu!");
      setWorker("");
      setAmount("");

      // Görev oluşturulduktan sonra veriyi hemen güncelle
      await fetchTask();
    } catch (error) {
      console.error(error);
      alert("Görev oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <WalletConnect />

      <main className="max-w-2xl mx-auto p-8 mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Yeni Görev Oluştur</h2>

        <form onSubmit={handleCreateTask} className="bg-gray-900 justify-center flex flex-col p-6 rounded-xl border border-gray-800 shadow-lg gap-4">

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">İşçi Adresi (Public Key)</label>
            <input
              type="text"
              value={worker}
              onChange={(e) => setWorker(e.target.value)}
              className="bg-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="G... ile başlayan adres"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Ödül Miktarı (XLM)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: 100"
              min="1"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            {loading ? "Oluşturuluyor..." : "Görevi Yayınla"}
          </button>
        </form>

        {taskData && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-center border-t border-gray-800 pt-8">Aktif Görevler</h2>
            <TaskCard
              taskId={taskData.taskId}
              employer={taskData.employer}
              worker={taskData.worker}
              amount={taskData.amount}
              status={taskData.status}
              evidenceHash={taskData.evidenceHash} // Kanıt eklendiyse karta gönderebilirsiniz (opsiyonel)
            />
          </div>
        )}
      </main>
    </div>
  );
}
