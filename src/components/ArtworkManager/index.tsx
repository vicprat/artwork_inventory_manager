/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use client'
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, RowSelectionState, useReactTable } from '@tanstack/react-table';
import React, { useState, useCallback, useMemo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {  SearchIcon, RefreshCwIcon, DownloadIcon, TriangleAlertIcon, Trash2Icon } from 'lucide-react';

import { 
  useProducts, 
  useUpdateProduct, 
  useInvalidateProducts,
  useDeleteMultipleProducts,
  useDeleteProduct 
} from '@/hooks/useProducts';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/Pagination';
import { columns } from '@/utils/columns'; 
import { Option, Product } from '@/types';
import { useOptions } from '@/hooks/useOptions';
import Link from 'next/link';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const SortIcon = ({ column }: { column: any }) => {
    if (column.getIsSorted() === 'asc') return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M18 15l-6-6-6 6"/></svg>;
    if (column.getIsSorted() === 'desc') return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M6 9l6 6 6-6"/></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 opacity-30"><path d="M8 9l4-4 4 4"/><path d="M16 15l-4 4-4-4"/></svg>;
};

export default function ArtworkManager() {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Product | null>(null);
  const [sorting, setSorting] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({}); 
  const [isConfirmExportOpen, setIsConfirmExportOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false); 
  const [isExporting, setIsExporting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSingleConfirmDeleteOpen, setIsSingleConfirmDeleteOpen] = useState(false);


   const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = searchParams.get('page') ?? '1';
  const pageSize = searchParams.get('pageSize') ?? '20';


 const paginationConfig = useMemo(() => ({
    initialPageIndex: parseInt(page, 10) - 1,
    initialPageSize: parseInt(pageSize, 10),
    pageSizeOptions: [10, 20, 50, 100],
  }), [page, pageSize]);

  const {
    data: queryResult,
    isLoading,
    error,
    isFetching,
  } = useProducts({
    pageIndex: paginationConfig.initialPageIndex,
    pageSize: paginationConfig.initialPageSize,
    sorting,
    globalFilter,
  });
  

  const totalProducts = queryResult?.total ?? 0;
  const paginationState = usePagination(totalProducts, paginationConfig);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(paginationState.pagination.pageIndex + 1));
    params.set('pageSize', String(paginationState.pagination.pageSize));
    router.replace(`${pathname}?${params.toString()}`);
  }, [paginationState.pagination.pageIndex, paginationState.pagination.pageSize, pathname, router, searchParams]);
 

  const {
    data: actualQueryResult,
    isLoading: isActualLoading,
    error: actualError,
    isFetching: isActualFetching,
  } = useProducts({
    pageIndex: paginationState.pagination.pageIndex,
    pageSize: paginationState.pagination.pageSize,
    sorting,
    globalFilter,
  });

  const updateProductMutation = useUpdateProduct();
  const deleteMultipleProductsMutation = useDeleteMultipleProducts();
  const deleteProductMutation = useDeleteProduct();
  const { invalidateProductLists } = useInvalidateProducts();

  const { data: artistOptions = [] } = useOptions('artists');
  const { data: techniqueOptions = [] } = useOptions('techniques');
  const { data: locationOptions = [] } = useOptions('locations');
  const { data: typeOptions = [] } = useOptions('artwork_types');



  const data = actualQueryResult?.data || [];
  const actualTotalProducts = actualQueryResult?.total || 0;

  const handleSave = useCallback(() => {
    const currentEditingData = editingData;
    if (currentEditingData) {
      updateProductMutation.mutate(currentEditingData, {
        onSuccess: () => {
          setEditingRow(null);
          setEditingData(null);
        },
      });
    }
  }, [editingData, updateProductMutation]);
  
  const updateLocalData = useCallback((columnId: string, value: string) => {
    setEditingData(prev => prev ? { ...prev, [columnId]: value } : null);
  }, []);

  const startEditingStable = useCallback((rowIndex: number, product: Product) => {
    setEditingRow(rowIndex);
    setEditingData({ ...product });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingRow(null);
    setEditingData(null);
  }, []);

  const handleRefresh = useCallback(() => {
    invalidateProductLists();
  }, [invalidateProductLists]);

  const statusOptions = useMemo(() => [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'DRAFT', label: 'Borrador' }
  ], []);

  const mapToSelectOptions = (options: Option[]) => options.map(o => ({ value: o.name, label: o.name }));

  const handleDeleteSelected = () => {
    const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id);
    if (selectedIds.length > 0) {
      deleteMultipleProductsMutation.mutate(selectedIds, {
        onSuccess: () => {
          table.resetRowSelection();
          setIsConfirmDeleteOpen(false);
        }
      });
    }
  };

  const startDeleting = (product: Product) => {
    setProductToDelete(product);
    setIsSingleConfirmDeleteOpen(true);
  };

  const handleConfirmSingleDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id, {
        onSuccess: () => {
          setIsSingleConfirmDeleteOpen(false);
          setProductToDelete(null);
          invalidateProductLists();
        },
      });
    }
  };

 
 const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      pagination: paginationState.pagination
    },
    enableRowSelection: true, 
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: paginationState.onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: paginationState.totalPages,
     meta: {
      startDeleting,
      editingRow,
      editingData,
      updateLocalData,
      cancelEditing,
      startEditingStable,
      handleSave,
      statusOptions,
      isSaving: updateProductMutation.isPending,
      artistOptions: mapToSelectOptions(artistOptions),
      techniqueOptions: mapToSelectOptions(techniqueOptions),
      locationOptions: mapToSelectOptions(locationOptions),
      typeOptions: mapToSelectOptions(typeOptions),
    }
  });

    const numSelected = Object.keys(rowSelection).length;

   const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/csv');
      if (!response.ok) {
        throw new Error('Falló la exportación');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shopify_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error al exportar:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (actualError || error) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded max-w-md">
          <p className="font-bold">Error al cargar los datos</p>
          <p className="mb-4">{(actualError || error)?.message}</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestor de Datos de Obras de Arte</h1>
              <p className="text-gray-600 mt-1">Edita, filtra y organiza los datos para Shopify.</p>
              <Link href="/guide" >
                <Button  className='my-2 hover:cursor-pointer' >
                  Ver guía de uso
                </Button>
              </Link>
            </div>
       <div className="flex items-center gap-2">
             <Button 
                  onClick={() => setIsConfirmExportOpen(true)}
                  variant="outline"
                  disabled={isExporting}
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Exportar a CSV
                </Button>
              <Button 
                onClick={handleRefresh}
                variant="outline"
                disabled={isActualFetching || isFetching}
              >
                <RefreshCwIcon className={`w-4 h-4 mr-2 ${(isActualFetching || isFetching) ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
            
          </div>
          
          {(isActualFetching || isFetching) && (
            <div className="mt-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Actualizando datos...
              </div>
            </div>
          )}

         <div className="mt-4 flex items-center justify-end w-full">
          {numSelected > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {numSelected} seleccionado(s)
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  disabled={deleteMultipleProductsMutation.isPending}
                  >
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Borrar
                </Button>
              </div>
            )}
            </div> 

        </header>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Input 
                placeholder="Buscar..." 
                value={globalFilter ?? ''} 
                onChange={(e) => setGlobalFilter(e.target.value)} 
                className="pl-10" 
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
         <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead 
                        key={header.id} 
                        className="cursor-pointer select-none" 
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon column={header.column} />
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {(isActualLoading || isLoading) ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-10">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <span>Cargando productos...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-10 text-gray-500">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <TableRow 
                      key={row.id} 
                      className={`${editingRow === row.index ? 'bg-yellow-50' : ''}`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="align-top">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <Pagination
              currentPage={paginationState.currentPage}
              totalPages={paginationState.totalPages}
              pageSize={paginationState.pagination.pageSize}
              totalItems={actualTotalProducts}
              onPageChange={paginationState.setPage}
              onPageSizeChange={paginationState.setPageSize}
              isLoading={isActualFetching || isFetching}
              disabled={isActualLoading || isLoading}
              showPageSizeSelector={true}
              showGoToPage={true}
              showPageInfo={true}
              showFirstLast={true}
              maxVisiblePages={5}
              size="md"
              className="w-full"
              pageSizeOptions={[10, 20, 50, 100]}
            />
          </div>
        </div>
        
      </div>
        <Dialog open={isConfirmExportOpen} onOpenChange={setIsConfirmExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exportación de Inventario</DialogTitle>
            <DialogDescription>
              <Alert  className="mt-4">
                <TriangleAlertIcon className="h-4 w-4" />
                <AlertTitle>¡Atención!</AlertTitle>
                <AlertDescription>
                  Esta función debe ser utilizada solo cuando el inventario haya sido revisado y actualizado correctamente. El archivo resultante se usará para la importación masiva en Shopify.
                </AlertDescription>
              </Alert>
              <p className="mt-4 text-sm text-gray-600">
                ¿Estás seguro de que quieres proceder con la exportación?
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={() => {
                setIsConfirmExportOpen(false); 
                handleExport(); 
              }}
              disabled={isExporting}
            >
              {isExporting 
                ? <><RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" /> Exportando...</> 
                : "Sí, proceder y exportar"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Borrado</DialogTitle>
            <DialogDescription>
              <Alert variant="destructive" className="mt-4">
                <TriangleAlertIcon className="h-4 w-4" />
                <AlertTitle>¡Acción Irreversible!</AlertTitle>
                <AlertDescription>
                  Estás a punto de borrar permanentemente {numSelected} obra(s) de arte. Esta acción no se puede deshacer.
                </AlertDescription>
              </Alert>
              <p className="mt-4 text-sm text-gray-600">
                ¿Estás seguro de que quieres continuar?
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleteMultipleProductsMutation.isPending}>Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={deleteMultipleProductsMutation.isPending}
            >
              {deleteMultipleProductsMutation.isPending 
                ? <><RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" /> Borrando...</> 
                : "Sí, borrar permanentemente"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSingleConfirmDeleteOpen} onOpenChange={setIsSingleConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Borrado</DialogTitle>
            <DialogDescription>
              <p className="mt-4 text-sm text-gray-600">
                ¿Estás seguro de que quieres borrar permanentemente la obra{' '}
                <strong className="text-gray-900">{productToDelete?.title}</strong>? 
                Esta acción no se puede deshacer.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSingleConfirmDeleteOpen(false)}
              disabled={deleteProductMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmSingleDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending 
                ? <><RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" /> Borrando...</> 
                : "Sí, borrar"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}