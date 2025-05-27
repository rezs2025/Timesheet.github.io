// hooks/useGeolocation.js
import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle'|'loading'|'success'|'error'
  const [accuracy, setAccuracy] = useState(null);

  // Opciones mejoradas para mobile
  const defaultOptions = {
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

    let watchId = null;
    let timeoutId = null;

    const handleSuccess = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      setLocation({ latitude, longitude });
      setAccuracy(accuracy);
      setStatus('success');
      setError(null);
      
      // Limpiar el watcher después de éxito
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (timeoutId) clearTimeout(timeoutId);
      
      // Cache para offline/reintentos
      localStorage.setItem('lastLocation', JSON.stringify({
        coords: { latitude, longitude },
        timestamp: Date.now()
      }));
    };

    const handleError = (err) => {
      // Intentar usar caché primero
      const cached = localStorage.getItem('lastLocation');
      if (cached) {
        const { coords, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 30 * 60 * 1000) { // 30 minutos
          setLocation(coords);
          setStatus('success');
          setError('Usando ubicación en caché (precisión limitada)');
          return;
        }
      }

      setError(getErrorMessage(err.code));
      setStatus('error');
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };

    const getLocation = () => {
      setStatus('loading');
      
      // 1. Intento rápido con getCurrentPosition
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        (firstError) => {
          console.warn('Primer intento fallido, usando watchPosition:', firstError);
          
          // 2. Fallback a watchPosition para móviles
          watchId = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            defaultOptions
          );
          
          // Timeout adicional para móviles con GPS lento
          timeoutId = setTimeout(() => {
            if (status === 'loading') {
              handleError({ code: 3, message: 'Timeout alcanzado' });
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
  }, []);

  return { location, error, status, accuracy };
};

// Mensajes de error optimizados para móviles
const getErrorMessage = (code) => {
  const messages = {
    1: 'Permiso denegado. Activa la ubicación en ajustes de tu teléfono.',
    2: 'Señal no disponible. Revisa tu conexión y GPS.',
    3: 'Tiempo excedido. Mueve tu teléfono a área abierta.',
    default: 'Error al obtener ubicación. Intenta recargar la app.'
  };
  return messages[code] || messages.default;
};