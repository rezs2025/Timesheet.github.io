// src/shared/components/SearchInput.tsx
import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDebounce } from '../hooks/useDebounce';
import { ClearIcon } from '@mui/x-date-pickers/icons';

interface SearchInputProps {
  /** Valor inicial del buscador */
  initialValue?: string;
  /** Tiempo de debounce en ms */
  delay?: number;
  /** Callback cuando cambia el valor debounced */
  onSearch: (value: string) => void;
  /** Placeholder del input */
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  initialValue = '',
  delay = 200,
  onSearch,
  placeholder = 'Buscar...',
}) => {
  const [value, setValue] = useState<string>(initialValue);
  const debouncedValue = useDebounce<string>(value, delay);

  // Cuando el valor debounced cambia, llamamos al callback
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={e => setValue(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} edge="end">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
};
