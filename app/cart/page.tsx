'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { cartAPI, orderAPI, paymentAPI, authAPI } from '@/lib/api';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono' });

const formatRp = (angka: number) => {
  if (!angka && angka !== 0) return 'Rp0';
  return `Rp${angka.toLocaleString('id-ID')}`;
};

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: any) => void;
    };
  }
}

export default function KeranjangBelanja() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartAPI.getCart();
      console.log('📦 Cart data:', data);
      
      if (data && data.items && Array.isArray(data.items)) {
        setCartItems(data.items);
        setSelectedIds(data.items.map((item: any) => item.id));
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      setToast({ msg: 'Gagal memuat keranjang', tone: 'err' });
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, tone: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2600);
  };

  const hapusItem = async (id: number) => {
    try {
      await cartAPI.removeItem(id);
      setCartItems(prev => prev.filter(i => i.id !== id));
      setSelectedIds(prev => prev.filter(sid => sid !== id));
      showToast('Item dihapus dari keranjang', 'ok');
    } catch (error) {
      console.error('Error removing item:', error);
      showToast('Gagal menghapus item', 'err');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const semuaTerpilih = cartItems.length > 0 && cartItems.every(item => selectedIds.includes(item.id));
  
  const toggleSelectAll = () => {
    if (semuaTerpilih) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map(item => item.id));
    }
  };

  const selectedItems = cartItems.filter(item => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const totalQty = selectedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const ongkir = subtotal > 0 && subtotal < 500000 ? 25000 : 0;
  const total = subtotal + ongkir;

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      showToast('Pilih minimal 1 produk', 'err');
      return;
    }

    localStorage.setItem('selected_items', JSON.stringify(selectedIds));
    router.push('/detail_pembayaran');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0A09] text-white flex items-center justify-center">
        <style jsx global>{`
          @keyframes pickSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .pick-loader {
            width: 30px; height: 36px;
            background: linear-gradient(160deg, #F3E4C4, #C9A34E 50%, #8A5A1E);
            border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
            box-shadow: 0 0 16px rgba(201,163,78,0.45);
            animation: pickSpin 1s linear infinite;
          }
        `}</style>
        <div className="flex flex-col items-center gap-4">
          <div className="pick-loader" />
          <span className="text-xs tracking-widest uppercase text-neutral-500">Memuat keranjang...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen text-white flex flex-col items-center pt-0 px-0 pb-32 relative overflow-x-hidden antialiased`}
      style={{
        background: 'radial-gradient(circle at 20% 10%, #262019 0%, #0D0A09 45%, #060403 100%)',
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
        .string-divider span {
          display: block;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(201,163,78,0.9), rgba(201,163,78,0));
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise { animation: fadeUp 0.4s ease-out both; }
        button:focus-visible, input:focus-visible { outline: 2px solid #C9A34E; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .drift-slow, .drift-slower, .rise { animation: none !important; }
        }
      `}</style>

      <div className="drift-slow absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-amber-700/[0.10] blur-[110px] pointer-events-none z-0" />
      <div className="drift-slower absolute -bottom-28 -right-16 w-[380px] h-[380px] rounded-full bg-orange-600/[0.08] blur-[100px] pointer-events-none z-0" />

      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '140px 140px',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ boxShadow: 'inset 0 0 180px 60px rgba(0,0,0,0.45)' }}
      />

      <nav className="w-full bg-[#FFFDF6]/95 text-black px-4 md:px-12 py-3.5 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-gray-300/50 backdrop-blur-md sticky top-0 z-50">
        <span className="font-display font-semibold text-base tracking-wide flex items-center gap-1.5">
          <span className="text-lg filter drop-shadow">🎸</span> GitarKu
        </span>
        <button onClick={() => router.back()} className="text-[11px] font-bold tracking-widest uppercase text-neutral-500 hover:text-amber-800 transition">
          Back &gt;
        </button>
      </nav>

      <div className="w-full max-w-3xl relative z-10 mt-5 px-4 rise">
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 select-none mb-3">
          <span className="hover:text-amber-500 cursor-pointer transition-colors" onClick={() => router.push('/dashboard')}>Katalog</span>
          <span>/</span>
          <span className="text-amber-500 font-semibold">Keranjang Belanja</span>
        </div>
        <h1 className="font-display text-2xl font-semibold mb-1">Keranjang Saya</h1>
        <p className="text-xs text-neutral-400 mb-2">
          {cartItems.length > 0 ? (
            <>Ada <span className="text-amber-500 font-bold font-mono-num">{cartItems.length}</span> produk di keranjang.</>
          ) : (
            'Keranjang belanja Anda masih kosong.'
          )}
        </p>
        {/* Signature: string divider */}
        <div className="string-divider flex flex-col gap-[3px] w-20 mb-6" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} style={{ height: `${1 + i * 0.45}px`, opacity: 1 - i * 0.11 }} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl relative z-10 px-4 flex flex-col gap-4">
        {cartItems.length > 0 ? (
          <>
            <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer select-none pl-1">
              <input type="checkbox" checked={semuaTerpilih} onChange={toggleSelectAll} className="h-4 w-4 rounded accent-amber-700 cursor-pointer" />
              <span className="font-bold uppercase tracking-wide text-[10px]">Pilih Semua ({cartItems.length})</span>
            </label>

            {cartItems.map((item, idx) => (
              <div
                key={item.id}
                className={`w-full flex items-center gap-4 bg-[#FFFDF6] text-black p-4 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.4)] border transition-all rise ${
                  selectedIds.includes(item.id) ? 'border-amber-700/50 ring-1 ring-amber-700/20' : 'border-gray-200/40'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="h-4 w-4 rounded accent-amber-700 cursor-pointer flex-shrink-0"
                />

                <div className="w-16 h-16 bg-[#1A1A1A] rounded-xl flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0 border border-neutral-800">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="max-h-full object-contain" />
                  ) : (
                    <span className="text-2xl opacity-30">🎸</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-neutral-800 truncate">{item.name || 'Produk'}</h3>
                  <p className="text-[11px] font-mono-num text-amber-800 font-bold mt-1">{formatRp(item.price || 0)}</p>
                  <p className="text-[9px] text-neutral-400">Stok: {item.stock || 0}</p>
                </div>

                <div className="flex items-center bg-neutral-900/[0.04] text-black rounded-lg border border-gray-300 text-xs h-8 overflow-hidden flex-shrink-0 px-3">
                  <span className="h-full flex items-center justify-center font-mono-num text-[11px] font-bold min-w-[32px]">
                    {item.quantity || 0}
                  </span>
                </div>

                <div className="hidden sm:block text-right w-24 flex-shrink-0">
                  <p className="text-[9px] text-neutral-400 uppercase tracking-wide font-bold">Subtotal</p>
                  <p className="text-xs font-black font-mono-num text-amber-900">{formatRp((item.price || 0) * (item.quantity || 0))}</p>
                </div>

                <button
                  onClick={() => hapusItem(item.id)}
                  title="Hapus item"
                  className="text-neutral-400 hover:text-red-600 hover:scale-110 transition flex-shrink-0 p-1.5"
                >
                  🗑️
                </button>
              </div>
            ))}

            <button
              onClick={() => router.push('/dashboard')}
              className="self-start text-[10px] font-bold uppercase tracking-wide text-amber-500 hover:text-amber-400 mt-2 transition-colors"
            >
              ← Lanjutkan Belanja
            </button>
          </>
        ) : (
          <div className="w-full text-center py-16 bg-[#FFFDF6]/10 backdrop-blur-sm rounded-2xl border border-neutral-700/30 rise">
            <span className="text-3xl">🛒</span>
            <h3 className="font-display text-sm font-semibold mt-3 text-white">Keranjang Anda Kosong</h3>
            <p className="text-xs text-neutral-400 mt-1 px-4">Yuk, mulai cari gitar impianmu di katalog kami.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 text-[10px] font-bold uppercase tracking-wide text-white bg-amber-700 hover:bg-amber-600 rounded-full px-5 py-2 transition hover:scale-105 active:scale-95"
            >
              Mulai Belanja
            </button>
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-40 bg-[#FFFDF6] text-black border-t border-gray-300 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
          <div className="w-full max-w-3xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wide font-bold">
                Total ({totalQty} barang{ongkir > 0 ? ' · +ongkir' : ''})
              </span>
              <span className="text-lg font-black font-mono-num text-amber-900">{formatRp(total)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0 || processing}
              className="px-10 py-2.5 bg-amber-700 hover:bg-amber-600 disabled:bg-neutral-300 disabled:cursor-not-allowed disabled:text-neutral-500 text-white text-xs font-bold rounded-full shadow-md transition tracking-wider uppercase flex items-center gap-2 hover:shadow-lg active:scale-[0.98]"
            >
              {processing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Memproses...
                </>
              ) : (
                `Pesan (${selectedItems.length})`
              )}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-24 right-6 z-[300] px-4 py-3 rounded-xl text-xs font-semibold shadow-2xl animate-fade-up border ${
          toast.tone === 'ok' ? 'bg-emerald-900/90 border-emerald-700 text-emerald-200' : 'bg-red-900/90 border-red-700 text-red-200'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
