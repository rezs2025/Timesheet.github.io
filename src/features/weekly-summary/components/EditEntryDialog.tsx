import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

interface EditEntryDialogProps {
  editingEntry: any;
  onClose: () => void;
  onSubmit: (editForm: any) => void;
  projects: any[];
  users: any[];
  loading: boolean;
}

const EditEntryDialog: React.FC<EditEntryDialogProps> = ({
  editingEntry,
  onClose,
  onSubmit,
  projects,
  users,
  loading,
}) => {
  const [editForm, setEditForm] = useState({
    checkInTime: '',
    checkOutTime: '',
    lunchDuration: '60',
    projectId: '',
  });

  useEffect(() => {
    if (editingEntry) {
      setEditForm({
        checkInTime: editingEntry.checkInTime || '',
        checkOutTime: editingEntry.checkOutTime || '',
        lunchDuration: editingEntry.lunchDuration || '60',
        projectId: editingEntry.projectId || '',
      });
    }
  }, [editingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(editForm);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (!editingEntry) return null;

  return (
    <Dialog open={!!editingEntry} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Registro</DialogTitle>
          <DialogDescription>
            Modifica los datos del registro de tiempo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInTime">Hora de Entrada</Label>
              <Input
                id="checkInTime"
                type="time"
                value={editForm.checkInTime}
                onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="checkOutTime">Hora de Salida</Label>
              <Input
                id="checkOutTime"
                type="time"
                value={editForm.checkOutTime}
                onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lunchDuration">Tiempo de Almuerzo (minutos)</Label>
            <Input
              id="lunchDuration"
              type="number"
              min="0"
              max="120"
              value={editForm.lunchDuration}
              onChange={(e) => handleInputChange('lunchDuration', e.target.value)}
              required
            />
          </div>

          {projects.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="project">Proyecto</Label>
              <Select value={editForm.projectId} onValueChange={(value) => handleInputChange('projectId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEntryDialog;