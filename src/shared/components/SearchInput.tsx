// src/shared/components/SearchInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface SearchInputProps {
  /** Valor inicial del buscador */
  initialValue?: string;
  /** Tiempo de debounce en ms */
  delay?: number;
  /** Callback cuando cambia el valor debounced */
  onSearch: (value: string) => void;
  /** Placeholder del input */
  placeholder?: string;
  /** Clase CSS adicional */
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  initialValue = '',
  delay = 200,
  onSearch,
  placeholder = 'Buscar...',
  className,
}) => {
  const [value, setValue] = useState<string>(initialValue);
  const debouncedValue = useDebounce<string>(value, delay);
  const isFirstRender = useRef(true);

  // Cuando el valor debounced cambia, llamamos al callback
  useEffect(() => {
    // No ejecutar onSearch en el primer render si el valor es igual al inicial
    if (isFirstRender.current && debouncedValue === initialValue) {
      isFirstRender.current = false;
      return;
    }
    isFirstRender.current = false;
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch, initialValue]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-transparent"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Limpiar búsqueda</span>
        </Button>
      )}
    </div>
  );
};