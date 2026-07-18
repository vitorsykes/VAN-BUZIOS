import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Passenger } from '../types';

export function usePassengers(line?: string) {
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  useEffect(() => {
    let q = collection(db, 'passengers');
    if (line) {
      q = query(q, where('line', '==', line), where('status', '==', 'waiting')) as any;
    } else {
      q = query(q, where('status', '==', 'waiting')) as any;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pData: Passenger[] = [];
      snapshot.forEach((doc) => {
        pData.push({ id: doc.id, ...doc.data() } as Passenger);
      });
      setPassengers(pData);
    });

    return () => unsubscribe();
  }, [line]);

  return { passengers };
}
