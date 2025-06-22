/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo, useEffect } from 'react';

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface PaginationConfig {
  initialPageIndex?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  maxPageSize?: number;
  minPageSize?: number;
}


export interface PaginationResult {
  pagination: PaginationState;
  currentPage: number; 
  totalPages: number;
  
  startItem: number;
  endItem: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isEmpty: boolean;
  
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  
  onPaginationChange: (updater: any) => void;
  
  reset: () => void;
}

export const usePagination = (
  totalItems: number,
  config: PaginationConfig = {}
): PaginationResult => {
  const {
    initialPageIndex = 0,
    initialPageSize = 20,
    maxPageSize = 1000,
    minPageSize = 1,
  } = config;

  const [pagination, setPaginationState] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  });

  useEffect(() => {
    setPaginationState(prevState => ({
      ...prevState,
      pageIndex: initialPageIndex,
      pageSize: initialPageSize
    }));
  }, [initialPageIndex, initialPageSize]);
  
  const currentPage = pagination.pageIndex + 1; // Convert to 1-based
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));
  const startItem = Math.min((pagination.pageIndex) * pagination.pageSize + 1, totalItems);
  const endItem = Math.min(pagination.pageIndex * pagination.pageSize + pagination.pageSize, totalItems);
  
  const hasNextPage = pagination.pageIndex < totalPages - 1;
  const hasPreviousPage = pagination.pageIndex > 0;
  const isEmpty = totalItems === 0;

  // Validar y normalizar página
  const normalizePage = useCallback((pageIndex: number): number => {
    return Math.max(0, Math.min(pageIndex, totalPages - 1));
  }, [totalPages]);

  // Validar y normalizar tamaño de página
  const normalizePageSize = useCallback((size: number): number => {
    return Math.max(minPageSize, Math.min(size, maxPageSize));
  }, [minPageSize, maxPageSize]);

  // Acciones de navegación
  const setPage = useCallback((page: number) => {
    const pageIndex = normalizePage(page - 1); // Convert from 1-based to 0-based
    setPaginationState(prev => ({
      ...prev,
      pageIndex,
    }));
  }, [normalizePage]);

  const setPageSize = useCallback((pageSize: number) => {
    const normalizedSize = normalizePageSize(pageSize);
    setPaginationState(prev => {
      // Calcular el ítem actual para mantener el contexto
      const currentFirstItem = prev.pageIndex * prev.pageSize;
      const newPageIndex = Math.floor(currentFirstItem / normalizedSize);
      
      return {
        pageIndex: normalizePage(newPageIndex),
        pageSize: normalizedSize,
      };
    });
  }, [normalizePageSize, normalizePage]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPaginationState(prev => ({
        ...prev,
        pageIndex: prev.pageIndex + 1,
      }));
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPaginationState(prev => ({
        ...prev,
        pageIndex: prev.pageIndex - 1,
      }));
    }
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => {
    setPaginationState(prev => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  const lastPage = useCallback(() => {
    setPaginationState(prev => ({
      ...prev,
      pageIndex: totalPages - 1,
    }));
  }, [totalPages]);

  const setPagination = useCallback((updates: Partial<PaginationState>) => {
    setPaginationState(prev => {
      return {
        pageIndex: updates.pageIndex !== undefined 
          ? normalizePage(updates.pageIndex) 
          : prev.pageIndex,
        pageSize: updates.pageSize !== undefined 
          ? normalizePageSize(updates.pageSize) 
          : prev.pageSize,
      };
    });
  }, [normalizePage, normalizePageSize]);

  const onPaginationChange = useCallback((updater: any) => {
    setPaginationState(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater;
      return {
        pageIndex: normalizePage(newState.pageIndex),
        pageSize: normalizePageSize(newState.pageSize),
      };
    });
  }, [normalizePage, normalizePageSize]);

  const reset = useCallback(() => {
    setPaginationState({
      pageIndex: initialPageIndex,
      pageSize: initialPageSize,
    });
  }, [initialPageIndex, initialPageSize]);

  const adjustedPagination = useMemo(() => {
    if (totalItems === 0) {
      return { ...pagination, pageIndex: 0 };
    }
    
    const maxPageIndex = Math.max(0, totalPages - 1);
    if (pagination.pageIndex > maxPageIndex) {
      return { ...pagination, pageIndex: maxPageIndex };
    }
    
    return pagination;
  }, [pagination, totalItems, totalPages]);

  useEffect(() => {
    if (adjustedPagination.pageIndex !== pagination.pageIndex) {
        setPaginationState(adjustedPagination);
    }
  }, [adjustedPagination, pagination.pageIndex]);


  return {
    pagination: adjustedPagination,
    currentPage,
    totalPages,
    
    startItem: isEmpty ? 0 : startItem,
    endItem: isEmpty ? 0 : endItem,
    hasNextPage,
    hasPreviousPage,
    isEmpty,
    
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPagination,
    onPaginationChange,
    reset,
  };
};
