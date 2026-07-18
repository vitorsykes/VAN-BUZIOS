import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Map from '../components/Map';
import { useVans } from '../hooks/useVans';
import { usePassengers } from '../hooks/usePassengers';

interface ViewVansProps {
  onBack: () => void;
}

export default function ViewVans({ onBack }: ViewVansProps) {
  const { vans, loading } = useVans();
  const { passengers } = usePassengers();

  return (
    <div className="relative w-full h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onBack}
          className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-slate-800 dark:text-white hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Map vans={vans} passengers={passengers} />
        )}
      </div>
    </div>
  );
}
