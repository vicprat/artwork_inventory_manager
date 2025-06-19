/* eslint-disable @next/next/no-img-element */
import { ColumnDef, RowData } from '@tanstack/react-table';
import { EditIcon, SaveIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { artistOptions, locationOptions, techniqueOptions, typeOptions } from '@/lib/constants';
import {  Product } from '@/types';
import { ImageUploader } from '@/components/ImageUploader';
import React from 'react';
import { EditableInput } from '@/components/EditableInput';
import { EditableSelect } from '@/components/EditableSelect';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    editingRow: number | null;
    editingData: TData | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateLocalData: (columnId: string, value: any) => void;
    cancelEditing: () => void;
    startEditingStable: (rowIndex: number, product: TData) => void;
    handleSave: () => void;
    statusOptions: { value: string; label: string }[];
    isSaving: boolean;
  }
}

export const columns: ColumnDef<Product>[] = [
  { 
    accessorKey: 'images', 
    header: 'Imagen',
    size: 80,
    enableSorting: false, 
    cell: ({ row, table }) => {
      const meta = table.options.meta;
      if (!meta) return null;
      
      return meta.editingRow === row.index ? (
        <div className="w-16 h-16 flex-shrink-0">
          <ImageUploader product={meta.editingData || row.original} />
        </div>
      ) : (
        <div className="w-16 h-16 flex-shrink-0">
          <img 
            src={row.original.images?.[0]?.supabase_url || 'https://placehold.co/60x60/f0f0f0/ccc?text=?'} 
            alt={row.original.title} 
            className="w-14 h-14 object-cover rounded-md"
          />
        </div>
      );
    }
  },
  { 
    accessorKey: 'title', 
    header: 'Título / Artista',
    size: 220, 
    cell: ({ row, table }) => {
      const meta = table.options.meta;
      if (!meta) return null;
      
      return meta.editingRow === row.index ? (
        <div className="w-52 flex flex-col gap-2">
          <EditableInput 
            value={meta.editingData?.title || ''} 
            onChange={(value) => meta.updateLocalData('title', value)} 
            className="bg-yellow-50 w-full" 
            placeholder="Título" 
          />
          <EditableSelect 
            value={meta.editingData?.vendor || ''} 
            onChange={(value) => meta.updateLocalData('vendor', value)} 
            options={artistOptions} 
            className="bg-yellow-50 w-full" 
          />
        </div>
      ) : (
        <div className="w-52">
          <div className="group relative">
            <p 
              className="font-bold text-gray-900 truncate cursor-help" 
              title={row.original.title} 
            >
              {row.original.title}
            </p>
            <p 
              className="text-gray-500 text-sm truncate cursor-help" 
              title={row.original.vendor}
            >
              {row.original.vendor}
            </p>
            
            {(row.original.title?.length > 25 || (row.original.vendor && row.original.vendor.length > 25)) && (
              <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 max-w-xs shadow-lg pointer-events-none">
                <div className="font-semibold">{row.original.title}</div>
                {row.original.vendor && (
                  <div className="text-gray-300">{row.original.vendor}</div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
  },
  { 
    accessorKey: 'type', 
    header: 'Tipo / Técnica',
    size: 180,
    cell: ({ row, table }) => {
      const meta = table.options.meta;
      if (!meta) return null;
      
      return meta.editingRow === row.index ? (
        <div className="w-44 flex flex-col gap-2">
          <EditableSelect 
            value={meta.editingData?.type || ''} 
            onChange={(value) => meta.updateLocalData('type', value)} 
            options={typeOptions} 
            className="bg-yellow-50 w-full" 
          />
          <EditableSelect 
            value={meta.editingData?.artwork_medium || ''} 
            onChange={(value) => meta.updateLocalData('artwork_medium', value)} 
            options={techniqueOptions} 
            className="bg-yellow-50 w-full" 
          />
        </div>
      ) : (
        <div className="w-44">
          <div className="group relative">
            <p className="font-semibold truncate" title={row.original.type}>
              {row.original.type}
            </p>
            <p 
              className="text-gray-500 text-xs truncate cursor-help" 
              title={row.original.artwork_medium}
            >
              {row.original.artwork_medium}
            </p>

            {row.original.artwork_medium && row.original.artwork_medium.length > 20 && (
              <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 max-w-xs shadow-lg pointer-events-none">
                {row.original.artwork_medium}
              </div>
            )}
          </div>
        </div>
      );
    }
  },
  { 
    accessorKey: 'artwork_year', 
    header: 'Año',
    size: 80, 
    cell: ({ row, table }) => {
      const meta = table.options.meta;
      if (!meta) return null;
      
      return meta.editingRow === row.index ? (
        <div className="w-20">
          <EditableInput 
            value={meta.editingData?.artwork_year || ''} 
            onChange={(value) => meta.updateLocalData('artwork_year', value)} 
            className="w-full bg-yellow-50" 
            type="number" 
            placeholder="Año"
          />
        </div>
      ) : (
        <div className="w-20 text-center">
          {row.original.artwork_year || '-'}
        </div>
      );
    }
  },
  { 
    id: 'dimensions', 
    header: 'Medidas (cm)',
    size: 140, 
    enableSorting: false, 
    cell: ({ row, table }) => {
      const meta = table.options.meta;
      if (!meta) return null;
      
      return meta.editingRow === row.index ? (
        <div className="w-36 flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <EditableInput 
              type="number" 
              value={meta.editingData?.artwork_height || ''} 
              onChange={(value) => meta.updateLocalData('artwork_height', value)} 
              className="w-14 bg-yellow-50 text-xs" 
              placeholder="H"
            />
            <span className="text-gray-400 text-xs">×</span>
            <EditableInput 
              type="number" 
              value={meta.editingData?.artwork_width || ''} 
              onChange={(value) => meta.updateLocalData('artwork_width', value)} 
              className="w-14 bg-yellow-50 text-xs" 
              placeholder="W"
            />
          </div>
          <EditableInput 
            type="number" 
            value={meta.editingData?.profundidad || ''} 
            onChange={(value) => meta.updateLocalData('profundidad', value)} 
            className="w-14 bg-yellow-50 text-xs" 
            placeholder="P"
          />
        </div>
      ) : (
        <div className="w-36 text-sm text-center">
          <span className="font-mono">
            {row.original.artwork_height || '-'}h × {row.original.artwork_width || '-'}w
            {row.original.profundidad && (
              <><br />× {row.original.profundidad}d</>
            )}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'serie',
    header: 'Serie',
    size: 150, 
    cell: ({ row, table }) => {
      const meta = table.options.meta;
      if (!meta) return null;
      
      return meta.editingRow === row.index ? (
        <div className="w-36">
          <EditableInput
            value={meta.editingData?.serie || ''}
            onChange={(value) => meta.updateLocalData('serie', value)}
            className="w-full bg-yellow-50"
            placeholder="Serie"
          />
        </div>
      ) : (
        <div className="w-36">
          <div className="group relative">
            <span 
              className="truncate block cursor-help" 
              title={row.original.serie}
            >
              {row.original.serie || '-'}
            </span>
            
            {row.original.serie && row.original.serie.length > 18 && (
              <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 max-w-xs shadow-lg pointer-events-none">
                {row.original.serie}
              </div>
            )}
          </div>
        </div>
      );
    }
  },
  { 
    accessorKey: 'artworkLocation', 
    header: 'Localización',
    size: 130,
    cell: ({ row, table }) => {
      const meta = table.options.meta;
      if (!meta) return null;
      
      return meta.editingRow === row.index ? (
        <div className="w-32">
          <EditableSelect 
            value={meta.editingData?.artworkLocation || ''} 
            onChange={(value) => meta.updateLocalData('artworkLocation', value)} 
            options={locationOptions} 
            className="w-full bg-yellow-50" 
          />
        </div>
      ) : (
        <div className="w-32">
          <span 
            className="truncate block text-sm" 
            title={row.original.artworkLocation}
          >
            {row.original.artworkLocation || '-'}
          </span>
        </div>
      );
    } 
  },
  { 
    accessorKey: 'variantPrice', 
    header: 'Precio',
    size: 100, 
    cell: ({ row, table }) => {
      const meta = table.options.meta;
      if (!meta) return null;
      
      return meta.editingRow === row.index ? (
        <div className="w-24">
          <EditableInput 
            type="number" 
            step="0.01" 
            value={meta.editingData?.variantPrice || ''} 
            onChange={(value) => meta.updateLocalData('variantPrice', value)} 
            className="w-full bg-yellow-50 text-sm" 
            placeholder="0.00"
          />
        </div>
      ) : (
        <div className="w-24 text-right font-mono text-sm">
          ${Number(row.original.variantPrice || 0).toFixed(2)}
        </div>
      );
    } 
  },
  { 
    accessorKey: 'status', 
    header: 'Estatus',
    size: 110, 
    cell: ({ row, table }) => {
      const meta = table.options.meta;
      if (!meta) return null;
      
      return meta.editingRow === row.index ? (
        <div className="w-26">
          <EditableSelect 
            value={meta.editingData?.status || ''} 
            onChange={(value) => meta.updateLocalData('status', value)} 
            options={meta.statusOptions} 
            className="w-full bg-yellow-50"
          />
        </div>
      ) : (
        <div className="w-26 flex justify-center">
          <Badge 
            variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}
            className="text-xs px-2 py-1"
          >
            {row.original.status === 'ACTIVE' ? 'Activo' : 'Borrador'}
          </Badge>
        </div>
      );
    } 
  },
  { 
    id: 'actions', 
    header: 'Acciones',
    size: 100, 
    enableSorting: false,
    cell: ({ row, table }) => {
      const meta = table.options.meta;
      if (!meta) return null;
      
      return (
        <div className="w-24 flex justify-center">
          {meta.editingRow === row.index ? (
            <div className="flex items-center gap-1">
              <Button 
                onClick={meta.handleSave} 
                disabled={meta.isSaving} 
                size="sm" 
                className="h-7 w-7 p-0"
                title="Guardar cambios"
              >
                {meta.isSaving ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <SaveIcon className="h-3 w-3" />
                )}
              </Button>
              <Button 
                onClick={meta.cancelEditing} 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0"
                disabled={meta.isSaving}
                title="Cancelar edición"
              >
                <span className="text-xs">✕</span>
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => meta.startEditingStable(row.index, row.original)} 
              variant="ghost"
              size="sm" 
              className="h-7 w-7 p-0"
              title="Editar producto"
            >
              <EditIcon className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    } 
  }
];