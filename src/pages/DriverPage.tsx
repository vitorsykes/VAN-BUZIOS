import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Truck, Minus, Plus, LocateFixed } from 'lucide-react';
import Map from '../components/Map';
import { useGeolocation } from '../hooks/useGeolocation';
import { usePassengers } from '../hooks/usePassengers';
import { VAN_LINES, Van } from '../types';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

interface DriverPageProps {
  onBack: () => void;
}

export default function DriverPage({ onBack }: DriverPageProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [line, setLine] = useState('');
  
  const userId = auth.currentUser?.uid;
  
  const [status, setStatus] = useState<Van['status']>('Em operação');
  const [seats, setSeats] = useState(15);
  const [active, setActive] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [recenterFlag, setRecenterFlag] = useState(0);

  const { location, speed, error, refreshLocation } = useGeolocation();
  const { passengers } = usePassengers(line);

  // Update van location
  useEffect(() => {
    if (!userId || !active || !location) return;

    const docRef = doc(db, 'vans', userId);
    setDoc(docRef, {
      driverName: name,
      line,
      location,
      status,
      seatsAvailable: seats,
      speed,
      updatedAt: Date.now(),
      passengerCount: 15 - seats,
      active: true
    }, { merge: true });

  }, [userId, active, location, status, seats, speed, name, line]);

  const handleStart = () => {
    if (!name || !line) return;
    setStep(2);
    setActive(true);
  };

  const handleEnd = () => {
    if (userId) {
      deleteDoc(doc(db, 'vans', userId));
    }
    setActive(false);
    onBack();
  };

  const handleCalibrate = () => {
    setIsCalibrating(true);
    refreshLocation?.();
    setRecenterFlag(Date.now());
    setTimeout(() => setIsCalibrating(false), 1000);
  };

  if (step === 1) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 p-6 justify-center">
        <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="max-w-md w-full mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Acessar como Motorista</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Seu Nome</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 block w-full rounded-xl border-slate-300 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Ex: João Silva"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Linha da Van</label>
            <select
              value={line}
              onChange={(e) => setLine(e.target.value)}
              className="block w-full rounded-xl border-slate-300 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Selecione a linha...</option>
              {VAN_LINES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <button
            onClick={handleStart}
            disabled={!name || !line}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform active:scale-95"
          >
            Iniciar Viagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={handleEnd}
          className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-red-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleCalibrate}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors flex items-center justify-center"
          title="Calibrar Localização"
        >
          <LocateFixed size={24} className={isCalibrating ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex-1">
        <Map vans={[]} passengers={passengers} userLocation={location} center={location || undefined} zoom={15} recenterFlag={recenterFlag} />
      </div>

      <div className="absolute bottom-16 left-4 right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4 z-[1000] max-h-[45vh] overflow-y-auto md:max-w-md md:mx-auto">
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        
        <div className="flex justify-between items-end mb-4 border-b dark:border-slate-700 pb-2">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">{line}</h3>
            <p className="text-sm text-slate-500 leading-none">{name}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Aguardando</span>
            <span className="text-xl font-bold text-blue-600 leading-none">{passengers.length}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Vagas</label>
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                <button onClick={() => setSeats(Math.max(0, seats - 1))} className="p-2 bg-white dark:bg-slate-600 rounded-lg shadow active:scale-95"><Minus size={18} className="text-slate-700 dark:text-white"/></button>
                <span className="text-xl font-bold text-slate-900 dark:text-white w-8 text-center">{seats}</span>
                <button onClick={() => setSeats(seats + 1)} className="p-2 bg-white dark:bg-slate-600 rounded-lg shadow active:scale-95"><Plus size={18} className="text-slate-700 dark:text-white"/></button>
              </div>
            </div>

            <div className="flex-[2]">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Van['status'])}
                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl p-2 text-sm font-semibold h-11"
              >
                <option value="Em operação">Em operação</option>
                <option value="Lotada">Lotada</option>
                <option value="Indo para garagem">Indo para garagem</option>
                <option value="Fora de serviço">Fora de serviço</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleEnd}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 rounded-xl transition-colors text-sm"
          >
            Encerrar Viagem
          </button>
        </div>
      </div>
    </div>
  );
}
