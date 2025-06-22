import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAddOption } from '@/hooks/useOptions';

interface AddOptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  optionType: 'artists' | 'techniques' | 'locations' | 'artwork_types';
  onSuccess: (newOption: { id: string, name: string }) => void;
}

const typeLabels: Record<string, string> = {
  artists: 'Artista',
  techniques: 'Técnica',
  locations: 'Localización',
  artwork_types: 'Tipo de Obra',
};

export const AddOptionDialog: React.FC<AddOptionDialogProps> = ({ open, onOpenChange, optionType, onSuccess }) => {
  const [name, setName] = useState('');
  const addOptionMutation = useAddOption();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addOptionMutation.mutate({ type: optionType, name: name.trim() }, {
        onSuccess: (data) => {
          onSuccess(data);
          setName('');
          onOpenChange(false);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Nuevo {typeLabels[optionType]}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Nombre del ${typeLabels[optionType]}`}
            disabled={addOptionMutation.isPending}
          />
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={addOptionMutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || addOptionMutation.isPending}>
              {addOptionMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};