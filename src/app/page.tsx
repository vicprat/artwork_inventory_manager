/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client'
import { supabase } from '@/utils/supabase/client';
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EditableInputProps, EditableSelectProps, Product } from './types';
import { generateDescription, generateTags } from '@/utils/data';
import { EditIcon, SaveIcon, SearchIcon, UploadCloudIcon } from 'lucide-react';
import { Logger } from '@/utils/logger';

const SortIcon = ({ column }: { column: any }) => {
    if (column.getIsSorted() === 'asc') return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M18 15l-6-6-6 6"/></svg>;
    if (column.getIsSorted() === 'desc') return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M6 9l6 6 6-6"/></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 opacity-30"><path d="M8 9l4-4 4 4"/><path d="M16 15l-4 4-4-4"/></svg>;
};
const EditableInput = React.memo(({ value, onChange, type = 'text', placeholder, className, step }: EditableInputProps) => (
  <Input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={className} step={step} />
));
EditableInput.displayName = 'EditableInput';
const EditableSelect = React.memo(({ value, onChange, options, className }: EditableSelectProps) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className={className}><SelectValue /></SelectTrigger>
    <SelectContent>{options.map((option) => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent>
  </Select>
));
EditableSelect.displayName = 'EditableSelect';
const ImageUploader = ({ product, onImageUpdated }: { product: Product, onImageUpdated: () => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExtension = file.name.split('.').pop();
            const filePath = `products/${product.id}/${Date.now()}.${fileExtension}`;

            const { error: uploadError } = await supabase.storage
                .from('impulso-shop-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('impulso-shop-images')
                .getPublicUrl(filePath);

            const oldImagePath = product.images?.[0]?.supabase_path;

            if (product.images && product.images.length > 0) {
                const { error: updateError } = await supabase
                    .from('product_images')
                    .update({ supabase_url: publicUrl, supabase_path: filePath, updatedAt: new Date().toISOString() })
                    .eq('id', product.images[0].id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('product_images')
                    .insert({ 
                        product_id: product.id, 
                        supabase_url: publicUrl, 
                        supabase_path: filePath, 
                        original_url: file.name,
                        position: 1,
                    });
                if (insertError) throw insertError;
            }

            if (oldImagePath) {
                await supabase.storage.from('impulso-shop-images').remove([oldImagePath]);
            }
            
            Logger.success('Imagen actualizada correctamente.');
            onImageUpdated(); 

        } catch  {
            Logger.error('Error al subir la imagen:');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative w-14 h-14 group">
            <img 
                src={product.images?.[0]?.supabase_url || 'https://placehold.co/60x60/f0f0f0/ccc?text=?'} 
                alt={product.title} 
                className="w-14 h-14 object-cover rounded-md"
            />
            <div 
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleIconClick}
            >
                {isUploading ? 
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> :
                    <UploadCloudIcon className="text-white w-6 h-6" />
                }
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
            />
        </div>
    );
};


export default function App() {
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [saving, setSaving] = useState<boolean>(false);
    
    const [sorting, setSorting] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [totalProducts, setTotalProducts] = useState<number>(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const from = pagination.pageIndex * pagination.pageSize;
            const to = from + pagination.pageSize - 1;
            
            let query = supabase
                .from('products')
                .select(`*, product_images(*)`, { count: 'exact' });
            
            if (globalFilter && globalFilter.trim()) {
                // MODIFICADO: Añadir búsqueda en nuevos campos
                query = query.or(`title.ilike.%${globalFilter}%,vendor.ilike.%${globalFilter}%,type.ilike.%${globalFilter}%,artwork_medium.ilike.%${globalFilter}%,serie.ilike.%${globalFilter}%`);
            }

            const { data: productsData, error: productsError, count } = await query
                .order(sorting[0]?.id || 'createdAt', { ascending: sorting[0]?.desc === false || false })
                .range(from, to);

            if (productsError) throw productsError;

            const mappedData = productsData?.map(product => ({
                ...product,
                images: product.product_images || []
            })) || [];

            setData(mappedData);
            setTotalProducts(count || 0);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter]);

    useEffect(() => {
        const timer = setTimeout(() => { fetchData(); }, 500);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const handleSave = useCallback(async (rowIndex: number) => {
        // ... (sin cambios en esta función, ya que los nuevos campos se guardan automáticamente)
        const productToSave = data[rowIndex];
        if (!productToSave) return;
        setSaving(true);
        try {
            const updatedProduct = { ...productToSave };
            updatedProduct.body_html = generateDescription(updatedProduct);
            updatedProduct.tags = generateTags(updatedProduct);
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { images, product_images, ...productData } = updatedProduct;
            
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', productData.id);
                
            if (error) throw error;
            
            setEditingRow(null); 
            Logger.success(`Producto "${productData.title}" guardado.`);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unknown error');
            }
        } finally {
            setSaving(false);
        }
    }, [data]);
    
    const updateLocalData = useCallback((rowIndex: number, columnId: string, value: string) => {
        setData(old =>
            old.map((row, index) => {
                if (index === rowIndex) {
                    return { ...old[rowIndex], [columnId]: value };
                }
                return row;
            })
        );
    }, []);

    const statusOptions = useMemo(() => [
        { value: 'ACTIVE', label: 'Activo' },
        { value: 'DRAFT', label: 'Borrador' }
    ], []);

    const columns = useMemo<ColumnDef<Product>[]>(() => [
        { 
            accessorKey: 'images', 
            header: 'Imagen', 
            enableSorting: false, 
            cell: ({row}) => editingRow === row.index ? (
                // MODIFICADO: Usar el nuevo componente ImageUploader en modo edición
                <ImageUploader product={row.original} onImageUpdated={fetchData} />
            ) : (
                <img 
                    src={row.original.images?.[0]?.supabase_url || 'https://placehold.co/60x60/f0f0f0/ccc?text=?'} 
                    alt={row.original.title} 
                    className="w-14 h-14 object-cover rounded-md"
                />
            )
        },
        // --- Las columnas 'title', 'type', 'artwork_year' no tienen cambios ---
        { accessorKey: 'title', header: 'Título / Artista', cell: ({row}) => editingRow === row.index ? (<div className="flex flex-col gap-2"><EditableInput value={row.original.title} onChange={(value) => updateLocalData(row.index, 'title', value)} className="bg-yellow-50" placeholder="Título" /><EditableInput value={row.original.vendor} onChange={(value) => updateLocalData(row.index, 'vendor', value)} className="bg-yellow-50" placeholder="Artista" /></div>) : (<div><p className="font-bold text-gray-900">{row.original.title}</p><p className="text-gray-500 text-sm">{row.original.vendor}</p></div>) },
        { accessorKey: 'type', header: 'Tipo / Técnica', cell: ({row}) => editingRow === row.index ? (<div className="flex flex-col gap-2"><EditableInput value={row.original.type} onChange={(value) => updateLocalData(row.index, 'type', value)} className="bg-yellow-50" placeholder="Tipo" /><EditableInput value={row.original.artwork_medium} onChange={(value) => updateLocalData(row.index, 'artwork_medium', value)} className="bg-yellow-50" placeholder="Técnica" /></div>) : (<div><p className="font-semibold">{row.original.type}</p><p className="text-gray-500 text-xs truncate" style={{maxWidth: '150px'}}>{row.original.artwork_medium}</p></div>) },
        { accessorKey: 'artwork_year', header: 'Año', cell: ({row}) => editingRow === row.index ? (<EditableInput value={row.original.artwork_year} onChange={(value) => updateLocalData(row.index, 'artwork_year', value)} className="w-20 bg-yellow-50" type="number" placeholder="Año"/>) : (row.original.artwork_year) },

        // MODIFICADO: Columna 'dimensions' para incluir la profundidad
        { 
            id: 'dimensions', 
            header: 'Medidas (cm)', 
            enableSorting: false, 
            cell: ({row}) => editingRow === row.index ? (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                        <EditableInput type="number" value={row.original.artwork_height} onChange={(value) => updateLocalData(row.index, 'artwork_height', value)} className="w-16 bg-yellow-50" placeholder="Alto"/>
                        <span className="text-gray-400">x</span>
                        <EditableInput type="number" value={row.original.artwork_width} onChange={(value) => updateLocalData(row.index, 'artwork_width', value)} className="w-16 bg-yellow-50" placeholder="Ancho"/>
                    </div>
                     <EditableInput type="number" value={row.original.profundidad} onChange={(value) => updateLocalData(row.index, 'profundidad', value)} className="w-16 bg-yellow-50" placeholder="Prof."/>
                </div>
            ) : (
                `${row.original.artwork_height || '-'}h x ${row.original.artwork_width || '-'}w ${row.original.profundidad ? `x ${row.original.profundidad}d` : ''}`
            )
        },

        // +++ NUEVA COLUMNA: Serie +++
        {
            accessorKey: 'serie',
            header: 'Serie',
            cell: ({row}) => editingRow === row.index ? (
                <EditableInput
                    value={row.original.serie}
                    onChange={(value) => updateLocalData(row.index, 'serie', value)}
                    className="w-28 bg-yellow-50"
                    placeholder="Nombre de la serie"
                />
            ) : (
                row.original.serie
            )
        },
        // --- Las columnas 'artworkLocation', 'variantPrice', 'status', y 'actions' no tienen cambios ---
        { accessorKey: 'artworkLocation', header: 'Localización', cell: ({row}) => editingRow === row.index ? (<EditableInput value={row.original.artworkLocation} onChange={(value) => updateLocalData(row.index, 'artworkLocation', value)} className="w-28 bg-yellow-50" placeholder="Ubicación"/>) : (row.original.artworkLocation) },
        { accessorKey: 'variantPrice', header: 'Precio', cell: ({row}) => editingRow === row.index ? (<EditableInput type="number" step="0.01" value={row.original.variantPrice} onChange={(value) => updateLocalData(row.index, 'variantPrice', value)} className="w-24 bg-yellow-50" placeholder="Precio"/>) : (`$${Number(row.original.variantPrice || 0).toFixed(2)}`) },
        { accessorKey: 'status', header: 'Estatus', cell: ({row}) => editingRow === row.index ? (<EditableSelect value={row.original.status} onChange={(value) => updateLocalData(row.index, 'status', value)} options={statusOptions} className="bg-yellow-50"/>) : (<Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}>{row.original.status === 'ACTIVE' ? 'Activo' : 'Borrador'}</Badge>) },
        { id: 'actions', header: 'Acciones', cell: ({row}) => (<div className="text-center">{editingRow === row.index ? (<div className="flex items-center gap-2"><Button onClick={() => handleSave(row.index)} disabled={saving} size="sm" className="h-8 w-8 p-0"><SaveIcon /></Button><Button onClick={() => { setEditingRow(null); fetchData(); }} variant="ghost" size="sm" className="h-8 w-8 p-0">✕</Button></div>) : (<Button onClick={() => setEditingRow(row.index)} variant="ghost" size="sm" className="h-8 w-8 p-0"><EditIcon /></Button>)}</div>) }
    ], [editingRow, saving, statusOptions, updateLocalData, fetchData]); 
    
    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter, pagination },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        pageCount: Math.ceil(totalProducts / pagination.pageSize),
    });

    // El resto del JSX no necesita cambios
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Gestor de Datos de Obras de Arte</h1>
                    <p className="text-gray-600 mt-1">Edita, filtra y organiza los datos para Shopify.</p>
                </header>
                
                {error && (<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert"><p className="font-bold">Error</p><p>{error}</p></div>)}

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                        <div className="relative w-full max-w-sm">
                            <Input placeholder="Buscar..." value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-10" />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map(headerGroup => (<TableRow key={headerGroup.id}>{headerGroup.headers.map(header => (<TableHead key={header.id} className="cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}><div className="flex items-center">{flexRender(header.column.columnDef.header, header.getContext())}<SortIcon column={header.column} /></div></TableHead>))}</TableRow>))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.map(row => (<TableRow key={row.id} className={`${loading ? 'opacity-50' : ''} ${editingRow === row.index ? 'bg-yellow-50' : ''}`}>{row.getVisibleCells().map(cell => (<TableCell key={cell.id} className="align-top">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))}
                            </TableBody>
                        </Table>
                    </div>
                    
                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <p className="text-sm text-gray-600">Página <strong>{pagination.pageIndex + 1}</strong> de <strong>{table.getPageCount()}</strong> ({totalProducts} resultados)</p>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} variant="outline" size="sm">«</Button>
                            <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} variant="outline" size="sm">‹</Button>
                            <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} variant="outline" size="sm">›</Button>
                            <Button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} variant="outline" size="sm">»</Button>
                        </div>
                    </div>
                </div>
                
                <footer className="text-center text-sm text-gray-500 mt-8"><p>Artwork Data Manager v2.1.0</p></footer>
            </div>
        </div>
    );
}