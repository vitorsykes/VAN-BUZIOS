import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Van } from '../types';

export function useVans(line?: string) {
  const [vans, setVans] = useState<Van[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = collection(db, 'vans');
    if (line) {
      q = query(q, where('line', '==', line), where('active', '==', true)) as any;
    } else {
      q = query(q, where('active', '==', true)) as any;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vansData: Van[] = [];
      snapshot.forEach((doc) => {
        vansData.push({ id: doc.id, ...doc.data() } as Van);
      });
      setVans(vansData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [line]);

  return { vans, loading };
}
