import { useState, useEffect } from 'react';
import type { TimeEntryLocation } from '../types';

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface UseGeolocationReturn {
  location: TimeEntryLocation | null;
  error: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  accuracy: number | null;
  refresh: () => void;
}

export const useGeolocation = (options: GeolocationOptions = {}): UseGeolocationReturn => {
  const [location, setLocation] = useState<TimeEntryLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const defaultOptions: GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
    ...options
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada en tu navegador');
      setStatus('error');
      return;
    }

    let watchId: number | null = null;
    let timeoutId: number | null = null;

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      setLocation({ latitude, longitude, accuracy });
      setAccuracy(accuracy);
      setStatus('success');
      setError(null);
      
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(getErrorMessage(err.code));
      setStatus('error');
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };

    const getLocation = () => {
      setStatus('loading');
      setError(null);
      
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        (firstError) => {
          // Si el usuario deniega permisos (code 1), no intentar watchPosition
          if (firstError.code === 1) {
            handleError(firstError);
            return;
          }
          
          console.warn('Primer intento fallido, usando watchPosition:', firstError);
          
          watchId = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            defaultOptions
          );
          
          timeoutId = setTimeout(() => {
            if (status === 'loading') {
              handleError({ code: 3, message: 'Timeout alcanzado' } as GeolocationPositionError);
            }
          }, 20000);
        },
        defaultOptions
      );
    };

    getLocation();

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [refreshTrigger]);

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return { location, error, status, accuracy, refresh };
};

const getErrorMessage = (code: number): string => {
  const messages: Record<number, string> = {
    1: 'Permiso de ubicación denegado. Habilita la ubicación en tu navegador y recarga la página.',
    2: 'Señal no disponible. Revisa tu conexión y GPS.',
    3: 'Tiempo excedido. Mueve tu dispositivo a un área abierta e intenta de nuevo.'
  };
  return messages[code] || 'Error al obtener ubicación. Intenta recargar la app.';
};