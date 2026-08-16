import { useState, useCallback } from 'react';

export type GeoStatus = 'idle' | 'loading' | 'success' | 'denied' | 'unavailable' | 'timeout' | 'error';

export interface GeoCoords {
  lat: number;
  lng: number;
}

export interface UseGeolocationResult {
  status: GeoStatus;
  coords: GeoCoords | null;
  error: string | null;
  requestLocation: () => void;
  reset: () => void;
}

export function useGeolocation(): UseGeolocationResult {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus('success');
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setStatus('denied');
            setError('Location permission denied. Please enable location access in your browser settings to find nearby restaurants.');
            break;
          case err.POSITION_UNAVAILABLE:
            setStatus('unavailable');
            setError('Location is currently unavailable. Please check your connection and try again.');
            break;
          case err.TIMEOUT:
            setStatus('timeout');
            setError('Location request timed out. Please try again.');
            break;
          default:
            setStatus('error');
            setError('Unable to retrieve your location. Please try again.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setCoords(null);
    setError(null);
  }, []);

  return { status, coords, error, requestLocation, reset };
}
