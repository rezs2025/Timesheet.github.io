// src/features/users/components/UserForm.tsx
import React, { useState, useEffect } from 'react';
import { usersService } from '../services/user.service';
import type { CreateUserDto, UpdateUserDto, User } from '@/shared/types/user';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

interface UserFormProps {
  userId?: string | null;
  onSaved: () => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  userId,
  onSaved,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateUserDto>({
    fullName: '',
    email: '',
    password: '',
    role: 'employee',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del usuario si es edición
  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const user = await usersService.findOne(userId);
          setFormData({
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          });
        } catch (err: any) {
          setError(err.response?.data?.message ?? 'Error al cargar usuario');
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (userId) {
        // Actualizar usuario existente
        await usersService.update(userId, formData as UpdateUserDto);
      } else {
        // Crear nuevo usuario
        await usersService.create(formData);
      }

      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateUserDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre Completo</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          placeholder="Ingrese el nombre completo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="ejemplo@correo.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder=""
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Empleado</SelectItem>
            <SelectItem value="pm">Project Manager</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : userId ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};