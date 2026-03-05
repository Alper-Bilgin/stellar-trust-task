"use client";
import { useState, useEffect } from "react";
import { isConnected, requestAccess } from "@stellar/freighter-api";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { Wallet, Moon, Sun, ShieldCheck } from "lucide-react";

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration mismatch prevention
  useEffect(() => {
    setMounted(true);
  }, []);

  const connect = async () => {
    try {
      if (await isConnected()) {
        const { address, error } = await requestAccess();
        if (error) {
          toast.error("Bağlantı hatası: " + error);
        } else {
          setAddress(address);
          toast.success("Cüzdan bağlandı!");
        }
      } else {
        toast.error("Lütfen Freighter cüzdanını kurun!", {
          icon: '🦊',
        });
      }
    } catch (e: any) {
      toast.error("Cüzdan bağlantısı reddedildi.");
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full mb-8 glass-panel border-b-0 border-x-0 border-t-0 rounded-b-3xl">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO AREA */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 shadow-lg shadow-sky-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Stellar <span className="text-sky-600 dark:text-sky-500 font-light">Trust</span>
          </h1>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-4">

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {/* Wallet Button */}
          <button
            onClick={connect}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${address
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/20"
              : "bg-slate-900 dark:bg-slate-800 text-white hover:-translate-y-0.5 shadow-lg dark:neon-border"
              }`}
          >
            <Wallet className="w-4 h-4" />
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Cüzdanı Bağla"}
          </button>
        </div>

      </div>
    </div>
  );
}
