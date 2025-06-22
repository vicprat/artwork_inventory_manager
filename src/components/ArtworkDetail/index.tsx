'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, SaveIcon, RefreshCwIcon} from 'lucide-react';

import { Product } from '@/types';
import { useUpdateProduct } from '@/hooks/useProducts';
import { parseTags, generateTags, isAutoTag } from '@/utils/data';
import { artistOptions, locationOptions, techniqueOptions, typeOptions } from '@/lib/constants';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/ImageUploader';
import { MultiSelect } from '../ui/multi-select';
import { Tiptap } from '@/components/TipTap'; 


const fetchTags = async (): Promise<string[]> => {
    const res = await fetch('/api/tags');
    if (!res.ok) throw new Error('Failed to fetch tags');
    return res.json();
};


export const ArtworkDetail: React.FC<{ artwork: Product }> = ({ artwork }) => {
  const [editedArtwork, setEditedArtwork] = useState<Product>(artwork);
  const updateProductMutation = useUpdateProduct();
  const { data: allTags = [], isLoading: isLoadingTags } = useQuery<string[]>({ queryKey: ['allTags'], queryFn: fetchTags });
  const parsedTags = useMemo(() => parseTags(editedArtwork.tags), [editedArtwork.tags]);
  const [manualTags, setManualTags] = useState<string[]>(parsedTags.manualTags);

  useEffect(() => {
    const newTagsString = generateTags(editedArtwork, manualTags);
    if (newTagsString !== editedArtwork.tags) {
      handleInputChange('tags', newTagsString);
    }
   
  }, [manualTags, editedArtwork]);
  
  const handleInputChange = (field: keyof Product, value: string | number | boolean | null) => {
    setEditedArtwork(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = useCallback(() => {
    const finalProduct = { ...editedArtwork, tags: generateTags(editedArtwork, manualTags) };
    updateProductMutation.mutate(finalProduct, {
      onSuccess: (data) => {
        setEditedArtwork(data);
        const newParsed = parseTags(data.tags);
        setManualTags(newParsed.manualTags);
      }
    });
  }, [editedArtwork, manualTags, updateProductMutation]);

  const isDirty = JSON.stringify(artwork) !== JSON.stringify(editedArtwork);

  const manualTagOptions = useMemo(() => {
    return allTags
      .filter(tag => !isAutoTag(tag)) 
      .map(tag => ({ value: tag, label: tag }));
  }, [allTags]);

  console.log('Manual Tag Options:', manualTagOptions);


  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/" passHref>
                <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
                  <ArrowLeftIcon className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 line-clamp-1" title={artwork.title}>{artwork.title}</h1>
                <p className="text-sm text-gray-500">Editando detalles de la obra.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={!isDirty || updateProductMutation.isPending}>
              {updateProductMutation.isPending ? (
                <><RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                <><SaveIcon className="mr-2 h-4 w-4" /> Guardar Cambios</>
              )}
            </Button>
              {editedArtwork.status === 'ACTIVE' ? (
                      <Button variant="destructive"  onClick={() => handleInputChange('status', 'DRAFT')} >
                          Pasar a Borrador
                      </Button>
                  ) : (
                      <Button variant="default"  onClick={() => handleInputChange('status', 'ACTIVE')} className="bg-green-600 hover:bg-green-700">
                          Publicar Obra
                      </Button>
                  )}
              </div>
            
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">

             <Card className='max-h-1/2 overflow-hidden'>
              <CardHeader><CardTitle>Imágen Principal</CardTitle></CardHeader>
              <CardContent>
                <ImageUploader product={editedArtwork} />
              </CardContent>
            </Card>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles Principales</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input value={editedArtwork.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Título de la obra" />
                </div>
                <div>
                   <label className="text-sm font-medium">Precio (MXN)</label>
                 <Input value={editedArtwork.variantPrice || ''} onChange={(e) => handleInputChange('variantPrice', parseFloat(e.target.value) || 0)} placeholder="0.00" type="number" step="0.01"/>
                </div>

                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Tiptap.Editor
                    content={editedArtwork.body_html || ''}
                    onChange={(content) => handleInputChange('body_html', content)}
                  />
                </div>
              </CardContent>
            </Card>
        </div>

          <div className="lg:col-span-1 flex flex-col gap-6">

            <Card>
              <CardHeader><CardTitle>Organización</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center w-full justify-between">
                <div>
                  <label className="text-sm font-medium">Artista</label>
                  <Select value={editedArtwork.vendor || ''} onValueChange={(v) => handleInputChange('vendor', v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar Artista" /></SelectTrigger>
                      <SelectContent>{artistOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                 <div>
                  <label className="text-sm font-medium">Tipo de Obra</label>
                  <Select value={editedArtwork.type || ''} onValueChange={(v) => handleInputChange('type', v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar Tipo" /></SelectTrigger>
                      <SelectContent>{typeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Técnica</label>
                  <Select value={editedArtwork.artwork_medium || ''} onValueChange={(v) => handleInputChange('artwork_medium', v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar Técnica" /></SelectTrigger>
                      <SelectContent>{techniqueOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                </div>

                  <label className="text-sm font-medium">Dimensiones (cm)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-sm font-medium">Alto</label>
                      <Input value={editedArtwork.artwork_height || ''} onChange={(e) => handleInputChange('artwork_height', e.target.value)} placeholder="Alto" type="number" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ancho</label>
                      <Input value={editedArtwork.artwork_width || ''} onChange={(e) => handleInputChange('artwork_width', e.target.value)} placeholder="Ancho" type="number" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Profundidad</label>
                      <Input value={editedArtwork.profundidad || ''} onChange={(e) => handleInputChange('profundidad', e.target.value)} placeholder="Prof." type="number" />
                  </div>
                    
                </div>
                <div>
                   <label className="text-sm font-medium">Año</label>
                   <Input value={editedArtwork.artwork_year || ''} onChange={(e) => handleInputChange('artwork_year', e.target.value)} placeholder="Año" type="number" />
                </div>
                 <div>
                   <label className="text-sm font-medium">Serie</label>
                   <Input value={editedArtwork.serie || ''} onChange={(e) => handleInputChange('serie', e.target.value)} placeholder="Nombre de la serie"/>
                </div>
                <div>
                   <label className="text-sm font-medium">Localización</label>
                   <Select value={editedArtwork.artworkLocation || ''} onValueChange={(v) => handleInputChange('artworkLocation', v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar Localización" /></SelectTrigger>
                      <SelectContent>{locationOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
              </CardContent>
            </Card>

          <Card>
                        <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Tags Manuales</label>
                                <MultiSelect
                                    options={manualTagOptions}
                                    selected={manualTags}
                                    onChange={setManualTags}
                                    placeholder={isLoadingTags ? 'Cargando...' : 'Añadir tags manuales...'}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Tags Autogenerados</label>
                                <div className="flex flex-wrap gap-2">
                                    {parsedTags.autoTags.length > 0 ? (
                                        parsedTags.autoTags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)
                                    ) : (<p className="text-sm text-gray-500">Ninguno.</p>)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
          </div>

        </main>
      </div>
    </div>
  );
};