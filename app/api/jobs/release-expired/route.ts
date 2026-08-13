import { createClient } from '@supabase/supabase-js';
import { connection, NextResponse } from 'next/server';

export async function GET(request: Request) {
  // This must stay outside the try/catch. During prerendering, connection()
  // throws a framework control-flow signal that Next.js needs to handle.
  await connection();

  try {
    // GET route handlers can be prerendered when Cache Components is enabled.
    // Wait for an actual request before reading request-specific values.
    const authHeader = request.headers.get('authorization');

    // 3. Validasi token keamanan di Header seperti biasa
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized Access.' }, { status: 401 });
    }

    // 4. Inisialisasi Supabase Admin secara aman di dalam handler
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // 5. Panggil fungsi database pelepasan hold kedaluwarsa (RPC release_expired_holds) [2]
    const { data, error } = await supabaseAdmin.rpc('release_expired_holds');

    if (error) {
      console.error('Error executing release_expired_holds:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const releasedCount = data?.released_count || 0;
    const releasedLots: string[] = data?.released_lots || [];

    // 6. Jika ada barang yang dibebaskan, broadcast event (lot.released) [2]
    if (releasedCount > 0 && releasedLots.length > 0) {
      const channel = supabaseAdmin.channel('auction_session');
      
      // Bungkus subscribe ke dalam Promise agar runtime serverless tidak memotong fungsi sebelum event terkirim
      await new Promise<void>((resolve, reject) => {
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            try {
              // Kirim sinyal broadcast individual untuk setiap lot yang dilepas sesuai spec [2]
              for (const lotId of releasedLots) {
                await channel.send({
                  type: 'broadcast',
                  event: 'lot.released',
                  payload: { lot_id: lotId },
                });
              }
              resolve();
            } catch (err) {
              reject(err);
            } finally {
              supabaseAdmin.removeChannel(channel);
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            supabaseAdmin.removeChannel(channel);
            reject(new Error(`Gagal terhubung ke channel realtime: ${status}`));
          }
        });
      });
    }

    return NextResponse.json({
      success: true,
      message: `Pengecekan selesai. ${releasedCount} hold kedaluwarsa berhasil dilepaskan.`,
      released_lots: releasedLots
    }, { status: 200 });

  } catch (err: unknown) {
    console.error('Cron error /api/jobs/release-expired:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
