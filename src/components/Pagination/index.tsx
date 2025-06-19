
'use client'
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChevronsLeftIcon, 
  ChevronsRightIcon,
  MoreHorizontalIcon 
} from 'lucide-react';

export interface Props {  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
    onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showGoToPage?: boolean;
  showPageInfo?: boolean;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  
  isLoading?: boolean;
  disabled?: boolean;
  
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  
  labels?: {
    previous?: string;
    next?: string;
    first?: string;
    last?: string;
    page?: string;
    of?: string;
    results?: string;
    showing?: string;
    to?: string;
    goToPage?: string;
    itemsPerPage?: string;
  };
}

const defaultLabels = {
  previous: 'Anterior',
  next: 'Siguiente',
  first: 'Primera',
  last: 'Última',
  page: 'Página',
  of: 'de',
  results: 'resultados',
  showing: 'Mostrando',
  to: 'a',
  goToPage: 'Ir a página',
  itemsPerPage: 'elementos por página',
};

export const Pagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showGoToPage = true,
  showPageInfo = true,
  showFirstLast = true,
  maxVisiblePages = 5,
  isLoading = false,
  disabled = false,
  className = '',
  size = 'md',
  labels = {},
}) => {
  const mergedLabels = { ...defaultLabels, ...labels };
  const [goToPageValue, setGoToPageValue] = React.useState('');

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const generateVisiblePages = (): (number | 'ellipsis')[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (currentPage <= halfVisible + 1) {
      for (let i = 1; i <= maxVisiblePages - 1; i++) {
        pages.push(i);
      }
      if (totalPages > maxVisiblePages) {
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    } else if (currentPage >= totalPages - halfVisible) {
      pages.push(1);
      if (totalPages > maxVisiblePages) {
        pages.push('ellipsis');
      }
      for (let i = totalPages - maxVisiblePages + 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('ellipsis');
      for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = generateVisiblePages();

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(goToPageValue);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
      setGoToPageValue('');
    }
  };

  const canGoPrevious = currentPage > 1 && !disabled && !isLoading;
  const canGoNext = currentPage < totalPages && !disabled && !isLoading;

  const buttonSizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
  };

  const inputSizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base',
  };

  if (totalPages <= 1) {
    return showPageInfo ? (
      <div className={`flex items-center justify-center text-sm text-gray-600 ${className}`}>
        {totalItems > 0 ? (
          `${mergedLabels.showing} ${startItem} ${mergedLabels.to} ${endItem} ${mergedLabels.of} ${totalItems} ${mergedLabels.results}`
        ) : (
          `0 ${mergedLabels.results}`
        )}
      </div>
    ) : null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {showPageInfo && (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            {totalItems > 0 ? (
              `${mergedLabels.showing} ${startItem} ${mergedLabels.to} ${endItem} ${mergedLabels.of} ${totalItems} ${mergedLabels.results}`
            ) : (
              `0 ${mergedLabels.results}`
            )}
          </span>
          
          {showPageSizeSelector && (
            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => onPageSizeChange(parseInt(value))}
                disabled={disabled || isLoading}
              >
                <SelectTrigger className={`w-auto ${inputSizeClasses[size]}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option} {mergedLabels.itemsPerPage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {showGoToPage && (
          <form onSubmit={handleGoToPage} className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:inline">
              {mergedLabels.goToPage}:
            </span>
            <Input
              type="number"
              min="1"
              max={totalPages}
              value={goToPageValue}
              onChange={(e) => setGoToPageValue(e.target.value)}
              placeholder={currentPage.toString()}
              className={`w-16 text-center ${inputSizeClasses[size]}`}
              disabled={disabled || isLoading}
            />
          </form>
        )}

        <div className="flex items-center gap-1">
          {showFirstLast && (
            <Button
              variant="outline"
              size="sm"
              className={buttonSizeClasses[size]}
              onClick={() => onPageChange(1)}
              disabled={!canGoPrevious}
              aria-label={mergedLabels.first}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">{mergedLabels.first}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className={buttonSizeClasses[size]}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            aria-label={mergedLabels.previous}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{mergedLabels.previous}</span>
          </Button>

          <div className="hidden md:flex items-center gap-1">
            {visiblePages.map((page, index) => (
              page === 'ellipsis' ? (
                <div
                  key={`ellipsis-${index}`}
                  className="flex items-center justify-center w-9 h-9 text-gray-400"
                >
                  <MoreHorizontalIcon className="h-4 w-4" />
                </div>
              ) : (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  className={`${buttonSizeClasses[size]} min-w-[36px]`}
                  onClick={() => onPageChange(page as number)}
                  disabled={disabled || isLoading}
                  aria-label={`${mergedLabels.page} ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </Button>
              )
            ))}
          </div>

          <div className="md:hidden flex items-center px-3 py-2 text-sm bg-gray-50 rounded border">
            {currentPage} {mergedLabels.of} {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            className={buttonSizeClasses[size]}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            aria-label={mergedLabels.next}
          >
            <span className="hidden sm:inline mr-1">{mergedLabels.next}</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>

          {showFirstLast && (
            <Button
              variant="outline"
              size="sm"
              className={buttonSizeClasses[size]}
              onClick={() => onPageChange(totalPages)}
              disabled={!canGoNext}
              aria-label={mergedLabels.last}
            >
              <span className="hidden sm:inline mr-1">{mergedLabels.last}</span>
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
