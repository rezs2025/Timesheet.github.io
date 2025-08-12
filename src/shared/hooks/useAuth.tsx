import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { authService, LoginDto, RegisterDto } from "../services/auth.service";
import { User } from "@/shared/types/user";

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

  useEffect(() => {
    const handleUnauthorized = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const message = detail?.message || "Session expired.";
      
      localStorage.removeItem("token");
      setUser(null);
      setError(message);
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  // Inicializar axios con token si existe
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Timeout para evitar loading muy largo
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError(
          "Verification is taking longer than expected. Try reloading the page."
        );
      }, 8000);

      authService
        .me()
        .then(async (u: User) => {
          clearTimeout(timeoutId);
          setUser(u);
        })
        .catch(() => {
          clearTimeout(timeoutId);
          localStorage.removeItem("token");
          setError("Session expired. Please sign in again.");
        })
        .finally(() => {
          clearTimeout(timeoutId);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (dto: LoginDto) => {
    setLoading(true);
    setError(null);
    if (!dto.email || !dto.password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }
    try {
      const { token } = await authService.login(dto);
      localStorage.setItem("token", token);
      const u = await authService.me();
      setUser(u);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (dto: RegisterDto) => {
    setLoading(true);
    setError(null);
    if (!dto.email || !dto.password || !dto.fullName) {
      setError("Email, password and name are required");
      setLoading(false);
      return;
    }
    if (dto.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    if (dto.password !== dto.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
      setError("Invalid email");
      setLoading(false);
      return;
    }
    try {
      const { token } = await authService.register(dto);
      localStorage.setItem("token", token);
      const u = await authService.me();
      setUser(u);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error registering user");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
