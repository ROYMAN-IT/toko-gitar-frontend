'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { productAPI, cartAPI } from '@/lib/api';
import { formatRp } from '@/lib/utils';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono' });

export default function DetailProduk() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);

  // ✅ FUNGSI FETCH DATA
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const productData = await productAPI.getById(Number(id));
      setProduct(productData);

      const allData = await productAPI.getAll({ limit: 100 });
      setAllProducts(allData.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ msg: 'Produk tidak ditemukan', tone: 'err' });
      setTimeout(() => router.push('/dashboard'), 1500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // ✅ LISTENER UNTUK UPDATE STOK/TERJUAL DARI WEBHOOK
    const handlePaymentSuccess = (event: CustomEvent) => {
      console.log('📢 PaymentSuccess event received!', event.detail);
      fetchData();
      setToast({ msg: '🔄 Stok dan terjual telah diperbarui!', tone: 'ok' });
    };

    window.addEventListener('paymentSuccess', handlePaymentSuccess as EventListener);

    // ✅ POLLING: Refresh setiap 15 detik
    const interval = setInterval(() => {
      fetchData();
    }, 15000);

    // ✅ TAMBAHKAN: Refresh saat tab aktif kembali
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Tab aktif, refresh data...');
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess as EventListener);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id]);

  const showToast = (msg: string, tone: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2600);
  };

  const addToCart = async () => {
    try {
      await cartAPI.addItem(Number(id), quantity);
      showToast(`✅ ${product.name} ditambahkan ke keranjang! (${quantity} pcs)`, 'ok');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      showToast(error.message || 'Gagal menambahkan ke keranjang', 'err');
    }
  };

  const spesifikasiList = product?.spesifikasi || {};

  if (loading) {
    return (
      <div
        className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen bg-[#0D0A09] text-white flex flex-col items-center px-4 py-8 relative overflow-hidden`}
        style={{ background: 'radial-gradient(circle at 20% 15%, #262019 0%, #0D0A09 45%, #060403 100%)' }}
      >
        <style jsx global>{`
          @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
          .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 100%); background-size: 800px 100%; animation: shimmer 1.6s infinite linear; }
        `}</style>
        <div className="w-full max-w-6xl mt-24 bg-white/[0.03] border border-neutral-800 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-10 relative z-10">
          <div className="md:w-1/2">
            <div className="w-full aspect-square rounded-2xl skeleton border border-neutral-800" />
          </div>
          <div className="md:w-1/2 flex flex-col gap-4">
            <div className="h-3 w-24 rounded skeleton" />
            <div className="h-7 w-3/4 rounded skeleton" />
            <div className="h-6 w-40 rounded skeleton" />
            <div className="h-20 w-full rounded skeleton mt-2" />
            <div className="h-32 w-full rounded skeleton mt-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0D0A09] text-white flex flex-col items-center justify-center gap-3">
        <span className="text-4xl opacity-30 animate-bounce">🎸</span>
        <div className="text-neutral-500 text-sm">Produk tidak ditemukan</div>
      </div>
    );
  }

  const ratingValue = Number(product.rating) || 4.5;
  const fullStars = Math.round(ratingValue);

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen text-white bg-[#0D0A09] flex flex-col items-center px-4 py-8 relative antialiased overflow-hidden`}
      style={{
        background: 'radial-gradient(circle at 20% 15%, #262019 0%, #0D0A09 45%, #060403 100%)',
      }}
    >
      <style jsx global>{`
        .font-display { font-family: var(--font-display), serif; }
        .font-body { font-family: var(--font-body), sans-serif; }
        .font-mono-num { font-family: var(--font-mono), monospace; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.35s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .float-slow { animation: floatSlow 4s ease-in-out infinite; }
        @keyframes ringPop {
          0% { box-shadow: 0 0 0 0 rgba(217,122,63,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(217,122,63,0); }
          100% { box-shadow: 0 0 0 0 rgba(217,122,63,0); }
        }
        .ring-pop { animation: ringPop 2.2s ease-out infinite; }
        @keyframes cardEnter2 {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .card-enter2 { animation: cardEnter2 0.45s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {/* AMBIENT GLOWS */}
      <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-amber-700/[0.10] blur-[110px] pointer-events-none z-0" />
      <div className="absolute -bottom-28 -right-16 w-[380px] h-[380px] rounded-full bg-orange-600/[0.08] blur-[100px] pointer-events-none z-0" />

      {/* GRAIN HALUS */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '140px 140px',
        }}
      />

      {/* NAVBAR */}
      <nav className="w-full max-w-6xl bg-[#FFFDF6]/95 text-black px-6 md:px-10 py-3.5 rounded-2xl flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)] border border-gray-300/50 backdrop-blur-md sticky top-4 z-50">
        <div className="font-display font-semibold text-base tracking-wide flex items-center gap-1.5">
          <span className="text-lg filter drop-shadow">🎸</span> GitarKu
        </div>
        {/* ✅ TOMBOL BACK - SAMA SEPERTI KERANJANG & MYPROFILE */}
        <button
          onClick={() => router.back()}
          className="text-[11px] font-bold tracking-widest uppercase text-neutral-500 hover:text-amber-800 transition"
        >
          Back &gt;
        </button>
      </nav>

      {/* BREADCRUMB */}
      <div className="w-full max-w-6xl mt-5 flex items-center gap-2 text-xs">
        <button onClick={() => router.back()} className="text-neutral-400 hover:text-amber-500 transition flex items-center gap-1.5 font-medium">
          
        </button>
        <span className="text-neutral-700">/</span>
        <span className="text-neutral-500">{product.category_name || 'Gitar'}</span>
        <span className="text-neutral-700">/</span>
        <span className="text-neutral-300 truncate max-w-[220px]">{product.name}</span>
      </div>

      {/* DETAIL PRODUK */}
      <div className="w-full max-w-6xl mt-5 bg-white/[0.03] border border-neutral-800 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-10 relative z-10 animate-fade-up shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">

        {/* GAMBAR */}
        <div className="md:w-1/2 flex flex-col items-center">
          <div className="float-slow relative w-full aspect-square bg-[#1A1A1A] rounded-2xl overflow-hidden flex items-center justify-center border border-neutral-800 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] group">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
            ) : (
              <span className="text-8xl opacity-20">🎸</span>
            )}
            {product.is_featured && (
              <span className="absolute top-3 left-3 text-[9px] font-bold bg-amber-500/90 text-black rounded-full px-2.5 py-1 shadow-lg">⭐ PILIHAN</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>

          {/* THUMBNAIL */}
          <div className="flex gap-3 mt-4 w-full justify-center">
            {product.image ? (
              <div className="h-16 w-16 rounded-lg bg-[#1A1A1A] border-2 border-amber-600/70 overflow-hidden cursor-pointer transition hover:border-amber-500 hover:scale-105 shadow-md">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-lg bg-[#1A1A1A] border border-neutral-800 flex items-center justify-center">
                <span className="text-xl opacity-20">🎸</span>
              </div>
            )}
          </div>
        </div>

        {/* INFORMASI PRODUK */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <span className="w-3 h-px bg-amber-500" /> {product.category_name || 'Gitar'}
              </span>
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-white mt-1 leading-tight">{product.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl font-bold text-amber-500 font-mono-num">{formatRp(product.price)}</span>
            <span className="text-sm text-neutral-500 line-through font-mono-num">{formatRp(product.price * 1.2)}</span>
            <span className="text-[10px] font-bold bg-red-700/25 text-red-400 border border-red-700/30 rounded-full px-2.5 py-1">Hemat 20%</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="text-amber-500 tracking-tight text-sm">
                {'★'.repeat(fullStars)}{'☆'.repeat(5 - fullStars)}
              </span>
              <span className="text-neutral-300 font-semibold">{ratingValue.toFixed(1)}</span>
              <span className="text-neutral-600">(24 ulasan)</span>
            </span>
            <span className="text-neutral-700">|</span>
            <span className="flex items-center gap-1">🛒 <span className="text-neutral-300 font-semibold">{product.terjual || 0}</span> terjual</span>
            <span className="text-neutral-700">|</span>
            <span className={`flex items-center gap-1 font-semibold ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {product.stock > 0 ? `✅ Stok: ${product.stock}` : '❌ Stok Habis'}
            </span>
          </div>

          <p className="text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/80 pt-4 mt-2">{product.description}</p>

          {/* SPESIFIKASI */}
          <div className="border-t border-neutral-800/80 pt-4 mt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <span className="text-amber-500">▸</span> Spesifikasi
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs bg-white/[0.02] border border-neutral-800/60 rounded-xl p-3">
              {Object.keys(spesifikasiList).length > 0 ? (
                Object.entries(spesifikasiList).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1.5 border-b border-neutral-800/50 last:border-b-0">
                    <span className="text-neutral-500 capitalize">{key}</span>
                    <span className="text-neutral-200 font-medium text-right">{String(value)}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-neutral-500 py-1">Belum ada spesifikasi</div>
              )}
            </div>
          </div>

          {/* QUANTITY & ADD TO CART */}
          <div className="flex items-center gap-4 mt-4 border-t border-neutral-800/80 pt-4">
            <div className="flex items-center border border-neutral-700 rounded-xl bg-white/[0.02] overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 transition font-bold"
              >
                −
              </button>
              <span className="px-4 py-2 text-sm font-mono-num text-white min-w-[44px] text-center border-x border-neutral-800">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                className="px-3.5 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 transition font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all duration-200 ${
                product.stock > 0
                  ? 'ring-pop bg-amber-700 hover:bg-amber-600 text-white shadow-lg hover:shadow-amber-700/40 hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {product.stock > 0 ? '🛒 Tambah ke Keranjang' : '❌ Stok Habis'}
            </button>
          </div>
        </div>
      </div>

      {/* PRODUK LAINNYA - SEMUA PRODUK */}
      <div className="w-full max-w-6xl mt-10 animate-fade-in">
        <h3 className="font-display text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
          <span className="text-amber-500">▸</span> Semua Produk
        </h3>
        {allProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allProducts.map((item, i) => (
              <div
                key={item.id}
                onClick={() => router.push(`/produk/${item.id}`)}
                className="card-enter2 bg-white/[0.02] border border-neutral-800 rounded-xl p-3 hover:bg-white/[0.07] hover:border-amber-700/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                style={{ animationDelay: `${(i % 10) * 0.04}s` }}
              >
                <div className="aspect-square bg-[#1A1A1A] rounded-lg flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <span className="text-2xl opacity-30">🎸</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-neutral-200 mt-2 truncate group-hover:text-amber-400 transition-colors">{item.name}</p>
                <p className="text-[10px] text-amber-500 font-mono-num mt-0.5">{formatRp(item.price)}</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">Stok: {item.stock}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-neutral-500 text-sm">Belum ada produk lain</div>
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