'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { cartAPI, authAPI, orderAPI } from '@/lib/api';
import { formatRp } from '@/lib/utils';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono' });

// ⭐ DEKLARASI WINDOW.SNAP
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: any) => void;
    };
  }
}

export default function DetailPembayaran() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [user, setUser] = useState<any>(null);
  
  const [alamat, setAlamat] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [kodePos, setKodePos] = useState('');
  const [email, setEmail] = useState('');
  
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);

  // ⭐ LOAD MIDTRANS SCRIPT
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.snap) {
      console.log('📦 Loading Midtrans script...');
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Midtrans script loaded!');
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Midtrans script');
        setToast({ msg: 'Gagal memuat pembayaran', tone: 'err' });
      };
      
      document.head.appendChild(script);
    } else if (window.snap) {
      console.log('✅ Midtrans script already loaded');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const userData = authAPI.getCurrentUser();
      setUser(userData);
      if (userData) {
        setEmail(userData.email || '');
        setAlamat(userData.alamat || '');
        setNoTelepon(userData.telepon || '');
      }

      const cartData = await cartAPI.getCart();
      if (cartData && cartData.items) {
        setCartItems(cartData.items);
        setTotalPrice(cartData.total_price || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ msg: 'Gagal memuat data', tone: 'err' });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, tone: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2600);
  };

  // ⭐ HANDLE SUBMIT - LANGSUNG PAKE FETCH
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      setToast({ msg: 'Keranjang kosong!', tone: 'err' });
      return;
    }

    if (!alamat.trim()) {
      setToast({ msg: 'Alamat wajib diisi!', tone: 'err' });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Buat order di database
      const orderResult = await orderAPI.create({ address: alamat });
      console.log('✅ Order created:', orderResult);
      
      const orderId = orderResult.order.id;

      // ⭐ 2. Create payment Midtrans ASLI - LANGSUNG PAKE FETCH
      const token = localStorage.getItem('token');
      const paymentResponse = await fetch('http://localhost:5000/api/payments/create-real', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order_id: orderId })
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || 'Gagal membuat pembayaran');
      }

      const paymentResult = await paymentResponse.json();
      console.log('✅ Payment created:', paymentResult);

      const { token: snapToken, redirect_url } = paymentResult;

      // ⭐ CEK TOKEN
      if (!snapToken) {
        console.error('❌ Token is undefined! Response:', paymentResult);
        setToast({ msg: 'Gagal mendapatkan token pembayaran', tone: 'err' });
        setSubmitting(false);
        return;
      }

      // ⭐ CEK WINDOW.SNAP
      if (!window.snap) {
        console.error('❌ window.snap is undefined!');
        if (redirect_url) {
          console.log('⚠️ Redirecting to:', redirect_url);
          window.location.href = redirect_url;
          return;
        }
        setToast({ msg: 'Midtrans belum siap, coba lagi', tone: 'err' });
        setSubmitting(false);
        return;
      }

      // 3. Buka Snap popup
      window.snap.pay(snapToken, {
        onSuccess: function(result: any) {
          console.log('✅ Payment Success:', result);
          router.push(`/payment/success?order_id=${orderId}`);
        },
        onPending: function(result: any) {
          console.log('⏳ Payment Pending:', result);
          router.push(`/payment/pending?order_id=${orderId}`);
        },
        onError: function(result: any) {
          console.log('❌ Payment Error:', result);
          router.push(`/payment/failed?order_id=${orderId}`);
        },
        onClose: function() {
          console.log('🔒 Payment popup closed');
          setSubmitting(false);
        }
      });

    } catch (error: any) {
      console.error('Error creating order:', error);
      setToast({ msg: error.message || 'Gagal membuat pesanan', tone: 'err' });
      setSubmitting(false);
    }
  };

  const ongkir = totalPrice >= 500000 ? 0 : 25000;
  const total = totalPrice + ongkir;

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
          <span className="text-xs tracking-widest uppercase text-neutral-500">Memuat data...</span>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat bg-fixed relative antialiased text-white`}
        style={{ backgroundImage: `url('/background keranjang2.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A09]/80 via-[#0D0A09]/70 to-[#0D0A09]/90 pointer-events-none z-0" />
        <div className="relative z-10 text-center">
          <span className="text-4xl">🛒</span>
          <h2 className="font-display text-xl font-semibold mt-4">Keranjang Kosong</h2>
          <p className="text-neutral-400 text-sm mt-2">Tambahkan produk terlebih dahulu</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-6 py-2.5 bg-amber-700 hover:bg-amber-600 rounded-full text-sm font-bold transition hover:scale-105 active:scale-95"
          >
            Kembali Belanja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat bg-fixed relative antialiased text-white`}
      style={{ backgroundImage: `url('/background keranjang2.jpg')` }}
    >
      <style jsx global>{`
        .font-display { font-family: var(--font-display), serif; }
        .font-body { font-family: var(--font-body), sans-serif; }
        .font-mono-num { font-family: var(--font-mono), monospace; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise { animation: fadeUp 0.45s ease-out both; }
        button:focus-visible, input:focus-visible { outline: 2px solid #C9A34E; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .rise { animation: none !important; }
        }
      `}</style>

      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A09]/80 via-[#0D0A09]/70 to-[#0D0A09]/90 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.55)_100%)] pointer-events-none z-0" />
      <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none z-0" />

      <div className="w-full max-w-3xl relative z-10 flex flex-col gap-6">

        <div className="w-full bg-[#FFFDF6] text-black px-6 py-2.5 rounded-full flex justify-between items-center shadow-md rise">
          <span className="font-display font-semibold tracking-wide text-sm flex items-center gap-1.5">🎸 GitarKu</span>
          <button type="button" onClick={() => router.back()} className="text-[10px] font-bold tracking-widest uppercase opacity-60 hover:opacity-100 transition">Back &gt;</button>
        </div>

        {/* STEP INDICATOR — reimagined as a fretboard: filled dots are frets already crossed */}
        <div className="w-full flex items-center justify-center gap-2 px-2 rise" style={{ animationDelay: '60ms' }}>
          {[
            { label: 'Keranjang', done: true },
            { label: 'Alamat', done: true },
            { label: 'Pembayaran', done: false, current: true },
            { label: 'Selesai', done: false },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono-num border-2 transition-all ${
                  step.current ? 'bg-amber-700 border-amber-700 text-white shadow-[0_0_0_4px_rgba(184,134,59,0.18)]' : step.done ? 'bg-amber-700/20 border-amber-700 text-amber-500' : 'bg-transparent border-neutral-600 text-neutral-500'
                }`}>{step.done ? '✓' : i + 1}</div>
                <span className={`text-[9px] uppercase tracking-wide font-bold ${step.current ? 'text-amber-500' : step.done ? 'text-neutral-300' : 'text-neutral-500'}`}>{step.label}</span>
              </div>
              {i < arr.length - 1 && <div className={`h-[2px] flex-1 mb-4 rounded-full ${step.done ? 'bg-amber-700' : 'bg-neutral-700'}`} />}
            </div>
          ))}
        </div>

        <div className="w-full flex flex-col md:flex-row gap-6">

          <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/5 rise" style={{ animationDelay: '110ms' }}>
            <h2 className="font-display text-lg font-semibold mb-1">Alamat Pengiriman</h2>
            <p className="text-[11px] text-neutral-400 mb-6">Pastikan alamat ini benar sebelum melanjutkan ke pembayaran.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-300 block mb-1.5">Alamat Lengkap</label>
                <input 
                  type="text" 
                  required 
                  value={alamat} 
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jl. Contoh No. 123, Kota"
                  className="w-full px-5 py-2.5 rounded-xl bg-[#FFFDF6] text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/60 shadow-inner transition-shadow" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-300 block mb-1.5">No Telepon</label>
                  <input 
                    type="tel" 
                    required 
                    value={noTelepon} 
                    onChange={(e) => setNoTelepon(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-5 py-2.5 rounded-xl bg-[#FFFDF6] text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/60 shadow-inner transition-shadow" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-300 block mb-1.5">Kode Pos</label>
                  <input 
                    type="text" 
                    required 
                    value={kodePos} 
                    onChange={(e) => setKodePos(e.target.value)}
                    placeholder="12345"
                    className="w-full px-5 py-2.5 rounded-xl bg-[#FFFDF6] text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/60 shadow-inner transition-shadow" 
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-300 block mb-1.5">Email</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-5 py-2.5 rounded-xl bg-[#FFFDF6] text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/60 shadow-inner transition-shadow" 
                />
              </div>

              <div className="bg-amber-700/10 border border-amber-700/30 rounded-xl p-3 text-center">
                <p className="text-[10px] text-amber-400 font-semibold">💳 Pembayaran via Midtrans (Bank Transfer, QRIS, E-Wallet)</p>
              </div>

              <div className="w-full flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-8 py-2.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-full text-xs tracking-widest transition shadow-md uppercase hover:shadow-lg hover:shadow-amber-900/40 active:scale-[0.98]"
                >
                  {submitting ? 'Memproses...' : 'Bayar Sekarang →'}
                </button>
              </div>
            </form>
          </div>

          <div className="w-full md:w-72 shrink-0 bg-[#FFFDF6] text-black rounded-3xl p-6 shadow-2xl h-fit rise" style={{ animationDelay: '160ms' }}>
            <h3 className="font-display text-sm font-semibold mb-4">Ringkasan Pesanan</h3>
            <div className="flex flex-col gap-3 mb-4 max-h-60 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-start text-xs">
                  <div>
                    <p className="font-semibold text-neutral-800">{item.name}</p>
                    <p className="text-[10px] text-neutral-400">x{item.quantity}</p>
                  </div>
                  <span className="font-mono-num font-bold text-neutral-700">{formatRp(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-200 pt-3 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="font-mono-num">{formatRp(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Ongkos Kirim</span>
                <span className="font-mono-num">{ongkir === 0 ? '✅ Gratis' : formatRp(ongkir)}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-900 text-sm pt-2 border-t border-neutral-200 mt-1">
                <span>Total</span>
                <span className="font-mono-num">{formatRp(total)}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-200">
              <p className="text-[9px] text-neutral-400 text-center">
                🔒 Pembayaran aman via Midtrans
              </p>
            </div>
          </div>
        </div>
      </div>

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
