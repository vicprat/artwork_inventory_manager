import { supabase } from '@/utils/supabase/client';
import { generateDescription, generateTags } from '@/utils/data';
import { Product } from '@/types';

export interface FetchProductsParams {
  pageIndex: number;
  pageSize: number;
  sorting: Array<{ id: string; desc: boolean }>;
  globalFilter: string;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
}

export interface UploadImageParams {
  file: File;
  product: Product;
}

export interface UploadImageResponse {
  publicUrl: string;
  filePath: string;
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: (filters: Record<string, any>) => [...productKeys.lists(), filters] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

export const fetchProducts = async ({
  pageIndex,
  pageSize,
  sorting,
  globalFilter,
}: FetchProductsParams): Promise<ProductsResponse> => {
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select(`*, product_images(*)`, { count: 'exact' });

  if (globalFilter && globalFilter.trim()) {
    query = query.or(
      `title.ilike.%${globalFilter}%,vendor.ilike.%${globalFilter}%,type.ilike.%${globalFilter}%,artwork_medium.ilike.%${globalFilter}%,serie.ilike.%${globalFilter}%`
    );
  }

  const sortField = sorting[0]?.id || 'createdAt';
  const sortAscending = sorting[0]?.desc === false;

  const { data: productsData, error: productsError, count } = await query
    .order(sortField, { ascending: sortAscending })
    .range(from, to);

  if (productsError) {
    throw new Error(`Error fetching products: ${productsError.message}`);
  }

  const mappedData = productsData?.map(product => ({
    ...product,
    images: product.product_images || [],
  })) || [];

  return {
    data: mappedData,
    total: count || 0,
  };
};


export const updateProduct = async (product: Product): Promise<Product> => {
  try {
    const updatedProduct = { ...product };
    
    updatedProduct.body_html = generateDescription(updatedProduct);
    updatedProduct.tags = generateTags(updatedProduct);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { images, product_images, ...productData } = updatedProduct;
    
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productData.id);
      
    if (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
    
    return updatedProduct;
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
};

export const uploadProductImage = async ({
  file,
  product,
}: UploadImageParams): Promise<UploadImageResponse> => {
  try {
    const fileExtension = file.name.split('.').pop();
    const filePath = `products/${product.id}/${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from('impulso-shop-images')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('impulso-shop-images')
      .getPublicUrl(filePath);

    const oldImagePath = product.images?.[0]?.supabase_path;

    if (product.images && product.images.length > 0) {
      const { error: updateError } = await supabase
        .from('product_images')
        .update({
          supabase_url: publicUrl,
          supabase_path: filePath,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', product.images[0].id);
        
      if (updateError) {
        throw new Error(`Error updating image record: ${updateError.message}`);
      }
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
        
      if (insertError) {
        throw new Error(`Error creating image record: ${insertError.message}`);
      }
    }

    if (oldImagePath) {
      const { error: deleteError } = await supabase.storage
        .from('impulso-shop-images')
        .remove([oldImagePath]);
        
      if (deleteError) {
        console.warn('Warning: Could not delete old image:', deleteError.message);
      }
    }

    return { publicUrl, filePath };
  } catch (error) {
    console.error('Error in uploadProductImage:', error);
    throw error;
  }
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .select(`*, product_images(*)`)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching product: ${error.message}`);
  }

  return {
    ...data,
    images: data.product_images || [],
  };
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};

export const duplicateProduct = async (product: Product): Promise<Product> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, images, product_images, createdAt, updatedAt, ...productData } = product;
  
  const duplicatedProduct = {
    ...productData,
    title: `${productData.title} (Copia)`,
    status: 'DRAFT' as const,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(duplicatedProduct)
    .select()
    .single();

  if (error) {
    throw new Error(`Error duplicating product: ${error.message}`);
  }

  return {
    ...data,
    images: [],
  };
};