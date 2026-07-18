import React, { useState, useEffect } from 'react';
import { Truck, Users, Map as MapIcon, AlertTriangle, Check, Copy, ExternalLink, X, HelpCircle } from 'lucide-react';
import { auth, signInWithGoogle, signInAnonymously } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface HomeProps {
  onSelectRole: (role: 'driver' | 'passenger' | 'view') => void;
}

export default function Home({ onSelectRole }: HomeProps) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'driver' | 'passenger' | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      setSelectedRole(role);
      setIsLoading(true);
      try {
        await signInWithGoogle();
        onSelectRole(role);
      } catch (error: any) {
        console.error("Auth error:", error);
        // If Google sign in fails (e.g., auth/api-key-not-valid, auth/unauthorized-domain, etc)
        setShowAuthModal(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      onSelectRole(role);
    }
  };

  const handleAnonymousSignIn = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    try {
      await signInAnonymously();
      setShowAuthModal(false);
      onSelectRole(selectedRole);
    } catch (err) {
      console.error("Anonymous auth failed:", err);
      alert("Não foi possível entrar no modo de testes/visitante. Verifique se o Login Anônimo está ativado no console do Firebase ou tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyDomain = () => {
    const domain = window.location.hostname;
    navigator.clipboard.writeText(domain).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-6 relative">
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
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white p-4 rounded-2xl shadow-lg transition-transform transform active:scale-95 font-semibold text-lg cursor-pointer"
          >
            <Truck size={24} />
            {isLoading && selectedRole === 'driver' ? 'Carregando...' : 'Motorista'}
          </button>
          
          <button
            onClick={() => handleRoleSelection('passenger')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white p-4 rounded-2xl shadow-lg transition-transform transform active:scale-95 font-semibold text-lg cursor-pointer"
          >
            <Users size={24} />
            {isLoading && selectedRole === 'passenger' ? 'Carregando...' : 'Passageiro'}
          </button>
          
          <button
            onClick={() => handleRoleSelection('view')}
            className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-2xl shadow-lg transition-transform transform active:scale-95 font-semibold text-lg cursor-pointer"
          >
            <MapIcon size={24} />
            Ver Vans
          </button>
        </div>
      </div>

      {/* Auth Error & Guest Fallback Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[10000] animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700/50 space-y-5 text-left relative overflow-hidden">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle size={32} className="shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white leading-tight">Configuração Necessária</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">O Google bloqueou a autenticação neste domínio</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Como o aplicativo foi publicado no Vercel (<span className="font-semibold">{window.location.hostname}</span>), você precisa autorizar este endereço no console do seu Firebase para que o login do Google funcione.
            </p>

            {/* Quick Guest Fallback option */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-3">
              <div className="flex items-start gap-2.5">
                <HelpCircle size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Modo Rápido (Recomendado para testar)</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Entre como visitante anônimo agora mesmo para testar as rotas e o mapa imediatamente, sem precisar de conta Google.</p>
                </div>
              </div>
              <button
                onClick={handleAnonymousSignIn}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                Entrar como Visitante / Testes
              </button>
            </div>

            {/* Steps to authorize on Firebase */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Como resolver o Login do Google:</h4>
              <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside">
                <li>
                  Acesse seu <strong className="text-slate-950 dark:text-white">Console Firebase</strong> &gt; Authentication &gt; Settings &gt; Authorized Domains.
                </li>
                <li>
                  Clique em <strong className="text-slate-950 dark:text-white">Add Domain</strong> e cole o domínio abaixo:
                  <div className="mt-1.5 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <code className="text-xs font-mono text-blue-600 dark:text-blue-400 select-all flex-1 truncate">{window.location.hostname}</code>
                    <button 
                      onClick={handleCopyDomain}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700"
                      title="Copiar domínio"
                    >
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </li>
                <li>
                  No <strong className="text-slate-950 dark:text-white">Google Cloud Console</strong> &gt; APIs &amp; Services &gt; Credentials, adicione <code className="font-mono text-[10px]">{window.location.origin}</code> nos campos de origens e URIs de redirecionamento do seu ID de cliente OAuth 2.0.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

