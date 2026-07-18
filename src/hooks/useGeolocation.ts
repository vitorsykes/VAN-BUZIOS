import { useState, useEffect, useCallback } from 'react';
import { GeoLocation } from '../types';

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(0);

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada por este navegador.');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        
        const currentSpeed = position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0;
        setSpeed(currentSpeed);
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0, // Force bypass cache
      }
    );
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada por este navegador.');
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        
        // Convert speed from m/s to km/h
        const currentSpeed = position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0;
        setSpeed(currentSpeed);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  return { location, speed, error, refreshLocation };
}
