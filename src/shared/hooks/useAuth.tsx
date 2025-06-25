import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authService, LoginDto, RegisterDto } from '../services/auth.service';
import { User } from '@/shared/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar axios con token si existe
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService
        .me()
        .then((u: User) => setUser(u))
        .catch(() => {
          localStorage.removeItem('token');
          setError('Sesión expirada. Por favor inicia sesión de nuevo.');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (dto: LoginDto) => {
    setLoading(true);
    setError(null);
    if (!dto.email || !dto.password) {
      setError('Email y contraseña son requeridos');
      setLoading(false);
      return;
    }
    try {
      const { token } = await authService.login(dto);
      localStorage.setItem('token', token);
      const u = await authService.me();
      setUser(u);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (dto: RegisterDto) => {
    setLoading(true);
    setError(null);
    if (!dto.email || !dto.password || !dto.fullName) {
      setError('Email, contraseña y nombre son requeridos');
      setLoading(false);
      return;
    }
    if (dto.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }
    if (dto.password !== dto.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
      setError('Email inválido');
      setLoading(false);
      return;
    }
    try {
      const { token } = await authService.register(dto);
      localStorage.setItem('token', token);
      const u = await authService.me();
      setUser(u);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
