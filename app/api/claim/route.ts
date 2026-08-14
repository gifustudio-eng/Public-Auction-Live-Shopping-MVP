import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Diabaikan jika dipanggil dari Server Component/Middleware yang membatasi modifikasi cookie
            }
          },
        },
      }
    );
    
    // 1. Verifikasi Sesi Autentikasi Pengguna sebelum live-show dimulai [3]
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Silakan login terlebih dahulu untuk ikut membeli.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { lot_id } = body;

    if (!lot_id) {
      return NextResponse.json(
        { error: 'Bad Request. ID lot wajib dikirimkan.' },
        { status: 400 }
      );
    }

    // 2. Eksekusi Prosedur DB Atomik (Fungsi RPC claim_lot yang sudah Anda migrasikan) [3]
    const { data, error } = await supabase.rpc('claim_lot', {
      p_lot_id: lot_id,
      p_user_id: userId,
    });

    if (error) {
      console.error('Error Database RPC claim_lot:', error);
      return NextResponse.json(
        { error: 'Terjadi kesalahan sistem internal database.' },
        { status: 500 }
      );
    }

    // 3. Tangani respon dari Database [3]
    if (!data.success) {
      if (data.error_code === 'SOLD_OUT') {
        return NextResponse.json(
          { error: data.message, code: 'SOLD_OUT' },
          { status: 410 } // HTTP 410 Gone: Barang sudah diambil orang lain lebih cepat [3]
        );
      }

      return NextResponse.json(
        { error: data.message, code: data.error_code },
        { status: 400 }
      );
    }

    // 4. Kirim Sinyal Event Realtime (lot.claimed) [2, 3]
    const channel = supabase.channel('auction_session');
    await channel.subscribe();
    await channel.send({
      type: 'broadcast',
      event: 'lot.claimed',
      payload: { 
        lot_id: lot_id,
        user_id: userId,             // 🌟 Tambahkan ini agar browser tahu siapa pemenangnya
        hold_id: data.hold_id,       // 🌟 Tambahkan ini untuk disisipkan ke tombol checkout
        checkout_url: data.checkout_url // 🌟 Tambahkan URL checkout Mayar tiruan
      },
    });
    await supabase.removeChannel(channel);

    // 5. Kembalikan link checkout Mayar (tiruan) untuk diselesaikan user [3]
    return NextResponse.json({
      message: data.message,
      hold_id: data.hold_id,
      checkout_url: data.checkout_url
    }, { status: 200 });

  } catch (err: any) {
    console.error('API Error /api/claim:', err);
    return NextResponse.json(
      { error: 'Terjadi kegagalan server utama.' },
      { status: 500 }
    );
  }
}