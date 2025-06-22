import { fetchProductById } from '@/lib/api/products';
import {ArtworkDetail} from '@/components/ArtworkDetail';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  try {
    const artwork = await fetchProductById(id);

    if (!artwork) {
      notFound();
    }

    return <ArtworkDetail artwork={artwork} />;

  } catch (error) {
    console.error('Error fetching artwork details:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-500">Error al cargar la obra des arte.</p>
      </div>
    );
  }
}