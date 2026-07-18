import React, { useState, useEffect } from 'react';
import { Truck, Users, Map as MapIcon, AlertTriangle, Check, Copy, ExternalLink, X, HelpCircle, LogIn, LogOut } from 'lucide-react';
import { auth, signInWithGoogle, signInAnonymously } from '../services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

interface HomeProps {
  onSelectRole: (role: 'driver' | 'passenger' | 'view') => void;
}

export default function Home({ onSelectRole }: HomeProps) {
  const [user, setUser] = useState<User | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Automatically attempt anonymous login if they aren't logged in at all
      if (!currentUser) {
        signInAnonymously().catch((err) => {
          console.warn("Silent anonymous login failed (probably disabled in console). Using custom guest fallback instead.", err);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRoleSelection = async (role: 'driver' | 'passenger' | 'view') => {
    if (role === 'view') {
      onSelectRole(role);
      return;
    }

    // If already logged in (either via Google or Anonymously), just proceed directly
    if (auth.currentUser) {
      onSelectRole(role);
      return;
    }

    // If not logged in (due to speed/loading issues), try to sign in anonymously quickly
    setIsLoading(true);
    try {
      await signInAnonymously();
      onSelectRole(role);
    } catch (error) {
      console.warn("Anonymous login failed, proceeding with client-side Guest ID", error);
      // Fallback is guaranteed to work since we enabled permissive rules in Firestore!
      onSelectRole(role);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google Auth error:", error);
      setAuthError(error.message || "Erro de autenticação");
      setShowConfigHelp(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out", err);
    }
  };

  const handleCopyDomain = () => {
    const domain = window.location.hostname;
    navigator.clipboard.writeText(domain).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Determine user login type
  const isGoogleUser = user && !user.isAnonymous;
  const isAnonymousUser = user && user.isAnonymous;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-6 relative">
      {/* Top Bar with optional User Profile / Auth Action */}
      <div className="absolute top-4 right-4 z-50">
        {isGoogleUser ? (
          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-xs">
            {user.photoURL && (
              <img src={user.photoURL} alt={user.displayName || ""} className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
            )}
            <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
              {user.displayName || "Motorista"}
            </span>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full"
              title="Sair da conta"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <LogIn size={13} className="text-blue-500" />
            Entrar com Google
          </button>
        )}
      </div>

      <div className="w-full max-w-md space-y-8 text-center z-10">
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

          {isAnonymousUser && (
            <span className="mt-2 text-[10px] bg-slate-200/70 dark:bg-slate-800/70 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400 font-medium">
              Acesso rápido ativo
            </span>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelection('driver')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white p-4 rounded-2xl shadow-lg transition-transform transform active:scale-95 font-semibold text-lg cursor-pointer"
          >
            <Truck size={24} />
            Motorista
          </button>
          
          <button
            onClick={() => handleRoleSelection('passenger')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white p-4 rounded-2xl shadow-lg transition-transform transform active:scale-95 font-semibold text-lg cursor-pointer"
          >
            <Users size={24} />
            Passageiro
          </button>
          
          <button
            onClick={() => handleRoleSelection('view')}
            className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-2xl shadow-lg transition-transform transform active:scale-95 font-semibold text-lg cursor-pointer"
          >
            <MapIcon size={24} />
            Ver Vans
          </button>
        </div>

        {/* Small non-intrusive help button for Vercel configuration */}
        <div className="pt-2">
          <button
            onClick={() => setShowConfigHelp(true)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors"
          >
            Problemas com o login do Google no Vercel?
          </button>
        </div>
      </div>

      {/* Config help Modal (triggered manually or after a login failure) */}
      {showConfigHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[10000] animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700/50 space-y-5 text-left relative overflow-hidden">
            <button 
              onClick={() => setShowConfigHelp(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle size={32} className="shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white leading-tight">Configuração Necessária</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Para ativar o login do Google no seu próprio domínio</p>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 break-words">
                <strong>Detalhe do erro:</strong> {authError}
              </div>
            )}

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Como você publicou o aplicativo no Vercel (<span className="font-semibold">{window.location.hostname}</span>), o Google bloqueia o login até que você autorize este domínio no console do Firebase.
            </p>

            {/* Quick Guest Fallback confirmation */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">O aplicativo já funciona!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Você <strong>não precisa</strong> configurar nada para usar o aplicativo! O modo visitante/guest já está ativo e você pode usar o mapa, motorista e passageiro livremente clicando nos botões da tela inicial.
              </p>
            </div>

            {/* Steps to authorize on Firebase */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Como resolver o Login do Google se desejar:</h4>
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
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 cursor-pointer"
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


