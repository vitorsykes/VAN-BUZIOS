import React, { useState, useEffect } from 'react';
import { Truck, Users, Map as MapIcon } from 'lucide-react';
import { auth, signInWithGoogle } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface HomeProps {
  onSelectRole: (role: 'driver' | 'passenger' | 'view') => void;
}

export default function Home({ onSelectRole }: HomeProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleRoleSelection = async (role: 'driver' | 'passenger' | 'view') => {
    if (role === 'view') {
      onSelectRole(role);
      return;
    }

    if (!user) {
      try {
        await signInWithGoogle();
      } catch (error) {
        return; // user cancelled login
      }
    }
    onSelectRole(role);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="relative p-1.5 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 mb-4 transform hover:scale-105 transition-transform duration-300">
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKzq8_qKU9Y_6gsof6FUzv89FK-wjVj7hNpWrFZwHqoorf0_nDpNPvqiM28KMD-vXvDfUuD2dARJB8AaUW4UN0-B8-ZhpsRlWOF3RuWJaf9aB6Yg0SHXGK9-bDeBBvmLjBn3xz5xmqwz4CzbPJCAQBzC2svylIUxO6deDjWhTCP2pf_XYO2BmeQ5Tqz1M/s1600/ChatGPT%20Image%2018%20de%20jul.%20de%202026,%2017_08_38.png" 
              alt="Logo Van Local" 
              className="w-32 h-32 md:w-36 md:h-36 object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Van Local
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Rastreamento de vans em tempo real em Búzios
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelection('driver')}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-lg transition-transform transform active:scale-95 font-semibold text-lg"
          >
            <Truck size={24} />
            Motorista
          </button>
          
          <button
            onClick={() => handleRoleSelection('passenger')}
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl shadow-lg transition-transform transform active:scale-95 font-semibold text-lg"
          >
            <Users size={24} />
            Passageiro
          </button>
          
          <button
            onClick={() => handleRoleSelection('view')}
            className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-2xl shadow-lg transition-transform transform active:scale-95 font-semibold text-lg"
          >
            <MapIcon size={24} />
            Ver Vans
          </button>
        </div>
      </div>
    </div>
  );
}
