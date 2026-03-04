"use client";
import { useState } from "react";
import { isConnected, requestAccess } from "@stellar/freighter-api";

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);

  const connect = async () => {
    if (await isConnected()) {
      const { address, error } = await requestAccess();
      if (error) {
        alert("Bağlantı hatası: " + error);
      } else {
        setAddress(address);
      }
    } else {
      alert("Lütfen Freighter cüzdanını kurun!");
    }
  };

  return (
    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-400">Stellar Trust-Task</h1>
      <button
        onClick={connect}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
      >
        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Cüzdanı Bağla"}
      </button>
    </div>
  );
}
