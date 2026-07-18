import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import Map from '../components/Map';
import { useVans } from '../hooks/useVans';
import { useGeolocation } from '../hooks/useGeolocation';
import { VAN_LINES } from '../types';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, getUserId } from '../services/firebase';
import { calculateDistance, formatDistance } from '../utils/distance';

interface PassengerPageProps {
  onBack: () => void;
}

export default function PassengerPage({ onBack }: PassengerPageProps) {
  const [line, setLine] = useState<string>('');
  const userId = getUserId();
  const [inVan, setInVan] = useState<string | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [recenterFlag, setRecenterFlag] = useState(0);

  const { vans } = useVans(line);
  const { location, error, refreshLocation } = useGeolocation();

  // Notification setup
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Notification loop for passengers
  useEffect(() => {
    if (!userId || !('Notification' in window)) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'hidden' && Notification.permission === 'granted') {
        if (inVan) {
          new Notification('Ainda está na van?', {
            body: 'Se você já desceu, não esqueça de avisar no aplicativo para parar de compartilhar sua localização.',
            icon: '/vite.svg'
          });
        } else if (line) {
          new Notification('Sua van chegou?', {
            body: 'Lembre-se de clicar em "Estou nesta van" quando embarcar!',
            icon: '/vite.svg'
          });
        }
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [userId, inVan, line]);

  // Update passenger location in firestore when waiting
  useEffect(() => {
    if (!userId || !line || !location || inVan) return;

    const docRef = doc(db, 'passengers', userId);
    setDoc(docRef, {
      line,
      location,
      status: 'waiting',
      updatedAt: Date.now(),
      vanId: null
    }, { merge: true });

    return () => {
      deleteDoc(docRef).catch(console.error);
    };
  }, [userId, line, location, inVan]);

  // Passenger in van helps with van location
  useEffect(() => {
    if (!userId || !location || !inVan) return;

    // The passenger is in a van, so they also update the van's location to help with accuracy
    const vanRef = doc(db, 'vans', inVan);
    setDoc(vanRef, {
      location,
      updatedAt: Date.now()
    }, { merge: true }).catch(console.error);

  }, [userId, location, inVan]);

  const handleEnterVan = (vanId: string) => {
    setInVan(vanId);
    if (userId) {
      setDoc(doc(db, 'passengers', userId), {
        status: 'in_van',
        vanId: vanId,
        updatedAt: Date.now()
      }, { merge: true });
    }
  };

  const handleLeaveVan = () => {
    setInVan(null);
    setLine('');
    if (userId) {
      deleteDoc(doc(db, 'passengers', userId));
    }
  };

  const handleCalibrate = () => {
    setIsCalibrating(true);
    refreshLocation?.();
    setRecenterFlag(Date.now());
    setTimeout(() => setIsCalibrating(false), 1000);
  };

  if (!line && !inVan) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <button onClick={onBack} className="mb-6 self-start p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Para onde você vai?</h2>
        <div className="grid grid-cols-1 gap-4">
          {VAN_LINES.map(l => (
            <button
              key={l}
              onClick={() => setLine(l)}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow flex justify-between items-center hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="font-semibold text-lg dark:text-white text-slate-800">{l}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={inVan ? handleLeaveVan : () => setLine('')}
          className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-slate-800 dark:text-white hover:bg-slate-100 transition-colors flex items-center justify-center"
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
          <MapPin size={24} className={isCalibrating ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex-1">
        <Map vans={vans} userLocation={location} center={location || undefined} zoom={14} recenterFlag={recenterFlag} />
      </div>

      <div className="absolute bottom-16 left-4 right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4 z-[1000] max-h-[45vh] overflow-y-auto md:max-w-md md:mx-auto">
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        
        {inVan ? (
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Boa viagem!</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Sua localização está ajudando outros passageiros.</p>
            <button
              onClick={handleLeaveVan}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow transition-colors"
            >
              Saí da van
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Vans na linha {line}</h3>
            {vans.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhuma van operando no momento.</p>
            ) : (
              <div className="space-y-3">
                {vans.map(van => {
                  const dist = location ? calculateDistance(location, van.location) : 0;
                  return (
                    <div key={van.id} className="border dark:border-slate-700 rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-md dark:text-white">{van.driverName}</div>
                          <div className="text-xs text-slate-500">{van.status} • {van.seatsAvailable} vagas</div>
                        </div>
                        {location && (
                          <div className="text-right">
                            <div className="font-semibold text-emerald-600 text-sm">{formatDistance(dist)}</div>
                            <div className="text-[10px] text-slate-500">aprox. {Math.round((dist / (van.speed || 30)) * 60)} min</div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleEnterVan(van.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                      >
                        Estou nesta van
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
