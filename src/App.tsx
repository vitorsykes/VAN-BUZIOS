/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import ViewVans from './pages/ViewVans';
import PassengerPage from './pages/PassengerPage';
import DriverPage from './pages/DriverPage';

export default function App() {
  const [role, setRole] = useState<'driver' | 'passenger' | 'view' | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [copied, setCopied] = useState(false);

  // Splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyPix = () => {
    navigator.clipboard.writeText("16720942751").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  };

  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden select-none">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="z-10 text-center space-y-6 flex flex-col items-center">
          <div className="relative p-1 bg-gradient-to-tr from-blue-500 to-emerald-500 rounded-[2.5rem] shadow-2xl animate-pulse">
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKzq8_qKU9Y_6gsof6FUzv89FK-wjVj7hNpWrFZwHqoorf0_nDpNPvqiM28KMD-vXvDfUuD2dARJB8AaUW4UN0-B8-ZhpsRlWOF3RuWJaf9aB6Yg0SHXGK9-bDeBBvmLjBn3xz5xmqwz4CzbPJCAQBzC2svylIUxO6deDjWhTCP2pf_XYO2BmeQ5Tqz1M/s1600/ChatGPT%20Image%2018%20de%20jul.%20de%202026,%2017_08_38.png" 
              alt="Logo Van Local" 
              className="w-44 h-44 object-contain rounded-[2.3rem]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              VAN LOCAL
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Búzios em Tempo Real
            </p>
          </div>
          
          <div className="pt-4">
            <div className="flex space-x-1.5 justify-center items-center">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-16">
      {/* Active Page View */}
      {role === 'view' && <ViewVans onBack={() => setRole(null)} />}
      {role === 'passenger' && <PassengerPage onBack={() => setRole(null)} />}
      {role === 'driver' && <DriverPage onBack={() => setRole(null)} />}
      {!role && <Home onSelectRole={setRole} />}

      {/* Persistent Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 py-2.5 px-4 text-center shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-[9999] flex flex-col xs:flex-row items-center justify-center gap-1.5 xs:gap-3 select-none">
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Apoie o aplicativo</span>
        </div>
        
        <div className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <span>Pix: <code className="bg-slate-200 dark:bg-slate-700/80 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono select-all">16720942751</code></span>
          <button 
            onClick={handleCopyPix} 
            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md transition-all active:scale-95 ${
              copied 
                ? "bg-emerald-600 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>

        <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Vitor Gomes da Silva
        </span>
      </footer>
    </div>
  );
}

