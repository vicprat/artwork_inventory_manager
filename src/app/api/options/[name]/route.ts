import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

const TABLE_MAP: Record<string, string> = {
  artists: 'artists',
  techniques: 'techniques',
  locations: 'locations',
  artwork_types: 'artwork_types',
};

export async function GET(
  req: Request,
  context: { params: Promise<{ name: string }> }
) {
  const { name } = await context.params;
  const tableName = TABLE_MAP[name];
  
  console.log('GET request - name:', name, 'tableName:', tableName);
  
  if (!tableName) {
    return NextResponse.json({ error: 'Invalid option type' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error 
      }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Catch error:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json({ 
      error: errorMessage,
      type: typeof error,
      details: error 
    }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ name: string }> }
) {
  const { name: optionType } = await context.params;
  const tableName = TABLE_MAP[optionType];

  console.log('POST request - optionType:', optionType, 'tableName:', tableName);

  if (!tableName) {
    return NextResponse.json({ error: 'Invalid option type' }, { status: 400 });
  }

  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(tableName)
      .insert({ name: name.trim() })
      .select('id, name')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: `El valor "${name}" ya existe.` }, { status: 409 });
      }
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error 
      }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Catch error:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json({ 
      error: errorMessage,
      type: typeof error,
      details: error 
    }, { status: 500 });
  }
}