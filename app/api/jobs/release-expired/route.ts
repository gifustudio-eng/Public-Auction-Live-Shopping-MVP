import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Gunakan Service Role Key agar API ini bisa melewati RLS dan memproses kedaluwarsa secara bulk
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // 1. Validasi token keamanan di Header untuk mencegah penembakan API oleh publik
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized Access.' }, { status: 401 });
    }

    // 2. Panggil fungsi database pelepasan hold kedaluwarsa (RPC release_expired_holds) [2]
    const { data, error } = await supabaseAdmin.rpc('release_expired_holds');

    if (error) {
      console.error('Error executing release_expired_holds:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const releasedCount = data?.released_count || 0;

    // 3. Jika ada barang yang dibebaskan, broadcast event (lot.released) ke penonton [2]
    if (releasedCount > 0) {
      const channel = supabaseAdmin.channel('auction_session');
      await channel.subscribe();
      await channel.send({
        type: 'broadcast',
        event: 'lot.released',
        payload: { released_count: releasedCount },
      });
      await supabaseAdmin.removeChannel(channel);
    }

    return NextResponse.json({
      success: true,
      message: `Pengecekan selesai. ${releasedCount} hold kedaluwarsa berhasil dilepaskan.`
    }, { status: 200 });

  } catch (err: any) {
    console.error('Cron error /api/jobs/release-expired:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}