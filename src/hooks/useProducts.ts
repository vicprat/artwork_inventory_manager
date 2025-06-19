/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchProducts, 
  updateProduct, 
  uploadProductImage, 
  deleteProduct,
  duplicateProduct,
  productKeys,
  type FetchProductsParams 
} from '@/lib/api/products';
import { Logger } from '@/utils/logger';
import { Product } from '@/app/types';

export const useProducts = (params: FetchProductsParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    staleTime: 30000, 
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (updatedProduct) => {
      Logger.success(`Producto "${updatedProduct.title}" guardado correctamente.`);
      
      queryClient.invalidateQueries({ 
        queryKey: productKeys.lists() 
      });
      
      queryClient.setQueryData(
        productKeys.detail(updatedProduct.id),
        updatedProduct
      );
    },
    onError: (error: any) => {
      Logger.error(`Error al guardar el producto: ${error.message}`);
    },
  });
};


export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProductImage,
    onSuccess: () => {
      Logger.success('Imagen actualizada correctamente.');
      queryClient.invalidateQueries({ 
        queryKey: productKeys.lists() 
      });
    },
    onError: (error: any) => {
      Logger.error(`Error al subir la imagen: ${error.message}`);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      Logger.success('Producto eliminado correctamente.');
      
      queryClient.invalidateQueries({ 
        queryKey: productKeys.lists() 
      });
    },
    onError: (error: any) => {
      Logger.error(`Error al eliminar el producto: ${error.message}`);
    },
  });
};


export const useDuplicateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateProduct,
    onSuccess: (duplicatedProduct) => {
      Logger.success(`Producto "${duplicatedProduct.title}" duplicado correctamente.`);
      
      queryClient.invalidateQueries({ 
        queryKey: productKeys.lists() 
      });
    },
    onError: (error: any) => {
      Logger.error(`Error al duplicar el producto: ${error.message}`);
    },
  });
};
export const useOptimisticProductUpdate = () => {
  const queryClient = useQueryClient();

  const updateProductOptimistically = (
    productId: string, 
    updates: Partial<Product>,
    queryFilters: Record<string, any>
  ) => {
    queryClient.setQueryData(
      productKeys.list(queryFilters),
      (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((product: Product) =>
            product.id === productId 
              ? { ...product, ...updates }
              : product
          ),
        };
      }
    );
  };

  return { updateProductOptimistically };
};

export const usePrefetchProducts = () => {
  const queryClient = useQueryClient();

  const prefetchProducts = (params: FetchProductsParams) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.list(params),
      queryFn: () => fetchProducts(params),
      staleTime: 30000,
    });
  };

  return { prefetchProducts };
};

export const useInvalidateProducts = () => {
  const queryClient = useQueryClient();

  const invalidateAllProducts = () => {
    queryClient.invalidateQueries({ 
      queryKey: productKeys.all 
    });
  };

  const invalidateProductLists = () => {
    queryClient.invalidateQueries({ 
      queryKey: productKeys.lists() 
    });
  };

  const invalidateProduct = (id: string) => {
    queryClient.invalidateQueries({ 
      queryKey: productKeys.detail(id) 
    });
  };

  return {
    invalidateAllProducts,
    invalidateProductLists,
    invalidateProduct,
  };
};