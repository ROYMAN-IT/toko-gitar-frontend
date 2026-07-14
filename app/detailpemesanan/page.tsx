'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono' });

export default function PesananTerkirim() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/auth2');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data pesanan');
      }

      const data = await response.json();
      // Filter hanya yang statusnya shipped atau delivered
      const shippedOrders = (data.orders || []).filter(
        (order: any) => order.status === 'shipped' || order.status === 'delivered'
      );
      setOrders(shippedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setToast({ msg: error.message || 'Gagal memuat pesanan', tone: 'err' });
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
        <div className="text-neutral-500">Memuat pesanan...</div>
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
      <div className="w-full max-w-3xl bg-[#FFFDF6]/95 text-black px-6 py-3 rounded-2xl flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)] border border-gray-300/50 backdrop-blur-md sticky top-4 z-50">
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
      <div className="w-full max-w-3xl mt-5">
        <h1 className="font-display text-2xl font-bold tracking-wide text-white">Pesanan Terkirim</h1>
        <p className="text-xs text-neutral-400 mt-1">
          {orders.length > 0 ? `${orders.length} pesanan ditemukan` : 'Belum ada pesanan terkirim'}
        </p>
      </div>

      {/* LIST PESANAN */}
      <div className="w-full max-w-3xl mt-4 flex flex-col gap-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#FFFDF6] text-black rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-gray-200/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* ID TRANSAKSI */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">ID Pesanan</span>
                  <span className="font-mono-num font-bold text-amber-800 text-sm">#ORD-{String(order.id).padStart(4, '0')}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                  {order.status || 'pending'}
                </span>
              </div>

              {/* DETAIL PESANAN */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400 block">Tanggal</span>
                  <span className="text-xs font-medium text-neutral-700">{formatDate(order.created_at)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400 block">Total</span>
                  <span className="text-xs font-black font-mono-num text-amber-900">{formatRp(order.total_price)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400 block">Alamat</span>
                  <span className="text-xs text-neutral-600 line-clamp-2">{order.address || '-'}</span>
                </div>
              </div>

              {/* DETAIL ITEMS */}
              {order.items && order.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400 block mb-1.5">Items</span>
                  <div className="flex flex-col gap-1">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-neutral-600">{item.name || `Produk #${item.product_id}`} x{item.quantity}</span>
                        <span className="font-mono-num font-medium text-neutral-700">{formatRp(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* METODE PEMBAYARAN */}
              <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between">
                <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400">Metode</span>
                <span className="text-xs font-medium text-neutral-700">Midtrans</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#FFFDF6]/10 backdrop-blur-sm rounded-2xl border border-neutral-700/30 text-center py-16">
            <span className="text-4xl">📦</span>
            <h3 className="font-display text-sm font-semibold mt-3 text-white">Belum Ada Pesanan Terkirim</h3>
            <p className="text-xs text-neutral-400 mt-1 px-4">Yuk, mulai belanja gitar impianmu!</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 text-[10px] font-bold uppercase tracking-wide text-white bg-amber-700 hover:bg-amber-600 rounded-full px-5 py-2 transition"
            >
              Mulai Belanja
            </button>
          </div>
        )}
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