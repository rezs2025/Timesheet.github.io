import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { TimeEntry, UpdateTimeEntryData } from '@/features/time-entry/types';

interface EditEntryDialogProps {
  editingEntry: TimeEntry | null;
  onClose: () => void;
  onSubmit: (editForm: UpdateTimeEntryData) => void;
  projects: any[];
  loading: boolean;
}

const EditEntryDialog: React.FC<EditEntryDialogProps> = ({
  editingEntry,
  onClose,
  onSubmit,
  projects,
  loading,
}) => {
  const [editForm, setEditForm] = useState({
    checkInDate: '',
    checkInTime: '',
    checkOutDate: '',
    checkOutTime: '',
    projectId: '',
  });

  useEffect(() => {
    if (editingEntry) {
      // Parse ISO dates to separate date and time components
      const checkInDate = editingEntry.startTime ? new Date(editingEntry.startTime) : null;
      const checkOutDate = editingEntry.endTime ? new Date(editingEntry.endTime) : null;
      
      setEditForm({
        checkInDate: checkInDate ? checkInDate.toISOString().split('T')[0] : '',
        checkInTime: checkInDate ? checkInDate.toTimeString().slice(0, 5) : '',
        checkOutDate: checkOutDate ? checkOutDate.toISOString().split('T')[0] : '',
        checkOutTime: checkOutDate ? checkOutDate.toTimeString().slice(0, 5) : '',
        projectId: editingEntry.project.id || '',
      });
    }
  }, [editingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time
    const checkInDate = editForm.checkInDate && editForm.checkInTime 
      ? new Date(`${editForm.checkInDate}T${editForm.checkInTime}:00`)
      : undefined;

    const checkOutDate = editForm.checkOutDate && editForm.checkOutTime 
      ? new Date(`${editForm.checkOutDate}T${editForm.checkOutTime}:00`)
      : undefined;
    
    onSubmit({
      startTime: checkInDate,
      endTime: checkOutDate,
      projectId: editForm.projectId,
    });
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInDate">Fecha de Entrada</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={editForm.checkInDate}
                  onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                  required
                />
              </div>
              
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
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkOutDate">Fecha de Salida</Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={editForm.checkOutDate}
                  onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
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