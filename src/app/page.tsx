/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use client'
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import React, { useState, useCallback, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {  SearchIcon, RefreshCwIcon } from 'lucide-react';

import { 
  useProducts, 
  useUpdateProduct, 
  useInvalidateProducts 
} from '@/hooks/useProducts';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/Pagination';
import { Product } from './types';
import { columns } from '@/utils/columns'; 

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

  const paginationConfig = {
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  };

  const {
    data: queryResult,
    isLoading,
    error,
    isFetching,
  } = useProducts({
    pageIndex: 0, 
    pageSize: paginationConfig.initialPageSize,
    sorting,
    globalFilter,
  });

  const totalProducts = queryResult?.total || 0;

  const paginationState = usePagination(totalProducts, paginationConfig);

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
  const { invalidateProductLists } = useInvalidateProducts();

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
  }, [updateProductMutation]);
  
  // Remover editingData de las dependencias para evitar recrear la función
  const updateLocalData = useCallback((columnId: string, value: string) => {
    setEditingData(prev => prev ? { ...prev, [columnId]: value } : null);
  }, []);

  // Crear versión estable que no dependa del array completo data
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

 
  const table = useReactTable({
    data,
    columns,
    state: { 
      sorting, 
      globalFilter, 
      pagination: paginationState.pagination 
    },
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
      editingRow,
      editingData,
      updateLocalData,
      cancelEditing,
      startEditingStable,
      handleSave,
      statusOptions,
      isSaving: updateProductMutation.isPending,
    }
  });

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
            </div>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              disabled={isActualFetching || isFetching}
              className="ml-4"
            >
              <RefreshCwIcon className={`w-4 h-4 mr-2 ${(isActualFetching || isFetching) ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
          
          {(isActualFetching || isFetching) && (
            <div className="mt-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Actualizando datos...
              </div>
            </div>
          )}
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
    </div>
  );
}