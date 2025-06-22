import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';
import { Product } from '@/types';
import { formatDataForShopify } from '@/utils/csv-formatter';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`*, product_images(*)`)
      .order('createdAt', { ascending: true }); 

    if (error) {
      throw new Error(`Error al obtener los productos: ${error.message}`);
    }
     const mappedProducts = products.map(p => ({
        ...p,
        images: p.product_images || []
    })) as Product[];


    const csvData = formatDataForShopify(mappedProducts);

     return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="shopify_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error("Error en la ruta de exportación:", error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}