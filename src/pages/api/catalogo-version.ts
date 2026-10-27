export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    const { data } = await supabase
      .from('configuracion')
      .select('catalogo_version')
      .limit(1)
      .maybeSingle();

    const version = data?.catalogo_version || Date.now();

    return new Response(
      JSON.stringify({
        version,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ version: Date.now() }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
