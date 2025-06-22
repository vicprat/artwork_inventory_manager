import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_unique_tags');

    if (error) {
      throw new Error(`Error fetching unique tags: ${error.message}`);
    }

   const tags = data.map((item: { tag: string }) => item.tag);

    return NextResponse.json(tags);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}