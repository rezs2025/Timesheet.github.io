// src/shared/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Devuelve `value`, pero solo tras `delay` ms sin que cambie.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
