"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'rgba(30, 41, 59, 0.9)', // slate-800 with opacity
                        color: '#fff',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(71, 85, 105, 0.5)', // slate-600
                        padding: '16px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981', // emerald-500
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444', // red-500
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </ThemeProvider>
    );
}
