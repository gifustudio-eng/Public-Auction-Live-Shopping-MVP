"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// Helper Singleton untuk menjamin hanya ada SATU instance Supabase Client yang di-render di browser
// Ini menghilangkan peringatan "Multiple GoTrueClient instances detected" secara permanen
const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Sisi Server (SSR): Buat instance baru untuk keamanan data antar request
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Sisi Client (Browser): Simpan di global scope agar tidak terduplikasi saat re-render atau Hot-Reload
  const globalWithSupabase = globalThis as typeof globalThis & {
    supabaseClientInstance?: ReturnType<typeof createBrowserClient>;
  };

  if (!globalWithSupabase.supabaseClientInstance) {
    globalWithSupabase.supabaseClientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return globalWithSupabase.supabaseClientInstance;
};

const supabase = getSupabaseClient();

interface BuyButtonProps {
  lotId: string;
  initialStatus: 'pending' | 'live' | 'held' | 'sold' | 'released';
  opensAt: string | null; // ISO Timestamp dari PostgreSQL
  priceIdr: number;
  currentUserId: string | null; // NULL jika penonton belum login
}

export default function BuyButton({
  lotId,
  initialStatus,
  opensAt,
  priceIdr,
  currentUserId,
}: BuyButtonProps) {
  // State utama untuk mengontrol status lot & tombol secara lokal
  const [status, setStatus] = useState(initialStatus);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isMyHold, setIsMyHold] = useState(false);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format Rupiah Helper
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // ==========================================
  // LOGIKA 1: HITUNG MUNDUR (COUNTDOWN)
  // ==========================================
  useEffect(() => {
    if (!opensAt || status === 'sold') return;

    const calculateTimeLeft = () => {
      const difference = +new Date(opensAt) - +new Date();
      return difference > 0 ? Math.ceil(difference / 1000) : 0;
    };

    // Set nilai awal
    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    // Jika waktu buka masih di masa depan, jalankan interval hitung mundur
    if (initialTime > 0) {
      countdownIntervalRef.current = setInterval(() => {
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);

        if (remaining <= 0) {
          // Ketika waktu hitung mundur habis, otomatis ubah status lokal menjadi 'live' (Tersedia)
          setStatus((prev) => (prev === 'pending' ? 'live' : prev));
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
        }
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [opensAt, status]);

  // ==========================================
  // LOGIKA 2: SUPABASE REALTIME SUBSCRIPTION
  // ==========================================
  useEffect(() => {
    // Berlangganan ke channel yang sama dengan broadcast API backend
    const channel = supabase.channel('auction_session');

    channel
      .on('broadcast', { event: 'lot.claimed' }, (payload: { payload: { lot_id: string; user_id?: string; hold_id?: string; checkout_url?: string } }) => {
        if (payload.payload.lot_id === lotId) {
          // Jika lot ini diklaim oleh orang lain
          setStatus('held');
          
          // Cek apakah yang berhasil klaim adalah user aktif ini sendiri
          if (currentUserId && payload.payload.user_id === currentUserId) {
            setIsMyHold(true);
            if (payload.payload.hold_id) setHoldId(payload.payload.hold_id);
            if (payload.payload.checkout_url) setCheckoutUrl(payload.payload.checkout_url);
          } else {
            setIsMyHold(false);
          }
        }
      })
      .on('broadcast', { event: 'lot.released' }, (payload: { payload: { lot_id: string } }) => {
        if (payload.payload.lot_id === lotId) {
          // Jika penahanan hangus/expire, kembalikan status ke 'live' agar tombol aktif lagi
          setStatus('live');
          setIsMyHold(false);
          setHoldId(null);
          setCheckoutUrl(null);
          setErrorMessage(null);
        }
      })
      .on('broadcast', { event: 'lot.sold' }, (payload: { payload: { lot_id: string } }) => {
        if (payload.payload.lot_id === lotId) {
          // Jika pembayaran sukses dikonfirmasi oleh webhook
          setStatus('sold');
          setIsMyHold(false);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lotId, currentUserId]);

  // ==========================================
  // LOGIKA 3: EKSEKUSI KLAIM (API POST CALL)
  // ==========================================
  const handleClaim = async () => {
    if (!currentUserId) {
      setErrorMessage('Silakan login terlebih dahulu untuk ikut membeli.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lot_id: lotId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika kalah cepat (HTTP 410 Gone / SOLD_OUT)
        if (response.status === 410 || data.code === 'SOLD_OUT') {
          setStatus('held');
          throw new Error('Maaf, barang ini sudah dipesan oleh pembeli lain yang lebih cepat.');
        }
        
        // Error validasi lainnya (belum login, hold limit exceed, dll)
        throw new Error(data.error || 'Gagal mengamankan barang.');
      }

      // KLAIM SUKSES!
      setStatus('held');
      setIsMyHold(true);
      setHoldId(data.hold_id);
      setCheckoutUrl(data.checkout_url);

    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGIKA INTERFACE (DETERMINE BUTTON STATE)
  // ==========================================
  const isCountdownActive = timeLeft > 0;

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
      {/* Informasi Singkat Harga */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-gray-500 text-sm font-medium">Harga Barang</span>
        <span className="text-gray-900 text-lg font-bold">{formatRupiah(priceIdr)}</span>
      </div>

      {/* RENDER TOMBOL 3-STATE */}
      {(() => {
        // STATE 1: BELUM BUKA (Countdown Phase)
        if (isCountdownActive) {
          return (
            <button
              disabled
              className="w-full py-4 px-6 bg-gray-100 text-gray-500 font-bold rounded-xl flex flex-col items-center justify-center cursor-not-allowed select-none border border-gray-200 transition-all"
            >
              <span className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Membuka Dalam</span>
              <span className="text-base font-mono">
                {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
              </span>
            </button>
          );
        }

        // STATE 3: SUDAH DIAMBIL / EXPIRED (Held atau Sold)
        if (status === 'held') {
          if (isMyHold) {
            // Sub-State: User aktif ini yang berhasil nge-hold
            return (
              <div className="space-y-2">
                <a
                  href={checkoutUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 text-center transition-all animate-pulse"
                >
                  🚀 SELESAIKAN PEMBAYARAN (8 MENIT)
                </a>
                <p className="text-xs text-amber-600 text-center font-medium animate-pulse">
                  Stok diamankan! Selesaikan pembayaran sebelum hangus dan dilempar ke penonton lain.
                </p>
              </div>
            );
          }

          // Sub-State: Di-hold oleh orang lain (Penonton lain melihat ini)
          return (
            <button
              disabled
              className="w-full py-4 px-6 bg-amber-50 text-amber-500 font-bold rounded-xl flex items-center justify-center cursor-not-allowed select-none border border-amber-200/50 transition-all"
            >
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sedang di-checkout penonton lain...
              </span>
            </button>
          );
        }

        if (status === 'sold') {
          return (
            <button
              disabled
              className="w-full py-4 px-6 bg-gray-200 text-gray-400 font-bold rounded-xl flex items-center justify-center cursor-not-allowed select-none border border-gray-300 transition-all"
            >
              😭 TERJUAL (SOLD OUT)
            </button>
          );
        }

        // STATE 2: TERSEDIA (BELI SEKARANG Phase) - status 'live' atau 'released'
        return (
          <button
            onClick={handleClaim}
            disabled={loading}
            className={`w-full py-4 px-6 text-white font-bold rounded-xl flex items-center justify-center transition-all select-none shadow-lg
              ${loading 
                ? 'bg-emerald-600/80 cursor-wait' 
                : 'bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] hover:shadow-emerald-500/20 active:shadow-none'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengamankan Stok...
              </span>
            ) : (
              '⚡️ BELI SEKARANG'
            )}
          </button>
        );
      })()}

      {/* Render Pesan Error */}
      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold text-center animate-fade-in">
          ⚠️ {errorMessage}
        </div>
      )}
    </div>
  );
}