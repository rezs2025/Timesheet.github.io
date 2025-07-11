import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAuth } from '@/shared/hooks/useAuth';
import { UserPlus } from 'lucide-react';

export function RegisterPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { register, loading, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const { name, email, password, confirmPassword } = formData;
    const trimmedEmail = email.trim().toLowerCase();
    await register({
      fullName: name,
      email: trimmedEmail,
      password,
      confirmPassword
    });
    if (!loading && !error) {
      navigate('/');
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 min-h-screen items-center justify-center p-4", className)} {...props}>
      <Card className="overflow-hidden w-full max-w-md">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold">Crear cuenta</h1>
                <p className="text-balance text-muted-foreground">
                  Únete a TimeSheet para gestionar tu tiempo
                </p>
              </div>
              
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password"
                  name="password"
                  type="password" 
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input 
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password" 
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  required 
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </Button>
              
              <div className="text-center text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                  Inicia sesión
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterPage;