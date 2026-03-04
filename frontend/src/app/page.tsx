"use client";
import { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import { useContract } from "@/hooks/useContract";
import { requestAccess } from "@stellar/freighter-api";

export default function Home() {
  const [worker, setWorker] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const { createTask } = useContract();

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
      </main>
    </div>
  );
}
