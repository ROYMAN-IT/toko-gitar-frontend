'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono' });

export default function DetailPemesanan() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/auth2');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil detail pesanan');
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      setToast({ msg: error.message || 'Gagal memuat detail pesanan', tone: 'err' });
      setTimeout(() => router.push('/dashboard'), 1500);
    } finally {
      setLoading(false);
    }
  };

  const formatRp = (n: number) => {
    if (!n) return 'Rp0';
    return `Rp${n.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  };

  if (loading) {
    return (
      <div className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen flex items-center justify-center p-4 relative antialiased text-white`}
        style={{
          background: 'radial-gradient(circle at 20% 15%, #262019 0%, #0D0A09 45%, #060403 100%)',
        }}
      >
        <div className="text-neutral-500">Memuat detail pesanan...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen flex items-center justify-center p-4 relative antialiased text-white`}
        style={{
          background: 'radial-gradient(circle at 20% 15%, #262019 0%, #0D0A09 45%, #060403 100%)',
        }}
      >
        <div className="text-neutral-500">Pesanan tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen flex flex-col items-center p-4 relative antialiased text-white selection:bg-amber-700 selection:text-white overflow-hidden`}
      style={{
        background: 'radial-gradient(circle at 20% 15%, #262019 0%, #0D0A09 45%, #060403 100%)',
      }}
    >
      <style jsx global>{`
        .font-display { font-family: var(--font-display), serif; }
        .font-body { font-family: var(--font-body), sans-serif; }
        .font-mono-num { font-family: var(--font-mono), monospace; }
        @keyframes softDrift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(14px, -10px); }
        }
        .drift-slow { animation: softDrift 12s ease-in-out infinite; }
        .drift-slower { animation: softDrift 18s ease-in-out infinite reverse; }
        @media (prefers-reduced-motion: reduce) {
          .drift-slow, .drift-slower { animation: none !important; }
        }
      `}</style>

      {/* AMBIENT GLOWS */}
      <div className="drift-slow absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-amber-700/[0.10] blur-[110px] pointer-events-none z-0" />
      <div className="drift-slower absolute -bottom-28 -right-16 w-[380px] h-[380px] rounded-full bg-orange-600/[0.08] blur-[100px] pointer-events-none z-0" />

      {/* GRAIN HALUS */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '140px 140px',
        }}
      />

      {/* VIGNETTE */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ boxShadow: 'inset 0 0 200px 70px rgba(0,0,0,0.5)' }}
      />

      {/* NAVBAR KECIL */}
      <div className="w-full max-w-2xl bg-[#FFFDF6]/95 text-black px-6 py-3 rounded-2xl flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)] border border-gray-300/50 backdrop-blur-md sticky top-4 z-50">
        <div className="font-display font-semibold text-base tracking-wide flex items-center gap-1.5">
          <span className="text-lg">🎸</span> GitarKu
        </div>
        <button
          onClick={() => router.back()}
          className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 hover:text-amber-700 transition"
        >
          Back &gt;
        </button>
      </div>

      {/* HEADER */}
      <div className="w-full max-w-2xl mt-5">
        <h1 className="font-display text-2xl font-bold tracking-wide text-white">Detail Pemesanan</h1>
        <p className="text-xs text-neutral-400 mt-1">
          ID Pesanan: <span className="text-amber-500 font-mono-num">#ORD-{String(order.id).padStart(4, '0')}</span>
        </p>
      </div>

      {/* CARD DETAIL PESANAN */}
      <div className="w-full max-w-2xl mt-4 bg-[#FFFDF6] text-black rounded-2xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-gray-200/40">
        {/* STATUS */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200">
          <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Status Pesanan</span>
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
            {order.status || 'pending'}
          </span>
        </div>

        {/* DETAIL */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400 block">Tanggal</span>
            <span className="text-sm font-medium text-neutral-700">{formatDate(order.created_at)}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400 block">Total</span>
            <span className="text-lg font-black font-mono-num text-amber-900">{formatRp(order.total_price)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400 block">Alamat Pengiriman</span>
            <span className="text-sm text-neutral-700">{order.address || '-'}</span>
          </div>
        </div>

        {/* ITEMS */}
        {order.items && order.items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400 block mb-3">Produk</span>
            <div className="flex flex-col gap-2">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-b-0">
                  <div>
                    <span className="text-sm font-medium text-neutral-700">{item.name || `Produk #${item.product_id}`}</span>
                    <span className="text-xs text-neutral-400 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="text-sm font-mono-num font-semibold text-neutral-800">{formatRp(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* METODE PEMBAYARAN */}
        <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between">
          <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400">Metode Pembayaran</span>
          <span className="text-sm font-medium text-neutral-700">Midtrans</span>
        </div>

        {/* TOMBOL KEMBALI */}
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full mt-6 py-3 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wide rounded-xl transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[300] px-4 py-3 rounded-xl text-xs font-semibold shadow-2xl animate-fade-up border ${
          toast.tone === 'ok' ? 'bg-emerald-900/90 border-emerald-700 text-emerald-200' : 'bg-red-900/90 border-red-700 text-red-200'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}